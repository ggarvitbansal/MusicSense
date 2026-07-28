# MusicSense Design System

## Philosophy

MusicSense should feel like a modern SaaS product rather than a flashy AI demo.

Design priorities:

1. Clarity over decoration
2. Consistency over creativity
3. Simplicity over complexity
4. Accessibility over visual effects
5. Performance over unnecessary animations

The UI should feel inspired by products such as:

- Spotify
- Vercel
- Linear
- GitHub
- Notion

---

# Design Language

The overall aesthetic should be:

- Minimal
- Clean
- Professional
- Modern
- Music-focused

Avoid making the application look futuristic or over-designed.

---

# Color Palette

Primary Accent

- Emerald / Green

Neutral Colors

- White
- Black
- Gray

Use colors intentionally.

Avoid rainbow gradients and excessive accent colors.

---

# Typography

Hierarchy should remain consistent.

Heading sizes should decrease predictably.

Use generous line spacing for readability.

Avoid:

- Huge hero text
- Tiny body text
- Random font weights

---

# Spacing System

Use an 8px spacing scale.

Preferred spacing values:

- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64
- 96

Never use arbitrary spacing unless necessary.

---

# Layout

Maximum content width:

1200px

Content should always be centered.

Use consistent horizontal padding.

Desktop:

Comfortable whitespace.

Mobile:

Readable without horizontal scrolling.

---

# Components

Prefer reusable components.

Examples:

Reusable

- Button
- Card
- Navbar
- Footer
- Input
- Modal
- FeatureCard

Page Specific

- Hero Section
- Landing CTA
- Dashboard Charts

Do not duplicate reusable UI.

---

# Cards

Cards should have:

- Rounded corners
- Subtle border
- Light shadow (only when appropriate)

Avoid:

- Heavy shadows
- Glassmorphism
- Neon effects

---

# Buttons

Primary

Filled accent color.

Secondary

Outline.

Danger

Red.

Ghost

Minimal.

Button sizes should remain consistent throughout the application.

---

# Icons

Use Lucide React.

Do not mix multiple icon libraries.

Icons should communicate meaning rather than decoration.

---

# Images

Prefer:

- Real screenshots
- Product illustrations
- Simple SVG graphics

Avoid:

- Generic AI-generated illustrations
- Random stock photos
- Cartoon graphics

---

# Responsiveness

Mobile-first.

Support:

- Mobile
- Tablet
- Laptop
- Desktop

Every page must work across all screen sizes.

---

# Animations

Animations should be subtle.

Allowed:

- Hover transitions
- Fade in
- Scale (small)

Avoid:

- Continuous animations
- Floating elements
- Large parallax effects
- Overly animated landing pages

---

# Accessibility

Always include:

- Semantic HTML
- Keyboard navigation
- Proper button elements
- Form labels
- Sufficient color contrast

Never rely solely on color to convey meaning.

---

# Component Rules

Before creating a component, ask:

1. Will this be reused?
2. Can this become a generic UI component?
3. Does shadcn/ui already provide this?

If yes,

Use or extend the existing component.

---

# Development Rules

Every UI implementation should follow this order:

Structure

↓

Responsiveness

↓

Styling

↓

Accessibility

↓

Polish

Do not optimize visuals before the layout is correct.

---

# Things to Avoid

- Over-designed landing pages
- Excessive gradients
- Glassmorphism everywhere
- Random spacing
- Inconsistent typography
- Inconsistent border radius
- Huge drop shadows
- Decorative animations
- Multiple primary colors
- Copying designs from AI templates

---

# Definition of Done

A UI component is complete only if:

✓ Responsive

✓ Accessible

✓ Reusable (when appropriate)

✓ Uses project design tokens

✓ Matches existing components

✓ Looks consistent with the rest of the application