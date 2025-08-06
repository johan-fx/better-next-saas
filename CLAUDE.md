# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production bundle  
- `pnpm start` - Start production server

### Code Quality
- `pnpm lint` - Run Biome + Next.js linting (use this for full checks)
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Biome

### Database Operations
- `pnpm db:push` - Push schema to database (development)
- `pnpm db:generate` - Generate migrations
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio

### Testing
- `pnpm test:e2e` - Run E2E tests with Playwright
- `pnpm test:e2e:ui` - Run tests with UI
- `pnpm test:install` - Install Playwright browsers

### Email Development
- `pnpm email:dev` - Start React Email dev server (port 3001)

## Architecture Overview

This is a Next.js SaaS boilerplate using **hexagonal/modular architecture** with Better Auth integration.

### Key Technologies
- **Framework**: Next.js 15 with App Router and Turbopack
- **Auth**: Better Auth with organization/team support
- **Database**: Drizzle ORM with PostgreSQL (Neon)
- **API Layer**: tRPC with type-safe procedures
- **UI**: shadcn/ui components with Tailwind CSS
- **i18n**: next-intl with locale routing
- **Code Quality**: Biome for linting/formatting
- **Testing**: Playwright for E2E tests

### Project Structure
```
src/
├── app/[locale]/          # Internationalized routing
│   ├── (public)/          # Public pages with PublicHeader
│   ├── (private)/         # Protected pages (per-page auth)
│   └── api/               # API routes
├── lib/                   # Core configurations
│   ├── auth.ts            # Better Auth server config
│   ├── auth-client.ts     # Better Auth client config
│   ├── env.ts             # Centralized env validation
│   └── db/                # Database schema & config
├── modules/               # Feature modules (hexagonal architecture)
│   └── {domain}/
│       ├── server/        # tRPC procedures & utils
│       ├── ui/            # Components & views
│       ├── hooks/         # Custom React hooks
│       └── lib/           # Business logic
└── components/            # Shared UI components
```

## Critical Development Patterns

### Environment Variables
**ALWAYS** use centralized validation from `src/lib/env.ts`:
```typescript
import { env } from '@/lib/env'
// NEVER use process.env directly
```

### Authentication Patterns
**Protected pages** use per-page authentication with Better Auth UI:
```typescript
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui"

export default function ProtectedPage() {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <YourContentHere />
      </SignedIn>
    </>
  )
}
```

### Module Organization
- Pages in `src/app/[locale]/(private)/` must use views from `src/modules/{domain}/ui/views/`
- Each module is self-contained with server procedures, UI components, and business logic
- Use tRPC for type-safe API layer with authentication context

### Form Development
Use the complete shadcn Form pattern with Zod validation:
- Create Zod schema factory functions with translations
- Use React Hook Form with zodResolver
- Always use FormField, FormItem, FormLabel, FormControl, FormMessage

### Code Quality Requirements
- Tab indentation (configured in Biome)
- Double quotes for JavaScript/TypeScript
- Organize imports automatically
- Run `pnpm lint` before committing

### Database Patterns
- All tables defined in `src/lib/db/schema.ts` 
- Better Auth tables included automatically
- Use Drizzle ORM for type-safe queries
- Run `pnpm db:push` for schema changes in development

### Internationalization
- All routes under `/[locale]/` prefix
- Use `useTranslations("Domain")` hook
- Translation files in `src/messages/`
- Automatic locale detection and routing

## Testing Strategy

### E2E Testing with Playwright
- Tests in `tests/e2e/`
- MailDev integration for email testing
- Use `pnpm test:e2e:ui` for debugging
- Test helpers in `tests/e2e/utils/`

### Environment Setup
Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection
- `BETTER_AUTH_SECRET` - Min 32 characters
- `BETTER_AUTH_URL` - Auth endpoint URL
- Optional: GitHub/Google OAuth credentials

## Important Notes

- This project follows strict TypeScript patterns - maintain type safety
- Better Auth handles session management, user creation, and organization features
- Email templates use React Email with i18n support
- All forms include proper accessibility and validation
- The architecture supports multi-tenant organizations with role-based access