"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import CardChartPie from "@/components/CardChartPie";

interface CompanyDetailsPageProps {
    companyId: string;
}

// Mock data - in real app, this would come from API
const companyData = {
    id: "1",
    name: "Microsoft Corporation",
    industry: "Technology",
    location: "Redmond, WA",
    country: "United States", 
    website: "https://microsoft.com",
    description: "Multinational technology corporation that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and related services.",
    ownerDepartment: "Commercial",
    projectTag: "Azure Climate Partnership",
    doNotContact: false,
    notes: "Key partner for cloud infrastructure and sustainability initiatives. Regular quarterly reviews scheduled.",
    firstContactDate: "2023-03-15",
    lastContactDate: "2024-01-15",
    contactCount: 23,
    status: "active" as const
};

const contacts = [
    {
        id: "1",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@microsoft.com",
        title: "Director of Sustainability",
        department: "Environmental",
        lastContact: "2024-01-15",
        contactCount: 8,
        isActive: true
    },
    {
        id: "2",
        firstName: "David",
        lastName: "Chen",
        email: "david.chen@microsoft.com",
        title: "Senior Engineering Manager",
        department: "Azure",
        lastContact: "2024-01-10",
        contactCount: 12,
        isActive: true
    },
    {
        id: "3",
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@microsoft.com",
        title: "Business Development Manager",
        department: "Partnerships",
        lastContact: "2023-12-20",
        contactCount: 3,
        isActive: true
    }
];

const recentCommunications = [
    {
        id: "1",
        type: "EMAIL",
        subject: "Q1 2024 Sustainability Partnership Review",
        contactName: "Sarah Johnson",
        date: "2024-01-15",
        user: "John Smith",
        notes: "Discussed carbon removal targets and potential expansion"
    },
    {
        id: "2",
        type: "MEETING",
        subject: "Technical Integration Planning",
        contactName: "David Chen",
        date: "2024-01-10",
        user: "Jane Doe",
        notes: "Azure integration requirements and timeline"
    },
    {
        id: "3",
        type: "EMAIL",
        subject: "Follow-up on proposal feedback",
        contactName: "Sarah Johnson",
        date: "2024-01-08",
        user: "John Smith",
        notes: "Response to technical questions about DAC technology"
    }
];

const communicationStats = [
    { name: "Email", value: 65 },
    { name: "Meetings", value: 25 },
    { name: "Phone", value: 10 }
];

const CompanyDetailsPage = ({ companyId }: CompanyDetailsPageProps) => {
    const [activeTab, setActiveTab] = useState("overview");

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "EMAIL": return "message";
            case "MEETING": return "calendar";
            case "PHONE": return "phone";
            default: return "message";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "EMAIL": return "text-blue-500";
            case "MEETING": return "text-green-500";
            case "PHONE": return "text-purple-500";
            default: return "text-gray-500";
        }
    };

    return (
        <Layout title={`${companyData.name} - Company Details`}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-xl">
                                {companyData.name.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{companyData.name}</h1>
                            <p className="text-gray-600 mt-1">
                                {companyData.industry} • {companyData.location}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                                    {companyData.ownerDepartment}
                                </span>
                                {companyData.projectTag && (
                                    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                                        {companyData.projectTag}
                                    </span>
                                )}
                                <span className={`px-3 py-1 text-sm rounded-full ${
                                    companyData.doNotContact 
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                }`}>
                                    {companyData.doNotContact ? "Do Not Contact" : "Active"}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex space-x-3">
                        <Button className="bg-blue-600 text-white hover:bg-blue-700">
                            <a href={`/communications/log?company=${companyId}`} className="flex items-center space-x-2">
                                <Icon name="message" className="w-4 h-4" />
                                <span>Log Communication</span>
                            </a>
                        </Button>
                        <Button className="bg-green-600 text-white hover:bg-green-700">
                            <a href={`/contacts/new?company=${companyId}`} className="flex items-center space-x-2">
                                <Icon name="plus" className="w-4 h-4" />
                                <span>Add Contact</span>
                            </a>
                        </Button>
                        <Button className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                            <a href={`/companies/${companyId}/edit`} className="flex items-center space-x-2">
                                <Icon name="edit" className="w-4 h-4" />
                                <span>Edit</span>
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="card" title="Total Contacts">
                        <div className="p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{companyData.contactCount}</p>
                            <p className="text-sm text-gray-600 mt-1">Total interactions</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="Active Contacts">
                        <div className="p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{contacts.length}</p>
                            <p className="text-sm text-gray-600 mt-1">People in our network</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="First Contact">
                        <div className="p-4 text-center">
                            <p className="text-lg font-semibold text-gray-900">{companyData.firstContactDate}</p>
                            <p className="text-sm text-gray-600 mt-1">Relationship started</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="Last Contact">
                        <div className="p-4 text-center">
                            <p className="text-lg font-semibold text-gray-900">{companyData.lastContactDate}</p>
                            <p className="text-sm text-gray-600 mt-1">Most recent interaction</p>
                        </div>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex max-lg:block">
                    <div className="col-left">
                        {/* Company Information */}
                        <Card className="card mb-6" title="Company Information">
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium text-gray-700">Industry</h4>
                                        <p className="text-gray-900">{companyData.industry}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700">Location</h4>
                                        <p className="text-gray-900">{companyData.location}, {companyData.country}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700">Website</h4>
                                        <a href={companyData.website} target="_blank" rel="noopener noreferrer" 
                                           className="text-blue-600 hover:text-blue-800">
                                            {companyData.website}
                                        </a>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700">Owner Department</h4>
                                        <p className="text-gray-900">{companyData.ownerDepartment}</p>
                                    </div>
                                </div>
                                
                                {companyData.description && (
                                    <div>
                                        <h4 className="font-medium text-gray-700">Description</h4>
                                        <p className="text-gray-900 mt-1">{companyData.description}</p>
                                    </div>
                                )}
                                
                                {companyData.notes && (
                                    <div>
                                        <h4 className="font-medium text-gray-700">Notes</h4>
                                        <p className="text-gray-900 mt-1">{companyData.notes}</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Recent Communications */}
                        <Card 
                            className="card" 
                            title="Recent Communications"
                            headContent={
                                <a href={`/communications?company=${companyId}`} className="text-sm text-blue-600 hover:text-blue-800">
                                    View all
                                </a>
                            }
                        >
                            <div className="space-y-4">
                                {recentCommunications.map((comm) => (
                                    <div key={comm.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                                        <div className={`p-2 rounded-full bg-gray-100 ${getTypeColor(comm.type)}`}>
                                            <Icon name={getTypeIcon(comm.type)} className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">{comm.subject}</h4>
                                                <span className="text-sm text-gray-500">{comm.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                with {comm.contactName} • by {comm.user}
                                            </p>
                                            {comm.notes && (
                                                <p className="text-sm text-gray-500 mt-2">{comm.notes}</p>
                                            )}
                                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full mt-2 inline-block">
                                                {comm.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="col-right">
                        {/* Communication Types */}
                        <CardChartPie 
                            title="Communication Breakdown"
                            data={communicationStats}
                        />

                        {/* Contacts */}
                        <Card 
                            className="card mt-6" 
                            title="Company Contacts"
                            headContent={
                                <a href={`/contacts?company=${companyId}`} className="text-sm text-blue-600 hover:text-blue-800">
                                    View all
                                </a>
                            }
                        >
                            <div className="space-y-3">
                                {contacts.map((contact) => (
                                    <div key={contact.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-medium">
                                                    {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {contact.firstName} {contact.lastName}
                                                </h4>
                                                <p className="text-sm text-gray-600">{contact.title}</p>
                                                <p className="text-xs text-gray-500">{contact.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{contact.contactCount} contacts</p>
                                            <p className="text-xs text-gray-500">Last: {contact.lastContact}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 text-center">
                                <Button className="bg-green-600 text-white hover:bg-green-700">
                                    <a href={`/contacts/new?company=${companyId}`} className="flex items-center space-x-2">
                                        <Icon name="plus" className="w-4 h-4" />
                                        <span>Add New Contact</span>
                                    </a>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CompanyDetailsPage; 