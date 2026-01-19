import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: endpointConfigs, error: configError } = await supabase
      .from('api_endpoint_configs')
      .select('*')
      .eq('is_active', true)
      .order('endpoint')

    if (configError) {
      console.error('Error fetching endpoint configs:', configError)
      return NextResponse.json(
        { error: 'Failed to fetch endpoint configurations' },
        { status: 500 }
      )
    }

    const endpointHealthData = await Promise.all(
      (endpointConfigs || []).map(async (config) => {
        const { data: latestMetric } = await supabase
          .from('api_health_metrics')
          .select('*')
          .eq('endpoint', config.endpoint)
          .eq('method', config.method)
          .order('measured_at', { ascending: false })
          .limit(1)
          .single()

        const { data: uptimeData } = await supabase
          .from('api_uptime_summary')
          .select('uptime_percentage, avg_response_time_ms')
          .eq('endpoint', config.endpoint)
          .eq('method', config.method)
          .eq('period_type', 'day')
          .order('period_start', { ascending: false })
          .limit(1)
          .single()

        return {
          id: config.id,
          endpoint: config.endpoint,
          method: config.method,
          is_healthy: latestMetric?.is_healthy ?? true,
          status_code: latestMetric?.status_code ?? null,
          response_time_ms: latestMetric?.response_time_ms ?? null,
          error_message: latestMetric?.error_message ?? null,
          last_checked_at: latestMetric?.measured_at ?? new Date().toISOString(),
          uptime_percentage: uptimeData?.uptime_percentage ?? 100,
          avg_response_time: uptimeData?.avg_response_time_ms ?? 0
        }
      })
    )

    const stats = {
      total_endpoints: endpointHealthData.length,
      healthy_endpoints: endpointHealthData.filter(e => e.is_healthy).length,
      unhealthy_endpoints: endpointHealthData.filter(e => !e.is_healthy).length,
      avg_uptime: endpointHealthData.length > 0
        ? endpointHealthData.reduce((sum, e) => sum + e.uptime_percentage, 0) / endpointHealthData.length
        : 100,
      avg_response_time: endpointHealthData.length > 0
        ? endpointHealthData.reduce((sum, e) => sum + e.avg_response_time, 0) / endpointHealthData.length
        : 0
    }

    return NextResponse.json({
      endpoints: endpointHealthData,
      stats
    })
  } catch (error) {
    console.error('Error in health endpoints API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
