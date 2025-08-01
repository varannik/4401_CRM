"use client";

import Card from "@/components/Card";
import CardChartPie from "@/components/CardChartPie";

const companyData = [
    {
        title: "Total Companies",
        value: 245,
        change: "+12%",
        trend: "up" as const,
    },
    {
        title: "Active Relationships",
        value: 187,
        change: "+8%", 
        trend: "up" as const,
    },
    {
        title: "This Month Contacts",
        value: 89,
        change: "+15%",
        trend: "up" as const,
    },
    {
        title: "Do Not Contact",
        value: 12,
        change: "-2%",
        trend: "down" as const,
    },
];

const departmentEngagement = [
    { name: "Commercial", value: 45, color: "#3B82F6" },
    { name: "Technical", value: 28, color: "#10B981" }, 
    { name: "Science", value: 15, color: "#F59E0B" },
    { name: "Communications", value: 8, color: "#EF4444" },
    { name: "Admin", value: 4, color: "#8B5CF6" },
];

const CompanyInsights = () => {
    return (
        <Card className="card" title="Company Insights">
            <div className="grid grid-cols-2 gap-4 mb-6">
                {companyData.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">{item.title}</p>
                                <p className="text-lg font-semibold text-gray-900">{item.value}</p>
                            </div>
                            <div className={`text-xs font-medium ${
                                item.trend === "up" ? "text-green-600" : "text-red-600"
                            }`}>
                                {item.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6">
                <CardChartPie 
                    title="Department Engagement"
                    data={departmentEngagement}
                />
            </div>
        </Card>
    );
};

export default CompanyInsights; 