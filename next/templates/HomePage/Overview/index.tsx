import { useState } from "react";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import Percentage from "@/components/Percentage";

const durations = [
    { id: 1, name: "Last 7 days" },
    { id: 2, name: "Last month" },
    { id: 3, name: "Last year" },
];

const tabs = [
    {
        id: 1,
        icon: "email",
        label: "Communications",
        value: "2,847",
        percent: 24.5,
        description: "Total email interactions tracked"
    },
    {
        id: 2,
        icon: "company",
        label: "Active Relations", 
        value: "245",
        percent: 12.3,
        description: "Companies with ongoing communication"
    },
    {
        id: 3,
        icon: "users",
        label: "Business Contacts",
        value: "1,156",
        percent: 18.7,
        description: "Professional contacts managed"
    },
    {
        id: 4,
        icon: "activity",
        label: "Engagement Rate",
        value: "73%",
        percent: 8.7,
        description: "Response & interaction rate"
    },
];

const Overview = ({}) => {
    const [duration, setDuration] = useState(durations[0]);
    const [activeTab, setActiveTab] = useState(1);

    return (
        <Card
            title="Relations & Communications Overview"
            selectValue={duration}
            selectOnChange={setDuration}
            selectOptions={durations}
        >
            <div className="pt-1">
                {/* Grid layout for 4 metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6 max-lg:grid-cols-1">
                    {tabs.map((tab) => (
                        <div
                            className={`group p-4 rounded-2xl cursor-pointer transition-all border ${
                                activeTab === tab.id
                                    ? "bg-b-surface2 shadow-depth-toggle border-primary"
                                    : "bg-b-depth2 border-s-subtle hover:bg-b-surface2"
                            }`}
                            key={tab.label}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <div
                                className={`flex items-center gap-3 mb-3 text-sub-title-2 transition-colors group-hover:text-t-primary ${
                                    activeTab === tab.id
                                        ? "text-t-primary"
                                        : "text-t-secondary"
                                }`}
                            >
                                <Icon
                                    className={`w-5 h-5 transition-colors group-hover:fill-t-primary ${
                                        activeTab === tab.id
                                            ? "fill-t-primary"
                                            : "fill-t-secondary"
                                    }`}
                                    name={tab.icon}
                                />
                                <div className="font-medium">{tab.label}</div>
                            </div>
                            <div className="mb-2">
                                <div className="text-2xl font-bold text-t-primary mb-1">
                                    {tab.value}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Percentage value={tab.percent} />
                                    <div className="text-xs text-t-secondary">
                                        vs last period
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-t-tertiary">
                                {tab.description}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Content area based on selected tab */}
                <div className="bg-b-depth2 rounded-2xl p-5">
                    {activeTab === 1 && (
                        <div>
                            <h4 className="text-sub-title-1 font-semibold mb-4 text-t-primary">
                                Communication Overview
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-b-surface rounded-lg">
                                    <div>
                                        <div className="font-medium text-t-primary">Emails Processed Today</div>
                                        <div className="text-sm text-t-secondary">Automated webhook processing</div>
                                    </div>
                                    <div className="text-lg font-bold text-green-600">+147</div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-b-surface rounded-lg">
                                    <div>
                                        <div className="font-medium text-t-primary">New Relations Identified</div>
                                        <div className="text-sm text-t-secondary">Companies & contacts discovered</div>
                                    </div>
                                    <div className="text-lg font-bold text-blue-600">+23</div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-b-surface rounded-lg">
                                    <div>
                                        <div className="font-medium text-t-primary">Processing Speed</div>
                                        <div className="text-sm text-t-secondary">Average response time</div>
                                    </div>
                                    <div className="text-lg font-bold text-purple-600">0.8s</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 2 && (
                        <div>
                            <h4 className="text-sub-title-1 font-semibold mb-4 text-t-primary">
                                Business Relations
                            </h4>
                            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                                <div className="p-3 bg-b-surface rounded-lg">
                                    <div className="text-sm text-t-secondary mb-1">Most Engaged</div>
                                    <div className="font-medium text-t-primary">Tech Sector</div>
                                    <div className="text-xs text-t-tertiary">142 active communications</div>
                                </div>
                                <div className="p-3 bg-b-surface rounded-lg">
                                    <div className="text-sm text-t-secondary mb-1">New Relations</div>
                                    <div className="font-medium text-t-primary">18 Companies</div>
                                    <div className="text-xs text-t-tertiary">Identified this week</div>
                                </div>
                                <div className="p-3 bg-b-surface rounded-lg">
                                    <div className="text-sm text-t-secondary mb-1">Long-term Partners</div>
                                    <div className="font-medium text-t-primary">67 Companies</div>
                                    <div className="text-xs text-t-tertiary">6+ months relationship</div>
                                </div>
                                <div className="p-3 bg-b-surface rounded-lg">
                                    <div className="text-sm text-t-secondary mb-1">Departments Engaged</div>
                                    <div className="font-medium text-t-primary">5 Internal</div>
                                    <div className="text-xs text-t-tertiary">Commercial, Tech, Science</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 3 && (
                        <div>
                            <h4 className="text-sub-title-1 font-semibold mb-4 text-t-primary">
                                Contact Management
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-b-surface rounded-lg">
                                    <div>
                                        <div className="font-medium text-t-primary">Active Contacts</div>
                                        <div className="text-sm text-t-secondary">Recently communicated</div>
                                    </div>
                                    <div className="text-lg font-bold text-green-600">847</div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-b-surface rounded-lg">
                                    <div>
                                        <div className="font-medium text-t-primary">Key Decision Makers</div>
                                        <div className="text-sm text-t-secondary">C-level & directors</div>
                                    </div>
                                    <div className="text-lg font-bold text-blue-600">156</div>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-b-surface rounded-lg">
                                    <div>
                                        <div className="font-medium text-t-primary">New Contacts Today</div>
                                        <div className="text-sm text-t-secondary">Auto-discovered via email</div>
                                    </div>
                                    <div className="text-lg font-bold text-purple-600">+12</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 4 && (
                        <div>
                            <h4 className="text-sub-title-1 font-semibold mb-4 text-t-primary">
                                Engagement Analytics
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-t-secondary">Response Rate</span>
                                    <span className="font-medium text-t-primary">73%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-t-secondary">Average Response Time</span>
                                    <span className="font-medium text-t-primary">2.4 hours</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-t-secondary">Follow-up Success</span>
                                    <span className="font-medium text-t-primary">84%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-t-secondary">Relationship Quality</span>
                                    <span className="font-medium text-t-primary">High</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Overview;
