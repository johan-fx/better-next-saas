# Modern Next.js Boilerplate with Better Auth

A comprehensive, production-ready Next.js boilerplate built with the latest and most popular libraries for modern web development. This project provides a solid foundation for building scalable, type-safe web applications with enterprise-grade authentication features.

## 🚀 Tech Stack

### Core Framework

- **[Next.js](https://nextjs.org)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[React](https://react.dev)** - User interface library

### UI & Styling

- **[shadcn/ui](https://ui.shadcn.com)** - Beautiful, accessible UI components built on Radix UI and Tailwind CSS
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework

### Type-Safe API Layer

- **[tRPC](https://trpc.io/)** - Type-safe API handling with automatic client generation
  - End-to-end type safety from server to client
  - Automatic TypeScript client generation
  - Built-in request/response validation

### Database & ORM

- **[Drizzle ORM](https://orm.drizzle.team)** - Type-safe database ORM
- **[Neon](https://neon.tech)** - Serverless PostgreSQL database
- **[Neon Studio](https://console.neon.tech)** - Database management interface

### Authentication & Authorization

- **[Better Auth](https://better-auth.com)** - Comprehensive authentication framework
  - Email/password authentication
  - Social OAuth providers (Google, GitHub, etc.)
  - Two-factor authentication (2FA)
  - Organizations, teams, and role-based permissions
  - Session management
  - Magic links and passkeys support

- **[@daveyplate/better-auth-ui](https://better-auth-ui.com)** - Ready-to-use shadcn/ui styled authentication components
  - Pre-built sign-in, sign-up, and password reset forms
  - Fully responsive UI components with dark/light mode support
  - Seamless integration with Better Auth

### Session Storage & Caching

- **[Upstash Redis](https://upstash.com)** - Serverless Redis database (Optional)
  - Session storage for Better Auth
  - Permission caching
  - Application-level caching

### Privacy & Compliance

- **[c15t](https://c12n.io)** - Cookie consent and privacy compliance
  - GDPR compliance
  - Cookie categorization
  - Consent management
  - Privacy policy integration

### URL State Management

- **[nuqs](https://nuqs.47ng.com)** - Type-safe search params state manager
  - URL-synced state management
  - Type-safe query parameters
  - Server-side rendering support
  - History management

### Internationalization & Localization

- **[next-intl](https://next-intl-docs.vercel.app)** - Complete i18n solution for Next.js
  - Type-safe internationalization with TypeScript support
  - Server and client component support
  - Internationalized routing with locale prefixes
  - Message namespacing and nested translations
  - Date, number, and currency formatting
  - Pluralization and rich text support

- **[Languine](https://languine.ai)** - AI-powered locale translation and management
  - Multi-language support with automated translations
  - Context-aware AI translations
  - Translation management dashboard
  - Real-time locale switching
  - Integration with popular translation services

## ✨ Features

- **🔐 Complete Authentication System with Better Auth**
  - User registration and login with email/password
  - Social authentication (GitHub, Google)
  - Session management with secure cookies
  - Type-safe authentication context throughout the app
- **Pre-built UI Components**
  - Uses `@daveyplate/better-auth-ui` for ready-to-use authentication forms and components
- **tRPC Integration** - Authentication-aware procedures

- **🗄️ Database Ready**
  - PostgreSQL with Neon
  - Type-safe database operations with Drizzle ORM
  - Database migrations and schema management
  - Connection pooling

- **🚀 Type-Safe API Layer with Better Auth**
  - **Public Procedures** - Available to all users (authenticated and unauthenticated)
  - **Private Procedures** - Require authentication, guaranteed user context
  - Automatic authentication checks
  - Type-safe session and user information
  - End-to-end type safety from server to client

- **🎨 Modern UI**
  - Beautiful, accessible components
  - Dark/light mode support
  - Responsive design
  - Loading states and error handling

- **⚡ Performance Optimized**
  - Session management with Better Auth
  - Optimized database queries
  - CDN-ready assets
  - Server-side rendering optimization

- **📱 Privacy Compliant**
  - GDPR compliance
  - Cookie consent management
  - Privacy controls
  - Data protection features

- **🌍 Multi-Language Support**
  - Complete i18n solution with `next-intl`
  - Type-safe translations with TypeScript
  - Internationalized routing and navigation
  - Server and client component support
  - AI-powered translations with `Languine`
  - Dynamic locale switching and message namespacing

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn
- Neon PostgreSQL database

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/deck-pilot.git
    cd deck-pilot
    ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/better-saas"
   
   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key-at-least-32-characters-long"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   # Push the schema to your database
   npm run db:push
   
   # Or generate and run migrations
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

    Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

This boilerplate follows a **hexagonal (modular) architecture** with **Better Auth integration** that promotes separation of concerns, maintainability, and scalability.

### **🏗️ Hexagonal Architecture Benefits:**

- **🔒 Encapsulation** - Each module contains all its related functionality
- **🔄 Reusability** - Shared components and utilities in the `shared` module
- **🧪 Testability** - Isolated modules are easier to test independently
- **📈 Scalability** - Add new modules without affecting existing ones
- **🛠️ Maintainability** - Clear boundaries between different business domains
- **👥 Team Collaboration** - Teams can work on different modules independently
- **🔐 Authentication-First** - Built-in authentication context throughout the application

```bash
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── [locale]/                 # Internationalized routes
│   │   │   ├── (private)/            # 🔒 Private/Protected Route Group
│   │   │   │   ├── layout.tsx        # Authentication wrapper + sidebar
│   │   │   │   └── dashboard/        # Protected dashboard section
│   │   │   │       └── page.tsx      # Main dashboard page
│   │   │   ├── (public)/            # 🔒 Public Route Group
│   │   │   │   └── auth/    # Protected dashboard section
│   │   └── api/             # API routes
│   │       ├── auth/        # Better Auth endpoints
│   │       └── trpc/         # tRPC endpoints
│   ├── styles/                 # Core configurations
│   │   └── globals.css      # Global styles
│   ├── lib/                 # Core configurations
│   │   ├── auth.ts          # Better Auth server configuration
│   │   ├── auth-client.ts   # Better Auth client configuration
│   │   ├── env.ts           # Environment validation (CENTRALIZED)
│   │   └── db/              # Database configuration
│   ├── trpc/                # tRPC exports and documentation
│   ├── components/          # Shared UI components
│   ├── hooks/               # Shared React hooks
│   ├── messages/            # Translation files
│   ├── modules/
│   │   ├── {domain}/
│   │   │   ├── server/
│   │   │   │   ├── params.ts  # NUQS Query params definitions
│   │   │   │   └── router.ts  # tRPC procedures router
│   │   │   ├── ui/
│   │   │   │   ├── components/  # Reusable components
│   │   │   │   └── views/       # Page-level components
│   │   │   ├── lib/             # Business logic, utils
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   └── types.ts         # TypeScript type definitions
```

## 🔧 Key Configuration Files

### **Authentication & API Configuration:**

- **`src/lib/auth.ts`** - Better Auth server configuration with Drizzle adapter
- **`src/lib/auth-client.ts`** - Better Auth client configuration for React hooks
- **`src/trpc/routers/_app.ts`** - tRPC router with public/private procedure abstractions
- **`src/app/api/auth/[...all]/route.ts`** - Better Auth API route handler
- **`src/app/api/trpc/[trpc]/route.ts`** - tRPC API route handler with auth context

### **Database & Schema:**

- **`src/lib/db/schema.ts`** - Drizzle schema for Better Auth tables
- **`drizzle.config.ts`** - Database configuration and migration settings
- **`src/lib/env.ts`** - Type-safe environment variable validation

## 🗄️ Database Scripts

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (development)
npm run db:push

# Open Drizzle Studio
npm run db:studio

# Drop all tables (caution!)
npm run db:drop
```

## 📚 Documentation & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 🚀 Deployment

This boilerplate is optimized for deployment on:

- **[Vercel](https://vercel.com)** (recommended for Next.js)
- **[Netlify](https://netlify.com)**
- **[Railway](https://railway.app)**

Make sure to configure your environment variables in your deployment platform.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to improve the boilerplate.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using modern web technologies and **Better Auth** for the Next.js ecosystem.
