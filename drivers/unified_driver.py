"""
HitlAI Unified Driver - Seamless Web (Playwright) + Mobile (Appium) Automation
"""

import os
from typing import Dict, Any, Optional, Literal
from dataclasses import dataclass
from playwright.async_api import async_playwright, Page, Browser
from appium import webdriver as appium_driver
from appium.options.android import UiAutomator2Options
from appium.options.ios import XCUITestOptions
from loguru import logger
import base64
from datetime import datetime


@dataclass
class FrictionEvent:
    """Represents a friction point encountered during automation"""
    timestamp: str
    element_description: str
    action_type: str
    error_message: str
    screenshot_base64: str
    technical_log: str
    platform: str
    severity: Literal['low', 'medium', 'high', 'critical']


class HitlAIDriver:
    """
    Unified driver that switches between Playwright (web) and Appium (mobile)
    based on platform context. Includes AI-ready semantic locators.
    """
    
    def __init__(self, platform: Literal['web', 'mobile'], config: Dict[str, Any]):
        self.platform = platform
        self.config = config
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.appium_driver: Optional[appium_driver.Remote] = None
        self.scrape_mapper = None  # Will be injected for semantic resolution
        
        logger.info(f"Initializing HitlAIDriver for platform: {platform}")
    
    async def initialize(self):
        """Initialize the appropriate driver based on platform"""
        if self.platform == 'web':
            await self._initialize_playwright()
        elif self.platform == 'mobile':
            await self._initialize_appium()
        else:
            raise ValueError(f"Unsupported platform: {self.platform}")
    
    async def _initialize_playwright(self):
        """Initialize Playwright for web automation"""
        playwright = await async_playwright().start()
        
        browser_type = self.config.get('browser', 'chromium')
        headless = self.config.get('headless', False)
        
        if browser_type == 'chromium':
            self.browser = await playwright.chromium.launch(headless=headless)
        elif browser_type == 'firefox':
            self.browser = await playwright.firefox.launch(headless=headless)
        elif browser_type == 'webkit':
            self.browser = await playwright.webkit.launch(headless=headless)
        
        context = await self.browser.new_context(
            viewport=self.config.get('viewport', {'width': 1280, 'height': 720}),
            user_agent=self.config.get('user_agent')
        )
        
        self.page = await context.new_page()
        logger.info("Playwright initialized successfully")
    
    async def _initialize_appium(self):
        """Initialize Appium for mobile automation"""
        mobile_os = self.config.get('mobile_os', 'android').lower()
        
        if mobile_os == 'android':
            options = UiAutomator2Options()
            options.platform_name = 'Android'
            options.device_name = os.getenv('APPIUM_DEVICE_NAME', 'emulator-5554')
            options.app = self.config.get('app_path')
            options.automation_name = 'UiAutomator2'
            options.no_reset = True
        elif mobile_os == 'ios':
            options = XCUITestOptions()
            options.platform_name = 'iOS'
            options.device_name = os.getenv('APPIUM_DEVICE_NAME', 'iPhone 14')
            options.app = self.config.get('app_path')
            options.automation_name = 'XCUITest'
            options.no_reset = True
        else:
            raise ValueError(f"Unsupported mobile OS: {mobile_os}")
        
        appium_url = os.getenv('APPIUM_SERVER_URL', 'http://localhost:4723')
        self.appium_driver = appium_driver.Remote(appium_url, options=options)
        logger.info(f"Appium initialized for {mobile_os}")
    
    async def find_and_interact(
        self,
        element_description: str,
        action_type: Literal['click', 'type', 'scroll', 'wait', 'screenshot'],
        input_text: Optional[str] = None,
        timeout: int = 10000
    ) -> Dict[str, Any]:
        """
        AI-ready interaction method that resolves semantic descriptions
        into specific selectors and performs the action.
        
        Args:
            element_description: Natural language description (e.g., "the checkout button")
            action_type: Type of action to perform
            input_text: Text to input (for 'type' action)
            timeout: Timeout in milliseconds
            
        Returns:
            Result dictionary with success status and details
        """
        try:
            # Resolve semantic description to selector
            selector = await self._resolve_semantic_selector(element_description)
            
            if self.platform == 'web':
                return await self._interact_web(selector, action_type, input_text, timeout)
            elif self.platform == 'mobile':
                return await self._interact_mobile(selector, action_type, input_text, timeout)
                
        except Exception as e:
            # Create friction event on failure
            friction = await self._create_friction_event(
                element_description,
                action_type,
                str(e)
            )
            return {
                'success': False,
                'error': str(e),
                'friction_event': friction
            }
    
    async def _resolve_semantic_selector(self, description: str) -> str:
        """
        Use ScrapeGraphAI to resolve semantic descriptions into selectors.
        Falls back to heuristic matching if AI resolution fails.
        """
        if self.scrape_mapper:
            try:
                # Use ScrapeGraphAI to find element
                selector = await self.scrape_mapper.resolve_element(description)
                if selector:
                    logger.info(f"Resolved '{description}' to selector: {selector}")
                    return selector
            except Exception as e:
                logger.warning(f"AI selector resolution failed: {e}")
        
        # Fallback: heuristic matching
        return self._heuristic_selector_match(description)
    
    def _heuristic_selector_match(self, description: str) -> str:
        """
        Fallback heuristic selector matching based on common patterns.
        """
        desc_lower = description.lower()
        
        # Common button patterns
        if 'button' in desc_lower or 'btn' in desc_lower:
            if 'checkout' in desc_lower:
                return "button:has-text('checkout'), [aria-label*='checkout']"
            elif 'submit' in desc_lower:
                return "button[type='submit'], input[type='submit']"
            elif 'login' in desc_lower or 'sign in' in desc_lower:
                return "button:has-text('login'), button:has-text('sign in')"
        
        # Form inputs
        if 'email' in desc_lower:
            return "input[type='email'], input[name*='email']"
        if 'password' in desc_lower:
            return "input[type='password'], input[name*='password']"
        if 'search' in desc_lower:
            return "input[type='search'], input[placeholder*='search']"
        
        # Links
        if 'link' in desc_lower:
            text = desc_lower.replace('link', '').strip()
            return f"a:has-text('{text}')"
        
        # Generic text match
        return f"text={description}"
    
    async def _interact_web(
        self,
        selector: str,
        action_type: str,
        input_text: Optional[str],
        timeout: int
    ) -> Dict[str, Any]:
        """Perform web interaction using Playwright"""
        try:
            if action_type == 'click':
                await self.page.click(selector, timeout=timeout)
                await self.page.wait_for_load_state('networkidle', timeout=5000)
                
            elif action_type == 'type':
                await self.page.fill(selector, input_text or '', timeout=timeout)
                
            elif action_type == 'scroll':
                await self.page.evaluate(f"document.querySelector('{selector}').scrollIntoView()")
                
            elif action_type == 'wait':
                await self.page.wait_for_selector(selector, timeout=timeout)
                
            elif action_type == 'screenshot':
                screenshot = await self.page.screenshot()
                return {
                    'success': True,
                    'screenshot': base64.b64encode(screenshot).decode()
                }
            
            return {'success': True, 'action': action_type, 'selector': selector}
            
        except Exception as e:
            logger.error(f"Web interaction failed: {e}")
            raise
    
    async def _interact_mobile(
        self,
        selector: str,
        action_type: str,
        input_text: Optional[str],
        timeout: int
    ) -> Dict[str, Any]:
        """Perform mobile interaction using Appium"""
        try:
            # Convert web selector to mobile locator
            locator = self._convert_to_mobile_locator(selector)
            
            element = self.appium_driver.find_element(*locator)
            
            if action_type == 'click':
                element.click()
                
            elif action_type == 'type':
                element.send_keys(input_text or '')
                
            elif action_type == 'scroll':
                self.appium_driver.execute_script('mobile: scroll', {'element': element})
                
            elif action_type == 'wait':
                # Element already found, so wait is satisfied
                pass
                
            elif action_type == 'screenshot':
                screenshot = self.appium_driver.get_screenshot_as_base64()
                return {'success': True, 'screenshot': screenshot}
            
            return {'success': True, 'action': action_type, 'locator': locator}
            
        except Exception as e:
            logger.error(f"Mobile interaction failed: {e}")
            raise
    
    def _convert_to_mobile_locator(self, web_selector: str) -> tuple:
        """
        Convert web selector to Appium locator strategy.
        Returns (strategy, value) tuple.
        """
        # Accessibility ID (preferred)
        if 'aria-label' in web_selector:
            label = web_selector.split("'")[1]
            return ('accessibility id', label)
        
        # Text matching
        if web_selector.startswith('text='):
            text = web_selector.replace('text=', '')
            return ('xpath', f"//*[@text='{text}' or @content-desc='{text}']")
        
        # ID matching
        if '#' in web_selector:
            element_id = web_selector.split('#')[1]
            return ('id', element_id)
        
        # Class matching
        if '.' in web_selector:
            class_name = web_selector.split('.')[1]
            return ('class name', class_name)
        
        # Default to XPath
        return ('xpath', f"//*[contains(@text, '{web_selector}')]")
    
    async def _create_friction_event(
        self,
        element_description: str,
        action_type: str,
        error_message: str
    ) -> FrictionEvent:
        """Create a friction event with screenshot and logs"""
        
        # Capture screenshot
        screenshot_b64 = ""
        try:
            if self.platform == 'web' and self.page:
                screenshot = await self.page.screenshot()
                screenshot_b64 = base64.b64encode(screenshot).decode()
            elif self.platform == 'mobile' and self.appium_driver:
                screenshot_b64 = self.appium_driver.get_screenshot_as_base64()
        except Exception as e:
            logger.warning(f"Failed to capture screenshot: {e}")
        
        # Determine severity based on error type
        severity = 'medium'
        if 'timeout' in error_message.lower():
            severity = 'high'
        elif 'not found' in error_message.lower():
            severity = 'critical'
        
        return FrictionEvent(
            timestamp=datetime.now().isoformat(),
            element_description=element_description,
            action_type=action_type,
            error_message=error_message,
            screenshot_base64=screenshot_b64,
            technical_log=error_message,
            platform=self.platform,
            severity=severity
        )
    
    async def navigate(self, url_or_activity: str):
        """Navigate to URL (web) or activity (mobile)"""
        if self.platform == 'web':
            await self.page.goto(url_or_activity, wait_until='networkidle')
            logger.info(f"Navigated to: {url_or_activity}")
        elif self.platform == 'mobile':
            self.appium_driver.start_activity(
                self.config.get('app_package'),
                url_or_activity
            )
            logger.info(f"Started activity: {url_or_activity}")
    
    async def get_page_context(self) -> Dict[str, Any]:
        """Get current page/screen context for analysis"""
        if self.platform == 'web':
            return {
                'url': self.page.url,
                'title': await self.page.title(),
                'html': await self.page.content(),
                'viewport': self.page.viewport_size
            }
        elif self.platform == 'mobile':
            return {
                'activity': self.appium_driver.current_activity,
                'package': self.appium_driver.current_package,
                'source': self.appium_driver.page_source,
                'orientation': self.appium_driver.orientation
            }
    
    async def close(self):
        """Cleanup and close driver"""
        if self.browser:
            await self.browser.close()
        if self.appium_driver:
            self.appium_driver.quit()
        logger.info("HitlAIDriver closed")
