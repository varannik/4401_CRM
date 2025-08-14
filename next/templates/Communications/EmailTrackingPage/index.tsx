"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Search from "@/components/Search";
import Table from "@/components/Table";

interface EmailCommunication {
    id: string;
    subject: string;
    companyName: string;
    contactName: string;
    contactEmail: string;
    date: string;
    time: string;
    user: string;
    department: string;
    direction: "sent" | "received";
    hasAttachments: boolean;
    notes?: string;
}

const emailCommunications: EmailCommunication[] = [
    {
        id: "1",
        subject: "Q1 2024 Partnership Review and Next Steps",
        companyName: "Microsoft Corporation",
        contactName: "Sarah Johnson",
        contactEmail: "sarah.johnson@microsoft.com",
        date: "2024-01-15",
        time: "14:30",
        user: "John Smith",
        department: "Commercial",
        direction: "sent",
        hasAttachments: false,
        notes: "Discussed quarterly targets and proposed expansion areas"
    },
    {
        id: "2",
        subject: "Re: Technical Integration Requirements",
        companyName: "Shopify Inc.",
        contactName: "David Chen",
        contactEmail: "david.chen@shopify.com",
        date: "2024-01-14",
        time: "16:45",
        user: "Jane Doe",
        department: "Technical",
        direction: "received",
        hasAttachments: true,
        notes: "Response with technical specifications and timeline"
    },
    {
        id: "3",
        subject: "Follow-up on Carbon Removal Proposal",
        companyName: "ClimateWorks Foundation",
        contactName: "Emma Wilson",
        contactEmail: "emma.wilson@climateworks.org",
        date: "2024-01-13",
        time: "11:20",
        user: "Mike Brown",
        department: "Science",
        direction: "sent",
        hasAttachments: true,
        notes: "Sent updated proposal with cost estimates"
    },
    {
        id: "4",
        subject: "Partnership Inquiry - Stripe Climate",
        companyName: "Stripe Climate",
        contactName: "Alex Thompson",
        contactEmail: "alex.thompson@stripe.com",
        date: "2024-01-12",
        time: "09:15",
        user: "Sarah Lee",
        department: "Commercial",
        direction: "received",
        hasAttachments: false,
        notes: "Initial inquiry about collaboration opportunities"
    },
    {
        id: "5",
        subject: "Monthly Progress Update",
        companyName: "Carbon Engineering",
        contactName: "Lisa Rodriguez",
        contactEmail: "lisa.rodriguez@carbonengineering.com",
        date: "2024-01-10",
        time: "13:00",
        user: "Tom Wilson",
        department: "Science",
        direction: "sent",
        hasAttachments: false,
        notes: "Shared progress on DAC technology development"
    }
];

const EmailTrackingPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterDirection, setFilterDirection] = useState("all");
    const [filterDateRange, setFilterDateRange] = useState("all");

    const filteredEmails = emailCommunications.filter(email => {
        const matchesSearch = 
            email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = filterDepartment === "all" || email.department === filterDepartment;
        const matchesDirection = filterDirection === "all" || email.direction === filterDirection;
        
        // Date filtering logic would go here
        const matchesDate = filterDateRange === "all"; // Simplified for now
        
        return matchesSearch && matchesDepartment && matchesDirection && matchesDate;
    });

    const getDirectionIcon = (direction: string) => {
        return direction === "sent" ? "arrow-up" : "arrow-down";
    };

    const getDirectionColor = (direction: string) => {
        return direction === "sent" ? "text-blue-500 bg-blue-100" : "text-green-500 bg-green-100";
    };

    const tableData = filteredEmails.map(email => [
        <div key={email.id} className="flex items-center space-x-3">
            <div className={`p-1 rounded-full ${getDirectionColor(email.direction)}`}>
                <Icon name={getDirectionIcon(email.direction)} className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{email.subject}</p>
                <p className="text-sm text-gray-600 truncate">{email.contactEmail}</p>
            </div>
        </div>,
        <div>
            <a href={`/companies/${email.companyName}`} className="text-blue-600 hover:text-blue-800 font-medium">
                {email.companyName}
            </a>
            <p className="text-sm text-gray-600">{email.contactName}</p>
        </div>,
        <div>
            <p className="text-sm text-gray-900">{email.date}</p>
            <p className="text-xs text-gray-500">{email.time}</p>
        </div>,
        <div className="text-center">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {email.department}
            </span>
        </div>,
        <div className="text-center">
            <p className="text-sm text-gray-900">{email.user}</p>
        </div>,
        <div className="flex items-center justify-center space-x-2">
            {email.hasAttachments && (
                <Icon name="attachment" className="w-4 h-4 text-gray-400" />
            )}
            <span className={`px-2 py-1 text-xs rounded-full ${
                email.direction === "sent" 
                    ? "bg-blue-100 text-blue-800" 
                    : "bg-green-100 text-green-800"
            }`}>
                {email.direction}
            </span>
        </div>,
        <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-800">
                <Icon name="eye" className="w-4 h-4" />
            </button>
            <a href={`/communications/log?email=${email.id}`} className="text-green-600 hover:text-green-800">
                <Icon name="message" className="w-4 h-4" />
            </a>
        </div>
    ]);

    const tableHeaders = [
        "Subject & Contact",
        "Company",
        "Date & Time",
        "Department", 
        "44.01 User",
        "Status",
        "Actions"
    ];

    return (
        <Layout title="Email Tracking">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Email Tracking</h1>
                        <p className="text-gray-600">Monitor and track all email communications</p>
                    </div>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                        <a href="/communications/log" className="flex items-center space-x-2">
                            <Icon name="plus" className="w-4 h-4" />
                            <span>Log Email</span>
                        </a>
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="card" title="Total Emails">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{emailCommunications.length}</p>
                            <p className="text-sm text-gray-600 mt-1">All time</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="Sent">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {emailCommunications.filter(e => e.direction === "sent").length}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Outgoing emails</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="Received">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {emailCommunications.filter(e => e.direction === "received").length}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Incoming emails</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="With Attachments">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {emailCommunications.filter(e => e.hasAttachments).length}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Files shared</p>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="card" title="Filter Emails">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <Search
                                placeholder="Search emails..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <option value="all">All Departments</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Technical">Technical</option>
                                <option value="Science">Science</option>
                                <option value="Communications">Communications</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={filterDirection}
                                onChange={(e) => setFilterDirection(e.target.value)}
                            >
                                <option value="all">All Directions</option>
                                <option value="sent">Sent</option>
                                <option value="received">Received</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={filterDateRange}
                                onChange={(e) => setFilterDateRange(e.target.value)}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button 
                                className="w-full p-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterDepartment("all");
                                    setFilterDirection("all");
                                    setFilterDateRange("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Email List */}
                <Card className="card" title={`Email Communications (${filteredEmails.length})`}>
                    {filteredEmails.length > 0 ? (
                        <Table
                            cellsThead={
                                <>
                                    {tableHeaders.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </>
                            }
                        >
                            {filteredEmails.map((email, index) => (
                                <tr key={email.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    {tableData[index].map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="mail" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No emails found matching your criteria</p>
                            <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                                <a href="/communications/log">Log Email Communication</a>
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Privacy Notice */}
                <Card className="card" title="Privacy & Data Policy">
                    <div className="p-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Icon name="info" className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900">Email Privacy Protection</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        This system only tracks email metadata (subject, sender, recipient, date/time) and your notes. 
                                        Email content is never stored or analyzed to protect privacy and comply with data protection regulations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export default EmailTrackingPage; 