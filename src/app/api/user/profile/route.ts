import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAnyAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { hcpProfileUpdateSchema, pharmaProfileUpdateSchema } from '@/lib/validations'
import { UserType } from '@prisma/client'

async function GET(req: AuthenticatedRequest) {
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
        profile: user.userType === UserType.HCP ? user.hcpProfile : user.pharmaProfile
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function PUT(req: AuthenticatedRequest) {
  try {
    const body = await req.json()
    const userId = req.user.userId
    const userType = req.user.userType

    let updatedUser

    if (userType === UserType.HCP) {
      const validatedData = hcpProfileUpdateSchema.parse(body)
      
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          hcpProfile: {
            update: validatedData
          }
        },
        include: {
          hcpProfile: true
        }
      })
    } else if (userType === UserType.PHARMA) {
      const validatedData = pharmaProfileUpdateSchema.parse(body)
      
      updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          pharmaProfile: {
            update: validatedData
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
        profile: userType === UserType.HCP ? updatedUser.hcpProfile : updatedUser.pharmaProfile
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

export { withAnyAuth(GET) as GET, withAnyAuth(PUT) as PUT }