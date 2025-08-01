"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Search from "@/components/Search";
import Table from "@/components/Table";

interface Meeting {
    id: string;
    title: string;
    companyName: string;
    contactName: string;
    date: string;
    time: string;
    duration: string;
    type: "in-person" | "video" | "phone";
    status: "completed" | "scheduled" | "cancelled";
    attendees: string[];
    department: string;
    user: string;
    location?: string;
    notes?: string;
}

const meetings: Meeting[] = [
    {
        id: "1",
        title: "Q1 2024 Partnership Strategy Review",
        companyName: "Microsoft Corporation",
        contactName: "Sarah Johnson",
        date: "2024-01-15",
        time: "14:00",
        duration: "60 min",
        type: "video",
        status: "completed",
        attendees: ["John Smith", "Jane Doe"],
        department: "Commercial",
        user: "John Smith",
        location: "Microsoft Teams",
        notes: "Discussed partnership expansion and Q1 targets"
    },
    {
        id: "2",
        title: "Technical Integration Deep Dive",
        companyName: "Shopify Inc.",
        contactName: "David Chen",
        date: "2024-01-14",
        time: "10:00",
        duration: "90 min",
        type: "video",
        status: "completed",
        attendees: ["Jane Doe", "Mike Brown"],
        department: "Technical",
        user: "Jane Doe",
        location: "Zoom",
        notes: "Reviewed API integration requirements and timeline"
    },
    {
        id: "3",
        title: "Carbon Removal Technology Demo",
        companyName: "ClimateWorks Foundation",
        contactName: "Emma Wilson",
        date: "2024-01-18",
        time: "15:30",
        duration: "45 min",
        type: "video",
        status: "scheduled",
        attendees: ["Mike Brown", "Tom Wilson"],
        department: "Science",
        user: "Mike Brown",
        location: "Google Meet"
    },
    {
        id: "4",
        title: "Partnership Kickoff Meeting",
        companyName: "Stripe Climate",
        contactName: "Alex Thompson",
        date: "2024-01-12",
        time: "11:00",
        duration: "30 min",
        type: "phone",
        status: "completed",
        attendees: ["Sarah Lee"],
        department: "Commercial",
        user: "Sarah Lee",
        notes: "Initial discussion about collaboration framework"
    },
    {
        id: "5",
        title: "Monthly Progress Sync",
        companyName: "Carbon Engineering",
        contactName: "Lisa Rodriguez",
        date: "2024-01-20",
        time: "09:00",
        duration: "30 min",
        type: "video",
        status: "scheduled",
        attendees: ["Tom Wilson"],
        department: "Science",
        user: "Tom Wilson",
        location: "Zoom"
    }
];

const MeetingsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredMeetings = meetings.filter(meeting => {
        const matchesSearch = 
            meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            meeting.contactName.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = filterDepartment === "all" || meeting.department === filterDepartment;
        const matchesType = filterType === "all" || meeting.type === filterType;
        const matchesStatus = filterStatus === "all" || meeting.status === filterStatus;
        
        return matchesSearch && matchesDepartment && matchesType && matchesStatus;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "video": return "video";
            case "phone": return "phone";
            case "in-person": return "users";
            default: return "calendar";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "video": return "text-blue-500 bg-blue-100";
            case "phone": return "text-green-500 bg-green-100";
            case "in-person": return "text-purple-500 bg-purple-100";
            default: return "text-gray-500 bg-gray-100";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed": return "bg-green-100 text-green-800";
            case "scheduled": return "bg-blue-100 text-blue-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const tableData = filteredMeetings.map(meeting => [
        <div key={meeting.id} className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${getTypeColor(meeting.type)}`}>
                <Icon name={getTypeIcon(meeting.type)} className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{meeting.title}</p>
                <p className="text-sm text-gray-600">{meeting.duration}</p>
            </div>
        </div>,
        <div>
            <a href={`/companies/${meeting.companyName}`} className="text-blue-600 hover:text-blue-800 font-medium">
                {meeting.companyName}
            </a>
            <p className="text-sm text-gray-600">{meeting.contactName}</p>
        </div>,
        <div>
            <p className="text-sm text-gray-900">{meeting.date}</p>
            <p className="text-xs text-gray-500">{meeting.time}</p>
        </div>,
        <div className="text-center">
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {meeting.department}
            </span>
        </div>,
        <div>
            <p className="text-sm text-gray-900">{meeting.user}</p>
            <p className="text-xs text-gray-500">{meeting.attendees.length} attendee(s)</p>
        </div>,
        <div className="text-center">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(meeting.status)}`}>
                {meeting.status}
            </span>
        </div>,
        <div className="flex items-center space-x-2">
            <button className="text-blue-600 hover:text-blue-800">
                <Icon name="eye" className="w-4 h-4" />
            </button>
            {meeting.status === "scheduled" && (
                <button className="text-green-600 hover:text-green-800">
                    <Icon name="edit" className="w-4 h-4" />
                </button>
            )}
            <a href={`/communications/log?meeting=${meeting.id}`} className="text-purple-600 hover:text-purple-800">
                <Icon name="message" className="w-4 h-4" />
            </a>
        </div>
    ]);

    const tableHeaders = [
        "Meeting Title",
        "Company",
        "Date & Time",
        "Department",
        "Organizer",
        "Status",
        "Actions"
    ];

    return (
        <Layout title="Meetings">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
                        <p className="text-gray-600">Track and manage all meeting communications</p>
                    </div>
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
                        <a href="/communications/log" className="flex items-center space-x-2">
                            <Icon name="plus" className="w-4 h-4" />
                            <span>Log Meeting</span>
                        </a>
                    </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="card" title="Total Meetings">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">{meetings.length}</p>
                            <p className="text-sm text-gray-600 mt-1">All time</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="Completed">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {meetings.filter(m => m.status === "completed").length}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Meetings held</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="Scheduled">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-blue-600">
                                {meetings.filter(m => m.status === "scheduled").length}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Upcoming</p>
                        </div>
                    </Card>
                    
                    <Card className="card" title="Video Calls">
                        <div className="p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">
                                {meetings.filter(m => m.type === "video").length}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">Virtual meetings</p>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="card" title="Filter Meetings">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <Search
                                placeholder="Search meetings..."
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Types</option>
                                <option value="video">Video Call</option>
                                <option value="phone">Phone Call</option>
                                <option value="in-person">In Person</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <Button 
                                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterDepartment("all");
                                    setFilterType("all");
                                    setFilterStatus("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Meetings List */}
                <Card className="card" title={`Meetings (${filteredMeetings.length})`}>
                    {filteredMeetings.length > 0 ? (
                        <Table
                            cellsThead={
                                <>
                                    {tableHeaders.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </>
                            }
                        >
                            {filteredMeetings.map((meeting, index) => (
                                <tr key={meeting.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    {tableData[index].map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="calendar" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No meetings found matching your criteria</p>
                            <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                                <a href="/communications/log">Log Meeting</a>
                            </Button>
                        </div>
                    )}
                </Card>

                {/* Upcoming Meetings */}
                {meetings.filter(m => m.status === "scheduled").length > 0 && (
                    <Card className="card" title="Upcoming Meetings">
                        <div className="space-y-3">
                            {meetings.filter(m => m.status === "scheduled").map((meeting) => (
                                <div key={meeting.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${getTypeColor(meeting.type)}`}>
                                            <Icon name={getTypeIcon(meeting.type)} className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                                            <p className="text-sm text-gray-600">
                                                {meeting.companyName} • {meeting.contactName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{meeting.date}</p>
                                        <p className="text-xs text-gray-500">{meeting.time} • {meeting.duration}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default MeetingsPage; 