// ***********************************************
// Custom Cypress Commands for Admin App Testing
// Người thực hiện: Người 3
// ***********************************************

// Login command
Cypress.Commands.add('adminLogin', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/admin/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/admin/dashboard');
  });
});

// Quick login with default admin
Cypress.Commands.add('adminLoginDefault', () => {
  cy.adminLogin(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
});

// API login (faster)
Cypress.Commands.add('apiLogin', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/user/login`,
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Navigate to admin section
Cypress.Commands.add('goToAdminSection', (section) => {
  cy.get(`[data-testid="menu-${section}"]`).click();
  cy.url().should('include', `/admin/${section}`);
});

// Wait for table to load
Cypress.Commands.add('waitForTableLoad', (tableTestId) => {
  cy.get(`[data-testid="${tableTestId}"]`).should('be.visible');
  cy.get(`[data-testid="${tableTestId}"]`).find('tr').should('have.length.greaterThan', 0);
});

// Fill product form
Cypress.Commands.add('fillProductForm', (product) => {
  if (product.name) {
    cy.get('[data-testid="product-name"]').clear().type(product.name);
  }
  if (product.price) {
    cy.get('[data-testid="product-price"]').clear().type(product.price);
  }
  if (product.category) {
    cy.get('[data-testid="product-category"]').select(product.category);
  }
  if (product.stock) {
    cy.get('[data-testid="product-stock"]').clear().type(product.stock);
  }
  if (product.description) {
    cy.get('[data-testid="product-description"]').clear().type(product.description);
  }
});

// Verify toast message
Cypress.Commands.add('verifyToast', (message, type = 'success') => {
  cy.get(`[data-testid="${type}-toast"]`).should('be.visible');
  cy.get(`[data-testid="${type}-toast"]`).should('contain', message);
});

// Confirm dialog action
Cypress.Commands.add('confirmDialog', () => {
  cy.get('[data-testid="confirm-dialog"]').should('be.visible');
  cy.get('[data-testid="confirm-btn"]').click();
});

// Cancel dialog action
Cypress.Commands.add('cancelDialog', () => {
  cy.get('[data-testid="confirm-dialog"]').should('be.visible');
  cy.get('[data-testid="cancel-btn"]').click();
});
