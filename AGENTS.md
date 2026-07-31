# AGENTS.md — Website Development Rules

Follow these rules for EVERY website project. No exceptions.

---

## 1. HTML Structure

- Always use semantic HTML5: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`, `<article>`, `<aside>`
- Proper DOCTYPE (`<!DOCTYPE html>`), `<meta charset="UTF-8">`, viewport meta tag
- Logical heading order: H1 > H2 > H3 — never skip levels
- Alt text on ALL meaningful images (`alt=""` only for decorative)
- Labels on ALL form inputs — never use placeholders as labels
- Skip-to-content link for accessibility
- No inline event handlers (`onclick`, `onsubmit`, `onmouseover`, etc.)

---

## 2. Security

- Sanitize ALL user input to prevent XSS (use `textContent` not `innerHTML`)
- `rel="noopener noreferrer"` on every `target="_blank"` link
- Include security meta headers:
  ```html
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  ```
- No API keys, secrets, or tokens in frontend code
- Form validation on client-side AND guidance for server-side
- Use HTTPS for all external resources
- Never expose `.env` files or server config to the client

---

## 3. Typography & Fonts (2026 Standards)

### Font Pairings (Free, Professional)

| Project Type | Heading Font | Body Font | Mood |
|---|---|---|---|
| Portfolio / Creative | Playfair Display | Inter | Editorial, premium |
| Tech / Business | Inter (bold weights) | Inter (regular) | Clean, modern |
| Agency / Luxury | Instrument Serif | DM Sans | Sophisticated |
| Startup / SaaS | Fraunces | Plus Jakarta Sans | Bold, fresh |
| Blog / Editorial | Lora | Source Sans 3 | Warm, readable |

### Typography Rules

- **Body size**: 16-18px minimum — never go below 16px
- **Line height**: 1.5-1.7 for body text, 1.1-1.25 for large headlines
- **Line length**: 60-75 characters per line (use `max-width: 68ch` on text blocks)
- **Fluid headings** with `clamp()`:
  ```css
  h1 { font-size: clamp(2rem, 1.5rem + 2.5vw, 3.5rem); }
  h2 { font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem); }
  h3 { font-size: clamp(1.2rem, 1rem + 1vw, 1.75rem); }
  ```
- **Maximum 2 font families** per project
- Always use `font-display: swap` to prevent invisible text
- Self-host fonts in WOFF2 format when possible
- Use **variable fonts** for performance (one file = all weights)
- Subset fonts to only needed characters (Latin + extended)
- Add positive letter-spacing (+0.04em to +0.08em) on ALL-CAPS text

---

## 4. UI/UX Design Principles

### Visual Hierarchy
- Clear size progression: H1 > H2 > H3 > body
- Color contrast: **4.5:1 minimum** for body text, 3:1 for large text (WCAG AA)
- Generous whitespace — padding and margins between sections (80-120px between major sections)
- F-pattern layout for text-heavy pages, Z-pattern for landing pages
- Front-load value proposition: first 8 words answer "what is this and is it for me?"

### Layout & Responsiveness
- **Mobile-first** CSS approach — design for smallest screen first
- CSS custom properties (variables) for all colors, fonts, spacing
- Fluid grids with CSS Grid or Flexbox
- Responsive images with `srcset` and `sizes`
- Touch-friendly targets: minimum 44x44px for buttons/links
- Container queries for component-level responsiveness

### Micro-Interactions
- Button hover states: color change, subtle scale (1.02-1.05), shadow lift
- Scroll-triggered reveal animations: fade-up, slide-in (under 300ms duration)
- Form validation: inline, real-time feedback as user types
- Loading states: skeleton screens, not generic spinners
- Transitions: 200-300ms with ease or ease-out timing
- **Respect `prefers-reduced-motion`** — disable animations for users who request it

### Navigation
- Sticky header that hides on scroll-down, reappears on scroll-up
- 5-7 maximum top-level navigation items
- Active state indicator on current section
- Smooth scroll to sections (`scroll-behavior: smooth`)
- Hamburger menu on mobile with full-screen overlay
- Breadcrumbs for deep site hierarchies

### Color & Dark Mode
- Use CSS custom properties for all colors
- Support `prefers-color-scheme: dark` media query
- Test contrast ratios in BOTH light and dark modes
- Never use color alone to convey information (add icons/text)

---

## 5. Error Prevention & Code Quality

### CSS
- No `!important` unless absolutely unavoidable
- Use CSS custom properties for repeated values (colors, spacing, fonts)
- Mobile-first media queries (`min-width` not `max-width`)
- Avoid deep selector nesting (max 3 levels)
- Consistent naming convention (BEM or utility-first)
- Use `rem`/`em` for font sizes, not `px`

### JavaScript
- **Null/undefined checks** before every DOM manipulation
- `try/catch` blocks for all async operations and JSON parsing
- Event delegation for dynamically created elements
- Debounce scroll, resize, and input handlers
- Clean up event listeners when elements are removed
- Use `textContent` and `setAttribute` — never `innerHTML` with user data
- Strict equality (`===` not `==`)
- Use `const` by default, `let` when reassignment needed, never `var`

### React / Next.js (if applicable)
- TypeScript strict mode — no `any` types
- Proper error boundaries around risky components
- Server vs Client component awareness
- Always provide dependency arrays to `useEffect`
- Unique `key` props on all list items
- No direct DOM manipulation — use React state

---

## 6. Performance

- **Images**: WebP or AVIF format, lazy loading (`loading="lazy"`), explicit `width` and `height` attributes
- **Fonts**: Preload critical font with `<link rel="preload">`, subset to needed characters
- **CLS prevention**: Always set explicit dimensions on images, videos, embeds
- **JavaScript**: Code splitting, dynamic imports for non-critical code
- **Third-party scripts**: Audit and minimize — every script adds latency
- Target metrics: LCP < 2.5s, CLS < 0.1, INP < 200ms

---

## 7. Accessibility (WCAG 2.2 AA)

- Semantic HTML first — ARIA attributes only when HTML semantics are insufficient
- Full keyboard navigation: Tab, Enter, Escape, Arrow keys
- Visible focus indicators on all interactive elements (never `outline: none` without replacement)
- Screen reader testing: headings make sense, landmarks work, forms are labeled
- Color contrast: 4.5:1 for body, 3:1 for large text
- `prefers-reduced-motion` media query to disable animations
- `aria-live` regions for dynamic content updates
- Form errors announced to screen readers with `aria-describedby`
- Skip-to-content link as first focusable element

---

## 8. Forms

- Labels ABOVE or beside inputs — never rely on placeholders alone
- Inline validation as user types (not just on submit)
- Clear, specific error messages: "Enter a valid email like name@example.com"
- `autocomplete` attributes on all common fields (`email`, `name`, `tel`, etc.)
- Minimum tap target size: 44x44px
- Progress indicators for multi-step forms
- Submit button text describes the action: "Send Message" not "Submit"
- Disable button during submission to prevent double-submit

---

## 9. Pre-Deployment Checklist

Before declaring ANY website complete, verify ALL of the following:

- [ ] No console errors, warnings, or lint errors
- [ ] All internal and external links work (no 404s)
- [ ] All forms validate and submit correctly
- [ ] Responsive at 320px, 768px, 1024px, 1440px
- [ ] Dark mode works correctly (if applicable)
- [ ] Keyboard navigation works through entire page
- [ ] Color contrast passes WCAG AA (4.5:1 minimum)
- [ ] All images have descriptive alt text
- [ ] HTML validates with no errors
- [ ] No layout shift (CLS < 0.1)
- [ ] Fonts load correctly with no invisible text period
- [ ] All animations respect `prefers-reduced-motion`
- [ ] Security headers present
- [ ] No `target="_blank"` without `rel="noopener noreferrer"`
- [ ] No secrets, keys, or sensitive data in frontend code

---

## 10. Language Usage Guide

Use each technology where it fits best. Never force a tool where it doesn't belong.

### HTML — Structure (Every Project)
- The skeleton of every website — no exceptions
- Semantic elements for every piece of content
- Accessible by default, not as an afterthought

### CSS — Presentation (Every Project)
- Visual design, layout, animations, responsive behavior
- Custom properties for consistent theming
- Mobile-first approach always

### JavaScript — Interactivity (Client-Side)
- DOM manipulation, event handling, form validation
- Fetch API for async requests
- Scroll animations, counters, dynamic content
- Never use for things CSS can do (use CSS transitions over JS animation where possible)

### Python — Backend & Automation
- Django or Flask for server-rendered pages and REST APIs
- Data processing, web scraping, file generation
- Admin dashboards, authentication systems
- Never use for frontend — always pair with HTML/CSS/JS

### C / C++ — Performance-Critical Web Features
- WebAssembly (Wasm) for computationally heavy tasks
- Image/video processing in the browser
- Game engines, real-time simulations
- Use only when JavaScript performance is insufficient

### When to Use What (Decision Guide)

| Need | Use |
|---|---|
| Static page / landing page | HTML + CSS + JS |
| Dynamic page with database | Python (Django/Flask) + HTML + CSS + JS |
| Real-time app (chat, collab) | Node.js or Python + WebSockets + HTML + CSS + JS |
| Heavy computation in browser | C/C++ compiled to WebAssembly + HTML + CSS + JS |
| Data dashboard | Python backend + HTML/CSS/JS frontend with charts |
| Simple blog / CMS | Python (Django) or static HTML + JS |

---

## 12. Unique & Attractive Design Principles

Every website must feel intentional and distinctive — never like a generic template.

### Stand Out From Templates
- **Asymmetric layouts** — avoid boring 3-column grids; use overlapping elements, split screens, offset columns
- **Custom color palettes** — define 4-5 unique colors per project, not default blue/gray
- **Bold typography** — use the full font pairing table; mix display serifs with clean sans-serifs
- **Purposeful whitespace** — let elements breathe; dense layouts feel cheap
- **Visual storytelling** — use imagery, icons, and layout to communicate, not just text

### Create Visual Interest
- **Gradients** — subtle background gradients, not flat solid colors
- **Depth and layers** — shadows, overlapping cards, z-index stacking
- **Scroll-triggered animations** — elements reveal as user scrolls (fade-up, slide-in, scale)
- **Hover effects** — cards lift, buttons glow, images zoom slightly
- **Micro-animations** — loading states, toggle switches, progress indicators

### Brand Personality Through Design
- Choose colors that match the brand mood (blue = trust, purple = creative, green = growth)
- Typography choice communicates personality before a single word is read
- Consistent spacing rhythm creates a sense of polish
- Unique icon style (outlined, filled, duotone, custom SVG)
- Photography/illustration style must match the design language

### Avoid These Common Mistakes
- Using the same layout as every other template site
- More than 2 font families on one page
- Walls of text without visual breaks
- Low contrast text that's hard to read
- Stock photos that look obviously fake
- Animations that serve no purpose and slow the page
