import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getSupabase() {
  return createClient()
}

export async function POST(req: NextRequest) {
  try {
    const { mission, url, title } = await req.json()

    if (!mission || !url) {
      return NextResponse.json(
        { error: 'Mission and URL are required' },
        { status: 400 }
      )
    }

    // Generate test path suggestions
    const pathSuggestions = generateTestPathSuggestions(mission, url, title)
    
    // Get persona and tester recommendations
    const personaRecommendations = await getPersonaRecommendations(mission, url)
    const testerRecommendations = await getTesterRecommendations(mission, url)

    return NextResponse.json({
      ...pathSuggestions,
      recommendedPersonas: personaRecommendations,
      recommendedTesters: testerRecommendations
    })
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}

async function getPersonaRecommendations(mission: string, url: string) {
  const supabase = getSupabase()
  const missionLower = mission.toLowerCase()
  
  // Fetch all public personas
  const { data: personas } = await supabase
    .from('personas')
    .select('*')
    .eq('is_public', true)
    .order('name')
  
  if (!personas) return []
  
  // Score and filter personas based on mission requirements
  const scoredPersonas = personas.map(persona => {
    let score = 0
    const literacy = persona.tech_literacy.toLowerCase()
    
    // Accessibility tests - all personas valuable
    if (missionLower.includes('accessibility') || missionLower.includes('wcag') || missionLower.includes('a11y')) {
      score += 10
      if (persona.eyesight === 'poor' || persona.eyesight === 'moderate') score += 5
    }
    
    // E-commerce/Checkout - prefer medium to high literacy
    if (missionLower.includes('checkout') || missionLower.includes('purchase') || missionLower.includes('cart') || missionLower.includes('payment')) {
      if (literacy === 'medium' || literacy === 'high') score += 8
      if (persona.age >= 25 && persona.age <= 55) score += 3
    }
    
    // Senior/elderly focused
    if (missionLower.includes('senior') || missionLower.includes('elderly') || missionLower.includes('60+')) {
      if (persona.age >= 55) score += 10
      if (literacy === 'low' || literacy === 'medium') score += 5
    }
    
    // Technical/Developer focused
    if (missionLower.includes('developer') || missionLower.includes('technical') || missionLower.includes('api') || missionLower.includes('code')) {
      if (literacy === 'high') score += 10
      if (persona.age <= 45) score += 3
    }
    
    // Mobile/App testing
    if (missionLower.includes('mobile') || missionLower.includes('app') || missionLower.includes('smartphone')) {
      if (literacy === 'medium' || literacy === 'high') score += 7
      if (persona.age <= 50) score += 4
    }
    
    // Form/Input testing - diverse personas
    if (missionLower.includes('form') || missionLower.includes('input') || missionLower.includes('signup') || missionLower.includes('register')) {
      score += 5
    }
    
    return { ...persona, matchScore: score }
  })
  
  // Return top 5 recommended personas
  return scoredPersonas
    .filter(p => p.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      tech_literacy: p.tech_literacy,
      matchScore: p.matchScore,
      reason: getPersonaMatchReason(p, missionLower)
    }))
}

async function getTesterRecommendations(mission: string, url: string) {
  const supabase = getSupabase()
  const missionLower = mission.toLowerCase()
  
  // Determine required skills and preferences
  const requiredTestTypes: string[] = []
  const requiredSkills: string[] = []
  
  if (missionLower.includes('ecommerce') || missionLower.includes('checkout') || missionLower.includes('cart')) {
    requiredTestTypes.push('ecommerce')
    requiredSkills.push('payment_testing', 'checkout_flows')
  }
  if (missionLower.includes('accessibility') || missionLower.includes('wcag')) {
    requiredTestTypes.push('accessibility')
    requiredSkills.push('wcag', 'screen_readers')
  }
  if (missionLower.includes('mobile') || missionLower.includes('app')) {
    requiredTestTypes.push('mobile_apps')
    requiredSkills.push('mobile_testing')
  }
  if (missionLower.includes('usability') || missionLower.includes('ux')) {
    requiredTestTypes.push('usability')
    requiredSkills.push('ux_evaluation')
  }
  
  // Fetch matching testers
  const { data: testers } = await supabase
    .from('human_testers')
    .select('*')
    .eq('is_available', true)
    .eq('is_verified', true)
    .gte('rating', 4.0)
    .order('rating', { ascending: false })
    .limit(20)
  
  if (!testers) return []
  
  // Score testers based on match
  const scoredTesters = testers.map(tester => {
    let score = 0
    
    // Match test types
    if (tester.preferred_test_types) {
      const matchingTypes = requiredTestTypes.filter(type => 
        tester.preferred_test_types.includes(type)
      )
      score += matchingTypes.length * 10
    }
    
    // Tech literacy matching
    const literacy = tester.tech_literacy?.toLowerCase()
    if (missionLower.includes('technical') || missionLower.includes('developer')) {
      if (literacy === 'high') score += 8
    } else if (missionLower.includes('senior') || missionLower.includes('simple')) {
      if (literacy === 'low' || literacy === 'medium') score += 8
    } else {
      if (literacy === 'medium') score += 5
    }
    
    // Experience bonus
    if (tester.years_of_testing_experience >= 2) score += 5
    if (tester.years_of_testing_experience >= 5) score += 3
    
    // Rating bonus
    if (tester.rating >= 4.5) score += 5
    if (tester.rating >= 4.8) score += 3
    
    // Tests completed bonus
    if (tester.tests_completed >= 10) score += 3
    if (tester.tests_completed >= 50) score += 5
    
    return { ...tester, matchScore: score }
  })
  
  // Return top 10 recommended testers
  return scoredTesters
    .filter(t => t.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10)
    .map(t => ({
      id: t.id,
      display_name: t.display_name,
      age: t.age,
      tech_literacy: t.tech_literacy,
      rating: t.rating,
      tests_completed: t.tests_completed,
      years_of_testing_experience: t.years_of_testing_experience,
      preferred_test_types: t.preferred_test_types,
      matchScore: t.matchScore,
      reason: getTesterMatchReason(t, missionLower)
    }))
}

function getPersonaMatchReason(persona: any, mission: string): string {
  const reasons = []
  const literacy = persona.tech_literacy.toLowerCase()
  
  if (mission.includes('accessibility')) {
    reasons.push('Accessibility testing')
    if (persona.eyesight !== 'perfect') reasons.push('Visual impairment perspective')
  }
  if (mission.includes('senior') && persona.age >= 55) {
    reasons.push('Senior user perspective')
  }
  if (mission.includes('checkout') && (literacy === 'medium' || literacy === 'high')) {
    reasons.push('E-commerce experience')
  }
  if (mission.includes('technical') && literacy === 'high') {
    reasons.push('Technical proficiency')
  }
  
  return reasons.length > 0 ? reasons.join(', ') : 'General testing fit'
}

function getTesterMatchReason(tester: any, mission: string): string {
  const reasons = []
  
  if (tester.preferred_test_types) {
    const types = tester.preferred_test_types.slice(0, 2).map((t: string) => 
      t.replace('_', ' ')
    )
    if (types.length > 0) reasons.push(`Specializes in ${types.join(', ')}`)
  }
  
  if (tester.rating >= 4.5) reasons.push('Highly rated')
  if (tester.years_of_testing_experience >= 3) reasons.push('Experienced tester')
  if (tester.tests_completed >= 50) reasons.push('Proven track record')
  
  return reasons.length > 0 ? reasons.join(' • ') : 'Good match'
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
