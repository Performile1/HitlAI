# Test Data for AI Form Filling

This document describes the test data available for AI agents to use when filling forms during testing.

## Demo Login Credentials

### Company Account
- **Email:** `demo@company.com`
- **Password:** `demo123`
- **Use Case:** Testing company dashboard, creating test requests, viewing reports

### Tester Account
- **Email:** `demo@tester.com`
- **Password:** `demo123`
- **Use Case:** Testing tester dashboard, accepting tests, submitting results

### Admin Account
- **Email:** `admin@hitlai.com`
- **Password:** `admin123`
- **Use Case:** Platform administration (internal use only)

## Test User Profiles

AI agents can use these profiles for registration and form filling:

```javascript
{
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0100',
  dateOfBirth: '1990-01-15',
  username: 'johndoe',
  password: 'TestPass123!'
}
```

Additional profiles available in `config/testData.ts`

## Test Credit Cards (Stripe Test Cards)

### Always Succeeds
- **Visa:** `4242 4242 4242 4242`
- **Mastercard:** `5555 5555 5555 4444`
- **Amex:** `3782 822463 10005`
- **Expiry:** `12/25`
- **CVC:** `123`

### Always Declines
- **Visa:** `4000 0000 0000 0002`
- **Expiry:** `12/25`
- **CVC:** `321`

## Test Addresses

```javascript
{
  street: '123 Main Street',
  street2: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'United States'
}
```

## Test Coupon Codes

- `WELCOME10` - 10% off first purchase
- `SAVE20` - 20% off orders over $100
- `FREESHIP` - Free shipping
- `TEST50` - 50% off for testing

## Test Company Information

```javascript
{
  name: 'Acme Corporation',
  website: 'https://acme-corp.example.com',
  industry: 'Technology',
  size: '50-200',
  taxId: '12-3456789',
  phone: '+1-555-0200'
}
```

## Usage in AI Testing

### Importing Test Data

```typescript
import TEST_DATA, { getRandomUser, getRandomCreditCard } from '@/config/testData';

// Get a random user
const user = getRandomUser();

// Get a random credit card
const card = getRandomCreditCard();

// Access demo credentials
const demoCompany = TEST_DATA.demoAccounts.company;
```

### AI Agent Instructions

When testing forms, AI agents should:

1. **Login Forms:** Use demo credentials from `TEST_DATA.demoAccounts`
2. **Registration Forms:** Use random users from `TEST_DATA.users`
3. **Payment Forms:** Use Stripe test cards from `TEST_DATA.creditCards`
4. **Address Forms:** Use addresses from `TEST_DATA.addresses`
5. **Coupon Fields:** Try codes from `TEST_DATA.coupons`
6. **Search Fields:** Use queries from `TEST_DATA.searchQueries`

### Example AI Testing Workflow

```typescript
// 1. Login with demo account
await fillForm({
  email: TEST_DATA.demoAccounts.company.email,
  password: TEST_DATA.demoAccounts.company.password
});

// 2. Create a test request
await fillForm({
  title: 'E-commerce Test',
  url: 'https://example.com',
  description: TEST_DATA.messages[0]
});

// 3. Test payment flow
const card = getRandomCreditCard();
await fillForm({
  cardNumber: card.number,
  expiry: card.expiry,
  cvc: card.cvc,
  name: card.name
});

// 4. Apply coupon
await fillCouponField(TEST_DATA.coupons[0].code);
```

## Security Notes

- All test data is **fake** and for testing purposes only
- Credit card numbers are official Stripe test cards
- Do not use real personal information in tests
- Demo accounts have limited permissions
- Test data is reset periodically

## Adding New Test Data

To add new test data, edit `config/testData.ts`:

```typescript
export const TEST_DATA = {
  // Add your new test data here
  newCategory: [
    { /* data */ }
  ]
};
```

## Database Seeding

Demo accounts are created via Supabase migration:
- Migration file: `supabase/migrations/20260114000000_create_demo_accounts.sql`
- Run: `npm run supabase:migrate` to apply

## Support

For issues with test data or demo accounts, contact the development team.
