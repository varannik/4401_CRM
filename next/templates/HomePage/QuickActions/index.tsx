"use client";

import Card from "@/components/Card";
import Icon from "@/components/Icon";

interface QuickAction {
    id: string;
    title: string;
    description: string;
    href: string;
    icon: string;
    color: string;
}

const quickActions: QuickAction[] = [
    {
        id: "1",
        title: "Log Communication",
        description: "Record a new interaction",
        href: "/communications/log",
        icon: "message",
        color: "bg-blue-100 text-blue-600"
    },
    {
        id: "2",
        title: "Add Company",
        description: "Register new company",
        href: "/companies/new",
        icon: "plus",
        color: "bg-green-100 text-green-600"
    },
    {
        id: "3",
        title: "Add Contact",
        description: "Create new contact",
        href: "/contacts/new", 
        icon: "profile",
        color: "bg-purple-100 text-purple-600"
    },
    {
        id: "4",
        title: "Search Companies",
        description: "Find existing companies",
        href: "/companies/search",
        icon: "search",
        color: "bg-orange-100 text-orange-600"
    },
    {
        id: "5",
        title: "View Reports",
        description: "Relationship analytics",
        href: "/reports",
        icon: "chart",
        color: "bg-pink-100 text-pink-600"
    },
    {
        id: "6",
        title: "Manage Settings",
        description: "Configure departments",
        href: "/settings",
        icon: "settings",
        color: "bg-gray-100 text-gray-600"
    }
];

const QuickActions = () => {
    return (
        <Card className="card" title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                    <a
                        key={action.id}
                        href={action.href}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                                <Icon name={action.icon} className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {action.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1 leading-tight">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    </a>
                ))}
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                    <Icon name="info" className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Need help?</p>
                        <p className="text-xs text-blue-700 mt-1">
                            Check out our <a href="/help" className="underline">user guide</a> for tips on managing relationships effectively.
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default QuickActions; 