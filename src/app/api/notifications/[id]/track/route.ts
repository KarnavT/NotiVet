import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withHCPAuth, type AuthenticatedRequest } from '@/lib/middleware'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  return withHCPAuth(async (req: AuthenticatedRequest) => {
    try {
      const notificationId = params.id
      const body = await req.json()
      const { action } = body

      if (!action || !['OPENED', 'CLICKED'].includes(action)) {
        return NextResponse.json(
          { error: 'Invalid action. Must be OPENED or CLICKED' },
          { status: 400 }
        )
      }

      // Check if this activity already exists to avoid duplicates
      const existingActivity = await db.notificationActivity.findUnique({
        where: {
          notificationId_userId_status: {
            notificationId,
            userId: req.user.userId,
            status: action
          }
        }
      })

      if (existingActivity) {
        return NextResponse.json({ message: 'Activity already tracked' })
      }

      // Create the notification activity
      await db.notificationActivity.create({
        data: {
          notificationId,
          userId: req.user.userId,
          status: action
        }
      })

      return NextResponse.json({ message: 'Activity tracked successfully' })
    } catch (error) {
      console.error('Track notification error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  })(request)
}
