# CRM Azure Architecture Documentation

This document describes the architecture and design decisions for the CRM application deployment on Azure.

## Architecture Overview

The CRM application follows a modern, cloud-native architecture using Azure services to provide scalability, security, and reliability.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Azure Front   │───▶│  Container Apps  │───▶│   PostgreSQL    │
│      Door       │    │   Environment    │    │  Flexible Server│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│      WAF        │    │   Redis Cache    │    │   Key Vault     │
│    Policy       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                 │                       │
                                 │                       │
                                 ▼                       ▼
                    ┌──────────────────┐    ┌─────────────────┐
                    │ Application     │    │   Monitoring    │
                    │   Insights      │    │  & Alerting     │
                    └──────────────────┘    └─────────────────┘
```

## Core Components

### 1. Azure Front Door
**Purpose**: Global load balancer, CDN, and Web Application Firewall

**Features**:
- SSL termination and certificate management
- Global load balancing with health probes
- Web Application Firewall (WAF) protection
- CDN for static content caching
- DDoS protection

**Configuration**:
- Origin: Container Apps endpoint
- Caching: Enabled for static assets
- Compression: Enabled for better performance
- Security: OWASP CRS rules enabled

### 2. Azure Container Apps
**Purpose**: Serverless container hosting platform

**Features**:
- Automatic scaling (0 to N instances)
- Built-in load balancing
- Blue-green deployments
- Integrated with Azure Monitor
- Dapr integration ready

**Configuration**:
- **CPU**: 0.25 cores per instance
- **Memory**: 0.5 GB per instance
- **Min Replicas**: 0 (dev), 1 (staging), 2 (prod)
- **Max Replicas**: 3 (dev), 5 (staging), 20 (prod)
- **Health Probes**: HTTP GET /api/health

### 3. PostgreSQL Flexible Server
**Purpose**: Managed relational database service

**Features**:
- Automatic backups and point-in-time restore
- High availability with zone redundancy (prod)
- Automatic patching and updates
- Private network integration
- Advanced security features

**Configuration**:
- **Dev**: B_Standard_B1ms (1 vCore, 2GB RAM)
- **Staging**: GP_Standard_D2s_v3 (2 vCores, 8GB RAM)
- **Production**: GP_Standard_D4s_v3 (4 vCores, 16GB RAM) + HA
- **Storage**: 32GB (dev/staging), 128GB (prod)
- **Backup Retention**: 7 days (dev), 14 days (staging), 30 days (prod)

### 4. Azure Cache for Redis
**Purpose**: In-memory caching and session storage

**Features**:
- Session persistence for Next.js
- API response caching
- Real-time data caching
- High availability (Standard/Premium tiers)

**Configuration**:
- **Dev**: Basic C0 (250MB)
- **Staging**: Standard C1 (1GB)
- **Production**: Standard C2 (2.5GB) or Premium for clustering

### 5. Azure Key Vault
**Purpose**: Secure secrets and certificate management

**Features**:
- Hardware Security Module (HSM) backed
- Access policies and RBAC
- Audit logging
- Integration with Container Apps

**Stored Secrets**:
- Azure AD client credentials
- NextAuth.js secret
- Database credentials
- Email webhook secrets
- Container registry passwords

### 6. Azure Container Registry
**Purpose**: Private container image registry

**Features**:
- Vulnerability scanning (Premium tier)
- Content trust and image signing
- Geo-replication (Premium tier)
- Webhook notifications

**Configuration**:
- **Dev**: Basic tier
- **Staging**: Standard tier
- **Production**: Premium tier with scanning

### 7. Azure Monitor & Application Insights
**Purpose**: Observability and monitoring

**Features**:
- Application performance monitoring
- Log aggregation and analysis
- Custom metrics and alerts
- Distributed tracing
- User behavior analytics

**Alerts Configured**:
- High CPU utilization (>80%)
- High memory usage (>85%)
- Database connection limits
- Application availability (<95%)
- Redis memory usage (>90%)

## Network Architecture

### Virtual Network Design
```
VNet: 10.0.0.0/16
├── Container Apps Subnet: 10.0.1.0/24
├── Database Subnet: 10.0.2.0/24
└── Redis Subnet: 10.0.3.0/24
```

### Network Security Groups
- **Container Apps**: Allow HTTP/HTTPS inbound, all outbound
- **Database**: Allow PostgreSQL (5432) from Container Apps subnet only
- **Redis**: Allow Redis (6379/6380) from Container Apps subnet only

### Private Endpoints
- Database connections use private endpoints
- Redis Premium tier uses private endpoints
- All internal communication stays within VNet

## Security Architecture

### Defense in Depth

1. **Perimeter Security**
   - Azure Front Door WAF
   - DDoS protection
   - Geographic filtering

2. **Network Security**
   - Virtual Network isolation
   - Network Security Groups
   - Private endpoints

3. **Application Security**
   - Managed identities
   - Azure AD integration
   - HTTPS enforcement

4. **Data Security**
   - Encryption at rest and in transit
   - Key Vault for secrets
   - Database firewall rules

### Identity and Access Management

```
Azure AD Tenant
├── CRM Application Registration
├── Managed Identity (Container Apps)
├── Service Principal (Terraform)
└── User Groups
    ├── CRM Administrators
    ├── CRM Users
    └── IT Operations
```

### RBAC Assignments
- **Container Apps Managed Identity**: Key Vault secrets access
- **Terraform Service Principal**: Contributor on resource groups
- **CRM Administrators**: Owner on CRM resources
- **IT Operations**: Monitoring Reader across all resources

## Data Flow

### User Request Flow
1. User accesses application via Front Door
2. WAF inspects and filters request
3. Front Door routes to healthy Container App instance
4. Container App authenticates user with Azure AD
5. Application queries PostgreSQL database
6. Session data stored in Redis cache
7. Response cached by Front Door CDN
8. Metrics sent to Application Insights

### Database Connection Flow
```
Container App ──→ Private Endpoint ──→ PostgreSQL
     │                                      │
     │              ┌─────────────────────┘
     │              │
     └─────→ Key Vault (credentials)
```

### Secrets Management Flow
```
Container App ──→ Managed Identity ──→ Key Vault ──→ Secrets
     │                                                   │
     └─── Environment Variables ←────────────────────────┘
```

## Deployment Architecture

### Infrastructure as Code
- **Terraform**: Infrastructure provisioning
- **Modules**: Reusable components
- **State Management**: Azure Storage backend
- **Environments**: Isolated configurations

### CI/CD Pipeline Architecture
```
Source Code ──→ Container Build ──→ Image Registry ──→ Container Apps
     │                                                        │
     ├─── Terraform Plan ──→ Infrastructure Review ──────────┘
     │
     └─── Database Migrations ──→ Schema Updates
```

### Environment Promotion
```
Development ──→ Staging ──→ Production
     │             │            │
     └─── Automated ├─── Approval Required
                     │
                     └─── Blue-Green Deployment
```

## Scalability Design

### Horizontal Scaling
- **Container Apps**: 0-20 instances based on HTTP requests
- **Database**: Read replicas for read-heavy workloads
- **Redis**: Clustering support in Premium tier
- **Front Door**: Global distribution

### Vertical Scaling
- **Container Apps**: CPU/Memory per instance
- **Database**: SKU upgrades with minimal downtime
- **Redis**: Capacity scaling without data loss

### Auto-scaling Triggers
- HTTP request rate (primary)
- CPU utilization (secondary)
- Memory pressure (secondary)
- Custom metrics (Application Insights)

## Disaster Recovery

### Backup Strategy
- **Database**: Automated backups with point-in-time restore
- **Infrastructure**: Terraform state in geo-redundant storage
- **Application**: Container images in ACR with geo-replication
- **Configuration**: Environment files in Git repository

### Recovery Procedures
1. **Infrastructure Recovery**: Terraform apply from backup state
2. **Database Recovery**: Point-in-time restore or geo-restore
3. **Application Recovery**: Deploy latest container image
4. **DNS Failover**: Update Front Door origins

### RTO/RPO Targets
- **Development**: RTO 4 hours, RPO 24 hours
- **Staging**: RTO 2 hours, RPO 12 hours
- **Production**: RTO 30 minutes, RPO 1 hour

## Performance Optimization

### Caching Strategy
1. **Front Door CDN**: Static assets (24 hours)
2. **Redis Cache**: API responses (5-60 minutes)
3. **Database**: Query result caching
4. **Application**: In-memory caching for reference data

### Database Optimization
- Connection pooling in application
- Indexed queries for common operations
- Regular maintenance and statistics updates
- Read replicas for reporting queries

### Container Optimization
- Multi-stage Docker builds
- Minimal base images (Node.js Alpine)
- Efficient application startup
- Health check optimization

## Cost Optimization

### Resource Sizing Strategy
- **Development**: Minimal resources, scale-to-zero
- **Staging**: Production-like but smaller
- **Production**: Right-sized for peak load

### Cost Controls
- Budget alerts and spending limits
- Reserved instances for predictable workloads
- Automatic shutdown for development resources
- Regular cost reviews and optimization

### Estimated Monthly Costs (USD)
- **Development**: $50-100
- **Staging**: $200-400
- **Production**: $800-1500

## Compliance and Governance

### Data Protection
- GDPR compliance measures
- Data residency in specified regions
- Audit logging for all access
- Data retention policies

### Governance Policies
- Resource naming conventions
- Mandatory tags for cost allocation
- Security baseline enforcement
- Change management processes

For deployment instructions, see the [Deployment Guide](deployment-guide.md).