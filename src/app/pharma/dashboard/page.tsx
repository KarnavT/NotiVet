'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Send, 
  MessageCircle,
  TrendingUp,
  Eye,
  Heart,
  FileText,
  Plus,
  Filter,
  Calendar,
  Target,
  ChevronDown,
  User
} from 'lucide-react';

interface AnalyticsData {
  messagesSent: number;
  vetsReached: number;
  openRate: number;
  clickRate: number;
  favoriteRate: number;
}

interface MessageData {
  id: string;
  drugName: string;
  targetTags: string[];
  targetSpecies: string[];
  sentDate: string;
  vetsReached: number;
  openRate: number;
  clickRate: number;
}

export default function PharmaDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [newMessage, setNewMessage] = useState({
    drugName: '',
    summary: '',
    targetTags: [] as string[],
    targetSpecies: [] as string[],
    guidelinesLink: '',
    pdfReportLink: ''
  });

  const analytics: AnalyticsData = {
    messagesSent: 24,
    vetsReached: 1247,
    openRate: 68.5,
    clickRate: 42.3,
    favoriteRate: 15.8
  };

  const recentMessages: MessageData[] = [
    {
      id: '1',
      drugName: 'Librela (bedinvetmab)',
      targetTags: ['Anesthesiology', 'Internal Medicine'],
      targetSpecies: ['Dogs'],
      sentDate: '2024-03-01',
      vetsReached: 324,
      openRate: 72.1,
      clickRate: 45.6
    },
    {
      id: '2',
      drugName: 'Solensia (frunevetmab)',
      targetTags: ['Internal Medicine'],
      targetSpecies: ['Cats'],
      sentDate: '2024-02-25',
      vetsReached: 287,
      openRate: 65.2,
      clickRate: 38.9
    },
    {
      id: '3',
      drugName: 'Sileo (dexmedetomidine)',
      targetTags: ['Anesthesiology', 'Emergency Care'],
      targetSpecies: ['Dogs'],
      sentDate: '2024-02-20',
      vetsReached: 445,
      openRate: 69.8,
      clickRate: 44.2
    }
  ];

  const availableTags = [
    'Anesthesiology', 'Dermatology', 'Avians', 'Large Animal', 'Exotics',
    'Internal Medicine', 'Surgery', 'Emergency Care', 'Cardiology', 'Oncology'
  ];

  const availableSpecies = [
    'Dogs', 'Cats', 'Horses', 'Cattle', 'Poultry', 'Exotic Animals', 'Large Animals'
  ];

  const toggleTag = (tag: string) => {
    setNewMessage(prev => ({
      ...prev,
      targetTags: prev.targetTags.includes(tag)
        ? prev.targetTags.filter(t => t !== tag)
        : [...prev.targetTags, tag]
    }));
  };

  const toggleSpecies = (species: string) => {
    setNewMessage(prev => ({
      ...prev,
      targetSpecies: prev.targetSpecies.includes(species)
        ? prev.targetSpecies.filter(s => s !== species)
        : [...prev.targetSpecies, species]
    }));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    alert('Message sent to veterinarians!');
    setNewMessage({
      drugName: '',
      summary: '',
      targetTags: [],
      targetSpecies: [],
      guidelinesLink: '',
      pdfReportLink: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">NotiVet</h1>
              <span className="ml-3 text-gray-500">Pharmaceutical Portal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600">
                  <User className="w-5 h-5" />
                  <span>Zoetis Representative</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Pharma Dashboard</h2>
          <p className="text-gray-600">Manage your veterinary outreach campaigns and view engagement analytics.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-md">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'compose' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Compose Message
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.messagesSent}</p>
                  </div>
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">↗ 12% from last month</p>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Vets Reached</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.vetsReached.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">↗ 8% from last month</p>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.openRate}%</p>
                  </div>
                  <Eye className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">↗ 5% from last month</p>
              </div>

              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.clickRate}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-green-600 mt-2">↗ 3% from last month</p>
              </div>
            </div>

            {/* Recent Messages Performance */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Campaign Performance</h3>
                <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-1 rounded border">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Drug Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Target</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date Sent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Vets Reached</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Open Rate</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Click Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMessages.map((message) => (
                      <tr key={message.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{message.drugName}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {message.targetSpecies.map(species => (
                              <span key={species} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {species}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.targetTags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                            {message.targetTags.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                +{message.targetTags.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {new Date(message.sentDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4 text-gray-900 font-medium">
                          {message.vetsReached}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            message.openRate > 70 
                              ? 'bg-green-100 text-green-800'
                              : message.openRate > 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {message.openRate}%
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            message.clickRate > 40 
                              ? 'bg-green-100 text-green-800'
                              : message.clickRate > 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {message.clickRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-lg border p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Compose New Message</h3>
              
              <form onSubmit={handleSendMessage} className="space-y-6">
                {/* Drug Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drug Name
                  </label>
                  <input
                    type="text"
                    value={newMessage.drugName}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, drugName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Librela (bedinvetmab)"
                    required
                  />
                </div>

                {/* Message Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Summary
                  </label>
                  <textarea
                    value={newMessage.summary}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, summary: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    placeholder="Brief description of the drug and its benefits..."
                    required
                  />
                </div>

                {/* Target Species */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Target Species
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableSpecies.map(species => (
                      <label key={species} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newMessage.targetSpecies.includes(species)}
                          onChange={() => toggleSpecies(species)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{species}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Target Specialties */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Target Veterinary Specialties
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableTags.map(tag => (
                      <label key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newMessage.targetTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guidelines/Dosing Link
                    </label>
                    <input
                      type="url"
                      value={newMessage.guidelinesLink}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, guidelinesLink: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="https://example.com/guidelines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PDF Report/Lab Data Link
                    </label>
                    <input
                      type="url"
                      value={newMessage.pdfReportLink}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, pdfReportLink: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      placeholder="https://example.com/report.pdf"
                    />
                  </div>
                </div>

                {/* Preview */}
                {newMessage.drugName && (
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Message Preview</h4>
                    <div className="bg-white border rounded p-4">
                      <h5 className="font-semibold text-gray-900 mb-1">{newMessage.drugName}</h5>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {newMessage.targetSpecies.map(species => (
                          <span key={species} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {species}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{newMessage.summary}</p>
                      <div className="flex gap-2 text-sm">
                        {newMessage.guidelinesLink && (
                          <span className="text-blue-600">📋 Guidelines</span>
                        )}
                        {newMessage.pdfReportLink && (
                          <span className="text-green-600">📄 Lab Report</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Estimated Reach */}
                {(newMessage.targetSpecies.length > 0 || newMessage.targetTags.length > 0) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Estimated Reach</span>
                    </div>
                    <p className="text-blue-800 mt-1">
                      Approximately <strong>{Math.round(Math.random() * 500 + 200)}</strong> veterinarians 
                      match your targeting criteria.
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newMessage.drugName || !newMessage.summary || newMessage.targetSpecies.length === 0}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Veterinarians</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}