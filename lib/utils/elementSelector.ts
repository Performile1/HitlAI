/**
 * Element Selector Utility
 * Generates CSS selectors and XPath for DOM elements
 */

export interface ElementInfo {
  selector: string;
  xpath: string;
  elementType: string;
  elementText: string;
  attributes: Record<string, string>;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Generate a unique CSS selector for an element
 */
export function generateCSSSelector(element: Element): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.className) {
      const classes = current.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }

    // Add nth-child if needed for uniqueness
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children);
      const sameTagSiblings = siblings.filter(s => s.tagName === current!.tagName);
      
      if (sameTagSiblings.length > 1) {
        const index = sameTagSiblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

/**
 * Generate XPath for an element
 */
export function generateXPath(element: Element): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const path: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.body) {
    let index = 0;
    let sibling: Element | null = current;

    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.tagName.toLowerCase();
    const pathIndex = index > 1 ? `[${index}]` : '';
    path.unshift(`${tagName}${pathIndex}`);
    current = current.parentElement;
  }

  return '//' + path.join('/');
}

/**
 * Get comprehensive element information
 */
export function getElementInfo(element: Element): ElementInfo {
  const rect = element.getBoundingClientRect();
  const attributes: Record<string, string> = {};

  // Collect important attributes
  Array.from(element.attributes).forEach(attr => {
    attributes[attr.name] = attr.value;
  });

  return {
    selector: generateCSSSelector(element),
    xpath: generateXPath(element),
    elementType: element.tagName.toLowerCase(),
    elementText: element.textContent?.trim().substring(0, 100) || '',
    attributes,
    boundingBox: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height
    }
  };
}

/**
 * Highlight an element on the page
 */
export function highlightElement(element: Element, color: string = '#3b82f6'): () => void {
  const overlay = document.createElement('div');
  const rect = element.getBoundingClientRect();
  
  overlay.style.position = 'fixed';
  overlay.style.left = `${rect.left}px`;
  overlay.style.top = `${rect.top}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  overlay.style.border = `3px solid ${color}`;
  overlay.style.backgroundColor = `${color}20`;
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '999999';
  overlay.style.transition = 'all 0.2s ease';
  
  document.body.appendChild(overlay);

  // Return cleanup function
  return () => {
    overlay.remove();
  };
}

/**
 * Enable click-to-select mode
 */
export function enableElementPicker(
  onElementSelected: (elementInfo: ElementInfo) => void,
  highlightColor: string = '#3b82f6'
): () => void {
  let currentHighlight: (() => void) | null = null;

  const handleMouseOver = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as Element;
    if (!target || target.tagName === 'HTML' || target.tagName === 'BODY') {
      return;
    }

    // Remove previous highlight
    if (currentHighlight) {
      currentHighlight();
    }

    // Add new highlight
    currentHighlight = highlightElement(target, highlightColor);
  };

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as Element;
    if (!target || target.tagName === 'HTML' || target.tagName === 'BODY') {
      return;
    }

    const elementInfo = getElementInfo(target);
    onElementSelected(elementInfo);

    // Cleanup
    cleanup();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      cleanup();
    }
  };

  const cleanup = () => {
    if (currentHighlight) {
      currentHighlight();
      currentHighlight = null;
    }
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('click', handleClick);
    document.removeEventListener('keydown', handleKeyDown);
    document.body.style.cursor = '';
  };

  // Add event listeners
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKeyDown);
  document.body.style.cursor = 'crosshair';

  // Return cleanup function
  return cleanup;
}

/**
 * Find element by selector
 */
export function findElementBySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch (e) {
    console.error('Invalid selector:', selector);
    return null;
  }
}

/**
 * Find element by XPath
 */
export function findElementByXPath(xpath: string): Element | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue as Element;
  } catch (e) {
    console.error('Invalid XPath:', xpath);
    return null;
  }
}
