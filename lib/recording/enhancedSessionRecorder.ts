import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface RecordingConfig {
  sessionId: string
  testerId: string
  testRequestId?: string
  enableScreenRecording: boolean
  enableCursorTracking: boolean
  enableEyeTracking: boolean
  enablePerformanceTracking: boolean
}

/**
 * EnhancedSessionRecorder - Comprehensive interaction tracking
 * 
 * Tracks:
 * - Scrolls (depth, velocity, direction)
 * - Clicks (rage detection, timing, targets)
 * - Loading times (page load, FCP, LCP)
 * - Time on pages
 * - Form interactions
 * - Page performance metrics
 */
export class EnhancedSessionRecorder {
  private config: RecordingConfig
  private isRecording: boolean = false
  
  // Page tracking
  private currentPageUrl: string = ''
  private pageEnteredAt: Date | null = null
  private pagePerformanceObserver: PerformanceObserver | null = null
  
  // Scroll tracking
  private lastScrollPosition = { x: 0, y: 0 }
  private lastScrollTime: number = 0
  
  // Click tracking
  private lastClickTime: number = 0
  private clickHistory: Array<{ x: number; y: number; time: number }> = []
  
  // Cleanup functions
  private cleanupFunctions: Array<() => void> = []

  constructor(config: RecordingConfig) {
    this.config = config
    this.currentPageUrl = window.location.href
  }

  /**
   * Starts comprehensive recording
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) return

    try {
      // Track page entry
      this.pageEnteredAt = new Date()
      await this.trackPageEntry()

      // Start performance tracking
      if (this.config.enablePerformanceTracking) {
        this.startPerformanceTracking()
      }

      // Start scroll tracking
      this.startScrollTracking()

      // Start click tracking
      this.startClickTracking()

      // Start form tracking
      this.startFormTracking()

      // Track page visibility
      this.startVisibilityTracking()

      // Track page navigation
      this.startNavigationTracking()

      this.isRecording = true
      console.log('Enhanced session recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  /**
   * Stops recording and saves all data
   */
  async stopRecording(): Promise<void> {
    if (!this.isRecording) return

    try {
      // Track page exit
      await this.trackPageExit()

      // Calculate session metrics
      await this.calculateSessionMetrics()

      // Cleanup all listeners
      this.cleanupFunctions.forEach(cleanup => cleanup())
      this.cleanupFunctions = []

      this.isRecording = false
      console.log('Enhanced session recording stopped')
    } catch (error) {
      console.error('Failed to stop recording:', error)
      throw error
    }
  }

  /**
   * Tracks page entry with performance metrics
   */
  private async trackPageEntry(): Promise<void> {
    const pageUrl = window.location.href
    const pageTitle = document.title

    // Get performance metrics
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

    if (perfData) {
      const supabase = getSupabaseAdmin()
      await supabase.from('page_performance').insert({
        session_id: this.config.sessionId,
        page_url: pageUrl,
        page_title: pageTitle,
        dns_lookup_time: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
        tcp_connection_time: Math.round(perfData.connectEnd - perfData.connectStart),
        request_time: Math.round(perfData.responseStart - perfData.requestStart),
        response_time: Math.round(perfData.responseEnd - perfData.responseStart),
        dom_processing_time: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        dom_content_loaded_time: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
        page_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
        page_entered_at: this.pageEnteredAt!.toISOString()
      })
    }
  }

  /**
   * Tracks page exit and time on page
   */
  private async trackPageExit(): Promise<void> {
    if (!this.pageEnteredAt) return

    const pageExitedAt = new Date()
    const timeOnPageSeconds = Math.round((pageExitedAt.getTime() - this.pageEnteredAt.getTime()) / 1000)

    const supabase = getSupabaseAdmin()
    await supabase
      .from('page_performance')
      .update({
        page_exited_at: pageExitedAt.toISOString(),
        time_on_page_seconds: timeOnPageSeconds
      })
      .eq('session_id', this.config.sessionId)
      .eq('page_url', this.currentPageUrl)
      .is('page_exited_at', null)
  }

  /**
   * Starts performance tracking (FCP, LCP, etc.)
   */
  private startPerformanceTracking(): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
      // Track paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            const metricName = entry.name === 'first-paint' 
              ? 'first_paint_time' 
              : 'first_contentful_paint_time'
            
            const supabase = getSupabaseAdmin()
            supabase
              .from('page_performance')
              .update({ [metricName]: Math.round(entry.startTime) })
              .eq('session_id', this.config.sessionId)
              .eq('page_url', this.currentPageUrl)
              .is('page_exited_at', null)
          }
        }
      })
      paintObserver.observe({ entryTypes: ['paint'] })

      // Track LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        
        const supabase = getSupabaseAdmin()
        supabase
          .from('page_performance')
          .update({ largest_contentful_paint_time: Math.round(lastEntry.renderTime || lastEntry.loadTime) })
          .eq('session_id', this.config.sessionId)
          .eq('page_url', this.currentPageUrl)
          .is('page_exited_at', null)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      this.cleanupFunctions.push(() => {
        paintObserver.disconnect()
        lcpObserver.disconnect()
      })
    } catch (error) {
      console.error('Performance tracking failed:', error)
    }
  }

  /**
   * Starts detailed scroll tracking
   */
  private startScrollTracking(): void {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = async () => {
      const now = Date.now()
      const scrollX = window.scrollX
      const scrollY = window.scrollY
      
      // Calculate scroll metrics
      const timeDelta = now - this.lastScrollTime
      const distanceY = Math.abs(scrollY - this.lastScrollPosition.y)
      const distanceX = Math.abs(scrollX - this.lastScrollPosition.x)
      const scrollVelocity = timeDelta > 0 ? (distanceY + distanceX) / timeDelta * 1000 : 0
      
      // Determine scroll direction
      let scrollDirection: 'up' | 'down' | 'left' | 'right' = 'down'
      if (distanceY > distanceX) {
        scrollDirection = scrollY > this.lastScrollPosition.y ? 'down' : 'up'
      } else {
        scrollDirection = scrollX > this.lastScrollPosition.x ? 'right' : 'left'
      }
      
      // Calculate scroll depth percentage
      const documentHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight
      const scrollDepthPercentage = ((scrollY + viewportHeight) / documentHeight) * 100

      // Save scroll event
      const supabase = getSupabaseAdmin()
      await supabase.from('scroll_events').insert({
        session_id: this.config.sessionId,
        page_url: this.currentPageUrl,
        timestamp: new Date().toISOString(),
        scroll_x: scrollX,
        scroll_y: scrollY,
        viewport_width: window.innerWidth,
        viewport_height: viewportHeight,
        document_width: document.documentElement.scrollWidth,
        document_height: documentHeight,
        scroll_depth_percentage: Math.round(scrollDepthPercentage * 10) / 10,
        scroll_direction: scrollDirection,
        scroll_velocity: Math.round(scrollVelocity)
      })

      this.lastScrollPosition = { x: scrollX, y: scrollY }
      this.lastScrollTime = now
    }

    // Debounce scroll events
    const debouncedScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(handleScroll, 150)
    }

    window.addEventListener('scroll', debouncedScroll, { passive: true })
    this.cleanupFunctions.push(() => {
      window.removeEventListener('scroll', debouncedScroll)
      clearTimeout(scrollTimeout)
    })
  }

  /**
   * Starts detailed click tracking with rage detection
   */
  private startClickTracking(): void {
    const handleClick = async (e: MouseEvent) => {
      const now = Date.now()
      const timeSinceLastClick = now - this.lastClickTime
      
      // Determine click type
      let clickType: 'single' | 'double' | 'right_click' = 'single'
      if (e.button === 2) clickType = 'right_click'
      else if (e.detail === 2) clickType = 'double'
      
      // Get target element info
      const target = e.target as HTMLElement
      const targetElement = target.tagName
      const targetSelector = this.getElementSelector(target)
      const targetText = target.textContent?.substring(0, 100) || ''
      const targetHref = (target as HTMLAnchorElement).href || undefined
      
      // Check for rage click
      const isRageClick = this.detectRageClick(e.clientX, e.clientY, now)
      
      // Save click event
      const supabase = getSupabaseAdmin()
      await supabase.from('click_events').insert({
        session_id: this.config.sessionId,
        page_url: this.currentPageUrl,
        timestamp: new Date().toISOString(),
        x: e.clientX,
        y: e.clientY,
        button: e.button === 0 ? 'left' : e.button === 1 ? 'middle' : 'right',
        click_type: clickType,
        target_element: targetElement,
        target_selector: targetSelector,
        target_text: targetText,
        target_href: targetHref,
        time_since_last_click: timeSinceLastClick,
        is_rage_click: isRageClick,
        element_visible: this.isElementVisible(target),
        element_clickable: !target.hasAttribute('disabled')
      })
      
      this.lastClickTime = now
      
      // Add to click history for rage detection
      this.clickHistory.push({ x: e.clientX, y: e.clientY, time: now })
      
      // Keep only last 10 clicks
      if (this.clickHistory.length > 10) {
        this.clickHistory.shift()
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('contextmenu', handleClick) // Right clicks
    
    this.cleanupFunctions.push(() => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('contextmenu', handleClick)
    })
  }

  /**
   * Detects rage clicks (multiple rapid clicks in same area)
   */
  private detectRageClick(x: number, y: number, time: number): boolean {
    // Count clicks within 100px and 2 seconds
    const recentClicks = this.clickHistory.filter(click => {
      const timeDiff = time - click.time
      const distance = Math.sqrt(Math.pow(x - click.x, 2) + Math.pow(y - click.y, 2))
      return timeDiff < 2000 && distance < 100
    })
    
    // 3+ clicks in same area = rage click
    if (recentClicks.length >= 2) {
      // Save rage click incident
      const supabase = getSupabaseAdmin()
      supabase.from('rage_click_incidents').insert({
        session_id: this.config.sessionId,
        page_url: this.currentPageUrl,
        timestamp: new Date().toISOString(),
        x,
        y,
        click_count: recentClicks.length + 1,
        time_window_ms: time - recentClicks[0].time,
        clicks_per_second: (recentClicks.length + 1) / ((time - recentClicks[0].time) / 1000)
      })
      
      return true
    }
    
    return false
  }

  /**
   * Starts form interaction tracking
   */
  private startFormTracking(): void {
    const formStartTimes = new Map<string, number>()
    
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLInputElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const fieldName = target.name || target.id || 'unnamed'
        formStartTimes.set(fieldName, Date.now())
      }
    }
    
    const handleBlur = async (e: FocusEvent) => {
      const target = e.target as HTMLInputElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        const fieldName = target.name || target.id || 'unnamed'
        const startTime = formStartTimes.get(fieldName)
        const timeInField = startTime ? Date.now() - startTime : 0
        
        const supabase = getSupabaseAdmin()
        await supabase.from('form_interactions').insert({
          session_id: this.config.sessionId,
          page_url: this.currentPageUrl,
          field_name: fieldName,
          field_type: target.type || target.tagName.toLowerCase(),
          interaction_type: 'blur',
          timestamp: new Date().toISOString(),
          time_in_field: timeInField,
          character_count: target.value?.length || 0,
          field_completed: target.value?.length > 0
        })
      }
    }
    
    document.addEventListener('focus', handleFocus, true)
    document.addEventListener('blur', handleBlur, true)
    
    this.cleanupFunctions.push(() => {
      document.removeEventListener('focus', handleFocus, true)
      document.removeEventListener('blur', handleBlur, true)
    })
  }

  /**
   * Tracks page visibility (tab switching)
   */
  private startVisibilityTracking(): void {
    let hiddenTime = 0
    let lastHiddenAt = 0
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastHiddenAt = Date.now()
      } else if (lastHiddenAt > 0) {
        hiddenTime += Date.now() - lastHiddenAt
        lastHiddenAt = 0
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    this.cleanupFunctions.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Save visibility data on cleanup
      if (this.pageEnteredAt) {
        const totalTime = (Date.now() - this.pageEnteredAt.getTime()) / 1000
        const visibleTime = totalTime - (hiddenTime / 1000)
        
        const supabase = getSupabaseAdmin()
        supabase
          .from('page_performance')
          .update({
            total_visible_time_seconds: Math.round(visibleTime),
            total_hidden_time_seconds: Math.round(hiddenTime / 1000)
          })
          .eq('session_id', this.config.sessionId)
          .eq('page_url', this.currentPageUrl)
          .is('page_exited_at', null)
      }
    })
  }

  /**
   * Tracks page navigation (back button, etc.)
   */
  private startNavigationTracking(): void {
    const handleBeforeUnload = () => {
      const supabase = getSupabaseAdmin()
      supabase
        .from('page_performance')
        .update({ exit_type: 'navigation' })
        .eq('session_id', this.config.sessionId)
        .eq('page_url', this.currentPageUrl)
        .is('page_exited_at', null)
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    this.cleanupFunctions.push(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    })
  }

  /**
   * Calculates and saves session metrics
   */
  private async calculateSessionMetrics(): Promise<void> {
    const supabase = getSupabaseAdmin()
    // Call database function to calculate metrics
    await supabase.rpc('calculate_session_metrics', {
      p_session_id: this.config.sessionId
    })
    
    // Detect rage clicks
    await supabase.rpc('detect_rage_clicks', {
      p_session_id: this.config.sessionId
    })
  }

  /**
   * Gets CSS selector for element
   */
  private getElementSelector(element: HTMLElement): string {
    if (!element) return ''
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  /**
   * Checks if element is visible
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0
  }
}
