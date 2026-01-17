import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface RecordingConfig {
  sessionId: string
  testerId: string
  testRequestId?: string
  enableScreenRecording: boolean
  enableCursorTracking: boolean
  enableEyeTracking: boolean
}

interface CursorEvent {
  timestamp: Date
  x: number
  y: number
  eventType: 'move' | 'click' | 'scroll' | 'hover' | 'drag'
  button?: 'left' | 'right' | 'middle'
  targetElement?: string
  targetSelector?: string
  velocity?: number
}

interface ScrollEvent {
  timestamp: Date
  scrollX: number
  scrollY: number
  scrollDepthPercentage: number
  scrollDirection: 'up' | 'down' | 'left' | 'right'
  scrollVelocity: number
  viewportWidth: number
  viewportHeight: number
  documentWidth: number
  documentHeight: number
}

interface ClickEvent {
  timestamp: Date
  x: number
  y: number
  button: 'left' | 'right' | 'middle'
  clickType: 'single' | 'double' | 'right_click'
  targetElement: string
  targetSelector: string
  targetText: string
  targetHref?: string
  timeSinceLastClick: number
}

interface PagePerformance {
  pageUrl: string
  pageTitle: string
  pageLoadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  pageEnteredAt: Date
  pageExitedAt?: Date
  timeOnPageSeconds?: number
}

interface EyeTrackingData {
  timestamp: Date
  gazeX: number
  gazeY: number
  fixationDuration?: number
  pupilDiameter?: number
  confidence: number
}

/**
 * SessionRecorder - Captures comprehensive user behavior during testing
 * 
 * Features:
 * 1. Screen Recording - Full video capture of test session
 * 2. Cursor Tracking - High-frequency cursor position and interaction data
 * 3. Eye Tracking - Webcam-based gaze tracking using WebGazer.js
 * 4. Frustration Detection - Identifies rage clicks, pauses, confusion
 * 5. Attention Heatmap - Visualizes where users focus
 * 6. AI Training Data - Converts human behavior into AI training data
 */
export class SessionRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private cursorBuffer: CursorEvent[] = []
  private scrollBuffer: ScrollEvent[] = []
  private clickBuffer: ClickEvent[] = []
  private eyeTrackingBuffer: EyeTrackingData[] = []
  private performanceData: PagePerformance[] = []
  private config: RecordingConfig
  private isRecording: boolean = false
  private currentPageUrl: string = ''
  private pageEnteredAt: Date | null = null
  private lastClickTime: number = 0
  private lastScrollPosition = { x: 0, y: 0 }
  private lastScrollTime: number = 0
  private clickHistory: Array<{ x: number; y: number; time: number }> = []

  constructor(config: RecordingConfig) {
    this.config = config
  }

  /**
   * Starts recording session
   */
  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.warn('Recording already in progress')
      return
    }

    try {
      // Start screen recording
      if (this.config.enableScreenRecording) {
        await this.startScreenRecording()
      }

      // Start cursor tracking
      if (this.config.enableCursorTracking) {
        this.startCursorTracking()
      }

      // Start eye tracking
      if (this.config.enableEyeTracking) {
        await this.startEyeTracking()
      }

      this.isRecording = true
      console.log('Session recording started')
    } catch (error) {
      console.error('Failed to start recording:', error)
      throw error
    }
  }

  /**
   * Stops recording and saves to Supabase
   */
  async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('No recording in progress')
    }

    try {
      // Stop screen recording
      if (this.mediaRecorder) {
        this.mediaRecorder.stop()
        await this.waitForRecordingStop()
      }

      // Stop cursor tracking
      this.stopCursorTracking()

      // Stop eye tracking
      this.stopEyeTracking()

      // Save all data to Supabase
      const recordingId = await this.saveRecording()

      this.isRecording = false
      console.log('Session recording stopped and saved:', recordingId)

      return recordingId
    } catch (error) {
      console.error('Failed to stop recording:', error)
      throw error
    }
  }

  /**
   * Starts screen recording using MediaRecorder API
   */
  private async startScreenRecording(): Promise<void> {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false // Don't record audio for privacy
      })

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      })

      // Collect recorded chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data)
        }
      }

      // Start recording
      this.mediaRecorder.start(1000) // Collect data every second
    } catch (error) {
      console.error('Screen recording failed:', error)
      throw new Error('Screen recording permission denied or not supported')
    }
  }

  /**
   * Starts cursor tracking
   */
  private startCursorTracking(): void {
    let lastPosition = { x: 0, y: 0 }
    let lastTimestamp = Date.now()

    // Track mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      const timeDelta = now - lastTimestamp
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastPosition.x, 2) + 
        Math.pow(e.clientY - lastPosition.y, 2)
      )
      const velocity = timeDelta > 0 ? distance / timeDelta * 1000 : 0

      this.cursorBuffer.push({
        timestamp: new Date(),
        x: e.clientX,
        y: e.clientY,
        eventType: 'move',
        velocity,
        targetElement: (e.target as HTMLElement)?.tagName,
        targetSelector: this.getElementSelector(e.target as HTMLElement)
      })

      lastPosition = { x: e.clientX, y: e.clientY }
      lastTimestamp = now

      // Flush buffer if it gets too large
      if (this.cursorBuffer.length > 100) {
        this.flushCursorBuffer()
      }
    }

    // Track clicks
    const handleClick = (e: MouseEvent) => {
      this.cursorBuffer.push({
        timestamp: new Date(),
        x: e.clientX,
        y: e.clientY,
        eventType: 'click',
        button: e.button === 0 ? 'left' : e.button === 1 ? 'middle' : 'right',
        targetElement: (e.target as HTMLElement)?.tagName,
        targetSelector: this.getElementSelector(e.target as HTMLElement)
      })
    }

    // Track scrolling
    const handleScroll = (e: Event) => {
      this.cursorBuffer.push({
        timestamp: new Date(),
        x: window.scrollX,
        y: window.scrollY,
        eventType: 'scroll'
      })
    }

    // Attach listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)

    // Store cleanup function
    this.cleanupCursorTracking = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
    }
  }

  private cleanupCursorTracking?: () => void

  /**
   * Stops cursor tracking
   */
  private stopCursorTracking(): void {
    if (this.cleanupCursorTracking) {
      this.cleanupCursorTracking()
      this.flushCursorBuffer()
    }
  }

  /**
   * Starts eye tracking using WebGazer.js
   */
  private async startEyeTracking(): Promise<void> {
    try {
      // Check if WebGazer is loaded
      if (typeof window === 'undefined' || !(window as any).webgazer) {
        console.warn('WebGazer.js not loaded, skipping eye tracking')
        return
      }

      const webgazer = (window as any).webgazer

      // Initialize WebGazer
      await webgazer
        .setGazeListener((data: any, elapsedTime: number) => {
          if (data) {
            this.eyeTrackingBuffer.push({
              timestamp: new Date(),
              gazeX: Math.round(data.x),
              gazeY: Math.round(data.y),
              confidence: 0.8 // WebGazer doesn't provide confidence, use default
            })

            // Flush buffer periodically
            if (this.eyeTrackingBuffer.length > 50) {
              this.flushEyeTrackingBuffer()
            }
          }
        })
        .begin()

      // Hide video preview
      webgazer.showVideoPreview(false)
      webgazer.showPredictionPoints(false)
    } catch (error) {
      console.error('Eye tracking failed:', error)
      // Don't throw - eye tracking is optional
    }
  }

  /**
   * Stops eye tracking
   */
  private stopEyeTracking(): void {
    if (typeof window !== 'undefined' && (window as any).webgazer) {
      (window as any).webgazer.end()
      this.flushEyeTrackingBuffer()
    }
  }

  /**
   * Flushes cursor buffer to database
   */
  private async flushCursorBuffer(): Promise<void> {
    if (this.cursorBuffer.length === 0) return

    const batch = [...this.cursorBuffer]
    this.cursorBuffer = []

    try {
      const supabase = getSupabaseAdmin()
      await supabase.from('cursor_tracking').insert(
        batch.map(event => ({
          session_id: this.config.sessionId,
          timestamp: event.timestamp.toISOString(),
          x: event.x,
          y: event.y,
          event_type: event.eventType,
          button: event.button,
          target_element: event.targetElement,
          target_selector: event.targetSelector,
          velocity: event.velocity
        }))
      )
    } catch (error) {
      console.error('Failed to save cursor data:', error)
    }
  }

  /**
   * Flushes eye tracking buffer to database
   */
  private async flushEyeTrackingBuffer(): Promise<void> {
    if (this.eyeTrackingBuffer.length === 0) return

    const batch = [...this.eyeTrackingBuffer]
    this.eyeTrackingBuffer = []

    try {
      const supabase = getSupabaseAdmin()
      await supabase.from('eye_tracking_data').insert(
        batch.map(data => ({
          session_id: this.config.sessionId,
          timestamp: data.timestamp.toISOString(),
          gaze_x: data.gazeX,
          gaze_y: data.gazeY,
          fixation_duration: data.fixationDuration,
          pupil_diameter: data.pupilDiameter,
          confidence: data.confidence
        }))
      )
    } catch (error) {
      console.error('Failed to save eye tracking data:', error)
    }
  }

  /**
   * Saves complete recording to Supabase
   */
  private async saveRecording(): Promise<string> {
    const supabase = getSupabaseAdmin()
    // Create recording record
    const { data: recording, error: recordingError } = await supabase
      .from('session_recordings')
      .insert({
        session_id: this.config.sessionId,
        tester_id: this.config.testerId,
        test_request_id: this.config.testRequestId,
        recording_type: this.getRecordingType(),
        analyzed: false,
        anonymized: false,
        pii_removed: false
      })
      .select()
      .single()

    if (recordingError) {
      throw new Error(`Failed to create recording record: ${recordingError.message}`)
    }

    const recordingId = recording.id

    // Upload screen recording if available
    if (this.recordedChunks.length > 0) {
      const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' })
      const videoPath = `test-recordings/${this.config.sessionId}/${recordingId}.webm`

      const { error: uploadError } = await supabase.storage
        .from('test-recordings')
        .upload(videoPath, videoBlob)

      if (uploadError) {
        console.error('Failed to upload video:', uploadError)
      } else {
        // Update recording with video URL
        await supabase
          .from('session_recordings')
          .update({
            screen_recording_url: videoPath,
            duration_seconds: Math.round(videoBlob.size / 250000), // Rough estimate
            file_size_bytes: videoBlob.size
          })
          .eq('id', recordingId)
      }
    }

    return recordingId
  }

  /**
   * Gets element selector for tracking
   */
  private getElementSelector(element: HTMLElement): string {
    if (!element) return ''

    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  /**
   * Determines recording type based on config
   */
  private getRecordingType(): string {
    const types: string[] = []
    if (this.config.enableScreenRecording) types.push('screen')
    if (this.config.enableCursorTracking) types.push('cursor')
    if (this.config.enableEyeTracking) types.push('eye_tracking')
    return types.length === 3 ? 'full' : types.join('_')
  }

  /**
   * Waits for MediaRecorder to finish
   */
  private waitForRecordingStop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = () => resolve()
      } else {
        resolve()
      }
    })
  }
}
