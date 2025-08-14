"use client";

import { useState } from "react";
import Layout from "@/components/Layout/index";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Search from "@/components/Search";
import Button from "@/components/Button";
import Table from "@/components/Table";

interface Company {
    id: string;
    name: string;
    industry: string;
    location: string;
    country: string;
    department: string;
    contactCount: number;
    lastContact: string;
    doNotContact: boolean;
    status: "active" | "inactive";
}

const companies: Company[] = [
    {
        id: "1",
        name: "Microsoft Corporation",
        industry: "Technology",
        location: "Redmond, WA",
        country: "United States",
        department: "Commercial",
        contactCount: 23,
        lastContact: "2024-01-15",
        doNotContact: false,
        status: "active"
    },
    {
        id: "2",
        name: "Shopify Inc.",
        industry: "Technology",
        location: "Ottawa, ON",
        country: "Canada",
        department: "Technical",
        contactCount: 18,
        lastContact: "2024-01-14",
        doNotContact: false,
        status: "active"
    },
    {
        id: "3",
        name: "ClimateWorks Foundation",
        industry: "Non-profit",
        location: "San Francisco, CA",
        country: "United States",
        department: "Science",
        contactCount: 15,
        lastContact: "2024-01-13",
        doNotContact: false,
        status: "active"
    },
    {
        id: "4",
        name: "Stripe Inc.",
        industry: "Financial Technology",
        location: "San Francisco, CA",
        country: "United States",
        department: "Commercial",
        contactCount: 12,
        lastContact: "2024-01-10",
        doNotContact: false,
        status: "active"
    },
    {
        id: "5",
        name: "Carbon Engineering Ltd.",
        industry: "Clean Technology",
        location: "Squamish, BC",
        country: "Canada",
        department: "Science",
        contactCount: 8,
        lastContact: "2024-01-05",
        doNotContact: true,
        status: "inactive"
    },
];

const CompanyListPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             company.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = selectedDepartment === "all" || company.department === selectedDepartment;
        const matchesStatus = selectedStatus === "all" || company.status === selectedStatus;
        
        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const getStatusBadge = (status: string, doNotContact: boolean) => {
        if (doNotContact) {
            return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Do Not Contact</span>;
        }
        return status === "active" 
            ? <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
            : <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Inactive</span>;
    };

    const tableData = filteredCompanies.map(company => [
        <div key={company.id} className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                    {company.name.charAt(0)}
                </span>
            </div>
            <div>
                <a href={`/companies/${company.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                    {company.name}
                </a>
                <p className="text-sm text-gray-600">{company.industry}</p>
            </div>
        </div>,
        <div>
            <p className="text-sm text-gray-900">{company.location}</p>
            <p className="text-xs text-gray-600">{company.country}</p>
        </div>,
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {company.department}
        </span>,
        <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{company.contactCount}</p>
        </div>,
        <div>
            <p className="text-sm text-gray-900">{company.lastContact}</p>
        </div>,
        getStatusBadge(company.status, company.doNotContact),
        <div className="flex items-center space-x-2">
            <a href={`/companies/${company.id}`} className="text-blue-600 hover:text-blue-800">
                <Icon name="eye" className="w-4 h-4" />
            </a>
            <a href={`/companies/${company.id}/edit`} className="text-gray-600 hover:text-gray-800">
                <Icon name="edit" className="w-4 h-4" />
            </a>
            <a href={`/communications/log?company=${company.id}`} className="text-green-600 hover:text-green-800">
                <Icon name="message" className="w-4 h-4" />
            </a>
        </div>
    ]);

    const tableHeaders = [
        "Company",
        "Location", 
        "Department",
        "Contacts",
        "Last Contact",
        "Status",
        "Actions"
    ];

    return (
        <Layout title="Companies">
            <div className="space-y-6">
                <Card className="card" title="Filter Companies">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <Search
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full p-2 border border-gray-300 rounded-lg"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Actions</label>
                            <button 
                                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedDepartment("all");
                                    setSelectedStatus("all");
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </Card>

                <Card 
                    className="card" 
                    title={`Companies (${filteredCompanies.length})`}
                    headContent={
                        <Button className="bg-blue-600 text-white hover:bg-blue-700">
                            <a href="/companies/new" className="flex items-center space-x-2">
                                <Icon name="plus" className="w-4 h-4" />
                                <span>Add Company</span>
                            </a>
                        </Button>
                    }
                >
                    {filteredCompanies.length > 0 ? (
                        <Table
                            cellsThead={
                                <>
                                    {tableHeaders.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </>
                            }
                        >
                            {filteredCompanies.map((company, index) => (
                                <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    {tableData[index].map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="search" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No companies found matching your criteria</p>
                            <Button className="mt-4 bg-blue-600 text-white hover:bg-blue-700">
                                <a href="/companies/new">Add New Company</a>
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default CompanyListPage; 