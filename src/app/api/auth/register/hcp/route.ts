import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import { hcpRegistrationSchema } from '@/lib/validations'
import { UserType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = hcpRegistrationSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user with HCP profile
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        userType: UserType.HCP,
        hcpProfile: {
          create: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            license: validatedData.license,
            clinicName: validatedData.clinicName,
            address: validatedData.address,
            city: validatedData.city,
            state: validatedData.state,
            zipCode: validatedData.zipCode,
            phone: validatedData.phone,
            specialties: validatedData.specialties,
          }
        }
      },
      include: {
        hcpProfile: true
      }
    })
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      userType: user.userType
    })
    
    return NextResponse.json({
      message: 'HCP registered successfully',
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        profile: user.hcpProfile
      },
      token
    })
    
  } catch (error: any) {
    console.error('HCP registration error:', error)
    
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