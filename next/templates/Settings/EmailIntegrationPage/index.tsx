"use client";

import Layout from "@/components/Layout";
import EmailSyncButton from "@/components/EmailIntegration/EmailSyncButton";
import ExchangeStatus from "@/components/EmailIntegration/ExchangeStatus";
import Card from "@/components/Card";
import Icon from "@/components/Icon";

const EmailIntegrationPage = () => {
    return (
        <Layout title="Email Integration Settings">
            <div className="max-w-6xl space-y-6">
                {/* Exchange Status & How It Works - Side by side on large screens */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Exchange Status & Connectivity */}
                    <ExchangeStatus />
                    
                    {/* How It Works */}
                    <Card className="card" title="How Email Integration Works">
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Icon name="mail" className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">1. Scan Emails</h3>
                                    <p className="text-sm text-gray-600">
                                        We analyze your email metadata to identify external contacts and companies
                                    </p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Icon name="plus" className="w-6 h-6 text-green-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">2. Create Records</h3>
                                    <p className="text-sm text-gray-600">
                                        Automatically create company and contact records in your CRM database
                                    </p>
                                </div>
                                
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Icon name="chart" className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">3. Track Interactions</h3>
                                    <p className="text-sm text-gray-600">
                                        Log communication history and relationship metrics for better CRM insights
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                
                {/* Main Email Sync Component */}
                <EmailSyncButton />

                {/* Privacy & Security */}
                <Card className="card" title="Privacy & Security">
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-medium text-green-900 mb-3 flex items-center">
                                    <Icon name="check" className="w-4 h-4 text-green-500 mr-2" />
                                    What We Do Collect
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Email subject lines</li>
                                    <li>• Sender and recipient email addresses</li>
                                    <li>• Date and time stamps</li>
                                    <li>• Meeting titles and attendees</li>
                                    <li>• Attachment indicators (not content)</li>
                                </ul>
                            </div>
                            
                            <div>
                                <h3 className="font-medium text-red-900 mb-3 flex items-center">
                                    <Icon name="warning" className="w-4 h-4 text-red-500 mr-2" />
                                    What We DON'T Collect
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Email body content</li>
                                    <li>• Attachment files or content</li>
                                    <li>• Personal conversations</li>
                                    <li>• Meeting recordings or notes</li>
                                    <li>• Internal 44.01 communications</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Icon name="info" className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">GDPR Compliance</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Our email integration is designed to be fully GDPR compliant. We only process 
                                            the minimum necessary data for CRM functionality and never store email content 
                                            or analyze personal communications.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Troubleshooting */}
                <Card className="card" title="Troubleshooting">
                    <div className="p-6 space-y-4">
                        <div className="space-y-4">
                            <div className="border-l-4 border-yellow-400 pl-4">
                                <h4 className="font-medium text-gray-900">Email permissions not working?</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Try signing out and signing back in to refresh your permissions. You may need to 
                                    contact your IT administrator if your organization has restricted email access.
                                </p>
                            </div>
                            
                            <div className="border-l-4 border-blue-400 pl-4">
                                <h4 className="font-medium text-gray-900">Not seeing recent emails?</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Email sync only processes emails with external contacts (non-44.01 addresses). 
                                    Internal emails and emails without valid external recipients are skipped.
                                </p>
                            </div>
                            
                            <div className="border-l-4 border-green-400 pl-4">
                                <h4 className="font-medium text-gray-900">Want to exclude certain domains?</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Contact your CRM administrator to configure domain exclusions or 
                                    automatic "Do Not Contact" flags for specific companies.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default EmailIntegrationPage; 