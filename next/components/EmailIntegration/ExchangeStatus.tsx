"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from "@/components/Card";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

interface ExchangeTestResults {
  success: boolean;
  error?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  exchange: {
    connectivity: {
      success: boolean;
      permissions: string[];
      errors: string[];
    };
    environment: {
      isExchangeOnline: boolean;
      isHybrid: boolean;
      isOnPremises: boolean;
      recommendations: string[];
    };
    optimizationTips: string[];
    configuredScopes: string[];
  };
  timestamp: string;
  // Additional fields for different test types
  performance?: {
    status: string;
    recommendation?: string;
  };
  quick?: boolean;
  debug?: boolean;
  diagnostic?: boolean; // Added
  steps?: Array<{ step: string; success: boolean; duration: number; error?: string; details?: any }>;
  totalDuration?: number;
  timings?: {
    clientCreation: string;
    apiCall: string;
    total: string;
  };
}

export default function ExchangeStatus() {
  const { data: session } = useSession();
  const [testResults, setTestResults] = useState<ExchangeTestResults | null>(null);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    if (session?.user) {
      runExchangeTest();
    }
  }, [session]);
  
  const runExchangeTest = async (testType: string = 'connectivity') => {
    setTesting(true);
    
    try {
      let endpoint = '/api/exchange-test';
      
      // Add query parameters based on test type
      if (testType === 'quick') {
        endpoint += '?quick=true';
      } else if (testType === 'debug') {
        endpoint += '?debug=true';
      } else if (testType === 'diagnostic') {
        endpoint += '?diagnostic=true';
      }
      
      // Create fetch with timeout to prevent hanging
      const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 60000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeoutMs/1000}s - Microsoft Graph may be experiencing delays`);
          }
          throw error;
        }
      };
      
      // Set different timeouts for different test types
      const timeout = testType === 'quick' ? 15000 : testType === 'debug' ? 30000 : testType === 'diagnostic' ? 45000 : 60000;
      
      const response = await fetchWithTimeout(endpoint, {
        method: testType === 'connectivity' || testType === 'quick' || testType === 'debug' || testType === 'diagnostic' ? 'GET' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: testType !== 'connectivity' && testType !== 'quick' && testType !== 'debug' && testType !== 'diagnostic' ? JSON.stringify({ testType }) : undefined
      }, timeout);
      
      if (response.ok) {
        const results = await response.json();
        setTestResults(results);
        
        // Show specific guidance for slow performance
        if (results.performance?.status === 'slow' || results.error?.includes('timeout')) {
          console.log('⚠️ Microsoft Graph API is responding slowly. Consider using fallback methods.');
        }
      } else {
        console.error('Exchange test failed:', await response.text());
        setTestResults({
          success: false,
          error: 'Test failed',
          user: { id: '', email: '', name: '' },
          exchange: {
            connectivity: { success: false, permissions: [], errors: ['Test request failed'] },
            environment: { isExchangeOnline: true, isHybrid: false, isOnPremises: false, recommendations: [] },
            optimizationTips: [],
            configuredScopes: []
          },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Exchange test error:', error);
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        user: { id: '', email: '', name: '' },
        exchange: {
          connectivity: { success: false, permissions: [], errors: ['Connection failed'] },
          environment: { isExchangeOnline: true, isHybrid: false, isOnPremises: false, recommendations: [] },
          optimizationTips: [],
          configuredScopes: []
        },
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Card className="card" title="Exchange Integration Status">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Testing Exchange connection...</p>
        </div>
      </Card>
    );
  }
  
  const connectivity = testResults?.exchange?.connectivity;
  const environment = testResults?.exchange?.environment;
  
  return (
    <Card className="card" title="Microsoft Exchange Integration">
      <div className="p-4 space-y-4">
        
        {/* Connection Status */}
        <div className={`p-3 border rounded-lg ${
          connectivity?.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon 
                name={connectivity?.success ? "check" : "warning"} 
                className={`w-4 h-4 ${
                  connectivity?.success ? 'text-green-500' : 'text-red-500'
                }`} 
              />
              <span className={`font-medium ${
                connectivity?.success ? 'text-green-900' : 'text-red-900'
              }`}>
                Exchange {connectivity?.success ? 'Connected' : 'Connection Issues'}
              </span>
            </div>
            <Button
              onClick={() => runExchangeTest('connectivity')}
              disabled={testing}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200"
            >
              {testing ? 'Testing...' : 'Retest'}
            </Button>
          </div>
          
          {testResults?.timestamp && (
            <p className="text-xs text-gray-600 mt-1">
              Last tested: {new Date(testResults.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        
        {/* Permissions Status */}
        {connectivity?.permissions && connectivity.permissions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">Active Permissions</h4>
            <div className="space-y-1">
              {connectivity.permissions.map((permission, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Icon name="check" className="w-3 h-3 text-green-500" />
                  <span className="text-sm text-blue-700">{permission}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Environment Info */}
        {environment && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Exchange Environment</h4>
              <Button
                onClick={() => setExpanded(!expanded)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200"
              >
                {expanded ? 'Less Info' : 'More Info'}
              </Button>
            </div>
            
            <div className="mt-2 space-y-1">
              {environment.isExchangeOnline && (
                <div className="flex items-center space-x-2">
                  <Icon name="cloud" className="w-3 h-3 text-blue-500" />
                  <span className="text-sm text-gray-700">Exchange Online (Microsoft 365)</span>
                </div>
              )}
              
              {environment.isHybrid && (
                <div className="flex items-center space-x-2">
                  <Icon name="link" className="w-3 h-3 text-orange-500" />
                  <span className="text-sm text-gray-700">Hybrid Exchange Environment</span>
                </div>
              )}
              
              {environment.isOnPremises && (
                <div className="flex items-center space-x-2">
                  <Icon name="server" className="w-3 h-3 text-gray-500" />
                  <span className="text-sm text-gray-700">On-Premises Exchange Server</span>
                </div>
              )}
            </div>
            
            {expanded && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="font-medium text-gray-800 mb-2">Recommendations</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {environment.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Errors */}
        {connectivity?.errors && connectivity.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-red-900 mb-2">Issues Found</h4>
            <ul className="space-y-1">
              {connectivity.errors.map((error, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Icon name="warning" className="w-3 h-3 text-red-500 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Optimization Tips */}
        {expanded && testResults?.exchange?.optimizationTips && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-900 mb-2">Exchange Optimization Tips</h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              {testResults.exchange.optimizationTips.slice(0, 4).map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-yellow-600 mt-0.5">{tip.charAt(0)}</span>
                  <span>{tip.substring(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Test Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => runExchangeTest('quick')}
              disabled={testing}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-2">
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Icon name="zap" className="w-4 h-4" />
                )}
                <span className="text-sm">{testing ? 'Testing...' : 'Quick Test (10s)'}</span>
              </div>
            </Button>
            
            <Button
              onClick={() => runExchangeTest('debug')}
              disabled={testing}
              className="bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-2">
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Icon name="bug" className="w-4 h-4" />
                )}
                <span className="text-sm">{testing ? 'Testing...' : 'Debug Mode'}</span>
              </div>
            </Button>
            
            <Button
              onClick={() => runExchangeTest('diagnostic')}
              disabled={testing}
              className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-2">
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Icon name="search" className="w-4 h-4" />
                )}
                <span className="text-sm">{testing ? 'Testing...' : 'Diagnostic'}</span>
              </div>
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => runExchangeTest('full')}
              disabled={testing}
              className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-2">
                {testing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Icon name="refresh" className="w-4 h-4" />
                )}
                <span className="text-sm">{testing ? 'Testing...' : 'Full Test'}</span>
              </div>
            </Button>
            
            <Button
              onClick={() => runExchangeTest('performance')}
              disabled={testing}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              <div className="flex items-center justify-center space-x-1">
                <Icon name="clock" className="w-3 h-3" />
                <span className="text-xs">Speed Test</span>
              </div>
            </Button>
          </div>
          
          {/* Performance Results */}
          {testResults?.performance && (
            <div className={`text-xs p-2 rounded ${
              testResults.performance.status === 'excellent' ? 'bg-green-50 text-green-800' :
              testResults.performance.status === 'good' ? 'bg-yellow-50 text-yellow-800' :
              'bg-red-50 text-red-800'
            }`}>
              <strong>Performance: {testResults.performance.status}</strong>
              {testResults.performance.recommendation && (
                <div className="mt-1">{testResults.performance.recommendation}</div>
              )}
            </div>
          )}
          
          {/* Quick Test Results */}
          {testResults?.quick && testResults.timings && (
            <div className="text-xs bg-blue-50 text-blue-800 p-2 rounded">
              <strong>Quick Test Results:</strong>
              <div>Graph Client: {testResults.timings.clientCreation}</div>
              <div>API Call: {testResults.timings.apiCall}</div>
              <div>Total: {testResults.timings.total}</div>
            </div>
          )}
          
          {/* Debug Results */}
          {testResults?.debug && testResults.steps && (
            <div className="text-xs bg-gray-50 border rounded p-2">
              <strong>Debug Steps:</strong>
              {testResults.steps.map((step, index) => (
                <div key={index} className={`flex justify-between ${step.success ? 'text-green-700' : 'text-red-700'}`}>
                  <span>{step.step}:</span>
                  <span>{step.success ? '✅' : '❌'} {step.duration}ms</span>
                </div>
              ))}
              <div className="font-medium mt-1">Total: {testResults.totalDuration}ms</div>
            </div>
          )}
          
          {/* Diagnostic Results */}
          {testResults?.diagnostic && testResults.steps && (
            <div className="text-xs bg-purple-50 border border-purple-200 rounded p-3">
              <strong className="text-purple-900 block mb-2">🩺 Comprehensive Diagnostic:</strong>
              <div className="space-y-2">
                {testResults.steps.map((step, index) => (
                  <div key={index} className={`p-2 rounded ${step.success ? 'bg-green-100 border-green-200' : 'bg-red-100 border-red-200'} border`}>
                    <div className={`flex justify-between items-center ${step.success ? 'text-green-800' : 'text-red-800'}`}>
                      <span className="font-medium">{step.step}</span>
                      <span className="flex items-center space-x-1">
                        <span>{step.success ? '✅' : '❌'}</span>
                        <span className="text-gray-600">{step.duration}ms</span>
                      </span>
                    </div>
                    {step.details && (
                      <div className="text-gray-700 text-xs mt-1">
                        {Object.entries(step.details).map(([key, value]) => (
                          <span key={key} className="mr-2">
                            {key}: {typeof value === 'string' ? value : JSON.stringify(value)}
                          </span>
                        ))}
                      </div>
                    )}
                    {step.error && (
                      <div className="text-red-600 text-xs mt-1 font-mono bg-red-50 p-1 rounded">
                        {step.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="font-medium mt-2 text-purple-900">
                Overall Result: {testResults.success ? '✅ Success' : '❌ Failed'}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 