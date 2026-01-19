import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const endpointId = searchParams.get('endpointId')

    let endpointConfigs
    if (endpointId) {
      const { data, error } = await supabase
        .from('api_endpoint_configs')
        .select('*')
        .eq('id', endpointId)
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        return NextResponse.json(
          { error: 'Endpoint not found' },
          { status: 404 }
        )
      }
      endpointConfigs = [data]
    } else {
      const { data, error } = await supabase
        .from('api_endpoint_configs')
        .select('*')
        .eq('is_active', true)
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch endpoints' },
          { status: 500 }
        )
      }
      endpointConfigs = data || []
    }

    const results = await Promise.all(
      endpointConfigs.map(async (config) => {
        const startTime = Date.now()
        let isHealthy = false
        let statusCode = null
        let errorMessage = null
        let responseTimeMs = null

        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
          const fullUrl = `${baseUrl}${config.endpoint}`
          
          const response = await fetch(fullUrl, {
            method: config.method,
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(config.timeout_ms || 5000)
          })

          responseTimeMs = Date.now() - startTime
          statusCode = response.status
          isHealthy = response.ok

          if (!response.ok) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
        } catch (error) {
          responseTimeMs = Date.now() - startTime
          isHealthy = false
          
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              errorMessage = 'Request timeout'
            } else {
              errorMessage = error.message
            }
          } else {
            errorMessage = 'Unknown error occurred'
          }
        }

        const { error: insertError } = await supabase
          .from('api_health_metrics')
          .insert({
            endpoint: config.endpoint,
            method: config.method,
            is_healthy: isHealthy,
            status_code: statusCode,
            response_time_ms: responseTimeMs,
            error_message: errorMessage,
            measured_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting health metric:', insertError)
        }

        if (!isHealthy && config.alert_on_failure) {
          await createIncident(supabase, config, errorMessage)
        }

        return {
          endpoint: config.endpoint,
          method: config.method,
          isHealthy,
          statusCode,
          responseTimeMs,
          errorMessage
        }
      })
    )

    return NextResponse.json({
      success: true,
      results,
      checked_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error in health check API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function createIncident(supabase: any, config: any, errorMessage: string | null) {
  try {
    const { data: existingIncident } = await supabase
      .from('api_incidents')
      .select('id')
      .eq('endpoint', config.endpoint)
      .eq('method', config.method)
      .in('status', ['investigating', 'identified', 'monitoring'])
      .single()

    if (!existingIncident) {
      await supabase
        .from('api_incidents')
        .insert({
          endpoint: config.endpoint,
          method: config.method,
          title: `${config.method} ${config.endpoint} is down`,
          description: errorMessage || 'Endpoint health check failed',
          severity: 'high',
          status: 'investigating',
          started_at: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Error creating incident:', error)
  }
}
