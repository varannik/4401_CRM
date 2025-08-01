#!/bin/bash

# Quick AWS CDK Cleanup Script
# Simplified version for rapid CDK stack deletion

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Usage function
usage() {
    echo "Usage: $0 [staging|production|all]"
    echo
    echo "Examples:"
    echo "  $0 staging     # Delete only staging environment"
    echo "  $0 production  # Delete only production environment"
    echo "  $0 all         # Delete all environments"
    echo
    exit 1
}

# Quick confirmation
quick_confirm() {
    local env="$1"
    echo
    print_warning "⚠️  About to delete CDK stacks for: $env"
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cancelled."
        exit 0
    fi
}

# Quick CDK destroy
quick_destroy() {
    local env="$1"
    
    print_status "🚀 Quick destroying CDK stacks for: $env"
    
    cd "infrastructure" 2>/dev/null || {
        print_warning "Run this script from the project root directory"
        exit 1
    }
    
    # Check if stacks exist
    local stacks=$(cdk list --context environment="$env" 2>/dev/null || echo "")
    
    if [ -z "$stacks" ]; then
        print_status "No stacks found for environment: $env"
        cd - > /dev/null
        return 0
    fi
    
    print_status "Found stacks:"
    echo "$stacks" | sed 's/^/  • /'
    
    # Destroy with force
    cdk destroy --all --context environment="$env" --force
    
    print_success "✅ Destroyed stacks for: $env"
    cd - > /dev/null
}

# Main function
main() {
    local env="${1:-}"
    
    if [ -z "$env" ]; then
        usage
    fi
    
    case "$env" in
        staging)
            quick_confirm "staging"
            quick_destroy "staging"
            ;;
        production)
            quick_confirm "production"
            quick_destroy "production"
            ;;
        all)
            quick_confirm "all environments"
            quick_destroy "staging"
            quick_destroy "production"
            ;;
        *)
            echo "Invalid environment: $env"
            usage
            ;;
    esac
    
    print_success "🎉 Quick cleanup completed!"
}

main "$@" 