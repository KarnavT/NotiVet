import React from 'react'
import Image from 'next/image'
import { 
  Dog, 
  Cat, 
  Rabbit,
  Bird,
  Fish,
  Bug
} from 'lucide-react'
import { 
  GiCow,
  GiPig, 
  GiSheep,
  GiGoat,
  GiHorseHead,
  GiBull,
  GiMilkCarton
} from 'react-icons/gi'

// Map species to their corresponding icons and colors (all blue)
const SPECIES_ICON_MAP: Record<string, { icon: React.ElementType; color: string; name: string }> = {
  'CANINE': { icon: Dog, color: 'text-blue-600', name: 'Canine' },
  'FELINE': { icon: Cat, color: 'text-blue-600', name: 'Feline' },
  'EQUINE': { icon: GiHorseHead, color: 'text-blue-600', name: 'Equine' }, // Actual horse head icon
  'BOVINE': { icon: GiCow, color: 'text-blue-600', name: 'Bovine' }, // Actual cow icon
  'OVINE': { icon: GiSheep, color: 'text-blue-600', name: 'Ovine' }, // Actual sheep icon
  'CAPRINE': { icon: GiGoat, color: 'text-blue-600', name: 'Caprine' }, // Actual goat icon
  'PORCINE': { icon: GiPig, color: 'text-blue-600', name: 'Porcine' }, // Actual pig icon
  'AVIAN': { icon: Bird, color: 'text-blue-600', name: 'Avian' },
  'EXOTIC': { icon: Rabbit, color: 'text-blue-600', name: 'Exotic' },
  'AQUATIC': { icon: Fish, color: 'text-blue-600', name: 'Aquatic' },
  'INSECT': { icon: Bug, color: 'text-blue-600', name: 'Insect' },
}

interface SpeciesIconsProps {
  species: string[] | string
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

export default function SpeciesIcons({ 
  species, 
  size = 'md', 
  showLabels = false,
  className = '' 
}: SpeciesIconsProps) {
  // Normalize species to array
  const speciesArray = Array.isArray(species) 
    ? species 
    : typeof species === 'string' 
      ? (species.startsWith('[') ? JSON.parse(species) : [species])
      : []

  // Size mapping (increased sizes for better visibility)
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8'
  }

  const iconSize = sizeMap[size]

  if (!speciesArray.length) return null

  return (
    <div className={`flex items-center flex-wrap gap-2 ${className}`}>
      {speciesArray.map((speciesName: string, index: number) => {
        const speciesInfo = SPECIES_ICON_MAP[speciesName.toUpperCase()]
        
        if (!speciesInfo) return null
        
        const { icon: IconComponent, color, name } = speciesInfo
        
        return (
          <div
            key={`${speciesName}-${index}`}
            className="flex items-center gap-1"
            title={name}
          >
            {speciesName.toUpperCase() === 'BOVINE' ? (
              <Image 
                src="/images/Bovine.png?v=2"
                alt="Bovine" 
                width={size === 'sm' ? 28 : size === 'md' ? 32 : 36}
                height={size === 'sm' ? 28 : size === 'md' ? 32 : 36}
                className={`flex-shrink-0`}
                style={{filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(213%) brightness(94%) contrast(87%)'}}
              />
            ) : (
              <IconComponent className={`${iconSize} ${color} flex-shrink-0`} />
            )}
            {showLabels && (
              <span className="text-xs text-gray-600 font-medium">
                {name}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Export individual icon component for specific use cases
export function getSpeciesIcon(speciesName: string) {
  return SPECIES_ICON_MAP[speciesName.toUpperCase()]
}