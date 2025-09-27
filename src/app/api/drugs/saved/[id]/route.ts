import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withHCPAuth, type AuthenticatedRequest } from '@/lib/middleware'

interface RouteParams {
  params: {
    id: string
  }
}

// DELETE - Remove saved drug
async function deleteSavedDrug(req: AuthenticatedRequest, { params }: RouteParams) {
  try {
    const savedDrug = await db.savedDrug.findFirst({
      where: {
        id: params.id,
        userId: req.user.userId
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

export const DELETE = withHCPAuth(deleteSavedDrug)