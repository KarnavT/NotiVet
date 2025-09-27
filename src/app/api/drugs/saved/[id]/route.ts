import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE - Remove saved drug
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  // Apply authentication middleware inline
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 })
  }

  // Import verifyToken here to avoid circular imports
  const { verifyToken } = await import('@/lib/auth')
  const user = verifyToken(token)
  
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  if (user.userType !== 'HCP') {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const savedDrug = await db.savedDrug.findFirst({
      where: {
        id: params.id,
        userId: user.userId
      }
    })

    if (!savedDrug) {
      return NextResponse.json({ error: 'Saved drug not found' }, { status: 404 })
    }

    await db.savedDrug.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Drug removed from saved list' })

  } catch (error) {
    console.error('Remove saved drug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
