# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with Astro.js for writing about security, CTF writeups, and tech topics. Based on the [MultiTerm Astro](https://github.com/stelcodes/multiterm-astro) theme.

## Development Commands

```bash
bun run dev        # Start development server (localhost:4321)
bun run build      # Build production site
bun run postbuild  # Generate search index (run after build)
bun run preview    # Preview production build locally
bun run format     # Format code with Prettier
```

## Architecture

### Core Framework
- **Astro 5.x** - Static site generator with content collections
- **React 19.x** - For interactive/animated components (`.tsx` files)
- **MDX** - Markdown with JSX support for posts
- **Tailwind CSS 4.x** - Utility-first styling

### Path Aliases
`~/*` maps to `src/*` (configured in `tsconfig.json`)

### Key Directories
- `src/content/posts/` - Blog posts (`.md` or `.mdx`)
- `src/components/` - Astro components (`.astro`) and React components (`.tsx`)
- `src/components/animations/` - Interactive React/Three.js visualizations
- `src/plugins/` - Custom Remark and Rehype plugins for Markdown processing
- `src/site.config.ts` - Site-wide configuration (themes, navigation, metadata)

### Content Processing Pipeline
Markdown/MDX posts go through a chain of custom plugins (defined in `astro.config.mjs`):
- **Remark plugins** (parse/markup phase): description extraction, reading time, directives, GitHub cards, admonitions, character dialogues, math, emoji shortcodes
- **Rehype plugins** (transform phase): heading IDs, autolinking, external links, image processing, KaTeX math rendering

## Custom Content Features

### Character Dialogues
Use custom directives for conversational elements (avatars configured in `site.config.ts`):
```md
:::owl
Look at this wise observation!
:::

:::unicorn
Here's a magical insight!
:::

:::duck
Just a friendly quack!
:::
```

### GitHub Repository Cards
```md
:::github username/repo-name
:::
```

### Standard Admonitions
```md
:::tip
:::note
:::important
:::caution
:::warning
:::
```

### Math Equations
LaTeX math supported via KaTeX (inline: `$...$`, block: `$$...$$`)

## Theming System

The site supports 30+ editor themes that affect both site appearance and syntax highlighting. Themes are Shiji themes bundled via Expressive Code.

Configuration in `src/site.config.ts`:
- `themes.mode` - "single" | "select" | "light-dark-auto"
- `themes.default` - Default theme identifier
- `themes.include` - Array of theme names to bundle
- `themes.overrides` - Custom color overrides per theme

Theme affects: background, foreground, headings, links, code blocks, admonitions, borders, etc.

## Interactive Components

Complex visualizations (especially LLM-related) use:
- **Three.js + React Three Fiber** - 3D graphics
- **Framer Motion** - Animations
- **@react-three/drei** - Three.js helpers

These are hydrated client-side while the rest of the site remains static.

## Configuration Files

- `astro.config.mjs` - Astro build config, plugins, integrations
- `src/site.config.ts` - Site metadata, navigation, themes, social links
- `tsconfig.json` - TypeScript with strict mode and path aliases
- `prettier.config.js` - Code style (no semicolons, single quotes, 90 char width)

## Post Frontmatter

Posts use frontmatter with fields like:
- `title` - Post title
- `published` - Publication date (YYYY-MM-DD)
- `description` - Short description for SEO/cards
- `tags` - Array of topic tags
- `toc` - Table of contents settings
- `draft` - Set to true to exclude from build

## Search

Full-text search powered by Pagefind. After `npm run build`, always run `npm run postbuild` to generate the search index in `dist/pagefind/`.
