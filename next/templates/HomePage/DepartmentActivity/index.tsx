"use client";

import Card from "@/components/Card";
import Icon from "@/components/Icon";

interface DepartmentMetrics {
    id: string;
    name: string;
    contactsThisWeek: number;
    companiesManaged: number;
    responseRate: number;
    trend: "up" | "down" | "stable";
}

const departmentMetrics: DepartmentMetrics[] = [
    {
        id: "1",
        name: "Commercial",
        contactsThisWeek: 23,
        companiesManaged: 45,
        responseRate: 87,
        trend: "up"
    },
    {
        id: "2",
        name: "Technical", 
        contactsThisWeek: 18,
        companiesManaged: 32,
        responseRate: 92,
        trend: "up"
    },
    {
        id: "3",
        name: "Science",
        contactsThisWeek: 12,
        companiesManaged: 28,
        responseRate: 89,
        trend: "stable"
    },
    {
        id: "4",
        name: "Communications",
        contactsThisWeek: 8,
        companiesManaged: 15,
        responseRate: 94,
        trend: "up"
    }
];

const DepartmentActivity = () => {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "up":
                return "arrow-up";
            case "down":
                return "arrow-down";
            case "stable":
                return "minus";
            default:
                return "minus";
        }
    };

    const getTrendColor = (trend: string) => {
        switch (trend) {
            case "up":
                return "text-green-500";
            case "down":
                return "text-red-500";
            case "stable":
                return "text-gray-500";
            default:
                return "text-gray-500";
        }
    };

    return (
        <Card
            className="card"
            title="Department Activity"
            headContent={
                <a href="/reports/departments" className="text-sm text-blue-600 hover:text-blue-800">
                    View report
                </a>
            }
        >
            <div className="space-y-4">
                {departmentMetrics.map((dept) => (
                    <div key={dept.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">{dept.name}</h4>
                            <div className={`flex items-center space-x-1 ${getTrendColor(dept.trend)}`}>
                                <Icon name={getTrendIcon(dept.trend)} className="w-4 h-4" />
                                <span className="text-sm">{dept.responseRate}%</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">{dept.contactsThisWeek}</p>
                                <p className="text-xs text-gray-600">Contacts this week</p>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">{dept.companiesManaged}</p>
                                <p className="text-xs text-gray-600">Companies managed</p>
                            </div>
                        </div>
                        
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Response Rate</span>
                                <span>{dept.responseRate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${
                                        dept.responseRate >= 90 ? "bg-green-500" : 
                                        dept.responseRate >= 80 ? "bg-yellow-500" : "bg-red-500"
                                    }`}
                                    style={{ width: `${dept.responseRate}%` }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default DepartmentActivity; 