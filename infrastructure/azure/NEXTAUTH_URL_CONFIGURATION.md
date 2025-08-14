# NEXTAUTH_URL Configuration for Azure Deployment

## Overview

The `NEXTAUTH_URL` environment variable is crucial for NextAuth.js to function properly in production. This document explains how to configure it for Azure deployment.

## Configuration Options

### 1. **Front Door URL (Recommended)**

The Azure infrastructure automatically configures `NEXTAUTH_URL` to use the Front Door URL:

- **Development**: `https://crm-dev.azurefd.net`
- **Staging**: `https://crm-staging.azurefd.net`  
- **Production**: `https://crm-prod.azurefd.net`

This is the **recommended approach** as it provides:
- ✅ CDN benefits (faster loading)
- ✅ WAF protection
- ✅ SSL/TLS termination
- ✅ Global distribution

### 2. **Custom Domain (Optional)**

If you have a custom domain, you can configure it in the environment files:

```hcl
# In environments/dev.tfvars, staging.tfvars, or prod.tfvars
custom_domain = "crm.yourcompany.com"
dns_zone_id   = "/subscriptions/your-subscription-id/resourceGroups/your-rg/providers/Microsoft.Network/dnszones/yourcompany.com"
```

This will set `NEXTAUTH_URL` to `https://crm.yourcompany.com`.

## How It Works

The Azure infrastructure automatically sets the `NEXTAUTH_URL` environment variable in the Container App:

```terraform
env {
  name  = "NEXTAUTH_URL"
  value = var.nextauth_url
}
```

Where `nextauth_url` is determined as:
```terraform
nextauth_url = var.custom_domain != "" ? "https://${var.custom_domain}" : "https://crm-${var.environment}.azurefd.net"
```

## Deployment Steps

### 1. **Using Front Door URL (Default)**

No additional configuration needed. The infrastructure automatically sets the correct URL.

### 2. **Using Custom Domain**

1. **Update environment file**:
   ```hcl
   # In environments/prod.tfvars
   custom_domain = "crm.yourcompany.com"
   dns_zone_id   = "/subscriptions/your-subscription-id/resourceGroups/your-rg/providers/Microsoft.Network/dnszones/yourcompany.com"
   ```

2. **Deploy the infrastructure**:
   ```bash
   cd infrastructure/azure
   terraform plan -var-file=environments/prod.tfvars
   terraform apply -var-file=environments/prod.tfvars
   ```

3. **Update Azure AD App Registration**:
   - Go to Azure Portal → App Registrations
   - Add your custom domain to the redirect URIs:
     - `https://crm.yourcompany.com/api/auth/callback/azure-ad`

## Verification

After deployment, verify the configuration:

1. **Check Container App environment variables**:
   ```bash
   az containerapp show --name ca-crm-prod-xxxxx --resource-group rg-crm-prod-xxxxx --query "properties.template.containers[0].env[?name=='NEXTAUTH_URL'].value"
   ```

2. **Test authentication flow**:
   - Visit your application URL
   - Try to sign in with Azure AD
   - Verify the callback URL is correct

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**:
   - Ensure the redirect URI in Azure AD matches your `NEXTAUTH_URL`
   - Add both Front Door URL and custom domain if using custom domain

2. **Authentication callback fails**:
   - Check that `NEXTAUTH_URL` is set correctly in Container App
   - Verify the URL is accessible from the internet

3. **Mixed content errors**:
   - Ensure `NEXTAUTH_URL` uses `https://` (not `http://`)
   - Check that Front Door is configured for HTTPS only

### Debug Commands

```bash
# Check Container App environment variables
az containerapp show --name ca-crm-prod-xxxxx --resource-group rg-crm-prod-xxxxx --query "properties.template.containers[0].env"

# Check Front Door endpoint
az cdn frontdoor endpoint show --name crm-prod --profile-name fd-crm-prod-xxxxx --resource-group rg-crm-prod-xxxxx

# Check custom domain (if configured)
az cdn frontdoor custom-domain show --name custom-domain --profile-name fd-crm-prod-xxxxx --resource-group rg-crm-prod-xxxxx
```

## Security Considerations

- ✅ Always use HTTPS URLs
- ✅ Use Front Door for additional security layers
- ✅ Configure WAF rules appropriately
- ✅ Monitor authentication logs for suspicious activity
- ✅ Regularly rotate Azure AD client secrets

## Environment-Specific URLs

| Environment | Front Door URL | Custom Domain Example |
|-------------|----------------|----------------------|
| Development | `https://crm-dev.azurefd.net` | `https://crm-dev.yourcompany.com` |
| Staging     | `https://crm-staging.azurefd.net` | `https://crm-staging.yourcompany.com` |
| Production  | `https://crm-prod.azurefd.net` | `https://crm.yourcompany.com` |

## Migration from localhost

If you're migrating from local development:

1. **Update Azure AD App Registration**:
   - Add production redirect URIs
   - Remove localhost URIs (or keep for development)

2. **Update environment variables**:
   - `NEXTAUTH_URL` will be set automatically by infrastructure
   - No manual configuration needed

3. **Test thoroughly**:
   - Test authentication flow in staging first
   - Verify all OAuth callbacks work correctly 