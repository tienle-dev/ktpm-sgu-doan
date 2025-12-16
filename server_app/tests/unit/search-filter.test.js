/**
 * SEARCH & FILTER TEST CASES
 * Người thực hiện: Người 3
 * Ngày tạo: 16/12/2024
 * Mô tả: Test cases cho Advanced Search và Filter theo nhiều điều kiện
 */

// Mock dependencies
jest.mock('../../Models/product');
jest.mock('../../Models/category');

const Product = require('../../Models/product');
const Category = require('../../Models/category');

// ========================================
// TEST DATA
// ========================================
const TEST_DATA = {
  products: [
    {
      _id: 'prod_001',
      name: 'Áo thun nam basic trắng',
      price: 199000,
      category: 'cat_001',
      categoryName: 'Áo thun',
      stock: 100,
      status: true,
      rating: 4.5,
      soldCount: 250,
      createdAt: new Date('2024-06-01')
    },
    {
      _id: 'prod_002',
      name: 'Áo thun nam basic đen',
      price: 199000,
      category: 'cat_001',
      categoryName: 'Áo thun',
      stock: 80,
      status: true,
      rating: 4.2,
      soldCount: 180,
      createdAt: new Date('2024-07-15')
    },
    {
      _id: 'prod_003',
      name: 'Quần jean slim fit xanh',
      price: 450000,
      category: 'cat_002',
      categoryName: 'Quần jean',
      stock: 50,
      status: true,
      rating: 4.8,
      soldCount: 320,
      createdAt: new Date('2024-05-20')
    },
    {
      _id: 'prod_004',
      name: 'Áo khoác hoodie đen',
      price: 550000,
      category: 'cat_003',
      categoryName: 'Áo khoác',
      stock: 30,
      status: true,
      rating: 4.6,
      soldCount: 150,
      createdAt: new Date('2024-08-10')
    },
    {
      _id: 'prod_005',
      name: 'Áo sơ mi công sở trắng',
      price: 350000,
      category: 'cat_004',
      categoryName: 'Áo sơ mi',
      stock: 0,
      status: false,
      rating: 4.0,
      soldCount: 90,
      createdAt: new Date('2024-04-01')
    }
  ],
  categories: [
    { _id: 'cat_001', name: 'Áo thun', status: true },
    { _id: 'cat_002', name: 'Quần jean', status: true },
    { _id: 'cat_003', name: 'Áo khoác', status: true },
    { _id: 'cat_004', name: 'Áo sơ mi', status: true }
  ]
};

// ========================================
// HELPER FUNCTIONS
// ========================================
const searchProducts = (products, query) => {
  if (!query) return products;
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.categoryName.toLowerCase().includes(lowerQuery)
  );
};

const filterProducts = (products, filters) => {
  let result = [...products];
  
  if (filters.category) {
    result = result.filter(p => p.category === filters.category);
  }
  
  if (filters.minPrice !== undefined) {
    result = result.filter(p => p.price >= filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    result = result.filter(p => p.price <= filters.maxPrice);
  }
  
  if (filters.inStock !== undefined) {
    result = result.filter(p => filters.inStock ? p.stock > 0 : p.stock === 0);
  }
  
  if (filters.minRating !== undefined) {
    result = result.filter(p => p.rating >= filters.minRating);
  }
  
  return result;
};

const sortProducts = (products, sortBy, order = 'asc') => {
  return [...products].sort((a, b) => {
    if (order === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });
};

// ========================================
// TEST SUITE: BASIC SEARCH
// ========================================
describe('BASIC SEARCH TESTS', () => {

  // TC-SEARCH-001: Tìm kiếm theo tên sản phẩm
  describe('TC-SEARCH-001: Search by Product Name', () => {
    test('should find products matching search query', () => {
      const results = searchProducts(TEST_DATA.products, 'áo thun');
      
      expect(results).toHaveLength(2);
      results.forEach(product => {
        expect(product.name.toLowerCase()).toContain('áo thun');
      });
    });

    test('should return empty array when no match found', () => {
      const results = searchProducts(TEST_DATA.products, 'xyz không tồn tại');
      
      expect(results).toHaveLength(0);
    });

    test('should be case insensitive', () => {
      const results1 = searchProducts(TEST_DATA.products, 'ÁO THUN');
      const results2 = searchProducts(TEST_DATA.products, 'áo thun');
      
      expect(results1).toEqual(results2);
    });
  });

  // TC-SEARCH-002: Tìm kiếm theo category
  describe('TC-SEARCH-002: Search by Category', () => {
    test('should find products by category name', () => {
      const results = searchProducts(TEST_DATA.products, 'quần jean');
      
      expect(results).toHaveLength(1);
      expect(results[0].categoryName).toBe('Quần jean');
    });
  });

  // TC-SEARCH-003: Tìm kiếm với chuỗi rỗng
  describe('TC-SEARCH-003: Search with Empty Query', () => {
    test('should return all products when query is empty', () => {
      const results = searchProducts(TEST_DATA.products, '');
      
      expect(results).toHaveLength(TEST_DATA.products.length);
    });
  });
});

// ========================================
// TEST SUITE: ADVANCED FILTER
// ========================================
describe('ADVANCED FILTER TESTS', () => {

  // TC-FILTER-001: Lọc theo category
  describe('TC-FILTER-001: Filter by Category', () => {
    test('should filter products by category ID', () => {
      const results = filterProducts(TEST_DATA.products, { category: 'cat_001' });
      
      expect(results).toHaveLength(2);
      results.forEach(product => {
        expect(product.category).toBe('cat_001');
      });
    });
  });

  // TC-FILTER-002: Lọc theo khoảng giá
  describe('TC-FILTER-002: Filter by Price Range', () => {
    test('should filter products within price range', () => {
      const results = filterProducts(TEST_DATA.products, { 
        minPrice: 200000, 
        maxPrice: 500000 
      });
      
      results.forEach(product => {
        expect(product.price).toBeGreaterThanOrEqual(200000);
        expect(product.price).toBeLessThanOrEqual(500000);
      });
    });

    test('should filter products above minimum price', () => {
      const results = filterProducts(TEST_DATA.products, { minPrice: 400000 });
      
      expect(results.every(p => p.price >= 400000)).toBe(true);
    });

    test('should filter products below maximum price', () => {
      const results = filterProducts(TEST_DATA.products, { maxPrice: 300000 });
      
      expect(results.every(p => p.price <= 300000)).toBe(true);
    });
  });

  // TC-FILTER-003: Lọc theo tình trạng còn hàng
  describe('TC-FILTER-003: Filter by Stock Status', () => {
    test('should filter only in-stock products', () => {
      const results = filterProducts(TEST_DATA.products, { inStock: true });
      
      results.forEach(product => {
        expect(product.stock).toBeGreaterThan(0);
      });
    });

    test('should filter out-of-stock products', () => {
      const results = filterProducts(TEST_DATA.products, { inStock: false });
      
      results.forEach(product => {
        expect(product.stock).toBe(0);
      });
    });
  });

  // TC-FILTER-004: Lọc theo rating
  describe('TC-FILTER-004: Filter by Rating', () => {
    test('should filter products with minimum rating', () => {
      const results = filterProducts(TEST_DATA.products, { minRating: 4.5 });
      
      results.forEach(product => {
        expect(product.rating).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  // TC-FILTER-005: Kết hợp nhiều filter
  describe('TC-FILTER-005: Combined Filters', () => {
    test('should apply multiple filters correctly', () => {
      const results = filterProducts(TEST_DATA.products, {
        category: 'cat_001',
        minPrice: 100000,
        maxPrice: 250000,
        inStock: true
      });
      
      results.forEach(product => {
        expect(product.category).toBe('cat_001');
        expect(product.price).toBeGreaterThanOrEqual(100000);
        expect(product.price).toBeLessThanOrEqual(250000);
        expect(product.stock).toBeGreaterThan(0);
      });
    });
  });
});

// ========================================
// TEST SUITE: SORTING
// ========================================
describe('SORTING TESTS', () => {

  // TC-SORT-001: Sắp xếp theo giá tăng dần
  describe('TC-SORT-001: Sort by Price Ascending', () => {
    test('should sort products by price ascending', () => {
      const results = sortProducts(TEST_DATA.products, 'price', 'asc');
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].price).toBeGreaterThanOrEqual(results[i-1].price);
      }
    });
  });

  // TC-SORT-002: Sắp xếp theo giá giảm dần
  describe('TC-SORT-002: Sort by Price Descending', () => {
    test('should sort products by price descending', () => {
      const results = sortProducts(TEST_DATA.products, 'price', 'desc');
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].price).toBeLessThanOrEqual(results[i-1].price);
      }
    });
  });

  // TC-SORT-003: Sắp xếp theo rating
  describe('TC-SORT-003: Sort by Rating', () => {
    test('should sort products by rating descending', () => {
      const results = sortProducts(TEST_DATA.products, 'rating', 'desc');
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].rating).toBeLessThanOrEqual(results[i-1].rating);
      }
    });
  });

  // TC-SORT-004: Sắp xếp theo số lượng bán
  describe('TC-SORT-004: Sort by Sold Count', () => {
    test('should sort products by sold count descending (best sellers)', () => {
      const results = sortProducts(TEST_DATA.products, 'soldCount', 'desc');
      
      for (let i = 1; i < results.length; i++) {
        expect(results[i].soldCount).toBeLessThanOrEqual(results[i-1].soldCount);
      }
      
      // First product should be the best seller
      expect(results[0]._id).toBe('prod_003'); // 320 sold
    });
  });
});

// ========================================
// TEST SUITE: SEARCH + FILTER COMBINATION
// ========================================
describe('SEARCH AND FILTER COMBINATION TESTS', () => {

  // TC-COMBO-001: Tìm kiếm và lọc cùng lúc
  describe('TC-COMBO-001: Search with Filters', () => {
    test('should apply search and filters together', () => {
      // First search
      let results = searchProducts(TEST_DATA.products, 'áo');
      
      // Then filter
      results = filterProducts(results, { minPrice: 300000 });
      
      // Should only have áo khoác (550000) and áo sơ mi (350000)
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        expect(product.name.toLowerCase()).toContain('áo');
        expect(product.price).toBeGreaterThanOrEqual(300000);
      });
    });
  });

  // TC-COMBO-002: Tìm kiếm, lọc và sắp xếp
  describe('TC-COMBO-002: Search, Filter, and Sort', () => {
    test('should apply search, filter, and sort together', () => {
      // Search
      let results = searchProducts(TEST_DATA.products, 'áo thun');
      
      // Filter in stock
      results = filterProducts(results, { inStock: true });
      
      // Sort by price
      results = sortProducts(results, 'price', 'desc');
      
      expect(results.length).toBe(2);
      expect(results[0].price).toBeGreaterThanOrEqual(results[1].price);
    });
  });
});

// ========================================
// EXPORT TEST RESULTS
// ========================================
module.exports = {
  testSuiteName: 'Search & Filter Tests',
  author: 'Người 3',
  totalTests: 18,
  categories: ['Basic Search', 'Advanced Filter', 'Sorting', 'Combination']
};
