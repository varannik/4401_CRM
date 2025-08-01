"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import CardChartPie from "@/components/CardChartPie";
import Icon from "@/components/Icon";
import Button from "@/components/Button";

const communicationStats = [
    {
        title: "Total Communications",
        value: 1247,
        change: "+18%",
        trend: "up" as const,
        icon: "message"
    },
    {
        title: "This Week",
        value: 89,
        change: "+12%",
        trend: "up" as const,
        icon: "calendar"
    },
    {
        title: "Companies Contacted",
        value: 156,
        change: "+5%",
        trend: "up" as const,
        icon: "wallet"
    },
    {
        title: "Response Rate",
        value: 87,
        change: "+3%",
        trend: "up" as const,
        icon: "check",
        suffix: "%"
    },
];

const communicationTypes = [
    { name: "Email", value: 65 },
    { name: "Meetings", value: 25 },
    { name: "Phone", value: 8 },
    { name: "Video Call", value: 2 }
];

const departmentActivity = [
    { name: "Commercial", value: 45 },
    { name: "Technical", value: 28 },
    { name: "Science", value: 15 },
    { name: "Communications", value: 8 },
    { name: "Admin", value: 4 }
];

const recentCommunications = [
    {
        id: "1",
        type: "EMAIL",
        subject: "Q1 2024 Partnership Review",
        companyName: "Microsoft Corporation",
        contactName: "Sarah Johnson",
        date: "2024-01-15",
        time: "14:30",
        user: "John Smith",
        department: "Commercial"
    },
    {
        id: "2",
        type: "MEETING",
        subject: "Technical Integration Discussion",
        companyName: "Shopify Inc.",
        contactName: "David Chen",
        date: "2024-01-15",
        time: "10:00",
        user: "Jane Doe",
        department: "Technical"
    },
    {
        id: "3",
        type: "EMAIL",
        subject: "Follow-up on carbon removal proposal",
        companyName: "ClimateWorks Foundation",
        contactName: "Emma Wilson",
        date: "2024-01-14",
        time: "16:45",
        user: "Mike Brown",
        department: "Science"
    },
    {
        id: "4",
        type: "PHONE",
        subject: "Partnership inquiry",
        companyName: "Stripe Climate",
        contactName: "Alex Thompson",
        date: "2024-01-14",
        time: "11:20",
        user: "Sarah Lee",
        department: "Commercial"
    },
    {
        id: "5",
        type: "VIDEO_CALL",
        subject: "Monthly sync meeting",
        companyName: "Carbon Engineering",
        contactName: "Lisa Rodriguez",
        date: "2024-01-13",
        time: "09:00",
        user: "Tom Wilson",
        department: "Science"
    }
];

const CommunicationsOverviewPage = () => {
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterType, setFilterType] = useState("all");

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "EMAIL": return "message";
            case "MEETING": return "calendar";
            case "PHONE": return "phone";
            case "VIDEO_CALL": return "video";
            default: return "message";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "EMAIL": return "text-blue-500 bg-blue-100";
            case "MEETING": return "text-green-500 bg-green-100";
            case "PHONE": return "text-purple-500 bg-purple-100";
            case "VIDEO_CALL": return "text-orange-500 bg-orange-100";
            default: return "text-gray-500 bg-gray-100";
        }
    };

    const filteredCommunications = recentCommunications.filter(comm => {
        const matchesDepartment = filterDepartment === "all" || comm.department === filterDepartment;
        const matchesType = filterType === "all" || comm.type === filterType;
        return matchesDepartment && matchesType;
    });

    return (
        <Layout title="Communications Overview">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Communications Overview</h1>
                        <p className="text-gray-600">Track and manage all company interactions</p>
                    </div>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                        <a href="/communications/log" className="flex items-center space-x-2">
                            <Icon name="plus" className="w-4 h-4" />
                            <span>Log Communication</span>
                        </a>
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-4 gap-4">
                    {communicationStats.map((stat, index) => (
                        <Card key={index} className="card" title={stat.title}>
                            <div className="flex items-center justify-between p-4">
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.value}{stat.suffix || ""}
                                    </p>
                                    <p className={`text-sm font-medium ${
                                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                                    }`}>
                                        {stat.change} from last month
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <Icon name={stat.icon} className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex max-lg:block">
                    <div className="col-left">
                        {/* Filters */}
                        <Card className="card mb-6" title="Filter Communications">
                            <div className="grid grid-cols-3 gap-4 p-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select 
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="EMAIL">Email</option>
                                        <option value="MEETING">Meeting</option>
                                        <option value="PHONE">Phone</option>
                                        <option value="VIDEO_CALL">Video Call</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <Button 
                                        className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        onClick={() => {
                                            setFilterDepartment("all");
                                            setFilterType("all");
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Recent Communications */}
                        <Card 
                            className="card" 
                            title={`Recent Communications (${filteredCommunications.length})`}
                            headContent={
                                <a href="/communications/history" className="text-sm text-blue-600 hover:text-blue-800">
                                    View all
                                </a>
                            }
                        >
                            <div className="space-y-4">
                                {filteredCommunications.map((comm) => (
                                    <div key={comm.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                        <div className={`p-2 rounded-full ${getTypeColor(comm.type)}`}>
                                            <Icon name={getTypeIcon(comm.type)} className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium text-gray-900">{comm.subject}</h4>
                                                <div className="text-right">
                                                    <span className="text-sm text-gray-500">{comm.date}</span>
                                                    <span className="text-xs text-gray-400 block">{comm.time}</span>
                                                </div>
                                            </div>
                                            <div className="mt-1">
                                                <p className="text-sm text-gray-600">
                                                    <a href={`/companies/${comm.companyName}`} className="text-blue-600 hover:text-blue-800">
                                                        {comm.companyName}
                                                    </a>
                                                    {comm.contactName && (
                                                        <span> • {comm.contactName}</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    by {comm.user}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                                    {comm.department}
                                                </span>
                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                    {comm.type.replace("_", " ")}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="col-right">
                        {/* Communication Types */}
                        <CardChartPie 
                            title="Communication Types"
                            data={communicationTypes}
                        />

                        {/* Department Activity */}
                        <CardChartPie 
                            title="Department Activity"
                            data={departmentActivity}
                        />

                        {/* Quick Actions */}
                        <Card className="card mt-6" title="Quick Actions">
                            <div className="space-y-3">
                                <a href="/communications/log" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                        <Icon name="message" className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Log Communication</h4>
                                        <p className="text-sm text-gray-600">Record a new interaction</p>
                                    </div>
                                </a>
                                
                                <a href="/communications/emails" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                        <Icon name="mail" className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Email Tracking</h4>
                                        <p className="text-sm text-gray-600">View email communications</p>
                                    </div>
                                </a>

                                <a href="/communications/meetings" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                        <Icon name="calendar" className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Meetings</h4>
                                        <p className="text-sm text-gray-600">Track meeting interactions</p>
                                    </div>
                                </a>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CommunicationsOverviewPage; 