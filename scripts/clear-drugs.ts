import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function clearDrugs() {
  try {
    console.log('🗑️  Clearing all drugs from database...')
    
    const result = await db.drug.deleteMany({})
    
    console.log(`✅ Deleted ${result.count} drugs`)
    
  } catch (error) {
    console.error('❌ Error clearing drugs:', error)
  } finally {
    await db.$disconnect()
  }
}

clearDrugs()
  .then(() => {
    console.log('Clear script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Clear script failed:', error)
    process.exit(1)
  })