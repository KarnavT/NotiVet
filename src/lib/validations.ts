import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  userType: z.enum(['HCP', 'PHARMA']),
})

export const hcpRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  license: z.string().optional(),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.enum(['CANINE', 'FELINE', 'EQUINE', 'BOVINE', 'OVINE', 'CAPRINE', 'PORCINE', 'AVIAN', 'EXOTIC'])).min(1, 'At least one specialty is required'),
})

export const pharmaRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  title: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
})

// Drug schemas
export const drugSchema = z.object({
  name: z.string().min(1, 'Drug name is required'),
  genericName: z.string().optional(),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  activeIngredient: z.string().min(1, 'Active ingredient is required'),
  species: z.array(z.enum(['CANINE', 'FELINE', 'EQUINE', 'BOVINE', 'OVINE', 'CAPRINE', 'PORCINE', 'AVIAN', 'EXOTIC'])).min(1, 'At least one species is required'),
  deliveryMethods: z.array(z.enum(['ORAL', 'INJECTABLE', 'TOPICAL', 'INHALATION', 'IMPLANT', 'TRANSDERMAL'])).min(1, 'At least one delivery method is required'),
  description: z.string().optional(),
  dosage: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  warnings: z.string().optional(),
  faradInfo: z.string().optional(),
  withdrawalTime: z.string().optional(),
  approvalDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
})

export const drugSearchSchema = z.object({
  q: z.string().optional(),
  species: z.array(z.enum(['CANINE', 'FELINE', 'EQUINE', 'BOVINE', 'OVINE', 'CAPRINE', 'PORCINE', 'AVIAN', 'EXOTIC'])).optional(),
  deliveryMethod: z.array(z.enum(['ORAL', 'INJECTABLE', 'TOPICAL', 'INHALATION', 'IMPLANT', 'TRANSDERMAL'])).optional(),
  manufacturer: z.string().optional(),
  page: z.string().optional().transform((str) => str ? parseInt(str) : 1),
  limit: z.string().optional().transform((str) => str ? parseInt(str) : 20),
})

// Notification schemas
export const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  drugInfo: z.string().optional(),
  targetSpecies: z.array(z.enum(['CANINE', 'FELINE', 'EQUINE', 'BOVINE', 'OVINE', 'CAPRINE', 'PORCINE', 'AVIAN', 'EXOTIC'])).min(1, 'At least one target species is required'),
  // Drug creation fields
  drugName: z.string().min(1, 'Drug name is required'),
  genericName: z.string().optional(),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  activeIngredient: z.string().min(1, 'Active ingredient is required'),
  deliveryMethods: z.array(z.enum(['ORAL', 'INJECTABLE', 'TOPICAL', 'INHALATION', 'IMPLANT', 'TRANSDERMAL'])).min(1, 'At least one delivery method is required'),
  description: z.string().optional(),
  dosage: z.string().optional(),
  contraindications: z.string().optional(),
  sideEffects: z.string().optional(),
  warnings: z.string().optional(),
  faradInfo: z.string().optional(),
  withdrawalTime: z.string().optional(),
})

// Profile update schemas
export const hcpProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  license: z.string().optional(),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
  specialties: z.array(z.enum(['CANINE', 'FELINE', 'EQUINE', 'BOVINE', 'OVINE', 'CAPRINE', 'PORCINE', 'AVIAN', 'EXOTIC'])).optional(),
})

export const pharmaProfileUpdateSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').optional(),
  contactName: z.string().min(1, 'Contact name is required').optional(),
  title: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),
})