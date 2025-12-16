/**
 * ADMIN CRUD E2E TEST CASES
 * Người thực hiện: Người 3
 * Ngày tạo: 16/12/2024
 * Mô tả: Cypress E2E tests cho Admin Panel - CRUD operations
 */

// ========================================
// TEST DATA
// ========================================
const TEST_DATA = {
  adminCredentials: {
    email: 'vinh@gmail.com',
    password: '1234'
  },
  staffCredentials: {
    email: 'tien@gmail.com',
    password: '1234'
  },
  newProduct: {
    name: 'Áo khoác test E2E',
    price: '550000',
    category: 'Áo khoác',
    stock: '25',
    description: 'Sản phẩm test từ Cypress E2E'
  },
  updateProduct: {
    name: 'Áo khoác test UPDATED',
    price: '650000',
    stock: '50'
  }
};

// ========================================
// ADMIN LOGIN TESTS
// ========================================
describe('Admin Authentication Tests', () => {
  
  beforeEach(() => {
    cy.visit('/admin/login');
  });

  // TC-E2E-001: Đăng nhập admin thành công
  it('TC-E2E-001: Should login successfully with valid admin credentials', () => {
    cy.get('[name="email"]').type(TEST_DATA.adminCredentials.email);
    cy.get('[name="password"]').type(TEST_DATA.adminCredentials.password);
    cy.get('[type="submit"]').click();
    
    cy.url().should('include', '/user');
    cy.contains('Users').should('be.visible');
    cy.get('.page-wrapper').should('exist');
  });

  // TC-E2E-002: Đăng nhập với thông tin sai
  it('TC-E2E-002: Should show error with invalid credentials', () => {
    cy.get('[name="email"]').type('wrong@email.com');
    cy.get('[name="password"]').type('wrongpassword');
    cy.get('[type="submit"]').click();
    
    cy.contains(/email|password|đăng nhập|sai/i).should('be.visible');
  });

  // TC-E2E-003: Đăng nhập với email trống
  it('TC-E2E-003: Should show validation error for empty email', () => {
    cy.get('[name="password"]').type('somepassword');
    cy.get('[type="submit"]').click();
    
    cy.contains('Email không được để trống').should('be.visible');
  });
});

// ========================================
// PRODUCT CRUD TESTS
// ========================================
describe('Product CRUD E2E Tests', () => {
  
  beforeEach(() => {
    // Login as admin before each test
    cy.visit('/admin/login');
    cy.get('[name="email"]').type(TEST_DATA.staffCredentials.email);
    cy.get('[name="password"]').type(TEST_DATA.staffCredentials.password);
    cy.get('[type="submit"]').click();
    cy.url().should('include', '/customer');
  });

  // TC-E2E-004: Xem danh sách sản phẩm
  it('TC-E2E-004: Should display product list', () => {
    cy.contains('a', 'Product').click();
    cy.url().should('include', '/product');
    
    cy.get('table.table').should('be.visible');
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  // TC-E2E-005: Tạo sản phẩm mới thành công
  it('TC-E2E-005: Should create new product successfully', () => {
    cy.contains('a', 'Product').click();
    cy.contains('a', 'New create').click();
    
    // Fill form
    cy.get('[name="name"]').type('Test Product');
    cy.get('[name="price"]').type('100000');
    cy.get('[name="categories"]').select('Electronics'); // Chọn category
    cy.get('[name="file"]').attachFile('test-image.jpg'); // Nếu có
    cy.get('[name="description"]').type('Test description');
    
    cy.get('[type="submit"]').click();
    
    // Verify success
    cy.contains(/thêm thành công/i).should('be.visible');
  });

  // TC-E2E-006: Tạo sản phẩm với dữ liệu không hợp lệ
  it('TC-E2E-006: Should show validation errors for invalid product data', () => {
    cy.contains('a', 'Product').click();
    cy.contains('a', 'New create').click();
    
    // Submit empty form
    cy.get('[type="submit"]').click();
    
    // Verify validation errors
    cy.get('.form-text.text-danger').should('have.length.greaterThan', 0);
  });

  // TC-E2E-007: Cập nhật sản phẩm
  it('TC-E2E-007: Should update product successfully', () => {
    cy.contains('a', 'Product').click();
    
    // Click edit on first product
    cy.get('tbody tr').first().contains('Update').click();
    cy.url().should('include', '/product/update');
    
    // Update fields
    cy.get('[name="name"]').clear().type('Updated Product');
    cy.get('[type="submit"]').click();
    cy.contains(/update thành công/i).should('be.visible');
  });

  // TC-E2E-008: Xóa sản phẩm
  it('TC-E2E-008: Should delete product successfully', () => {
    cy.contains('a', 'Product').click();
    
    // Get initial count
    cy.get('tbody tr').then($rows => {
      const initialCount = $rows.length;
      
      // Click delete on first product
      cy.get('tbody tr').first().contains('Delete').click();
      
      // Confirm deletion
      cy.get('[data-testid="confirm-delete-btn"]').click();
      
      // Wait for reload
      cy.wait(1000);
      cy.get('tbody tr').should('have.length', initialCount - 1);
    });
  });

  // TC-E2E-009: Tìm kiếm sản phẩm
  it('TC-E2E-009: Should search products correctly', () => {
    cy.contains('a', 'Product').click();
    
    // ✅ Tìm search input theo placeholder hoặc label
    cy.get('input[placeholder*="Search"], input[type="search"]').type('Áo');
  
    // Kiểm tra kết quả
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });
});

// ========================================
// ORDER MANAGEMENT TESTS
// ========================================
describe('Order Management E2E Tests', () => {
  
  beforeEach(() => {
    cy.visit('/admin/login');
    cy.get('[name="email"]').type(TEST_DATA.staffCredentials.email);
    cy.get('[name="password"]').type(TEST_DATA.staffCredentials.password);
    cy.get('[type="submit"]').click();
    cy.url().should('include', '/customer');
  });

  // TC-E2E-010: Xem danh sách đơn hàng
  it('TC-E2E-010: Should display order list', () => {
    cy.contains('a', 'Order').click();
    cy.url().should('include', '/order');
    
    cy.get('table.table').should('be.visible');
  });

  // TC-E2E-011: Xác nhận đơn hàng
  it('TC-E2E-011: Should confirm pending order', () => {
    cy.contains('a', 'Order').click();
    
    // Filter pending orders
    cy.get('[data-testid="status-filter"]').select('pending');
    
    // Confirm first pending order
    cy.get('[data-testid="confirm-order-btn"]').first().click();
    
    // Verify
    cy.get('[data-testid="success-toast"]').should('contain', 'Xác nhận đơn hàng thành công');
  });

  // TC-E2E-012: Hủy đơn hàng
  it('TC-E2E-012: Should cancel order', () => {
    cy.get('[data-testid="menu-orders"]').click();
    
    // Filter pending orders
    cy.get('[data-testid="status-filter"]').select('pending');
    
    // Cancel first order
    cy.get('[data-testid="cancel-order-btn"]').first().click();
    cy.get('[data-testid="cancel-reason"]').type('Khách yêu cầu hủy');
    cy.get('[data-testid="confirm-cancel-btn"]').click();
    
    // Verify
    cy.get('[data-testid="success-toast"]').should('contain', 'Hủy đơn hàng thành công');
  });

  // TC-E2E-013: Cập nhật trạng thái giao hàng
  it('TC-E2E-013: Should update order to shipping status', () => {
    cy.get('[data-testid="menu-orders"]').click();
    
    // Filter confirmed orders
    cy.get('[data-testid="status-filter"]').select('confirmed');
    
    // Ship first order
    cy.get('[data-testid="ship-order-btn"]').first().click();
    
    // Verify
    cy.get('[data-testid="success-toast"]').should('contain', 'Cập nhật trạng thái thành công');
  });

  // TC-E2E-014: Xem chi tiết đơn hàng
  it('TC-E2E-014: Should view order details', () => {
    cy.get('[data-testid="menu-orders"]').click();
    
    // Click view details
    cy.get('[data-testid="view-order-btn"]').first().click();
    
    // Verify order detail modal/page
    cy.get('[data-testid="order-detail"]').should('be.visible');
    cy.get('[data-testid="order-products"]').should('be.visible');
    cy.get('[data-testid="order-total"]').should('be.visible');
  });
});

// ========================================
// PERMISSION TESTS
// ========================================
describe('Admin Permission E2E Tests', () => {

  // TC-E2E-015: Staff không thể xóa sản phẩm
  it('TC-E2E-015: Staff should not have delete permission', () => {
    // Login as staff
    cy.visit('/admin/login');
    cy.get('[data-testid="email-input"]').type(TEST_DATA.staffCredentials.email);
    cy.get('[data-testid="password-input"]').type(TEST_DATA.staffCredentials.password);
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="menu-products"]').click();
    
    // Delete button should not be visible or disabled
    cy.get('[data-testid="delete-product-btn"]').should('not.exist');
  });

  // TC-E2E-016: Staff không thể tạo sản phẩm mới
  it('TC-E2E-016: Staff should not have create permission', () => {
    cy.visit('/admin/login');
    cy.get('[data-testid="email-input"]').type(TEST_DATA.staffCredentials.email);
    cy.get('[data-testid="password-input"]').type(TEST_DATA.staffCredentials.password);
    cy.get('[data-testid="login-button"]').click();
    
    cy.get('[data-testid="menu-products"]').click();
    
    // Add button should not be visible
    cy.get('[data-testid="add-product-btn"]').should('not.exist');
  });

  // TC-E2E-017: Redirect về login khi chưa đăng nhập
  it('TC-E2E-017: Should redirect to login when not authenticated', () => {
    // Try to access admin page directly
    cy.visit('/product');
    
    // Should redirect to login
    cy.url().should('include', '/admin/login');
  });

  // TC-E2E-018: Đăng xuất
  it('TC-E2E-018: Should logout successfully', () => {
    cy.visit('/admin/login');
    cy.get('[name="email"]').type(TEST_DATA.adminCredentials.email);
    cy.get('[name="password"]').type(TEST_DATA.adminCredentials.password);
    cy.get('[type="submit"]').click();
    
    // Logout
    cy.get('[type="button"]').contains('Logout').click();
    
    // Should redirect to login
    cy.url().should('include', '/admin/login');
    
    // Try to access protected page
    cy.visit('/user');
    cy.url().should('include', '/admin/login');
  });
});

// ========================================
// CUSTOM COMMANDS
// ========================================
Cypress.Commands.add('adminLogin', (email, password) => {
  cy.visit('/admin/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/admin/dashboard');
});
