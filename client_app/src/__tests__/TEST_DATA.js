/**
 * TEST DATA FOR 28 TEST CASES
 * Frontend & User Flow Testing
 * 
 * Modules:
 * - User Management (11 cases)
 * - Product Management (12 cases)
 * - Review System (5 cases)
 */

export const TEST_DATA = {
  // ==================== USER MANAGEMENT TEST DATA ====================
  userManagement: {
    // TC-UM-001: Render SignIn form
    signInForm: {
      expectedFields: ['username', 'password'],
      expectedButtons: ['Sign In', 'Submit'],
      expectedLinks: ['Sign Up', 'Forgot Password'],
    },

    // TC-UM-002: Login with valid credentials
    validCredentials: {
      username: 'testuser@gmail.com',
      password: 'Password123!',
      expectedRedirect: '/',
    },

    // TC-UM-003: Login with invalid username
    invalidUsername: {
      username: 'nonexistent@gmail.com',
      password: 'Password123!',
      expectedError: 'User not found',
    },

    // TC-UM-004: Login with incorrect password
    incorrectPassword: {
      username: 'testuser@gmail.com',
      password: 'WrongPassword123!',
      expectedError: 'Incorrect password',
    },

    // TC-UM-005: Empty field validation
    emptyFields: {
      username: '',
      password: '',
      expectedValidationError: true,
    },

    // TC-UM-006: Email format validation
    emailValidation: {
      validEmails: [
        'valid@example.com',
        'user@company.co',
        'test.user@domain.org',
        'user+tag@example.com',
      ],
      invalidEmails: [
        'notanemail',
        'test@',
        '@example.com',
        'test @domain.com',
        'test@domain',
      ],
      emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // TC-UM-007: Render SignUp form
    signUpForm: {
      expectedFields: [
        'username',
        'password',
        'confirmPassword',
        'fullName',
        'phone',
      ],
      expectedValidation: true,
    },

    // TC-UM-008: Register with valid data
    validRegistration: {
      username: 'newuser@gmail.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      fullName: 'Test User',
      phone: '0901234567',
      expectedRedirect: '/signin',
    },

    // TC-UM-009: Password confirmation validation
    passwordConfirmation: {
      testCases: [
        {
          password: 'Pass123!',
          confirmPassword: 'Pass123!',
          shouldMatch: true,
        },
        {
          password: 'Pass123!',
          confirmPassword: 'Different123!',
          shouldMatch: false,
        },
      ],
    },

    // TC-UM-010: Password strength validation
    passwordStrength: {
      weakPasswords: [
        'weak', // Too short
        '123456', // Only numbers
        'onlyletters', // Only lowercase
        'OnlyLetters', // No numbers/special
      ],
      strongPasswords: [
        'Strong123!',
        'VeryStrong@2024',
        'MyPass#456',
        'Test@1234',
      ],
      requirements: {
        minLength: 8,
        hasUpperCase: true,
        hasLowerCase: true,
        hasNumbers: true,
        hasSpecialChar: true,
      },
    },

    // TC-UM-011: Phone number format validation (Vietnam)
    phoneValidation: {
      validPhones: [
        '0901234567',
        '0912345678',
        '0988888888',
        '0977777777',
      ],
      invalidPhones: [
        '123456789', // Too short
        '090123456789', // Too long
        '1901234567', // Doesn't start with 0
        '08123456789', // Wrong format
      ],
      phoneRegex: /^0\d{9}$/,
    },
  },

  // ==================== PRODUCT MANAGEMENT TEST DATA ====================
  productManagement: {
    // Mock products list
    mockProducts: [
      {
        id: 1,
        name: 'Laptop Dell XPS',
        price: 20000000,
        category: 'electronics',
        available: true,
        rating: 4.5,
      },
      {
        id: 2,
        name: 'iPhone 13',
        price: 15000000,
        category: 'electronics',
        available: true,
        rating: 4.8,
      },
      {
        id: 3,
        name: 'Nike Shoes',
        price: 500000,
        category: 'fashion',
        available: true,
        rating: 4.2,
      },
      {
        id: 4,
        name: 'Samsung TV',
        price: 12000000,
        category: 'electronics',
        available: false,
        rating: 4.0,
      },
      {
        id: 5,
        name: 'Adidas Jacket',
        price: 800000,
        category: 'fashion',
        available: true,
        rating: 4.3,
      },
    ],

    // TC-PM-001: Display product list
    productList: {
      minProductsExpected: 1,
      displayFields: ['id', 'name', 'price', 'category', 'available'],
    },

    // TC-PM-002: Search products by name
    searchQueries: [
      { query: 'Laptop', expectedCount: 1, expectedName: 'Laptop Dell XPS' },
      { query: 'Shoes', expectedCount: 1, expectedName: 'Nike Shoes' },
      { query: 'Phone', expectedCount: 1, expectedName: 'iPhone 13' },
      { query: 'NonExistent', expectedCount: 0 },
    ],

    // TC-PM-003: Filter by category
    categoryFilters: [
      { category: 'electronics', expectedCount: 3 },
      { category: 'fashion', expectedCount: 2 },
      { category: 'books', expectedCount: 0 },
    ],

    // TC-PM-004: Filter by price range
    priceFilters: [
      { maxPrice: 1000000, expectedCount: 2 }, // Shoes, Jacket
      { minPrice: 10000000, expectedCount: 2 }, // Laptop, Samsung
      { minPrice: 5000000, maxPrice: 16000000, expectedCount: 1 }, // iPhone
    ],

    // TC-PM-005: Filter by availability
    availabilityFilter: {
      available: true,
      expectedCount: 4,
    },

    // TC-PM-006: Multiple filters combined
    multipleFilters: {
      category: 'electronics',
      maxPrice: 15000000,
      available: true,
      expectedCount: 1,
      expectedProduct: 'iPhone 13',
    },

    // TC-PM-008-012: Pagination
    pagination: {
      itemsPerPage: 10,
      totalPages: 5,
      testPages: [
        { page: 1, shouldHaveItems: true, prevDisabled: true },
        { page: 2, shouldHaveItems: true, nextDisabled: false },
        { page: 5, shouldHaveItems: true, nextDisabled: true },
      ],
    },

    // TC-PM-009: Navigation
    pageNavigation: {
      fromPage: 1,
      toPage: 2,
      expectedFirstItemId: 11,
    },
  },

  // ==================== REVIEW SYSTEM TEST DATA ====================
  reviewSystem: {
    // TC-RS-001: Display reviews
    mockProduct: {
      id: 1,
      name: 'Laptop Dell XPS',
      price: 20000000,
      reviews: [
        {
          id: 1,
          author: 'User1',
          rating: 5,
          comment: 'Great product! Highly recommended.',
          date: '2024-01-01',
        },
        {
          id: 2,
          author: 'User2',
          rating: 4,
          comment: 'Good quality and fast delivery',
          date: '2024-01-02',
        },
      ],
    },

    // TC-RS-002: Average rating calculation
    ratingCalculation: {
      reviews: [
        { rating: 5 },
        { rating: 4 },
        { rating: 4 },
        { rating: 5 },
      ],
      expectedAverage: 4.5,
    },

    // TC-RS-003: Submit new review
    newReview: {
      rating: 4,
      comment: 'Excellent product! Exceeded expectations.',
      author: 'TestUser',
      email: 'test@example.com',
    },

    // TC-RS-004: XSS Prevention test data
    xssAttempts: [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      '<img src=x onerror="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
    ],
    xssExpectation: {
      shouldNotContain: ['<script>', '<img', 'onerror', 'onload'],
      shouldEscape: ['<', '>', '"', "'"],
    },

    // TC-RS-005: Review content validation
    reviewValidation: {
      minLength: 10,
      maxLength: 500,
      validComments: [
        'This is a valid review with sufficient length to be accepted',
        'Good product, fast shipping, highly recommended!',
        'Excellent quality and great customer service',
      ],
      invalidComments: [
        'Too short', // Less than 10
        'A'.repeat(600), // More than 500
        '', // Empty
      ],
    },
  },

  // ==================== UTILITY FUNCTIONS ====================
  utilities: {
    // Email validation
    validateEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

    // Password validation
    validatePassword: (pwd) => {
      return (
        pwd.length >= 8 &&
        /[A-Z]/.test(pwd) &&
        /[a-z]/.test(pwd) &&
        /\d/.test(pwd) &&
        /[!@#$%^&*]/.test(pwd)
      );
    },

    // Phone validation (Vietnam)
    validatePhone: (phone) => /^0\d{9}$/.test(phone),

    // XSS Sanitization
    sanitizeHTML: (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    },

    // Review content length validation
    validateReviewLength: (comment, minLen = 10, maxLen = 500) => {
      return comment.length >= minLen && comment.length <= maxLen;
    },

    // Calculate average rating
    calculateAverageRating: (reviews) => {
      if (reviews.length === 0) return 0;
      return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    },

    // Filter products
    filterProducts: (products, filters) => {
      return products.filter((p) => {
        if (filters.category && p.category !== filters.category) return false;
        if (
          filters.minPrice &&
          p.price < filters.minPrice
        )
          return false;
        if (
          filters.maxPrice &&
          p.price > filters.maxPrice
        )
          return false;
        if (filters.available !== undefined && p.available !== filters.available)
          return false;
        if (
          filters.searchQuery &&
          !p.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
          return false;
        return true;
      });
    },
  },

  // ==================== TEST EXECUTION SUMMARY ====================
  summary: {
    totalTestCases: 28,
    userManagementTests: 11,
    productManagementTests: 12,
    reviewSystemTests: 5,
    testDate: '2024-12-16',
    environment: 'localhost:3000',
    browsers: ['Chrome'],
  },
};

export default TEST_DATA;
