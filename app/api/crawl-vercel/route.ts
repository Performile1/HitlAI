import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export const runtime = 'nodejs'
export const maxDuration = 60

interface CrawlRequest {
  url: string
  waitFor?: string
  screenshot?: boolean
  extractLinks?: boolean
  waitTime?: number
}

interface CrawlResult {
  success: boolean
  url: string
  title: string
  markdown: string
  html: string
  screenshot?: string
  links?: string[]
  metadata?: Record<string, any>
  error?: string
}

/**
 * POST /api/crawl-vercel
 * 
 * Vercel Edge Function for web scraping with JavaScript rendering
 * Uses Puppeteer + Chromium optimized for serverless
 * 
 * Body:
 * {
 *   url: string
 *   waitFor?: string (CSS selector to wait for)
 *   screenshot?: boolean
 *   extractLinks?: boolean
 *   waitTime?: number (seconds)
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let browser = null

  try {
    const body: CrawlRequest = await request.json()
    
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    let targetUrl: URL
    try {
      targetUrl = new URL(body.url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Launch browser with Chromium optimized for serverless
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote'
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()

    // Set user agent to avoid bot detection
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    )

    // Navigate to URL
    await page.goto(body.url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    })

    // Wait for specific selector if provided
    if (body.waitFor) {
      try {
        await page.waitForSelector(body.waitFor, { timeout: 10000 })
      } catch (e) {
        console.warn(`Selector ${body.waitFor} not found, continuing anyway`)
      }
    }

    // Additional wait time for dynamic content
    if (body.waitTime && body.waitTime > 0) {
      await page.waitForTimeout(body.waitTime * 1000)
    }

    // Extract page data
    const title = await page.title()
    const html = await page.content()

    // Convert HTML to markdown (basic conversion)
    const markdown = await page.evaluate(() => {
      const body = document.body
      if (!body) return ''
      
      let text = body.innerText || ''
      
      // Extract headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      headings.forEach(h => {
        const level = parseInt(h.tagName[1])
        const prefix = '#'.repeat(level)
        text = text.replace(h.textContent || '', `${prefix} ${h.textContent}\n`)
      })
      
      return text
    })

    // Extract links if requested
    let links: string[] = []
    if (body.extractLinks !== false) {
      links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => href.startsWith('http'))
      })
    }

    // Capture screenshot if requested
    let screenshotBase64: string | undefined
    if (body.screenshot) {
      const screenshot = await page.screenshot({
        fullPage: true,
        type: 'png'
      })
      screenshotBase64 = `data:image/png;base64,${Buffer.from(screenshot).toString('base64')}`
    }

    await browser.close()

    const crawlTime = Date.now() - startTime

    const result: CrawlResult = {
      success: true,
      url: body.url,
      title,
      markdown,
      html,
      screenshot: screenshotBase64,
      links,
      metadata: {
        crawl_time: crawlTime,
        word_count: markdown.split(/\s+/).length,
        has_javascript: true,
        links_count: links.length,
        renderer: 'puppeteer-chromium',
        vercel_edge: false
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Crawl error:', error)
    
    if (browser) {
      try {
        await browser.close()
      } catch (e) {
        console.error('Failed to close browser:', e)
      }
    }

    return NextResponse.json(
      {
        success: false,
        url: '',
        title: '',
        markdown: '',
        html: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          crawl_time: Date.now() - startTime,
          renderer: 'puppeteer-chromium',
          vercel_edge: false
        }
      } as CrawlResult,
      { status: 500 }
    )
  }
}

/**
 * GET /api/crawl-vercel
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'crawl-vercel',
    runtime: 'nodejs',
    renderer: 'puppeteer-chromium'
  })
}
