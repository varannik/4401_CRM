"use client";

import Layout from "@/components/Layout";
import Overview from "./Overview";
import RecentActivity from "./RecentActivity";
import CompanyInsights from "./CompanyInsights";
import CommunicationAlerts from "./CommunicationAlerts";
import DepartmentActivity from "./DepartmentActivity";
import QuickActions from "./QuickActions";

const HomePage = () => {
    return (
        <Layout title="Dashboard">
            <div className="flex max-lg:block">
                <div className="col-left">
                    <Overview />
                    <RecentActivity />
                    <CompanyInsights />
                    <QuickActions />
                </div>
                <div className="col-right">
                    <CommunicationAlerts />
                    <DepartmentActivity />
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;
