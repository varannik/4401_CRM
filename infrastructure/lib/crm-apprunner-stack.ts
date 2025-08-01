import * as cdk from 'aws-cdk-lib';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface CrmAppRunnerStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  database: rds.DatabaseCluster;
  databaseSecret: secretsmanager.Secret;
  appRunnerSecurityGroup: ec2.SecurityGroup;
  cpu: string;
  memory: string;
  domain?: string;
  environment: string;
}

export class CrmAppRunnerStack extends cdk.Stack {
  public readonly serviceUrl: string;
  public readonly ecrRepository: cdk.aws_ecr.Repository;

  constructor(scope: Construct, id: string, props: CrmAppRunnerStackProps) {
    super(scope, id, props);

    // Instance role for App Runner service
    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      description: 'Instance role for CRM App Runner service',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
      ],
    });

    // Add permissions to access database secret
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret'
      ],
      resources: [props.databaseSecret.secretArn]
    }));

    // Add permissions for RDS Data API (if using Data API)
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'rds-data:BatchExecuteStatement',
        'rds-data:BeginTransaction',
        'rds-data:CommitTransaction',
        'rds-data:ExecuteStatement',
        'rds-data:RollbackTransaction'
      ],
             resources: [`arn:aws:rds:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:cluster:${props.database.clusterIdentifier}`]
    }));

    // Access role for App Runner to access ECR
    const accessRole = new iam.Role(this, 'AppRunnerAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      description: 'Access role for App Runner to pull from ECR',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppRunnerServicePolicyForECRAccess'),
      ],
    });

    // VPC Connector for App Runner to access database
    const vpcConnector = new apprunner.CfnVpcConnector(this, 'VpcConnector', {
      vpcConnectorName: `crm-vpc-connector-${props.environment}`,
      subnets: props.vpc.privateSubnets.map(subnet => subnet.subnetId),
      securityGroups: [props.appRunnerSecurityGroup.securityGroupId],
      tags: [
        { key: 'Environment', value: props.environment },
        { key: 'Component', value: 'AppRunner' }
      ]
    });

    // Generate secure secret key for NextAuth
    const nextAuthSecret = new secretsmanager.Secret(this, 'NextAuthSecret', {
      description: 'NextAuth.js secret key',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'NEXTAUTH_SECRET',
        excludeCharacters: '"@/\\\'',
        passwordLength: 32,
      },
    });

    // Create Azure AD credentials secret (placeholder - update with actual values)
    const azureAdSecret = new secretsmanager.Secret(this, 'AzureAdSecret', {
      description: 'Azure AD credentials for authentication',
      secretStringValue: cdk.SecretValue.unsafePlainText(JSON.stringify({
        AZURE_AD_CLIENT_ID: 'update-with-actual-client-id',
        AZURE_AD_CLIENT_SECRET: 'update-with-actual-client-secret',
        AZURE_AD_TENANT_ID: 'update-with-actual-tenant-id'
      })),
    });

    // Grant access to secrets
    instanceRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret'
      ],
      resources: [nextAuthSecret.secretArn, azureAdSecret.secretArn]
    }));

        // ECR Repository for storing Docker images
    const ecrRepository = new cdk.aws_ecr.Repository(this, 'CrmEcrRepository', {
      repositoryName: `crm-app-${props.environment}`,
      imageScanOnPush: true,
      lifecycleRules: [
        {
          maxImageCount: 10, // Keep only 10 latest images
        },
      ],
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Grant access to ECR repository
    ecrRepository.grantPull(accessRole);

    // App Runner service configuration using ECR
    const appRunnerService = new apprunner.CfnService(this, 'CrmAppRunnerService', {
      serviceName: `crm-app-${props.environment}`,
      sourceConfiguration: {
        autoDeploymentsEnabled: false, // Will be triggered by CI/CD
        imageRepository: {
          imageIdentifier: `${ecrRepository.repositoryUri}:latest`,
          imageConfiguration: {
            port: '3000',
            runtimeEnvironmentVariables: [
              {
                name: 'NODE_ENV',
                value: props.environment === 'production' ? 'production' : 'development',
              },
              {
                name: 'NEXTAUTH_URL',
                value: props.domain 
                  ? `https://${props.domain}` 
                  : `https://${props.environment}-crm.awsapprunner.com`,
              },
              {
                name: 'DATABASE_URL',
                value: `postgresql://crmadmin:{{resolve:secretsmanager:${props.databaseSecret.secretArn}:SecretString:password}}@${props.database.clusterEndpoint.hostname}:5432/crmdb`,
              },
            ],
            runtimeEnvironmentSecrets: [
              {
                name: 'NEXTAUTH_SECRET',
                value: nextAuthSecret.secretArn + ':NEXTAUTH_SECRET::',
              },
              {
                name: 'AZURE_AD_CLIENT_ID',
                value: azureAdSecret.secretArn + ':AZURE_AD_CLIENT_ID::',
              },
              {
                name: 'AZURE_AD_CLIENT_SECRET',
                value: azureAdSecret.secretArn + ':AZURE_AD_CLIENT_SECRET::',
              },
              {
                name: 'AZURE_AD_TENANT_ID',
                value: azureAdSecret.secretArn + ':AZURE_AD_TENANT_ID::',
              },
            ]
          },
          imageRepositoryType: 'ECR'
        }
      },
      instanceConfiguration: {
        cpu: props.cpu,
        memory: props.memory,
        instanceRoleArn: instanceRole.roleArn,
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
        ingressConfiguration: {
          isPubliclyAccessible: true
        }
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/api/health',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
      autoScalingConfigurationArn: this.createAutoScalingConfiguration(props.environment).attrAutoScalingConfigurationArn,
      tags: [
        { key: 'Environment', value: props.environment },
        { key: 'Component', value: 'AppRunner' }
      ]
    });

    appRunnerService.addDependency(vpcConnector);

    // Store service URL
    this.serviceUrl = `https://${appRunnerService.attrServiceUrl}`;

    // Custom domain (if provided)
    if (props.domain) {
      this.setupCustomDomain(appRunnerService, props.domain, props.environment);
    }

    // CloudWatch Log Group for App Runner
    const logGroup = new logs.LogGroup(this, 'AppRunnerLogGroup', {
      logGroupName: `/aws/apprunner/${appRunnerService.serviceName}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // CloudWatch Dashboard
    this.createDashboard(appRunnerService, props.environment);

    // Outputs
    new cdk.CfnOutput(this, 'ServiceUrl', {
      value: this.serviceUrl,
      description: 'App Runner service URL'
    });

    new cdk.CfnOutput(this, 'ServiceArn', {
      value: appRunnerService.attrServiceArn,
      description: 'App Runner service ARN'
    });

    new cdk.CfnOutput(this, 'AzureAdSecretArn', {
      value: azureAdSecret.secretArn,
      description: 'Azure AD credentials secret ARN - update with your actual Azure AD values'
    });

    new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: ecrRepository.repositoryUri,
      description: 'ECR repository URI for Docker images'
    });

    // Export ECR repository for use in CI/CD
    this.ecrRepository = ecrRepository;

    // Tags
    cdk.Tags.of(this).add('Component', 'AppRunner');
  }



  private createAutoScalingConfiguration(environment: string): apprunner.CfnAutoScalingConfiguration {
    return new apprunner.CfnAutoScalingConfiguration(this, 'AutoScalingConfig', {
      autoScalingConfigurationName: `crm-autoscaling-${environment}`,
      maxConcurrency: environment === 'production' ? 100 : 25,
      maxSize: environment === 'production' ? 10 : 3,
      minSize: environment === 'production' ? 2 : 1,
      tags: [
        { key: 'Environment', value: environment },
        { key: 'Component', value: 'AutoScaling' }
      ]
    });
  }

  private setupCustomDomain(service: apprunner.CfnService, domain: string, environment: string) {
    // This is a simplified version - you'd need to set up Route53 and ACM properly
    // For production, you'd want to:
    // 1. Create or import ACM certificate
    // 2. Create Route53 hosted zone
    // 3. Set up domain association
    
    // Certificate (you should import existing or create new)
    // const certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', 'your-certificate-arn');
    
    // Domain association
    // new apprunner.CfnCustomDomainAssociation(this, 'CustomDomain', {
    //   serviceArn: service.attrServiceArn,
    //   domainName: domain,
    //   enableWwwSubdomain: false,
    // });
  }

  private createDashboard(service: apprunner.CfnService, environment: string) {
    const dashboard = new cdk.aws_cloudwatch.Dashboard(this, 'AppRunnerDashboard', {
      dashboardName: `CRM-${environment}-AppRunner`
    });

    // Add App Runner metrics
    dashboard.addWidgets(
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Request Count',
        width: 12,
        left: [
          new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/AppRunner',
            metricName: 'RequestCount',
            dimensionsMap: {
              ServiceName: service.serviceName!
            }
          })
        ]
      }),
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Response Time',
        width: 12,
        left: [
          new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/AppRunner',
            metricName: 'RequestLatency',
            dimensionsMap: {
              ServiceName: service.serviceName!
            }
          })
        ]
      }),
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Active Instances',
        width: 12,
        left: [
          new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/AppRunner',
            metricName: 'ActiveInstances',
            dimensionsMap: {
              ServiceName: service.serviceName!
            }
          })
        ]
      })
    );
  }
} 