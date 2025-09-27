import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withHCPAuth, type AuthenticatedRequest } from '@/lib/middleware'

function parseJSONList(input: string | null | undefined) {
  try {
    if (!input) return []
    const v = JSON.parse(input)
    if (Array.isArray(v)) return v
    if (typeof v === 'string' && v) return [v]
    return []
  } catch {
    // Fallback: some legacy rows may store a single enum string
    return typeof input === 'string' && input ? [input] : []
  }
}

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
        species: parseJSONList(saved.drug.species),
        deliveryMethods: parseJSONList(saved.drug.deliveryMethods)
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
    // Be robust to malformed JSON bodies
    let drugId: string | undefined
    try {
      const body = await req.json()
      drugId = body?.drugId
    } catch {
      // Fallback to raw text and querystring
      try {
        const raw = await req.text()
        const parsed = raw ? JSON.parse(raw) : {}
        drugId = parsed?.drugId
      } catch {}
      if (!drugId) {
        const url = new URL(req.url)
        drugId = url.searchParams.get('drugId') || undefined
      }
    }

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

    try {
      await db.savedDrug.create({
        data: {
          userId: req.user.userId,
          drugId: drugId
        }
      })
    } catch (e: any) {
      // Handle unique constraint (already saved) gracefully
      if (e?.code === 'P2002') {
        return NextResponse.json({ message: 'Drug already saved' })
      }
      throw e
    }

    return NextResponse.json({
      message: 'Drug saved successfully'
    })

  } catch (error: any) {
    console.error('Save drug error:', error?.message || error, '\nCode:', error?.code)
    // Surface Prisma unique constraint as success to keep UX simple
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Drug already saved' })
    }
    // Include minimal diagnostic to help debug client-side (safe)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const GET = withHCPAuth(getSavedDrugs)
export const POST = withHCPAuth(saveDrug)