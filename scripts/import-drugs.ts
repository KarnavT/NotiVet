import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

const db = new PrismaClient()

// Species mapping from CSV to our enum values
const SPECIES_MAPPING: Record<string, string> = {
  'Canine': 'CANINE',
  'Feline': 'FELINE', 
  'Equine': 'EQUINE',
  'Bovine': 'BOVINE',
  'Ovine': 'OVINE',
  'Caprine': 'CAPRINE',
  'Swine': 'PORCINE',
  'Chicken': 'AVIAN',
  'Turkey': 'AVIAN',
  'Duck': 'AVIAN',
  'Pigeon': 'AVIAN',
  'Pet Bird (e.g. parrot': 'AVIAN',
  'Fish': 'EXOTIC',
  'Rabbit': 'EXOTIC',
  'Ferret': 'EXOTIC',
  'Mink': 'EXOTIC',
  'Mouse': 'EXOTIC',
  'Bee': 'EXOTIC',
  'Alligator': 'EXOTIC'
}

function mapSpecies(csvSpecies: string): string[] {
  // Clean up the species string
  const cleaned = csvSpecies.replace(/"/g, '').trim()
  
  // Handle multiple species (e.g., "Bovine; Swine")
  if (cleaned.includes(';')) {
    return cleaned.split(';')
      .map(s => s.trim())
      .map(s => SPECIES_MAPPING[s] || 'EXOTIC')
      .filter(Boolean)
  }
  
  // Handle mixed species in one field
  if (cleaned.includes(',')) {
    return cleaned.split(',')
      .map(s => s.trim())
      .map(s => SPECIES_MAPPING[s] || 'EXOTIC')
      .filter(Boolean)
  }
  
  return [SPECIES_MAPPING[cleaned] || 'EXOTIC']
}

function cleanHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/"/g, '').trim()
}

function extractProductCode(productCodeWithHtml: string): string {
  // Extract product code from HTML link text
  const match = productCodeWithHtml.match(/>\s*([^<]+)\s*<\/a>/)
  if (match) {
    return match[1].trim()
  }
  return cleanHtmlTags(productCodeWithHtml)
}

async function importDrugs() {
  try {
    console.log('🚀 Starting drug import from CSV...')
    
    // Read CSV file
    const csvContent = readFileSync('./data/AnimalDrugs.csv', 'utf-8')
    
    // Parse CSV
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_quotes: true,
      quote: '"',
      delimiter: ','
    })
    
    console.log(`📊 Found ${records.length} records to process`)
    
    let successCount = 0
    let errorCount = 0
    
    for (const record of records) {
      try {
        // Extract and clean data from CSV record
        const productCode = extractProductCode(record['Product Code:'] || '')
        const animalSpecies = record['Animal Species'] || ''
        const establishmentCode = record['Establishment Code'] || ''
        const establishmentName = cleanHtmlTags(record['Establishment Name'] || '')
        const subsidiaries = cleanHtmlTags(record['Subsidiaries'] || '')
        const productTrueName = cleanHtmlTags(record['Product True Name'] || '')
        const agents = cleanHtmlTags(record['Agent(s):'] || '')
        const tradeName = cleanHtmlTags(record['Trade Name(s):'] || '')
        const distributors = cleanHtmlTags(record['Distributor(s):'] || '')
        
        // Map species to our enum format
        const mappedSpecies = mapSpecies(animalSpecies)
        
        // Determine primary name (prefer trade name if available, otherwise use product true name)
        const primaryName = tradeName && tradeName !== 'No trade name specified' 
          ? tradeName.split(';')[0].trim() // Take first trade name if multiple
          : productTrueName
          
        if (!primaryName || primaryName.length < 2) {
          console.warn(`⚠️  Skipping record with missing name: ${productCode}`)
          continue
        }
        
        // Create drug record
        await db.drug.create({
          data: {
            name: primaryName,
            manufacturer: establishmentName,
            activeIngredient: agents,
            species: JSON.stringify(mappedSpecies),
            deliveryMethods: JSON.stringify(['INJECTABLE']), // Default delivery method
            description: productTrueName !== primaryName ? productTrueName : undefined,
            productCode: productCode,
            establishmentCode: establishmentCode,
            subsidiaries: subsidiaries !== 'Not Applicable' ? subsidiaries : undefined,
            tradeName: tradeName,
            distributors: distributors !== 'No distributor specified' ? distributors : undefined
          }
        })
        
        successCount++
        
        if (successCount % 100 === 0) {
          console.log(`✅ Processed ${successCount} drugs...`)
        }
        
      } catch (error) {
        errorCount++
        console.error(`❌ Error processing record ${record['Product Code:']}: ${error}`)
        
        if (errorCount > 50) {
          console.error('Too many errors, stopping import')
          break
        }
      }
    }
    
    console.log(`\n🎉 Import completed!`)
    console.log(`✅ Successfully imported: ${successCount} drugs`)
    console.log(`❌ Errors: ${errorCount}`)
    
  } catch (error) {
    console.error('Fatal error during import:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the import
importDrugs()
  .then(() => {
    console.log('Import script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Import script failed:', error)
    process.exit(1)
  })