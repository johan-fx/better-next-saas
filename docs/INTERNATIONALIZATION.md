# Internationalization (i18n) Implementation

This document describes the internationalization setup for Deck Pilot using the `next-intl` library.

## Overview

The application now supports multiple languages with the following features:

- **Supported Languages**: English (en), Spanish (es)
- **URL Structure**: `/[locale]/...` (e.g., `/en/dashboard`, `/es/dashboard`)
- **Email Templates**: Internationalized email templates
- **Static Generation**: Optimized for static site generation
- **Language Switcher**: User-friendly language selection component

## Project Structure

```bash
src/
├── i18n/
│   ├── routing.ts          # Routing configuration
│   ├── navigation.ts       # Locale-aware navigation helpers
│   └── request.ts          # Server-side request configuration
├── app/
│   └── [locale]/           # Locale-specific pages
│       ├── layout.tsx      # Root layout with i18n provider
│       └── page.tsx        # Home page with translations
├── components/
│   └── language-switcher.tsx  # Language selection component
├── emails/
│   └── templates/
│       └── welcome-i18n.tsx   # Internationalized email template
├── lib/
│   └── email-i18n.ts      # Email i18n utilities
└── middleware.ts           # Locale detection middleware
messages/
├── en.json                 # English translations
└── es.json                 # Spanish translations
```

## Configuration Files

### 1. Routing Configuration (`src/i18n/routing.ts`)

Defines supported locales and default locale:

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'en'
});
```

### 2. Navigation Helpers (`src/i18n/navigation.ts`)

Provides locale-aware navigation components:

```typescript
import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

### 3. Request Configuration (`src/i18n/request.ts`)

Handles locale detection and message loading for Server Components:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

## Translation Files

Translation files are stored in the `messages/` directory using JSON format.

### Structure

```json
{
  "Common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "HomePage": {
    "title": "Welcome to Deck Pilot",
    "subtitle": "Your platform description"
  },
  "Email": {
    "welcome": {
      "subject": "Welcome to {appName}!",
      "greeting": "Hi {userName},",
      "title": "🎉 Welcome to {appName}!"
    }
  }
}
```

### Variables

Use curly braces for dynamic content:

- `{userName}` - User's name
- `{appName}` - Application name
- `{year}` - Current year

## Usage Examples

### In Server Components

```typescript
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';

export default async function Page({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  setRequestLocale(locale); // Enable static rendering
  
  const t = await getTranslations('HomePage');
  
  return <h1>{t('title')}</h1>;
}
```

### In Client Components

```typescript
'use client';
import { useTranslations } from 'next-intl';

export default function ClientComponent() {
  const t = useTranslations('Common');
  
  return <button>{t('save')}</button>;
}
```

### Navigation

```typescript
import { Link } from '@/i18n/navigation';

export function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/profile">Profile</Link>
    </nav>
  );
}
```

### Language Switcher

The `LanguageSwitcher` component allows users to change languages:

```typescript
import { LanguageSwitcher } from '@/modules/internationalization/ui/components/language-switcher';

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

## Email Internationalization

### Email Helper Functions

Located in `src/lib/email-i18n.ts`:

```typescript
import { getEmailTranslations } from '@/lib/email-i18n';

// Load translations for email templates
const t = await getEmailTranslations('en', 'Email.welcome');
```

### Internationalized Email Template

```typescript
import { getEmailTranslations, isEmailLocaleSupported } from '@/lib/email-i18n';

export default async function WelcomeEmailI18n({
  userName,
  locale: userLocale,
  appName = "Deck Pilot"
}: WelcomeEmailProps) {
  const locale = isEmailLocaleSupported(userLocale || 'en') 
    ? userLocale || 'en' 
    : 'en';
    
  const t = await getEmailTranslations(locale, 'Email.welcome');
  
  return (
    <Html>
      <Body>
        <h1>{t('title', { appName })}</h1>
        <p>{t('greeting', { userName })}</p>
      </Body>
    </Html>
  );
}
```

## Static Generation

The setup supports static generation for better performance:

1. **generateStaticParams**: Pre-generates pages for all locales
2. **setRequestLocale**: Enables static rendering for specific locales
3. **Metadata generation**: Supports localized metadata

```typescript
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  
  return {
    title: t('title')
  };
}
```

## Adding New Languages

To add a new language (e.g., French):

**1. Update routing configuration**:

   ```typescript
   // src/i18n/routing.ts
   export const routing = defineRouting({
     locales: ['en', 'es', 'fr'],
     defaultLocale: 'en'
   });
   ```

**2. Create translation file**:

   ```bash
   # Copy existing translation and translate
   cp messages/en.json messages/fr.json
   ```

**3. Update language switcher**:

   ```typescript
   // src/components/language-switcher.tsx
   const languages = [
     { code: 'en', name: 'English', flag: '🇺🇸' },
     { code: 'es', name: 'Español', flag: '🇪🇸' },
     { code: 'fr', name: 'Français', flag: '🇫🇷' },
   ];
   ```

**4. Update email locale support**:

   ```typescript
   // src/lib/email-i18n.ts
   export const supportedEmailLocales = ['en', 'es', 'fr'] as const;
   ```

## URLs and Routing

- **Default locale** (`en`): `/en/` or `/` (with proper middleware setup)
- **Other locales**: `/es/`, `/fr/`, etc.
- **All routes are prefixed** with the locale segment
- **Middleware handles** automatic locale detection and redirection

## Best Practices

1. **Use namespace organization** in translation files for better structure
2. **Include context** in translation keys (e.g., `Button.save` vs `Form.save`)
3. **Test with different locales** during development
4. **Use variables sparingly** and prefer separate keys for different contexts
5. **Keep email templates simple** for better cross-client compatibility
6. **Use setRequestLocale** in all pages for static generation
7. **Validate locale parameters** in dynamic routes

## Testing

Test the implementation:

**1. Start development server**:

   ```bash
   pnpm dev
   ```

**2. Navigate to different locales**:

- English: `http://localhost:3000/en`
- Spanish: `http://localhost:3000/es`

**3. Test language switcher** on the home page

**4. Test email templates**:

   ```bash
   pnpm email:dev
   ```

## Troubleshooting

### Common Issues

1. **Middleware not working**: Check the matcher pattern in `middleware.ts`
2. **Missing translations**: Verify JSON syntax and key existence
3. **Static generation errors**: Ensure `setRequestLocale` is called in all pages
4. **Email translations failing**: Check locale support in email utilities

### Debug Mode

Enable debug logging by setting environment variable:

```bash
NEXT_INTL_DEBUG=true pnpm dev
```

## Performance Considerations

- **Static generation** is enabled for all locales
- **Translation files** are loaded only when needed
- **Middleware** runs efficiently with optimized matching
- **Email translations** are cached for better performance
- **Bundle splitting** ensures locale-specific chunks
