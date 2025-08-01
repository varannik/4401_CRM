"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from "@/components/Card";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

interface SyncStatus {
  hasEmailPermissions: boolean;
  userId: string;
  scopes: string[];
}

interface SyncResults {
  success: boolean;
  results: {
    emails: { processed: number; records: number };
    meetings: { processed: number; records: number };
    errors: string[];
  };
  message: string;
}

export default function EmailSyncButton() {
  const { data: session } = useSession();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function checkSyncStatus() {
      if (session?.user) {
        try {
          const response = await fetch('/api/email-sync');
          if (response.ok) {
            const status = await response.json();
            setSyncStatus(status);
          }
        } catch (error) {
          console.error('Failed to check sync status:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    checkSyncStatus();
  }, [session]);
  
  const handleSync = async (options?: { syncEmails?: boolean; syncMeetings?: boolean; limit?: number; daysBack?: number }) => {
    setSyncing(true);
    setSyncResults(null);
    
    try {
      const response = await fetch('/api/email-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncEmails: true,
          syncMeetings: true,
          limit: 50,
          daysBack: 30,
          ...options
        })
      });
      
      const result = await response.json();
      setSyncResults(result);
      
      if (result.success) {
        setLastSync(new Date().toISOString());
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncResults({
        success: false,
        results: { emails: { processed: 0, records: 0 }, meetings: { processed: 0, records: 0 }, errors: ['Network error'] },
        message: 'Sync failed due to network error'
      });
    } finally {
      setSyncing(false);
    }
  };
  
  const handleGrantPermissions = async () => {
    try {
      const response = await fetch('/api/email-permissions', {
        method: 'POST'
      });
      
      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        const error = await response.json();
        console.error('Failed to get auth URL:', error);
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  };
  
  if (loading) {
    return (
      <Card className="card" title="Email Integration">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Checking permissions...</p>
        </div>
      </Card>
    );
  }
  
  if (!syncStatus?.hasEmailPermissions) {
    return (
      <Card className="card" title="Email Integration Setup">
        <div className="p-4 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Icon name="warning" className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Email permissions required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  To automatically sync emails and meetings, please grant additional permissions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">What we'll access:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Email metadata (subject, sender, date) - never content</li>
              <li>• Calendar meeting information</li>
              <li>• Contact information for CRM integration</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Privacy protection:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Email content is never stored or analyzed</li>
              <li>• Only metadata for relationship tracking</li>
              <li>• GDPR and privacy compliant</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleGrantPermissions}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <div className="flex items-center justify-center space-x-2">
              <Icon name="check" className="w-4 h-4" />
              <span>Grant Email Permissions</span>
            </div>
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="card" title="Email Synchronization">
      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="check" className="w-4 h-4 text-green-500" />
            <span className="text-green-700 font-medium">Email integration active</span>
          </div>
          {lastSync && (
            <span className="text-xs text-green-600">
              Last sync: {new Date(lastSync).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {/* Sync Results */}
        {syncResults && (
          <div className={`p-3 border rounded-lg ${
            syncResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              <Icon 
                name={syncResults.success ? "check" : "warning"} 
                className={`w-4 h-4 mt-0.5 ${
                  syncResults.success ? 'text-green-500' : 'text-red-500'
                }`} 
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  syncResults.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {syncResults.message}
                </p>
                {syncResults.success && (
                  <div className="mt-1 text-xs text-green-700">
                    Emails: {syncResults.results.emails.processed} processed, {syncResults.results.emails.records} new records
                    {' • '}
                    Meetings: {syncResults.results.meetings.processed} processed, {syncResults.results.meetings.records} new records
                  </div>
                )}
                {syncResults.results.errors.length > 0 && (
                  <div className="mt-1 text-xs text-red-600">
                    Errors: {syncResults.results.errors.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Sync Controls */}
        <div className="space-y-3">
          <Button 
            onClick={() => handleSync()}
            disabled={syncing}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <div className="flex items-center justify-center space-x-2">
              {syncing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Icon name="refresh" className="w-4 h-4" />
              )}
              <span>{syncing ? 'Syncing...' : 'Sync Emails & Meetings'}</span>
            </div>
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => handleSync({ syncEmails: true, syncMeetings: false })}
              disabled={syncing}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-1">
                <Icon name="mail" className="w-3 h-3" />
                <span className="text-xs">Emails Only</span>
              </div>
            </Button>
            
            <Button 
              onClick={() => handleSync({ syncEmails: false, syncMeetings: true })}
              disabled={syncing}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-1">
                <Icon name="calendar" className="w-3 h-3" />
                <span className="text-xs">Meetings Only</span>
              </div>
            </Button>
          </div>
        </div>
        
        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="info" className="w-4 h-4 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">How it works</h4>
              <p className="text-xs text-blue-700 mt-1">
                We scan your emails and meetings for external contacts, automatically creating 
                company and contact records in your CRM. Only metadata is stored - never email content.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 