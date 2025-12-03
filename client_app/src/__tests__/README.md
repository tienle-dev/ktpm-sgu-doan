# Cấu Trúc Unit Test - Client App

## 📁 Cấu trúc thư mục

```
src/
├── __tests__/                    # Thư mục chứa tất cả test files
│   ├── components/               # Test cho các components
│   │   ├── Auth/
│   │   │   ├── SignIn.test.js
│   │   │   └── SignUp.test.js
│   │   ├── Cart/
│   │   │   └── Cart.test.js
│   │   └── ...
│   ├── api/                      # Test cho API calls
│   │   ├── User.test.js
│   │   └── CartAPI.test.js
│   ├── redux/                    # Test cho Redux actions/reducers
│   │   ├── actions.test.js
│   │   └── reducers.test.js
│   ├── utils/                    # Test cho utility functions
│   │   └── helpers.test.js
│   └── __mocks__/                # Mock files
│       ├── axiosClient.js
│       └── fileMock.js
├── setupTests.js                 # Cấu hình Jest
└── ...
```

## 🚀 Các lệnh chạy test

```bash
# Chạy tất cả test
npm test

# Chạy test một lần (không watch)
npm test -- --watchAll=false

# Chạy test với coverage
npm test -- --coverage --watchAll=false

# Chạy test cho file cụ thể
npm test -- SignIn.test.js

# Chạy test với verbose output
npm test -- --verbose
```

## 📝 Quy tắc đặt tên

- File test: `ComponentName.test.js` hoặc `ComponentName.spec.js`
- Test suite: `describe('ComponentName', () => {})`
- Test case: `test('should do something', () => {})` hoặc `it('should do something', () => {})`

## ✅ Checklist test coverage

- [ ] Components render đúng
- [ ] User interactions (click, input, submit)
- [ ] API calls
- [ ] Error handling
- [ ] Redux state changes
- [ ] Navigation/routing
