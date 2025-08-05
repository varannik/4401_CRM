"use client";

import Layout from "@/components/Layout";
import Card from "@/components/Card";
import CardChartPie from "@/components/CardChartPie";
import Icon from "@/components/Icon";

const contactStats = [
    {
        title: "Total Contacts",
        value: 456,
        change: "+18%",
        trend: "up" as const,
        icon: "profile"
    },
    {
        title: "Active Organizations",
        value: 245,
        change: "+12%",
        trend: "up" as const,
        icon: "wallet"
    },
    {
        title: "This Month Communications",
        value: 189,
        change: "+25%",
        trend: "up" as const,
        icon: "message"
    },
    {
        title: "Universities",
        value: 45,
        change: "+5%",
        trend: "up" as const,
        icon: "book"
    },
];

const organizationTypeData = [
    { name: "Companies", value: 165, color: "blue" },
    { name: "Universities", value: 45, color: "green" },
    { name: "Government", value: 12, color: "red" },
    { name: "Non-Profit", value: 18, color: "purple" },
    { name: "Research Institutes", value: 5, color: "orange" },
];

const recentContacts = [
    {
        id: "1",
        name: "Dr. Sarah Johnson",
        organization: "MIT Energy Initiative",
        type: "UNIVERSITY",
        email: "s.johnson@mit.edu",
        lastContact: "2024-01-15",
        tags: ["research", "energy", "collaboration"]
    },
    {
        id: "2", 
        name: "Michael Chen",
        organization: "Shopify Inc.",
        type: "COMPANY",
        email: "m.chen@shopify.com",
        lastContact: "2024-01-14",
        tags: ["technology", "e-commerce"]
    },
    {
        id: "3",
        name: "Prof. Elena Rodriguez",
        organization: "Stanford University",
        type: "UNIVERSITY", 
        email: "e.rodriguez@stanford.edu",
        lastContact: "2024-01-13",
        tags: ["academic", "research", "climate"]
    },
    {
        id: "4",
        name: "James Wilson",
        organization: "ClimateWorks Foundation",
        type: "NON_PROFIT",
        email: "j.wilson@climateworks.org", 
        lastContact: "2024-01-12",
        tags: ["non-profit", "climate", "funding"]
    },
    {
        id: "5",
        name: "Lisa Park",
        organization: "Microsoft Corporation",
        type: "COMPANY",
        email: "l.park@microsoft.com",
        lastContact: "2024-01-11",
        tags: ["enterprise", "technology", "partnership"]
    },
];

const getTypeColor = (type: string) => {
    switch (type) {
        case "UNIVERSITY": return "text-green-600 bg-green-100";
        case "COMPANY": return "text-blue-600 bg-blue-100";
        case "GOVERNMENT": return "text-red-600 bg-red-100";
        case "NON_PROFIT": return "text-purple-600 bg-purple-100";
        case "RESEARCH_INSTITUTE": return "text-orange-600 bg-orange-100";
        default: return "text-gray-600 bg-gray-100";
    }
};

const ContactsOverviewPage = () => {
    return (
        <Layout title="Contacts Overview">
            <div className="max-w-6xl space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {contactStats.map((stat, index) => (
                        <Card key={index} className="card">
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Icon name={stat.icon} className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className={`text-sm font-medium ${
                                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                                    }`}>
                                        {stat.change}
                                    </span>
                                    <span className="text-sm text-gray-600"> vs last month</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Organization Types Chart */}
                    <CardChartPie
                        title="Organization Types"
                        data={organizationTypeData}
                        className="card"
                    />

                    {/* Quick Actions */}
                    <Card className="card" title="Quick Actions">
                        <div className="p-6 space-y-4">
                            <a 
                                href="/contacts/new"
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <Icon name="plus" className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Add New Contact</h4>
                                    <p className="text-sm text-gray-600">Create a new contact and organization</p>
                                </div>
                            </a>
                            
                            <a 
                                href="/communications/log"
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <Icon name="message" className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Log Communication</h4>
                                    <p className="text-sm text-gray-600">Record a new interaction</p>
                                </div>
                            </a>
                            
                            <a 
                                href="/contacts/list"
                                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <Icon name="search" className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">Search Contacts</h4>
                                    <p className="text-sm text-gray-600">Find contacts and organizations</p>
                                </div>
                            </a>
                        </div>
                    </Card>
                </div>

                {/* Recent Contacts */}
                <Card className="card" title="Recent Contacts">
                    <div className="p-6">
                        <div className="space-y-4">
                            {recentContacts.map((contact) => (
                                <div key={contact.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-600">
                                                {contact.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{contact.name}</h4>
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm text-gray-600">{contact.organization}</p>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contact.type)}`}>
                                                    {contact.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{contact.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Last contact:</p>
                                        <p className="text-sm font-medium">{new Date(contact.lastContact).toLocaleDateString()}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {contact.tags.slice(0, 2).map((tag, index) => (
                                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-6 text-center">
                            <a 
                                href="/contacts/list"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                View All Contacts
                                <Icon name="arrow-right" className="ml-2 w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default ContactsOverviewPage;