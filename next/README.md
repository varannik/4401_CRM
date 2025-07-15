# 44.01 CRM - Customer Relationship Management System

A comprehensive CRM system built for 44.01's internal use, featuring contact management, company tracking, communication logging, and business integration capabilities.

## 🚀 Features

### Core Functionality
- **Contact Management**: Track contacts with detailed profiles, company associations, and lead status
- **Company Management**: Manage business relationships with comprehensive company profiles
- **Communication Tracking**: Log and track all communications related to specific projects, contracts, or initiatives
- **Lead Attribution**: Track original lead sources and assign leads to departments
- **User Management**: Role-based access control (Admin, Team Lead, User)

### Business Integration Ready
- Integration points for contract management systems
- Invoicing system compatibility
- Quote system integration capabilities
- Email platform integration (Office 365, Gmail, Exchange)

### Authentication & Security
- Azure AD SSO integration
- Role-based permissions
- Secure API endpoints
- Session management

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Azure AD
- **UI Components**: Radix UI, Lucide React icons
- **Deployment**: Azure-ready configuration

## 📋 Requirements from Stakeholders

Based on the gathered requirements, this CRM addresses:

1. **Communication Context**: Track communications related to specific projects, contracts, or initiatives
2. **Lead Source & Attribution**: Track original lead sources and assign to departments
3. **Business System Integration**: Ready for contract management, invoicing, and quote system integration
4. **Email Integration**: Supports corporate email system integration
5. **User Base**: Multi-level access with role-based permissions

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB instance (local or cloud)
- Azure AD application for SSO

### 1. Environment Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database
MONGODB_URI=mongodb://your-mongodb-connection-string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-in-production

# Azure AD SSO
AZURE_AD_CLIENT_ID=your-azure-ad-client-id
AZURE_AD_CLIENT_SECRET=your-azure-ad-client-secret
AZURE_AD_TENANT_ID=your-azure-ad-tenant-id
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Azure AD Application

1. Go to Azure Portal > Azure Active Directory > App registrations
2. Create a new application registration
3. Set redirect URI to: `http://localhost:3000/api/auth/callback/azure-ad`
4. Generate a client secret
5. Copy the Application (client) ID, Directory (tenant) ID, and client secret to your `.env.local`

### 4. Database Setup

Ensure your MongoDB instance is running and accessible. The application will automatically create the necessary collections and indexes.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the CRM.

## 📊 Database Schema

### Collections

1. **Users**: System users with roles and departments
2. **Companies**: Business entities with contact information and status
3. **Contacts**: Individual contacts associated with companies
4. **Communications**: Log of all interactions and communications

### Key Relationships
- Contacts belong to Companies
- Communications can be linked to Contacts, Companies, Projects, or Contracts
- Users can be assigned to Contacts and Communications
- All records track creation and modification history

## 🗂 Application Structure

```
next/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   ├── contacts/      # Contact CRUD operations
│   │   └── companies/     # Company CRUD operations
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── contacts/          # Contact management
│   ├── companies/         # Company management
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components (sidebar, header)
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── mongodb.ts        # MongoDB connection
│   ├── mongoose.ts       # Mongoose connection
│   └── utils.ts          # Utility functions
└── models/               # Mongoose schemas
    ├── User.ts
    ├── Company.ts
    ├── Contact.ts
    └── Communication.ts
```

## 🔐 User Roles & Permissions

### Admin
- Full system access
- User management
- System configuration
- All CRUD operations

### Team Lead
- Department-specific access
- Assign leads and contacts
- View team communications
- Limited user management

### User
- View and edit assigned contacts
- Log communications
- Basic reporting access

## 🌐 Azure Deployment

### Prerequisites for Azure Deployment

1. Azure subscription
2. Azure Database for MongoDB (CosmosDB) or MongoDB Atlas
3. Azure App Service

### Deployment Steps

1. **Create Azure App Service**:
   ```bash
   az webapp create --resource-group your-rg --plan your-plan --name 4401-crm --runtime "NODE|18-lts"
   ```

2. **Configure Environment Variables**:
   Set all environment variables in Azure App Service configuration

3. **Deploy Application**:
   ```bash
   az webapp deployment source config --name 4401-crm --resource-group your-rg --repo-url https://github.com/your-org/4401-crm --branch main
   ```

4. **Update Azure AD Redirect URI**:
   Add your Azure App Service URL to Azure AD redirect URIs

## 📧 Email Integration

The system is designed to integrate with corporate email systems:

- **Office 365**: Ready for Microsoft Graph API integration
- **Gmail**: Google Workspace API compatible
- **Exchange**: On-premise Exchange integration support

Email integration will allow:
- Automatic communication logging
- Email thread tracking
- Calendar integration for meetings
- Contact synchronization

## 🔮 Future Enhancements

Based on the requirements, planned features include:

1. **Advanced Reporting**: Custom reports and analytics dashboard
2. **Email Integration**: Direct email platform integration
3. **Mobile App**: React Native mobile application
4. **Advanced Search**: Full-text search capabilities
5. **Workflow Automation**: Automated lead assignment and follow-ups
6. **Integration APIs**: REST APIs for external system integration

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify Azure AD configuration and environment variables
2. **Database Connection**: Check MongoDB connection string and network access
3. **Build Errors**: Ensure all dependencies are installed with `npm install --legacy-peer-deps`

### Development Tips

- Use `npm run dev` for development with hot reload
- Check browser console for client-side errors
- Monitor Next.js API logs for server-side issues
- Use MongoDB Compass to inspect database records

## 📚 API Documentation

### Authentication
All API endpoints require authentication except `/api/auth/*`

### Endpoints

#### Contacts
- `GET /api/contacts` - List all contacts
- `POST /api/contacts` - Create new contact
- `GET /api/contacts/[id]` - Get contact details
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact

#### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create new company
- `GET /api/companies/[id]` - Get company details
- `PUT /api/companies/[id]` - Update company
- `DELETE /api/companies/[id]` - Delete company

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper TypeScript types
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

Internal use for 44.01. All rights reserved.

---

For technical support or questions about this CRM system, please contact the development team.
