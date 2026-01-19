'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Activity, AlertTriangle, CheckCircle2, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface EndpointHealth {
  id: string
  endpoint: string
  method: string
  is_healthy: boolean
  status_code: number | null
  response_time_ms: number | null
  error_message: string | null
  last_checked_at: string
  uptime_percentage: number
  avg_response_time: number
}

interface HealthStats {
  total_endpoints: number
  healthy_endpoints: number
  unhealthy_endpoints: number
  avg_uptime: number
  avg_response_time: number
}

export default function ApiHealthDashboard() {
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>([])
  const [stats, setStats] = useState<HealthStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchHealthData()
    const interval = setInterval(fetchHealthData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  async function fetchHealthData() {
    try {
      const response = await fetch('/api/health/endpoints')
      if (response.ok) {
        const data = await response.json()
        setEndpoints(data.endpoints || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  async function runHealthCheck(endpointId?: string) {
    setRefreshing(true)
    try {
      const url = endpointId 
        ? `/api/health/check?endpointId=${endpointId}`
        : '/api/health/check'
      
      const response = await fetch(url, { method: 'POST' })
      if (response.ok) {
        await fetchHealthData()
      }
    } catch (error) {
      console.error('Error running health check:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getStatusBadge = (isHealthy: boolean, statusCode: number | null) => {
    if (isHealthy) {
      return (
        <Badge variant="default" className="bg-green-500 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Healthy
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        {statusCode ? `Error ${statusCode}` : 'Down'}
      </Badge>
    )
  }

  const getResponseTimeColor = (ms: number | null) => {
    if (!ms) return 'text-gray-500'
    if (ms < 200) return 'text-green-600'
    if (ms < 500) return 'text-yellow-600'
    if (ms < 1000) return 'text-orange-600'
    return 'text-red-600'
  }

  const getResponseTimeIcon = (ms: number | null) => {
    if (!ms) return null
    if (ms < 500) return <TrendingUp className="h-4 w-4 text-green-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_endpoints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Healthy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.healthy_endpoints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total_endpoints > 0 
                  ? Math.round((stats.healthy_endpoints / stats.total_endpoints) * 100)
                  : 0}% operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unhealthy_endpoints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getResponseTimeColor(stats.avg_response_time)}`}>
                {Math.round(stats.avg_response_time)}ms
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.avg_uptime.toFixed(2)}% uptime
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">API Endpoints</h2>
          <p className="text-sm text-muted-foreground">
            Real-time health monitoring for all API endpoints
          </p>
        </div>
        <Button onClick={() => runHealthCheck()} disabled={refreshing}>
          {refreshing ? 'Checking...' : 'Run Health Check'}
        </Button>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No endpoints configured. Add endpoints to start monitoring.
            </CardContent>
          </Card>
        ) : (
          endpoints.map((endpoint) => (
            <Card key={endpoint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono">
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono">{endpoint.endpoint}</code>
                      {getStatusBadge(endpoint.is_healthy, endpoint.status_code)}
                    </div>
                    {endpoint.error_message && (
                      <p className="text-sm text-red-600 mt-2">
                        <AlertTriangle className="h-4 w-4 inline mr-1" />
                        {endpoint.error_message}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runHealthCheck(endpoint.id)}
                    disabled={refreshing}
                  >
                    Check Now
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Response Time</p>
                    <div className={`text-lg font-semibold flex items-center gap-2 ${getResponseTimeColor(endpoint.response_time_ms)}`}>
                      {endpoint.response_time_ms ? `${endpoint.response_time_ms}ms` : 'N/A'}
                      {getResponseTimeIcon(endpoint.response_time_ms)}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg Response</p>
                    <div className={`text-lg font-semibold ${getResponseTimeColor(endpoint.avg_response_time)}`}>
                      {Math.round(endpoint.avg_response_time)}ms
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">
                        {endpoint.uptime_percentage.toFixed(2)}%
                      </div>
                      <Progress value={endpoint.uptime_percentage} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Last Checked</p>
                    <div className="text-sm">
                      {new Date(endpoint.last_checked_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
