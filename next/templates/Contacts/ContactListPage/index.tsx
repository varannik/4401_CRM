"use client";

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Search from "@/components/Search";
import Button from "@/components/Button";
import Table from "@/components/Table";

interface Contact {
    id: string;
    name: string;
    email: string;
    organization: string;
    organizationType: string;
    industry: string;
    location: string;
    lastContact: string;
    contactCount: number;
    tags: string[];
    doNotContact: boolean;
    status: "active" | "inactive";
}

interface ContactListPageProps {
    filterType?: string;
}

const mockContacts: Contact[] = [
    {
        id: "1",
        name: "Dr. Sarah Johnson",
        email: "s.johnson@mit.edu",
        organization: "MIT Energy Initiative",
        organizationType: "UNIVERSITY",
        industry: "Education",
        location: "Cambridge, MA",
        lastContact: "2024-01-15",
        contactCount: 12,
        tags: ["research", "energy", "collaboration", "academic"],
        doNotContact: false,
        status: "active"
    },
    {
        id: "2",
        name: "Michael Chen",
        email: "m.chen@shopify.com",
        organization: "Shopify Inc.",
        organizationType: "COMPANY",
        industry: "Technology",
        location: "Ottawa, Canada",
        lastContact: "2024-01-14",
        contactCount: 8,
        tags: ["technology", "e-commerce", "startup"],
        doNotContact: false,
        status: "active"
    },
    {
        id: "3",
        name: "Prof. Elena Rodriguez",
        email: "e.rodriguez@stanford.edu",
        organization: "Stanford University",
        organizationType: "UNIVERSITY",
        industry: "Education",
        location: "Stanford, CA",
        lastContact: "2024-01-13",
        contactCount: 15,
        tags: ["academic", "research", "climate", "university"],
        doNotContact: false,
        status: "active"
    },
    {
        id: "4",
        name: "James Wilson",
        email: "j.wilson@climateworks.org",
        organization: "ClimateWorks Foundation",
        organizationType: "NON_PROFIT",
        industry: "Non-profit",
        location: "San Francisco, CA",
        lastContact: "2024-01-12",
        contactCount: 6,
        tags: ["non-profit", "climate", "funding", "foundation"],
        doNotContact: false,
        status: "active"
    },
    {
        id: "5",
        name: "Lisa Park",
        email: "l.park@microsoft.com",
        organization: "Microsoft Corporation",
        organizationType: "COMPANY",
        industry: "Technology",
        location: "Redmond, WA",
        lastContact: "2024-01-11",
        contactCount: 20,
        tags: ["enterprise", "technology", "partnership", "large-corporation"],
        doNotContact: false,
        status: "active"
    },
    {
        id: "6",
        name: "Dr. Ahmed Hassan",
        email: "a.hassan@doe.gov",
        organization: "Department of Energy",
        organizationType: "GOVERNMENT",
        industry: "Government",
        location: "Washington, DC",
        lastContact: "2024-01-10",
        contactCount: 4,
        tags: ["government", "energy", "policy", "public-sector"],
        doNotContact: false,
        status: "active"
    }
];

const organizationTypes = [
    { value: "", label: "All Types" },
    { value: "COMPANY", label: "Companies" },
    { value: "UNIVERSITY", label: "Universities" },
    { value: "GOVERNMENT", label: "Government" },
    { value: "NON_PROFIT", label: "Non-Profit" },
    { value: "RESEARCH_INSTITUTE", label: "Research Institutes" },
];

const getTypeColor = (type: string) => {
    switch (type) {
        case "UNIVERSITY": return "text-green-600 bg-green-100";
        case "COMPANY": return "text-blue-600 bg-blue-100";
        case "GOVERNMENT": return "text-red-600 bg-red-100";
        case "NON_PROFIT": return "text-purple-600 bg-purple-100";
        case "RESEARCH_INSTITUTE": return "text-orange-600 bg-orange-100";
        default: return "text-gray-600 bg-gray-100";
    }
};

const getPageTitle = (filterType?: string) => {
    switch (filterType) {
        case "COMPANY": return "Companies";
        case "UNIVERSITY": return "Universities";
        case "GOVERNMENT": return "Government Organizations";
        case "NON_PROFIT": return "Non-Profit Organizations";
        case "RESEARCH_INSTITUTE": return "Research Institutes";
        default: return "All Contacts";
    }
};

const ContactListPage = ({ filterType }: ContactListPageProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState(filterType || "");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Get all unique tags from contacts
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        mockContacts.forEach(contact => {
            contact.tags.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, []);

    // Filter contacts based on search, type, and tags
    const filteredContacts = useMemo(() => {
        return mockContacts.filter(contact => {
            const matchesSearch = !searchTerm || 
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.organization.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = !selectedType || contact.organizationType === selectedType;
            
            const matchesTags = selectedTags.length === 0 || 
                selectedTags.every(tag => contact.tags.includes(tag));
            
            return matchesSearch && matchesType && matchesTags;
        });
    }, [searchTerm, selectedType, selectedTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const tableHeaders = ["Contact", "Organization", "Type", "Last Contact", "Communications", "Tags", "Actions"];

    const tableData = filteredContacts.map((contact) => [
        <div key="contact" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">
                    {contact.name.split(' ').map(n => n[0]).join('')}
                </span>
            </div>
            <div>
                <p className="font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.email}</p>
            </div>
        </div>,
        <div key="organization">
            <p className="font-medium text-gray-900">{contact.organization}</p>
            <p className="text-sm text-gray-600">{contact.location}</p>
        </div>,
        <span key="type" className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contact.organizationType)}`}>
            {contact.organizationType.replace('_', ' ')}
        </span>,
        <span key="lastContact" className="text-sm text-gray-900">
            {new Date(contact.lastContact).toLocaleDateString()}
        </span>,
        <div key="communications" className="text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {contact.contactCount}
            </span>
        </div>,
        <div key="tags" className="max-w-32">
            <div className="flex flex-wrap gap-1">
                {contact.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {tag}
                    </span>
                ))}
                {contact.tags.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        +{contact.tags.length - 2}
                    </span>
                )}
            </div>
        </div>,
        <div key="actions" className="flex space-x-2">
            <Button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200">
                <Icon name="edit" className="w-3 h-3" />
            </Button>
            <Button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                <Icon name="message" className="w-3 h-3" />
            </Button>
        </div>
    ]);

    return (
        <Layout title={getPageTitle(filterType)}>
            <div className="max-w-6xl space-y-6">
                {/* Filters */}
                <Card className="card">
                    <div className="p-6 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1 max-w-md">
                                <Search
                                    placeholder="Search contacts, organizations, or emails..."
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                />
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {organizationTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                
                                <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                    <a href="/contacts/new" className="flex items-center space-x-2">
                                        <Icon name="plus" className="w-4 h-4" />
                                        <span>Add Contact</span>
                                    </a>
                                </Button>
                            </div>
                        </div>
                        
                        {/* Tag Filters */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Filter by Tags:</h4>
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                            selectedTags.includes(tag)
                                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {tag}
                                        {selectedTags.includes(tag) && (
                                            <Icon name="close" className="w-3 h-3 ml-1" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            {selectedTags.length > 0 && (
                                <button
                                    onClick={() => setSelectedTags([])}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                                >
                                    Clear all tags
                                </button>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Contacts Table */}
                <Card 
                    className="card" 
                    title={`${getPageTitle(filterType)} (${filteredContacts.length})`}
                >
                    {filteredContacts.length > 0 ? (
                        <Table
                            cellsThead={
                                <>
                                    {tableHeaders.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </>
                            }
                        >
                            {filteredContacts.map((contact, index) => (
                                <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    {tableData[index].map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="search" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your search terms or filters.
                            </p>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700">
                                <a href="/contacts/new" className="flex items-center space-x-2">
                                    <Icon name="plus" className="w-4 h-4" />
                                    <span>Add First Contact</span>
                                </a>
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default ContactListPage;