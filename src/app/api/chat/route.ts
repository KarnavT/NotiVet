import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withHCPAuth, type AuthenticatedRequest } from '@/lib/middleware'

function truncate(text: string | null | undefined, max = 500) {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}

export const dynamic = 'force-dynamic'

async function postChat(req: AuthenticatedRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const query = (body?.query || '').toString().trim()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Chatbot is not configured on this deployment. Please set OPENAI_API_KEY on the server.' },
        { status: 503 }
      )
    }

    // Tokenize query for broader matching (e.g., trade names, species, indications)
    const tokens: string[] = Array.from(
      new Set(
        query
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(Boolean)
      )
    )

    // Map species words to enum values used in DB JSON strings
    const speciesMap: Record<string, string> = {
      canine: 'CANINE',
      canines: 'CANINE',
      dog: 'CANINE',
      dogs: 'CANINE',
      feline: 'FELINE',
      felines: 'FELINE',
      cat: 'FELINE',
      cats: 'FELINE',
      bovine: 'BOVINE',
      bovines: 'BOVINE',
      cattle: 'BOVINE',
      equine: 'EQUINE',
      equines: 'EQUINE',
      horse: 'EQUINE',
      horses: 'EQUINE',
      ovine: 'OVINE',
      ovines: 'OVINE',
      sheep: 'OVINE',
      caprine: 'CAPRINE',
      caprines: 'CAPRINE',
      goat: 'CAPRINE',
      goats: 'CAPRINE',
      porcine: 'PORCINE',
      porcines: 'PORCINE',
      swine: 'PORCINE',
      avian: 'AVIAN',
      avians: 'AVIAN',
      poultry: 'AVIAN',
      bird: 'AVIAN',
      birds: 'AVIAN',
      chicken: 'AVIAN',
      chickens: 'AVIAN',
      turkey: 'AVIAN',
      turkeys: 'AVIAN',
      duck: 'AVIAN',
      ducks: 'AVIAN',
      exotic: 'EXOTIC',
      exotics: 'EXOTIC',
    }

    const getSpeciesEnum = (t: string) => {
      if (speciesMap[t]) return speciesMap[t]
      if (t.endsWith('s') && speciesMap[t.slice(0, -1)]) return speciesMap[t.slice(0, -1)]
      return undefined
    }

    const speciesTokens = tokens
      .map((t) => getSpeciesEnum(t))
      .filter((t): t is string => Boolean(t))

    // Build a Prisma where with AND of ORs: each token must match some field
    const orFieldsForToken = (t: string) => ({
      OR: [
        { name: { contains: t } },
        { genericName: { contains: t } },
        { activeIngredient: { contains: t } },
        { manufacturer: { contains: t } },
        { description: { contains: t } },
        { dosage: { contains: t } },
        { contraindications: { contains: t } },
        { warnings: { contains: t } },
        { faradInfo: { contains: t } },
        { withdrawalTime: { contains: t } },
        { productCode: { contains: t } },
        { establishmentCode: { contains: t } },
        { subsidiaries: { contains: t } },
        { tradeName: { contains: t } },
        { distributors: { contains: t } },
        // species is a JSON string; try contains of enum value when token maps to a species (with plural fallback)
        ...(getSpeciesEnum(t) ? [{ species: { contains: getSpeciesEnum(t)! } }] : []),
      ],
    })

    const andClauses = tokens.map(orFieldsForToken)

    // First attempt: strict AND across tokens for high relevance
    let drugs = await db.drug.findMany({
      where: { AND: andClauses },
      take: 10,
      orderBy: { createdAt: 'desc' },
    })

    // Fallback 1: if no results, relax to OR across all tokens
    if (!drugs || drugs.length === 0) {
      drugs = await db.drug.findMany({
        where: {
          OR: tokens.map((t) => orFieldsForToken(t).OR).flat(),
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    }

    // Fallback 2: if still empty, fetch a wider sample and filter case-insensitively in memory
    if (!drugs || drugs.length === 0) {
      const sample = await db.drug.findMany({ take: 300, orderBy: { createdAt: 'desc' } })
      const matches = sample.filter((d) => {
        const hay = [
          d.name,
          d.genericName,
          d.activeIngredient,
          d.manufacturer,
          d.description,
          d.dosage,
          d.contraindications,
          d.warnings,
          d.faradInfo,
          d.withdrawalTime,
          d.productCode,
          d.establishmentCode,
          d.subsidiaries,
          d.tradeName,
          d.distributors,
          d.species,
          d.deliveryMethods,
        ]
          .filter(Boolean)
          .join(' \n ')
          .toLowerCase()
        return tokens.every((t) => hay.includes(t))
      })
      drugs = matches.slice(0, 10)
    }

    // Refine results to prefer exact brand/product matches and reduce noise
    const normalize = (s: string | null | undefined) =>
      (s || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    const normalizedQuery = normalize(query)
    const stopWords = new Set([
      'what','does','do','about','for','to','the','a','an','and','or','of','in','on','with','how','is','are','be','that','this','please','need','show','me','find','info','information','tell','explain','give','i','we','you',
      // domain-generic words that cause noisy matches
      'drug','drugs','medication','medications','medicine','vaccine','vaccines','use','used','using','treat','treats','treatment','treating','against','list','search','recommend','help'
    ])
    const brandTokens = tokens.filter((t) => !stopWords.has(t))

    // If user specified species, restrict candidates to those species; if none remain, return empty
    if (Array.isArray(drugs) && drugs.length > 0 && speciesTokens.length > 0) {
      const speciesSet = new Set(speciesTokens)
      drugs = drugs.filter((d) => {
        try {
          const arr = d.species ? JSON.parse(d.species) : []
          return Array.isArray(arr) && arr.some((s: string) => speciesSet.has(s))
        } catch {
          return false
        }
      })
    }

    if (Array.isArray(drugs) && drugs.length > 0) {
      const scored = drugs.map((d) => {
        const nameNorm = normalize(d.name)
        const tradeNorm = normalize(d.tradeName || '')
        const allInName = brandTokens.every((t) => nameNorm.includes(t))
        const allInTrade = brandTokens.every((t) => tradeNorm.includes(t))
        let score = 0
        if (nameNorm === normalizedQuery || tradeNorm === normalizedQuery) score += 100
        if (nameNorm.includes(normalizedQuery) || tradeNorm.includes(normalizedQuery)) score += 80
        if (allInName || allInTrade) score += 60
        const tokenHits = brandTokens.reduce(
          (acc, t) => acc + (nameNorm.includes(t) ? 1 : 0) + (tradeNorm.includes(t) ? 1 : 0),
          0
        )
        score += tokenHits * 5
        return { d, score, allInName, allInTrade }
      })

      const strictMatches = scored.filter((s) => s.allInName || s.allInTrade)
      if (strictMatches.length > 0) {
        strictMatches.sort((a, b) => b.score - a.score)
        drugs = strictMatches.map((s) => s.d).slice(0, 3)
      } else {
        scored.sort((a, b) => b.score - a.score)
        const top = scored[0]?.score ?? 0
        let filtered = scored
        if (top >= 80) {
          filtered = scored.filter((s) => s.score >= Math.max(60, top * 0.9))
        } else if (top >= 60) {
          filtered = scored.filter((s) => s.score >= top * 0.85)
        } else {
          filtered = scored.slice(0, 3)
        }
        drugs = filtered.map((s) => s.d)
      }
    }

    const parsed = drugs.map((d) => ({
      id: String(d.id),
      name: d.name,
      genericName: d.genericName || undefined,
      manufacturer: d.manufacturer,
      activeIngredient: d.activeIngredient,
      tradeName: d.tradeName || undefined,
      productCode: d.productCode || undefined,
      species: d.species ? JSON.parse(d.species) : [],
      deliveryMethods: d.deliveryMethods ? JSON.parse(d.deliveryMethods) : [],
      description: truncate(d.description, 400),
      dosage: truncate(d.dosage, 300),
      contraindications: truncate(d.contraindications, 300),
      warnings: truncate(d.warnings, 300),
      faradInfo: truncate(d.faradInfo, 200),
      withdrawalTime: truncate(d.withdrawalTime, 120),
    }))

    const sourcesText = parsed
      .map((d, i) =>
        `Source ${i + 1} - ${d.name}${d.genericName ? ` (Generic: ${d.genericName})` : ''}${d.tradeName ? ` | Trade: ${d.tradeName}` : ''}${d.productCode ? ` | Code: ${d.productCode}` : ''}\n` +
        `Manufacturer: ${d.manufacturer}\nActive Ingredient: ${d.activeIngredient}\n` +
        `Species: ${Array.isArray(d.species) ? d.species.join(', ') : ''}\n` +
        `Delivery: ${Array.isArray(d.deliveryMethods) ? d.deliveryMethods.join(', ') : ''}\n` +
        (d.dosage ? `Dosage: ${d.dosage}\n` : '') +
        (d.withdrawalTime ? `Withdrawal: ${d.withdrawalTime}\n` : '') +
        (d.contraindications ? `Contraindications: ${d.contraindications}\n` : '') +
        (d.warnings ? `Warnings: ${d.warnings}\n` : '') +
        (d.description ? `Notes: ${d.description}\n` : '')
      )
      .join('\n---\n')

    const systemPrompt = `You are NotiVet, a veterinary drug assistant for licensed HCPs.
Use the provided drug database excerpts to answer the user's question.
- Be concise and clinically helpful.
- Prefer authoritative info from the provided sources.
- If unavailable in sources, clearly say you are uncertain.
- Include species-appropriateness and safety when relevant.
- Do not fabricate data or dosing that isn't in the sources.`

    const userContent = `User question:\n${query}\n\nDrug database excerpts:\n${sourcesText || '(No directly matching entries found; answer based on general guidance and recommend checking database.)'}`

    // Call OpenAI Chat Completions with GPT-4o
    const completionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    })

    if (!completionRes.ok) {
      const errText = await completionRes.text().catch(() => '')
      console.error('OpenAI error:', completionRes.status, errText)
      return NextResponse.json({ error: 'LLM request failed' }, { status: 502 })
    }

    const completionJson = await completionRes.json()
    const answer = completionJson?.choices?.[0]?.message?.content || ''

    return NextResponse.json({
      answer,
      sources: parsed.map((d) => d.tradeName || d.name).filter(Boolean),
      matchedDrugs: parsed,
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withHCPAuth(postChat)
