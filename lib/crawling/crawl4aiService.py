"""
Crawl4AI Service - Advanced web crawling with JavaScript rendering

Features:
- JavaScript rendering (handles SPAs)
- Dynamic content loading
- High-quality markdown conversion
- Screenshot capture
- Structured data extraction
- Anti-bot bypass
- LLM-friendly output
"""

import asyncio
import json
from typing import Optional, Dict, Any, List
from crawl4ai import AsyncWebCrawler
from crawl4ai.extraction_strategy import LLMExtractionStrategy
from crawl4ai.chunking_strategy import RegexChunking
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

class CrawlResult(BaseModel):
    success: bool
    url: str
    title: str
    markdown: str
    html: str
    screenshot: Optional[str] = None
    links: List[str] = []
    metadata: Dict[str, Any] = {}
    error: Optional[str] = None

class Crawl4AIService:
    """
    Advanced web crawling service using Crawl4AI
    """
    
    def __init__(self):
        self.crawler = None
    
    async def initialize(self):
        """Initialize the async crawler"""
        if not self.crawler:
            self.crawler = AsyncWebCrawler(
                headless=True,
                verbose=False,
                browser_type="chromium"
            )
            await self.crawler.start()
    
    async def cleanup(self):
        """Cleanup crawler resources"""
        if self.crawler:
            await self.crawler.close()
            self.crawler = None
    
    async def crawl_page(
        self,
        url: str,
        wait_for: Optional[str] = None,
        screenshot: bool = False,
        extract_links: bool = True,
        wait_time: int = 2
    ) -> CrawlResult:
        """
        Crawl a single page with JavaScript rendering
        
        Args:
            url: URL to crawl
            wait_for: CSS selector to wait for before extracting content
            screenshot: Whether to capture screenshot
            extract_links: Whether to extract all links
            wait_time: Seconds to wait for dynamic content
        
        Returns:
            CrawlResult with markdown, HTML, and metadata
        """
        try:
            await self.initialize()
            
            # Configure crawl options
            crawl_config = {
                "url": url,
                "word_count_threshold": 10,
                "bypass_cache": True,
                "screenshot": screenshot,
                "wait_until": "networkidle",
                "delay_before_return_html": wait_time
            }
            
            # Add wait_for selector if provided
            if wait_for:
                crawl_config["wait_for"] = wait_for
            
            # Execute crawl
            result = await self.crawler.arun(**crawl_config)
            
            if not result.success:
                return CrawlResult(
                    success=False,
                    url=url,
                    title="",
                    markdown="",
                    html="",
                    error=f"Crawl failed: {result.error_message}"
                )
            
            # Extract links if requested
            links = []
            if extract_links and result.links:
                links = [link.get('href', '') for link in result.links.get('internal', [])]
            
            # Build metadata
            metadata = {
                "status_code": result.status_code,
                "content_type": result.headers.get('content-type', '') if result.headers else '',
                "crawl_time": result.crawl_time,
                "word_count": len(result.markdown.split()) if result.markdown else 0,
                "has_javascript": True,
                "links_count": len(links)
            }
            
            return CrawlResult(
                success=True,
                url=url,
                title=result.title or "",
                markdown=result.markdown or "",
                html=result.html or "",
                screenshot=result.screenshot if screenshot else None,
                links=links,
                metadata=metadata
            )
            
        except Exception as e:
            return CrawlResult(
                success=False,
                url=url,
                title="",
                markdown="",
                html="",
                error=str(e)
            )
    
    async def crawl_with_extraction(
        self,
        url: str,
        extraction_prompt: str,
        schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Crawl page and extract structured data using LLM
        
        Args:
            url: URL to crawl
            extraction_prompt: Prompt for LLM extraction
            schema: Optional Pydantic schema for structured extraction
        
        Returns:
            Extracted structured data
        """
        try:
            await self.initialize()
            
            # Configure LLM extraction strategy
            extraction_strategy = LLMExtractionStrategy(
                provider="openai",
                api_token=os.getenv("OPENAI_API_KEY"),
                instruction=extraction_prompt,
                schema=schema
            )
            
            result = await self.crawler.arun(
                url=url,
                extraction_strategy=extraction_strategy,
                bypass_cache=True
            )
            
            if not result.success:
                return {
                    "success": False,
                    "error": result.error_message
                }
            
            return {
                "success": True,
                "extracted_content": result.extracted_content,
                "markdown": result.markdown,
                "metadata": {
                    "status_code": result.status_code,
                    "crawl_time": result.crawl_time
                }
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def extract_interactive_elements(self, url: str) -> Dict[str, Any]:
        """
        Extract all interactive elements (buttons, inputs, links, forms)
        
        Args:
            url: URL to analyze
        
        Returns:
            Structured data of interactive elements
        """
        extraction_prompt = """
        Extract all interactive UI elements from this page:
        - Buttons (with text, aria-label, role)
        - Input fields (with type, name, placeholder, aria-label)
        - Links (with text, href, aria-label)
        - Forms (with action, method, fields)
        - Select dropdowns (with options)
        - Checkboxes and radio buttons
        
        For each element, provide:
        - Type (button, input, link, etc.)
        - Text/Label
        - Selector (CSS selector to locate it)
        - ARIA attributes
        - Visibility (visible, hidden, disabled)
        
        Return as structured JSON.
        """
        
        return await self.crawl_with_extraction(url, extraction_prompt)

# FastAPI server for HTTP API
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel as PydanticBaseModel

app = FastAPI(title="Crawl4AI Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global service instance
service = Crawl4AIService()

class CrawlRequest(PydanticBaseModel):
    url: str
    wait_for: Optional[str] = None
    screenshot: bool = False
    extract_links: bool = True
    wait_time: int = 2

class ExtractionRequest(PydanticBaseModel):
    url: str
    extraction_prompt: str
    schema: Optional[Dict[str, Any]] = None

@app.on_event("startup")
async def startup_event():
    """Initialize crawler on startup"""
    await service.initialize()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup crawler on shutdown"""
    await service.cleanup()

@app.post("/crawl")
async def crawl_endpoint(request: CrawlRequest):
    """Crawl a single page"""
    try:
        result = await service.crawl_page(
            url=request.url,
            wait_for=request.wait_for,
            screenshot=request.screenshot,
            extract_links=request.extract_links,
            wait_time=request.wait_time
        )
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract")
async def extract_endpoint(request: ExtractionRequest):
    """Crawl and extract structured data"""
    try:
        result = await service.crawl_with_extraction(
            url=request.url,
            extraction_prompt=request.extraction_prompt,
            schema=request.schema
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interactive-elements")
async def interactive_elements_endpoint(url: str):
    """Extract interactive elements from page"""
    try:
        result = await service.extract_interactive_elements(url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "crawl4ai"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
