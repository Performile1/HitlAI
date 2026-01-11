import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface CrawlRequest {
  url: string
  waitFor?: string
}

serve(async (req) => {
  try {
    const { url, waitFor }: CrawlRequest = await req.json()

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Use Crawl4AI API or implement basic crawling
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const html = await response.text()

    // Basic markdown conversion (simplified)
    const markdown = convertHtmlToMarkdown(html)

    return new Response(
      JSON.stringify({
        success: true,
        url,
        markdown,
        html,
        title: extractTitle(html),
        metadata: {
          statusCode: response.status,
          contentType: response.headers.get('content-type')
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
})

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  return titleMatch ? titleMatch[1] : ''
}

function convertHtmlToMarkdown(html: string): string {
  // Simplified conversion - in production, use a proper library
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
