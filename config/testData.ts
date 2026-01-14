/**
 * Test Data Configuration for AI Testing
 * This file contains fake data that AI agents can use to fill forms during testing
 */

export const TEST_DATA = {
  // Demo Login Credentials
  demoAccounts: {
    company: {
      email: 'demo@company.com',
      password: 'demo123',
      name: 'Demo Company User',
      company: 'Demo Corporation'
    },
    tester: {
      email: 'demo@tester.com',
      password: 'demo123',
      name: 'Demo Tester',
      skills: ['UI/UX Testing', 'Accessibility', 'Mobile Testing']
    },
    admin: {
      email: 'admin@hitlai.com',
      password: 'admin123',
      name: 'Admin User'
    }
  },

  // Test User Profiles
  users: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0100',
      dateOfBirth: '1990-01-15',
      username: 'johndoe',
      password: 'TestPass123!'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0101',
      dateOfBirth: '1985-05-20',
      username: 'janesmith',
      password: 'TestPass456!'
    },
    {
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'michael.j@example.com',
      phone: '+1-555-0102',
      dateOfBirth: '1992-11-30',
      username: 'mikej',
      password: 'TestPass789!'
    }
  ],

  // Test Credit Cards (Stripe Test Cards)
  creditCards: [
    {
      number: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'John Doe',
      type: 'Visa',
      description: 'Stripe test card - always succeeds'
    },
    {
      number: '5555555555554444',
      expiry: '12/25',
      cvc: '456',
      name: 'Jane Smith',
      type: 'Mastercard',
      description: 'Stripe test card - always succeeds'
    },
    {
      number: '378282246310005',
      expiry: '12/25',
      cvc: '789',
      name: 'Michael Johnson',
      type: 'American Express',
      description: 'Stripe test card - always succeeds'
    },
    {
      number: '4000000000000002',
      expiry: '12/25',
      cvc: '321',
      name: 'Test Decline',
      type: 'Visa',
      description: 'Stripe test card - always declines'
    }
  ],

  // Test Addresses
  addresses: [
    {
      street: '123 Main Street',
      street2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    {
      street: '456 Oak Avenue',
      street2: '',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      country: 'United States'
    },
    {
      street: '789 Pine Road',
      street2: 'Suite 200',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'United States'
    }
  ],

  // Test Company Information
  companies: [
    {
      name: 'Acme Corporation',
      website: 'https://acme-corp.example.com',
      industry: 'Technology',
      size: '50-200',
      taxId: '12-3456789',
      phone: '+1-555-0200'
    },
    {
      name: 'TechStart Inc',
      website: 'https://techstart.example.com',
      industry: 'Software',
      size: '10-50',
      taxId: '98-7654321',
      phone: '+1-555-0201'
    }
  ],

  // Test Coupon Codes
  coupons: [
    {
      code: 'WELCOME10',
      discount: '10%',
      description: '10% off first purchase'
    },
    {
      code: 'SAVE20',
      discount: '20%',
      description: '20% off orders over $100'
    },
    {
      code: 'FREESHIP',
      discount: 'Free Shipping',
      description: 'Free shipping on all orders'
    },
    {
      code: 'TEST50',
      discount: '50%',
      description: '50% off for testing'
    }
  ],

  // Test Search Queries
  searchQueries: [
    'laptop',
    'wireless headphones',
    'running shoes',
    'coffee maker',
    'smartphone case',
    'desk chair',
    'water bottle',
    'backpack'
  ],

  // Test Comments/Reviews
  comments: [
    'This is a great product! Highly recommend it.',
    'Good quality but a bit expensive.',
    'Fast shipping and excellent customer service.',
    'Not what I expected, but still useful.',
    'Amazing! Exceeded my expectations.'
  ],

  // Test URLs for Testing
  testUrls: [
    'https://example.com',
    'https://google.com',
    'https://github.com',
    'https://stackoverflow.com'
  ],

  // Social Media Handles
  socialMedia: {
    twitter: '@testuser',
    facebook: 'testuser',
    instagram: '@test_user',
    linkedin: 'test-user'
  },

  // Test File Names (for upload testing)
  fileNames: [
    'test-document.pdf',
    'sample-image.jpg',
    'data-export.csv',
    'presentation.pptx',
    'spreadsheet.xlsx'
  ],

  // Test Dates
  dates: {
    past: '2020-01-01',
    recent: '2024-01-01',
    future: '2026-12-31',
    today: new Date().toISOString().split('T')[0]
  },

  // Test Quantities/Numbers
  quantities: [1, 2, 5, 10, 100],

  // Test Feedback/Messages
  messages: [
    'I found a bug on the checkout page.',
    'The navigation menu is not working properly.',
    'Great user experience overall!',
    'The form validation needs improvement.',
    'Loading times are too slow.'
  ]
};

// Helper function to get random item from array
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random user
export function getRandomUser() {
  return getRandomItem(TEST_DATA.users);
}

// Helper function to get random credit card
export function getRandomCreditCard() {
  return getRandomItem(TEST_DATA.creditCards);
}

// Helper function to get random address
export function getRandomAddress() {
  return getRandomItem(TEST_DATA.addresses);
}

// Export for AI agents to use
export default TEST_DATA;
