# Technology Stack

**Analysis Date:** 2026-01-29

## Languages

**Primary:**
- HTML - Templates via Hugo (Go templating language)
- CSS - Tailwind CSS with PostCSS processing
- JavaScript - Client-side animation and interactivity

**Secondary:**
- TOML - Hugo configuration (`hugo.toml`)
- YAML - GitHub Actions workflows (`.github/workflows/deploy.yml`)

## Runtime

**Environment:**
- Hugo static site generator (installed via Nix)
- Node.js - Used for npm dependencies and build tooling
- nginx - Web server (Alpine Linux based in production)

**Package Manager:**
- npm - JavaScript package management
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Hugo - Static site generator for blog platform
- Tailwind CSS 3.4.0 - Utility-first CSS framework
- PostCSS 8.4.32 - CSS transformation pipeline

**Styling:**
- @tailwindcss/typography 0.5.10 - Prose styling plugin for markdown content
- autoprefixer 10.4.16 - Vendor prefix management

**Search:**
- Pagefind 1.0.4 - Client-side search index generation and UI

## Key Dependencies

**Critical:**
- Hugo with extended features (via `hugomods/hugo:exts` Docker image) - Site generation with asset pipeline
- tailwindcss 3.4.0 - CSS generation for design system
- postcss-cli 11.0.0 - CLI tool for PostCSS pipeline execution
- pagefind 1.0.4 - Static search functionality without backend

**Build Tools:**
- npm - Dependency management
- Docker & Docker Compose - Containerization and orchestration

## Configuration

**Environment:**
- Nix Flake (`flake.nix`) for reproducible development environment
  - Provides: Hugo, Node.js
- Hugo configuration in `hugo.toml`:
  - Base URL: `https://blog.danfrevel.de/`
  - Language: English (US)
  - Pagination: 10 items per page
  - Markup: Chroma syntax highlighting with Dracula style
  - Taxonomies: Tags and categories
  - RSS output enabled

**Build:**
- `tailwind.config.js` - Tailwind CSS configuration with fluid typography, dark mode support
- `postcss.config.js` - PostCSS plugin pipeline (tailwindcss, autoprefixer)
- `Dockerfile` - Multi-stage build: Hugo builder + nginx runtime
- `nginx.conf` - Web server configuration with caching, compression, security headers

## Platform Requirements

**Development:**
- Nix (for reproducible environment via `flake.nix`)
- Node.js (managed via Nix)
- Hugo with extended features

**Production:**
- Docker - Container runtime
- Traefik reverse proxy (for SSL/TLS termination via docker-compose)
- Nginx alpine - Lightweight web server in container
- Linux host for Docker Compose orchestration

## Build & Deploy Process

**Local Development:**
```bash
npm install                    # Install CSS/search dependencies
hugo server --buildDrafts      # Start dev server with draft posts
```

**Production Build:**
```bash
hugo --minify                  # Build optimized static site
npx pagefind --site public    # Generate search index
docker build .                 # Build Docker image
docker push                    # Push to ghcr.io registry
```

**Deployment:**
- GitHub Actions CI/CD (`deploy.yml`)
- Builds Docker image → Pushes to GitHub Container Registry (ghcr.io)
- SSH deploys to remote server via Docker Compose
- Traefik handles HTTPS with Let's Encrypt certificates

---

*Stack analysis: 2026-01-29*
