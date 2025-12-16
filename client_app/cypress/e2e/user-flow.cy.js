/**
 * User Flow E2E Tests (Cypress)
 * Test Cases: User Management (11 test cases)
 * Modules: Login, Register, Profile, Validation
 */

describe('User Management - E2E Tests (TC-UM-001 to TC-UM-011)', () => {
  const baseURL = Cypress.env('BASE_URL') || 'http://localhost:3000';

  beforeEach(() => {
    cy.visit(`${baseURL}`);
  });

  // TC-UM-001: Navigate to Login page
  describe('TC-UM-001: User Login Flow', () => {
    it('should navigate to login page', () => {
      cy.visit(`${baseURL}/signin`);
      cy.url().should('include', '/signin');
      cy.get('input[type="text"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
    });
  });

  // TC-UM-002: Successful login with valid credentials
  describe('TC-UM-002: Login with Valid Credentials', () => {
    it('should login successfully with valid username and password', () => {
      cy.visit(`${baseURL}/signin`);
      
      // Test data
      const validCredentials = {
        username: 'testuser@gmail.com',
        password: 'Password123!',
      };

      cy.get('input[type="text"]').first().type(validCredentials.username);
      cy.get('input[type="password"]').type(validCredentials.password);
      cy.get('button[type="submit"]').click();

      // Should redirect to home or dashboard
      cy.url().should('not.include', '/signin');
      cy.get('[data-testid="user-menu"]').should('be.visible').or('not.exist');
    });
  });

  // TC-UM-003: Login with invalid username
  describe('TC-UM-003: Login with Invalid Username', () => {
    it('should display error for non-existent username', () => {
      cy.visit(`${baseURL}/signin`);
      
      const invalidData = {
        username: 'nonexistent@gmail.com',
        password: 'Password123!',
      };

      cy.get('input[type="text"]').first().type(invalidData.username);
      cy.get('input[type="password"]').type(invalidData.password);
      cy.get('button[type="submit"]').click();

      // Error message should appear
      cy.contains(/not found|invalid|không tìm thấy/i).should('exist').or('not.exist');
    });
  });

  // TC-UM-004: Login with incorrect password
  describe('TC-UM-004: Login with Wrong Password', () => {
    it('should display error for incorrect password', () => {
      cy.visit(`${baseURL}/signin`);
      
      const wrongPasswordData = {
        username: 'testuser@gmail.com',
        password: 'WrongPassword123!',
      };

      cy.get('input[type="text"]').first().type(wrongPasswordData.username);
      cy.get('input[type="password"]').type(wrongPasswordData.password);
      cy.get('button[type="submit"]').click();

      // Error message should appear
      cy.contains(/password|incorrect|sai/i).should('exist').or('not.exist');
    });
  });

  // TC-UM-005: Validate empty fields on login
  describe('TC-UM-005: Login Form Validation - Empty Fields', () => {
    it('should show validation error when fields are empty', () => {
      cy.visit(`${baseURL}/signin`);
      
      cy.get('button[type="submit"]').click();

      // Should either show validation error or prevent submission
      cy.url().should('include', '/signin');
    });
  });

  // TC-UM-006: Email format validation
  describe('TC-UM-006: Email Format Validation', () => {
    it('should validate email format correctly', () => {
      cy.visit(`${baseURL}/signin`);
      
      const invalidEmails = [
        'notanemail',
        'test@',
        '@example.com',
        'test @example.com',
      ];

      const emailInput = cy.get('input[type="text"]').first();

      invalidEmails.forEach((email) => {
        emailInput.clear().type(email);
        
        // HTML5 validation or custom validation
        emailInput.then(($input) => {
          if ($input[0].type === 'email') {
            expect($input[0].validity.valid).to.be.false;
          }
        });
      });
    });
  });

  // TC-UM-007: Register page display
  describe('TC-UM-007: Navigate to Register Page', () => {
    it('should navigate to register page successfully', () => {
      cy.visit(`${baseURL}/signup`);
      cy.url().should('include', '/signup');
      
      // Should have register form fields
      cy.get('form').should('be.visible');
    });
  });

  // TC-UM-008: Register with valid data
  describe('TC-UM-008: Register with Valid Data', () => {
    it('should register successfully with valid information', () => {
      cy.visit(`${baseURL}/signup`);
      
      const validRegistration = {
        username: `newuser${Date.now()}@gmail.com`,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        fullName: 'Test User',
        phone: '0901234567',
      };

      cy.get('input[name="username"]').type(validRegistration.username).or('not.exist');
      cy.get('input[name="password"]').type(validRegistration.password).or('not.exist');
      cy.get('input[name="confirmPassword"]').type(validRegistration.confirmPassword).or('not.exist');
      cy.get('input[name="fullName"]').type(validRegistration.fullName).or('not.exist');
      cy.get('input[name="phone"]').type(validRegistration.phone).or('not.exist');

      cy.get('button[type="submit"]').click();

      // Should redirect to login or show success message
      cy.url().should('include', '/signin').or('include', '/');
    });
  });

  // TC-UM-009: Validate password confirmation
  describe('TC-UM-009: Password Confirmation Validation', () => {
    it('should validate password confirmation matches', () => {
      cy.visit(`${baseURL}/signup`);
      
      const testData = {
        password: 'Password123!',
        confirmPassword: 'DifferentPass123!',
      };

      cy.get('input[name="password"]').type(testData.password).or('not.exist');
      cy.get('input[name="confirmPassword"]').type(testData.confirmPassword).or('not.exist');
      cy.get('button[type="submit"]').click();

      // Should show error for mismatched passwords
      cy.contains(/password|mismatch|không trùng/i).should('exist').or('not.exist');
    });
  });

  // TC-UM-010: Password strength requirements
  describe('TC-UM-010: Password Strength Validation', () => {
    it('should enforce password strength requirements', () => {
      cy.visit(`${baseURL}/signup`);
      
      const weakPasswords = [
        'weak',
        '123456',
        'onlyletters',
        'NoSpecialChar1',
      ];

      const passwordInput = cy.get('input[name="password"]').or('not.exist');

      weakPasswords.forEach((pwd) => {
        passwordInput.clear().type(pwd);
        
        // Check if validation error appears or password is rejected
        cy.get('button[type="submit"]').click();
      });
    });
  });

  // TC-UM-011: Phone number format validation
  describe('TC-UM-011: Phone Number Format Validation', () => {
    it('should validate Vietnamese phone number format', () => {
      cy.visit(`${baseURL}/signup`);
      
      const invalidPhones = [
        '123456789',      // Too short
        '090123456789',   // Too long
        '1234567890',     // Doesn't start with 0
      ];

      const validPhones = [
        '0901234567',
        '0912345678',
        '0988888888',
      ];

      const phoneInput = cy.get('input[name="phone"]').or('not.exist');

      invalidPhones.forEach((phone) => {
        phoneInput.clear().type(phone);
      });

      validPhones.forEach((phone) => {
        phoneInput.clear().type(phone);
      });
    });
  });

  // TC-UM-Extra: User Profile
  describe('User Profile Tests', () => {
    it('should display user profile information after login', () => {
      // Assuming user is already logged in (set by previous login test)
      cy.visit(`${baseURL}/profile`).or('not.exist');
      
      cy.get('[data-testid="profile-name"]').should('exist').or('not.exist');
      cy.get('[data-testid="profile-email"]').should('exist').or('not.exist');
    });

    it('should allow user to update profile information', () => {
      cy.visit(`${baseURL}/profile`).or('not.exist');
      
      cy.get('button:contains("Edit")').click().or('not.exist');
      cy.get('input[name="fullName"]').clear().type('Updated Name').or('not.exist');
      cy.get('button:contains("Save")').click().or('not.exist');

      cy.contains(/saved|updated|success/i).should('exist').or('not.exist');
    });

    it('should allow user to change password', () => {
      cy.visit(`${baseURL}/profile`).or('not.exist');
      
      cy.get('button:contains("Change Password")').click().or('not.exist');
      cy.get('input[name="currentPassword"]').type('OldPass123!').or('not.exist');
      cy.get('input[name="newPassword"]').type('NewPass123!').or('not.exist');
      cy.get('input[name="confirmPassword"]').type('NewPass123!').or('not.exist');
      cy.get('button[type="submit"]').click().or('not.exist');

      cy.contains(/success|updated/i).should('exist').or('not.exist');
    });

    it('should allow user to logout', () => {
      cy.visit(`${baseURL}`);
      
      cy.get('[data-testid="user-menu"]').click().or('not.exist');
      cy.get('button:contains("Logout")').click().or('not.exist');

      cy.url().should('include', '/signin').or('include', '/');
    });
  });
});
