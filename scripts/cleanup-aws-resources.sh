#!/bin/bash

# AWS Resource Cleanup Script for 4401_CRM Project
# This script removes ALL AWS resources created by the project
# USE WITH EXTREME CAUTION - THIS WILL DELETE EVERYTHING!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="crm"
ENVIRONMENTS=("staging" "production")
REGIONS=("us-west-2" "us-east-1")  # Check both regions for safety

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to confirm deletion
confirm_deletion() {
    local resource_type="$1"
    echo
    print_warning "⚠️  DANGER: About to delete $resource_type"
    echo -e "${RED}This action is IRREVERSIBLE!${NC}"
    read -p "Are you sure you want to continue? (type 'DELETE' to confirm): " confirmation
    
    if [ "$confirmation" != "DELETE" ]; then
        print_status "Deletion cancelled."
        return 1
    fi
    return 0
}

# Function to check if AWS CLI is configured
check_aws_cli() {
    print_status "🔍 Checking AWS CLI configuration..."
    
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed!"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS CLI is not configured or credentials are invalid!"
        exit 1
    fi
    
    local account_id=$(aws sts get-caller-identity --query 'Account' --output text)
    local region=$(aws configure get region)
    
    print_success "✅ AWS CLI configured"
    print_status "   Account ID: $account_id"
    print_status "   Default Region: $region"
}

# Function to destroy CDK stacks
destroy_cdk_stacks() {
    print_status "🏗️ Destroying CDK stacks..."
    
    local cdk_dir="../infrastructure"
    if [ ! -d "$cdk_dir" ]; then
        print_warning "CDK directory not found: $cdk_dir"
        return 0
    fi
    
    cd "$cdk_dir"
    
    for env in "${ENVIRONMENTS[@]}"; do
        print_status "   Checking environment: $env"
        
        # List stacks for this environment
        local stacks=$(cdk list --context environment=$env 2>/dev/null || echo "")
        
        if [ -n "$stacks" ]; then
            print_status "   Found stacks for $env environment:"
            echo "$stacks" | sed 's/^/     - /'
            
            if confirm_deletion "CDK stacks for $env environment"; then
                print_status "   Destroying $env stacks..."
                cdk destroy --all --context environment=$env --force || print_warning "Some stacks may have already been deleted"
                print_success "   ✅ CDK stacks destroyed for $env"
            else
                print_status "   Skipped CDK stack deletion for $env"
            fi
        else
            print_status "   No CDK stacks found for $env environment"
        fi
    done
    
    cd - > /dev/null
}

# Function to clean up ECR repositories
cleanup_ecr_repositories() {
    print_status "🐳 Cleaning up ECR repositories..."
    
    for region in "${REGIONS[@]}"; do
        print_status "   Checking region: $region"
        
        # List ECR repositories related to our project
        local repos=$(aws ecr describe-repositories \
            --region "$region" \
            --query "repositories[?contains(repositoryName, '$PROJECT_NAME')].repositoryName" \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$repos" ] && [ "$repos" != "None" ]; then
            print_status "   Found ECR repositories in $region:"
            echo "$repos" | tr '\t' '\n' | sed 's/^/     - /'
            
            if confirm_deletion "ECR repositories in $region"; then
                for repo in $repos; do
                    print_status "   Deleting repository: $repo"
                    
                    # Delete all images first
                    aws ecr list-images \
                        --repository-name "$repo" \
                        --region "$region" \
                        --query 'imageIds[*]' \
                        --output json | \
                    jq -r '.[] | select(. != null) | @base64' | \
                    while IFS= read -r img; do
                        local image_id=$(echo "$img" | base64 -d)
                        if [ "$image_id" != "null" ] && [ -n "$image_id" ]; then
                            aws ecr batch-delete-image \
                                --repository-name "$repo" \
                                --region "$region" \
                                --image-ids "$image_id" &>/dev/null || true
                        fi
                    done
                    
                    # Delete the repository
                    aws ecr delete-repository \
                        --repository-name "$repo" \
                        --region "$region" \
                        --force || print_warning "Failed to delete repository $repo"
                    
                    print_success "     ✅ Deleted repository: $repo"
                done
            else
                print_status "   Skipped ECR repository deletion in $region"
            fi
        else
            print_status "   No ECR repositories found in $region"
        fi
    done
}

# Function to clean up Secrets Manager secrets
cleanup_secrets() {
    print_status "🔐 Cleaning up Secrets Manager secrets..."
    
    for region in "${REGIONS[@]}"; do
        print_status "   Checking region: $region"
        
        # List secrets related to our project
        local secrets=$(aws secretsmanager list-secrets \
            --region "$region" \
            --query "SecretList[?contains(Name, '$PROJECT_NAME')].Name" \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$secrets" ] && [ "$secrets" != "None" ]; then
            print_status "   Found secrets in $region:"
            echo "$secrets" | tr '\t' '\n' | sed 's/^/     - /'
            
            if confirm_deletion "Secrets Manager secrets in $region"; then
                for secret in $secrets; do
                    print_status "   Deleting secret: $secret"
                    aws secretsmanager delete-secret \
                        --secret-id "$secret" \
                        --region "$region" \
                        --force-delete-without-recovery || print_warning "Failed to delete secret $secret"
                    print_success "     ✅ Deleted secret: $secret"
                done
            else
                print_status "   Skipped secrets deletion in $region"
            fi
        else
            print_status "   No secrets found in $region"
        fi
    done
}

# Function to clean up SSM parameters
cleanup_ssm_parameters() {
    print_status "⚙️ Cleaning up SSM parameters..."
    
    for region in "${REGIONS[@]}"; do
        print_status "   Checking region: $region"
        
        # List SSM parameters related to our project
        local parameters=$(aws ssm describe-parameters \
            --region "$region" \
            --query "Parameters[?contains(Name, '/$PROJECT_NAME/')].Name" \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$parameters" ] && [ "$parameters" != "None" ]; then
            print_status "   Found SSM parameters in $region:"
            echo "$parameters" | tr '\t' '\n' | sed 's/^/     - /'
            
            if confirm_deletion "SSM parameters in $region"; then
                for param in $parameters; do
                    print_status "   Deleting parameter: $param"
                    aws ssm delete-parameter \
                        --name "$param" \
                        --region "$region" || print_warning "Failed to delete parameter $param"
                    print_success "     ✅ Deleted parameter: $param"
                done
            else
                print_status "   Skipped SSM parameters deletion in $region"
            fi
        else
            print_status "   No SSM parameters found in $region"
        fi
    done
}

# Function to clean up CloudWatch logs
cleanup_cloudwatch_logs() {
    print_status "📊 Cleaning up CloudWatch log groups..."
    
    for region in "${REGIONS[@]}"; do
        print_status "   Checking region: $region"
        
        # List log groups related to our project
        local log_groups=$(aws logs describe-log-groups \
            --region "$region" \
            --query "logGroups[?contains(logGroupName, '$PROJECT_NAME')].logGroupName" \
            --output text 2>/dev/null || echo "")
        
        if [ -n "$log_groups" ] && [ "$log_groups" != "None" ]; then
            print_status "   Found log groups in $region:"
            echo "$log_groups" | tr '\t' '\n' | sed 's/^/     - /'
            
            if confirm_deletion "CloudWatch log groups in $region"; then
                for log_group in $log_groups; do
                    print_status "   Deleting log group: $log_group"
                    aws logs delete-log-group \
                        --log-group-name "$log_group" \
                        --region "$region" || print_warning "Failed to delete log group $log_group"
                    print_success "     ✅ Deleted log group: $log_group"
                done
            else
                print_status "   Skipped log groups deletion in $region"
            fi
        else
            print_status "   No log groups found in $region"
        fi
    done
}

# Function to display final warning
display_final_warning() {
    echo
    echo "=========================================="
    echo -e "${RED}   ⚠️  FINAL WARNING ⚠️${NC}"
    echo "=========================================="
    echo
    print_warning "This script will DELETE ALL AWS resources for the 4401_CRM project:"
    echo "  • CDK stacks (Infrastructure, App Runner)"
    echo "  • ECR repositories and Docker images"
    echo "  • Secrets Manager secrets"
    echo "  • SSM parameters"
    echo "  • CloudWatch log groups"
    echo "  • All associated data and configurations"
    echo
    print_error "💰 This will STOP ALL CHARGES but CANNOT BE UNDONE!"
    echo
    echo "Resources will be checked in these regions:"
    for region in "${REGIONS[@]}"; do
        echo "  • $region"
    done
    echo
    echo "Environments to be cleaned:"
    for env in "${ENVIRONMENTS[@]}"; do
        echo "  • $env"
    done
    echo
}

# Function to show cleanup summary
show_cleanup_summary() {
    echo
    echo "=========================================="
    echo -e "${GREEN}   🎉 CLEANUP COMPLETED 🎉${NC}"
    echo "=========================================="
    echo
    print_success "All specified AWS resources have been cleaned up!"
    echo
    print_status "What was cleaned:"
    echo "  ✅ CDK stacks destroyed"
    echo "  ✅ ECR repositories deleted"
    echo "  ✅ Secrets removed"
    echo "  ✅ SSM parameters deleted"
    echo "  ✅ CloudWatch logs cleared"
    echo
    print_warning "💡 Remember to check your AWS billing to ensure all charges have stopped."
    echo
}

# Main execution function
main() {
    echo "=========================================="
    echo -e "${BLUE}   AWS Resource Cleanup Script${NC}"
    echo -e "${BLUE}   4401_CRM Project${NC}"
    echo "=========================================="
    echo
    
    # Display warnings and get confirmation
    display_final_warning
    
    if ! confirm_deletion "ALL AWS RESOURCES for the 4401_CRM project"; then
        print_status "Cleanup cancelled. No resources were deleted."
        exit 0
    fi
    
    # Check prerequisites
    check_aws_cli
    
    echo
    print_status "🚀 Starting cleanup process..."
    echo
    
    # Execute cleanup steps
    destroy_cdk_stacks
    echo
    cleanup_ecr_repositories
    echo
    cleanup_secrets
    echo
    cleanup_ssm_parameters
    echo
    cleanup_cloudwatch_logs
    
    # Show summary
    show_cleanup_summary
}

# Run the script
main "$@" 