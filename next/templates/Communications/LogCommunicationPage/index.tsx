"use client";

import { useState } from "react";
import Layout from "@/components/Layout/index";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Field from "@/components/Field";
import Select from "@/components/Select";
import Icon from "@/components/Icon";

const communicationTypes = [
    { id: 1, name: "Email" },
    { id: 2, name: "Meeting" },
    { id: 3, name: "Phone Call" },
    { id: 4, name: "Video Call" },
    { id: 5, name: "In Person" },
    { id: 6, name: "Other" },
];

const departments = [
    { id: 1, name: "Commercial" },
    { id: 2, name: "Technical" },
    { id: 3, name: "Science" },
    { id: 4, name: "Communications" },
    { id: 5, name: "Admin/Business Operations" },
];

// Mock data - in real app, this would come from API
const companies = [
    { id: 1, name: "Microsoft Corporation" },
    { id: 2, name: "Shopify Inc." },
    { id: 3, name: "ClimateWorks Foundation" },
    { id: 4, name: "Stripe Climate" },
    { id: 5, name: "Carbon Engineering" },
];

const contacts = [
    { id: 1, name: "Sarah Johnson", email: "sarah.johnson@microsoft.com", companyId: 1 },
    { id: 2, name: "David Chen", email: "david.chen@microsoft.com", companyId: 1 },
    { id: 3, name: "Emma Wilson", email: "emma.wilson@shopify.com", companyId: 2 },
    { id: 4, name: "Alex Thompson", email: "alex.thompson@climateworks.org", companyId: 3 },
];

const LogCommunicationPage = () => {
    const [formData, setFormData] = useState({
        communicationType: communicationTypes[0],
        company: companies[0],
        contact: null as any,
        subject: "",
        communicationDate: new Date().toISOString().split('T')[0],
        communicationTime: new Date().toTimeString().split(' ')[0].substring(0, 5),
        notes: "",
        department: departments[0],
        followUpRequired: false,
        followUpDate: "",
    });

    const availableContacts = contacts.filter(contact => 
        contact.companyId === formData.company?.id
    );

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCompanyChange = (company: any) => {
        setFormData(prev => ({
            ...prev,
            company,
            contact: null // Reset contact when company changes
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Logging communication:", formData);
        // Here you would send the data to your API
        // After successful submission, redirect or show success message
    };

    return (
        <Layout title="Log Communication">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Log Communication</h1>
                        <p className="text-gray-600">Record a new interaction with a company or contact</p>
                    </div>
                    <a href="/communications" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        ← Back to Communications
                    </a>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="card" title="Communication Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Communication Type *
                                </label>
                                <Select
                                    className="w-full"
                                    value={formData.communicationType}
                                    onChange={(value) => handleInputChange("communicationType", value)}
                                    options={communicationTypes}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    44.01 Department *
                                </label>
                                <Select
                                    className="w-full"
                                    value={formData.department}
                                    onChange={(value) => handleInputChange("department", value)}
                                    options={departments}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company *
                                </label>
                                <Select
                                    className="w-full"
                                    value={formData.company}
                                    onChange={handleCompanyChange}
                                    options={companies}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Person
                                </label>
                                <Select
                                    className="w-full"
                                    value={formData.contact}
                                    onChange={(value) => handleInputChange("contact", value)}
                                    options={[
                                        { id: 0, name: "Select a contact..." },
                                        ...availableContacts
                                    ]}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Optional - leave blank if general company communication
                                </p>
                            </div>

                            <Field
                                className="field"
                                placeholder="Meeting subject, email topic, etc."
                                label="Subject/Topic *"
                                value={formData.subject}
                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                required
                            />

                            <div></div>

                            <Field
                                className="field"
                                label="Date *"
                                type="date"
                                value={formData.communicationDate}
                                onChange={(e) => handleInputChange("communicationDate", e.target.value)}
                                required
                            />

                            <Field
                                className="field"
                                label="Time"
                                type="time"
                                value={formData.communicationTime}
                                onChange={(e) => handleInputChange("communicationTime", e.target.value)}
                            />
                        </div>
                    </Card>

                    <Card className="card" title="Additional Information">
                        <div className="p-6 space-y-6">
                            <Field
                                className="field"
                                placeholder="Notes about this communication..."
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange("notes", e.target.value)}
                                type="textarea"
                            />

                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="followUpRequired"
                                        checked={formData.followUpRequired}
                                        onChange={(e) => handleInputChange("followUpRequired", e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="followUpRequired" className="text-sm font-medium text-gray-700">
                                        Follow-up required
                                    </label>
                                </div>

                                {formData.followUpRequired && (
                                    <div className="mt-4 ml-6">
                                        <Field
                                            className="field max-w-xs"
                                            label="Follow-up Date"
                                            type="date"
                                            value={formData.followUpDate}
                                            onChange={(e) => handleInputChange("followUpDate", e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="card" title="Privacy & Compliance">
                        <div className="p-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <Icon name="info" className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Data Privacy Note</h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            We only store communication metadata (who, when, subject) and your notes. 
                                            Email content and meeting recordings are not stored in the CRM system to protect privacy.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
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
                                            <span>Log Communication</span>
                                        </div>
                                    </Button>
                                    
                                    <Button 
                                        type="submit"
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Icon name="plus" className="w-4 h-4" />
                                            <span>Log & Add Another</span>
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

export default LogCommunicationPage; 