# API Health Monitoring Dashboard

## Overview
Real-time monitoring system for API endpoint health, performance metrics, uptime tracking, and incident management.

## Components Created

### **ApiHealthDashboard** (`components/admin/ApiHealthDashboard.tsx`)
**Purpose:** Admin dashboard for monitoring all API endpoints

**Features:**
- Real-time health status for all endpoints
- Statistics overview (total, healthy, unhealthy, avg response time)
- Visual health indicators with color-coded badges
- Response time tracking with trend indicators
- Uptime percentage with progress bars
- Manual health check triggers (individual or all)
- Auto-refresh every 30 seconds
- Error message display for failed endpoints

**Health Status Indicators:**
- ✅ **Healthy** (Green) - Endpoint responding normally
- ❌ **Down/Error** (Red) - Endpoint not responding or error status

**Response Time Color Coding:**
- **< 200ms** - Green (Excellent)
- **200-500ms** - Yellow (Good)
- **500-1000ms** - Orange (Slow)
- **> 1000ms** - Red (Very Slow)

**Usage:**
```tsx
import ApiHealthDashboard from '@/components/admin/ApiHealthDashboard'

<ApiHealthDashboard />
```

---

## Pages

### **API Health Admin Page** (`app/admin/api-health/page.tsx`)
**Route:** `/admin/api-health`

**Features:**
- Server-side authentication check
- Displays ApiHealthDashboard component
- Admin-only access

**Access:** Requires authenticated admin user

---

## API Endpoints

### **GET /api/health/endpoints**
**Purpose:** Fetch health status for all active endpoints

**Response:**
```json
{
  "endpoints": [
    {
      "id": "uuid",
      "endpoint": "/api/test/run",
      "method": "POST",
      "is_healthy": true,
      "status_code": 200,
      "response_time_ms": 145,
      "error_message": null,
      "last_checked_at": "2026-01-19T08:00:00Z",
      "uptime_percentage": 99.8,
      "avg_response_time": 150
    }
  ],
  "stats": {
    "total_endpoints": 10,
    "healthy_endpoints": 9,
    "unhealthy_endpoints": 1,
    "avg_uptime": 99.5,
    "avg_response_time": 200
  }
}
```

**Data Sources:**
- `api_endpoint_configs` - Active endpoint configurations
- `api_health_metrics` - Latest health check results
- `api_uptime_summary` - Uptime statistics

---

### **POST /api/health/check**
**Purpose:** Run health checks on endpoints

**Query Parameters:**
- `endpointId` (optional) - Check specific endpoint, or all if omitted

**Request:**
```bash
# Check all endpoints
POST /api/health/check

# Check specific endpoint
POST /api/health/check?endpointId=uuid
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "endpoint": "/api/test/run",
      "method": "POST",
      "isHealthy": true,
      "statusCode": 200,
      "responseTimeMs": 145,
      "errorMessage": null
    }
  ],
  "checked_at": "2026-01-19T08:00:00Z"
}
```

**Health Check Process:**
1. Fetches endpoint configuration(s)
2. Makes HTTP request to each endpoint
3. Measures response time
4. Records status code and health status
5. Saves metrics to `api_health_metrics` table
6. Creates incident if endpoint fails and alerts enabled
7. Returns results

**Timeout:** Configurable per endpoint (default 5000ms)

**Error Handling:**
- Network errors
- Timeout errors
- HTTP error status codes
- Unknown errors

---

## Database Tables Used

### `api_endpoint_configs`
**Purpose:** Configuration for monitored endpoints

**Key Fields:**
- `endpoint` - API path (e.g., "/api/test/run")
- `method` - HTTP method (GET, POST, etc.)
- `is_active` - Whether to monitor this endpoint
- `timeout_ms` - Request timeout in milliseconds
- `alert_on_failure` - Create incident on failure

### `api_health_metrics`
**Purpose:** Individual health check results

**Key Fields:**
- `endpoint` - API path
- `method` - HTTP method
- `is_healthy` - Boolean health status
- `status_code` - HTTP status code
- `response_time_ms` - Response time in milliseconds
- `error_message` - Error description if failed
- `measured_at` - Timestamp of check

### `api_uptime_summary`
**Purpose:** Aggregated uptime statistics

**Key Fields:**
- `endpoint` - API path
- `method` - HTTP method
- `period_type` - 'hour', 'day', 'week', 'month'
- `uptime_percentage` - Percentage uptime for period
- `avg_response_time_ms` - Average response time
- `total_requests` - Number of checks
- `successful_requests` - Number of successful checks

### `api_incidents`
**Purpose:** Track API outages and issues

**Key Fields:**
- `endpoint` - Affected endpoint
- `method` - HTTP method
- `title` - Incident title
- `description` - Incident details
- `severity` - 'low', 'medium', 'high', 'critical'
- `status` - 'investigating', 'identified', 'monitoring', 'resolved'
- `started_at` - When incident began
- `resolved_at` - When incident was resolved

---

## Features

### **Real-Time Monitoring**
- Auto-refresh every 30 seconds
- Manual refresh on demand
- Individual endpoint checks
- Bulk health checks

### **Performance Metrics**
- Response time tracking
- Average response time calculation
- Trend indicators (improving/degrading)
- Color-coded performance levels

### **Uptime Tracking**
- Percentage uptime calculation
- Visual progress bars
- Historical uptime data
- Period-based summaries (hour/day/week/month)

### **Incident Management**
- Automatic incident creation on failure
- Prevents duplicate incidents
- Severity levels
- Status tracking
- Resolution timestamps

### **Visual Indicators**
- Health status badges
- Response time colors
- Trend icons
- Progress bars for uptime
- Error message display

---

## Configuration

### **Adding Monitored Endpoints**

Insert into `api_endpoint_configs`:
```sql
INSERT INTO api_endpoint_configs (
  endpoint,
  method,
  is_active,
  timeout_ms,
  alert_on_failure,
  expected_status_code
) VALUES (
  '/api/test/run',
  'POST',
  true,
  5000,
  true,
  200
);
```

### **Environment Variables**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## Automated Health Checks

### **Setup Cron Job**
For production, set up automated health checks:

```bash
# Every 5 minutes
*/5 * * * * curl -X POST https://your-domain.com/api/health/check
```

Or use Vercel Cron Jobs:
```json
{
  "crons": [
    {
      "path": "/api/health/check",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Monitoring Workflow

### **Admin Daily Workflow:**
1. Visit `/admin/api-health`
2. Review stats dashboard
3. Check for unhealthy endpoints
4. Investigate error messages
5. Run manual health checks if needed
6. Review incidents
7. Monitor response time trends

### **Incident Response:**
1. Dashboard shows unhealthy endpoint
2. Review error message
3. Check incident details
4. Investigate root cause
5. Fix issue
6. Verify health check passes
7. Mark incident as resolved

---

## Statistics Calculations

### **Uptime Percentage**
```
uptime_percentage = (successful_checks / total_checks) * 100
```

### **Average Response Time**
```
avg_response_time = sum(response_times) / count(checks)
```

### **Health Status**
- Endpoint is healthy if: `status_code >= 200 AND status_code < 300`
- Endpoint is unhealthy if: Error occurred OR status_code outside 2xx range

---

## Future Enhancements

1. **Alert Notifications**
   - Email alerts on endpoint failure
   - Slack/Discord webhooks
   - SMS notifications for critical issues

2. **Historical Charts**
   - Response time graphs
   - Uptime trends over time
   - Incident frequency charts

3. **SLA Tracking**
   - Define SLA targets
   - Track compliance
   - Generate SLA reports

4. **Public Status Page**
   - Customer-facing status page
   - Subscribe to updates
   - Incident history

5. **Advanced Metrics**
   - Error rate tracking
   - Request volume monitoring
   - Geographic response times

6. **Automated Recovery**
   - Auto-restart on failure
   - Failover to backup endpoints
   - Circuit breaker patterns

7. **Custom Health Checks**
   - Database connectivity checks
   - External service dependencies
   - Custom validation logic

8. **Maintenance Windows**
   - Schedule maintenance periods
   - Suppress alerts during maintenance
   - Notify subscribers

---

## Testing Checklist

- [ ] Dashboard loads correctly
- [ ] Stats display accurate data
- [ ] Health checks execute successfully
- [ ] Response times are measured
- [ ] Error messages display properly
- [ ] Manual refresh works
- [ ] Auto-refresh works (30s interval)
- [ ] Individual endpoint checks work
- [ ] Bulk health checks work
- [ ] Incidents are created on failure
- [ ] Uptime percentages calculate correctly
- [ ] Color coding is accurate
- [ ] Mobile responsive design

---

## Status
✅ **Complete** - Core monitoring dashboard ready for deployment

## Next Steps
1. Deploy to production
2. Configure monitored endpoints
3. Set up automated health checks (cron)
4. Add admin navigation link
5. Configure alert notifications
6. Build public status page
