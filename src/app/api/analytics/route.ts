import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withPharmaAuth, type AuthenticatedRequest } from '@/lib/middleware'
import { startOfDay, endOfDay, subDays, format } from 'date-fns'

// GET - Get analytics for pharma company
async function getAnalytics(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // Get all notifications sent by this pharma company within the date range
    const notifications = await db.notification.findMany({
      where: {
        senderId: req.user.userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        activities: true
      }
    })

    // Calculate analytics from notification activities
    let totalRecipients = 0
    let totalDelivered = 0
    let totalOpened = 0
    let totalClicked = 0

    // Get detailed stats for each notification
    const notificationStats = await Promise.all(
      notifications.map(async (notification) => {
        const activities = await db.notificationActivity.findMany({
          where: {
            notificationId: notification.id
          }
        })

        const sentCount = activities.filter(a => a.status === 'SENT').length
        const openedCount = activities.filter(a => a.status === 'OPENED').length
        const clickedCount = activities.filter(a => a.status === 'CLICKED').length

        totalRecipients += sentCount
        totalDelivered += sentCount // Assuming all sent are delivered for now
        totalOpened += openedCount
        totalClicked += clickedCount

        return {
          id: notification.id,
          title: notification.title,
          targetSpecies: notification.targetSpecies ? JSON.parse(notification.targetSpecies) : [],
          recipients: sentCount,
          opened: openedCount,
          clicked: clickedCount,
          openRate: sentCount > 0 ? (openedCount / sentCount) * 100 : 0,
          clickRate: sentCount > 0 ? (clickedCount / sentCount) * 100 : 0,
          createdAt: notification.createdAt
        }
      })
    )

    // Calculate engagement rates
    const openRate = totalRecipients > 0 ? (totalOpened / totalRecipients) * 100 : 0
    const clickRate = totalRecipients > 0 ? (totalClicked / totalRecipients) * 100 : 0
    const clickThroughRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0

    // Sort notifications by performance for top performers
    const topNotifications = notificationStats
      .sort((a, b) => {
        // Sort by open rate, then by number of recipients
        if (a.openRate !== b.openRate) {
          return b.openRate - a.openRate
        }
        return b.recipients - a.recipients
      })
      .slice(0, 5) // Top 5 performers

    return NextResponse.json({
      overview: {
        totalRecipients,
        totalDelivered,
        totalOpened,
        totalClicked,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100
      },
      topNotifications: topNotifications.map(n => ({
        id: n.id,
        title: n.title,
        targetSpecies: n.targetSpecies,
        recipients: n.recipients,
        openRate: Math.round(n.openRate * 100) / 100,
        clickRate: Math.round(n.clickRate * 100) / 100
      })),
      dailyStats: [], // Could implement daily breakdown if needed
      totalCampaigns: notifications.length
    })

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withPharmaAuth(getAnalytics)