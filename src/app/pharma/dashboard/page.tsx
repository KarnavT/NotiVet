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
    targetSpecies: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const speciesOptions = [
    'CANINE', 'FELINE', 'EQUINE', 'BOVINE', 
    'OVINE', 'CAPRINE', 'PORCINE', 'AVIAN', 'EXOTIC'
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
          targetSpecies: []
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
                <h4 className="text-lg font-semibold mb-4">Create New Notification Campaign</h4>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                      placeholder="e.g., New Pain Management Solution for Canines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message Content
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      value={newNotification.content}
                      onChange={(e) => setNewNotification({...newNotification, content: e.target.value})}
                      placeholder="Write your message to veterinary professionals..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Drug Information (Optional)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      value={newNotification.drugInfo}
                      onChange={(e) => setNewNotification({...newNotification, drugInfo: e.target.value})}
                      placeholder="Additional drug details, dosage information, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Species (Select at least one)
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
                          <span className="text-sm">{species.toLowerCase()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading || newNotification.targetSpecies.length === 0}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Campaign'}
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
                    <div className="text-right text-sm text-gray-500">
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

                  <p className="text-gray-700 mb-4">{notification.content}</p>

                  {notification.drugInfo && (
                    <div className="bg-green-50 rounded-lg p-3 mb-4">
                      <strong className="text-green-900">Drug Info:</strong>
                      <p className="text-green-800 mt-1">{notification.drugInfo}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
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
                <div className="text-center py-8 text-gray-500">
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
                        <div className="text-sm text-gray-500">
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
                <p className="text-gray-500">No campaigns yet. Send your first campaign to see performance data.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}