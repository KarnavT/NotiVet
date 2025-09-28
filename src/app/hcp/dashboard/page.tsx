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
  MessageSquare,
  Check,
} from 'lucide-react'
import DrugCard from '@/components/DrugCard'
import Logo from '@/components/Logo'
import SpeciesIcons from '@/components/SpeciesIcons'
import ScoobyAI from '@/components/ScoobyAI'

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
  drugId?: string
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
  isRead: boolean
}

export default function HCPDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('drugs')
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [totalDrugsCount, setTotalDrugsCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [savedDrugs, setSavedDrugs] = useState<any[]>([])
  const [filteredSavedDrugs, setFilteredSavedDrugs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [savedSearchQuery, setSavedSearchQuery] = useState('')
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [removingDrug, setRemovingDrug] = useState<string | null>(null)
  const [savedDrugIds, setSavedDrugIds] = useState<Set<string>>(new Set())
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

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

  // Respect deep links like ?tab=notifications&highlight=<id>
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab && ['drugs','notifications','saved','chatbot'].includes(tab)) {
        setActiveTab(tab)
      }
      const highlight = params.get('highlight')
      if (highlight) {
        // Scroll into view after notifications load
        setTimeout(() => {
          const el = document.getElementById(`notif-${highlight}`)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 600)
      }
    } catch {}
  }, [])

  // Filter saved drugs when search query changes
  useEffect(() => {
    if (!savedSearchQuery.trim()) {
      setFilteredSavedDrugs(savedDrugs)
    } else {
      const query = savedSearchQuery.toLowerCase()
      const filtered = savedDrugs.filter(saved => {
        const drug = saved.drug
        return (
          drug.name.toLowerCase().includes(query) ||
          drug.genericName?.toLowerCase().includes(query) ||
          drug.manufacturer.toLowerCase().includes(query) ||
          drug.activeIngredient.toLowerCase().includes(query) ||
          (drug.description && drug.description.toLowerCase().includes(query)) ||
          ((drug as any).usage && (drug as any).usage.toLowerCase().includes(query))
        )
      })
      setFilteredSavedDrugs(filtered)
    }
  }, [savedDrugs, savedSearchQuery])

  // Real-time search for drug database with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery)
      } else {
        loadData() // Load all drugs when search is cleared
      }
    }, 300) // 300ms debounce delay

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

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
        setFilteredSavedDrugs(savedDrugsList)
        // Update the set of saved drug IDs
        const drugIds = new Set<string>(savedDrugsList.map((saved: any) => saved.drug.id as string))
        setSavedDrugIds(drugIds)
      }

      // Load unread notification count
      const countResponse = await fetch('/api/notifications/count', {
        headers: getAuthHeaders()
      })
      if (countResponse.ok) {
        const countData = await countResponse.json()
        setUnreadNotificationCount(countData.unread || 0)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      loadData()
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/drugs?q=${encodeURIComponent(query)}`, {
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

  const handleChatMessage = async (message: string) => {
    setAiAssistantLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ query: message })
      })
      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'AI Assistant is unavailable right now. Please try again later.')
      }
      const data = await response.json()
      return {
        answer: data.answer || '',
        sources: data.sources || [],
        matchedDrugs: Array.isArray(data.matchedDrugs) ? data.matchedDrugs : []
      }
    } catch (error) {
      throw error
    } finally {
      setAiAssistantLoading(false)
    }
  }

  const trackNotification = async (notificationId: string, action: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/track`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      })
      
      // If marking as opened, update the unread count
      if (action === 'OPENED' && unreadNotificationCount > 0) {
        setUnreadNotificationCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to track notification:', error)
    }
  }

  const markAsUnread = async (notificationId: string) => {
    try {
      // We'll create a new API endpoint to handle marking as unread
      await fetch(`/api/notifications/${notificationId}/unread`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      
      // Update local state to mark as unread
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: false } : n
      ))
      
      // Increment unread count
      setUnreadNotificationCount(prev => prev + 1)
    } catch (error) {
      console.error('Failed to mark as unread:', error)
    }
  }

  const saveDrugFromNotification = async (drugId: string, notificationId: string) => {
    try {
      // Track the click action first
      await trackNotification(notificationId, 'CLICKED')
      
      // Then save the drug using the existing saveDrug logic
      await saveDrug(drugId)
    } catch (error) {
      console.error('Failed to save drug from notification:', error)
    }
  }

  const saveDrug = async (drugId: string) => {
    // Optimistically mark as saved for instant feedback
    setSavedDrugIds(prev => {
      const newSet = new Set(prev)
      newSet.add(String(drugId))
      return newSet
    })

    try {
      const response = await fetch('/api/drugs/saved', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ drugId: String(drugId) })
      })

      if (response.ok) {
        // Sync with backend to update counts and saved list
        await loadData()
        return
      }

      // Handle known "already saved" response as success
      const errJson = await response.json().catch(() => ({} as any))
      const alreadySaved = response.status === 400 && (errJson?.error || '').toLowerCase().includes('already')
      if (alreadySaved) {
        await loadData()
        return
      }

      // If other error, revert optimistic change
      setSavedDrugIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(String(drugId))
        return newSet
      })
      setError(errJson?.error || 'Failed to save drug')
    } catch (error) {
      console.error('Error saving drug:', error)
      // Revert optimistic update on network error
      setSavedDrugIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(String(drugId))
        return newSet
      })
      setError('Network error. Please try again.')
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
              <Logo size="md" variant="full" />
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
              <div className="font-semibold text-blue-600">{unreadNotificationCount}</div>
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
              { id: 'notifications', name: 'Notifications', icon: Bell, count: unreadNotificationCount },
              { id: 'saved', name: 'Saved Drugs', icon: Heart },
              { id: 'chatbot', name: 'AI Assistant', icon: MessageSquare }
            ].map(({ id, name, icon: Icon, count = 0 }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
                {id === 'notifications' && count !== undefined && count > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {count}
                  </span>
                )}
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
            {/* Search Bar for Drug Database */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search drugs by name, active ingredient, or manufacturer..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-blue-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {loading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Results Info */}
            {searchQuery && (
              <div className="text-sm text-gray-600">
                {drugs.length > 0 
                  ? `Found ${drugs.length} drug${drugs.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                  : `No drugs found matching "${searchQuery}"`
                }
              </div>
            )}

            {/* Drug Results */}
            <div className="grid gap-6">
              {drugs.map((drug) => (
                <DrugCard
                  key={drug.id}
                  drug={drug as any}
                  saved={savedDrugIds.has(drug.id)}
                  onSave={() => !savedDrugIds.has(drug.id) && saveDrug(drug.id)}
                  context="database"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* AI Assistant Tab */}
        {activeTab === 'chatbot' && (
          <div className="flex justify-center py-6">
            <ScoobyAI 
              onSendMessage={handleChatMessage}
              isLoading={aiAssistantLoading}
              onSaveDrug={saveDrug}
              savedDrugIds={savedDrugIds}
            />
          </div>
        )}
        
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Drug Notifications</h3>
              <div className="text-sm text-gray-600">
                {unreadNotificationCount > 0 ? (
                  <span className="text-blue-600 font-medium">
                    {unreadNotificationCount} unread
                  </span>
                ) : (
                  <span>All caught up!</span>
                )}
                <span className="mx-2">•</span>
                {notifications.length} total
              </div>
            </div>
            
            {notifications.map((notification) => {
              const drugName = notification.drugInfo?.includes('New Drug:') 
                ? notification.drugInfo.split('New Drug: ')[1]?.split(' -')[0] 
                : 'Unknown Drug'
              
              return (
                <div id={`notif-${notification.id}`} key={notification.id} className={`bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 p-6 ${
                  !notification.isRead 
                    ? 'border-blue-300 ring-2 ring-blue-100 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {!notification.isRead ? (
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse" title="Unread notification"></div>
                        ) : (
                          <div className="w-3 h-3 bg-gray-300 rounded-full mr-3" title="Read notification"></div>
                        )}
                        <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        {notification.sender.companyName} • {notification.sender.contactName}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {notification.drugId ? (
                        <button
                          onClick={() => !savedDrugIds.has(notification.drugId!) && saveDrugFromNotification(notification.drugId!, notification.id)}
                          disabled={savedDrugIds.has(notification.drugId!)}
                          className={`flex items-center px-4 py-2 rounded-lg transition-all duration-300 shadow-md ${
                            savedDrugIds.has(notification.drugId!)
                              ? 'bg-green-600 text-white cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105 hover:shadow-lg'
                          }`}
                          title={savedDrugIds.has(notification.drugId!) ? 'Drug already saved' : 'Save this drug to your collection'}
                        >
                          {savedDrugIds.has(notification.drugId!) ? (
                            <Check className="w-4 h-4 mr-2 transition-all duration-300 scale-110" />
                          ) : (
                            <Heart className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
                          )}
                          {savedDrugIds.has(notification.drugId!) ? 'Saved!' : 'Save Drug'}
                        </button>
                      ) : (
                        <div className="flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-500">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          <span>Info Only</span>
                        </div>
                      )}
                      {!notification.isRead ? (
                        <button
                          onClick={() => {
                            trackNotification(notification.id, 'OPENED')
                            // Update local state to mark as read
                            setNotifications(prev => prev.map(n => 
                              n.id === notification.id ? { ...n, isRead: true } : n
                            ))
                          }}
                          className="flex items-center px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Mark Read
                        </button>
                      ) : (
                        <>
                          <div className="flex items-center px-3 py-2 text-gray-500 text-sm">
                            <Check className="w-4 h-4 mr-1" />
                            Read
                          </div>
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="flex items-center px-3 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Bell className="w-4 h-4 mr-1" />
                            Mark Unread
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-800 leading-relaxed">{notification.content}</p>
                  </div>
                  
                  {notification.drugInfo && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4 border-l-4 border-green-400">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <div>
                          <strong className="text-green-900 block mb-1">New Drug Information:</strong>
                          <p className="text-green-800">{notification.drugInfo}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Target Species:</span>
                        <SpeciesIcons 
                          species={notification.targetSpecies} 
                          size="sm" 
                          className="flex-wrap"
                        />
                        <span className="text-xs text-gray-500">({notification.targetSpecies.join(', ')})</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Click notifications to track engagement
                    </div>
                  </div>
                </div>
              )
            })}
            
            {notifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-600">
                  When pharmaceutical companies announce new drugs relevant to your specialties, you'll see them here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Saved Drugs Tab */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            {/* Search Bar for Saved Drugs */}
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
                <input
                  type="text"
                  placeholder="Search your saved drugs by name, active ingredient, or manufacturer..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-emerald-100 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-300 transition-all duration-200 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                  value={savedSearchQuery}
                  onChange={(e) => setSavedSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
                />
              </div>
              {savedSearchQuery && (
                <button
                  onClick={() => setSavedSearchQuery('')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Results Info */}
            {savedSearchQuery && (
              <div className="text-sm text-gray-600">
                {filteredSavedDrugs.length > 0 
                  ? `Found ${filteredSavedDrugs.length} saved drug${filteredSavedDrugs.length !== 1 ? 's' : ''} matching "${savedSearchQuery}"`
                  : `No saved drugs found matching "${savedSearchQuery}"`
                }
              </div>
            )}
            
            {/* Drug Cards */}
            {filteredSavedDrugs.map((saved) => (
              <DrugCard
                key={saved.id}
                drug={saved.drug as any}
                saved={true}
                onSave={() => {}}
                onUnsave={() => unsaveDrug(saved.id)}
                context="saved"
                isRemoving={removingDrug === saved.id}
              />
            ))}
            
            {savedDrugs.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No saved drugs yet. Start saving drugs from the Drug Database for quick reference.
              </div>
            )}
            
            {savedDrugs.length > 0 && filteredSavedDrugs.length === 0 && savedSearchQuery && (
              <div className="text-center py-8 text-gray-600">
                No saved drugs match your search criteria. Try a different search term.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}