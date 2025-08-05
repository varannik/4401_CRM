#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CrmInfrastructureStack } from '../lib/crm-infrastructure-stack';
import { CrmAppRunnerStack } from '../lib/crm-apprunner-stack';

const app = new cdk.App();

// Get environment from context
const environment = app.node.tryGetContext('environment') || 'staging';
const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION || 'us-west-2';

// Environment-specific configurations
const envConfig = {
  staging: {
    minCapacity: 0.5,
    maxCapacity: 1,
    appRunnerCpu: '0.25 vCPU',
    appRunnerMemory: '0.5 GB',
    domain: undefined // No custom domain for staging
  },
  production: {
    minCapacity: 0.5,
    maxCapacity: 16,
    appRunnerCpu: '1 vCPU',
    appRunnerMemory: '2 GB',
    domain: 'your-domain.com' // Replace with your actual domain
  }
};

const config = envConfig[environment as keyof typeof envConfig];

if (!config) {
  throw new Error(`Unknown environment: ${environment}`);
}

// Tags applied to all resources
const tags = {
  Environment: environment,
  Project: '4401-CRM',
  ManagedBy: 'CDK',
  Owner: 'DevOps'
};

// Infrastructure Stack (VPC, Aurora, Security Groups)
const infrastructureStack = new CrmInfrastructureStack(app, `CrmInfrastructure-${environment}`, {
  env: { account, region },
  stackName: `crm-infrastructure-${environment}`,
  description: `CRM Infrastructure Stack for ${environment}`,
  minCapacity: config.minCapacity,
  maxCapacity: config.maxCapacity,
  environment,
  tags
});

// App Runner Stack (depends on infrastructure)
const appRunnerStack = new CrmAppRunnerStack(app, `CrmAppRunner-${environment}`, {
  env: { account, region },
  stackName: `crm-apprunner-${environment}`,
  description: `CRM App Runner Stack for ${environment}`,
  vpc: infrastructureStack.vpc,
  database: infrastructureStack.database,
  databaseSecret: infrastructureStack.databaseSecret,
  appRunnerSecurityGroup: infrastructureStack.appRunnerSecurityGroup,
  cpu: config.appRunnerCpu,
  memory: config.appRunnerMemory,
  domain: config.domain,
  environment,
  tags
});

// Add dependency
appRunnerStack.addDependency(infrastructureStack);

// Output important values
new cdk.CfnOutput(infrastructureStack, 'DatabaseEndpoint', {
  value: infrastructureStack.database.clusterEndpoint.hostname,
  description: 'Aurora Serverless v2 cluster endpoint'
});

new cdk.CfnOutput(infrastructureStack, 'DatabaseSecretArn', {
  value: infrastructureStack.databaseSecret.secretArn,
  description: 'Database credentials secret ARN'
});

new cdk.CfnOutput(appRunnerStack, 'AppRunnerServiceUrl', {
  value: appRunnerStack.serviceUrl,
  description: 'App Runner service URL'
});

new cdk.CfnOutput(appRunnerStack, 'EcrRepository', {
  value: appRunnerStack.ecrRepository.repositoryUri,
  description: 'ECR repository URI for CI/CD'
}); 