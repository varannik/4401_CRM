export const navigation = [
    {
        title: "Dashboard",
        icon: "dashboard",
        href: "/dashboard",
    },
    {
        title: "Companies",
        icon: "wallet",
        list: [
            {
                title: "Overview",
                href: "/companies",
            },
            {
                title: "Company List",
                href: "/companies/list",
            },
            {
                title: "Add Company",
                href: "/companies/new",
            },
        ],
    },
    {
        title: "Contacts",
        icon: "profile",
        list: [
            {
                title: "Overview",
                href: "/contacts",
            },
            {
                title: "Contact List",
                href: "/contacts/list",
            },
            {
                title: "Add Contact",
                href: "/contacts/new",
            },
        ],
    },
    {
        title: "Communications",
        icon: "message",
        list: [
            {
                title: "Recent Activity",
                href: "/communications",
            },
            {
                title: "Log Communication",
                href: "/communications/log",
            },
            {
                title: "Email Tracking",
                href: "/communications/emails",
            },
            {
                title: "Meetings",
                href: "/communications/meetings",
            },
        ],
    },
    {
        title: "Reports",
        icon: "chart",
        list: [
            {
                title: "Relationship Health",
                href: "/reports/relationships",
            },
            {
                title: "Department Activity",
                href: "/reports/departments",
            },
            {
                title: "Communication Analytics",
                href: "/reports/communications",
            },
            {
                title: "Company Insights",
                href: "/reports/companies",
            },
        ],
    },
    {
        title: "Settings",
        icon: "settings",
        list: [
            {
                title: "Email Integration",
                href: "/settings/email-integration",
            },
            {
                title: "Departments",
                href: "/settings/departments",
            },
            {
                title: "Users",
                href: "/settings/users",
            },
            {
                title: "Projects",
                href: "/settings/projects",
            },
            {
                title: "Preferences",
                href: "/settings/preferences",
            },
        ],
    },
];

export const navigationUser = [
    {
        title: "My Profile",
        icon: "edit-profile",
        href: "/settings/profile",
    },
    {
        title: "My Department",
        icon: "bag",
        href: "/settings/departments",
    },
    {
        title: "Recent Activity",
        icon: "chart",
        href: "/communications",
    },
    {
        title: "Company Search",
        icon: "search",
        href: "/companies/search",
    },
    {
        title: "Quick Log",
        icon: "message",
        href: "/communications/log",
    },
    {
        title: "Help & Support",
        icon: "help",
        href: "/help",
    },
];
