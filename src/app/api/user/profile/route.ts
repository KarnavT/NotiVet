import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAnyAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { hcpProfileUpdateSchema, pharmaProfileUpdateSchema } from '@/lib/validations'

async function getProfile(req: AuthenticatedRequest) {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.userId },
      include: {
        hcpProfile: true,
        pharmaProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        profile: user.userType === 'HCP' ? user.hcpProfile : user.pharmaProfile
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateProfile(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const userId = req.user.userId
    const userType = req.user.userType

    let updatedUser

    if (userType === 'HCP') {
      const validatedData = hcpProfileUpdateSchema.parse(body)
      
      // Convert specialties array to JSON string if provided
      const updateData = {
        ...validatedData,
        specialties: validatedData.specialties ? JSON.stringify(validatedData.specialties) : undefined
      }
      
      // For create, we need to provide required fields with defaults
      const createData = {
        firstName: validatedData.firstName || '',
        lastName: validatedData.lastName || '',
        ...updateData
      }
      
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          hcpProfile: {
            upsert: {
              create: createData,
              update: updateData
            }
          }
        },
        include: {
          hcpProfile: true
        }
      })
    } else if (userType === 'PHARMA') {
      const validatedData = pharmaProfileUpdateSchema.parse(body)
      
      // For create, we need to provide required fields with defaults
      const createData = {
        companyName: validatedData.companyName || '',
        contactName: validatedData.contactName || '',
        ...validatedData
      }
      
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          pharmaProfile: {
            upsert: {
              create: createData,
              update: validatedData
            }
          }
        },
        include: {
          pharmaProfile: true
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        userType: updatedUser.userType,
        profile: userType === 'HCP' ? (updatedUser as any).hcpProfile : (updatedUser as any).pharmaProfile
      }
    })

  } catch (error: any) {
    console.error('Update profile error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withAnyAuth(getProfile)
export const PUT = withAnyAuth(updateProfile)
