'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Globe, MapPin, Users } from 'lucide-react';

interface Company {
  _id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  website?: string;
  description?: string;
  address?: {
    city?: string;
    country?: string;
  };
  leadSource?: string;
  assignedDepartment?: string;
  status: 'prospect' | 'active' | 'inactive' | 'archived';
  createdAt: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.assignedDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Companies</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your business relationships and prospects
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <div key={company._id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {company.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {company.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(company.status)}`}>
                      {company.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {company.industry && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Industry:</span> {company.industry}
                  </p>
                )}
                
                {company.size && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Users className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {company.size}
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Globe className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate"
                    >
                      {company.website}
                    </a>
                  </div>
                )}

                {company.address?.city && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                    {company.address.city}{company.address.country && `, ${company.address.country}`}
                  </div>
                )}

                {company.assignedDepartment && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Department:</span> {company.assignedDepartment}
                  </p>
                )}
              </div>

              {company.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {company.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm ? 'No companies found matching your search.' : 'No companies yet. Add your first company to get started.'}
          </div>
        </div>
      )}

      {/* Add Company Modal Placeholder */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Company</h3>
              <p className="text-sm text-gray-500 mb-4">
                Company form will be implemented with API integration.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowAddForm(false)}>
                  Save Company
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 