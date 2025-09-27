'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  X, 
  ExternalLink, 
  Star,
  Heart,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { mockDrugs, speciesFilters, indicationFilters, routeFilters, Drug } from '@/data/mockData';

export default function DrugDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
  const [selectedIndications, setSelectedIndications] = useState<string[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [favoritesList, setFavoritesList] = useState<string[]>(['1', '4']);

  const toggleFilter = (filterType: 'species' | 'indications' | 'routes', value: string) => {
    const setters = {
      species: setSelectedSpecies,
      indications: setSelectedIndications,
      routes: setSelectedRoutes
    };
    
    const getters = {
      species: selectedSpecies,
      indications: selectedIndications,
      routes: selectedRoutes
    };

    const currentValues = getters[filterType];
    const setter = setters[filterType];

    if (currentValues.includes(value)) {
      setter(currentValues.filter(item => item !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedSpecies([]);
    setSelectedIndications([]);
    setSelectedRoutes([]);
    setSearchTerm('');
  };

  const toggleFavorite = (drugId: string) => {
    setFavoritesList(prev => 
      prev.includes(drugId) 
        ? prev.filter(id => id !== drugId)
        : [...prev, drugId]
    );
  };

  const filteredAndSortedDrugs = useMemo(() => {
    let filtered = mockDrugs.filter(drug => {
      // Search term filter
      const searchMatch = !searchTerm || 
        drug.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drug.indications.some(indication => indication.toLowerCase().includes(searchTerm.toLowerCase()));

      // Species filter
      const speciesMatch = selectedSpecies.length === 0 || 
        selectedSpecies.some(species => drug.species.includes(species));

      // Indication filter
      const indicationMatch = selectedIndications.length === 0 || 
        selectedIndications.some(indication => 
          drug.indications.some(drugIndication => drugIndication.includes(indication))
        );

      // Route filter
      const routeMatch = selectedRoutes.length === 0 || 
        selectedRoutes.some(route => 
          drug.routes.some(drugRoute => drugRoute.includes(route))
        );

      return searchMatch && speciesMatch && indicationMatch && routeMatch;
    });

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.brandName.localeCompare(b.brandName);
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedSpecies, selectedIndications, selectedRoutes, sortBy]);

  const FilterSection = ({ 
    title, 
    options, 
    selectedValues, 
    filterType 
  }: { 
    title: string; 
    options: string[]; 
    selectedValues: string[]; 
    filterType: 'species' | 'indications' | 'routes';
  }) => (
    <div className="mb-6">
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={() => toggleFilter(filterType, option)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
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
              <Link href="/hcp/dashboard" className="text-2xl font-bold text-blue-600">
                NotiVet
              </Link>
              <span className="ml-3 text-gray-500">Drug Database</span>
            </div>
            
            <Link 
              href="/hcp/dashboard"
              className="text-gray-700 hover:text-blue-600"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Drug Lookup Database</h1>
          <p className="text-gray-600">
            Search and filter veterinary drugs by species, indications, and delivery methods.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg border p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Drug name, indication..."
                  />
                </div>
              </div>

              {/* Species Filter */}
              <FilterSection
                title="Species"
                options={speciesFilters}
                selectedValues={selectedSpecies}
                filterType="species"
              />

              {/* Indications Filter */}
              <FilterSection
                title="Indications"
                options={indicationFilters}
                selectedValues={selectedIndications}
                filterType="indications"
              />

              {/* Routes Filter */}
              <FilterSection
                title="Routes of Administration"
                options={routeFilters}
                selectedValues={selectedRoutes}
                filterType="routes"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredAndSortedDrugs.length} drugs found
                </h2>
                {(selectedSpecies.length > 0 || selectedIndications.length > 0 || selectedRoutes.length > 0 || searchTerm) && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm('')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedSpecies.map(species => (
                      <span key={species} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {species}
                        <button
                          onClick={() => toggleFilter('species', species)}
                          className="ml-1 text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {selectedIndications.map(indication => (
                      <span key={indication} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {indication}
                        <button
                          onClick={() => toggleFilter('indications', indication)}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {selectedRoutes.map(route => (
                      <span key={route} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {route}
                        <button
                          onClick={() => toggleFilter('routes', route)}
                          className="ml-1 text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort Options */}
              <div className="mt-4 sm:mt-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Sort by Name (A-Z)</option>
                  <option value="dateAdded">Sort by Date Added</option>
                </select>
              </div>
            </div>

            {/* Drug List */}
            {filteredAndSortedDrugs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No drugs found</h3>
                <p className="text-gray-500">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedDrugs.map((drug) => (
                  <div key={drug.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {drug.brandName}
                            {drug.genericName && (
                              <span className="text-gray-600 font-normal"> ({drug.genericName})</span>
                            )}
                          </h3>
                          <button
                            onClick={() => toggleFavorite(drug.id)}
                            className={`p-1 rounded ${
                              favoritesList.includes(drug.id)
                                ? 'text-red-500 hover:text-red-700'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                            title={favoritesList.includes(drug.id) ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart className={`w-5 h-5 ${
                              favoritesList.includes(drug.id) ? 'fill-current' : ''
                            }`} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Species</h4>
                            <div className="flex flex-wrap gap-1">
                              {drug.species.map(species => (
                                <span key={species} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  {species}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Indications</h4>
                            <div className="flex flex-wrap gap-1">
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
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Routes</h4>
                            <div className="flex flex-wrap gap-1">
                              {drug.routes.map(route => (
                                <span key={route} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                  {route}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-3">
                            <Link 
                              href={`/drugs/${drug.id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              View Details
                            </Link>
                            {drug.labelLink && (
                              <a 
                                href={drug.labelLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Label
                              </a>
                            )}
                          </div>

                          <span className="text-sm text-gray-500">
                            Added {new Date(drug.dateAdded).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}