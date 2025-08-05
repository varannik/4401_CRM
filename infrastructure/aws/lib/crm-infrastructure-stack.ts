import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface CrmInfrastructureStackProps extends cdk.StackProps {
  minCapacity: number;
  maxCapacity: number;
  environment: string;
}

export class CrmInfrastructureStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly database: rds.DatabaseCluster;
  public readonly databaseSecret: secretsmanager.Secret;
  public readonly appRunnerSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props: CrmInfrastructureStackProps) {
    super(scope, id, props);

    // Create VPC with public and private subnets across 2 AZs
    this.vpc = new ec2.Vpc(this, 'CrmVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      natGateways: 1, // Cost optimization: one NAT gateway
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          cidrMask: 24,
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // VPC Flow Logs for security monitoring
    new ec2.FlowLog(this, 'VpcFlowLog', {
      resourceType: ec2.FlowLogResourceType.fromVpc(this.vpc),
      destination: ec2.FlowLogDestination.toCloudWatchLogs(
        new logs.LogGroup(this, 'VpcFlowLogGroup', {
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: cdk.RemovalPolicy.DESTROY
        })
      )
    });

    // Database credentials secret
    this.databaseSecret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      description: `Database credentials for CRM ${props.environment}`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'crmadmin' }),
        generateStringKey: 'password',
        excludeCharacters: '"@/\\\'',
        passwordLength: 32,
      },
    });

    // Security group for Aurora Serverless v2
    const databaseSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for Aurora Serverless v2',
      allowAllOutbound: false,
    });

    // Security group for App Runner VPC connector
    const appRunnerSecurityGroup = new ec2.SecurityGroup(this, 'AppRunnerSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for App Runner VPC connector',
      allowAllOutbound: true,
    });

    // Allow connections from App Runner to database
    databaseSecurityGroup.addIngressRule(
      appRunnerSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL connections from App Runner'
    );

    // Aurora Serverless v2 cluster
    this.database = new rds.DatabaseCluster(this, 'CrmDatabase', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_15_3,
      }),
      credentials: rds.Credentials.fromSecret(this.databaseSecret),
      clusterIdentifier: `crm-db-${props.environment}`,
      defaultDatabaseName: 'crmdb',
      writer: rds.ClusterInstance.serverlessV2('writer', {
        scaleWithWriter: true,
      }),
      readers: props.environment === 'production' ? [
        rds.ClusterInstance.serverlessV2('reader1', { scaleWithWriter: true })
      ] : [],
      serverlessV2MinCapacity: props.environment === 'staging' ? 0.5 : 0.5,
      serverlessV2MaxCapacity: props.environment === 'production' ? 16 : 1,
      vpc: this.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [databaseSecurityGroup],
      backup: {
        retention: props.environment === 'production' 
          ? cdk.Duration.days(30) 
          : cdk.Duration.days(7),
      },
      deletionProtection: props.environment === 'production',
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        'ParameterGroup',
        'default.aurora-postgresql15'
      ),
      cloudwatchLogsExports: ['postgresql'],
      removalPolicy: props.environment === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
    });

    // Create VPC Endpoint for Secrets Manager (cost optimization)
    new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
      vpc: this.vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      privateDnsEnabled: true,
    });

    // CloudWatch dashboard for monitoring
    const dashboard = new cdk.aws_cloudwatch.Dashboard(this, 'CrmDashboard', {
      dashboardName: `CRM-${props.environment}-Infrastructure`
    });

    // Add database metrics to dashboard
    dashboard.addWidgets(
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Database Connections',
        left: [
          new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/RDS',
            metricName: 'DatabaseConnections',
            dimensionsMap: {
              DBClusterIdentifier: this.database.clusterIdentifier,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(5),
          })
        ],
        width: 12,
      }),
      new cdk.aws_cloudwatch.GraphWidget({
        title: 'Database CPU Utilization',
        left: [
          new cdk.aws_cloudwatch.Metric({
            namespace: 'AWS/RDS',
            metricName: 'CPUUtilization',
            dimensionsMap: {
              DBClusterIdentifier: this.database.clusterIdentifier,
            },
            statistic: 'Average',
            period: cdk.Duration.minutes(5),
          })
        ],
        width: 12,
      })
    );

    // SSM Parameters for other stacks to reference
    new cdk.aws_ssm.StringParameter(this, 'VpcIdParameter', {
      parameterName: `/crm/${props.environment}/vpc-id`,
      stringValue: this.vpc.vpcId,
      description: 'VPC ID for CRM application'
    });

    new cdk.aws_ssm.StringParameter(this, 'DatabaseEndpointParameter', {
      parameterName: `/crm/${props.environment}/database-endpoint`,
      stringValue: this.database.clusterEndpoint.hostname,
      description: 'Database cluster endpoint'
    });

    // Export the App Runner security group
    this.appRunnerSecurityGroup = appRunnerSecurityGroup;

    // Tags
    cdk.Tags.of(this).add('Component', 'Infrastructure');
  }
} 