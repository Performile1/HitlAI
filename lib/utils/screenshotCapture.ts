/**
 * Screenshot Capture Utility
 * Captures screenshots of the current page or specific elements
 */

import html2canvas from 'html2canvas';

export interface ScreenshotOptions {
  element?: HTMLElement;
  quality?: number;
  backgroundColor?: string | null;
  scale?: number;
}

export interface ScreenshotResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Capture screenshot of entire page or specific element
 */
export async function captureScreenshot(
  options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
  const {
    element = document.body,
    quality = 0.95,
    backgroundColor = '#ffffff',
    scale = window.devicePixelRatio || 1
  } = options;

  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        quality
      );
    });

    return {
      dataUrl: canvas.toDataURL('image/png', quality),
      blob,
      width: canvas.width,
      height: canvas.height
    };
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw error;
  }
}

/**
 * Capture screenshot of specific element with highlight
 */
export async function captureElementScreenshot(
  element: HTMLElement,
  highlightColor: string = '#3b82f6'
): Promise<ScreenshotResult> {
  // Add temporary highlight
  const originalOutline = element.style.outline;
  const originalBoxShadow = element.style.boxShadow;
  
  element.style.outline = `3px solid ${highlightColor}`;
  element.style.boxShadow = `0 0 0 3px ${highlightColor}40`;

  try {
    const screenshot = await captureScreenshot({ element });
    return screenshot;
  } finally {
    // Restore original styles
    element.style.outline = originalOutline;
    element.style.boxShadow = originalBoxShadow;
  }
}

/**
 * Upload screenshot to Supabase storage
 */
export async function uploadScreenshot(
  blob: Blob,
  filename: string,
  supabaseClient: any
): Promise<string> {
  const filePath = `screenshots/${Date.now()}-${filename}`;

  const { data, error } = await supabaseClient.storage
    .from('screenshots')
    .upload(filePath, blob, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: { publicUrl } } = supabaseClient.storage
    .from('screenshots')
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Capture and upload screenshot in one call
 */
export async function captureAndUploadScreenshot(
  supabaseClient: any,
  options: ScreenshotOptions = {}
): Promise<{ url: string; screenshot: ScreenshotResult }> {
  const screenshot = await captureScreenshot(options);
  const filename = `screenshot-${Date.now()}.png`;
  const url = await uploadScreenshot(screenshot.blob, filename, supabaseClient);

  return { url, screenshot };
}

/**
 * Blur sensitive areas in screenshot
 */
export function blurSensitiveAreas(
  canvas: HTMLCanvasElement,
  areas: Array<{ x: number; y: number; width: number; height: number }>
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  areas.forEach(area => {
    // Get image data
    const imageData = ctx.getImageData(area.x, area.y, area.width, area.height);
    
    // Apply blur effect (simple box blur)
    const blurRadius = 10;
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0;

        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              r += pixels[i];
              g += pixels[i + 1];
              b += pixels[i + 2];
              count++;
            }
          }
        }

        const i = (y * width + x) * 4;
        pixels[i] = r / count;
        pixels[i + 1] = g / count;
        pixels[i + 2] = b / count;
      }
    }

    ctx.putImageData(imageData, area.x, area.y);
  });

  return canvas;
}
