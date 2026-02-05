# TypeScript Errors Fix Plan

## Overview
This plan addresses 26 TypeScript compilation errors found across 12 files in the SwiftStore project. The errors fall into several categories: Next.js route handler type mismatches, Prisma schema issues, missing dependencies, and strict TypeScript configuration issues.

## Error Categories

### 1. Next.js Route Handler Type Errors (2 errors)
**Files:** `.next/dev/types/validator.ts`, `.next/types/validator.ts`

**Issue:** The PATCH handler in [`app/api/products/route.ts`](app/api/products/route.ts:113) expects `params` with `productId`, but the route is `/api/products` (not `/api/products/[productId]`), so params should be empty.

**Root Cause:** The PATCH handler is in the wrong file. It should be in [`app/api/products/[productId]/route.ts`](app/api/products/[productId]/route.ts) instead.

### 2. Vitest Test Configuration (12 errors)
**File:** [`__tests__/tenant.test.ts`](__tests__/tenant.test.ts:10)

**Issues:**
- Vitest is not installed as a dependency
- Test files are included in TypeScript compilation

**Options:**
- Option A: Install Vitest and configure it properly
- Option B: Exclude test files from TypeScript compilation (recommended for now)

### 3. Invalid Import (1 error)
**File:** [`app/(storefront)/[subdomain]/order-success/page.tsx`](app/(storefront)/[subdomain]/order-success/page.tsx:1)

**Issue:** Importing `SearchParamProps` from Next.js internal utilities that don't export it.

**Solution:** Remove the unused import (it's not used in the file).

### 4. Implicit Any Type (3 errors)
**File:** [`app/api/orders/route.ts`](app/api/orders/route.ts:46)

**Issue:** The `orderItems` array is initialized without a type annotation, causing TypeScript to infer `any[]`.

**Solution:** Add explicit type annotation for the array.

### 5. Prisma Schema Issues (3 errors)
**Files:** 
- [`app/api/products/[productId]/variants/route.ts`](app/api/products/[productId]/variants/route.ts:40)
- [`app/api/storefront/products/route.ts`](app/api/storefront/products/route.ts:16)

**Issues:**
- `createdAt` field doesn't exist on ProductVariant model
- `published` field doesn't exist on Product model

**Solution:** Add missing fields to Prisma schema and regenerate client.

### 6. Unsafe Array Access (3 errors)
**Files:**
- [`app/api/products/route.ts`](app/api/products/route.ts:24)
- [`app/api/users/[userId]/store/route.ts`](app/api/users/[userId]/store/route.ts:29)
- [`app/dashboard/orders/page.tsx`](app/dashboard/orders/page.tsx:34)

**Issue:** Accessing `userWithStore.stores[0]` without checking if array is non-empty. TypeScript's `noUncheckedIndexedAccess` flag makes this an error.

**Solution:** Add proper null checks or use optional chaining.

### 7. VerbatimModuleSyntax Error (1 error)
**File:** [`app/dashboard/products/new/page.tsx`](app/dashboard/products/new/page.tsx:5)

**Issue:** Importing a type without using `type` keyword when `verbatimModuleSyntax` is enabled.

**Solution:** Change to type-only import: `import type { UploadedFile } from ...`

### 8. Missing CSS File (1 error)
**File:** [`app/layout.tsx`](app/layout.tsx:3)

**Issue:** TypeScript cannot find the CSS module declaration.

**Solution:** The file exists, but TypeScript needs a declaration file for CSS imports.

## Detailed Fix Plan

### Step 1: Fix Prisma Schema
Add missing fields to the Product and ProductVariant models:

```prisma
model Product {
  // ... existing fields
  published   Boolean     @default(false)  // Add this field
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model ProductVariant {
  // ... existing fields
  stock     Int      @default(0)
  createdAt DateTime @default(now())  // Add this field
  updatedAt DateTime @updatedAt       // Add this field
  
  orderItems OrderItem[]
}
```

### Step 2: Move PATCH Handler to Correct Location
The PATCH handler in [`app/api/products/route.ts`](app/api/products/route.ts:111) should be moved to [`app/api/products/[productId]/route.ts`](app/api/products/[productId]/route.ts) since it requires a `productId` parameter.

### Step 3: Fix Type Annotations

#### In [`app/api/orders/route.ts`](app/api/orders/route.ts:46):
```typescript
interface OrderItemData {
  variantId: string;
  quantity: number;
  priceAtPurchase: Decimal;
  variantName: string;
}

const orderItems: OrderItemData[] = [];
```

#### In [`app/(storefront)/[subdomain]/order-success/page.tsx`](app/(storefront)/[subdomain]/order-success/page.tsx:1):
Remove line 1: `import { SearchParamProps } from 'next/dist/shared/lib/utils';`

#### In [`app/dashboard/products/new/page.tsx`](app/dashboard/products/new/page.tsx:5):
```typescript
import { MockUploadService, type UploadedFile } from '@/lib/uploadthing';
```

### Step 4: Add Null Safety Checks

#### In [`app/api/products/route.ts`](app/api/products/route.ts:24):
```typescript
if (!userWithStore || userWithStore.stores.length === 0) {
  return NextResponse.json({ products: [] }, { status: 200 });
}

const storeId = userWithStore.stores[0]!.id; // Use non-null assertion after check
// OR
const storeId = userWithStore.stores[0]?.id;
if (!storeId) {
  return NextResponse.json({ error: 'No store found' }, { status: 404 });
}
```

Apply similar fixes to:
- [`app/api/users/[userId]/store/route.ts`](app/api/users/[userId]/store/route.ts:29)
- [`app/dashboard/orders/page.tsx`](app/dashboard/orders/page.tsx:34)

### Step 5: Fix CSS Import Issue
Create a type declaration file for CSS modules:

**File:** `app/globals.css.d.ts`
```typescript
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
```

Or update `next-env.d.ts` to include CSS module declarations.

### Step 6: Handle Test Files
Update [`tsconfig.json`](tsconfig.json:46) to exclude test files:

```json
{
  "exclude": [
    "node_modules",
    "__tests__/**/*",
    "**/*.test.ts",
    "**/*.test.tsx"
  ]
}
```

### Step 7: Fix ProductVariant OrderBy
In [`app/api/products/[productId]/variants/route.ts`](app/api/products/[productId]/variants/route.ts:40):

Since ProductVariant doesn't have `createdAt` initially, either:
- Add it to schema (covered in Step 1)
- Or remove the orderBy clause temporarily

### Step 8: Regenerate Prisma Client
After schema changes:
```bash
npx prisma generate
```

### Step 9: Run Type Check
Verify all fixes:
```bash
npx tsc --noEmit
```

## Execution Order

1. **Update Prisma Schema** - Add `published`, `createdAt`, `updatedAt` fields
2. **Regenerate Prisma Client** - `npx prisma generate`
3. **Move PATCH Handler** - Relocate from `/api/products/route.ts` to `/api/products/[productId]/route.ts`
4. **Fix Type Imports** - Update `verbatimModuleSyntax` issues
5. **Add Type Annotations** - Fix implicit any types
6. **Add Null Checks** - Fix unsafe array access
7. **Remove Invalid Imports** - Clean up unused imports
8. **Exclude Tests** - Update tsconfig.json
9. **Verify** - Run `npx tsc --noEmit`

## Risk Assessment

**Low Risk:**
- Adding type annotations
- Removing unused imports
- Excluding test files from compilation
- Adding CSS type declarations

**Medium Risk:**
- Moving PATCH handler (requires testing the endpoint)
- Adding null checks (changes runtime behavior slightly)

**High Risk:**
- Modifying Prisma schema (requires database migration)
  - **Mitigation:** Create migration, test in development first

## Testing Strategy

After fixes:
1. Run TypeScript compiler: `npx tsc --noEmit`
2. Test affected API endpoints:
   - GET/POST `/api/products`
   - PATCH `/api/products/[productId]`
   - GET `/api/orders`
   - GET `/api/products/[productId]/variants`
3. Test affected pages:
   - Dashboard products page
   - Order success page
   - Storefront products page

## Notes

- The `globals.css` file exists but TypeScript needs proper module declarations
- Consider installing Vitest properly in the future for running tests
- The strict TypeScript configuration (`noUncheckedIndexedAccess`, `verbatimModuleSyntax`) is good for code quality but requires careful coding
- Some errors are in `.next` generated files, which will auto-fix once source files are corrected
