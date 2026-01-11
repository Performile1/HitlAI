import asyncio
from typing import Dict, Optional
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from loguru import logger


class CrawlScout:
    
    def __init__(self):
        self.browser_config = BrowserConfig(
            headless=True,
            verbose=False
        )
    
    async def scan_site(self, url: str, wait_for: Optional[str] = None) -> Dict:
        logger.info(f"Starting Crawl4AI scan for: {url}")
        
        crawler_config = CrawlerRunConfig(
            cache_mode=CacheMode.BYPASS,
            wait_for=wait_for if wait_for else "body",
            page_timeout=30000,
            screenshot=True,
            pdf=False
        )
        
        async with AsyncWebCrawler(config=self.browser_config) as crawler:
            result = await crawler.arun(
                url=url,
                config=crawler_config
            )
            
            if not result.success:
                logger.error(f"Crawl failed: {result.error_message}")
                return {
                    "success": False,
                    "error": result.error_message
                }
            
            fit_markdown = result.markdown_v2.fit_markdown if hasattr(result.markdown_v2, 'fit_markdown') else result.markdown
            
            scan_data = {
                "success": True,
                "url": url,
                "title": result.metadata.get("title", ""),
                "fit_markdown": fit_markdown,
                "raw_markdown": result.markdown,
                "html": result.html,
                "links": result.links.get("internal", []) if hasattr(result, 'links') else [],
                "media": result.media if hasattr(result, 'media') else {},
                "screenshot": result.screenshot,
                "metadata": result.metadata
            }
            
            logger.info(f"Crawl completed successfully. Markdown length: {len(fit_markdown)}")
            return scan_data
    
    def scan_site_sync(self, url: str, wait_for: Optional[str] = None) -> Dict:
        return asyncio.run(self.scan_site(url, wait_for))
