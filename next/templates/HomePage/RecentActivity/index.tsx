"use client";

import Card from "@/components/Card";
import Icon from "@/components/Icon";

interface Communication {
    id: string;
    companyName: string;
    contactName: string;
    type: string;
    subject?: string;
    date: string;
    department: string;
}

const recentCommunications: Communication[] = [
    {
        id: "1",
        companyName: "ClimateWorks Foundation",
        contactName: "Sarah Johnson",
        type: "EMAIL",
        subject: "Follow-up on carbon removal proposal",
        date: "2024-01-15",
        department: "Commercial"
    },
    {
        id: "2", 
        companyName: "Microsoft Sustainability",
        contactName: "David Chen",
        type: "MEETING",
        subject: "Technical integration discussion",
        date: "2024-01-14",
        department: "Technical"
    },
    {
        id: "3",
        companyName: "Stripe Climate",
        contactName: "Emma Wilson",
        type: "EMAIL",
        subject: "Partnership opportunities",
        date: "2024-01-13",
        department: "Commercial"
    },
    {
        id: "4",
        companyName: "Carbon Engineering",
        contactName: "Mark Thompson",
        type: "PHONE",
        date: "2024-01-12",
        department: "Science"
    }
];

const RecentActivity = () => {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case "EMAIL":
                return "message";
            case "MEETING":
                return "calendar";
            case "PHONE":
                return "phone";
            default:
                return "message";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "EMAIL":
                return "text-blue-500";
            case "MEETING":
                return "text-green-500";
            case "PHONE":
                return "text-purple-500";
            default:
                return "text-gray-500";
        }
    };

    return (
        <Card
            className="card"
            title="Recent Activity"
            headContent={
                <a href="/communications" className="text-sm text-blue-600 hover:text-blue-800">
                    View all
                </a>
            }
        >
            <div className="space-y-4">
                {recentCommunications.map((comm) => (
                    <div key={comm.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className={`p-2 rounded-full bg-gray-100 ${getTypeColor(comm.type)}`}>
                            <Icon name={getTypeIcon(comm.type)} className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {comm.companyName}
                                </h4>
                                <span className="text-xs text-gray-500">{comm.date}</span>
                            </div>
                            <p className="text-sm text-gray-600">{comm.contactName}</p>
                            {comm.subject && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{comm.subject}</p>
                            )}
                            <div className="flex items-center mt-2 space-x-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    {comm.department}
                                </span>
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    {comm.type}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RecentActivity; 