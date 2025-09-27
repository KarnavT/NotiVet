'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Stethoscope, 
  Bell, 
  BookOpen, 
  LogOut,
  Filter,
  Heart,
  Eye,
  Clock,
  Building,
  X,
  Check
} from 'lucide-react'

interface Drug {
  id: string
  name: string
  genericName?: string
  manufacturer: string
  activeIngredient: string
  species: string[]
  deliveryMethods: string[]
  description?: string
  dosage?: string
  contraindications?: string
  sideEffects?: string
  warnings?: string
  faradInfo?: string
  withdrawalTime?: string
}

interface Notification {
  id: string
  title: string
  content: string
  drugInfo?: string
  targetSpecies: string[]
  createdAt: string
  sender: {
    companyName: string
    contactName: string
  }
  activities: any[]
}

export default function HCPDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('drugs')
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [totalDrugsCount, setTotalDrugsCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [savedDrugs, setSavedDrugs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [removingDrug, setRemovingDrug] = useState<string | null>(null)
  const [savedDrugIds, setSavedDrugIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      router.push('/hcp/login')
      return
    }
    
    setUser(JSON.parse(userData))
    loadData()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadData = async () => {
    try {
      // Load drugs
      const drugsResponse = await fetch('/api/drugs', {
        headers: getAuthHeaders()
      })
      if (drugsResponse.ok) {
        const drugsData = await drugsResponse.json()
        setDrugs(drugsData.drugs || [])
        setTotalDrugsCount(drugsData.totalDrugsAvailable || 0)
      }

      // Load notifications
      const notificationsResponse = await fetch('/api/notifications', {
        headers: getAuthHeaders()
      })
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications || [])
      }

      // Load saved drugs
      const savedResponse = await fetch('/api/drugs/saved', {
        headers: getAuthHeaders()
      })
      if (savedResponse.ok) {
        const savedData = await savedResponse.json()
        const savedDrugsList = savedData.savedDrugs || []
        setSavedDrugs(savedDrugsList)
        // Update the set of saved drug IDs
        const drugIds = new Set<string>(savedDrugsList.map((saved: any) => saved.drug.id as string))
        setSavedDrugIds(drugIds)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/drugs?q=${encodeURIComponent(searchQuery)}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setDrugs(data.drugs || [])
        // Update total count if it's provided (it should be in every API response now)
        if (data.totalDrugsAvailable !== undefined) {
          setTotalDrugsCount(data.totalDrugsAvailable)
        }
      }
    } catch (error) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const saveDrug = async (drugId: string) => {
    try {
      const response = await fetch('/api/drugs/saved', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ drugId })
      })

      if (response.ok) {
        // Add to saved drugs set immediately for instant UI feedback
        setSavedDrugIds(prev => {
          const newSet = new Set(prev)
          newSet.add(drugId)
          return newSet
        })
        
        // Reload data to sync with backend
        loadData()
      }
    } catch (error) {
      console.error('Error saving drug:', error)
      // Remove from saved drugs set if there was an error
      setSavedDrugIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(drugId)
        return newSet
      })
    }
  }

  const unsaveDrug = async (savedDrugId: string) => {
    setRemovingDrug(savedDrugId)
    
    // Store the original state in case we need to revert
    const originalSavedDrugs = savedDrugs
    
    // Find the drug ID from the saved drug to remove from the set
    const savedDrug = savedDrugs.find(saved => saved.id === savedDrugId)
    const drugIdToRemove = savedDrug?.drug?.id
    
    try {
      
      // Optimistically update UI by removing the drug from the list immediately
      setSavedDrugs(prevSaved => prevSaved.filter(saved => saved.id !== savedDrugId))
      
      // Also remove from saved drug IDs set if we found the drug ID
      if (drugIdToRemove) {
        setSavedDrugIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(drugIdToRemove)
          return newSet
        })
      }
      
      const response = await fetch(`/api/drugs/saved/${savedDrugId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        // Success - the optimistic update was correct
        console.log('Drug successfully removed from saved list')
        setError('') // Clear any previous errors
      } else {
        // Error - revert the optimistic update
        console.error('Failed to remove drug from saved list, status:', response.status)
        setSavedDrugs(originalSavedDrugs)
        // Also restore to saved drug IDs set
        if (drugIdToRemove) {
          setSavedDrugIds(prev => {
            const newSet = new Set(prev)
            newSet.add(drugIdToRemove)
            return newSet
          })
        }
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setError(errorData.error || 'Failed to remove drug')
      }
    } catch (error) {
      console.error('Error removing saved drug:', error)
      // Revert the optimistic update
      setSavedDrugs(originalSavedDrugs)
      // Also restore to saved drug IDs set
      if (drugIdToRemove) {
        setSavedDrugIds(prev => {
          const newSet = new Set(prev)
          newSet.add(drugIdToRemove)
          return newSet
        })
      }
      setError('Network error. Please try again.')
    } finally {
      setRemovingDrug(null)
      // Clear error after a few seconds
      setTimeout(() => setError(''), 5000)
    }
  }

  const trackNotification = async (notificationId: string, action: 'opened' | 'clicked') => {
    try {
      await fetch(`/api/notifications/${notificationId}/track`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      })
    } catch (error) {
      console.error('Error tracking notification:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Stethoscope className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-blue-600">NotiVet</h1>
              <span className="ml-4 text-sm text-gray-500">HCP Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Dr. {user.profile?.firstName} {user.profile?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, Dr. {user.profile?.firstName}!
          </h2>
          <p className="text-gray-700">
            Clinic: {user.profile?.clinicName || 'Not specified'} • 
            Specialties: {(() => {
              try {
                return user.profile?.specialties ? JSON.parse(user.profile.specialties).join(', ') : 'Not specified';
              } catch {
                return user.profile?.specialties || 'Not specified';
              }
            })()}
          </p>
          <div className="mt-4 flex space-x-4 text-sm">
            <div className="bg-white rounded-lg p-3">
              <div className="font-semibold text-blue-600">{notifications.length}</div>
              <div className="text-gray-500">New Notifications</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="font-semibold text-blue-600">{savedDrugs.length}</div>
              <div className="text-gray-500">Saved Drugs</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="font-semibold text-blue-600">{totalDrugsCount.toLocaleString()}</div>
              <div className="text-gray-500">Drugs Available</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'drugs', name: 'Drug Database', icon: BookOpen },
              { id: 'notifications', name: 'Notifications', icon: Bell },
              { id: 'saved', name: 'Saved Drugs', icon: Heart }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
              </button>
            ))}
          </nav>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Drug Database Tab */}
        {activeTab === 'drugs' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search drugs by name, active ingredient, or manufacturer..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Drug Results */}
            <div className="grid gap-6">
              {drugs.map((drug) => (
                <div key={drug.id} className="group bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 p-6">
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
                      onClick={() => !savedDrugIds.has(drug.id) && saveDrug(drug.id)}
                      disabled={savedDrugIds.has(drug.id)}
                      className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 shadow-md ${
                        savedDrugIds.has(drug.id)
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 hover:shadow-lg'
                      }`}
                    >
                      {savedDrugIds.has(drug.id) ? (
                        <Check className="w-4 h-4 mr-2 transition-all duration-300 scale-110" />
                      ) : (
                        <Heart className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
                      )}
                      {savedDrugIds.has(drug.id) ? 'Saved!' : 'Save'}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        Species: {(drug as any).species?.join ? (drug as any).species.join(', ') : (drug as any).species}
                      </span>
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

                  {((drug as any).usage || drug.description) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-900">Description:</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{(drug as any).usage || drug.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Building className="w-4 h-4 mr-1" />
                      {notification.sender.companyName} • {notification.sender.contactName}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <p className="text-gray-800 mb-4">{notification.content}</p>
                
                {notification.drugInfo && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <strong className="text-blue-900">Drug Information:</strong>
                    <p className="text-blue-800 mt-1">{notification.drugInfo}</p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Target Species: {notification.targetSpecies.join(', ')}
                  </div>
                  <button
                    onClick={() => trackNotification(notification.id, 'clicked')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Mark as Read
                  </button>
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No notifications yet. Check back later for updates from pharmaceutical companies.
              </div>
            )}
          </div>
        )}

        {/* Saved Drugs Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedDrugs.map((saved) => (
              <div key={saved.id} className="group bg-white rounded-xl border-2 border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Heart className="w-5 h-5 text-emerald-500 mr-2 fill-current" />
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-900 transition-colors duration-200">{saved.drug.name}</h3>
                    </div>
                    {saved.drug.genericName && (
                      <p className="text-gray-600 font-medium">Generic: <span className="text-gray-700">{saved.drug.genericName}</span></p>
                    )}
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                        <span className="font-medium text-gray-600">Manufacturer:</span> {saved.drug.manufacturer}
                      </div>
                      {saved.drug.activeIngredient && (
                        <div className="flex items-start text-sm text-gray-500">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                          <div>
                            <span className="font-medium text-gray-600">Active Ingredient:</span> {saved.drug.activeIngredient}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        Saved {new Date(saved.savedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => unsaveDrug(saved.id)}
                    disabled={removingDrug === saved.id}
                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                      removingDrug === saved.id 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                    }`}
                    title="Remove from saved drugs"
                  >
                    <X className="w-4 h-4 mr-2 transition-transform duration-200 hover:rotate-90" />
                    {removingDrug === saved.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
                
                {/* Drug Details */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                      Species: {(() => {
                        try {
                          return saved.drug.species ? JSON.parse(saved.drug.species).join(', ') : 'Not specified';
                        } catch {
                          return saved.drug.species || 'Not specified';
                        }
                      })()}
                    </span>
                  </div>
                  
                  {saved.drug.dosage && (
                    <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-emerald-400">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Dosage</p>
                          <p className="text-sm text-gray-700">{saved.drug.dosage}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {saved.drug.withdrawalTime && (
                    <div className="bg-amber-50 rounded-lg p-3 border-l-4 border-amber-400">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">Withdrawal Time</p>
                          <p className="text-sm text-gray-700">{saved.drug.withdrawalTime}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {((saved.drug as any).usage || saved.drug.description) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-900">Description:</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{(saved.drug as any).usage || saved.drug.description}</p>
                  </div>
                )}
              </div>
            ))}
            
            {savedDrugs.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No saved drugs yet. Start saving drugs from the Drug Database for quick reference.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}