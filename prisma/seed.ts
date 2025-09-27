import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create sample HCP user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const hcpUser = await prisma.user.create({
    data: {
      email: 'dr.smith@vetclinic.com',
      password: hashedPassword,
      userType: 'HCP',
      hcpProfile: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          license: 'VET12345',
          clinicName: 'Sunny Valley Veterinary Clinic',
          address: '123 Main St',
          city: 'Springfield',
          state: 'CA',
          zipCode: '90210',
          phone: '555-123-4567',
          specialties: JSON.stringify(['CANINE', 'FELINE']),
          verified: true,
        }
      }
    }
  })

  // Create sample Pharma user
  const pharmaUser = await prisma.user.create({
    data: {
      email: 'contact@pharmaco.com',
      password: hashedPassword,
      userType: 'PHARMA',
      pharmaProfile: {
        create: {
          companyName: 'PharmaCo Veterinary Solutions',
          contactName: 'Sarah Johnson',
          title: 'Sales Manager',
          address: '456 Corporate Blvd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          phone: '555-987-6543',
          verified: true,
        }
      }
    }
  })

  // Create sample drugs
  const drugs = [
    {
      name: 'Rimadyl',
      genericName: 'Carprofen',
      manufacturer: 'Zoetis',
      activeIngredient: 'Carprofen',
      species: JSON.stringify(['CANINE']),
      deliveryMethods: JSON.stringify(['ORAL']),
      description: 'Non-steroidal anti-inflammatory drug (NSAID) for dogs',
      dosage: '2 mg/lb (4.4 mg/kg) twice daily',
      contraindications: 'Do not use in cats or in dogs with known hypersensitivity to carprofen',
      sideEffects: 'Vomiting, diarrhea, decreased appetite, lethargy',
      warnings: 'Monitor for signs of gastrointestinal ulceration',
      withdrawalTime: 'Not applicable (companion animal use)',
    },
    {
      name: 'Revolution',
      genericName: 'Selamectin',
      manufacturer: 'Zoetis',
      activeIngredient: 'Selamectin',
      species: JSON.stringify(['CANINE', 'FELINE']),
      deliveryMethods: JSON.stringify(['TOPICAL']),
      description: 'Monthly topical parasiticide for dogs and cats',
      dosage: 'Apply once monthly to the skin at the base of the neck',
      contraindications: 'Do not use on sick, debilitated, or underweight animals',
      sideEffects: 'Temporary hair loss at application site, skin irritation',
      warnings: 'For external use only',
      withdrawalTime: 'Not applicable (companion animal use)',
    },
    {
      name: 'Banamine',
      genericName: 'Flunixin meglumine',
      manufacturer: 'Merck',
      activeIngredient: 'Flunixin meglumine',
      species: JSON.stringify(['EQUINE', 'BOVINE']),
      deliveryMethods: JSON.stringify(['INJECTABLE', 'ORAL']),
      description: 'NSAID for horses and cattle',
      dosage: '1.1 mg/kg IV or IM for horses, 2.2 mg/kg IV for cattle',
      contraindications: 'Do not use in animals intended for human consumption',
      sideEffects: 'Gastric ulceration with prolonged use',
      warnings: 'Do not exceed recommended dose',
      withdrawalTime: 'Cattle: 4 days milk, 12 hours meat',
      faradInfo: 'Prohibited in food-producing animals',
    }
  ]

  for (const drugData of drugs) {
    await prisma.drug.create({
      data: drugData
    })
  }

  console.log('Database seeded successfully!')
  console.log(`Created HCP user: ${hcpUser.email}`)
  console.log(`Created Pharma user: ${pharmaUser.email}`)
  console.log(`Created ${drugs.length} sample drugs`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })