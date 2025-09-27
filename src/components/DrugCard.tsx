import React from 'react'
import { Heart, Check, MessageSquare } from 'lucide-react'
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
      
      {/* Header Section with Title and Manufacturer */}
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-lg p-4 mb-4 border-l-4 border-blue-300">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-200">
              {drug.name}
            </h3>
            {drug.genericName && (
              <p className="text-gray-600 mt-1 text-sm font-medium">Generic: <span className="text-gray-700">{drug.genericName}</span></p>
            )}
          </div>
          <div className="text-right pl-4 border-l border-gray-200">
            <p className="text-lg font-semibold text-gray-700">{drug.manufacturer}</p>
          </div>
        </div>
      </div>

      {/* Species Section */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Species:</span>
          <SpeciesIcons 
            species={(drug as any).species || []} 
            size="md" 
            className="flex-wrap"
          />
          {speciesText && (
            <span className="text-xs text-gray-500 font-medium ml-2">
              ({speciesText})
            </span>
          )}
        </div>
      </div>

      {/* Key Information Section */}
      <div className="space-y-2 mb-4 pr-36">
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
          <div className="flex-1 break-words">
            <span className="text-sm font-bold text-gray-700">Active Ingredients: </span>
            <span className="text-sm text-gray-600">{drug.activeIngredient}</span>
          </div>
        </div>
        
        {drug.dosage && (
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 break-words">
              <span className="text-sm font-bold text-gray-700">Dosage: </span>
              <span className="text-sm text-gray-600">{drug.dosage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Description and Buttons */}
      <div className="flex gap-4 mt-2">
        {/* Description Section */}
        <div className="flex-1 pr-4 max-w-[calc(100%-150px)]">
          {((drug as any).usage || drug.description) && (
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1 break-words overflow-hidden">
                <div className="break-words">
                  <span className="text-sm font-bold text-gray-700">Description: </span>
                  <span className="text-sm text-gray-600 leading-relaxed">{(drug as any).usage || drug.description}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        <div className="flex flex-col gap-3 min-w-[130px] max-w-[130px] flex-shrink-0">
          {/* Save Button */}
          <button
            type="button"
            onClick={() => !saved && onSave()}
            disabled={saved}
            className={`flex items-center justify-center px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md text-sm font-medium ${
              saved 
                ? 'bg-green-600 text-white cursor-default shadow-green-200' 
                : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 hover:shadow-lg shadow-blue-200'
            }`}
          >
            {saved ? (
              <Check className="w-4 h-4 mr-2 transition-all duration-300 scale-110" />
            ) : (
              <Heart className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
            )}
            {saved ? 'Saved!' : 'Save'}
          </button>

          {/* Contact Button */}
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2.5 rounded-lg transition-all duration-300 shadow-md text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white transform hover:scale-105 hover:shadow-lg shadow-gray-200"
          >
            <MessageSquare className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
            Contact
          </button>
        </div>
      </div>
    </div>
  )
}
