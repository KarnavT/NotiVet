'use client'

import React from 'react'
import { 
  X, 
  Calendar, 
  Users, 
  Eye, 
  MousePointer, 
  TrendingUp,
  Target,
  MessageSquare,
  BarChart3,
  CheckCircle,
  Activity
} from 'lucide-react'

interface CampaignDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  campaign: any // We'll type this properly based on the notification structure
}

export default function CampaignDetailsModal({ isOpen, onClose, campaign }: CampaignDetailsModalProps) {
  if (!isOpen || !campaign) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const analytics = campaign.analytics || {
    sent: 0,
    opened: 0,
    clicked: 0,
    openRate: 0,
    clickRate: 0,
    clickThroughRate: 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Created on {formatDate(campaign.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Campaign Overview */}
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(campaign.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    {campaign.targetSpecies.join(', ')}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {analytics.sent} recipients
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Sent</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-gray-900">{analytics.sent}</div>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-sm text-gray-500">Total Recipients</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-green-600">{analytics.opened}</div>
                <Eye className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-sm text-gray-500">Opens</div>
              <div className="text-xs text-green-600 font-medium">{analytics.openRate}% rate</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-purple-600">{analytics.clicked}</div>
                <MousePointer className="w-6 h-6 text-purple-500" />
              </div>
              <div className="text-sm text-gray-500">Clicks</div>
              <div className="text-xs text-purple-600 font-medium">{analytics.clickRate}% rate</div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-orange-600">{analytics.clickThroughRate}%</div>
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-sm text-gray-500">Click-through Rate</div>
              <div className="text-xs text-orange-600 font-medium">clicks/opens</div>
            </div>
          </div>

          {/* Campaign Message */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Campaign Message</h4>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Subject:</h5>
                <p className="text-gray-800">{campaign.title}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Message Content:</h5>
                <div className="text-gray-800 whitespace-pre-wrap">{campaign.content}</div>
              </div>
              
              {campaign.drugInfo && (
                <div className="bg-green-50 rounded-lg p-4 mt-4 border border-green-200">
                  <h5 className="font-medium text-green-900 mb-2">Associated Drug:</h5>
                  <p className="text-green-800">{campaign.drugInfo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Complete Drug Information */}
          {campaign.drug && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Complete Drug Information</h4>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* Basic Drug Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Drug Name:</h5>
                    <p className="text-gray-800">{campaign.drug.name}</p>
                  </div>
                  {campaign.drug.genericName && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Generic Name:</h5>
                      <p className="text-gray-800">{campaign.drug.genericName}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Manufacturer:</h5>
                    <p className="text-gray-800">{campaign.drug.manufacturer}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Active Ingredient:</h5>
                    <p className="text-gray-800">{campaign.drug.activeIngredient}</p>
                  </div>
                </div>

                {/* Species and Delivery Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign.drug.species && campaign.drug.species.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Target Species:</h5>
                      <div className="flex flex-wrap gap-2">
                        {campaign.drug.species.map((species: string) => (
                          <span key={species} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {species}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {campaign.drug.deliveryMethods && campaign.drug.deliveryMethods.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Delivery Methods:</h5>
                      <div className="flex flex-wrap gap-2">
                        {campaign.drug.deliveryMethods.map((method: string) => (
                          <span key={method} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Detailed Drug Information */}
                <div className="space-y-4">
                  {campaign.drug.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Description:</h5>
                      <p className="text-gray-800 whitespace-pre-wrap">{campaign.drug.description}</p>
                    </div>
                  )}
                  
                  {campaign.drug.dosage && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">Dosage Information:</h5>
                      <p className="text-gray-800 whitespace-pre-wrap">{campaign.drug.dosage}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaign.drug.contraindications && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Contraindications:</h5>
                        <p className="text-gray-800 whitespace-pre-wrap">{campaign.drug.contraindications}</p>
                      </div>
                    )}

                    {campaign.drug.sideEffects && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Side Effects:</h5>
                        <p className="text-gray-800 whitespace-pre-wrap">{campaign.drug.sideEffects}</p>
                      </div>
                    )}

                    {campaign.drug.warnings && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Warnings:</h5>
                        <p className="text-gray-800 whitespace-pre-wrap">{campaign.drug.warnings}</p>
                      </div>
                    )}

                    {campaign.drug.withdrawalTime && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Withdrawal Time:</h5>
                        <p className="text-gray-800">{campaign.drug.withdrawalTime}</p>
                      </div>
                    )}
                  </div>

                  {campaign.drug.faradInfo && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-2">FARAD Information:</h5>
                      <p className="text-gray-800 whitespace-pre-wrap">{campaign.drug.faradInfo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Targeting Details */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Campaign Targeting</h4>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Target Species:</h5>
                  <div className="flex flex-wrap gap-2">
                    {campaign.targetSpecies.map((species: string) => (
                      <span 
                        key={species} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {species}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Recipients:</h5>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.sent}</div>
                  <p className="text-sm text-gray-500">Veterinary professionals reached</p>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Timeline (placeholder for future enhancement) */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Engagement Summary</h4>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-900 font-medium">Campaign Sent</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{analytics.sent} recipients</span>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                {analytics.opened > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-900 font-medium">Notifications Opened</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{analytics.opened} opens ({analytics.openRate}%)</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                )}
                {analytics.clicked > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-900 font-medium">Links Clicked</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{analytics.clicked} clicks ({analytics.clickRate}%)</span>
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}