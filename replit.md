# Overview

This is a React-based stock market analysis and investment platform called "InvestAI". The application provides AI-powered stock recommendations, market data visualization, portfolio tracking, news aggregation, and comprehensive authentication system. It features a modern dashboard interface with components for market indices, trending stocks, AI recommendations, watchlists, alerts, and market news. Users can log in with Replit Auth (supporting Google and other OAuth providers) to access personalized investment features. The platform includes both Indian stock trading and international forex trading capabilities, designed to help users make informed investment decisions through data-driven insights and AI analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with React 18 using TypeScript for type safety
- **UI Framework**: Utilizes shadcn/ui components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Express.js Server**: RESTful API server with middleware for logging and error handling
- **Authentication**: Replit Auth with OpenID Connect supporting Google and other OAuth providers
- **Database**: PostgreSQL with Drizzle ORM for production-ready data persistence
- **Session Management**: PostgreSQL-backed sessions with automatic session cleanup
- **API Design**: RESTful endpoints for stocks, recommendations, market indices, news, watchlist, alerts, portfolio data, and forex trading
- **Development Server**: Vite integration for HMR and development proxy

## Data Layer
- **Database Schema**: Drizzle ORM with PostgreSQL schemas defined for all entities (stocks, recommendations, market indices, news, watchlist, alerts, portfolio)
- **Type Safety**: Drizzle-Zod integration for runtime validation and type inference
- **Storage Interface**: Abstract storage interface (IStorage) allowing for easy swapping between in-memory and database implementations

## Component Architecture
- **Modular Design**: Each major feature has its own component (MarketOverview, AIRecommendations, Watchlist, etc.)
- **Reusable UI Components**: Comprehensive UI component library with consistent styling and behavior
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation and responsive layouts
- **Data Fetching**: Components use React Query hooks for automatic caching, background updates, and error handling

## Development and Deployment
- **TypeScript Configuration**: Strict typing with path aliases for clean imports
- **Build Process**: Separate client and server builds with esbuild for server bundling
- **Environment Handling**: Different configurations for development and production environments
- **Asset Management**: Static asset serving with proper caching strategies

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **UI Framework**: Radix UI primitives, shadcn/ui components, Tailwind CSS for styling
- **Development Tools**: Vite, TypeScript, ESBuild for build tooling

## Backend Dependencies
- **Server Framework**: Express.js with middleware for JSON parsing and URL encoding
- **Database Layer**: Drizzle ORM with PostgreSQL adapter (@neondatabase/serverless)
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, Vite plugins for development integration

## Utility Libraries
- **Date Handling**: date-fns for date manipulation and formatting
- **Styling Utilities**: clsx and class-variance-authority for conditional styling
- **Form Handling**: React Hook Form with Hookform resolvers for validation
- **Icons and UI**: Lucide React icons, Font Awesome CSS for additional icons

## Development and Build Tools
- **Bundling**: Vite for development server and client builds, ESBuild for server bundling
- **Code Quality**: TypeScript for type checking, PostCSS with Autoprefixer
- **Replit Integration**: Replit-specific plugins for development environment integration