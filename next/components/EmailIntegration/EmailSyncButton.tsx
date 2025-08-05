"use client";

import Card from "@/components/Card";
import Icon from "@/components/Icon";

export default function EmailSyncButton() {
  // Email sync disabled - showing dedicated email instructions instead
  return (
    <Card className="card" title="Email Processing">
      <div className="p-4 space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Icon name="check" className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-medium text-green-900">Automatic Processing Active</h4>
              <p className="text-sm text-green-700 mt-1">
                Emails forwarded to <code className="bg-green-100 px-1 rounded">crm@4401.earth</code> are processed automatically
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Forward external emails to crm@4401.earth</li>
            <li>System processes them automatically within 1-2 minutes</li>
            <li>Contacts and organizations are created automatically</li>
            <li>Communication history is logged with smart tags</li>
          </ol>
        </div>
        
        <div className="text-center">
          <a 
            href="/contacts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Icon name="users" className="w-4 h-4 mr-2" />
            View Processed Contacts
          </a>
        </div>
      </div>
    </Card>
  );
}