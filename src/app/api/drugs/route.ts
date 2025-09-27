import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAnyAuth, type AuthenticatedRequest } from '@/lib/middleware'

async function getDrugs(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    
    let where: any = {}
    
    // Text search
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { genericName: { contains: q } },
        { activeIngredient: { contains: q } },
        { manufacturer: { contains: q } },
        { description: { contains: q } }
      ]
    }

    const drugs = await db.drug.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Parse JSON strings back to arrays for display
    const parsedDrugs = drugs.map(drug => ({
      ...drug,
      species: drug.species ? JSON.parse(drug.species) : [],
      deliveryMethods: drug.deliveryMethods ? JSON.parse(drug.deliveryMethods) : []
    }))

    return NextResponse.json({
      drugs: parsedDrugs,
      pagination: {
        page: 1,
        limit: 50,
        total: parsedDrugs.length,
        totalPages: 1
      }
    })

  } catch (error: any) {
    console.error('Get drugs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withAnyAuth(getDrugs)