"use client";

import Card from "@/components/Card";
import Icon from "@/components/Icon";

export default function ExchangeStatus() {
  // Exchange integration disabled - showing dedicated email status instead
  return (
    <Card className="card" title="Email Integration Status">
      <div className="p-4 space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="check" className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-medium text-blue-900">Dedicated Email System Active</h4>
              <p className="text-sm text-blue-700 mt-1">
                Using direct email processing at <code className="bg-blue-100 px-1 rounded">crm@4401.earth</code>
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="info" className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-medium text-green-900">No Setup Required</h4>
              <p className="text-sm text-green-700 mt-1">
                Simply forward emails to process them automatically. No Exchange integration needed.
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <a 
            href="/settings/email-integration"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View Setup Instructions
          </a>
        </div>
      </div>
    </Card>
  );
}