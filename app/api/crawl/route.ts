import { NextRequest, NextResponse } from 'next/server'

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
 * POST /api/crawl
 * 
 * Crawls a URL using Crawl4AI service with JavaScript rendering
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
  try {
    const body: CrawlRequest = await request.json()
    
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Call Crawl4AI Python service
    const crawl4aiUrl = process.env.CRAWL4AI_SERVICE_URL || 'http://localhost:8001'
    
    const response = await fetch(`${crawl4aiUrl}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: body.url,
        wait_for: body.waitFor,
        screenshot: body.screenshot || false,
        extract_links: body.extractLinks !== false,
        wait_time: body.waitTime || 2
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Crawl4AI service error:', error)
      
      // Fallback to basic fetch if service unavailable
      if (response.status === 503 || response.status === 500) {
        console.warn('Crawl4AI service unavailable, falling back to basic fetch')
        return await fallbackCrawl(body.url)
      }
      
      return NextResponse.json(
        { error: 'Crawl service error', details: error },
        { status: response.status }
      )
    }

    const result: CrawlResult = await response.json()
    
    // Cache the result (optional)
    // await cacheResult(body.url, result)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('Crawl API error:', error)
    
    // Fallback to basic fetch on error
    const body: CrawlRequest = await request.json()
    if (body.url) {
      return await fallbackCrawl(body.url)
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Fallback crawl using basic fetch (no JavaScript rendering)
 */
async function fallbackCrawl(url: string): Promise<NextResponse> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const html = await response.text()
    const markdown = convertHtmlToMarkdown(html)

    return NextResponse.json({
      success: true,
      url,
      title: extractTitle(html),
      markdown,
      html,
      metadata: {
        statusCode: response.status,
        contentType: response.headers.get('content-type'),
        fallback: true,
        warning: 'JavaScript rendering not available - using basic fetch'
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        url,
        title: '',
        markdown: '',
        html: '',
        error: error instanceof Error ? error.message : 'Fallback crawl failed'
      },
      { status: 500 }
    )
  }
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  return titleMatch ? titleMatch[1] : ''
}

function convertHtmlToMarkdown(html: string): string {
  let markdown = html
    .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
  
  return markdown.trim()
}
