import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withHCPAuth, type AuthenticatedRequest } from '@/lib/middleware'

async function getSavedDrugs(req: AuthenticatedRequest) {
  try {
    const savedDrugs = await db.savedDrug.findMany({
      where: { userId: req.user.userId },
      include: {
        drug: true
      },
      orderBy: { savedAt: 'desc' }
    })

    // Parse JSON strings back to arrays for display
    const parsedSavedDrugs = savedDrugs.map(saved => ({
      ...saved,
      drug: {
        ...saved.drug,
        species: saved.drug.species ? JSON.parse(saved.drug.species) : [],
        deliveryMethods: saved.drug.deliveryMethods ? JSON.parse(saved.drug.deliveryMethods) : []
      }
    }))

    return NextResponse.json({
      savedDrugs: parsedSavedDrugs
    })

  } catch (error) {
    console.error('Get saved drugs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function saveDrug(req: AuthenticatedRequest) {
  try {
    const { drugId } = await req.json()

    if (!drugId) {
      return NextResponse.json({ error: 'Drug ID is required' }, { status: 400 })
    }

    // Check if drug exists
    const drug = await db.drug.findUnique({
      where: { id: drugId }
    })

    if (!drug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 })
    }

    // Check if already saved
    const existingSaved = await db.savedDrug.findFirst({
      where: {
        userId: req.user.userId,
        drugId: drugId
      }
    })

    if (existingSaved) {
      return NextResponse.json({ error: 'Drug already saved' }, { status: 400 })
    }

    const savedDrug = await db.savedDrug.create({
      data: {
        userId: req.user.userId,
        drugId: drugId
      },
      include: {
        drug: true
      }
    })

    // Parse JSON strings for response
    const parsedSavedDrug = {
      ...savedDrug,
      drug: {
        ...savedDrug.drug,
        species: savedDrug.drug.species ? JSON.parse(savedDrug.drug.species) : [],
        deliveryMethods: savedDrug.drug.deliveryMethods ? JSON.parse(savedDrug.drug.deliveryMethods) : []
      }
    }

    return NextResponse.json({
      message: 'Drug saved successfully',
      savedDrug: parsedSavedDrug
    })

  } catch (error) {
    console.error('Save drug error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withHCPAuth(getSavedDrugs)
export const POST = withHCPAuth(saveDrug)