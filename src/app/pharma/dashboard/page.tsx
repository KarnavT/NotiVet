'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building, 
  Send, 
  BarChart3, 
  LogOut,
  Plus,
  Eye,
  TrendingUp,
  Users,
  MessageCircle,
  Calendar
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  content: string
  drugInfo?: string
  targetSpecies: string[]
  createdAt: string
  recipientCount: number
  activities: any[]
}

interface Analytics {
  overview: {
    totalRecipients: number
    totalDelivered: number
    totalOpened: number
    totalClicked: number
    openRate: number
    clickRate: number
    clickThroughRate: number
  }
  topNotifications: any[]
}

export default function PharmaDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [showNewNotification, setShowNewNotification] = useState(false)
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    drugInfo: '',
    targetSpecies: [] as string[],
    // Drug creation fields
    drugName: '',
    genericName: '',
    manufacturer: '',
    activeIngredient: '',
    deliveryMethods: [] as string[],
    description: '',
    dosage: '',
    contraindications: '',
    sideEffects: '',
    warnings: '',
    faradInfo: '',
    withdrawalTime: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const speciesOptions = [
    'CANINE', 'FELINE', 'EQUINE', 'BOVINE', 
    'OVINE', 'CAPRINE', 'PORCINE', 'AVIAN', 'EXOTIC'
  ]

  const deliveryMethodOptions = [
    'ORAL', 'INJECTABLE', 'TOPICAL', 'INHALATION', 'IMPLANT', 'TRANSDERMAL'
  ]

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (!userData || !token) {
      router.push('/pharma/login')
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
      // Load notifications
      const notificationsResponse = await fetch('/api/notifications', {
        headers: getAuthHeaders()
      })
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications || [])
      }

      // Load analytics
      const analyticsResponse = await fetch('/api/analytics', {
        headers: getAuthHeaders()
      })
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newNotification)
      })

      const data = await response.json()

      if (response.ok) {
        setShowNewNotification(false)
        setNewNotification({
          title: '',
          content: '',
          drugInfo: '',
          targetSpecies: [],
          // Drug creation fields
          drugName: '',
          genericName: '',
          manufacturer: '',
          activeIngredient: '',
          deliveryMethods: [],
          description: '',
          dosage: '',
          contraindications: '',
          sideEffects: '',
          warnings: '',
          faradInfo: '',
          withdrawalTime: ''
        })
        loadData() // Reload data
      } else {
        setError(data.error || 'Failed to send notification')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSpeciesChange = (species: string) => {
    setNewNotification(prev => ({
      ...prev,
      targetSpecies: prev.targetSpecies.includes(species)
        ? prev.targetSpecies.filter(s => s !== species)
        : [...prev.targetSpecies, species]
    }))
  }

  const handleDeliveryMethodChange = (method: string) => {
    setNewNotification(prev => ({
      ...prev,
      deliveryMethods: prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter(m => m !== method)
        : [...prev.deliveryMethods, method]
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-green-600">NotiVet</h1>
              <span className="ml-4 text-sm text-gray-500">Pharma Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user.profile?.companyName}
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
        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {user.profile?.companyName}!
          </h2>
          <p className="text-gray-600">
            Contact: {user.profile?.contactName} • {user.profile?.title || 'Representative'}
          </p>
          
          {analytics && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold text-green-600">{analytics.overview.totalRecipients}</div>
                <div className="text-gray-500">Total Reached</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold text-green-600">{analytics.overview.openRate}%</div>
                <div className="text-gray-500">Open Rate</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold text-green-600">{analytics.overview.clickRate}%</div>
                <div className="text-gray-500">Click Rate</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="font-semibold text-green-600">{notifications.length}</div>
                <div className="text-gray-500">Campaigns Sent</div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'notifications', name: 'Campaigns', icon: Send },
              { id: 'analytics', name: 'Analytics', icon: BarChart3 }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {name}
              </button>
            ))}
          </nav>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* New Notification Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Your Notification Campaigns</h3>
              <button
                onClick={() => setShowNewNotification(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </button>
            </div>

            {/* New Notification Form */}
            {showNewNotification && (
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Create New Drug Campaign</h4>
                <p className="text-sm text-gray-600 mb-6">Send targeted notifications to veterinary professionals about your new drug while adding it to the database.</p>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSendNotification} className="space-y-6">
                  {/* Campaign Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h5 className="text-md font-medium text-gray-900 mb-4">Campaign Information</h5>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Campaign Title *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.title}
                          onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                          placeholder="e.g., Introducing Rimadyl - Advanced Pain Management for Canines"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Message Content *
                        </label>
                        <textarea
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.content}
                          onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                          placeholder="Write your message to veterinary professionals about this new drug..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Target Species (Select at least one) *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {speciesOptions.map(species => (
                            <label key={species} className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2 text-green-600 focus:ring-green-500"
                                checked={newNotification.targetSpecies.includes(species)}
                                onChange={() => handleSpeciesChange(species)}
                              />
                              <span className="text-sm text-gray-900">{species.toLowerCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drug Information */}
                  <div>
                    <h5 className="text-md font-medium text-gray-900 mb-4">New Drug Information</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Drug Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.drugName}
                          onChange={(e) => setNewNotification({...newNotification, drugName: e.target.value})}
                          placeholder="e.g., Rimadyl"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Generic Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.genericName}
                          onChange={(e) => setNewNotification({...newNotification, genericName: e.target.value})}
                          placeholder="e.g., Carprofen"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Manufacturer *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.manufacturer}
                          onChange={(e) => setNewNotification({...newNotification, manufacturer: e.target.value})}
                          placeholder="e.g., Zoetis"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Active Ingredient *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.activeIngredient}
                          onChange={(e) => setNewNotification({...newNotification, activeIngredient: e.target.value})}
                          placeholder="e.g., Carprofen"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Delivery Methods (Select at least one) *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {deliveryMethodOptions.map(method => (
                          <label key={method} className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2 text-green-600 focus:ring-green-500"
                              checked={newNotification.deliveryMethods.includes(method)}
                              onChange={() => handleDeliveryMethodChange(method)}
                            />
                            <span className="text-sm text-gray-900">{method.toLowerCase()}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.description}
                          onChange={(e) => setNewNotification({...newNotification, description: e.target.value})}
                          placeholder="Brief description of the drug and its uses..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Dosage Information
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.dosage}
                          onChange={(e) => setNewNotification({...newNotification, dosage: e.target.value})}
                          placeholder="e.g., 2 mg/lb (4.4 mg/kg) twice daily"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Contraindications
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.contraindications}
                          onChange={(e) => setNewNotification({...newNotification, contraindications: e.target.value})}
                          placeholder="When not to use this drug..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Side Effects
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.sideEffects}
                          onChange={(e) => setNewNotification({...newNotification, sideEffects: e.target.value})}
                          placeholder="Potential side effects..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Warnings
                        </label>
                        <textarea
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.warnings}
                          onChange={(e) => setNewNotification({...newNotification, warnings: e.target.value})}
                          placeholder="Important warnings and precautions..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Withdrawal Time
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                          value={newNotification.withdrawalTime}
                          onChange={(e) => setNewNotification({...newNotification, withdrawalTime: e.target.value})}
                          placeholder="e.g., Cattle: 4 days milk, 12 hours meat"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        FARAD Information
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900"
                        value={newNotification.faradInfo}
                        onChange={(e) => setNewNotification({...newNotification, faradInfo: e.target.value})}
                        placeholder="FARAD compliance information..."
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading || newNotification.targetSpecies.length === 0 || newNotification.deliveryMethods.length === 0 || !newNotification.drugName || !newNotification.manufacturer || !newNotification.activeIngredient}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Creating Drug & Sending Campaign...' : 'Create Drug & Send Campaign'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewNotification(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sent Notifications */}
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{notification.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Target Species: {notification.targetSpecies.join(', ')}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center mt-1">
                        <Users className="w-4 h-4 mr-1" />
                        {notification.recipientCount} recipients
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-800 mb-4">{notification.content}</p>

                  {notification.drugInfo && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <strong className="text-green-900">Drug Info:</strong>
                      <p className="text-green-800 mt-1">{notification.drugInfo}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-700">
                      Opens: {notification.activities.filter(a => a.status === 'OPENED').length} • 
                      Clicks: {notification.activities.filter(a => a.status === 'CLICKED').length}
                    </div>
                    <button className="flex items-center text-green-600 hover:text-green-800">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  No campaigns sent yet. Create your first notification campaign to reach veterinary professionals.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.totalRecipients}</div>
                    <div className="text-sm text-gray-500">Total Recipients</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.totalOpened}</div>
                    <div className="text-sm text-gray-500">Total Opens</div>
                    <div className="text-xs text-green-600">{analytics.overview.openRate}% rate</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <MessageCircle className="w-8 h-8 text-purple-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.totalClicked}</div>
                    <div className="text-sm text-gray-500">Total Clicks</div>
                    <div className="text-xs text-purple-600">{analytics.overview.clickRate}% rate</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
                  <div>
                    <div className="text-2xl font-bold">{analytics.overview.clickThroughRate}%</div>
                    <div className="text-sm text-gray-500">Click-through Rate</div>
                    <div className="text-xs text-orange-600">clicks/opens</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Notifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold mb-4">Top Performing Campaigns</h4>
              
              {analytics.topNotifications.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topNotifications.slice(0, 5).map((notification, index) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-700">
                          {notification.recipients} recipients • {notification.targetSpecies.join(', ')}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold text-green-600">{notification.openRate.toFixed(1)}% opens</div>
                        <div className="text-gray-500">{notification.clickRate.toFixed(1)}% clicks</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No campaigns yet. Send your first campaign to see performance data.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}