import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testExchangeConnection, debugExchangeConnection } from '@/lib/microsoft-graph';
import { detectExchangeEnvironment, getExchangeOptimizationTips } from '@/lib/exchange-optimization';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    console.log('🔍 Running Exchange connectivity test...');
    
    // Check if debug mode is requested
    const url = new URL(request.url);
    const debug = url.searchParams.get('debug') === 'true';
    const quick = url.searchParams.get('quick') === 'true';
    const diagnostic = url.searchParams.get('diagnostic') === 'true';
    
    // New diagnostic mode with step-by-step logging
    if (diagnostic) {
      console.log('🩺 Running comprehensive diagnostic...');
      const diagnosticResults = {
        success: false,
        diagnostic: true,
        steps: [] as Array<{ step: string; success: boolean; duration: number; error?: string; details?: any }>,
        timestamp: new Date().toISOString()
      };
      
      const overallStart = Date.now();
      
      // Step 1: Session validation
      const step1Start = Date.now();
      try {
        console.log('Step 1: Validating session...');
        if (!session?.accessToken) {
          throw new Error('No access token in session');
        }
        diagnosticResults.steps.push({
          step: 'Session Validation',
          success: true,
          duration: Date.now() - step1Start,
          details: { hasToken: !!session.accessToken, userId: session.user?.id }
        });
      } catch (error) {
        diagnosticResults.steps.push({
          step: 'Session Validation',
          success: false,
          duration: Date.now() - step1Start,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(diagnosticResults);
      }
      
      // Step 2: Graph client creation
      const step2Start = Date.now();
      let graphClient;
      try {
        console.log('Step 2: Creating Graph client...');
        const { createGraphClient } = await import('@/lib/microsoft-graph');
        graphClient = await createGraphClient();
        diagnosticResults.steps.push({
          step: 'Graph Client Creation',
          success: true,
          duration: Date.now() - step2Start
        });
      } catch (error) {
        diagnosticResults.steps.push({
          step: 'Graph Client Creation',
          success: false,
          duration: Date.now() - step2Start,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return NextResponse.json(diagnosticResults);
      }
      
      // Step 3: Basic profile test
      const step3Start = Date.now();
      try {
        console.log('Step 3: Testing basic profile access...');
        const profilePromise = graphClient.api('/me').select('id,displayName,mail').get();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Profile test timeout (15s)')), 15000)
        );
        const profile = await Promise.race([profilePromise, timeoutPromise]);
        diagnosticResults.steps.push({
          step: 'Basic Profile Access',
          success: true,
          duration: Date.now() - step3Start,
          details: { email: profile.mail, name: profile.displayName }
        });
      } catch (error) {
        diagnosticResults.steps.push({
          step: 'Basic Profile Access',
          success: false,
          duration: Date.now() - step3Start,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Step 4: Email access test  
      const step4Start = Date.now();
      try {
        console.log('Step 4: Testing email access...');
        const emailPromise = graphClient.api('/me/messages').select('id').top(1).get();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Email test timeout (15s)')), 15000)
        );
        const emails = await Promise.race([emailPromise, timeoutPromise]);
        diagnosticResults.steps.push({
          step: 'Email Access Test',
          success: true,
          duration: Date.now() - step4Start,
          details: { emailCount: emails.value?.length || 0 }
        });
      } catch (error) {
        diagnosticResults.steps.push({
          step: 'Email Access Test',
          success: false,
          duration: Date.now() - step4Start,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      diagnosticResults.success = diagnosticResults.steps.every(step => step.success);
      console.log(`🩺 Diagnostic completed in ${Date.now() - overallStart}ms`);
      
      return NextResponse.json(diagnosticResults);
    }
    
    if (quick) {
      // Quick diagnostic test - just test basic connectivity
      console.log('⚡ Running quick diagnostic test...');
      const startTime = Date.now();
      
      try {
        const { createGraphClient } = await import('@/lib/microsoft-graph');
        const clientStart = Date.now();
        const graphClient = await createGraphClient();
        const clientDuration = Date.now() - clientStart;
        
        // Test minimal API call first
        const apiStart = Date.now();
        const meCall = graphClient.api('/me').select('id,displayName').get();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Quick test timeout (10s)')), 10000)
        );
        
        const result = await Promise.race([meCall, timeoutPromise]);
        const apiDuration = Date.now() - apiStart;
        const totalDuration = Date.now() - startTime;
        
        return NextResponse.json({
          quick: true,
          success: true,
          timings: {
            clientCreation: `${clientDuration}ms`,
            apiCall: `${apiDuration}ms`,
            total: `${totalDuration}ms`
          },
          performance: {
            status: apiDuration < 3000 ? 'excellent' : apiDuration < 8000 ? 'good' : 'slow',
            recommendation: apiDuration > 8000 ? 'Microsoft Graph API is responding slowly. Try again in a few minutes.' : 'API performance is normal'
          },
          result: {
            id: result.id,
            name: result.displayName
          },
          timestamp: new Date().toISOString()
        });
        
      } catch (error) {
        return NextResponse.json({
          quick: true,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: `${Date.now() - startTime}ms`,
          recommendation: 'Microsoft Graph API connection failed. Check network connectivity and Azure AD configuration.',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    if (debug) {
      console.log('🔧 Running debug mode...');
      const debugResults = await debugExchangeConnection();
      
      return NextResponse.json({
        debug: true,
        success: debugResults.success,
        totalDuration: debugResults.totalDuration,
        steps: debugResults.steps,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Regular test
    const connectionTest = await testExchangeConnection();
    
    // Get Exchange environment info
    const environment = detectExchangeEnvironment();
    
    // Get optimization tips
    const optimizationTips = getExchangeOptimizationTips();
    
    return NextResponse.json({
      success: connectionTest.success,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      },
      exchange: {
        connectivity: connectionTest,
        environment,
        optimizationTips,
        configuredScopes: session.scope?.split(' ') || [],
        recommendations: environment.recommendations
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Exchange test API error:', error);
    return NextResponse.json(
      { 
        error: 'Exchange connectivity test failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { testType = 'full' } = body;
    
    console.log(`🧪 Running ${testType} Exchange test...`);
    
    let testResults: any = {
      testType,
      timestamp: new Date().toISOString(),
      success: false
    };
    
    if (testType === 'connectivity' || testType === 'full') {
      const connectionTest = await testExchangeConnection();
      testResults.connectivity = connectionTest;
      testResults.success = connectionTest.success;
    }
    
    if (testType === 'performance' || testType === 'full') {
      // Test performance by making sample API calls
      try {
        const startTime = Date.now();
        
        // Small batch test
        const { fetchEmailMetadata } = await import('@/lib/microsoft-graph');
        await fetchEmailMetadata({ top: 5, daysBack: 7 });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        testResults.performance = {
          responseTime,
          status: responseTime < 3000 ? 'excellent' : responseTime < 5000 ? 'good' : 'slow',
          message: `API response time: ${responseTime}ms`
        };
        
      } catch (error) {
        testResults.performance = {
          responseTime: null,
          status: 'failed',
          message: `Performance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
    
    return NextResponse.json(testResults);
    
  } catch (error: any) {
    console.error('❌ Exchange test POST error:', error);
    return NextResponse.json(
      { 
        error: 'Exchange test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 