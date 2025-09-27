import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withHCPAuth, type AuthenticatedRequest } from '@/lib/middleware'

async function getNotificationCount(req: AuthenticatedRequest) {
  try {
    // Get total notification count (notifications that user has received)
    const totalCount = await db.notificationActivity.count({
      where: {
        userId: req.user.userId,
        status: 'SENT'
      }
    })

    // Get unread count (notifications without OPENED activity)
    const openedNotificationIds = await db.notificationActivity.findMany({
      where: {
        userId: req.user.userId,
        status: 'OPENED'
      },
      select: {
        notificationId: true
      }
    })

    const openedIds = openedNotificationIds.map(activity => activity.notificationId)

    const unreadCount = await db.notificationActivity.count({
      where: {
        userId: req.user.userId,
        status: 'SENT',
        notificationId: {
          notIn: openedIds
        }
      }
    })

    return NextResponse.json({
      total: totalCount,
      unread: unreadCount
    })

  } catch (error) {
    console.error('Get notification count error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = withHCPAuth(getNotificationCount)