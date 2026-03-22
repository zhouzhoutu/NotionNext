# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotionNext is a Next.js blog system that uses Notion as a CMS/backend. Content is fetched from Notion via the Notion API and rendered as a static blog. Supports multiple themes and multi-language configurations.

## Development Commands

```bash
# Development
npm run dev              # Start development server on localhost:3000
npm run build            # Production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint errors
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking
npm run quality          # Run full quality checks

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:ci          # CI mode (no watch, with coverage)

# Git Hooks
npm run setup-hooks      # Install pre-commit/pre-push hooks
npm run check-hooks      # Check hook status

# Utilities
npm run init-dev         # Initialize development environment
npm run bundle-report    # Analyze bundle size
```

## Architecture

### Theme System

Themes are located in `/themes/` and work as self-contained packages. Each theme exports named Layout components:

- `LayoutBase` - Main wrapper with header, footer, sidebar
- `LayoutIndex` - Homepage/blog list
- `LayoutPostList` - Category/tag archive pages
- `LayoutSearch` - Search results page
- `LayoutSlug` - Individual post/article page
- `Layout404` - 404 error page
- `LayoutArchive` - Timeline/archive view
- `LayoutCategoryIndex` / `LayoutTagIndex` - Category/tag listing

The active theme is configured via `NEXT_PUBLIC_THEME` in `blog.config.js`. Themes are dynamically loaded via `themes/theme.js` which maps the theme name to the theme's components.

Key theme files:
- `themes/[theme]/index.js` - Layout components
- `themes/[theme]/config.js` - Theme-specific configuration
- `themes/[theme]/style.js` - Theme-specific styles
- `themes/[theme]/components/` - Theme-specific React components

### Configuration

Main config: `blog.config.js`
Additional configs in `/conf/` directory:
- `comment.config.js` - Comment system (Twikoo, Giscus, Utterances, etc.)
- `post.config.js` - Post list and article settings
- `analytics.config.js` - Analytics integration
- `image.config.js` - Image handling
- `widget.config.js` - Floating widgets (chat, pets, music player)
- `plugin.config.js` - Third-party plugins (Algolia search)
- `layout-map.config.js` - Custom route-to-layout mappings

### Data Flow

1. Pages in `/pages` use `getStaticProps` / `getServerSideProps` to fetch data
2. Data fetching uses `lib/notion/` utilities to query Notion API
3. Pages select a Layout component based on route
4. Layout renders theme-specific components with the fetched data

### Key Paths

```
/components/     - Global React components
/pages/          - Next.js pages and API routes
/themes/         - Theme packages
/lib/utils/      - Utility functions
/lib/site/       - Site-wide utilities
/lib/plugins/    - Plugin system
/lib/cache/      - Caching utilities
/conf/           - Configuration modules
```

## Testing

Tests are in `__tests__/` directory with Jest. Module aliases are configured in `jest.config.js`:
- `@/` maps to `<rootDir>/`
- `@/components/` maps to `components/`
- `@/lib/` maps to `lib/`

## Environment Variables

Required:
- `NOTION_PAGE_ID` - Your Notion page ID

Common optional variables:
- `NEXT_PUBLIC_THEME` - Theme name (default: 'simple')
- `NEXT_PUBLIC_LANG` - Language (e.g., 'zh-CN', 'en-US')
- `NEXT_REVALIDATE_SECOND` - ISR cache duration

## Multi-Language

Configure multiple language page IDs in `NOTION_PAGE_ID` with format: `pageId1,zh:pageId2,en:pageId3`. The prefix before `:` is the language code.

## Code Style

- Components: PascalCase files and component names
- Utilities: camelCase
- Config files: camelCase or kebab-case
- Uses Prettier for formatting, ESLint for linting
- Conventional Commits for git messages
