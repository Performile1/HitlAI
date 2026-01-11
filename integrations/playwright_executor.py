from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from typing import Dict, List, Optional
import asyncio
from loguru import logger
from datetime import datetime
import os


class PlaywrightExecutor:
    
    def __init__(self, headless: bool = False):
        self.headless = headless
        self.screenshot_dir = "screenshots"
        os.makedirs(self.screenshot_dir, exist_ok=True)
    
    async def execute_with_retry(
        self,
        url: str,
        actions: List[Dict],
        max_retries: int = 3
    ) -> Dict:
        result = {
            "success": False,
            "steps_completed": [],
            "screenshots": [],
            "errors": [],
            "retry_count": 0
        }
        
        for attempt in range(max_retries):
            result["retry_count"] = attempt + 1
            
            try:
                async with async_playwright() as p:
                    browser = await p.chromium.launch(headless=self.headless)
                    context = await browser.new_context(
                        viewport={"width": 1280, "height": 720},
                        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    )
                    page = await context.new_page()
                    
                    await page.goto(url, wait_until="networkidle", timeout=30000)
                    
                    screenshot_path = await self._take_screenshot(page, "initial")
                    result["screenshots"].append(screenshot_path)
                    
                    for idx, action in enumerate(actions):
                        try:
                            success = await self._execute_action(page, action)
                            
                            if success:
                                result["steps_completed"].append(action)
                                screenshot_path = await self._take_screenshot(page, f"step_{idx}")
                                result["screenshots"].append(screenshot_path)
                            else:
                                raise Exception(f"Action failed: {action.get('type')}")
                        
                        except Exception as e:
                            logger.error(f"Action {idx} failed: {str(e)}")
                            result["errors"].append({
                                "step": idx,
                                "action": action,
                                "error": str(e)
                            })
                            
                            screenshot_path = await self._take_screenshot(page, f"error_{idx}")
                            result["screenshots"].append(screenshot_path)
                            
                            raise
                    
                    result["success"] = True
                    await browser.close()
                    return result
            
            except Exception as e:
                logger.warning(f"Attempt {attempt + 1} failed: {str(e)}")
                result["errors"].append({
                    "attempt": attempt + 1,
                    "error": str(e)
                })
                
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                else:
                    result["success"] = False
                    return result
        
        return result
    
    async def _execute_action(self, page: Page, action: Dict) -> bool:
        action_type = action.get("type")
        selector = action.get("selector")
        value = action.get("value")
        
        logger.info(f"Executing action: {action_type} on {selector}")
        
        if action_type == "click":
            await page.click(selector, timeout=10000)
            await page.wait_for_timeout(500)
            return True
        
        elif action_type == "fill":
            await page.fill(selector, value, timeout=10000)
            await page.wait_for_timeout(300)
            return True
        
        elif action_type == "type":
            await page.type(selector, value, delay=50)
            await page.wait_for_timeout(300)
            return True
        
        elif action_type == "select":
            await page.select_option(selector, value)
            await page.wait_for_timeout(300)
            return True
        
        elif action_type == "press":
            await page.press(selector, value)
            await page.wait_for_timeout(300)
            return True
        
        elif action_type == "wait":
            await page.wait_for_selector(selector, timeout=10000)
            return True
        
        elif action_type == "scroll":
            await page.evaluate(f"window.scrollTo(0, {value or 'document.body.scrollHeight'})")
            await page.wait_for_timeout(500)
            return True
        
        elif action_type == "hover":
            await page.hover(selector, timeout=10000)
            await page.wait_for_timeout(300)
            return True
        
        else:
            logger.warning(f"Unknown action type: {action_type}")
            return False
    
    async def _take_screenshot(self, page: Page, name: str) -> str:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{name}_{timestamp}.png"
        filepath = os.path.join(self.screenshot_dir, filename)
        
        await page.screenshot(path=filepath, full_page=True)
        logger.info(f"Screenshot saved: {filepath}")
        
        return filepath
    
    async def smart_find_element(
        self,
        page: Page,
        text: Optional[str] = None,
        role: Optional[str] = None,
        aria_label: Optional[str] = None,
        fallback_selector: Optional[str] = None
    ) -> Optional[str]:
        selectors_to_try = []
        
        if aria_label:
            selectors_to_try.append(f'[aria-label="{aria_label}"]')
        
        if role and text:
            try:
                await page.get_by_role(role, name=text).wait_for(timeout=5000)
                return f'role={role}[name="{text}"]'
            except:
                pass
        
        if text:
            selectors_to_try.extend([
                f'button:has-text("{text}")',
                f'a:has-text("{text}")',
                f'text="{text}"'
            ])
        
        if fallback_selector:
            selectors_to_try.append(fallback_selector)
        
        for selector in selectors_to_try:
            try:
                await page.wait_for_selector(selector, timeout=3000)
                logger.info(f"Found element with selector: {selector}")
                return selector
            except:
                continue
        
        logger.warning("Could not find element with any selector")
        return None
