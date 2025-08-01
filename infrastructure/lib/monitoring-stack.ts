import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface MonitoringStackProps extends cdk.StackProps {
  environment: string;
  appRunnerServiceName: string;
  databaseClusterIdentifier: string;
  alertEmail?: string;
}

export class MonitoringStack extends cdk.Stack {
  public readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: MonitoringStackProps) {
    super(scope, id, props);

    // SNS Topic for alerts
    this.alertTopic = new sns.Topic(this, 'AlertTopic', {
      topicName: `crm-alerts-${props.environment}`,
      displayName: `CRM Alerts - ${props.environment}`,
    });

    // Email subscription for alerts (if provided)
    if (props.alertEmail) {
      this.alertTopic.addSubscription(
        new sns_subscriptions.EmailSubscription(props.alertEmail)
      );
    }

    // Create comprehensive dashboard
    this.createMainDashboard(props);

    // Create alarms
    this.createAppRunnerAlarms(props);
    this.createDatabaseAlarms(props);
    this.createCustomMetricAlarms(props);

    // Log retention policies
    this.setupLogRetention(props);
  }

  private createMainDashboard(props: MonitoringStackProps) {
    const dashboard = new cloudwatch.Dashboard(this, 'MainDashboard', {
      dashboardName: `CRM-${props.environment}-Overview`,
    });

    // App Runner Metrics
    const appRunnerRequestCountMetric = new cloudwatch.Metric({
      namespace: 'AWS/AppRunner',
      metricName: 'RequestCount',
      dimensionsMap: {
        ServiceName: props.appRunnerServiceName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    const appRunnerLatencyMetric = new cloudwatch.Metric({
      namespace: 'AWS/AppRunner',
      metricName: 'RequestLatency',
      dimensionsMap: {
        ServiceName: props.appRunnerServiceName,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const appRunnerErrorRateMetric = new cloudwatch.Metric({
      namespace: 'AWS/AppRunner',
      metricName: '4XXError',
      dimensionsMap: {
        ServiceName: props.appRunnerServiceName,
      },
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    });

    // Database Metrics
    const dbConnectionsMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'DatabaseConnections',
      dimensionsMap: {
        DBClusterIdentifier: props.databaseClusterIdentifier,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    const dbCpuMetric = new cloudwatch.Metric({
      namespace: 'AWS/RDS',
      metricName: 'CPUUtilization',
      dimensionsMap: {
        DBClusterIdentifier: props.databaseClusterIdentifier,
      },
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    });

    // Add widgets to dashboard
    dashboard.addWidgets(
      // First row - App Runner Overview
      new cloudwatch.GraphWidget({
        title: 'App Runner - Request Count',
        left: [appRunnerRequestCountMetric],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'App Runner - Response Time',
        left: [appRunnerLatencyMetric],
        width: 8,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'App Runner - Error Rate',
        left: [appRunnerErrorRateMetric],
        width: 8,
        height: 6,
      })
    );

    dashboard.addWidgets(
      // Second row - Database Overview
      new cloudwatch.GraphWidget({
        title: 'Database - Connections',
        left: [dbConnectionsMetric],
        width: 12,
        height: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Database - CPU Utilization',
        left: [dbCpuMetric],
        width: 12,
        height: 6,
      })
    );

    // Custom business metrics widget (placeholder)
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Business Metrics',
        left: [
          new cloudwatch.Metric({
            namespace: 'CRM/Business',
            metricName: 'ActiveUsers',
            statistic: 'Average',
            period: cdk.Duration.hours(1),
          }),
        ],
        width: 12,
        height: 6,
      })
    );
  }

  private createAppRunnerAlarms(props: MonitoringStackProps) {
    // High error rate alarm
    const errorRateAlarm = new cloudwatch.Alarm(this, 'HighErrorRateAlarm', {
      alarmName: `crm-high-error-rate-${props.environment}`,
      alarmDescription: 'High error rate detected in App Runner service',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/AppRunner',
        metricName: '4XXError',
        dimensionsMap: {
          ServiceName: props.appRunnerServiceName,
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 10,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // High latency alarm
    const latencyAlarm = new cloudwatch.Alarm(this, 'HighLatencyAlarm', {
      alarmName: `crm-high-latency-${props.environment}`,
      alarmDescription: 'High response time detected in App Runner service',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/AppRunner',
        metricName: 'RequestLatency',
        dimensionsMap: {
          ServiceName: props.appRunnerServiceName,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 5000, // 5 seconds
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    // Add SNS actions to alarms
    errorRateAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));
    latencyAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));
  }

  private createDatabaseAlarms(props: MonitoringStackProps) {
    // High CPU utilization alarm
    const dbCpuAlarm = new cloudwatch.Alarm(this, 'DatabaseHighCpuAlarm', {
      alarmName: `crm-db-high-cpu-${props.environment}`,
      alarmDescription: 'High CPU utilization on Aurora cluster',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'CPUUtilization',
        dimensionsMap: {
          DBClusterIdentifier: props.databaseClusterIdentifier,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    // High database connections alarm
    const dbConnectionsAlarm = new cloudwatch.Alarm(this, 'DatabaseHighConnectionsAlarm', {
      alarmName: `crm-db-high-connections-${props.environment}`,
      alarmDescription: 'High number of database connections',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'DatabaseConnections',
        dimensionsMap: {
          DBClusterIdentifier: props.databaseClusterIdentifier,
        },
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    });

    dbCpuAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));
    dbConnectionsAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));
  }

  private createCustomMetricAlarms(props: MonitoringStackProps) {
    // Example: Low active users alarm (you can customize based on your business metrics)
    const lowActiveUsersAlarm = new cloudwatch.Alarm(this, 'LowActiveUsersAlarm', {
      alarmName: `crm-low-active-users-${props.environment}`,
      alarmDescription: 'Unusually low number of active users',
      metric: new cloudwatch.Metric({
        namespace: 'CRM/Business',
        metricName: 'ActiveUsers',
        statistic: 'Average',
        period: cdk.Duration.hours(1),
      }),
      threshold: props.environment === 'production' ? 10 : 1,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    });

    lowActiveUsersAlarm.addAlarmAction(new cloudwatch_actions.SnsAction(this.alertTopic));
  }

  private setupLogRetention(props: MonitoringStackProps) {
    // App Runner logs retention
    new logs.LogGroup(this, 'AppRunnerLogGroup', {
      logGroupName: `/aws/apprunner/${props.appRunnerServiceName}`,
      retention: props.environment === 'production' 
        ? logs.RetentionDays.ONE_MONTH 
        : logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Custom application logs
    new logs.LogGroup(this, 'ApplicationLogGroup', {
      logGroupName: `/crm/${props.environment}/application`,
      retention: props.environment === 'production' 
        ? logs.RetentionDays.TWO_WEEKS 
        : logs.RetentionDays.THREE_DAYS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Error logs
    new logs.LogGroup(this, 'ErrorLogGroup', {
      logGroupName: `/crm/${props.environment}/errors`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
} 