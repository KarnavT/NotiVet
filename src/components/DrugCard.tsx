import React from 'react'
import { Heart, Check } from 'lucide-react'
import SpeciesIcons from './SpeciesIcons'

export type DrugCardDrug = {
  id: string
  name: string
  genericName?: string
  manufacturer: string
  activeIngredient: string
  species?: string[] | string
  deliveryMethods?: string[] | string
  description?: string
  dosage?: string
  withdrawalTime?: string
}

interface DrugCardProps {
  drug: DrugCardDrug
  saved: boolean
  onSave: () => void
  context?: 'database' | 'chatbot'
}

export default function DrugCard({ drug, saved, onSave, context = 'database' }: DrugCardProps) {
  const speciesText = Array.isArray((drug as any).species)
    ? ((drug as any).species as string[]).join(', ')
    : (drug as any).species || ''

  return (
    <div className={`group bg-white rounded-xl border-2 ${
      context === 'database' ? 'border-blue-100 hover:border-blue-300' : 'border-indigo-100 hover:border-indigo-300'
    } shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 p-6`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-200">{drug.name}</h3>
          {drug.genericName && (
            <p className="text-gray-600 mt-1 font-medium">Generic: <span className="text-gray-700">{drug.genericName}</span></p>
          )}
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="font-medium text-gray-600">Manufacturer:</span> {drug.manufacturer}
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-600">Active Ingredient:</span> {drug.activeIngredient}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => !saved && onSave()}
          disabled={saved}
          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 shadow-md ${
            saved ? 'bg-green-600 text-white cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 hover:shadow-lg'
          }`}
        >
          {saved ? (
            <Check className="w-4 h-4 mr-2 transition-all duration-300 scale-110" />
          ) : (
            <Heart className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
          )}
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-3">Species:</span>
            <SpeciesIcons 
              species={(drug as any).species || []} 
              size="md" 
              className="flex-wrap"
            />
          </div>
          {speciesText && (
            <span className="text-xs text-gray-500 font-medium">
              ({speciesText})
            </span>
          )}
        </div>

        {drug.dosage && (
          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-blue-400">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Dosage</p>
                <p className="text-sm text-gray-700">{drug.dosage}</p>
              </div>
            </div>
          </div>
        )}

        {drug.withdrawalTime && (
          <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Withdrawal Time</p>
                <p className="text-sm text-gray-700">{drug.withdrawalTime}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {(drug as any).usage || drug.description ? (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-900">Description:</span>
          </div>
          <p className="text-gray-700 leading-relaxed">{(drug as any).usage || drug.description}</p>
        </div>
      ) : null}
    </div>
  )
}
