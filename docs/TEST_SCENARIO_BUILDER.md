# Test Scenario Builder

## Overview

The Test Scenario Builder is designed for situations where your application **cannot be uploaded** to HitlAI for automated testing. This includes:

- **Games** (too large, proprietary engines like Unity/Unreal)
- **Enterprise Software** (security restrictions, on-premise only)
- **Mobile Apps** (platform-specific, app store restrictions)
- **Hardware-Dependent Software** (requires specific devices)
- **Large Applications** (exceeds upload limits)

Instead of uploading your app, the Test Scenario Builder helps you **define comprehensive test scenarios** that human testers can execute manually.

---

## Features

The Test Scenario Builder generates detailed test plans covering **7 critical dimensions**:

### 1. **Happy Paths** (Positive Testing)
Core user journeys that represent successful use cases.

**Example:**
- Goal: "Complete checkout with valid payment"
- Steps: Add to cart → Enter shipping → Enter payment → Confirm
- Success: Order confirmation displayed, email sent

### 2. **Sad Paths** (Negative Testing)
Scenarios where things go wrong. Tests error handling and graceful failures.

**Categories:**
- **Payment Failures**: Card declined, expired card, insufficient funds
- **Invalid Inputs**: Special characters, SQL injection attempts, negative numbers
- **Empty States**: Required fields blank, empty cart checkout
- **Authentication Issues**: Session timeout, invalid token

**Example:**
```
Name: Card Declined - Insufficient Funds
Trigger: Use test card 4000000000000002
Expected: Display clear error: "Payment declined. Please use a different card."
Recovery: User can try different payment method without losing cart
Priority: CRITICAL
```

### 3. **Edge Cases** (Boundary Testing)
Extreme but valid scenarios that often expose logic flaws.

**Categories:**
- **Character Limits**: 255-character names, special Unicode characters (Ñ, ü, 中文)
- **Quantity Extremes**: 10,000 items in cart, quantity = 0, quantity = 1
- **Zero Values**: Discount making total $0.00, free shipping threshold exactly met
- **Time Zones**: Midnight bookings, Daylight Savings transitions, leap years

**Example:**
```
Name: Maximum Character Name
Test Value: "A" repeated 255 times
Expected: Name accepted, displays correctly in UI and database
Constraint: Database field VARCHAR(255)
```

### 4. **Environmental Testing**
Real-world conditions: connectivity issues, device interrupts, browser diversity.

**The "Elevator Effect":**
```
Scenario: Internet cuts out during payment submission
Steps:
1. Fill checkout form
2. Click "Pay" button
3. Disable network immediately
4. Re-enable network after 10 seconds
5. Verify no double charge

Expected: Transaction rolled back OR idempotent retry succeeds
Critical: User charged EXACTLY ONCE
```

**Device Interruptions:**
- Phone call received mid-flow
- Low battery warning
- App backgrounded
- Wi-Fi → 5G switch mid-transaction

**Browser/OS Diversity:**
- Safari 14 (older version)
- Small screens (iPhone SE, 320px width)
- Tablet landscape mode
- Browser extensions (ad blockers)

### 5. **Non-Functional Testing**

#### Load Testing
```
Scenario: Black Friday Sale
Test: 5,000 concurrent checkouts
Metrics: Response time, error rate, throughput, CPU usage
Pass Criteria: 95th percentile < 5 seconds, error rate < 0.1%
Tools: JMeter, k6, LoadRunner
```

#### Accessibility (WCAG 2.1 AA)
```
Tests:
- Screen reader compatibility (NVDA, JAWS)
- Keyboard-only navigation (Tab, Enter, Escape)
- Color contrast ratios (4.5:1 minimum)
- Text resize to 200%
- Focus indicators visible
- Error announcements for screen readers
```

#### Security
```
Tests:
- XSS prevention: Can user inject <script> tags?
- CSRF token validation
- SQL injection attempts: ' OR '1'='1
- Price manipulation: Inspect element to change price
- Session hijacking prevention
```

#### Performance
```
Metrics:
- Page load time < 3 seconds
- Time to interactive < 5 seconds
- Lighthouse score > 90
- First Contentful Paint < 1.8 seconds
```

### 6. **Chaos/Monkey Testing**
Unpredictable scenarios to test system resilience.

**Rapid Random Actions:**
```
Execution: Script clicks random UI elements 1000 times
Break Conditions:
- Application crash
- Unhandled exception
- Data corruption
- Infinite loop

Expected: No crashes, all errors handled gracefully, state remains consistent
```

**Unexpected Sequences:**
```
Test: Skip steps in multi-step flow
Example: Access checkout step 3 directly without completing steps 1-2
Expected: System redirects to correct step OR validates prerequisites
```

**Resource Exhaustion:**
```
Tests:
- Upload 1000 files simultaneously
- Open 50 browser tabs of same page
- Fill localStorage to capacity
- Exhaust database connection pool
```

---

## Usage

### API Endpoints

#### Generate Test Scenarios
```typescript
POST /api/test-scenarios/generate

Body:
{
  "appType": "web" | "mobile" | "desktop" | "game" | "enterprise",
  "appDescription": "Detailed description of your application",
  "businessObjective": "Primary user goal (e.g., Complete checkout)"
}

Response:
{
  "scenarios": {
    "happyPaths": [...],
    "sadPaths": [...],
    "edgeCases": [...],
    "environmentalTests": [...],
    "nonFunctionalTests": [...],
    "chaosTests": [...]
  },
  "validation": {
    "isComplete": boolean,
    "missingAreas": string[],
    "recommendations": string[]
  }
}
```

#### Get Guided Questions
```typescript
GET /api/test-scenarios/questions?appType=game

Response:
{
  "questions": [
    "What is the primary business objective?",
    "Who are your target users?",
    "What game engine are you using?",
    ...
  ]
}
```

### React Component

```tsx
import { TestScenarioBuilder } from '@/components/test-scenario-builder'

export default function TestPlanPage() {
  return (
    <TestScenarioBuilder 
      onScenariosGenerated={(scenarios) => {
        console.log('Generated scenarios:', scenarios)
        // Save to database, export as PDF, etc.
      }}
    />
  )
}
```

---

## Example: E-Commerce Checkout

### Input
```
App Type: Web Application
Description: E-commerce platform with checkout flow
Objective: Complete purchase with credit card payment
```

### Generated Output

**Happy Path (HP001):**
- Add product to cart
- Proceed to checkout
- Enter shipping address
- Enter valid credit card (4242 4242 4242 4242)
- Confirm order
- ✓ Success: Order confirmation page, email sent, inventory updated

**Sad Path (SP001): Card Declined**
- Trigger: Use test card 4000000000000002
- Expected: "Payment declined. Please try a different card."
- Recovery: User can change payment method without losing cart
- Priority: CRITICAL

**Edge Case (EC001): 10,000 Items in Cart**
- Test Value: Add 10,000 units of same product
- Expected: System validates against inventory, displays warning if exceeds stock
- Constraint: Inventory system must handle large quantities

**Environmental (ENV001): Network Timeout**
- Simulate: Disable network during payment submission
- Expected: Transaction rolled back, no double charge
- Data Integrity: User charged exactly once, order created exactly once

**Non-Functional (NFT001): Load Test**
- Simulate: 5,000 concurrent checkouts
- Pass Criteria: 95th percentile response time < 5 seconds
- Tools: JMeter, k6

**Chaos (CHAOS001): Double Submit**
- Test: Click "Pay" button twice rapidly
- Expected: Only one payment processed, duplicate prevented
- Resilience: Idempotency key prevents duplicate charges

---

## Best Practices

### 1. Start with Business-Critical Paths
Prioritize tests that would cause the most damage if they failed.

### 2. Think Like Your Users
Consider demographics, tech literacy, accessibility needs.

### 3. Test Error Messages
Ensure errors are in **plain language**, not technical jargon.
- ❌ "Error 500: Internal Server Exception"
- ✅ "We're having trouble processing your payment. Please try again."

### 4. Validate Data Integrity
Especially for financial transactions:
- No double charges
- No data loss
- Consistent state across systems

### 5. Include Accessibility Tests
**WCAG 2.1 AA compliance is not optional.**
- 15% of users have some form of disability
- Screen reader compatibility
- Keyboard navigation
- Color contrast

### 6. Test on Real Devices
Simulators miss real-world issues:
- Actual network conditions
- Device interrupts (calls, notifications)
- Battery constraints
- Touch vs. mouse behavior

---

## Integration with HitlAI

Once test scenarios are defined, you can:

1. **Assign to Human Testers**
   - Match scenarios to testers with relevant demographics
   - Track completion and results

2. **Generate Test Reports**
   - Compare expected vs. actual behavior
   - Identify patterns in failures

3. **Iterate and Refine**
   - Update scenarios based on findings
   - Add new edge cases discovered during testing

---

## Validation Checklist

Before finalizing your test plan, ensure you have:

- [ ] At least 3 happy path scenarios
- [ ] At least 5 sad path scenarios (payment, validation, empty states)
- [ ] At least 5 edge cases (boundaries, limits, extremes)
- [ ] At least 3 environmental tests (connectivity, interrupts, compatibility)
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] Security testing (XSS, CSRF, injection)
- [ ] Load testing (peak concurrent users)
- [ ] At least 2 chaos testing scenarios

---

## FAQ

**Q: Can I export these scenarios?**
A: Yes, scenarios are returned as JSON and can be exported to PDF, Excel, or integrated with test management tools (Jira, TestRail).

**Q: How long does generation take?**
A: Typically 30-60 seconds for a comprehensive test plan.

**Q: Can I customize the generated scenarios?**
A: Absolutely. The generated scenarios are a starting point. You should review, refine, and add domain-specific tests.

**Q: What if my app is too complex for one test plan?**
A: Break it into modules. Generate separate test plans for:
- Authentication flow
- Checkout flow
- Admin dashboard
- etc.

**Q: Do you support API testing scenarios?**
A: Yes! Set `appType: "api"` and describe your endpoints. The system will generate REST/GraphQL test scenarios.

---

## Support

For questions or feature requests, contact: support@hitlai.com
