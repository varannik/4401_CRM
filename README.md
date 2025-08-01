# 4401 CRM - Enterprise Customer Relationship Management

A modern, scalable CRM application built with Next.js, deployed on AWS App Runner with Aurora Serverless v2, featuring full CI/CD pipeline and Infrastructure as Code.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   GitHub        │    │   AWS App Runner │    │   Aurora Serverless │
│   (Source Code) │───▶│   (Next.js App)  │───▶│   v2 (PostgreSQL)   │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   GitHub Actions│    │   VPC Connector  │    │   Secrets Manager   │
│   (CI/CD)       │    │   (Networking)   │    │   (Credentials)     │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## 🚀 Features

- **Modern Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Azure AD integration
- **Database**: Prisma ORM with PostgreSQL (Aurora Serverless v2)
- **Deployment**: AWS App Runner with VPC networking
- **Infrastructure**: AWS CDK (TypeScript) for Infrastructure as Code
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: CloudWatch dashboards and health checks
- **Security**: VPC isolation, secrets management, security headers

## 📁 Project Structure

```
4401_CRM/
├── next/                          # Next.js application
│   ├── app/                      # App Router pages
│   ├── components/               # Reusable components
│   ├── lib/                      # Utilities and configurations
│   ├── prisma/                   # Database schema and migrations
│   ├── Dockerfile               # Container configuration
│   └── package.json
├── infrastructure/               # AWS CDK Infrastructure
│   ├── lib/                     # CDK stack definitions
│   ├── bin/                     # CDK app entry point
│   └── package.json
├── .github/workflows/           # CI/CD pipelines
└── README.md
```

## 🛠️ Prerequisites

- Node.js 18+ 
- AWS Account with appropriate permissions
- GitHub repository
- Azure AD tenant (for authentication)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/4401_CRM.git
cd 4401_CRM
```

### 2. Setup Next.js Application

```bash
cd next
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### 3. Setup Infrastructure

```bash
cd ../infrastructure
npm install

# Configure AWS credentials
aws configure

# Bootstrap CDK (one-time setup)
npm run cdk bootstrap

# Deploy to staging
npm run deploy:staging
```

## 🔧 Environment Variables

### Required for Next.js App

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/crmdb"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
AZURE_AD_CLIENT_ID="your-client-id"
AZURE_AD_CLIENT_SECRET="your-client-secret"
AZURE_AD_TENANT_ID="your-tenant-id"
```

### Required for Deployment (GitHub Secrets)

```env
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_ACCOUNT_ID="your-aws-account-id"
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"
AZURE_AD_TENANT_ID="your-azure-tenant-id"
SLACK_WEBHOOK_URL="your-slack-webhook" # Optional
```

## 📦 Deployment

### Staging Deployment

Push to `develop` branch to trigger staging deployment:

```bash
git checkout develop
git push origin develop
```

### Production Deployment

Push to `main` branch to trigger production deployment:

```bash
git checkout main
git push origin main
```

### Manual Deployment

```bash
cd infrastructure

# Deploy staging
npm run deploy:staging

# Deploy production
npm run deploy:production
```

## 🏗️ Infrastructure Components

### AWS Resources Created

- **VPC**: Multi-AZ setup with public, private, and isolated subnets
- **Aurora Serverless v2**: PostgreSQL database with automatic scaling
- **App Runner**: Containerized application hosting
- **Secrets Manager**: Secure credential storage
- **CloudWatch**: Monitoring and logging
- **VPC Endpoints**: Cost-optimized AWS service access

### Cost Optimization Features

- Aurora auto-pause for staging environment
- Single NAT Gateway
- VPC Endpoints for AWS services
- Efficient container image layers
- Resource tagging for cost tracking

## 🔍 Monitoring & Observability

### Health Checks

- Application health endpoint: `/api/health`
- Database connectivity monitoring
- Automatic healing via App Runner

### CloudWatch Dashboards

- Infrastructure metrics (VPC, Aurora)
- Application metrics (App Runner)
- Custom business metrics

### Logging

- Application logs in CloudWatch
- VPC Flow Logs for security monitoring
- Aurora query logs

## 🔐 Security Best Practices

### Network Security

- VPC isolation with private subnets
- Security groups with least privilege
- VPC endpoints for AWS service communication

### Application Security

- Security headers (HSTS, CSP, etc.)
- Secret management via AWS Secrets Manager
- JWT-based authentication
- Non-root Docker user

### Infrastructure Security

- IAM roles with minimal permissions
- Encryption at rest and in transit
- Automated security group management

## 🧪 Testing

### Local Testing

```bash
cd next

# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests (if available)
npm test

# Build verification
npm run build
```

### E2E Testing

Configure Playwright or Cypress for end-to-end testing in the CI/CD pipeline.

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Deploy migrations (production)
npm run db:deploy

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## 🔄 CI/CD Pipeline

### Workflow Triggers

- **PR to main/develop**: Run tests and build
- **Push to develop**: Deploy to staging
- **Push to main**: Deploy to production

### Pipeline Stages

1. **Test & Build**: Lint, type-check, build verification
2. **Infrastructure**: Deploy AWS resources via CDK
3. **Database**: Run migrations and updates
4. **Application**: Deploy to App Runner
5. **Validation**: Health checks and E2E tests
6. **Notification**: Slack alerts (optional)

## 🛠️ Development

### Adding New Features

1. Create feature branch from `develop`
2. Implement changes with tests
3. Update database schema if needed
4. Create pull request
5. Merge to `develop` for staging deployment
6. Merge to `main` for production

### Database Schema Changes

1. Update `prisma/schema.prisma`
2. Generate migration: `npm run db:migrate`
3. Test migration locally
4. Deploy via CI/CD pipeline

## 📈 Scaling

### Horizontal Scaling

- App Runner auto-scaling (1-10 instances)
- Aurora Serverless v2 capacity units (0.5-16 ACUs)
- Multi-AZ deployment for high availability

### Performance Optimization

- Next.js optimization features
- Database connection pooling
- CloudFront distribution (future enhancement)
- Redis caching layer (optional)

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Check VPC security groups and Aurora status
2. **App Runner Deployment**: Verify Docker build and environment variables
3. **Authentication**: Validate Azure AD configuration
4. **CDK Deployment**: Ensure AWS permissions and account setup

### Useful Commands

```bash
# Check App Runner service status
aws apprunner describe-service --service-arn <service-arn>

# View CloudWatch logs
aws logs tail /aws/apprunner/<service-name> --follow

# Check Aurora cluster status
aws rds describe-db-clusters --db-cluster-identifier crm-db-staging
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with appropriate tests
4. Submit pull request with clear description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create GitHub issues for bugs and feature requests
- Check CloudWatch logs for application issues
- Review AWS service health dashboards

---

**Built with ❤️ using modern web technologies and AWS cloud infrastructure** 