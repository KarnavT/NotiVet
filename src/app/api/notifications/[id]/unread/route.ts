import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withHCPAuth, type AuthenticatedRequest } from '@/lib/middleware'

async function markNotificationAsUnread(req: AuthenticatedRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = params.id

    // Check if notification exists and user has access to it
    const existingActivity = await db.notificationActivity.findFirst({
      where: {
        notificationId: notificationId,
        userId: req.user.userId,
        status: 'SENT'
      }
    })

    if (!existingActivity) {
      return NextResponse.json(
        { error: 'You do not have access to this notification' },
        { status: 403 }
      )
    }

    // Delete the OPENED activity to mark as unread
    await db.notificationActivity.deleteMany({
      where: {
        notificationId: notificationId,
        userId: req.user.userId,
        status: 'OPENED'
      }
    })

    return NextResponse.json({
      message: 'Notification marked as unread'
    })

  } catch (error) {
    console.error('Mark as unread error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = withHCPAuth(markNotificationAsUnread)