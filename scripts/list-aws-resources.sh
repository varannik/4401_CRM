#!/bin/bash

# AWS Resource Listing Script for 4401_CRM Project
# Lists all AWS resources without deleting them

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="crm"
ENVIRONMENTS=("staging" "production")
REGIONS=("us-west-2" "us-east-1")

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo
    echo "=========================================="
    echo -e "${BLUE}   $1${NC}"
    echo "=========================================="
}

# Check AWS CLI
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI is not installed!"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_warning "AWS CLI is not configured!"
        exit 1
    fi
    
    local account_id=$(aws sts get-caller-identity --query 'Account' --output text)
    local region=$(aws configure get region)
    
    print_success "AWS Account: $account_id | Default Region: $region"
}

# List CDK stacks
list_cdk_stacks() {
    print_header "CDK Stacks"
    
    if [ ! -d "infrastructure" ]; then
        print_warning "Infrastructure directory not found"
        return 0
    fi
    
    cd infrastructure
    
    for env in "${ENVIRONMENTS[@]}"; do
        print_status "Environment: $env"
        
        local stacks=$(cdk list --context environment="$env" 2>/dev/null || echo "")
        
        if [ -n "$stacks" ]; then
            echo "$stacks" | sed 's/^/  • /'
            
            # Get stack status
            for stack in $stacks; do
                local status=$(aws cloudformation describe-stacks --stack-name "$stack" --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")
                printf "    Status: %-30s %s\n" "$stack" "$status"
            done
        else
            echo "    No stacks found"
        fi
        echo
    done
    
    cd - > /dev/null
}

# List ECR repositories
list_ecr_repositories() {
    print_header "ECR Repositories"
    
    for region in "${REGIONS[@]}"; do
        print_status "Region: $region"
        
        local repos=$(aws ecr describe-repositories \
            --region "$region" \
            --query "repositories[?contains(repositoryName, '$PROJECT_NAME')].{Name:repositoryName,URI:repositoryUri,Images:registryId}" \
            --output table 2>/dev/null || echo "")
        
        if [ -n "$repos" ] && [[ "$repos" != *"None"* ]]; then
            echo "$repos"
            
            # Count images in each repo
            local repo_names=$(aws ecr describe-repositories \
                --region "$region" \
                --query "repositories[?contains(repositoryName, '$PROJECT_NAME')].repositoryName" \
                --output text 2>/dev/null || echo "")
            
            for repo in $repo_names; do
                local image_count=$(aws ecr describe-images \
                    --repository-name "$repo" \
                    --region "$region" \
                    --query 'length(imageDetails)' \
                    --output text 2>/dev/null || echo "0")
                echo "    $repo: $image_count images"
            done
        else
            echo "    No repositories found"
        fi
        echo
    done
}

# List Secrets Manager secrets
list_secrets() {
    print_header "Secrets Manager"
    
    for region in "${REGIONS[@]}"; do
        print_status "Region: $region"
        
        local secrets=$(aws secretsmanager list-secrets \
            --region "$region" \
            --query "SecretList[?contains(Name, '$PROJECT_NAME')].{Name:Name,Description:Description,LastChanged:LastChangedDate}" \
            --output table 2>/dev/null || echo "")
        
        if [ -n "$secrets" ] && [[ "$secrets" != *"None"* ]]; then
            echo "$secrets"
        else
            echo "    No secrets found"
        fi
        echo
    done
}

# List SSM parameters
list_ssm_parameters() {
    print_header "SSM Parameters"
    
    for region in "${REGIONS[@]}"; do
        print_status "Region: $region"
        
        local parameters=$(aws ssm describe-parameters \
            --region "$region" \
            --query "Parameters[?contains(Name, '/$PROJECT_NAME/')].{Name:Name,Type:Type,LastModified:LastModifiedDate}" \
            --output table 2>/dev/null || echo "")
        
        if [ -n "$parameters" ] && [[ "$parameters" != *"None"* ]]; then
            echo "$parameters"
        else
            echo "    No parameters found"
        fi
        echo
    done
}

# List CloudWatch log groups
list_cloudwatch_logs() {
    print_header "CloudWatch Log Groups"
    
    for region in "${REGIONS[@]}"; do
        print_status "Region: $region"
        
        local log_groups=$(aws logs describe-log-groups \
            --region "$region" \
            --query "logGroups[?contains(logGroupName, '$PROJECT_NAME')].{Name:logGroupName,SizeBytes:storedBytes,RetentionDays:retentionInDays}" \
            --output table 2>/dev/null || echo "")
        
        if [ -n "$log_groups" ] && [[ "$log_groups" != *"None"* ]]; then
            echo "$log_groups"
        else
            echo "    No log groups found"
        fi
        echo
    done
}

# Calculate estimated costs
estimate_costs() {
    print_header "💰 Estimated Monthly Costs"
    
    print_status "Based on current resource usage:"
    echo
    
    # This is a simplified cost estimation
    local aurora_cost="~\$25-100/month (Aurora Serverless v2)"
    local apprunner_cost="~\$15-50/month (App Runner)"
    local ecr_cost="~\$1-5/month (ECR storage)"
    local other_cost="~\$5-15/month (Secrets, SSM, CloudWatch)"
    
    echo "  • Aurora Serverless v2: $aurora_cost"
    echo "  • App Runner: $apprunner_cost"
    echo "  • ECR: $ecr_cost"
    echo "  • Other services: $other_cost"
    echo
    echo "  💡 Total estimated: \$46-170/month"
    echo
    print_warning "These are rough estimates. Check AWS Billing for actual costs."
}

# Show cleanup options
show_cleanup_options() {
    print_header "🧹 Cleanup Options"
    
    echo "To remove resources and stop charges:"
    echo
    echo "1. Quick CDK cleanup:"
    echo "   ./scripts/quick-cleanup.sh staging"
    echo "   ./scripts/quick-cleanup.sh production"
    echo
    echo "2. Complete cleanup (everything):"
    echo "   ./scripts/cleanup-aws-resources.sh"
    echo
    echo "3. Manual cleanup:"
    echo "   cd infrastructure"
    echo "   cdk destroy --all --context environment=staging --force"
    echo
}

# Main function
main() {
    echo "=========================================="
    echo -e "${BLUE}   AWS Resource Inventory${NC}"
    echo -e "${BLUE}   4401_CRM Project${NC}"
    echo "=========================================="
    
    check_aws_cli
    
    list_cdk_stacks
    list_ecr_repositories
    list_secrets
    list_ssm_parameters
    list_cloudwatch_logs
    estimate_costs
    show_cleanup_options
    
    print_success "🎉 Resource inventory completed!"
}

main "$@" 