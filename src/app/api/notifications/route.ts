import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAnyAuth, type AuthenticatedRequest } from '@/lib/middleware'

async function getNotifications(req: AuthenticatedRequest) {
  try {
    let notifications = []

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

export const GET = withAnyAuth(getNotifications)