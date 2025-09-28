import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function run() {
  try {
    const count = await db.drug.count()
    const sample = await db.drug.findMany({ select: { name: true }, take: 5, orderBy: { createdAt: 'desc' } })
    console.log(`Drugs in DB: ${count}`)
    console.log('Latest 5:', sample.map(s => s.name).join(' | '))
  } catch (e) {
    console.error('Count failed:', e)
    process.exitCode = 1
  } finally {
    await db.$disconnect()
  }
}

run()
