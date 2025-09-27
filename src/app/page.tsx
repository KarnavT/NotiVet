import Link from 'next/link';
import { 
  Stethoscope, 
  Building, 
  ArrowRight, 
  Shield, 
  Database,
  TrendingUp,
  Heart,
  Bell,
  Search,
  BarChart3,
  MessageSquare,
  Star
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Logo size="md" variant="full" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            
            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Veterinary Drug Information
              <span className="block text-blue-600 mt-[10px]">
                Made Simple
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect pharmaceutical companies with veterinary professionals through 
              <span className="font-semibold text-gray-800"> targeted notifications </span>
              and comprehensive drug databases.
              <br />
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-12 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">918+</div>
                <div className="text-sm text-gray-600 font-medium">Drug Entries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">9</div>
                <div className="text-sm text-gray-600 font-medium">Species Covered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600 font-medium">Access</div>
              </div>
            </div>
          </div>

          {/* Login Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* HCP Login Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mx-auto mb-6">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Veterinary Professionals
                </h3>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Access targeted drug notifications, save favorites, and search our comprehensive 
                  veterinary drug database with dosing guidelines and safety information.
                </p>
                
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Bell className="w-4 h-4 text-blue-500 mr-3" />
                    <span>Targeted drug notifications</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-blue-500 mr-3" />
                    <span>Save favorite drugs</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Search className="w-4 h-4 text-blue-500 mr-3" />
                    <span>Advanced drug search</span>
                  </div>
                </div>
                
                <Link 
                  href="/hcp/login"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center group"
                >
                  <span>Login as HCP</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Pharma Login Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-shadow duration-300">
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl mx-auto mb-6">
                <Building className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Pharmaceutical Companies
                </h3>
                
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  Send targeted drug notifications to veterinarians based on species focus and 
                  specialties. View detailed analytics on message engagement and reach.
                </p>
                
                {/* Features List */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageSquare className="w-4 h-4 text-green-500 mr-3" />
                    <span>Targeted campaigns</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BarChart3 className="w-4 h-4 text-green-500 mr-3" />
                    <span>Engagement analytics</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-3" />
                    <span>Performance tracking</span>
                  </div>
                </div>
                
                <Link 
                  href="/pharma/login"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg transition-colors font-semibold flex items-center justify-center group"
                >
                  <span>Login as Pharma</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need in one platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From comprehensive drug databases to targeted notifications and detailed analytics
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Targeted Notifications</h4>
              <p className="text-gray-600 leading-relaxed">
                Pharmaceutical companies can send precisely targeted drug information to veterinarians 
                based on their species focus and specialties, ensuring relevant content reaches the right professionals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Database</h4>
              <p className="text-gray-600 leading-relaxed">
                Search through 918+ drugs by species, symptoms, and delivery methods. Access complete dosing guidelines, 
                contraindications, withdrawal times, and FARAD information in one centralized location.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h4>
              <p className="text-gray-600 leading-relaxed">
                Pharmaceutical companies can track detailed message engagement metrics, open rates, and 
                reach across different veterinary segments with comprehensive analytics and reporting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join the growing community of veterinary professionals and pharmaceutical companies 
            using NotiVet to stay connected and informed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/hcp/register"
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Register as HCP
            </Link>
            <Link 
              href="/pharma/register"
              className="bg-green-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
            >
              Register as Pharma
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Logo size="md" variant="full" className="text-blue-400" />
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Connecting pharmaceutical companies with veterinary professionals through 
              targeted drug information and comprehensive databases. Built by veterinarians, for veterinarians.
            </p>
            <div className="flex justify-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">918+</div>
                <div className="text-sm text-gray-400">Drugs</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">9</div>
                <div className="text-sm text-gray-400">Species</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">Access</div>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 NotiVet. Built for veterinary professionals and pharmaceutical partners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
