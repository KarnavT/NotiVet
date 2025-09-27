import Link from 'next/link';
import { Stethoscope, Building, ArrowRight, Shield, Zap, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">NotiVet</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/hcp/login" className="text-gray-700 hover:text-blue-600">
                HCP Login
              </Link>
              <Link href="/pharma/login" className="text-gray-700 hover:text-green-600">
                Pharma Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Veterinary Drug Information
            <span className="block text-blue-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect pharmaceutical companies with veterinary professionals through targeted 
            notifications and comprehensive drug databases. Like Impiricus, but for veterinarians.
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* HCP Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Veterinary Professionals
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Access targeted drug notifications, save favorites, and search our comprehensive 
              veterinary drug database with dosing guidelines and safety information.
            </p>
            <Link 
              href="/hcp/login"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center group"
            >
              Login as HCP
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Pharma Login Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6">
              <Building className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Pharmaceutical Companies
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Send targeted drug notifications to veterinarians based on species focus and 
              specialties. View detailed analytics on message engagement and reach.
            </p>
            <Link 
              href="/pharma/login"
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center group"
            >
              Login as Pharma
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Targeted Notifications</h4>
            <p className="text-gray-600">
              Pharmaceutical companies can send targeted drug information to veterinarians 
              based on species focus and specialties.
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Database</h4>
            <p className="text-gray-600">
              Search drugs by species, symptoms, and delivery methods. Access dosing guidelines, 
              contraindications, and FARAD information.
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h4>
            <p className="text-gray-600">
              Pharmaceutical companies can track message engagement, open rates, and 
              reach across different veterinary segments.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">NotiVet</h3>
            <p className="text-gray-400 mb-4">
              Connecting pharmaceutical companies with veterinary professionals through 
              targeted drug information and comprehensive databases.
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 NotiVet. Built for veterinary professionals and pharmaceutical partners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}