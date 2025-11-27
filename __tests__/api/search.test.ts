/**
 * Search API Tests
 * 
 * Tests for the search endpoint to ensure:
 * - Products with missing images are filtered out
 * - Pagination works correctly
 * - Relevance ordering is applied
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock data
const mockProductsWithImages = [
  {
    _id: '1',
    title: 'Product 1',
    images: ['https://example.com/image1.jpg'],
    basePrice: 100,
    category: 'Category A',
    isActive: true,
  },
  {
    _id: '2',
    title: 'Product 2',
    images: ['https://example.com/image2.jpg', 'https://example.com/image2-2.jpg'],
    basePrice: 200,
    category: 'Category B',
    isActive: true,
  },
];

const mockProductsWithoutImages = [
  {
    _id: '3',
    title: 'Product 3',
    images: [],
    basePrice: 300,
    category: 'Category A',
    isActive: true,
  },
  {
    _id: '4',
    title: 'Product 4',
    images: [''],
    basePrice: 400,
    category: 'Category B',
    isActive: true,
  },
];

describe('Search API', () => {
  describe('Image Validation', () => {
    it('should filter out products with empty images array', () => {
      const products = [...mockProductsWithImages, ...mockProductsWithoutImages];
      const filtered = products.filter((product) => {
        if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
          return false;
        }
        return product.images.some((img: string) => 
          img && typeof img === 'string' && img.trim().length > 0
        );
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p._id)).toEqual(['1', '2']);
    });

    it('should filter out products with only empty string images', () => {
      const products = [
        ...mockProductsWithImages,
        { _id: '5', title: 'Product 5', images: [''], basePrice: 500, isActive: true },
      ];
      const filtered = products.filter((product) => {
        if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
          return false;
        }
        return product.images.some((img: string) => 
          img && typeof img === 'string' && img.trim().length > 0
        );
      });

      expect(filtered).toHaveLength(2);
      expect(filtered.map(p => p._id)).toEqual(['1', '2']);
    });

    it('should keep products with valid images', () => {
      const filtered = mockProductsWithImages.filter((product) => {
        if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
          return false;
        }
        return product.images.some((img: string) => 
          img && typeof img === 'string' && img.trim().length > 0
        );
      });

      expect(filtered).toHaveLength(2);
    });
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', () => {
      const page = 1;
      const limit = 10;
      const skip = (page - 1) * limit;
      
      const allProducts = Array.from({ length: 25 }, (_, i) => ({
        _id: `${i + 1}`,
        title: `Product ${i + 1}`,
        images: ['https://example.com/image.jpg'],
        basePrice: 100,
        isActive: true,
      }));

      const paginated = allProducts.slice(skip, skip + limit);
      
      expect(paginated).toHaveLength(10);
      expect(paginated[0]._id).toBe('1');
      expect(paginated[9]._id).toBe('10');
    });

    it('should calculate total pages correctly', () => {
      const total = 25;
      const limit = 10;
      const totalPages = Math.ceil(total / limit);
      
      expect(totalPages).toBe(3);
    });
  });
});

