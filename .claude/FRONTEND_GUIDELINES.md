# Frontend Guidelines

Shared rules for all frontend agents in this squad. Tailwind CSS is the primary styling tool.

---

## Core Philosophy

1. **Tailwind first** — reach for Tailwind utilities before writing any custom CSS. Custom CSS only for things Tailwind cannot express (e.g. complex SVG paths, keyframes with arbitrary intermediate stops, `::-webkit-scrollbar` styling).
2. **Design system fidelity** — when a `DESIGN.md` is in scope, honor its do's/don'ts literally. Don't invent; extract.
3. **Mobile-first** — write base styles for mobile, layer up with `sm:`, `md:`, `lg:`, `xl:`.
4. **Accessible by default** — every interactive element needs focus styling, ARIA where needed, and semantic HTML.
5. **No premature abstraction** — three similar components is NOT a reason to generalize. Wait until the pattern stabilizes.

---

## Tailwind Conventions

### Color Tokens
When implementing a design system, map brand colors to Tailwind's arbitrary value syntax:
```html
<!-- Good -->
<div class="bg-[#121212] text-[#1ed760]">

<!-- Better: extend tailwind.config.js with brand tokens -->
<div class="bg-brand-dark text-brand-green">
```

Use `tailwind.config.js` `theme.extend.colors` for project-wide brand tokens.

### Typography Scale
```
text-xs    → 12px / 16px  (captions, labels)
text-sm    → 14px / 20px  (secondary text, meta)
text-base  → 16px / 24px  (body default)
text-lg    → 18px / 28px  (lead text)
text-xl    → 20px / 28px  (card titles)
text-2xl   → 24px / 32px  (section headers)
text-3xl   → 30px / 36px  (page titles)
text-4xl   → 36px / 40px  (display)
text-5xl+  → hero/display sizes
```

For negative letter-spacing (common in design systems):
```html
<h1 class="tracking-tight">    <!-- -0.025em -->
<h1 class="tracking-tighter">  <!-- -0.05em -->
<h1 class="tracking-[-0.04em]"> <!-- arbitrary -->
```

### Spacing System (8px grid)
```
space-1  → 4px
space-2  → 8px   ← default small
space-3  → 12px
space-4  → 16px  ← default medium
space-6  → 24px  ← section gap
space-8  → 32px  ← large gap
space-12 → 48px  ← hero gap
space-16 → 64px  ← section padding
space-24 → 96px  ← hero padding
```

### Border Radius Vocabulary
```
rounded-sm  → 2px
rounded     → 4px   ← Tesla default
rounded-md  → 6px
rounded-lg  → 8px   ← standard card
rounded-xl  → 12px
rounded-2xl → 16px
rounded-3xl → 24px
rounded-full → 9999px ← pill buttons (Spotify, Figma)
```

### Shadow Vocabulary
```
shadow-sm   → small elevation
shadow      → medium elevation
shadow-md   → card default
shadow-lg   → modal/dropdown
shadow-xl   → overlay
shadow-none → flat (Tesla, Vercel minimal)

/* Ring-based border (Claude, Vercel pattern) */
ring-1 ring-black/10
ring-1 ring-white/[0.08]   ← dark mode border
```

---

## Component Patterns

### Button States (always implement all 5)
```html
<!-- Primary CTA -->
<button class="
  bg-brand-primary text-white
  px-4 py-2 rounded-lg
  font-medium text-sm
  hover:bg-brand-primary/90
  active:scale-[0.98]
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  transition-all duration-150
">
  Label
</button>
```

### Card Pattern
```html
<div class="
  bg-white dark:bg-zinc-900
  rounded-xl
  ring-1 ring-black/[0.08] dark:ring-white/[0.08]
  p-6
  shadow-sm
">
```

### Input Pattern
```html
<input class="
  w-full
  bg-white dark:bg-zinc-900
  border border-zinc-200 dark:border-zinc-800
  rounded-lg
  px-3 py-2
  text-sm text-zinc-900 dark:text-zinc-100
  placeholder:text-zinc-400
  focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
  disabled:opacity-50 disabled:bg-zinc-50
  transition-colors duration-150
" />
```

### Loading Skeleton
```html
<div class="animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-lg h-4 w-full" />
```

### Empty State
```html
<div class="flex flex-col items-center justify-center py-16 text-center">
  <div class="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
    <!-- icon -->
  </div>
  <h3 class="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">No items yet</h3>
  <p class="text-sm text-zinc-500 max-w-xs">Description of empty state and what to do.</p>
</div>
```

---

## Dark Mode

Always implement dark mode with Tailwind's `dark:` variant. Use `class` strategy:
```js
// tailwind.config.js
darkMode: 'class'
```

Color pairing cheatsheet:
```
Background:   bg-white          / dark:bg-zinc-950
Surface:      bg-zinc-50        / dark:bg-zinc-900
Elevated:     bg-zinc-100       / dark:bg-zinc-800
Border:       border-zinc-200   / dark:border-zinc-800
Text primary: text-zinc-900     / dark:text-zinc-100
Text muted:   text-zinc-500     / dark:text-zinc-400
Text subtle:  text-zinc-400     / dark:text-zinc-600
```

---

## Responsive Breakpoints

```
(base) → mobile-first, < 640px
sm:    → 640px  (large phones, landscape)
md:    → 768px  (tablets)
lg:    → 1024px (small laptops)
xl:    → 1280px (desktops)
2xl:   → 1536px (large screens)
```

Grid patterns:
```html
<!-- Cards grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

<!-- Two column layout -->
<div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

<!-- Sidebar layout -->
<div class="flex flex-col lg:flex-row gap-0">
  <aside class="w-full lg:w-64 lg:shrink-0">
  <main class="flex-1 min-w-0">
```

---

## Accessibility Checklist

- `<button>` for interactive elements, never `<div onClick>`
- `<a>` for navigation links
- All images: `alt` attribute (empty `alt=""` for decorative images)
- Form inputs: always paired `<label>` or `aria-label`
- Focus visible on all interactive elements (`focus-visible:ring-2`)
- Color contrast: minimum 4.5:1 for body text, 3:1 for large text
- Touch targets: minimum 44×44px (`min-h-[44px] min-w-[44px]`)
- Motion: wrap animations in `@media (prefers-reduced-motion: no-preference)`
- ARIA roles: landmarks (`main`, `nav`, `aside`, `header`, `footer`)
- Modals: `role="dialog"`, `aria-modal="true"`, focus trap

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.8s |
| Time to Interactive | < 3.9s |
| Cumulative Layout Shift | < 0.1 |
| Largest Contentful Paint | < 2.5s |
| Bundle size (gzipped) | < 200KB initial |
| Animation framerate | 60fps (use `transform`, `opacity` only) |

### Quick wins:
- `loading="lazy"` on all below-fold images
- `font-display: swap` on custom fonts
- `will-change: transform` only on actively animating elements (remove after)
- Prefer CSS transitions over JS animations
- Use `transform` and `opacity` — never animate `width`, `height`, `top`, `left`

---

## Tailwind Config Template

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          // Populate from DESIGN.md Color Palette section
          primary: '#REPLACE',
          secondary: '#REPLACE',
          // ...
        }
      },
      fontFamily: {
        // Populate from DESIGN.md Typography section
        sans: ['REPLACE', 'system-ui', 'sans-serif'],
        mono: ['REPLACE', 'monospace'],
      },
      borderRadius: {
        // Override defaults to match design system
      },
      boxShadow: {
        // Ring/shadow patterns from DESIGN.md
        'ring-sm': '0 0 0 1px rgba(0,0,0,0.08)',
        'ring-sm-dark': '0 0 0 1px rgba(255,255,255,0.08)',
      }
    }
  },
  plugins: []
}
```

---

## Animation Standards

```css
/* Default transition (most UI interactions) */
transition-all duration-150 ease-out

/* Entrance/exit (modals, drawers, dropdowns) */
transition-all duration-200 ease-out

/* Page transitions */
transition-all duration-300 ease-in-out

/* Micro-interactions (button press, checkbox) */
transition-transform duration-100 ease-out
active:scale-[0.97]
```

Tailwind classes:
```html
hover:scale-[1.02] transition-transform duration-150
active:scale-[0.98] transition-transform duration-100
```

---

## Anti-patterns (Never Do)

- `!important` — fix specificity instead
- Inline `style={{}}` for values Tailwind can handle
- `z-index: 9999` — establish a z-index scale
- Fixed pixel font sizes without Tailwind scale
- `margin: auto` hacks instead of flexbox/grid
- Animating `width`, `height`, `padding` — causes reflow
- Empty `alt` attributes on content images
- `<div>` with `onClick` instead of `<button>`
- Nesting more than 3 levels of positioned elements
- `overflow: hidden` on body to "fix" scroll issues
