# Codebase Structure

**Analysis Date:** 2026-01-29

## Directory Layout

```
/home/dan/code/blog/
├── content/                    # Author-facing markdown content
│   ├── posts/                  # Blog post articles
│   │   └── _index.md          # Post section metadata
│   └── about.md               # About page
├── layouts/                    # Hugo templates (HTML + Go template syntax)
│   ├── _default/              # Default templates for content types
│   │   ├── baseof.html        # Base template (page wrapper)
│   │   ├── single.html        # Single page/post template
│   │   └── list.html          # List/archive template
│   ├── index.html             # Homepage template
│   ├── 404.html               # 404 error page
│   └── partials/              # Reusable template components
│       ├── head.html          # <head> section
│       ├── header.html        # Navigation header
│       ├── footer.html        # Footer
│       └── scripts.html       # JavaScript initialization
├── archetypes/                # Template stubs for new content
│   └── default.md             # Default archetype for new posts
├── assets/                    # CSS and preprocessed assets
│   └── css/
│       └── main.css           # Tailwind directives + custom CSS
├── static/                    # Static files (copied as-is to public)
│   └── js/
│       ├── perlin.js          # Perlin noise library
│       └── flow-field-background.js  # Animated background
├── public/                    # Generated static site (build output)
│   ├── css/                   # Compiled CSS
│   ├── js/                    # JavaScript bundles
│   ├── posts/                 # Generated post pages
│   ├── tags/                  # Generated tag pages
│   ├── categories/            # Generated category pages
│   └── index.html             # Generated homepage
├── resources/                 # Hugo resource cache (build artifacts)
│   └── _gen/
│       └── assets/
│           └── css/           # Processed CSS output
├── node_modules/              # npm dependencies
├── .planning/                 # GSD planning documents
│   └── codebase/              # Architecture/structure analysis
├── .github/                   # GitHub workflows
│   └── workflows/             # CI/CD configurations
├── .claude/                   # Claude configuration
├── docker-compose.yml         # Docker Compose for local dev
├── Dockerfile                 # Docker image definition
├── flake.nix                  # Nix dev environment
├── hugo.toml                  # Hugo configuration
├── package.json               # npm scripts and dependencies
├── postcss.config.js          # PostCSS plugins (Tailwind, autoprefixer)
├── tailwind.config.js         # Tailwind CSS configuration
├── nginx.conf                 # Nginx web server configuration
├── USAGE.md                   # Project documentation
└── .gitignore                 # Git ignore rules
```

## Directory Purposes

**content/:**
- Purpose: Author-facing markdown files; single source of truth for blog posts
- Contains: `.md` files with YAML frontmatter (title, date, tags, description)
- Key files: `posts/_index.md` (post section metadata), `about.md` (about page)

**layouts/:**
- Purpose: Hugo templates that define how content is rendered to HTML
- Contains: `.html` files with Hugo template syntax ({{ }}, if/range/with blocks)
- Key sections:
  - `_default/`: Generic templates inherited by content types
  - `partials/`: Reusable template components imported via `{{ partial }}`
  - Root: `index.html` (homepage), `404.html` (error page)

**assets/css/:**
- Purpose: Source CSS files processed by Tailwind/PostCSS during build
- Contains: `main.css` with @tailwind directives and custom @layer rules
- Processing: `main.css` → Tailwind processor → PostCSS (autoprefixer) → minified output

**static/js/:**
- Purpose: Client-side JavaScript files included as-is in final output
- Contains: Library code (perlin.js) and feature implementations (flow-field-background.js)
- Not processed: Files serve as static assets, no bundling/transpilation

**archetypes/:**
- Purpose: Template stubs used by `hugo new` command
- Contains: `default.md` with YAML structure for new posts
- Usage: `hugo new posts/my-post.md` creates post with archetype structure

**public/:**
- Purpose: Generated static site (build output, not committed)
- Generated during: `npm run build` or `hugo build` command
- Structure: Mirrors content structure with `.html` files

**resources/:**
- Purpose: Hugo build cache for asset processing
- Generated: Automatically by Hugo during build
- Contains: Processed CSS, fingerprinted assets

## Key File Locations

**Entry Points:**
- `hugo.toml`: Hugo configuration defining baseURL, output formats, taxonomies, menus
- `layouts/index.html`: Homepage rendering (hero + recent posts)
- `layouts/_default/single.html`: Single post/page rendering
- `layouts/_default/list.html`: Post list/archive rendering

**Configuration:**
- `hugo.toml`: Site metadata, output formats, menu structure, markup settings
- `package.json`: npm scripts (dev, build, build:search)
- `tailwind.config.js`: Theme extensions, font families, fluid typography
- `postcss.config.js`: PostCSS plugin pipeline (Tailwind → autoprefixer)
- `flake.nix`: Nix dev environment (Hugo, Node)

**Core Logic:**
- `layouts/partials/head.html`: Meta tags, CSS loading, dark mode detection script
- `layouts/partials/header.html`: Navigation, search button, theme toggle, mobile menu
- `layouts/partials/scripts.html`: Pagefind setup, theme toggle handler, search modal, animation init
- `static/js/flow-field-background.js`: Animated background (particles + Perlin noise + mouse tracking)
- `static/js/perlin.js`: Perlin noise implementation (dependency for flow-field)

**Styling:**
- `assets/css/main.css`: Tailwind directives + custom scrollbar + code block styles
- `tailwind.config.js`: Fonts (Inter, JetBrains Mono), fluid typography scales, typography plugin

**Content:**
- `content/posts/_index.md`: Post section metadata
- `content/about.md`: About page
- `archetypes/default.md`: New post template

## Naming Conventions

**Files:**
- Layouts: `lowercase.html` (baseof.html, single.html)
- Partials: `lowercase.html` in `partials/` directory (header.html, footer.html)
- Archetype: `lowercase.md` (default.md)
- Config: `lowercase.js` or `.toml` (tailwind.config.js, hugo.toml)
- Content: `lowercase-with-dashes.md` (about.md, implied post slugs)
- Static JS: `kebab-case.js` (perlin.js, flow-field-background.js)

**Directories:**
- Hugo standard: `layouts`, `content`, `static`, `archetypes`, `assets`
- Sections: `posts/`, `tags/`, `categories/`
- CSS: `css/` under assets
- JavaScript: `js/` under static
- Partials: `partials/` under layouts

**Template Variables:**
- Hugo context: `.Title`, `.Content`, `.Date`, `.Params`, `.Site`, `.Pages`
- Custom frontmatter: `.Description`, `.Params.tags`
- Hugo functions: `now`, `where`, `first`, `range`, `with`

## Where to Add New Code

**New Blog Post:**
- Command: `hugo new posts/post-slug.md`
- Location: `/content/posts/post-slug.md`
- Structure: YAML frontmatter (title, date, tags, description) + Markdown body
- Template used: `layouts/_default/single.html`

**New Page (Like About):**
- Command: `hugo new my-page.md`
- Location: `/content/my-page.md`
- Structure: YAML frontmatter + Markdown body
- Template: Uses nearest template (single.html or custom layout)

**New Template Layout:**
- Location: `/layouts/` or `/layouts/partials/`
- Naming: `lowercase.html`
- Pattern: Use Hugo context variables (`.Title`, `.Content`, etc.)
- Inheritance: Child templates define `{{ define "main" }}...{{ end }}`

**New Partial (Reusable Component):**
- Location: `/layouts/partials/component-name.html`
- Usage: `{{ partial "component-name.html" . }}` passes context
- Example: If adding a sidebar, create `partials/sidebar.html` and call from baseof.html

**New Client-Side Feature:**
- Location: `/static/js/feature-name.js` or inline in `layouts/partials/scripts.html`
- Pattern: Vanilla JavaScript with no bundler (direct file serving)
- Init: Add `<script src="/js/feature-name.js"></script>` to appropriate partial or baseof.html

**New Style Rule:**
- Location: `/assets/css/main.css`
- Pattern: Use `@layer` to organize (base, components, utilities)
- Approach: Prefer Tailwind utility classes in templates over custom CSS when possible
- If custom needed: Add to `@layer components` for reusable classes, `@layer utilities` for one-offs

**New Dependency:**
- npm: Add to `package.json` devDependencies, reference in build scripts or PostCSS config
- Hugo: Update flake.nix or install locally

## Special Directories

**public/:**
- Purpose: Generated static site output
- Generated: Automatically by Hugo build
- Committed: No (in .gitignore)
- Cleaning: Delete and rebuild with `npm run build`

**resources/:**
- Purpose: Hugo build cache (processed assets)
- Generated: Automatically by Hugo
- Committed: No (in .gitignore)
- Purpose: Speed up rebuilds by caching processed CSS/JS

**node_modules/:**
- Purpose: npm package dependencies
- Generated: By `npm install`
- Committed: No (in .gitignore)
- Contents: Tailwind, PostCSS, Pagefind, autoprefixer

**.git/:**
- Purpose: Git version control
- Contents: Commit history, branches, configuration
- Key files: `.gitignore` defines excluded files (node_modules, public, resources)

**.planning/codebase/:**
- Purpose: GSD architecture/analysis documents
- Contents: ARCHITECTURE.md, STRUCTURE.md (this file), CONVENTIONS.md, TESTING.md, CONCERNS.md
- Committed: Yes (planning documentation)

---

*Structure analysis: 2026-01-29*
