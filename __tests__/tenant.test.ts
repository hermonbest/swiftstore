/**
 * Tenant Context Tests
 * 
 * These tests verify the multi-tenancy implementation:
 * - Subdomain routing works correctly
 * - Data isolation is maintained between tenants
 * - Tenant context is properly provided to components
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getStoreBySubdomain, getTenantFromHeaders, requireTenant } from '@/lib/tenant';
import prisma from '@/lib/prisma';

// Mock Next.js headers function
vi.mock('next/headers', () => ({
  headers: () => ({
    get: (key: string) => {
      if (key === 'x-store-id') return 'test-store-id';
      if (key === 'x-store-subdomain') return 'test-subdomain';
      return null;
    }
  })
}));

describe('Tenant Context', () => {
  describe('getStoreBySubdomain', () => {
    it('should return store data when subdomain exists', async () => {
      // Mock prisma store lookup
      const mockStore = {
        id: 'test-store-id',
        name: 'Test Store',
        subdomain: 'test-subdomain',
        logo: null,
        description: 'A test store',
        products: [],
        userId: 'user-123'
      };
      
      vi.spyOn(prisma.store, 'findUnique').mockResolvedValue(mockStore);
      
      const result = await getStoreBySubdomain('test-subdomain');
      
      expect(result).toEqual(mockStore);
      expect(prisma.store.findUnique).toHaveBeenCalledWith({
        where: { subdomain: 'test-subdomain' },
        include: {
          products: {
            include: {
              variants: true,
            },
          },
        },
      });
    });

    it('should return null when subdomain does not exist', async () => {
      vi.spyOn(prisma.store, 'findUnique').mockResolvedValue(null);
      
      const result = await getStoreBySubdomain('nonexistent-subdomain');
      
      expect(result).toBeNull();
    });
  });

  describe('getTenantFromHeaders', () => {
    it('should return tenant context when headers are present', async () => {
      const result = await getTenantFromHeaders();
      
      expect(result).toEqual({
        storeId: 'test-store-id',
        subdomain: 'test-subdomain'
      });
    });

    it('should return null when headers are missing', async () => {
      // Temporarily override the mock to return null for both headers
      vi.mock('next/headers', () => ({
        headers: () => ({
          get: (key: string) => null
        })
      }));
      
      const result = await getTenantFromHeaders();
      
      expect(result).toBeNull();
    });
  });

  describe('requireTenant', () => {
    it('should return tenant context when headers are present', async () => {
      const result = await requireTenant();
      
      expect(result).toEqual({
        storeId: 'test-store-id',
        subdomain: 'test-subdomain'
      });
    });

    it('should throw error when headers are missing', async () => {
      // Temporarily override the mock to return null for both headers
      vi.mock('next/headers', () => ({
        headers: () => ({
          get: (key: string) => null
        })
      }));
      
      await expect(requireTenant()).rejects.toThrow('Tenant context not found. This route must be accessed via a store subdomain.');
    });
  });

  describe('verifyStoreOwnership', () => {
    it('should return true when user owns the store', async () => {
      const mockStore = {
        id: 'test-store-id',
        userId: 'owner-user-id'
      };
      
      vi.spyOn(prisma.store, 'findUnique').mockResolvedValue(mockStore as any);
      
      const result = await verifyStoreOwnership('test-store-id', 'owner-user-id');
      
      expect(result).toBe(true);
    });

    it('should return false when user does not own the store', async () => {
      const mockStore = {
        id: 'test-store-id',
        userId: 'different-user-id'
      };
      
      vi.spyOn(prisma.store, 'findUnique').mockResolvedValue(mockStore as any);
      
      const result = await verifyStoreOwnership('test-store-id', 'other-user-id');
      
      expect(result).toBe(false);
    });

    it('should return false when store does not exist', async () => {
      vi.spyOn(prisma.store, 'findUnique').mockResolvedValue(null as any);
      
      const result = await verifyStoreOwnership('nonexistent-store-id', 'any-user-id');
      
      expect(result).toBe(false);
    });
  });
});