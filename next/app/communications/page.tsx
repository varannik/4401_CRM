'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search, Mail, Phone, Calendar, FileText, CheckCircle } from 'lucide-react';

interface Communication {
  _id: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'task';
  subject: string;
  content: string;
  contact?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  company?: {
    _id: string;
    name: string;
  };
  project?: string;
  contract?: string;
  initiative?: string;
  direction: 'inbound' | 'outbound';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate?: string;
  completedDate?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      const response = await fetch('/api/communications');
      if (response.ok) {
        const data = await response.json();
        setCommunications(data);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = 
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.contact?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.contact?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.contract?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || comm.type === filterType;

    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'meeting': return Calendar;
      case 'note': return FileText;
      case 'task': return CheckCircle;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'phone': return 'bg-green-100 text-green-800';
      case 'meeting': return 'bg-purple-100 text-purple-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      case 'task': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
          <h1 className="text-xl font-semibold text-gray-900">Communications</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track all customer communications, meetings, and project updates
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Communication
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="sm:w-48">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="meeting">Meeting</option>
            <option value="note">Note</option>
            <option value="task">Task</option>
          </select>
        </div>
      </div>

      {/* Communications List */}
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredCommunications.map((comm) => {
            const TypeIcon = getTypeIcon(comm.type);
            return (
              <li key={comm._id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getTypeColor(comm.type)}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {comm.subject}
                          </p>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>
                            {comm.status}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(comm.type)}`}>
                            {comm.type}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {comm.contact && (
                            <span>
                              {comm.contact.firstName} {comm.contact.lastName}
                            </span>
                          )}
                          {comm.company && (
                            <span className={comm.contact ? 'ml-2' : ''}>
                              {comm.contact && '•'} {comm.company.name}
                            </span>
                          )}
                          {comm.project && (
                            <span className="ml-2">
                              • Project: {comm.project}
                            </span>
                          )}
                          {comm.contract && (
                            <span className="ml-2">
                              • Contract: {comm.contract}
                            </span>
                          )}
                          {comm.initiative && (
                            <span className="ml-2">
                              • Initiative: {comm.initiative}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-900">
                          {comm.createdBy.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Communication Content */}
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {comm.content}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {filteredCommunications.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'No communications found matching your filters.' 
                : 'No communications logged yet. Start tracking your customer interactions.'}
            </div>
          </div>
        )}
      </div>

      {/* Add Communication Modal Placeholder */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Log New Communication</h3>
              <p className="text-sm text-gray-500 mb-4">
                Communication form will be implemented with project, contract, and initiative tracking.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowAddForm(false)}>
                  Save Communication
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 