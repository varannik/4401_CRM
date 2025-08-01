# AWS Cleanup Scripts for 4401_CRM

This directory contains scripts to manage and clean up AWS resources created by the 4401_CRM project.

## 🚨 **IMPORTANT WARNING**
These scripts **DELETE REAL AWS RESOURCES** and can result in **DATA LOSS**. Use with extreme caution!

## 📋 **Available Scripts**

### 1. 🧹 **Complete Cleanup** - `cleanup-aws-resources.sh`
**Removes ALL AWS resources created by the project**

```bash
./scripts/cleanup-aws-resources.sh
```

**What it deletes:**
- ✅ CDK stacks (Infrastructure, App Runner)
- ✅ ECR repositories and Docker images
- ✅ Secrets Manager secrets
- ✅ SSM parameters
- ✅ CloudWatch log groups
- ✅ All associated data and configurations

**Safety features:**
- Multiple confirmation prompts
- Must type "DELETE" to confirm
- Lists resources before deletion
- Checks multiple regions
- Colored output for clarity

---

### 2. ⚡ **Quick Cleanup** - `quick-cleanup.sh`
**Fast CDK stack deletion only**

```bash
# Delete staging environment
./scripts/quick-cleanup.sh staging

# Delete production environment
./scripts/quick-cleanup.sh production

# Delete all environments
./scripts/quick-cleanup.sh all
```

**What it deletes:**
- ✅ CDK stacks only
- ⚠️ Leaves ECR, secrets, logs intact

**Use when:**
- Quick testing cycles
- Only need to remove main infrastructure
- Want to keep Docker images and secrets

---

### 3. 📊 **List Resources** - `list-aws-resources.sh`
**Shows all project resources WITHOUT deleting**

```bash
./scripts/list-aws-resources.sh
```

**What it shows:**
- 📋 CDK stacks and their status
- 🐳 ECR repositories and image counts
- 🔐 Secrets Manager secrets
- ⚙️ SSM parameters
- 📊 CloudWatch log groups
- 💰 Estimated monthly costs
- 🧹 Cleanup instructions

**Use for:**
- Resource inventory
- Cost estimation
- Before cleanup planning
- Understanding what exists

---

### 4. 🐳 **Initial Docker Push** - `initial-docker-push.sh`
**Pushes first Docker image to ECR**

```bash
# For staging environment
./scripts/initial-docker-push.sh staging

# For production environment
./scripts/initial-docker-push.sh production
```

**What it does:**
- 🔐 Logs into AWS ECR
- 🏗️ Builds Docker image
- 📤 Pushes to ECR repository
- 🚀 Triggers App Runner deployment

---

### 5. 🚀 **Full Deployment** - `deploy.sh`
**Complete deployment with health checks**

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

**What it does:**
- ✅ Prerequisites check
- 🏗️ Infrastructure deployment
- 🐳 Docker build and push
- 🗄️ Database migrations
- 🔍 Health checks
- 📊 Post-deployment verification

## 🎯 **Common Use Cases**

### **Starting Fresh**
```bash
# 1. Clean everything
./scripts/cleanup-aws-resources.sh

# 2. Deploy from scratch
cd infrastructure
cdk deploy --all --context environment=staging

# 3. Push initial image
./scripts/initial-docker-push.sh staging
```

### **Quick Development Cycle**
```bash
# Destroy stacks
./scripts/quick-cleanup.sh staging

# Redeploy
cd infrastructure
cdk deploy --all --context environment=staging
```

### **Cost Management**
```bash
# Check what's running
./scripts/list-aws-resources.sh

# Clean up staging when not needed
./scripts/quick-cleanup.sh staging
```

### **Production Cleanup** (⚠️ **DANGER**)
```bash
# ONLY in emergencies - this deletes EVERYTHING
./scripts/cleanup-aws-resources.sh
```

## 📋 **Prerequisites**

All scripts require:
- ✅ **AWS CLI** installed and configured
- ✅ **CDK CLI** installed (`npm install -g aws-cdk`)
- ✅ **Docker** installed (for Docker scripts)
- ✅ **jq** installed (for JSON parsing)
- ✅ Proper AWS credentials with admin permissions

## 🔒 **Security Notes**

1. **Credentials**: Scripts use your AWS CLI credentials
2. **Permissions**: Require full admin access to delete resources
3. **Regions**: Scripts check multiple regions for safety
4. **Confirmation**: Multiple prompts prevent accidental deletion
5. **Logging**: All actions are logged with timestamps

## 💡 **Tips**

- **Always run `list-aws-resources.sh` first** to see what exists
- **Use staging environment** for testing scripts
- **Keep production cleanup for absolute emergencies**
- **Check AWS billing** after cleanup to ensure charges stopped
- **Scripts are safe to run multiple times** (idempotent)

## 🐛 **Troubleshooting**

### Script Permission Denied
```bash
chmod +x scripts/*.sh
```

### AWS CLI Not Configured
```bash
aws configure
```

### CDK Not Found
```bash
npm install -g aws-cdk
# or
brew install aws-cdk
```

### Region Issues
```bash
# Check your default region
aws configure get region

# Set if needed
aws configure set region us-west-2
```

## 📞 **Support**

If scripts fail or behave unexpectedly:

1. **Check prerequisites** (AWS CLI, CDK, Docker)
2. **Verify AWS credentials** (`aws sts get-caller-identity`)
3. **Check region configuration** (`aws configure get region`)
4. **Run resource listing** first (`./scripts/list-aws-resources.sh`)
5. **Review script output** for specific error messages

---

**⚠️ Remember: These scripts manage real AWS resources and costs. Always double-check what you're doing!** 