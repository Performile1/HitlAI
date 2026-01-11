import os
from typing import Dict, Optional
from scrapegraph_py import Client
from loguru import logger


class ScrapeMapper:
    
    def __init__(self):
        self.api_key = os.getenv("SCRAPEGRAPH_API_KEY")
        self.client = Client(api_key=self.api_key) if self.api_key else None
    
    def map_semantic_schema(
        self,
        url: str,
        html_content: Optional[str] = None,
        focus_elements: Optional[list] = None
    ) -> Dict:
        if not self.client:
            logger.warning("ScrapeGraphAI client not initialized, using fallback parser")
            return self._fallback_schema_extraction(html_content)
        
        logger.info(f"Mapping semantic schema for: {url}")
        
        prompt = """
        Extract the semantic UI schema of this page. Focus on:
        1. Interactive elements (buttons, links, forms, inputs)
        2. Navigation structure (menus, breadcrumbs)
        3. Content hierarchy (headings, sections)
        4. Accessibility attributes (ARIA labels, roles)
        5. Visual indicators (icons, colors, sizes)
        
        Return a structured JSON with:
        - interactive_elements: list of clickable/interactive items with selectors
        - navigation: navigation structure
        - content_sections: main content areas
        - accessibility: ARIA and semantic HTML usage
        - visual_cues: important visual design patterns
        """
        
        try:
            if focus_elements:
                prompt += f"\n\nPay special attention to these elements: {', '.join(focus_elements)}"
            
            response = self.client.smartscraper(
                website_url=url,
                user_prompt=prompt
            )
            
            schema = {
                "success": True,
                "url": url,
                "schema": response,
                "interactive_elements": self._extract_interactive_elements(response),
                "navigation": self._extract_navigation(response),
                "accessibility": self._extract_accessibility(response)
            }
            
            logger.info("Semantic schema mapping completed")
            return schema
            
        except Exception as e:
            logger.error(f"ScrapeGraphAI error: {str(e)}")
            return self._fallback_schema_extraction(html_content)
    
    def _fallback_schema_extraction(self, html_content: Optional[str]) -> Dict:
        from bs4 import BeautifulSoup
        
        if not html_content:
            return {"success": False, "error": "No HTML content provided"}
        
        soup = BeautifulSoup(html_content, 'lxml')
        
        interactive_elements = []
        for tag in soup.find_all(['button', 'a', 'input', 'select', 'textarea']):
            element_data = {
                "tag": tag.name,
                "text": tag.get_text(strip=True)[:100],
                "id": tag.get('id'),
                "class": tag.get('class'),
                "type": tag.get('type'),
                "href": tag.get('href'),
                "aria_label": tag.get('aria-label'),
                "role": tag.get('role')
            }
            interactive_elements.append(element_data)
        
        navigation = []
        for nav in soup.find_all('nav'):
            nav_data = {
                "id": nav.get('id'),
                "class": nav.get('class'),
                "links": [a.get_text(strip=True) for a in nav.find_all('a')]
            }
            navigation.append(nav_data)
        
        return {
            "success": True,
            "fallback": True,
            "interactive_elements": interactive_elements[:50],
            "navigation": navigation,
            "headings": [h.get_text(strip=True) for h in soup.find_all(['h1', 'h2', 'h3'])]
        }
    
    def _extract_interactive_elements(self, response: Dict) -> list:
        if isinstance(response, dict) and "interactive_elements" in response:
            return response["interactive_elements"]
        return []
    
    def _extract_navigation(self, response: Dict) -> Dict:
        if isinstance(response, dict) and "navigation" in response:
            return response["navigation"]
        return {}
    
    def _extract_accessibility(self, response: Dict) -> Dict:
        if isinstance(response, dict) and "accessibility" in response:
            return response["accessibility"]
        return {}
