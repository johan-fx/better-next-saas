# User Preferences Implementation

This document describes the implementation of user preferences storage for handling user language and other settings during signup and throughout the application lifecycle.

## Architecture Decision

### Chosen Approach: Separate Preferences Table

We implemented a separate `user_preferences` table instead of adding columns directly to the `users` table for the following reasons:

### ✅ Advantages

- **Scalability**: Easy to add new preferences without modifying the core users table
- **Performance**: Reduces the size of the frequently-queried users table
- **Flexibility**: Supports complex preference structures via JSON field
- **Modularity**: Clear separation of concerns between authentication and preferences
- **Future-proof**: Ready for additional preference types (notifications, UI settings, etc.)

### ❌ Alternative: Direct User Table Storage

- Would require schema migrations for each new preference
- Bloats the core authentication table
- Less flexible for complex preference structures

## Database Schema

### Table: `user_preferences`

```sql
CREATE TABLE "user_preferences" (
    "id" text PRIMARY KEY NOT NULL,
    "userId" text NOT NULL UNIQUE,
    "language" text DEFAULT 'en' NOT NULL,
    "theme" text DEFAULT 'system',
    "timezone" text DEFAULT 'UTC', 
    "emailNotifications" boolean DEFAULT true NOT NULL,
    "additionalPreferences" text, -- JSON for future preferences
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);
```

### Supported Languages

- `en` - English (default)
- `es` - Spanish

### Supported Themes

- `light` - Light theme
- `dark` - Dark theme
- `system` - Follow system preference (default)

## Implementation Components

### 1. Database Schema (`src/lib/db/schema.ts`)

- Defines the `userPreferences` table with Drizzle ORM
- Exports TypeScript types for type safety
- Includes proper foreign key relationships

### 2. Better Auth Integration (`src/lib/auth.ts`)

- **Database Hooks**: Automatically creates default preferences on user signup
- **Language Detection**:
  - First priority: Explicit language from signup form
  - Second priority: `Accept-Language` header via i18n utils
  - Third priority: Custom language detector 
  - Fallback: English (`en`)

### 3. Utility Functions (`src/modules/users/server/utils/user-preferences.ts`)

- `getUserPreferences()` - Get user preferences (creates defaults if missing)
- `updateUserPreferences()` - Update multiple preferences at once
- `updateUserLanguage()` - Update language with validation
- `updateUserTheme()` - Update theme with validation
- `setAdditionalPreference()` - Store custom preference in JSON field
- `getAdditionalPreference()` - Retrieve custom preference from JSON field

## Usage Examples

### 1. Getting User Preferences

```typescript
import { getUserPreferences } from '@/modules/users/server/utils/user-preferences';

// Get preferences (creates defaults if none exist)
const preferences = await getUserPreferences(userId);
console.log(preferences.language); // 'en', 'es', etc.
console.log(preferences.theme); // 'light', 'dark', 'system'
```

### 2. Updating Language Preference

```typescript
import { updateUserLanguage } from '@/modules/users/server/utils/user-preferences';

// Update user's language
const updated = await updateUserLanguage(userId, 'es');
```

### 3. Adding Custom Preferences

```typescript
import { setAdditionalPreference, getAdditionalPreference } from '@/modules/users/server/utils/user-preferences';

// Set a custom preference
await setAdditionalPreference(userId, 'compactMode', true);

// Get a custom preference
const compactMode = await getAdditionalPreference(userId, 'compactMode', false);
```

## Language Detection Flow

During user signup, the system determines the user's preferred language using this priority order:

1. **Explicit Selection**: Language specified in signup form (`language` field)
2. **i18n Headers**: Using existing `resolveLocaleFromHeaders()` utility
3. **Accept-Language**: Custom parsing of browser `Accept-Language` header
4. **Default Fallback**: English (`en`)

```typescript
// Example signup with language preference
const signupResponse = await auth.api.signUpEmail({
  email: "user@example.com",
  password: "password",
  name: "John Doe",
  language: "es" // Spanish preference
});
```

## Database Hooks Implementation

The Better Auth configuration includes database hooks that automatically create user preferences:

```typescript
databaseHooks: {
  user: {
    create: {
      after: async (user, ctx) => {
        // Detect language from request context
        let preferredLanguage = "en";
        
        if (ctx?.body?.language) {
          preferredLanguage = ctx.body.language;
        } else if (ctx?.request?.headers) {
          // Parse Accept-Language header
          preferredLanguage = detectLanguageFromHeaders(
            ctx.request.headers.get("accept-language")
          );
        }
        
        // Create default preferences
        await db.insert(schema.userPreferences).values({
          id: `pref_${user.id}`,
          userId: user.id,
          language: preferredLanguage,
          // ... other defaults
        });
      },
    },
  },
}
```

## Testing

To test the implementation:

1. **Sign up a new user** - Check that preferences are created automatically
2. **Test language detection** - Signup with different `Accept-Language` headers

## Best Practices

1. **Always validate language codes** before storing them
2. **Use the utility functions** rather than direct database queries
3. **Handle missing preferences gracefully** (functions create defaults)
4. **Consider performance** when querying preferences frequently
5. **Use the `additionalPreferences` JSON field** for app-specific settings

## Future Extensions

The current implementation is designed to easily support:

- **Notification preferences** (push, email, SMS)
- **UI preferences** (compact mode, sidebar position)
- **Accessibility preferences** (high contrast, font size)
- **Privacy preferences** (analytics, cookies)
- **Regional preferences** (currency, date format)

Add new structured preferences as table columns, or use the `additionalPreferences` JSON field for flexible key-value storage.
