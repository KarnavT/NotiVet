import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAnyAuth, withPharmaAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { notificationSchema } from '@/lib/validations'

async function getNotifications(req: AuthenticatedRequest) {
  try {
    let notifications: any[] = []

    // For HCP users, get their received notifications (but there won't be any initially)
    if (req.user.userType === 'HCP') {
      // For now, return empty array since we don't have a many-to-many relationship set up properly for SQLite
      notifications = []
    } else {
      // For Pharma users, get their sent notifications
      const sentNotifications = await db.notification.findMany({
        where: {
          senderId: req.user.userId
        },
        orderBy: { createdAt: 'desc' }
      })

      notifications = sentNotifications.map(notification => ({
        ...notification,
        targetSpecies: notification.targetSpecies ? JSON.parse(notification.targetSpecies) : [],
        recipientCount: 0, // Placeholder
        activities: [] // Placeholder
      }))
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
    
    // Create the notification
    const notification = await db.notification.create({
      data: {
        senderId: req.user.userId,
        title: validatedData.title,
        content: validatedData.content,
        drugInfo: validatedData.drugInfo || null,
        targetSpecies: JSON.stringify(validatedData.targetSpecies)
      }
    })
    
    // Find HCPs that match the target species
    // This is a simplified approach - in a real application, you might want more sophisticated targeting
    const targetHCPs = await db.user.findMany({
      where: {
        userType: 'HCP',
        hcpProfile: {
          specialties: {
            // Check if any of the HCP's specialties overlap with target species
            // This is a simple string contains check - could be improved with proper JSON querying
            contains: validatedData.targetSpecies[0] // Simplified for SQLite compatibility
          }
        }
      },
      include: {
        hcpProfile: true
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
    }
    
    return NextResponse.json({
      message: 'Notification sent successfully',
      notification: {
        ...notification,
        targetSpecies: JSON.parse(notification.targetSpecies || '[]'),
        recipientCount: targetHCPs.length,
        activities: []
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

export const GET = withAnyAuth(getNotifications)
export const POST = withPharmaAuth(createNotification)
