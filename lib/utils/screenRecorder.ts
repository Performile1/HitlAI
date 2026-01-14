/**
 * Screen Recording Utility
 * Records screen activity during test execution
 */

export interface RecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

export interface RecordingResult {
  blob: Blob;
  duration: number;
  size: number;
}

export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;

  /**
   * Start recording the screen
   */
  async startRecording(options: RecordingOptions = {}): Promise<void> {
    try {
      // Request screen capture
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      const mimeType = options.mimeType || this.getSupportedMimeType();
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: options.videoBitsPerSecond || 2500000
      });

      this.recordedChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and return the video blob
   */
  async stopRecording(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder!.mimeType
        });

        const duration = Date.now() - this.startTime;

        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        resolve({
          blob,
          duration,
          size: blob.size
        });

        // Cleanup
        this.mediaRecorder = null;
        this.stream = null;
        this.recordedChunks = [];
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Get recording duration in milliseconds
   */
  getDuration(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * Get supported MIME type
   */
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm';
  }
}

/**
 * Upload recording to Supabase storage
 */
export async function uploadRecording(
  blob: Blob,
  testRunId: string,
  supabaseClient: any
): Promise<string> {
  const filename = `recording-${testRunId}-${Date.now()}.webm`;
  const filePath = `test-recordings/${testRunId}/${filename}`;

  const { data, error } = await supabaseClient.storage
    .from('test-recordings')
    .upload(filePath, blob, {
      contentType: blob.type,
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabaseClient.storage
    .from('test-recordings')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Create video thumbnail
 */
export async function createVideoThumbnail(
  videoBlob: Blob,
  timeInSeconds: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    video.src = URL.createObjectURL(videoBlob);
    video.currentTime = timeInSeconds;

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(video.src);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      }, 'image/jpeg', 0.8);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
  });
}

/**
 * Add timestamp annotations to video
 */
export interface VideoAnnotation {
  timestamp: number;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export function formatVideoAnnotations(annotations: VideoAnnotation[]): string {
  return annotations
    .map(a => `${formatTimestamp(a.timestamp)} - [${a.type.toUpperCase()}] ${a.text}`)
    .join('\n');
}

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const s = seconds % 60;
  const m = minutes % 60;

  if (hours > 0) {
    return `${hours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
