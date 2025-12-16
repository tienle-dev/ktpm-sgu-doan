# Test Suite Documentation
## Frontend & User Flow Testing (28 Test Cases)

Tài liệu này hướng dẫn cách chạy và quản lý các test case cho dự án KTPM-SGU-DOAN.

---

## 📋 Tổng Quan Test Cases

| Module | Số Test Cases | Chi tiết |
|--------|--------------|---------|
| **User Management** | 11 | Login, Register, Profile, Validation |
| **Product Management** | 12 | Product List, Search, Filter, Pagination |
| **Review System** | 5 | Comment, Rating, XSS Prevention |
| **TOTAL** | **28** | |

---

## 🛠️ Công Cụ & Công Nghệ

- **Unit & Integration Testing**: Jest + React Testing Library
- **E2E Testing**: Cypress
- **Chrome DevTools**: Manual testing support
- **Node.js**: Runtime environment

---

## 📁 Cấu Trúc File Test

```
client_app/
├── cypress/
│   ├── e2e/
│   │   ├── user-flow.cy.js           # 11 test cases cho User Management
│   │   └── product-search.cy.js      # 12 + 5 test cases cho Product & Review
│   ├── screenshots/                  # Screenshots từ failed tests
│   ├── videos/                       # Video recordings
│   └── config.js
│
├── src/
│   └── __tests__/
│       ├── components/
│       │   ├── Auth.test.js          # Jest tests cho Auth (SignIn/SignUp)
│       │   ├── ProductList.test.js   # Jest tests cho Product Management
│       │   └── ...
│       ├── TEST_RESULT.js            # Test result tracking file
│       └── README.md
│
└── package.json
```

---

## 🚀 Cài Đặt Và Chạy Test

### 1. Cài Đặt Dependencies

```bash
cd client_app

# Cài đặt npm packages
npm install

# Cài đặt Cypress (nếu chưa có)
npm install --save-dev cypress

# Cài đặt Jest & React Testing Library (nếu chưa có)
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### 2. Chạy Jest Unit Tests

```bash
# Chạy tất cả Jest tests
npm test

# Chạy tests không watch mode
npm test -- --watchAll=false

# Chạy tests với coverage report
npm test -- --coverage --watchAll=false

# Chạy specific test file
npm test -- Auth.test.js
npm test -- ProductList.test.js

# Run test với verbose output
npm test -- --verbose
```

### 3. Chạy Cypress E2E Tests

```bash
# Mở Cypress Test Runner (UI Mode)
npx cypress open

# Chạy tất cả E2E tests (headless mode)
npx cypress run

# Chạy specific test file
npx cypress run --spec "cypress/e2e/user-flow.cy.js"
npx cypress run --spec "cypress/e2e/product-search.cy.js"

# Chạy tests trên browser cụ thể
npx cypress run --browser chrome
npx cypress run --browser firefox

# Generate test report
npx cypress run --reporter json --reporter-options "reportDir=cypress/results"
```

---

## 📊 Test Cases Chi Tiết

### USER MANAGEMENT (11 Test Cases)

#### TC-UM-001 to TC-UM-011: Login & Registration Flow

**File**: `cypress/e2e/user-flow.cy.js` & `src/__tests__/components/Auth.test.js`

| Test ID | Test Case | Data | Expected Result |
|---------|-----------|------|-----------------|
| TC-UM-001 | Render SignIn form | - | Form displays with inputs |
| TC-UM-002 | Login valid credentials | email, password | Redirect to home |
| TC-UM-003 | Login invalid username | wrong_email | Error message |
| TC-UM-004 | Login wrong password | correct_email, wrong_pwd | Error message |
| TC-UM-005 | Empty field validation | empty fields | Validation errors |
| TC-UM-006 | Email format validation | invalid emails | Validation fails |
| TC-UM-007 | Render SignUp form | - | Form displays |
| TC-UM-008 | Register valid data | name, email, phone, pwd | Success redirect |
| TC-UM-009 | Password confirm match | pwd1, pwd2 | Error if mismatch |
| TC-UM-010 | Password strength | weak/strong passwords | Strong pwd only |
| TC-UM-011 | Phone format validation | VN phone numbers | Valid format check |

### PRODUCT MANAGEMENT (12 Test Cases)

#### TC-PM-001 to TC-PM-012: Product List, Search, Filter, Pagination

**File**: `cypress/e2e/product-search.cy.js` & `src/__tests__/components/ProductList.test.js`

| Test ID | Test Case | Data | Expected Result |
|---------|-----------|------|-----------------|
| TC-PM-001 | Display product list | - | List renders with products |
| TC-PM-002 | Search by name | "Laptop" | Only matching products |
| TC-PM-003 | Filter by category | "electronics" | Category filtered |
| TC-PM-004 | Filter by price range | 1M - 20M | Price filtered |
| TC-PM-005 | Filter by availability | available=true | Only available shown |
| TC-PM-006 | Multiple filters | category+price+available | All filters applied |
| TC-PM-007 | Clear filters | - | All products shown |
| TC-PM-008 | Items per page | 10 items | 10 items displayed |
| TC-PM-009 | Next page | page 1 → 2 | Navigate to page 2 |
| TC-PM-010 | Previous page | page 2 → 1 | Navigate to page 1 |
| TC-PM-011 | Disable prev (page 1) | page=1 | Prev button disabled |
| TC-PM-012 | Disable next (last page) | last page | Next button disabled |

### REVIEW SYSTEM (5 Test Cases)

#### TC-RS-001 to TC-RS-005: Reviews, Ratings, XSS Prevention

**File**: `cypress/e2e/product-search.cy.js` & `src/__tests__/components/ProductList.test.js`

| Test ID | Test Case | Data | Expected Result |
|---------|-----------|------|-----------------|
| TC-RS-001 | Display reviews | - | All reviews shown |
| TC-RS-002 | Average rating | reviews list | Correct average calc |
| TC-RS-003 | Submit review | rating, comment | Review posted |
| TC-RS-004 | XSS prevention | `<script>alert</script>` | Script sanitized |
| TC-RS-005 | Content length | 10-500 chars | Length validated |

---

## 📝 Test Data & Examples

### Valid Test Data

```javascript
// User Management
const validUser = {
  username: 'testuser@gmail.com',
  password: 'Password123!',
  phone: '0901234567'
};

// Product Search
const testFilters = {
  category: 'electronics',
  minPrice: 1000000,
  maxPrice: 20000000,
  available: true
};

// Review
const testReview = {
  rating: 5,
  comment: 'Excellent product! Highly recommended.',
  author: 'Test User'
};
```

### Invalid Test Data (for validation tests)

```javascript
// Invalid emails
['notanemail', 'test@', '@example.com', 'test @domain.com']

// Weak passwords
['weak', '123456', 'onlyletters', 'NoSpecialChar1']

// Invalid phone numbers (Vietnam)
['123456789', '090123456789', '1234567890']

// XSS attempts
['<script>alert("XSS")</script>', '"><img src=x onerror="alert()">']
```

---

## 📈 Test Result Tracking

### Cập Nhật Test Result

**File**: `src/__tests__/TEST_RESULT.js`

```javascript
import TEST_RESULTS from './TEST_RESULT.js';

// Cập nhật kết quả test
TEST_RESULTS.updateTestResult('TC-UM-001', {
  status: 'PASSED',           // PASSED, FAILED, BLOCKED, NOT_EXECUTED
  actualResult: 'Form rendered successfully',
  executedBy: 'QA Team',
  remarks: 'All fields visible and functional'
});

// Xem summary
console.log(TEST_RESULTS.summary);

// Export dữ liệu
const csvData = TEST_RESULTS.exportCSV();
const jsonData = TEST_RESULTS.exportJSON();
```

### Test Status

- **PASSED**: Test hoàn thành thành công
- **FAILED**: Test thất bại
- **BLOCKED**: Không thể chạy test (dependency, environment)
- **NOT_EXECUTED**: Test chưa chạy

---

## 📊 Xuất Test Report

### Export to Excel

```javascript
// 1. Export JSON
const jsonReport = TEST_RESULTS.exportJSON();
fs.writeFileSync('test-report.json', jsonReport);

// 2. Export CSV (dùng Excel mở trực tiếp)
const csvReport = TEST_RESULTS.exportCSV();
fs.writeFileSync('test-report.csv', csvReport);

// 3. Custom Excel export (sử dụng xlsx package)
npm install --save-dev xlsx

const XLSX = require('xlsx');
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(TEST_RESULTS.userManagement);
XLSX.utils.book_append_sheet(workbook, worksheet, 'User Management');
XLSX.writeFile(workbook, 'test-report.xlsx');
```

---

## 🔍 Debug & Troubleshooting

### Jest Issues

```bash
# Clear Jest cache
npm test -- --clearCache

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand TestFile.test.js

# Show more details
npm test -- --verbose --no-coverage
```

### Cypress Issues

```bash
# Run with debug logs
DEBUG=cypress:* npx cypress run

# Headless with debug
npx cypress run --headed

# Check Cypress version
npx cypress --version

# Verify Cypress installation
npx cypress verify
```

### Common Issues

| Issue | Solution |
|-------|----------|
| **Port 3000 occupied** | `lsof -i :3000` hoặc change BASE_URL |
| **Timeout errors** | Tăng timeout trong cypress.config.js |
| **Element not found** | Kiểm tra data-testid selectors |
| **Login token missing** | Setup localStorage/cookies in tests |
| **API calls failing** | Verify API endpoints, check CORS |

---

## 🎯 Best Practices

### For Jest Tests
- ✅ Use semantic test IDs (`data-testid`)
- ✅ Mock external API calls
- ✅ Test edge cases and error scenarios
- ✅ Keep tests isolated and independent
- ✅ Use meaningful test descriptions

### For Cypress Tests
- ✅ Use page objects pattern for maintainability
- ✅ Set proper wait times for async operations
- ✅ Clear app state between tests
- ✅ Use cy.intercept() to mock API responses
- ✅ Avoid hard-coded waits (use cy.wait())

### For Test Data
- ✅ Use realistic test data
- ✅ Create separate test data files
- ✅ Use factories for complex objects
- ✅ Clean up test data after execution
- ✅ Document expected vs actual results

---

## 📚 Tài Liệu Tham Khảo

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)

---

## 👥 Contact & Support

For issues or questions about tests:
- **QA Lead**: [Name]
- **Email**: [email]
- **Slack**: [channel]

---

## 📄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-16 | Initial test suite creation |

---

**Last Updated**: December 16, 2024
