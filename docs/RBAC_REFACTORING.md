# RBAC Refactoring Documentation

## Overview

The RBAC (Role-Based Access Control) system has been refactored to eliminate code duplication, improve maintainability, and enhance developer experience. This document outlines the changes made and how to use the improved system.

## Problems Addressed

### 1. **Code Duplication**

- Type definitions (`Resource`, `Action`, `Permission`, `ValidRole`) were duplicated across `client.ts` and `server.ts`
- Role checking logic was nearly identical between client and server implementations
- Similar error handling patterns were repeated
- API response parsing logic was duplicated

### 2. **Maintainability Issues**

- Changes required updates in multiple files
- Inconsistent error handling across modules
- Limited shared functionality between client and server

## Refactoring Changes

### Enhanced `shared.ts`

The shared module now contains:

#### **New Type Definitions**

```typescript
// API response structures for better type safety
export interface MemberData {
  role: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  success?: boolean;
  [key: string]: unknown;
}
```

#### **Error Handling Utilities**

```typescript
// Custom error class for RBAC operations
export class RBACError extends Error {
  constructor(message: string, public operation: string, public originalError?: unknown);
}

// Standardized error handler
export function handleRBACError(
  error: unknown,
  operation: string,
  fallbackValue: boolean = false
): boolean;
```

#### **Shared Business Logic**

```typescript
// Parse member role from API responses
export function extractRoleFromMemberData(
  memberResult: ApiResponse<MemberData> | null | undefined
): string | null;

// Validate user role against target role
export function validateUserRole(
  extractedRole: string | null,
  targetRole: ValidRole
): boolean;

// Handle permission API responses consistently
export function handlePermissionResponse(result: ApiResponse): boolean;
```

### Refactored `client.ts`

#### **Eliminated Duplication**

- Removed duplicate type definitions
- Uses shared error handling utilities
- Leverages shared role validation logic

#### **New Features**

```typescript
// Batch check multiple roles efficiently
static async hasAnyRole(roles: ValidRole[]): Promise<boolean>;

// Get current user's role
static async getCurrentRole(): Promise<string | null>;
```

### Refactored `server.ts`

#### Eliminated Duplication

- Removed duplicate type definitions
- Uses shared error handling utilities
- Leverages shared role validation logic

#### New Features

```typescript
// Batch check multiple roles efficiently
static async hasAnyRole(roles: ValidRole[]): Promise<boolean>;

// Get current user's role
static async getCurrentRole(): Promise<string | null>;

// Require any of multiple permissions (OR logic)
static async requireAnyPermission(
  permissionsList: Permission[],
  locale?: string,
  fallbackUrl?: string
);
```

### Updated `rbac.ts` Main Export

The main export file now includes all new shared utilities while maintaining proper server/client separation.

## Usage Examples

### Client Components

```typescript
import { ClientPermissions, CommonPermissions, RoleChecks } from "@/lib/rbac";

// Check permissions
const hasAccess = await ClientPermissions.hasPermission(CommonPermissions.ADMIN_ACCESS);

// Check single role
const isAdmin = await ClientPermissions.hasRole("admin");

// Check multiple roles efficiently
const canManage = await ClientPermissions.hasAnyRole(["admin", "projectManager"]);

// Get current role
const currentRole = await ClientPermissions.getCurrentRole();

// Use role shortcuts
const canManageUsers = RoleChecks.canManageUsers(currentRole);
```

### Server Components

```typescript
import { ServerPermissions } from "@/lib/rbac/server";
import { CommonPermissions, RoleChecks } from "@/lib/rbac";

// Require authentication
const session = await ServerPermissions.requireAuth("en");

// Require specific permissions
await ServerPermissions.requirePermissions(
  CommonPermissions.PROJECT_MANAGER,
  "en",
  "/dashboard"
);

// Require specific role
await ServerPermissions.requireRole("admin", "en");

// Require any of multiple permissions
await ServerPermissions.requireAnyPermission([
  CommonPermissions.ADMIN_ACCESS,
  CommonPermissions.FINANCE_ACCESS
], "en");

// Check multiple roles
const hasManagementRole = await ServerPermissions.hasAnyRole([
  "admin", 
  "projectManager"
]);
```

### Error Handling

```typescript
import { RBACError, handleRBACError } from "@/lib/rbac";

try {
  // RBAC operation
} catch (error) {
  if (error instanceof RBACError) {
    console.log(`RBAC operation '${error.operation}' failed:`, error.message);
  }
  // Handle with utility
  return handleRBACError(error, "custom operation", false);
}
```

## Benefits

### 1. Reduced Code Duplication

- **Before:** 3 files with duplicated types and logic (~300 lines total)
- **After:** Shared utilities eliminate ~50% duplication

### 2. Improved Maintainability

- Single source of truth for types and common logic
- Consistent error handling across all modules
- Easier to add new features or fix bugs

### 3. Enhanced Developer Experience

- Better TypeScript support with shared interfaces
- More utility methods for common operations
- Clearer separation of concerns

### 4. Better Performance

- Batch operations for checking multiple roles
- Reduced redundant API calls
- More efficient error handling

### 5. Consistent API Surface

- Standardized method names and signatures
- Uniform error responses
- Predictable behavior across client/server

## Migration Guide

### Existing Code Using Old Structure

Most existing code will continue to work without changes due to maintained API compatibility.

### Recommended Updates

**1. Replace duplicate role checks:**

  ```typescript
  // Before
  const isAdmin = await hasRole("admin");
  const isProjectManager = await hasRole("projectManager");

  // After
  const hasManagementRole = await hasAnyRole(["admin", "projectManager"]);
  ```

**2. Use shared error handling:**

  ```typescript
  // Before
  try {
    // operation
  } catch (error) {
    console.error("Operation failed:", error);
    return false;
  }

  // After
  try {
    // operation
  } catch (error) {
    return handleRBACError(error, "operation name");
  }
  ```

**3. Leverage new utilities:**

  ```typescript
  // Get current role instead of checking each one
  const currentRole = await getCurrentRole();
  const canAccess = RoleChecks.canManageProjects(currentRole);
  ```

## Best Practices

1. **Import from appropriate modules:**
   - Use `@/lib/rbac` for shared utilities and client permissions
   - Use `@/lib/rbac/server` directly for server-only operations

2. **Prefer batch operations:**
   - Use `hasAnyRole()` instead of multiple `hasRole()` calls
   - Use `requireAnyPermission()` for OR-logic requirements

3. **Use shared utilities:**
   - Leverage `RoleChecks` for common role validations
   - Use `CommonPermissions` for predefined permission sets

4. **Handle errors consistently:**
   - Use `handleRBACError()` for uniform error handling
   - Catch `RBACError` for specific RBAC-related errors

## Future Enhancements

The refactored structure enables easier implementation of:

- Permission caching mechanisms
- Role-based UI component rendering
- Advanced permission combinations
- Audit logging for RBAC operations
- Dynamic permission loading
