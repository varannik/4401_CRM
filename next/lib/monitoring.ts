import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

class MonitoringService {
  private cloudWatch: CloudWatchClient | null = null;
  private environment: string;
  private namespace: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.namespace = 'CRM/Business';
    
    // Only initialize CloudWatch in production/staging
    if (this.environment !== 'development') {
      this.cloudWatch = new CloudWatchClient({
        region: process.env.AWS_REGION || 'us-east-1',
      });
    }
  }

  async trackUserLogin(userId: string) {
    await this.putMetric('UserLogin', 1, 'Count', [
      { Name: 'Environment', Value: this.environment }
    ]);
  }

  async trackActiveUsers(count: number) {
    await this.putMetric('ActiveUsers', count, 'Count', [
      { Name: 'Environment', Value: this.environment }
    ]);
  }

  async trackPageView(page: string, userId?: string) {
    const dimensions = [
      { Name: 'Page', Value: page },
      { Name: 'Environment', Value: this.environment }
    ];

    if (userId) {
      dimensions.push({ Name: 'UserId', Value: userId });
    }

    await this.putMetric('PageView', 1, 'Count', dimensions);
  }

  async trackApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    const dimensions = [
      { Name: 'Endpoint', Value: endpoint },
      { Name: 'Method', Value: method },
      { Name: 'StatusCode', Value: statusCode.toString() },
      { Name: 'Environment', Value: this.environment }
    ];

    await Promise.all([
      this.putMetric('ApiCall', 1, 'Count', dimensions),
      this.putMetric('ApiDuration', duration, 'Milliseconds', dimensions)
    ]);
  }

  async trackDatabaseQuery(operation: string, duration: number, success: boolean) {
    const dimensions = [
      { Name: 'Operation', Value: operation },
      { Name: 'Success', Value: success.toString() },
      { Name: 'Environment', Value: this.environment }
    ];

    await Promise.all([
      this.putMetric('DatabaseQuery', 1, 'Count', dimensions),
      this.putMetric('DatabaseQueryDuration', duration, 'Milliseconds', dimensions)
    ]);
  }

  async trackBusinessEvent(eventName: string, value: number = 1, metadata?: Record<string, string>) {
    const dimensions = [
      { Name: 'Event', Value: eventName },
      { Name: 'Environment', Value: this.environment }
    ];

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        dimensions.push({ Name: key, Value: value });
      });
    }

    await this.putMetric('BusinessEvent', value, 'Count', dimensions);
  }

  private async putMetric(
    metricName: string,
    value: number,
    unit: string,
    dimensions: Array<{ Name: string; Value: string }> = []
  ) {
    try {
      // Skip CloudWatch in development
      if (this.environment === 'development') {
        console.log(`[METRIC] ${metricName}: ${value} ${unit}`, dimensions);
        return;
      }

      const command = new PutMetricDataCommand({
        Namespace: this.namespace,
        MetricData: [
          {
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
            Dimensions: dimensions,
          },
        ],
      });

      await this.cloudWatch.send(command);
    } catch (error) {
      console.error('Failed to send metric to CloudWatch:', error);
      // Don't throw - monitoring failures shouldn't break the app
    }
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

// Middleware for Next.js API routes
export function withMonitoring(handler: any) {
  return async (req: any, res: any) => {
    const startTime = Date.now();
    const endpoint = req.url;
    const method = req.method;

    try {
      const result = await handler(req, res);
      const duration = Date.now() - startTime;
      
      await monitoring.trackApiCall(endpoint, method, res.statusCode || 200, duration);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      await monitoring.trackApiCall(endpoint, method, 500, duration);
      throw error;
    }
  };
}

// Database monitoring wrapper
export function withDatabaseMonitoring<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      await monitoring.trackDatabaseQuery(operation, duration, true);
      resolve(result);
    } catch (error) {
      const duration = Date.now() - startTime;
      await monitoring.trackDatabaseQuery(operation, duration, false);
      reject(error);
    }
  });
} 