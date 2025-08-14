"use client";

import { useState } from "react";
import Layout from "@/components/Layout/index";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Select from "@/components/Select";
import Icon from "@/components/Icon";

const departmentOptions = [
    { id: 1, name: "Commercial" },
    { id: 2, name: "Technical" },
    { id: 3, name: "Science" },
    { id: 4, name: "Communications" },
    { id: 5, name: "Admin/Business Operations" },
];

const NewCompanyPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        industry: "",
        location: "",
        country: "",
        website: "",
        description: "",
        ownerDepartment: departmentOptions[0],
        projectTag: "",
        notes: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Submitting company data:", formData);
        // Here you would typically send the data to your API
    };

    return (
        <Layout title="Add New Company">
            <div className="max-w-4xl space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="card" title="Company Information">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <Field
                                className="field"
                                placeholder="Company Name"
                                label="Company Name *"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                required
                            />
                            
                            <Field
                                className="field"
                                placeholder="Technology, Finance, etc."
                                label="Industry"
                                value={formData.industry}
                                onChange={(e) => handleInputChange("industry", e.target.value)}
                            />
                            
                            <Field
                                className="field"
                                placeholder="City, State/Province"
                                label="Location"
                                value={formData.location}
                                onChange={(e) => handleInputChange("location", e.target.value)}
                            />
                            
                            <Field
                                className="field"
                                placeholder="Country"
                                label="Country"
                                value={formData.country}
                                onChange={(e) => handleInputChange("country", e.target.value)}
                            />
                            
                            <Field
                                className="field"
                                placeholder="https://www.company.com"
                                label="Website"
                                type="url"
                                value={formData.website}
                                onChange={(e) => handleInputChange("website", e.target.value)}
                            />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Owner Department *
                                </label>
                                <Select
                                    className="w-full"
                                    value={formData.ownerDepartment}
                                    onChange={(value) => setFormData(prev => ({ ...prev, ownerDepartment: value }))}
                                    options={departmentOptions}
                                />
                            </div>
                        </div>
                        
                        <div className="px-6 pb-6">
                            <Field
                                className="field"
                                placeholder="Brief description of the company..."
                                label="Description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                type="textarea"
                            />
                        </div>
                    </Card>

                    <Card className="card" title="CRM Configuration">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <Field
                                className="field"
                                placeholder="Project name or tag"
                                label="Project Tag"
                                value={formData.projectTag}
                                onChange={(e) => handleInputChange("projectTag", e.target.value)}
                            />
                            
                            <div></div> {/* Empty div for grid alignment */}
                            
                            <div className="md:col-span-2">
                                <Field
                                    className="field"
                                    placeholder="Internal notes about this company..."
                                    label="Notes"
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange("notes", e.target.value)}
                                    type="textarea"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="card" title="Next Steps">
                        <div className="p-6 space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Icon name="info" className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">After creating this company</h4>
                                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                                            <li>• Add individual contacts for this company</li>
                                            <li>• Log any existing communication history</li>
                                            <li>• Set up follow-up reminders if needed</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <Button 
                                    type="button"
                                    className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                                
                                <div className="flex space-x-3">
                                    <Button 
                                        type="submit"
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Icon name="check" className="w-4 h-4" />
                                            <span>Create Company</span>
                                        </div>
                                    </Button>
                                    
                                    <Button 
                                        type="submit"
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Icon name="plus" className="w-4 h-4" />
                                            <span>Create & Add Contact</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </Layout>
    );
};

export default NewCompanyPage; 