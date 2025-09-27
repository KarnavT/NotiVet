'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Heart, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  Star,
  Eye,
  EyeOff,
  ChevronDown,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { mockMessages, mockDrugs, Drug, Message } from '@/data/mockData';

export default function HCPDashboard() {
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [favoriteDrugs, setFavoriteDrugs] = useState<Drug[]>(
    mockDrugs.filter(drug => ['1', '4'].includes(drug.id)).map(drug => ({ ...drug, isFavorite: true }))
  );
  const [newProducts] = useState<Drug[]>(mockDrugs.slice(0, 3));

  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  const toggleFavorite = (drugId: string) => {
    const drug = mockDrugs.find(d => d.id === drugId);
    if (!drug) return;

    setFavoriteDrugs(prev => {
      const exists = prev.find(d => d.id === drugId);
      if (exists) {
        return prev.filter(d => d.id !== drugId);
      } else {
        return [...prev, { ...drug, isFavorite: true }];
      }
    });
  };

  const MessageCard = ({ message }: { message: Message }) => (
    <div className={`border rounded-lg p-4 ${message.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {message.drugName}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {message.species.map(species => (
              <span key={species} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {species}
              </span>
            ))}
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              {message.indication}
            </span>
          </div>
        </div>
        <button
          onClick={() => markAsRead(message.id)}
          className={`p-1 rounded ${message.isRead ? 'text-gray-400' : 'text-blue-600'}`}
        >
          {message.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      
      <p className="text-gray-700 text-sm mb-3">{message.summary}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <a 
            href={message.guidelinesLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Guidelines
          </a>
          <a 
            href={message.pdfReportLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-green-600 hover:text-green-800 text-sm"
          >
            <FileText className="w-4 h-4 mr-1" />
            Lab Report
          </a>
        </div>
        <span className="text-xs text-gray-500">
          {message.pharmaCompany} • {new Date(message.dateCreated).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  const DrugCard = ({ drug, showFavoriteButton = false }: { drug: Drug; showFavoriteButton?: boolean }) => (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            {drug.brandName}
            {drug.genericName && (
              <span className="text-gray-600 font-normal"> ({drug.genericName})</span>
            )}
          </h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {drug.species.map(species => (
              <span key={species} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {species}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {drug.indications.slice(0, 2).map(indication => (
              <span key={indication} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {indication}
              </span>
            ))}
            {drug.indications.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{drug.indications.length - 2} more
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {drug.routes.map(route => (
              <span key={route} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                {route}
              </span>
            ))}
          </div>
        </div>
        {showFavoriteButton && (
          <button
            onClick={() => toggleFavorite(drug.id)}
            className={`p-1 rounded ${
              favoriteDrugs.find(d => d.id === drug.id)
                ? 'text-red-500 hover:text-red-700'
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${
              favoriteDrugs.find(d => d.id === drug.id) ? 'fill-current' : ''
            }`} />
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          <Link 
            href={`/drugs/${drug.id}`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Details
          </Link>
          {drug.labelLink && (
            <a 
              href={drug.labelLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-green-600 hover:text-green-800 text-sm"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Label
            </a>
          )}
        </div>
        {showFavoriteButton && (
          <button
            onClick={() => toggleFavorite(drug.id)}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600"
          >
            <Star className={`w-4 h-4 mr-1 ${
              favoriteDrugs.find(d => d.id === drug.id) ? 'fill-current text-yellow-500' : ''
            }`} />
            Save
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">NotiVet</h1>
              <span className="ml-3 text-gray-500">Veterinary Professional</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/drugs" className="text-gray-700 hover:text-blue-600">
                Drug Database
              </Link>
              <button className="relative p-2 text-gray-700 hover:text-blue-600">
                <Bell className="w-5 h-5" />
                {messages.filter(m => !m.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {messages.filter(m => !m.isRead).length}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                  <User className="w-5 h-5" />
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Dr. Smith</h2>
          <p className="text-gray-600">Stay updated with the latest veterinary drug information and notifications.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'messages' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            New Messages
            {messages.filter(m => !m.isRead).length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {messages.filter(m => !m.isRead).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'favorites' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Saved Drugs
            <span className="ml-2 text-xs">({favoriteDrugs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'products' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            New Products
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'messages' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Drug Alerts & Updates</h3>
                <span className="text-sm text-gray-500">
                  {messages.filter(m => !m.isRead).length} unread
                </span>
              </div>
              
              {messages.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-500">You'll receive notifications about new drugs and updates here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <MessageCard key={message.id} message={message} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Saved Drugs</h3>
                <Link 
                  href="/drugs"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Browse all drugs →
                </Link>
              </div>
              
              {favoriteDrugs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved drugs yet</h3>
                  <p className="text-gray-500 mb-4">Save frequently used drugs for quick access.</p>
                  <Link 
                    href="/drugs"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Browse Drug Database
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteDrugs.map((drug) => (
                    <DrugCard key={drug.id} drug={drug} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">New Products</h3>
                <div className="flex space-x-2">
                  <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-1 rounded border">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filter</span>
                  </button>
                  <select className="border rounded px-3 py-1 text-sm">
                    <option>Date added (newest)</option>
                    <option>Date added (oldest)</option>
                    <option>Name (A-Z)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {newProducts.map((drug) => (
                  <DrugCard key={drug.id} drug={drug} showFavoriteButton={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}