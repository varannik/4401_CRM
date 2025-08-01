"use client";

import Card from "@/components/Card";
import Icon from "@/components/Icon";

interface Alert {
    id: string;
    type: "overdue" | "reminder" | "followup" | "warning";
    companyName: string;
    message: string;
    daysOverdue?: number;
    priority: "high" | "medium" | "low";
}

const alerts: Alert[] = [
    {
        id: "1",
        type: "overdue",
        companyName: "Shopify",
        message: "No contact in 45 days",
        daysOverdue: 45,
        priority: "high"
    },
    {
        id: "2", 
        type: "reminder",
        companyName: "Google Cloud",
        message: "Follow-up meeting scheduled for today",
        priority: "high"
    },
    {
        id: "3",
        type: "followup",
        companyName: "Amazon Sustainability",
        message: "Awaiting response to proposal", 
        daysOverdue: 7,
        priority: "medium"
    },
    {
        id: "4",
        type: "warning",
        companyName: "Meta Climate",
        message: "Marked as Do Not Contact",
        priority: "low"
    }
];

const CommunicationAlerts = () => {
    const getAlertIcon = (type: string) => {
        switch (type) {
            case "overdue":
                return "clock";
            case "reminder":
                return "bell";
            case "followup":
                return "arrow-right";
            case "warning":
                return "warning";
            default:
                return "info";
        }
    };

    const getAlertColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "border-red-200 bg-red-50";
            case "medium":
                return "border-yellow-200 bg-yellow-50";
            case "low":
                return "border-gray-200 bg-gray-50";
            default:
                return "border-gray-200 bg-gray-50";
        }
    };

    const getIconColor = (priority: string) => {
        switch (priority) {
            case "high":
                return "text-red-500";
            case "medium":
                return "text-yellow-500";
            case "low":
                return "text-gray-500";
            default:
                return "text-gray-500";
        }
    };

    return (
        <Card
            className="card"
            title="Communication Alerts"
            headContent={
                <a href="/communications/alerts" className="text-sm text-blue-600 hover:text-blue-800">
                    View all
                </a>
            }
        >
            <div className="space-y-3">
                {alerts.map((alert) => (
                    <div 
                        key={alert.id} 
                        className={`p-3 border rounded-lg ${getAlertColor(alert.priority)}`}
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`p-1 rounded-full ${getIconColor(alert.priority)}`}>
                                <Icon name={getAlertIcon(alert.type)} className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {alert.companyName}
                                    </h4>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        alert.priority === "high" ? "bg-red-100 text-red-800" :
                                        alert.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-gray-100 text-gray-600"
                                    }`}>
                                        {alert.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                {alert.daysOverdue && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {alert.daysOverdue} days overdue
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                    <Icon name="info" className="w-4 h-4 text-blue-500" />
                    <p className="text-sm text-blue-700">
                        <span className="font-medium">4 companies</span> need follow-up this week
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default CommunicationAlerts; 