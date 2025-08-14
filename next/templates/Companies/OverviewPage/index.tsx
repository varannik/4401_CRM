"use client";

import Layout from "@/components/Layout/index";
import Card from "@/components/Card";
import CardChartPie from "@/components/CardChartPie";
import Icon from "@/components/Icon";

const companyStats = [
    {
        title: "Total Companies",
        value: 245,
        change: "+12%",
        trend: "up" as const,
        icon: "wallet"
    },
    {
        title: "Active Relationships",
        value: 187,
        change: "+8%",
        trend: "up" as const,
        icon: "check"
    },
    {
        title: "This Month Contacts",
        value: 89,
        change: "+15%",
        trend: "up" as const,
        icon: "message"
    },
    {
        title: "Do Not Contact",
        value: 12,
        change: "-2%",
        trend: "down" as const,
        icon: "warning"
    },
];

const industryData = [
    { name: "Technology", value: 45 },
    { name: "Financial Services", value: 28 },
    { name: "Energy", value: 15 },
    { name: "Manufacturing", value: 8 },
    { name: "Healthcare", value: 4 },
];

const recentCompanies = [
    {
        id: "1",
        name: "Microsoft Corporation",
        industry: "Technology",
        location: "United States",
        department: "Commercial",
        lastContact: "2024-01-15",
        status: "active"
    },
    {
        id: "2",
        name: "Shopify Inc.",
        industry: "Technology", 
        location: "Canada",
        department: "Technical",
        lastContact: "2024-01-14",
        status: "active"
    },
    {
        id: "3",
        name: "ClimateWorks Foundation",
        industry: "Non-profit",
        location: "United States",
        department: "Science",
        lastContact: "2024-01-13",
        status: "active"
    },
];

const CompaniesOverviewPage = () => {
    return (
        <Layout title="Companies Overview">
            <div className="flex max-lg:block">
                <div className="col-left">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {companyStats.map((stat, index) => (
                            <Card key={index} className="card" title={stat.title}>
                                <div className="flex items-center justify-between p-4">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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

                    <Card className="card" title="Recent Companies">
                        <div className="space-y-4">
                            {recentCompanies.map((company) => (
                                <div key={company.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-medium">
                                                {company.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{company.name}</h4>
                                            <p className="text-sm text-gray-600">
                                                {company.industry} • {company.location}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Last contact</p>
                                        <p className="text-sm font-medium text-gray-900">{company.lastContact}</p>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            {company.department}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <a href="/companies/list" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View all companies →
                            </a>
                        </div>
                    </Card>
                </div>

                <div className="col-right">
                    <CardChartPie 
                        title="Companies by Industry"
                        data={industryData}
                    />

                    <Card className="card mt-6" title="Quick Actions">
                        <div className="space-y-3">
                            <a href="/companies/new" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                    <Icon name="plus" className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Add New Company</h4>
                                    <p className="text-sm text-gray-600">Register a new company in the CRM</p>
                                </div>
                            </a>
                            
                            <a href="/companies/search" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                    <Icon name="search" className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Search Companies</h4>
                                    <p className="text-sm text-gray-600">Find companies by name, industry, or location</p>
                                </div>
                            </a>

                            <a href="/reports/companies" className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-3 group-hover:scale-105 transition-transform">
                                    <Icon name="chart" className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">View Reports</h4>
                                    <p className="text-sm text-gray-600">Analyze company relationship data</p>
                                </div>
                            </a>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default CompaniesOverviewPage; 