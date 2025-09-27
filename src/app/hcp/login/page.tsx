'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Building2, Tag } from 'lucide-react';

export default function HCPLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    clinic: '',
    email: '',
    password: '',
    species: [] as string[],
    tags: [] as string[],
    notifications: {
      email: false,
      inApp: false
    }
  });

  const speciesOptions = ['Dogs', 'Cats', 'Horses', 'Poultry', 'Exotic Animals', 'Large Animals'];
  const tagOptions = ['Anesthesiology', 'Dermatology', 'Avians', 'Large Animal', 'Exotics', 'Internal Medicine', 'Surgery', 'Emergency Care'];

  const handleSpeciesChange = (species: string) => {
    setFormData(prev => ({
      ...prev,
      species: prev.species.includes(species)
        ? prev.species.filter(s => s !== species)
        : [...prev.species, species]
    }));
  };

  const handleTagChange = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to HCP dashboard
    window.location.href = '/hcp/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NotiVet</h1>
          <p className="text-gray-600">Veterinary Professional Portal</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Dr. John Smith"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="inline w-4 h-4 mr-2" />
                  Clinic/Hospital
                </label>
                <input
                  type="text"
                  value={formData.clinic}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinic: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Animal Care Clinic"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="doctor@clinic.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline w-4 h-4 mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Species Focus (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {speciesOptions.map((species) => (
                    <label key={species} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.species.includes(species)}
                        onChange={() => handleSpeciesChange(species)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{species}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Tag className="inline w-4 h-4 mr-2" />
                  Specialties (Select all that apply)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tagOptions.map((tag) => (
                    <label key={tag} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.tags.includes(tag)}
                        onChange={() => handleTagChange(tag)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Notification Preferences
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Email notifications</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.notifications.inApp}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, inApp: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">In-app notifications</span>
                  </label>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/pharma/login" className="text-blue-600 hover:text-blue-800 text-sm">
            Are you from a pharmaceutical company? Login here →
          </Link>
        </div>
      </div>
    </div>
  );
}