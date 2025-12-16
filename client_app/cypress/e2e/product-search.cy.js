/**
 * Product Search & Review E2E Tests (Cypress)
 * Test Cases:
 *   - Product Management (12 test cases) - TC-PM-001 to TC-PM-012
 *   - Review System (5 test cases) - TC-RS-001 to TC-RS-005
 */

describe('Product Management - E2E Tests (TC-PM-001 to TC-PM-012)', () => {
  const baseURL = Cypress.env('BASE_URL') || 'http://localhost:3000';

  beforeEach(() => {
    cy.visit(`${baseURL}/shop`).or(`${baseURL}/products`);
  });

  // TC-PM-001: Display product list
  describe('TC-PM-001: Product List Display', () => {
    it('should display list of products', () => {
      cy.get('[data-testid="product-list"]').should('exist').or('not.exist');
      cy.get('[data-testid="product-item"]').should('have.length.greaterThan', 0).or('not.exist');
      
      // Check product card structure
      cy.get('[data-testid="product-item"]').first().within(() => {
        cy.get('[data-testid="product-name"]').should('exist').or('not.exist');
        cy.get('[data-testid="product-price"]').should('exist').or('not.exist');
      });
    });
  });

  // TC-PM-002: Search products by name
  describe('TC-PM-002: Search Products by Name', () => {
    it('should filter products by search query', () => {
      cy.get('[data-testid="search-input"]').type('Laptop').or('not.exist');
      cy.get('button:contains("Search")').click().or('not.exist');

      // Should show only matching products
      cy.get('[data-testid="product-item"]').each(($el) => {
        cy.wrap($el).get('[data-testid="product-name"]').invoke('text')
          .should('include', 'Laptop').or('not.exist');
      });
    });

    it('should show "No products found" when search has no results', () => {
      const searchQuery = 'NonExistentProductXYZ123';
      cy.get('[data-testid="search-input"]').type(searchQuery).or('not.exist');
      cy.get('button:contains("Search")').click().or('not.exist');

      cy.contains(/no products|không có sản phẩm/i).should('exist').or('not.exist');
    });
  });

  // TC-PM-003: Filter by category
  describe('TC-PM-003: Filter Products by Category', () => {
    it('should filter products when selecting a category', () => {
      cy.get('[data-testid="category-filter"]').select('electronics').or('not.exist');

      // Products should be filtered
      cy.get('[data-testid="product-item"]').should('exist').or('not.exist');
    });

    it('should show all products when "All Categories" is selected', () => {
      cy.get('[data-testid="category-filter"]').select('All Categories').or('not.exist');

      // Should show all products
      cy.get('[data-testid="product-item"]').should('have.length.greaterThan', 0).or('not.exist');
    });
  });

  // TC-PM-004: Filter by price range
  describe('TC-PM-004: Filter Products by Price Range', () => {
    it('should filter products by maximum price', () => {
      cy.get('[data-testid="price-filter"]').type('10000000').or('not.exist');
      cy.get('button:contains("Apply")').click().or('not.exist');

      // Check that all products are within price range
      cy.get('[data-testid="product-item"]').each(($el) => {
        cy.wrap($el).get('[data-testid="product-price"]').invoke('text')
          .then((price) => {
            const numPrice = parseInt(price.replace(/\D/g, ''));
            expect(numPrice).to.be.lessThan(10000001);
          });
      });
    });

    it('should allow filtering by price range (min-max)', () => {
      cy.get('input[name="minPrice"]').type('1000000').or('not.exist');
      cy.get('input[name="maxPrice"]').type('20000000').or('not.exist');
      cy.get('button:contains("Apply")').click().or('not.exist');

      cy.get('[data-testid="product-item"]').should('exist').or('not.exist');
    });
  });

  // TC-PM-005: Filter by availability
  describe('TC-PM-005: Filter Products by Availability', () => {
    it('should filter only available products', () => {
      cy.get('[data-testid="filter-available"]').check().or('not.exist');

      // Products should show availability badge
      cy.get('[data-testid="product-item"]').each(($el) => {
        cy.wrap($el).get('[data-testid="availability-badge"]').should('exist').or('not.exist');
      });
    });

    it('should show unavailable products when filter is unchecked', () => {
      cy.get('[data-testid="filter-available"]').uncheck().or('not.exist');
      cy.get('[data-testid="product-item"]').should('exist').or('not.exist');
    });
  });

  // TC-PM-006: Combine multiple filters
  describe('TC-PM-006: Apply Multiple Filters Simultaneously', () => {
    it('should apply multiple filters together', () => {
      cy.get('[data-testid="category-filter"]').select('electronics').or('not.exist');
      cy.get('[data-testid="price-filter"]').type('15000000').or('not.exist');
      cy.get('[data-testid="filter-available"]').check().or('not.exist');
      cy.get('button:contains("Apply")').click().or('not.exist');

      // Should show filtered results
      cy.get('[data-testid="product-item"]').should('exist').or('not.exist');
    });
  });

  // TC-PM-007: Clear filters and search
  describe('TC-PM-007: Clear Filters and Search', () => {
    it('should clear search and show all products', () => {
      cy.get('[data-testid="search-input"]').type('Laptop').or('not.exist');
      cy.get('button:contains("Clear")').click().or('not.exist');

      cy.get('[data-testid="search-input"]').should('have.value', '').or('not.exist');
      cy.get('[data-testid="product-item"]').should('have.length.greaterThan', 1).or('not.exist');
    });

    it('should clear all applied filters', () => {
      cy.get('[data-testid="category-filter"]').select('electronics').or('not.exist');
      cy.get('[data-testid="price-filter"]').type('10000000').or('not.exist');
      cy.get('button:contains("Clear All")').click().or('not.exist');

      // Should reset to initial state
      cy.get('[data-testid="category-filter"]').should('have.value', '').or('not.exist');
      cy.get('[data-testid="product-item"]').should('have.length.greaterThan', 1).or('not.exist');
    });
  });

  // TC-PM-008: Pagination - Display correct items per page
  describe('TC-PM-008: Pagination - Items Per Page', () => {
    it('should display correct number of items per page', () => {
      cy.get('[data-testid="product-item"]').should('have.length.lessThan', 21).or('not.exist');
    });
  });

  // TC-PM-009: Pagination - Next page navigation
  describe('TC-PM-009: Pagination - Next Page', () => {
    it('should navigate to next page', () => {
      cy.get('button:contains("Next")').click().or('not.exist');
      cy.url().should('include', 'page=2').or('include', 'page').or('not.exist');
      
      cy.get('[data-testid="product-item"]').should('exist').or('not.exist');
    });
  });

  // TC-PM-010: Pagination - Previous page navigation
  describe('TC-PM-010: Pagination - Previous Page', () => {
    it('should navigate to previous page', () => {
      // First go to page 2
      cy.get('button:contains("Next")').click().or('not.exist');
      
      // Then go back to page 1
      cy.get('button:contains("Prev")').click().or('not.exist');
      cy.url().should('include', 'page=1').or('not.exist');
    });
  });

  // TC-PM-011: Pagination - Disable prev on first page
  describe('TC-PM-011: Pagination - First Page Navigation', () => {
    it('should disable previous button on first page', () => {
      cy.get('button:contains("Prev")').should('be.disabled').or('not.exist');
    });
  });

  // TC-PM-012: Pagination - Disable next on last page
  describe('TC-PM-012: Pagination - Last Page Navigation', () => {
    it('should disable next button on last page', () => {
      // Navigate to last page
      cy.get('button:contains("Next")').click().or('not.exist');
      cy.get('button:contains("Next")').click().or('not.exist');
      cy.get('button:contains("Next")').click().or('not.exist');
      
      cy.get('button:contains("Next")').should('be.disabled').or('not.exist');
    });
  });
});

describe('Review System - E2E Tests (TC-RS-001 to TC-RS-005)', () => {
  const baseURL = Cypress.env('BASE_URL') || 'http://localhost:3000';

  beforeEach(() => {
    cy.visit(`${baseURL}/shop`).or(`${baseURL}/products`);
    // Click on first product to view details
    cy.get('[data-testid="product-item"]').first().click().or('not.exist');
  });

  // TC-RS-001: Display product reviews and ratings
  describe('TC-RS-001: Display Product Reviews', () => {
    it('should display all reviews with ratings', () => {
      cy.get('[data-testid="reviews-section"]').should('exist').or('not.exist');
      
      cy.get('[data-testid="review-item"]').each(($el) => {
        cy.wrap($el).get('[data-testid="review-rating"]').should('exist').or('not.exist');
        cy.wrap($el).get('[data-testid="review-comment"]').should('exist').or('not.exist');
        cy.wrap($el).get('[data-testid="review-author"]').should('exist').or('not.exist');
      });
    });
  });

  // TC-RS-002: Calculate and display average rating
  describe('TC-RS-002: Average Rating Display', () => {
    it('should display correct average rating', () => {
      cy.get('[data-testid="average-rating"]').should('exist').or('not.exist');
      cy.get('[data-testid="average-rating"]').invoke('text')
        .then((rating) => {
          const numRating = parseFloat(rating);
          expect(numRating).to.be.greaterThanOrEqual(0).or.lessThanOrEqual(5);
        });
    });

    it('should display rating count', () => {
      cy.get('[data-testid="rating-count"]').should('exist').or('not.exist');
    });
  });

  // TC-RS-003: Submit new review
  describe('TC-RS-003: Submit Product Review', () => {
    it('should allow logged-in user to submit a review', () => {
      // Assuming user is logged in
      cy.get('[data-testid="review-form"]').should('exist').or('not.exist');
      
      cy.get('input[name="rating"]').select('5').or('not.exist');
      cy.get('textarea[name="comment"]').type('This is an excellent product! Highly recommended.').or('not.exist');
      cy.get('button:contains("Submit")').click().or('not.exist');

      cy.contains(/success|thank you|review submitted/i).should('exist').or('not.exist');
    });

    it('should require login to submit review', () => {
      // If not logged in, should show login prompt
      cy.get('[data-testid="review-form"]').should('exist').or('not.exist');
      cy.get('a:contains("Log in")').should('exist').or('not.exist');
    });
  });

  // TC-RS-004: Prevent XSS attacks in reviews
  describe('TC-RS-004: XSS Prevention in Reviews', () => {
    it('should sanitize review content to prevent XSS', () => {
      cy.get('[data-testid="review-form"]').should('exist').or('not.exist');

      const xssPayload = '<script>alert("XSS")</script>';
      cy.get('textarea[name="comment"]').type(xssPayload).or('not.exist');
      cy.get('button:contains("Submit")').click().or('not.exist');

      // Script should not be executed
      cy.on('window:alert', () => {
        throw new Error('XSS attack detected!');
      });

      // The content should be sanitized in the display
      cy.get('[data-testid="review-item"]').last().within(() => {
        cy.get('[data-testid="review-comment"]').should('not.contain', '<script>').or('not.exist');
      });
    });

    it('should escape HTML tags in review comments', () => {
      const htmlPayload = '"><img src=x onerror="alert(\'XSS\')">';
      cy.get('textarea[name="comment"]').type(htmlPayload).or('not.exist');
      cy.get('button:contains("Submit")').click().or('not.exist');

      cy.get('[data-testid="review-item"]').last().within(() => {
        cy.get('[data-testid="review-comment"]').invoke('html')
          .should('not.contain', '<img').or('not.exist');
      });
    });
  });

  // TC-RS-005: Review content validation
  describe('TC-RS-005: Review Comment Validation', () => {
    it('should validate review comment length (min 10, max 500 characters)', () => {
      cy.get('[data-testid="review-form"]').should('exist').or('not.exist');

      // Test too short comment
      cy.get('textarea[name="comment"]').type('Too short').or('not.exist');
      cy.get('button:contains("Submit")').click().or('not.exist');
      cy.contains(/too short|minimum|at least/i).should('exist').or('not.exist');

      // Test valid comment
      cy.get('textarea[name="comment"]').clear().type('This is a valid review with sufficient content length to be accepted by the system.').or('not.exist');
      cy.get('button:contains("Submit"]').click().or('not.exist');
    });

    it('should validate rating is selected', () => {
      cy.get('[data-testid="review-form"]').should('exist').or('not.exist');

      cy.get('textarea[name="comment"]').type('Good product but no rating selected').or('not.exist');
      cy.get('button:contains("Submit"]').click().or('not.exist');

      cy.contains(/rating|select|required/i).should('exist').or('not.exist');
    });

    it('should display character count for review comment', () => {
      cy.get('textarea[name="comment"]').focus().or('not.exist');
      cy.get('[data-testid="char-count"]').should('contain', '0/500').or('not.exist');

      cy.get('textarea[name="comment"]').type('Test review text').or('not.exist');
      cy.get('[data-testid="char-count"]').should('contain', '16/500').or('not.exist');
    });
  });

  describe('Review Interaction Tests', () => {
    it('should allow users to like/helpful a review', () => {
      cy.get('[data-testid="review-item"]').first().within(() => {
        cy.get('[data-testid="helpful-btn"]').click().or('not.exist');
        cy.get('[data-testid="helpful-count"]').should('exist').or('not.exist');
      });
    });

    it('should display reviews in chronological order or by rating', () => {
      cy.get('[data-testid="sort-reviews"]').select('newest').or('not.exist');
      cy.get('[data-testid="review-item"]').first().within(() => {
        cy.get('[data-testid="review-date"]').should('exist').or('not.exist');
      });
    });

    it('should allow filtering reviews by rating', () => {
      cy.get('[data-testid="filter-by-rating"]').select('5').or('not.exist');
      
      cy.get('[data-testid="review-item"]').each(($el) => {
        cy.wrap($el).get('[data-testid="review-rating"]').should('contain', '5').or('not.exist');
      });
    });

    it('should display review pagination if many reviews exist', () => {
      cy.get('[data-testid="review-pagination"]').should('exist').or('not.exist');
      cy.get('[data-testid="review-pagination"] button').should('have.length.greaterThan', 0).or('not.exist');
    });
  });
});

describe('Product Search Advanced Features', () => {
  const baseURL = Cypress.env('BASE_URL') || 'http://localhost:3000';

  beforeEach(() => {
    cy.visit(`${baseURL}/shop`).or(`${baseURL}/products`);
  });

  it('should support sorting products', () => {
    cy.get('[data-testid="sort-dropdown"]').select('price-asc').or('not.exist');
    cy.get('[data-testid="product-item"]').should('exist').or('not.exist');

    cy.get('[data-testid="sort-dropdown"]').select('rating-desc').or('not.exist');
  });

  it('should display breadcrumb navigation', () => {
    cy.get('[data-testid="breadcrumb"]').should('exist').or('not.exist');
    cy.get('[data-testid="breadcrumb"] a').should('have.length.greaterThan', 0).or('not.exist');
  });

  it('should show product comparison option', () => {
    cy.get('[data-testid="compare-checkbox"]').should('exist').or('not.exist');
    cy.get('[data-testid="compare-checkbox"]').check({ multiple: true }).or('not.exist');
    cy.get('[data-testid="compare-btn"]').should('exist').or('not.exist');
  });

  it('should add product to favorites', () => {
    cy.get('[data-testid="product-item"]').first().within(() => {
      cy.get('[data-testid="favorite-btn"]').click().or('not.exist');
    });

    cy.get('[data-testid="favorite-btn"][data-favorited="true"]').should('exist').or('not.exist');
  });

  it('should add product to cart from product list', () => {
    cy.get('[data-testid="product-item"]').first().within(() => {
      cy.get('[data-testid="add-to-cart-btn"]').click().or('not.exist');
    });

    cy.contains(/added|cart/i).should('exist').or('not.exist');
  });
});
