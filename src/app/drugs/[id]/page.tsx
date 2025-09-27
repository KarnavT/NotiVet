'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ExternalLink, 
  Heart, 
  AlertTriangle,
  FileText,
  Calendar,
  Info,
  BarChart3
} from 'lucide-react';
import { mockDrugs, Drug } from '@/data/mockData';

export default function DrugDetail() {
  const params = useParams();
  const drugId = params.id as string;
  const [isFavorite, setIsFavorite] = useState(false);
  
  const drug = mockDrugs.find(d => d.id === drugId);
  
  if (!drug) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Drug not found</h1>
          <p className="text-gray-600 mb-4">The requested drug information is not available.</p>
          <Link 
            href="/drugs"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Drug Database
          </Link>
        </div>
      </div>
    );
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const SafetyChart = ({ adverseEvents }: { adverseEvents: { species: string; count: number }[] }) => {
    const maxCount = Math.max(...adverseEvents.map(ae => ae.count));
    
    return (
      <div className="space-y-3">
        {adverseEvents.map((event, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="w-16 text-sm text-gray-700">{event.species}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
              <div 
                className="bg-red-500 h-4 rounded-full" 
                style={{ width: `${(event.count / maxCount) * 100}%` }}
              />
              <span className="absolute right-2 top-0 text-xs text-white font-medium leading-4">
                {event.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/drugs" className="flex items-center text-gray-700 hover:text-blue-600 mr-4">
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to Database
              </Link>
              <Link href="/hcp/dashboard" className="text-2xl font-bold text-blue-600">
                NotiVet
              </Link>
            </div>
            
            <button
              onClick={toggleFavorite}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                isFavorite 
                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{isFavorite ? 'Saved' : 'Save to Favorites'}</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {drug.brandName}
                {drug.genericName && (
                  <span className="text-gray-600 font-normal"> ({drug.genericName})</span>
                )}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Active ingredient: <span className="font-medium">{drug.activeIngredient}</span>
              </p>
              
              {/* Species Icons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {drug.species.map(species => (
                  <span key={species} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {species}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              {drug.labelLink && (
                <a 
                  href={drug.labelLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Label</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Approved Indications */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Approved Indications</h2>
              <div className="flex flex-wrap gap-2">
                {drug.indications.map(indication => (
                  <span key={indication} className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium">
                    {indication}
                  </span>
                ))}
              </div>
            </div>

            {/* Routes of Administration */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Routes of Administration</h2>
              <div className="flex flex-wrap gap-2">
                {drug.routes.map(route => (
                  <span key={route} className="px-3 py-2 bg-purple-100 text-purple-800 rounded-md text-sm font-medium">
                    {route}
                  </span>
                ))}
              </div>
            </div>

            {/* Dosing Information */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Dosing Guidelines</h2>
                {drug.labelLink && (
                  <a 
                    href={drug.labelLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-800 font-mono">{drug.dosing}</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Always refer to the official label for complete dosing information.
              </p>
            </div>

            {/* Contraindications & Warnings */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contraindications & Warnings</h2>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-red-700 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Contraindications
                </h3>
                <ul className="space-y-2">
                  {drug.contraindications.map((contraindication, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{contraindication}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-yellow-700 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Warnings & Precautions
                </h3>
                <ul className="space-y-2">
                  {drug.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Withdrawal Times */}
            {drug.withdrawalTimes && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Withdrawal Times</h2>
                  {drug.faradLink && (
                    <a 
                      href={drug.faradLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="FARAD Guidelines"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                  <p className="text-gray-800">{drug.withdrawalTimes}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Consult FARAD for withdrawal recommendations in food-producing animals.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Safety Panel */}
            {drug.adverseEvents && drug.adverseEvents.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Adverse Events (openFDA)
                </h3>
                <SafetyChart adverseEvents={drug.adverseEvents} />
                <p className="text-xs text-gray-500 mt-4">
                  Data from FDA adverse event reporting system. Numbers represent reported cases and may not reflect actual incidence rates.
                </p>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Added:</span>
                  <span className="font-medium">{new Date(drug.dateAdded).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Species Count:</span>
                  <span className="font-medium">{drug.species.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Indications:</span>
                  <span className="font-medium">{drug.indications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Routes:</span>
                  <span className="font-medium">{drug.routes.length}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={toggleFavorite}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                    isFavorite 
                      ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}</span>
                </button>
                
                {drug.labelLink && (
                  <a 
                    href={drug.labelLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Full Label</span>
                  </a>
                )}
                
                {drug.faradLink && (
                  <a 
                    href={drug.faradLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>FARAD Guidelines</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}