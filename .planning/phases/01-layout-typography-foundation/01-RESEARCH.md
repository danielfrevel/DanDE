# Phase 1: Layout & Typography Foundation - Research

**Researched:** 2026-01-29
**Domain:** Tailwind CSS responsive layout, typography, and theming
**Confidence:** HIGH

## Summary

Researched how to implement optimal line length, sticky footer, variable fonts, fluid typography, and light/dark theme switching using Tailwind CSS 3.4 with the Typography plugin in a Hugo static site.

The standard approach uses Tailwind's built-in utilities with minimal custom configuration. The `@tailwindcss/typography` plugin provides prose classes that handle line length automatically (65ch max-width). Sticky footer uses flexbox pattern (`flex flex-col min-h-screen` on body, `flex-1` on main). Variable fonts like Inter are loaded via CDN with performance benefits. Fluid typography uses CSS clamp() for viewport-based scaling. Dark mode switching requires class-based strategy with inline script in head to prevent FOUC.

**Primary recommendation:** Use Tailwind's prose classes with flexbox sticky footer, Inter variable font from fonts.bunny.net, and class-based dark mode with inline script prevention.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tailwind CSS | 3.4+ | Utility-first CSS | Industry standard for responsive layouts |
| @tailwindcss/typography | 0.5+ | Beautiful prose defaults | Official plugin, handles line length/spacing |
| Inter (variable) | Latest | Primary font | Most popular variable font (414B Google Fonts accesses/year) |
| CSS clamp() | Native | Fluid typography | Native browser support (91.4%), no JS needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fonts.bunny.net | N/A | Font CDN | Privacy-focused Google Fonts alternative |
| Recursive | Latest | Monospace alternative | If need sans→mono morphing |
| Tailwind fluid plugins | N/A | Helper utilities | Only if extensive fluid scaling needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Inter | Roboto Flex | Less popular but also variable, Google's official |
| Inter | Google Sans Flex | Newer, Google brand font, less widespread adoption |
| fonts.bunny.net | Google Fonts | Better performance but privacy concerns |
| CSS clamp() | Tailwind plugins | Plugins add abstraction but native CSS is simpler |

**Installation:**
```bash
npm install @tailwindcss/typography
```

## Architecture Patterns

### Recommended Project Structure
```
layouts/
├── _default/
│   └── baseof.html     # Root template with flexbox sticky footer
├── partials/
│   ├── head.html       # Font loading + dark mode script
│   ├── header.html     # Site header
│   └── footer.html     # Site footer
assets/css/
└── main.css            # Tailwind imports + custom layers
tailwind.config.js      # Typography config, dark mode strategy
```

### Pattern 1: Sticky Footer with Flexbox
**What:** Flexbox-based footer that stays at bottom on short pages, flows naturally on long pages
**When to use:** All layouts where footer should be visually anchored to viewport bottom
**Example:**
```html
<!-- Source: https://www.gomasuga.com/blog/creating-a-sticky-footer-with-tailwind -->
<body class="flex flex-col min-h-screen">
  <header>...</header>
  <main class="flex-1">
    <!-- Content here -->
  </main>
  <footer>...</footer>
</body>
```

### Pattern 2: Prose with Optimal Line Length
**What:** Typography plugin applies 65ch max-width automatically for readability
**When to use:** Blog posts, article content, any longform text
**Example:**
```html
<!-- Source: https://github.com/tailwindlabs/tailwindcss-typography -->
<article class="prose prose-lg dark:prose-invert mx-auto px-4">
  {{ .Content }}
</article>
```

### Pattern 3: Fluid Typography with Clamp
**What:** Font sizes scale smoothly between min/max based on viewport width
**When to use:** Headings, display text that should scale between mobile and desktop
**Example:**
```css
/* Source: https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/ */
/* Formula: clamp(minRem, calc(minRem + (maxPx - minPx) * ((100vw - minViewportPx) / (maxViewportPx - minViewportPx))), maxRem) */

/* Practical example for h1: */
h1 {
  font-size: clamp(2rem, 1.5rem + 2vw, 4rem);
  /* Min: 2rem (32px), scales with viewport, Max: 4rem (64px) */
}
```

**Tailwind config implementation:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
        'fluid-xl': 'clamp(1.5rem, 1.25rem + 1vw, 2.5rem)',
        'fluid-2xl': 'clamp(2rem, 1.5rem + 2vw, 4rem)',
      }
    }
  }
}
```

### Pattern 4: Dark Mode Without FOUC
**What:** Inline script in head checks theme before render, prevents flash
**When to use:** Always when implementing dark mode toggle
**Example:**
```html
<!-- Source: https://tailwindcss.com/docs/dark-mode -->
<!-- In head.html partial, before any styled content -->
<script>
  if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
</script>
```

**Toggle implementation:**
```javascript
// Toggle function
function toggleDarkMode() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
}
```

### Pattern 5: Variable Font Loading
**What:** Load variable font with weight range instead of individual weights
**When to use:** Always for performance optimization
**Example:**
```html
<!-- Source: https://fonts.google.com/specimen/Inter -->
<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=inter:100..900" rel="stylesheet">

<!-- Or for both regular and italic: -->
<link href="https://fonts.bunny.net/css?family=inter:ital,wght@0,100..900;1,100..900" rel="stylesheet">
```

### Anti-Patterns to Avoid
- **Using max-w-prose alone:** Typography plugin already sets 65ch max-width, adding max-w-prose is redundant and can conflict
- **Position absolute footer:** Old technique that breaks on dynamic content, use flexbox instead
- **Dark mode script at end of body:** Causes FOUC, must be in head before styled content
- **Loading multiple font weights separately:** Use variable font with range (100..900) instead
- **Media queries for fluid typography:** CSS clamp() is cleaner and more maintainable

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Typography spacing/line-height | Custom CSS rules | @tailwindcss/typography | Handles 65+ edge cases, tested across browsers |
| Fluid typography calculator | Custom viewport math | CSS clamp() or online calculators | Math is complex, tools like fluid.tw or royalfig.github.io/fluid-typography-calculator |
| Dark mode persistence | Cookie-based system | localStorage + inline script | Standard pattern, prevents FOUC, works with View Transitions |
| Font loading optimization | Manual preload/subset | Variable fonts via CDN | Single file (100-200KB) vs multiple static files (400-800KB) |
| Line length optimization | Custom max-width calculations | prose classes (65ch) | Research-backed readable width, adapts to font size |

**Key insight:** Typography is deceptively complex. What seems like "just set a max-width" actually involves font metrics, line-height ratios, vertical rhythm, and accessibility. The typography plugin solves this comprehensively.

## Common Pitfalls

### Pitfall 1: FOUC on Dark Mode Toggle
**What goes wrong:** Page flashes light theme before JavaScript sets dark theme
**Why it happens:** Theme detection script runs after HTML renders
**How to avoid:** Inline synchronous script in `<head>` before any styled content
**Warning signs:** Brief white flash on page load when dark mode is enabled

### Pitfall 2: Footer in Middle of Short Pages
**What goes wrong:** Footer appears halfway down viewport on pages with little content
**Why it happens:** Using `min-h-screen` on wrong element or missing `flex-1` on main
**How to avoid:**
- Apply `flex flex-col min-h-screen` to body/root container
- Apply `flex-1` (or `flex-auto`) to main content area
- Test with both short and long content pages
**Warning signs:** Footer not touching bottom edge when content < viewport height

### Pitfall 3: Line Length Too Long After Prose Customization
**What goes wrong:** Overriding typography plugin's max-width breaks readability
**Why it happens:** Setting `maxWidth: 'none'` in typography config without constraining container
**How to avoid:**
- If using `maxWidth: 'none'`, wrap prose in container with max-width (e.g., `max-w-3xl`)
- Or keep default 65ch behavior
- Target line length: 50-75 characters
**Warning signs:** Lines extending beyond 80 characters on desktop

### Pitfall 4: Variable Font Not Loading All Weights
**What goes wrong:** Font fallback appears for certain weights (e.g., 500, 600)
**Why it happens:** Font URL doesn't include full weight range
**How to avoid:** Use weight range syntax: `inter:100..900` not `inter:400,700`
**Warning signs:** Font switching during weight transitions, DevTools shows missing weights

### Pitfall 5: Clamp Formula Doesn't Scale as Expected
**What goes wrong:** Font size jumps or doesn't scale smoothly across viewports
**Why it happens:** Incorrect slope calculation or viewport range in clamp()
**How to avoid:**
- Use fluid typography calculator tools
- Formula: `slope = (maxSize - minSize) / (maxViewport - minViewport)`
- Test at multiple viewport widths (320px, 768px, 1024px, 1920px)
**Warning signs:** Sudden size jumps at breakpoints, non-linear scaling

### Pitfall 6: Switching from Dark Default to Light Default Incorrectly
**What goes wrong:** Logic inverted, causes wrong theme to display
**Why it happens:** Changing default without updating conditional logic
**How to avoid:**
- For light default: Remove dark class by default, add only when `theme === 'dark'`
- Update fallback logic: `!('theme' in localStorage) && prefers dark` → add dark
- Test all three states: light preference, dark preference, no preference
**Warning signs:** System dark mode users see light theme, or vice versa

## Code Examples

Verified patterns from official sources:

### Tailwind Config for This Phase
```javascript
// Source: Existing blog config + official docs
// tailwind.config.js
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
  ],
  darkMode: 'class', // Class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        // Fluid typography scales
        'fluid-sm': 'clamp(0.875rem, 0.75rem + 0.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.875rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
        'fluid-xl': 'clamp(1.5rem, 1.25rem + 1vw, 2.5rem)',
        'fluid-2xl': 'clamp(2rem, 1.5rem + 2vw, 4rem)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            // Keep plugin's 65ch max-width for optimal line length
            // maxWidth removed to allow container-level control
            maxWidth: '65ch', // Optimal line length
            code: {
              backgroundColor: theme('colors.gray.100'),
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: theme('colors.gray.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Complete Baseof Template with Sticky Footer
```html
<!-- Source: Tailwind sticky footer pattern -->
<!-- layouts/_default/baseof.html -->
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}" class="scroll-smooth">
<head>
  {{- partial "head.html" . -}}
</head>
<body class="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
  {{- partial "header.html" . -}}

  <main class="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
    {{- block "main" . }}{{- end }}
  </main>

  {{- partial "footer.html" . -}}

  {{- partial "scripts.html" . -}}
</body>
</html>
```

### Article Template with Prose
```html
<!-- layouts/_default/single.html -->
{{ define "main" }}
<article class="prose prose-lg dark:prose-invert max-w-none">
  <h1>{{ .Title }}</h1>
  <div class="text-sm text-gray-600 dark:text-gray-400 mb-8">
    <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "January 2, 2006" }}</time>
  </div>
  {{ .Content }}
</article>
{{ end }}
```

### Dark Mode Toggle Button
```html
<!-- Example toggle button -->
<button
  id="theme-toggle"
  class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  aria-label="Toggle dark mode"
>
  <!-- Sun icon (show in dark mode) -->
  <svg class="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/>
  </svg>
  <!-- Moon icon (show in light mode) -->
  <svg class="w-5 h-5 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
  </svg>
</button>

<script>
  document.getElementById('theme-toggle').addEventListener('click', function() {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
  });
</script>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multiple static font files | Single variable font file | 2020+ | 50-75% file size reduction |
| Media query breakpoints for typography | CSS clamp() fluid scaling | 2021+ | Smoother scaling, less CSS |
| JavaScript-based dark mode | CSS class strategy + localStorage | 2022+ | Better performance, no FOUC |
| Position absolute sticky footer | Flexbox/Grid layout | 2019+ | More reliable, responsive-friendly |
| Typography plugin v3 (JS config) | Typography plugin v4 (CSS @plugin) | 2024+ | Tailwind v4 syntax, CSS-first |
| prefers-color-scheme only | Class strategy with system fallback | 2023+ | User control + system preference |

**Deprecated/outdated:**
- **Fixed/absolute positioned footers:** Breaks on dynamic content, use flexbox
- **Separate preload for each font weight:** Variable fonts make this obsolete
- **viewport units alone for typography:** Clamp provides better min/max control
- **Dark mode without localStorage:** Loses user preference on navigation

## Open Questions

Things that couldn't be fully resolved:

1. **Tailwind CSS v4 Migration Timeline**
   - What we know: Typography plugin supports v4 with @plugin directive
   - What's unclear: When v4 becomes stable, migration effort required
   - Recommendation: Build with v3 syntax, plan for v4 migration in future phase

2. **View Transitions API Interaction with Dark Mode**
   - What we know: Blog has View Transitions API enabled
   - What's unclear: Whether theme toggle should animate with view transitions
   - Recommendation: Keep instant theme toggle, don't animate theme changes

3. **Optimal Prose Size for Tech Blog**
   - What we know: prose-lg (1.125rem base) is common for articles
   - What's unclear: Whether prose-base or prose-lg is better for code-heavy content
   - Recommendation: Start with prose-lg, adjust based on code block density

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Max-Width Documentation](https://tailwindcss.com/docs/max-width) - Official utility classes
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode) - Official class strategy and FOUC prevention
- [Tailwind Typography Plugin GitHub](https://github.com/tailwindlabs/tailwindcss-typography) - Official plugin features and dark mode support
- [Inter Font on Google Fonts](https://fonts.google.com/specimen/Inter) - Variable font implementation

### Secondary (MEDIUM confidence)
- [Creating Flexbox Sticky Footer with Tailwind](https://www.gomasuga.com/blog/creating-a-sticky-footer-with-tailwind) - Implementation pattern verified with official docs
- [Modern Fluid Typography Using CSS Clamp](https://www.smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/) - Smashing Magazine article with formula
- [Implementing Tailwind Dark Mode Toggle with No Flicker](https://cruip.com/implementing-tailwind-css-dark-mode-toggle-with-no-flicker/) - FOUC prevention strategy
- [Fluid Typography Calculator](https://royalfig.github.io/fluid-typography-calculator/) - Tool for clamp calculations
- [Inter Variable Font Performance](https://dev.to/codewithshripal/use-variable-font-for-better-performance-2dog) - Variable font benefits

### Tertiary (LOW confidence, needs validation)
- WebSearch results for "best variable fonts tech blog 2026" - Ecosystem overview
- WebSearch results for "Tailwind fluid typography plugins 2026" - Plugin landscape

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Tailwind docs and typography plugin confirmed
- Architecture: HIGH - Patterns verified with official sources and existing blog code
- Pitfalls: MEDIUM - Based on community articles and common mistakes, not official docs
- Fluid typography formula: MEDIUM - Math verified via Smashing Magazine, needs testing

**Research date:** 2026-01-29
**Valid until:** 2026-03-29 (60 days - stable ecosystem, Tailwind v4 may impact)
