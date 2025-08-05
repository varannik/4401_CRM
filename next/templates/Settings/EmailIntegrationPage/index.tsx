"use client";

import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Icon from "@/components/Icon";

const EmailIntegrationPage = () => {
    return (
        <Layout title="Email Integration Settings">
            <div className="max-w-6xl space-y-6">
                {/* How Email Integration Works */}
                <Card className="card" title="How Email Integration Works">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Icon name="mail" className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-2">1. Forward Emails</h3>
                                <p className="text-sm text-gray-600">
                                    Forward or CC emails to our dedicated CRM address for automatic processing
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Icon name="plus" className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-2">2. Auto-Create Records</h3>
                                <p className="text-sm text-gray-600">
                                    Automatically create contact and organization records with smart classification
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Icon name="chart" className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-2">3. Track & Tag</h3>
                                <p className="text-sm text-gray-600">
                                    Log communications with intelligent tagging for easy search and reporting
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
                
                {/* Dedicated Email Setup */}
                <Card className="card" title="Dedicated CRM Email">
                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Icon name="mail" className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900">Direct Email Processing</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Forward emails or CC our dedicated CRM email address to automatically process them into your CRM database. 
                                        No Exchange integration or user permissions required.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">CRM Email Address</h4>
                                <div className="bg-gray-100 rounded-md p-3 font-mono text-sm">
                                    crm@4401.earth
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Forward any external emails to this address for automatic processing
                                </p>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Processing Status</h4>
                                <div className="flex items-center space-x-2">
                                    <Icon name="check" className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-700">Active & Ready</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Automatic processing - no setup required
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-2">How to Use</h4>
                            <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                                <li>Forward external emails to <code className="bg-green-100 px-1 rounded">crm@4401.earth</code></li>
                                <li>Or CC the address when sending emails to external contacts</li>
                                <li>Our system automatically creates contact and organization records</li>
                                <li>Communication history is logged with intelligent tags and metadata</li>
                            </ol>
                        </div>
                    </div>
                </Card>

                {/* Email Forwarding Setup Guide */}
                <Card className="card" title="Email Forwarding Setup">
                    <div className="p-6 space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Icon name="info" className="w-5 h-5 text-green-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-green-900">Easy Setup Options</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        Choose the method that works best for your email workflow.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <Icon name="forward" className="w-4 h-4 text-blue-500 mr-2" />
                                    Manual Forwarding
                                </h4>
                                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                                    <li>Select important external emails in your inbox</li>
                                    <li>Click "Forward" and add <code className="bg-gray-100 px-1 rounded">crm@4401.earth</code></li>
                                    <li>Send the email (original recipients are preserved)</li>
                                    <li>Check the Contacts page to see new records created</li>
                                </ol>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <Icon name="settings" className="w-4 h-4 text-purple-500 mr-2" />
                                    Auto-Forwarding Rules
                                </h4>
                                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                                    <li>Set up email rules in your client (Outlook, Gmail, etc.)</li>
                                    <li>Create rule: "Forward external emails to crm@4401.earth"</li>
                                    <li>Exclude internal 44.01 domains from the rule</li>
                                    <li>All qualifying emails will be processed automatically</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Processing Details */}
                <Card className="card" title="What Gets Processed">
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                    <Icon name="check" className="w-4 h-4 text-green-500 mr-2" />
                                    Email Data Extracted
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Contact names and email addresses</li>
                                    <li>• Organization domains and company info</li>
                                    <li>• Email subject lines and timestamps</li>
                                    <li>• Attachment indicators (not content)</li>
                                    <li>• Meeting invitations and responses</li>
                                </ul>
                            </div>
                            
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                    <Icon name="zap" className="w-4 h-4 text-blue-500 mr-2" />
                                    Automatic Features
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Organization type detection (University, Company, etc.)</li>
                                    <li>• Intelligent tag generation</li>
                                    <li>• Duplicate contact prevention</li>
                                    <li>• Communication thread tracking</li>
                                    <li>• Real-time processing (1-2 minutes)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Card>

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
                                <h4 className="font-medium text-gray-900">Emails not being processed?</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Check that you're forwarding to the correct address (crm@4401.earth) and that 
                                    the email contains external contacts. Internal 44.01 emails are automatically skipped.
                                </p>
                            </div>
                            
                            <div className="border-l-4 border-blue-400 pl-4">
                                <h4 className="font-medium text-gray-900">Missing some contacts?</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Only emails with external addresses (non-44.01 domains) are processed. 
                                    Make sure your external contacts are in the To/CC fields when forwarding.
                                </p>
                            </div>
                            
                            <div className="border-l-4 border-green-400 pl-4">
                                <h4 className="font-medium text-gray-900">Want to exclude certain domains?</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Contact your CRM administrator to configure domain exclusions or 
                                    automatic "Do Not Contact" flags for specific companies.
                                </p>
                            </div>
                            
                            <div className="border-l-4 border-purple-400 pl-4">
                                <h4 className="font-medium text-gray-900">Need to set up email forwarding?</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Configure your email client to automatically forward external emails to crm@4401.earth, 
                                    or manually forward important communications for CRM tracking.
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