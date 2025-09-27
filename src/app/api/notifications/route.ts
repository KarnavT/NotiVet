import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAnyAuth, withPharmaAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { notificationSchema } from '@/lib/validations'

async function getNotifications(req: AuthenticatedRequest) {
  try {
    let notifications: any[] = []

    // For HCP users, get their received notifications based on notification activities
    if (req.user.userType === 'HCP') {
      const receivedNotifications = await db.notification.findMany({
        where: {
          activities: {
            some: {
              userId: req.user.userId
            }
          }
        },
        include: {
          sender: {
            include: {
              pharmaProfile: true
            }
          },
          activities: {
            where: {
              userId: req.user.userId
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      notifications = receivedNotifications.map(notification => {
        const isRead = notification.activities.some(activity => activity.status === 'OPENED')
        return {
          ...notification,
          targetSpecies: notification.targetSpecies ? JSON.parse(notification.targetSpecies) : [],
          sender: {
            companyName: notification.sender.pharmaProfile?.companyName || 'Unknown Company',
            contactName: notification.sender.pharmaProfile?.contactName || 'Unknown Contact'
          },
          isRead
        }
      })
    } else {
      // For Pharma users, get their sent notifications with analytics
      const sentNotifications = await db.notification.findMany({
        where: {
          senderId: req.user.userId
        },
        include: {
          activities: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // Fetch associated drug information for each notification
      const drugsMap = new Map()
      const drugIds = sentNotifications.filter(n => n.drugId).map(n => n.drugId).filter((id): id is string => id !== null)
      if (drugIds.length > 0) {
        const drugs = await db.drug.findMany({
          where: {
            id: { in: drugIds }
          }
        })
        drugs.forEach(drug => {
          drugsMap.set(drug.id, drug)
        })
      }

      // Get detailed analytics for each notification
      notifications = await Promise.all(
        sentNotifications.map(async (notification) => {
          const activities = notification.activities
          const sentCount = activities.filter(a => a.status === 'SENT').length
          const openedCount = activities.filter(a => a.status === 'OPENED').length
          const clickedCount = activities.filter(a => a.status === 'CLICKED').length
          
          // Get associated drug information
          const drug = notification.drugId ? drugsMap.get(notification.drugId) : null
          
          return {
            ...notification,
            targetSpecies: notification.targetSpecies ? JSON.parse(notification.targetSpecies) : [],
            recipientCount: sentCount,
            activities: activities,
            drug: drug ? {
              ...drug,
              species: drug.species ? JSON.parse(drug.species) : [],
              deliveryMethods: drug.deliveryMethods ? JSON.parse(drug.deliveryMethods) : []
            } : null,
            analytics: {
              sent: sentCount,
              opened: openedCount,
              clicked: clickedCount,
              openRate: sentCount > 0 ? Math.round((openedCount / sentCount) * 10000) / 100 : 0,
              clickRate: sentCount > 0 ? Math.round((clickedCount / sentCount) * 10000) / 100 : 0,
              clickThroughRate: openedCount > 0 ? Math.round((clickedCount / openedCount) * 10000) / 100 : 0
            }
          }
        })
      )
    }

    return NextResponse.json({
      notifications
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createNotification(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    
    // Validate input using the notification schema
    const validatedData = notificationSchema.parse(body)
    
    // Only Pharma users can send notifications
    if (req.user.userType !== 'PHARMA') {
      return NextResponse.json(
        { error: 'Only pharmaceutical companies can send notifications' },
        { status: 403 }
      )
    }

    // Get pharma company information for the drug manufacturer
    const pharmaProfile = await db.pharmaProfile.findUnique({
      where: { userId: req.user.userId }
    })
    
    // Create the new drug first
    const newDrug = await db.drug.create({
      data: {
        name: validatedData.drugName,
        genericName: validatedData.genericName || null,
        manufacturer: pharmaProfile?.companyName || validatedData.manufacturer,
        activeIngredient: validatedData.activeIngredient,
        species: JSON.stringify(validatedData.targetSpecies),
        deliveryMethods: JSON.stringify(validatedData.deliveryMethods),
        description: validatedData.description || null,
        dosage: validatedData.dosage || null,
        contraindications: validatedData.contraindications || null,
        sideEffects: validatedData.sideEffects || null,
        warnings: validatedData.warnings || null,
        faradInfo: validatedData.faradInfo || null,
        withdrawalTime: validatedData.withdrawalTime || null
      }
    })
    
    // Create the notification with reference to the new drug
    const notification = await db.notification.create({
      data: {
        senderId: req.user.userId,
        // Not persisted: Prisma Notification model has no drugId column; include drug info text instead
        title: validatedData.title,
        content: validatedData.content,
        drugInfo: `New Drug: ${validatedData.drugName}` + (validatedData.drugInfo ? ` - ${validatedData.drugInfo}` : ''),
        targetSpecies: JSON.stringify(validatedData.targetSpecies)
      }
    })
    
    // Find HCPs that match the target species - improved logic for better matching
    const allHCPs = await db.user.findMany({
      where: {
        userType: 'HCP',
        hcpProfile: {
          specialties: {
            not: null
          }
        }
      },
      include: {
        hcpProfile: true
      }
    })

    // Compute dashboard base URL from the incoming request (works with ngrok/CF tunnels)
    const proto = req.headers.get('x-forwarded-proto') || 'http'
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
    const dashboardBaseUrl = `${proto}://${host}`

    // Filter HCPs whose specialties overlap with target species
    const targetHCPs = allHCPs.filter(hcp => {
      try {
        const hcpSpecialties = hcp.hcpProfile?.specialties 
          ? JSON.parse(hcp.hcpProfile.specialties)
          : []
        
        // Check if any HCP specialty matches any target species
        return hcpSpecialties.some((specialty: string) => 
          validatedData.targetSpecies.includes(specialty as any)
        )
      } catch (error) {
        console.error('Error parsing HCP specialties:', error)
        return false
      }
    })
    
    // Create notification activities for tracking
    if (targetHCPs.length > 0) {
      const activities = targetHCPs.map(hcp => ({
        notificationId: notification.id,
        userId: hcp.id,
        status: 'SENT'
      }))
      
      await db.notificationActivity.createMany({
        data: activities
      })

      // Send email notifications to HCPs
      await sendEmailNotifications(targetHCPs, notification, newDrug, pharmaProfile, dashboardBaseUrl)
    }
    
    return NextResponse.json({
      message: `Drug created successfully! Campaign sent to ${targetHCPs.length} veterinary professionals.`,
      notification: {
        ...notification,
        targetSpecies: JSON.parse(notification.targetSpecies || '[]'),
        recipientCount: targetHCPs.length,
        activities: [],
        drugId: newDrug.id,
        drugName: newDrug.name
      }
    })
    
  } catch (error: any) {
    console.error('Create notification error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Email notification function
async function sendEmailNotifications(targetHCPs: any[], notification: any, drug: any, pharmaProfile: any, dashboardUrl: string) {
  // Only send emails if nodemailer is configured
  try {
    const nodemailer = require('nodemailer')

    // Configure transporter: prefer real SMTP if env vars present; otherwise fallback to stream logger
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env as Record<string, string | undefined>
    const useSmtp = !!SMTP_HOST && !!SMTP_PORT

    const transporter = useSmtp
      ? nodemailer.createTransport({
          host: SMTP_HOST,
          port: Number(SMTP_PORT),
          secure: SMTP_SECURE === 'true' || Number(SMTP_PORT) === 465,
          auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
        })
      : nodemailer.createTransport({
          // Fallback: log-only transport (safe for local dev/demo)
          streamTransport: true,
          newline: 'unix',
          buffer: true,
        })

    for (const hcp of targetHCPs) {
      const emailContent = `
        Dear Dr. ${hcp.hcpProfile.firstName} ${hcp.hcpProfile.lastName},

        ${pharmaProfile?.companyName || 'A pharmaceutical company'} has announced a new drug that may be relevant to your practice:

        **${drug.name}** ${drug.genericName ? `(${drug.genericName})` : ''}
        Active Ingredient: ${drug.activeIngredient}
        Target Species: ${JSON.parse(drug.species).join(', ')}
        Delivery Methods: ${JSON.parse(drug.deliveryMethods).join(', ')}

        ${notification.content}

        ${drug.description ? `\nDescription: ${drug.description}` : ''}
        ${drug.dosage ? `\nDosage: ${drug.dosage}` : ''}
        ${drug.warnings ? `\nWarnings: ${drug.warnings}` : ''}

        View this drug and add it to your formulary by clicking here:
        ${dashboardUrl}/hcp/dashboard?tab=notifications&highlight=${notification.id}

        Best regards,
        The NotiVet Team
      `

      const toOverride = process.env.EMAIL_TEST_RECIPIENT
      const fromAddress = process.env.SMTP_FROM || 'notifications@notivet.com'
      const mailOptions = {
        from: fromAddress,
        to: toOverride || hcp.email,
        subject: `New Drug Alert: ${drug.name} - ${notification.title}`,
        text: emailContent
      }

      // Send the email (if stream transport is configured, it will log instead)
      await transporter.sendMail(mailOptions)

      // Log for visibility during demo
      console.log('📧 Email sent to:', mailOptions.to)
      console.log('Subject:', mailOptions.subject)
      console.log('Content preview:', emailContent.substring(0, 200) + '...')
    }
  } catch (error) {
    console.error('Email sending error:', error)
    // Don't fail the whole request if email fails
  }
}

export const GET = withAnyAuth(getNotifications)
export const POST = withPharmaAuth(createNotification)
