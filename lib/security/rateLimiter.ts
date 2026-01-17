import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface RateLimitConfig {
  endpoint: string
  maxRequests: number
  windowMinutes: number
}

/**
 * Rate Limiter - Prevents API abuse and cost spikes
 * 
 * Critical for preventing "infinite loop" scenarios where 6 agents
 * could trigger 50+ API calls per test. Uses Supabase for distributed
 * rate limiting across Vercel edge functions.
 */
export class RateLimiter {
  private static defaultLimits: Record<string, RateLimitConfig> = {
    '/api/test-requests/execute': {
      endpoint: '/api/test-requests/execute',
      maxRequests: 10,
      windowMinutes: 60
    },
    '/api/test/execute': {
      endpoint: '/api/test/execute',
      maxRequests: 20,
      windowMinutes: 60
    },
    '/api/personas/generate-image': {
      endpoint: '/api/personas/generate-image',
      maxRequests: 5,
      windowMinutes: 60
    }
  }

  /**
   * Checks if user/company is within rate limit
   */
  static async checkRateLimit(
    userId: string,
    endpoint: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    try {
      const supabase = getSupabaseAdmin()
      const windowStart = new Date()
      const windowEnd = new Date(windowStart.getTime() + config.windowMinutes * 60000)

      const { data: existing } = await supabase
        .from('api_rate_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .gte('window_end', new Date().toISOString())
        .single()

      if (existing) {
        // Check if over limit
        if (existing.request_count >= config.maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetAt: new Date(existing.window_end)
          }
        }

        // Increment count
        await supabase
          .from('api_rate_limits')
          .update({
            request_count: existing.request_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)

        return {
          allowed: true,
          remaining: config.maxRequests - existing.request_count - 1,
          resetAt: new Date(existing.window_end)
        }
      } else {
        // Create new window
        await supabase
          .from('api_rate_limits')
          .insert({
            user_id: userId,
            endpoint,
            request_count: 1,
            window_start: windowStart.toISOString(),
            window_end: windowEnd.toISOString()
          })

        return {
          allowed: true,
          remaining: config.maxRequests - 1,
          resetAt: windowEnd
        }
      }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      // Fail open (allow request) to prevent blocking legitimate traffic
      return {
        allowed: true,
        remaining: 0,
        resetAt: new Date()
      }
    }
  }

  /**
   * Middleware for Next.js API routes
   */
  static async middleware(
    userId: string,
    companyId: string | null,
    endpoint: string
  ): Promise<Response | null> {
    const config = this.defaultLimits[endpoint] || {
      endpoint,
      maxRequests: 100,
      windowMinutes: 60
    }
    const result = await this.checkRateLimit(userId, endpoint, config)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetAt: result.resetAt.toISOString()
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': this.defaultLimits[endpoint]?.maxRequests.toString() || '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.resetAt.toISOString()
          }
        }
      )
    }

    return null // Allow request
  }

  /**
   * Cleans up expired rate limit records
   * Should be run periodically (e.g., via cron job)
   */
  static async cleanup(): Promise<number> {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('api_rate_limits')
      .delete()
      .lt('window_end', new Date().toISOString()) as { data: any; error: any }

    if (error) {
      console.error('Rate limit cleanup failed:', error)
      return 0
    }

    return data?.length || 0
  }
}
