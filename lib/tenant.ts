import { headers } from 'next/headers';
import prisma from './prisma';

/**
 * Tenant utilities for multi-tenancy
 * Provides server-side helpers for resolving and validating tenant context
 */

export interface TenantContext {
    storeId: string;
    subdomain: string;
}

/**
 * Get store by subdomain
 * Used by middleware and server components
 */
export async function getStoreBySubdomain(subdomain: string) {
    const store = await prisma.store.findUnique({
        where: { subdomain },
        include: {
            products: {
                include: {
                    variants: true,
                },
            },
        },
    });

    return store;
}

/**
 * Get store by ID
 * Used when storeId is known (from headers/context)
 */
export async function getStoreById(storeId: string) {
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
            products: {
                include: {
                    variants: true,
                },
            },
        },
    });

    return store;
}

/**
 * Extract tenant context from request headers
 * Should be called in server components or API routes
 */
export async function getTenantFromHeaders(): Promise<TenantContext | null> {
    const headersList = await headers();
    const storeId = headersList.get('x-store-id');
    const subdomain = headersList.get('x-store-subdomain');

    if (!storeId || !subdomain) {
        return null;
    }

    return {
        storeId,
        subdomain,
    };
}

/**
 * Require tenant context - throws if not found
 * Use this when tenant is required for the operation
 */
export async function requireTenant(): Promise<TenantContext> {
    const tenant = await getTenantFromHeaders();

    if (!tenant) {
        throw new Error('Tenant context not found. This route must be accessed via a store subdomain.');
    }

    return tenant;
}

/**
 * Check if the current request has a valid tenant context
 */
export async function hasTenantContext(): Promise<boolean> {
    const tenant = await getTenantFromHeaders();
    return tenant !== null;
}

/**
 * Get products for a specific store
 * Ensures data isolation by requiring storeId
 */
export async function getStoreProducts(storeId: string) {
    const products = await prisma.product.findMany({
        where: { storeId },
        include: {
            variants: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    stock: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return products;
}

/**
 * Verify that a user owns a store
 * Used for authorization in API routes
 */
export async function verifyStoreOwnership(storeId: string, userId: string): Promise<boolean> {
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { userId: true },
    });

    return store?.userId === userId;
}

/**
 * Get store with validation
 * Returns store if it exists and belongs to the user (if userId provided)
 */
export async function getStoreWithValidation(
    storeId: string,
    userId?: string
) {
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: {
            products: {
                include: {
                    variants: true,
                },
            },
        },
    });

    if (!store) {
        return null;
    }

    if (userId && store.userId !== userId) {
        return null;
    }

    return store;
}
