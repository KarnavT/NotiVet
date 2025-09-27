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

    // Get overall analytics
    const overallStats = await db.analytics.aggregate({
      where: {
        senderId: req.user.userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        totalRecipients: true,
        deliveredCount: true,
        openedCount: true,
        clickedCount: true
      }
    })

    // Calculate engagement rates
    const totalRecipients = overallStats._sum.totalRecipients || 0
    const totalOpened = overallStats._sum.openedCount || 0
    const totalClicked = overallStats._sum.clickedCount || 0

    const openRate = totalRecipients > 0 ? (totalOpened / totalRecipients) * 100 : 0
    const clickRate = totalRecipients > 0 ? (totalClicked / totalRecipients) * 100 : 0
    const clickThroughRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0

    return NextResponse.json({
      overview: {
        totalRecipients,
        totalDelivered: overallStats._sum.deliveredCount || 0,
        totalOpened,
        totalClicked,
        openRate: Math.round(openRate * 100) / 100,
        clickRate: Math.round(clickRate * 100) / 100,
        clickThroughRate: Math.round(clickThroughRate * 100) / 100
      },
      topNotifications: []
    })

  } catch (error) {
    console.error('Get analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withPharmaAuth(getAnalytics)