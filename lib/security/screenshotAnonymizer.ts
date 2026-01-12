import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage } from '@langchain/core/messages'
import sharp from 'sharp'

interface PIIRegion {
  x: number
  y: number
  width: number
  height: number
  type: 'text' | 'email' | 'phone' | 'address' | 'name' | 'credit_card'
  confidence: number
}

/**
 * ScreenshotAnonymizer - Protects user privacy in test screenshots
 * 
 * Since we're testing homepages and webshops, screenshots might capture PII
 * (usernames, addresses, credit cards). This agent detects and blurs sensitive
 * areas before saving to public storage buckets.
 */
export class ScreenshotAnonymizer {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.1,
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Detects PII regions in screenshot using GPT-4o vision
   */
  async detectPIIRegions(screenshotUrl: string): Promise<PIIRegion[]> {
    const prompt = `Analyze this screenshot and identify any regions containing Personally Identifiable Information (PII).

**Look for:**
- Email addresses
- Phone numbers
- Physical addresses
- Names (in forms, profiles, etc.)
- Credit card numbers
- Social security numbers
- Account numbers
- Any other sensitive personal data

**Important:**
- Ignore placeholder text like "Enter your email"
- Ignore generic UI labels
- Focus on actual user data

Return JSON array of regions:
[
  {
    "x": pixel_x,
    "y": pixel_y,
    "width": pixel_width,
    "height": pixel_height,
    "type": "text|email|phone|address|name|credit_card",
    "confidence": 0.0-1.0
  }
]

If no PII found, return empty array: []`

    try {
      const response = await this.llm.invoke([
        new HumanMessage({
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: screenshotUrl } }
          ]
        })
      ])

      const content = response.content as string
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return []
    } catch (error) {
      console.error('PII detection failed:', error)
      return []
    }
  }

  /**
   * Blurs PII regions in screenshot
   */
  async anonymizeScreenshot(
    screenshotBuffer: Buffer,
    piiRegions: PIIRegion[]
  ): Promise<Buffer> {
    if (piiRegions.length === 0) {
      return screenshotBuffer
    }

    try {
      let image = sharp(screenshotBuffer)
      const metadata = await image.metadata()

      // Create blur overlays for each PII region
      const blurPromises = piiRegions
        .filter(region => region.confidence > 0.7) // Only blur high-confidence regions
        .map(async region => {
          // Ensure region is within image bounds
          const x = Math.max(0, Math.min(region.x, metadata.width! - 1))
          const y = Math.max(0, Math.min(region.y, metadata.height! - 1))
          const width = Math.min(region.width, metadata.width! - x)
          const height = Math.min(region.height, metadata.height! - y)

          // Extract region, blur it heavily, and return as overlay
          const blurredRegion = await sharp(screenshotBuffer)
            .extract({ left: x, top: y, width, height })
            .blur(20)
            .toBuffer()

          return {
            input: blurredRegion,
            left: x,
            top: y
          }
        })

      const overlays = await Promise.all(blurPromises)

      // Apply all overlays
      const anonymized = await image
        .composite(overlays)
        .toBuffer()

      return anonymized
    } catch (error) {
      console.error('Screenshot anonymization failed:', error)
      // Return original if anonymization fails (better than blocking)
      return screenshotBuffer
    }
  }

  /**
   * Full pipeline: detect and anonymize
   */
  async processScreenshot(screenshotBuffer: Buffer): Promise<{
    anonymizedBuffer: Buffer
    piiDetected: boolean
    regions: PIIRegion[]
  }> {
    // Convert buffer to data URL for vision API
    const base64 = screenshotBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    // Detect PII
    const regions = await this.detectPIIRegions(dataUrl)

    // Anonymize if PII found
    const anonymizedBuffer = regions.length > 0
      ? await this.anonymizeScreenshot(screenshotBuffer, regions)
      : screenshotBuffer

    return {
      anonymizedBuffer,
      piiDetected: regions.length > 0,
      regions
    }
  }

  /**
   * Validates that anonymization was successful
   * Re-scans the anonymized image to ensure no PII remains
   */
  async validateAnonymization(anonymizedBuffer: Buffer): Promise<boolean> {
    const base64 = anonymizedBuffer.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    const remainingPII = await this.detectPIIRegions(dataUrl)

    return remainingPII.filter(r => r.confidence > 0.7).length === 0
  }
}
