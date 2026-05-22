---
name: Technical Academic Minimalist
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#4d5f7d'
  primary: '#000615'
  on-primary: '#ffffff'
  primary-container: '#0b1f3a'
  on-primary-container: '#7587a7'
  inverse-primary: '#b5c7ea'
  secondary: '#006b5c'
  on-secondary: '#ffffff'
  secondary-container: '#68fade'
  on-secondary-container: '#007162'
  tertiary: '#0d0400'
  on-tertiary: '#ffffff'
  tertiary-container: '#321800'
  on-tertiary-container: '#a87e59'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#b5c7ea'
  on-primary-fixed: '#071c36'
  on-primary-fixed-variant: '#364764'
  secondary-fixed: '#68fade'
  secondary-fixed-dim: '#44ddc2'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005045'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#eebd94'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#613f20'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is engineered for a premium educational experience, blending the rigor of computer science with the sleek efficiency of modern software-as-a-service. It targets serious learners—engineers, students, and career-switchers—who require a distraction-free environment for deep work in C++ and Data Structures.

The aesthetic follows an **Intentional Minimalist** philosophy. It prioritizes information density and legibility over decorative elements. By utilizing high breathing room and a restrained color palette, the system evokes a sense of authority and technical precision. The visual language is structured and architectural, reflecting the logic and order of the code it teaches.

## Colors
This design system utilizes a high-contrast, professional palette designed for long-form reading and code analysis.

*   **Primary (Deep Navy):** Used for core branding, primary navigation, and dominant action buttons to establish authority.
*   **Secondary/Accent (Teal):** Used sparingly for progress indicators, success states, and highlighting key interactive elements like "Run Code" or "Submit."
*   **Neutral (Slate/Grey):** The foundation of the UI. The background uses a very light slate (#F8FAFC) to reduce eye strain compared to pure white, while maintaining a clean "academic paper" feel.
*   **Feedback Colors:** Use standard semantic reds for errors and ambers for warnings, but keep them desaturated to remain within the professional tone.

## Typography
The typography is centered around **Geist**, a typeface designed for precision and technical clarity. It provides a geometric yet approachable feel that suits complex technical documentation.

*   **Headlines:** Utilize heavier weights (600-700) with slight negative letter-spacing to create a strong, authoritative "news" style.
*   **Body Text:** Set with generous line height (1.5x) to ensure readability during long study sessions.
*   **Code:** Use **JetBrains Mono** for all code snippets and inline code references. It is specifically optimized for developer legibility.
*   **Hierarchy:** Use the Primary Navy for headlines and a slightly lighter Slate (#334155) for body text to create a soft visual hierarchy.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop to ensure content remains readable and focused, transitioning to a fluid model for mobile devices.

*   **Grid:** A 12-column grid system with 24px gutters. Content is typically centered in a 1280px container to prevent excessive line lengths in technical articles.
*   **Rhythm:** An 8px linear scale governs all padding and margins. 
*   **Breathing Room:** Use the `xl` (80px) spacing for section vertical margins to maintain the premium, uncluttered feel.
*   **Mobile Adaption:** On mobile, margins reduce to 16px and the grid collapses to a single column. Horizontal scrolling is permitted only for code blocks and data tables.

## Elevation & Depth
In line with the Minimalist SaaS style, depth is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than dramatic shadows.

1.  **Level 0 (Base):** The #F8FAFC background.
2.  **Level 1 (Cards/Containers):** Pure white (#FFFFFF) surfaces with a subtle 1px border (#E2E8F0).
3.  **Level 2 (Interaction):** When an element is hovered or active, a very soft, diffused shadow is applied (0px 4px 12px rgba(11, 31, 58, 0.05)).
4.  **Separation:** Use horizontal rules (1px, Slate-200) to separate logical sections within a single page or card, maintaining a flat, structured look.

## Shapes
The shape language is **Soft** and restrained. Rounded corners are used to subtly modernise the UI without appearing playful or "bubbly."

*   **Primary UI Elements:** Buttons, input fields, and small cards use a 4px (0.25rem) radius.
*   **Large Containers:** Main content cards or modal windows use an 8px (0.5rem) radius.
*   **Instructional Elements:** Icons and small tags may use a slightly more rounded 6px radius to distinguish them from structural layout components.

## Components
Consistent component styling reinforces the authoritative tech-forward brand.

*   **Buttons:** 
    *   *Primary:* Solid Deep Navy with white text. No gradients. 4px radius.
    *   *Secondary:* Ghost style with Deep Navy border and text.
    *   *Accent:* Solid Teal, used exclusively for "Success" actions or "Run" buttons.
*   **Input Fields:** White background with a 1px Slate-300 border. On focus, the border changes to Teal with a soft Teal outer glow (2px). Labels are always Geist Medium, 14px.
*   **Cards:** Pure white background, 1px Slate-200 border. No shadow by default; subtle shadow on hover if the card is clickable.
*   **Chips/Tags:** Used for "Difficulty Level" (e.g., Easy, Medium, Hard). Use light background tints of the semantic colors with dark text (e.g., Light Teal background for "Easy").
*   **Code Editor:** A custom component with a dark theme (to contrast with the light UI) or a high-contrast light theme that matches the Slate palette. Ensure line numbers and syntax highlighting are clearly legible.
*   **Progress Bars:** Thin 4px tracks in Slate-200 with Teal fills to show course completion.