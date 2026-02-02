# Tenant Context Usage Guide

This document explains how to use the multi-tenancy system in SwiftStore.

## Overview

SwiftStore implements a multi-tenant architecture where each merchant gets their own subdomain (e.g., `merchant.swiftstore.com`). The system ensures data isolation between tenants while providing a unified codebase.

## Key Components

### 1. Middleware (`middleware.ts`)
- Detects subdomain from incoming requests
- Rewrites requests to internal `/_(storefront|dashboard)/[subdomain]` paths
- Attaches tenant context as headers: `x-store-id` and `x-store-subdomain`
- Verifies store exists before allowing access

### 2. Server-Side Tenant Utilities (`lib/tenant.ts`)
Provides functions to work with tenant context on the server side:

```typescript
// Get store by subdomain
const store = await getStoreBySubdomain(subdomain);

// Get store by ID
const store = await getStoreById(storeId);

// Extract tenant context from request headers
const tenant = await getTenantFromHeaders(); // Returns { storeId, subdomain } or null

// Require tenant context (throws if not found)
const tenant = await requireTenant(); // Returns { storeId, subdomain }

// Check if request has tenant context
const hasTenant = await hasTenantContext(); // Returns boolean

// Verify store ownership
const isOwner = await verifyStoreOwnership(storeId, userId); // Returns boolean
```

### 3. Client-Side Tenant Provider (`components/tenant-provider.tsx`)
Provides tenant context to client components:

```tsx
import { TenantProvider, useTenant, useHasTenant } from '@/components/tenant-provider';

// Wrap your client components with the provider
<TenantProvider initialStoreId={storeId} initialSubdomain={subdomain}>
  <MyClientComponent />
</TenantProvider>

// Use the tenant context in client components
function MyClientComponent() {
  const { storeId, subdomain, isLoading, error } = useTenant();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>Current store: {storeId}</div>;
}

// Check if we're in a tenant context
function ConditionalComponent() {
  const hasTenant = useHasTenant();
  
  return hasTenant ? <TenantSpecificContent /> : <GeneralContent />;
}
```

## Using Tenant Context in Different Scenarios

### 1. Server Components (Pages, Layouts)

For server components in the storefront route group, use the server-side tenant utilities:

```tsx
// app/_storefront/[subdomain]/page.tsx
import { getStoreBySubdomain } from '@/lib/tenant';

export default async function StorefrontPage({ params }) {
  const { subdomain } = await params;
  
  // Get store data by subdomain
  const store = await getStoreBySubdomain(subdomain);
  
  if (!store) {
    return <div>Store not found</div>;
  }
  
  return (
    <div>
      <h1>{store.name}</h1>
      {/* Render store content */}
    </div>
  );
}
```

### 2. API Routes Requiring Tenant Context

For API routes that should only be accessible via subdomain routes, use `requireTenant()`:

```ts
// app/api/storefront/products/route.ts
import { requireTenant } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    // This will throw if not accessed via a subdomain route
    const tenant = await requireTenant();
    
    // Use tenant.storeId to scope database queries
    const products = await prisma.product.findMany({
      where: { storeId: tenant.storeId }
    });
    
    return NextResponse.json({ products });
  } catch (e) {
    if ((e as Error).message.includes('Tenant context not found')) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### 3. API Routes with Optional Tenant Context

For API routes that work both in tenant and non-tenant contexts, use `getTenantFromHeaders()`:

```ts
// app/api/products/route.ts
import { getTenantFromHeaders } from '@/lib/tenant';

export async function GET(request: NextRequest) {
  try {
    // This won't throw, returns null if no tenant context
    const tenant = await getTenantFromHeaders();
    
    if (tenant) {
      // Called from a subdomain route - return only tenant's products
      const products = await prisma.product.findMany({
        where: { storeId: tenant.storeId }
      });
      return NextResponse.json({ products });
    } else {
      // Called from dashboard - return user's store products
      // (implementation depends on auth context)
      // ...
    }
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

## Data Isolation Best Practices

1. **Always scope database queries by storeId** when in a tenant context:
   ```ts
   // Good
   const products = await prisma.product.findMany({
     where: { storeId: tenant.storeId }
   });
   
   // Bad - could expose other tenants' data
   const products = await prisma.product.findMany({});
   ```

2. **Validate tenant ownership** before performing mutations:
   ```ts
   // Good
   const isOwner = await verifyStoreOwnership(productId, userId);
   if (!isOwner) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
   }
   
   // Perform mutation
   ```

3. **Use tenant-aware helper functions**:
   ```ts
   // Use the provided utility functions
   const products = await getStoreProducts(tenant.storeId);
   ```

## Testing Tenant Functionality

Unit tests for tenant functionality should mock the headers appropriately:

```ts
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
```

## Common Patterns

### Securing API Routes
```ts
export async function PUT(request: NextRequest) {
  const tenant = await requireTenant(); // Ensures tenant context exists
  
  // Validate the resource belongs to the current tenant
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { storeId: true }
  });
  
  if (product?.storeId !== tenant.storeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Proceed with the operation
}
```

### Conditional Rendering Based on Tenant Context
```tsx
function MyComponent() {
  const { storeId, subdomain, isLoading } = useTenant();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!storeId || !subdomain) {
    return <div>Please access via your store subdomain</div>;
  }
  
  return <div>Content for store {storeId}</div>;
}
```

## Troubleshooting

- **"Tenant context not found" errors**: Usually means the route wasn't accessed via a valid subdomain. Check that the request goes through the middleware.
- **Data from wrong tenant showing**: Verify all database queries are scoped by `storeId`.
- **Subdomain routes not working**: Check that the middleware is properly configured and running.