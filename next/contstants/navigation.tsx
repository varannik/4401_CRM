export const navigation = [
    {
        title: "Dashboard",
        icon: "dashboard",
        href: "/dashboard",
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
                title: "All Contacts",
                href: "/contacts/list",
            },
            {
                title: "Companies",
                href: "/contacts/companies",
            },
            {
                title: "Universities",
                href: "/contacts/universities",
            },
            {
                title: "Organizations",
                href: "/contacts/organizations",
            },
            {
                title: "Add Contact",
                href: "/contacts/new",
            },
        ],
    },
    {
        title: "Communications",
        icon: "chat-think",
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
                title: "Contact Insights",
                href: "/reports/contacts",
            },
        ],
    },
    {
        title: "Settings",
        icon: 'edit',
        list: [
            {
                title: "Email Integration",
                href: "/settings/email-integration",
            },
            {
                title: "Contact Types",
                href: "/settings/contact-types",
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
        title: "Contact Search",
        icon: "search",
        href: "/contacts/search",
    },
    {
        title: "Quick Log",
        icon: "chat-think",
        href: "/communications/log",
    },
    {
        title: "Help & Support",
        icon: "help",
        href: "/help",
    },
];
