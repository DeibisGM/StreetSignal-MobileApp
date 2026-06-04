---
name: Street Signal
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
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#0060ac'
  on-secondary: '#ffffff'
  secondary-container: '#64a8fe'
  on-secondary-container: '#003c70'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 48px
---

## Brand & Style
The design system is a sophisticated fusion of **Glassmorphism** and **Minimalism**, engineered for a high-end mobile experience. It prioritizes depth, clarity, and a sense of "atmospheric weight." The brand personality is professional and precise, yet feels airy and responsive. 

By utilizing realistic background blurs and fine-grained borders, the UI creates a spatial hierarchy where information appears to float over vibrant, dynamic backgrounds. The aesthetic target is "High-Fidelity Utility"—a tool that feels like a premium lifestyle accessory while maintaining the rigor of a functional productivity suite.

## Colors
This design system utilizes a professional palette anchored by **Electric Blue** (Primary) and **Slate Navy** (Tertiary). 

- **Backgrounds:** Use a "Clean Atmospheric" approach. Instead of flat grays, use ultra-subtle gradients of Primary tinted with 98% white for light mode, or deep navy-to-black gradients for dark mode.
- **Surface Colors:** Glass layers should be white at 60-80% opacity with a `24px` backdrop blur. 
- **Accents:** The secondary blue is reserved for interactive states and progress indicators to maintain high visibility against blurred backgrounds.

## Typography
The system relies exclusively on **Inter** to achieve a systematic, utilitarian aesthetic. 

- **Hierarchy:** Use Semibold (`600`) for headers to create a strong visual anchor against glass surfaces. 
- **Body Text:** Use Regular (`400`) for long-form content, ensuring line heights are generous (`150%`) to improve legibility over translucent layers.
- **Labels:** Small labels use Medium (`500`) or Bold (`700`) in all-caps for metadata, such as date ranges or secondary categories, providing a distinct contrast to primary content.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on generous safe areas. 

- **Margins:** A standard `24px` horizontal margin is required for mobile to ensure content feels "inset" and premium.
- **Vertical Rhythm:** Elements are grouped using a stack-based approach (8, 16, 32, 48). 
- **Reflow:** On tablet and desktop, cards do not stretch to full width; instead, they adopt a multi-column masonry layout to preserve the intimacy of the mobile experience. 
- **Visual Breathing Room:** Maintain high whitespace between distinct functional groups (e.g., "Today's Focus" vs "Weekly Overview").

## Elevation & Depth
Depth is the defining characteristic of the design system. 

- **The Glass Layer:** Primary containers use a `24px` to `40px` backdrop blur. A `1px` inner border (solid white at 20% opacity) must be applied to the top and left edges to simulate light catching the edge of the glass.
- **Shadows:** Use deep, multi-layered "Ambient Shadows." Instead of a single dark shadow, stack a broad, low-opacity shadow (e.g., `0 20px 40px rgba(0,0,0,0.05)`) with a tighter, more defined shadow to ground the element.
- **Z-Index Hierarchy:** 
  1. **Background:** Gradients/Imagery.
  2. **Level 1 (Sub-glass):** Information that moves with the scroll but is recessed.
  3. **Level 2 (Main Card):** High blur, soft shadows.
  4. **Level 3 (Interactive):** Elements like buttons that use "Floating" elevation with higher contrast.

## Shapes
The shape language is consistently **Rounded**, using `32px` (`rounded-xl`) for major container cards to create a friendly, modern silhouette. 

- **Primary Containers:** `32px` corner radius.
- **Secondary Buttons/Inputs:** `16px` corner radius.
- **Indicators (e.g., dots, avatars):** Fully circular (pill-shaped).
- **Consistency:** Avoid mixing sharp and rounded corners. Every interactive surface must feel soft to the touch.

## Components
- **Buttons:** Primary buttons are high-contrast (Solid Primary or Solid Black) with `16px` rounding. For glass-style secondary buttons, use a subtle white-translucent fill with a visible border.
- **Cards:** The signature component. These must feature the backdrop blur and the `1px` highlight border mentioned in the Elevation section. Padding within cards should be a minimum of `24px`.
- **Inputs:** Use ghost-style inputs with a `1px` border (white 30%) and a soft background blur when focused.
- **Chips/Badges:** Use "Pill" shapes with low-opacity fills of the Primary color to categorize items without cluttering the visual field.
- **Progress Bars:** Thin, high-contrast lines. Use the Secondary blue for the "active" portion and a translucent neutral for the "track."
- **List Items:** Separated by generous spacing rather than divider lines. If dividers are necessary, they should be `1px` and semi-transparent, not reaching the edges of the container.