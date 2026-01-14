import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { mission, url, title } = await req.json()

    if (!mission || !url) {
      return NextResponse.json(
        { error: 'Mission and URL are required' },
        { status: 400 }
      )
    }

    // Simple AI-powered suggestions based on keywords
    // In production, this would call an LLM API like OpenAI
    const suggestions = generateTestPathSuggestions(mission, url, title)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

function generateTestPathSuggestions(mission: string, url: string, title: string) {
  const missionLower = mission.toLowerCase()
  
  // Generate happy path based on keywords
  let happyPath = ''
  let negativePaths: string[] = []

  // E-commerce/Checkout flows
  if (missionLower.includes('checkout') || missionLower.includes('purchase') || missionLower.includes('cart')) {
    happyPath = '1. Navigate to product page → 2. Add item to cart → 3. Go to checkout → 4. Enter shipping information → 5. Enter payment details → 6. Review order → 7. Complete purchase → 8. Verify confirmation page'
    negativePaths = [
      'Try to checkout with empty cart',
      'Enter invalid credit card number',
      'Submit form with missing required fields',
      'Apply expired or invalid coupon code',
      'Try to proceed without accepting terms and conditions'
    ]
  }
  // Login/Authentication flows
  else if (missionLower.includes('login') || missionLower.includes('sign in') || missionLower.includes('auth')) {
    happyPath = '1. Navigate to login page → 2. Enter valid credentials → 3. Click login button → 4. Verify successful redirect to dashboard → 5. Verify user session is active'
    negativePaths = [
      'Try login with incorrect password',
      'Try login with non-existent email',
      'Submit empty login form',
      'Test password reset flow with invalid email',
      'Check for SQL injection vulnerabilities in login fields'
    ]
  }
  // Registration/Signup flows
  else if (missionLower.includes('signup') || missionLower.includes('register') || missionLower.includes('sign up')) {
    happyPath = '1. Navigate to signup page → 2. Fill in all required fields → 3. Accept terms and conditions → 4. Submit form → 5. Verify email confirmation → 6. Complete account setup'
    negativePaths = [
      'Try to register with already existing email',
      'Submit form with mismatched passwords',
      'Use invalid email format',
      'Leave required fields empty',
      'Test weak password validation'
    ]
  }
  // Form submission flows
  else if (missionLower.includes('form') || missionLower.includes('submit')) {
    happyPath = '1. Navigate to form page → 2. Fill in all required fields with valid data → 3. Submit form → 4. Verify success message → 5. Check data was saved correctly'
    negativePaths = [
      'Submit form with invalid data formats',
      'Leave required fields empty',
      'Test field validation messages',
      'Submit form multiple times rapidly',
      'Test XSS vulnerabilities in text fields'
    ]
  }
  // Search functionality
  else if (missionLower.includes('search')) {
    happyPath = '1. Navigate to search page → 2. Enter search query → 3. Submit search → 4. Verify relevant results appear → 5. Test result pagination'
    negativePaths = [
      'Search with empty query',
      'Search with special characters',
      'Search with very long query string',
      'Test search with no results',
      'Test search filters and sorting'
    ]
  }
  // Accessibility testing
  else if (missionLower.includes('accessibility') || missionLower.includes('wcag') || missionLower.includes('a11y')) {
    happyPath = '1. Navigate through site using keyboard only → 2. Test with screen reader → 3. Verify proper heading hierarchy → 4. Check color contrast ratios → 5. Test form labels and ARIA attributes'
    negativePaths = [
      'Try to navigate without mouse (keyboard only)',
      'Test with images disabled',
      'Verify alt text on all images',
      'Check focus indicators on interactive elements',
      'Test with browser zoom at 200%'
    ]
  }
  // Mobile/Responsive testing
  else if (missionLower.includes('mobile') || missionLower.includes('responsive')) {
    happyPath = '1. Open site on mobile device → 2. Test portrait and landscape orientations → 3. Verify touch targets are adequate size → 4. Test navigation menu → 5. Verify content is readable without zooming'
    negativePaths = [
      'Test on very small screen sizes (320px)',
      'Test with slow network connection',
      'Verify images load properly on mobile',
      'Test touch gestures (swipe, pinch, zoom)',
      'Check for horizontal scrolling issues'
    ]
  }
  // Payment flows
  else if (missionLower.includes('payment') || missionLower.includes('billing')) {
    happyPath = '1. Navigate to payment page → 2. Enter valid payment information → 3. Submit payment → 4. Verify payment processing → 5. Check confirmation and receipt'
    negativePaths = [
      'Try payment with declined card',
      'Enter invalid card number',
      'Test with expired card',
      'Submit payment form with missing CVV',
      'Test payment timeout scenarios'
    ]
  }
  // Generic fallback
  else {
    happyPath = '1. Navigate to target page → 2. Complete primary user action → 3. Verify expected outcome → 4. Check for success indicators'
    negativePaths = [
      'Test with invalid inputs',
      'Test with missing required data',
      'Verify error messages are clear',
      'Test edge cases and boundary conditions'
    ]
  }

  return {
    happyPath,
    negativePaths,
    confidence: 0.85
  }
}
