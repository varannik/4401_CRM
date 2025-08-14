"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout/index";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Field from "@/components/Field";
import Modal from "@/components/Modal";

interface ContactType {
    id: string;
    name: string;
    description: string;
    color: string;
    isDefault: boolean;
    isSystem: boolean;
}

const defaultContactTypes: ContactType[] = [
    { id: "1", name: "Company", description: "Commercial organizations and businesses", color: "blue", isDefault: true, isSystem: true },
    { id: "2", name: "University", description: "Educational institutions and universities", color: "green", isDefault: false, isSystem: true },
    { id: "3", name: "Government", description: "Government agencies and departments", color: "red", isDefault: false, isSystem: true },
    { id: "4", name: "Non-Profit", description: "Non-profit organizations and foundations", color: "purple", isDefault: false, isSystem: true },
    { id: "5", name: "Research Institute", description: "Research organizations and labs", color: "orange", isDefault: false, isSystem: true },
    { id: "6", name: "Startup", description: "Early-stage companies and startups", color: "teal", isDefault: false, isSystem: false },
    { id: "7", name: "Enterprise", description: "Large enterprise organizations", color: "indigo", isDefault: false, isSystem: false },
];

const colorOptions = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "teal", label: "Teal", class: "bg-teal-500" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
    { value: "gray", label: "Gray", class: "bg-gray-500" },
];

const ContactTypesSettingsPage = () => {
    const [contactTypes, setContactTypes] = useState<ContactType[]>(defaultContactTypes);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<ContactType | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "blue"
    });

    const handleCreateOrEdit = () => {
        if (editingType) {
            // Edit existing type
            setContactTypes(prev => prev.map(type => 
                type.id === editingType.id 
                    ? { ...type, ...formData }
                    : type
            ));
        } else {
            // Create new type
            const newType: ContactType = {
                id: Date.now().toString(),
                name: formData.name,
                description: formData.description,
                color: formData.color,
                isDefault: false,
                isSystem: false
            };
            setContactTypes(prev => [...prev, newType]);
        }
        
        setIsModalOpen(false);
        setEditingType(null);
        setFormData({ name: "", description: "", color: "blue" });
    };

    const handleEdit = (type: ContactType) => {
        if (type.isSystem) return; // Can't edit system types
        
        setEditingType(type);
        setFormData({
            name: type.name,
            description: type.description,
            color: type.color
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        const type = contactTypes.find(t => t.id === id);
        if (type?.isSystem) return; // Can't delete system types
        
        if (confirm("Are you sure you want to delete this contact type?")) {
            setContactTypes(prev => prev.filter(type => type.id !== id));
        }
    };

    const handleSetDefault = (id: string) => {
        setContactTypes(prev => prev.map(type => ({
            ...type,
            isDefault: type.id === id
        })));
    };

    return (
        <Layout title="Contact Types Settings">
            <div className="max-w-6xl space-y-6">
                {/* Header */}
                <Card className="card" title="Contact Type Management">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Organization Types</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Manage how your CRM categorizes different types of organizations and contacts.
                                </p>
                            </div>
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <div className="flex items-center space-x-2">
                                    <Icon name="plus" className="w-4 h-4" />
                                    <span>Add Type</span>
                                </div>
                            </Button>
                        </div>

                        {/* Contact Types List */}
                        <div className="space-y-3">
                            {contactTypes.map((type) => (
                                <div key={type.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-4 h-4 rounded-full bg-${type.color}-500`}></div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <h4 className="font-medium text-gray-900">{type.name}</h4>
                                                {type.isDefault && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Default
                                                    </span>
                                                )}
                                                {type.isSystem && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">{type.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        {!type.isDefault && (
                                            <Button
                                                onClick={() => handleSetDefault(type.id)}
                                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200"
                                            >
                                                Set Default
                                            </Button>
                                        )}
                                        
                                        {!type.isSystem && (
                                            <>
                                                <Button
                                                    onClick={() => handleEdit(type)}
                                                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                >
                                                    <Icon name="edit" className="w-3 h-3" />
                                                </Button>
                                                
                                                <Button
                                                    onClick={() => handleDelete(type.id)}
                                                    className="text-xs px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200"
                                                >
                                                    <Icon name="delete" className="w-3 h-3" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Auto-Classification Rules */}
                <Card className="card" title="Auto-Classification Rules">
                    <div className="p-6 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Automatic Type Detection</h4>
                            <div className="text-sm text-blue-700 space-y-2">
                                <p><strong>Universities:</strong> Domains ending in .edu, or containing "university", "college", "school"</p>
                                <p><strong>Government:</strong> Domains ending in .gov, .gov.uk, or containing "government"</p>
                                <p><strong>Non-Profit:</strong> Domains ending in .org, or containing "foundation", "nonprofit"</p>
                                <p><strong>Research Institute:</strong> Domains containing "research", "institute", "lab"</p>
                                <p><strong>Company:</strong> All other domains (default)</p>
                            </div>
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start space-x-2">
                                <Icon name="info" className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-yellow-900">Manual Override</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        You can always manually change the organization type for any contact. 
                                        Auto-classification is only applied when new organizations are first detected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Create/Edit Modal */}
                <Modal
                    open={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingType(null);
                        setFormData({ name: "", description: "", color: "blue" });
                    }}
                >
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {editingType ? "Edit Contact Type" : "Create Contact Type"}
                        </h3>
                        <div className="space-y-4">
                        <Field
                            label="Type Name"
                            placeholder="e.g. Startup, SME, Enterprise"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                        
                        <Field
                            label="Description"
                            placeholder="Describe this type of organization"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <div className="flex flex-wrap gap-2">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                        className={`w-8 h-8 rounded-full ${color.class} ${
                                            formData.color === color.value 
                                                ? 'ring-2 ring-offset-2 ring-gray-400' 
                                                : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300'
                                        }`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                            <Button
                                onClick={handleCreateOrEdit}
                                disabled={!formData.name}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {editingType ? "Update" : "Create"}
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingType(null);
                                    setFormData({ name: "", description: "", color: "blue" });
                                }}
                                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                        </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </Layout>
    );
};

export default ContactTypesSettingsPage;