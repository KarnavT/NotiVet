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
  X
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [savedDrugs, setSavedDrugs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [removingDrug, setRemovingDrug] = useState<string | null>(null)

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
        setSavedDrugs(savedData.savedDrugs || [])
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
        loadData() // Reload to update saved drugs
      }
    } catch (error) {
      console.error('Error saving drug:', error)
    }
  }

  const unsaveDrug = async (savedDrugId: string) => {
    setRemovingDrug(savedDrugId)
    try {
      // Optimistically update UI by removing the drug from the list immediately
      setSavedDrugs(prevSaved => prevSaved.filter(saved => saved.id !== savedDrugId))
      
      const response = await fetch(`/api/drugs/saved/${savedDrugId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        // Success - the optimistic update was correct
        console.log('Drug successfully removed from saved list')
      } else {
        // Error - revert the optimistic update by reloading data
        console.error('Failed to remove drug from saved list')
        loadData() // Reload to get correct state
      }
    } catch (error) {
      console.error('Error removing saved drug:', error)
      // Revert the optimistic update by reloading data
      loadData()
    } finally {
      setRemovingDrug(null)
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
              <div className="font-semibold text-blue-600">{drugs.length}</div>
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

        {/* Drug Database Tab */}
        {activeTab === 'drugs' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drugs by name, active ingredient, or manufacturer..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Drug Results */}
            <div className="grid gap-6">
              {drugs.map((drug) => (
                <div key={drug.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{drug.name}</h3>
                      {drug.genericName && (
                        <p className="text-gray-700">Generic: {drug.genericName}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {drug.manufacturer} • {drug.activeIngredient}
                      </p>
                    </div>
                    <button
                      onClick={() => saveDrug(drug.id)}
                      className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      Save
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-800">
                    <div>
                      <strong className="text-gray-900">Species:</strong> {drug.species.join(', ')}
                    </div>
                    <div>
                      <strong className="text-gray-900">Delivery:</strong> {drug.deliveryMethods.join(', ')}
                    </div>
                    {drug.dosage && (
                      <div>
                        <strong className="text-gray-900">Dosage:</strong> {drug.dosage}
                      </div>
                    )}
                    {drug.withdrawalTime && (
                      <div>
                        <strong className="text-gray-900">Withdrawal:</strong> {drug.withdrawalTime}
                      </div>
                    )}
                  </div>

                  {drug.description && (
                    <p className="mt-4 text-gray-800">{drug.description}</p>
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
              <div key={saved.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{saved.drug.name}</h3>
                    {saved.drug.genericName && (
                      <p className="text-gray-700">Generic: {saved.drug.genericName}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {saved.drug.manufacturer} • Saved on {new Date(saved.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => unsaveDrug(saved.id)}
                    disabled={removingDrug === saved.id}
                    className={`flex items-center px-3 py-1 rounded-lg transition-colors ${
                      removingDrug === saved.id 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                    title="Remove from saved drugs"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {removingDrug === saved.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
                
                {/* Drug Details */}
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-800 mb-4">
                  <div>
                    <strong className="text-gray-900">Species:</strong> {(() => {
                      try {
                        return saved.drug.species ? JSON.parse(saved.drug.species).join(', ') : 'Not specified';
                      } catch {
                        return saved.drug.species || 'Not specified';
                      }
                    })()}
                  </div>
                  <div>
                    <strong className="text-gray-900">Delivery:</strong> {(() => {
                      try {
                        return saved.drug.deliveryMethods ? JSON.parse(saved.drug.deliveryMethods).join(', ') : 'Not specified';
                      } catch {
                        return saved.drug.deliveryMethods || 'Not specified';
                      }
                    })()}
                  </div>
                  {saved.drug.dosage && (
                    <div>
                      <strong className="text-gray-900">Dosage:</strong> {saved.drug.dosage}
                    </div>
                  )}
                  {saved.drug.withdrawalTime && (
                    <div>
                      <strong className="text-gray-900">Withdrawal:</strong> {saved.drug.withdrawalTime}
                    </div>
                  )}
                </div>
                
                {saved.drug.description && (
                  <p className="text-gray-800">{saved.drug.description}</p>
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