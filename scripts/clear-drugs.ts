import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function run() {
  try {
    console.log('Clearing SavedDrug relations…')
    await db.savedDrug.deleteMany()

    console.log('Nulling notification drug references…')
    await db.notification.updateMany({ data: { drugId: null }, where: { drugId: { not: null } } })

    console.log('Deleting all drugs…')
    const res = await db.drug.deleteMany()
    console.log(`Deleted ${res.count} drugs`)
  } catch (e) {
    console.error('Failed to clear drugs:', e)
    process.exitCode = 1
  } finally {
    await db.$disconnect()
  }
}

run()
