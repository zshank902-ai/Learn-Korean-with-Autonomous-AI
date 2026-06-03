---
name: Luminous Hangul
colors:
  surface: '#0f0b3c'
  surface-dim: '#0f0b3c'
  surface-bright: '#363364'
  surface-container-lowest: '#0a0538'
  surface-container-low: '#181445'
  surface-container: '#1c1949'
  surface-container-high: '#262454'
  surface-container-highest: '#312f5f'
  on-surface: '#e3dfff'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#e3dfff'
  inverse-on-surface: '#2d2a5b'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#ffb690'
  on-secondary: '#552100'
  secondary-container: '#ec6a06'
  on-secondary-container: '#4a1c00'
  tertiary: '#c2c6d3'
  on-tertiary: '#2c313a'
  tertiary-container: '#5b606b'
  on-tertiary-container: '#d7dbe8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#dee2ef'
  tertiary-fixed-dim: '#c2c6d3'
  on-tertiary-fixed: '#171c25'
  on-tertiary-fixed-variant: '#424751'
  background: '#0f0b3c'
  on-background: '#e3dfff'
  surface-variant: '#312f5f'
  glass-surface: rgba(255, 255, 255, 0.08)
  glass-border: rgba(255, 255, 255, 0.15)
  glow-purple: rgba(79, 70, 229, 0.4)
  glow-orange: rgba(249, 115, 22, 0.3)
  bg-deep: '#0F172A'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  korean-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

This design system establishes a high-fidelity "Glassmorphic 3D" aesthetic for a modern Korean learning experience. It moves away from flat educational tropes toward a sophisticated, immersive environment that feels like a premium digital workspace.

The style combines **Glassmorphism** (frosted surfaces, backdrop blurs, and translucent layering) with **Neumorphic depth** (soft, tactile extruded elements). The interface should evoke a sense of clarity, technological advancement, and weightless depth. Every surface is treated as a physical layer of glass or light, using ambient glows and 3D icons to provide a tactile, encouraging feedback loop for students.

## Colors

The palette is anchored by a deep, nocturnal neutral (`#1E1B4B`) that allows the chromatic "light" of the brand colors to shine. 

- **Primary Purple (`#4F46E5`)**: Used for active states, key 3D icons, and primary action gradients. It represents the "Logic" of the learning process.
- **Secondary Orange (`#F97316`)**: Used for highlights, motivational "streak" indicators, and secondary call-to-actions. It represents the "Energy" of conversation.
- **Gradients**: Avoid flat fills. Use linear gradients from Purple to a lighter violet, or Orange to a warm coral.
- **Ambient Glow**: Surfaces should emit low-opacity colored glows (Primary or Secondary) to indicate focus or progress.

## Typography

**Plus Jakarta Sans** is the sole typeface, chosen for its modern, geometric construction that balances friendliness with professional clarity. 

- **Hierarchy**: Use generous vertical spacing between text blocks to prevent the glass surfaces from feeling cluttered.
- **Korean Characters**: Ensure line heights are slightly taller (1.6 for body) to accommodate the vertical complexity of Hangul characters without crowding.
- **Weight**: Leverage Extra Bold (800) for display headers to create a strong "3D" presence, and Medium (500-600) for labels to maintain legibility against blurred backgrounds.

## Layout & Spacing

The layout utilizes a **Fixed Grid** for desktop and a **Fluid Grid** for mobile. 

- **Desktop**: A 12-column grid centered in a 1280px container. Elements should often "float" over the background, with large margins between glass panels.
- **Mobile**: A 4-column grid with 16px margins.
- **Z-Axis Spacing**: Depth is as important as XY spacing. Components should appear to sit at different heights. Use increased padding (32px+) inside cards to maintain the "airy" feel of glass.

## Elevation & Depth

Visual hierarchy is managed through **Glassmorphism** and **Neumorphic** principles:

1.  **Backdrop Blur**: Every primary card must have a `backdrop-filter: blur(12px)`.
2.  **Inner Glow**: Use a 1px white or light-purple inner stroke (top and left edges) to simulate a light source hitting the edge of a glass pane.
3.  **Shadows**: Use two layers of shadows. A close, dark shadow for occlusion, and a wide, tinted ambient shadow (using the primary color at 10% opacity) to create a glowing lift effect.
4.  **Tonal Tiers**: 
    - *Level 0 (Background)*: Dark Navy gradient.
    - *Level 1 (Cards)*: Frosted glass surfaces.
    - *Level 2 (Buttons/Modals)*: Higher translucency or solid Neumorphic extrusions.

## Shapes

The shape language is consistently **Rounded (0.5rem base)**. 

- **Main Cards**: Use `rounded-xl` (1.5rem / 24px) to create a friendly, approachable container for learning content.
- **Interactive Elements**: Buttons and inputs use `rounded-lg` (1rem / 16px).
- **Progress Indicators**: Circular shapes and pill-shaped bars should be used for stats to contrast against the rectangular glass panels.

## Components

- **3D Buttons**: Use a solid primary color gradient with a 4px bottom-weighted shadow (darker than the button color). On `:active` state, use a `translateY(2px)` transform and reduce the shadow to simulate a physical "press."
- **Glass Cards**: Must feature a subtle 1px border (`rgba(255, 255, 255, 0.15)`) and a subtle linear gradient background from `top-left` to `bottom-right`.
- **Inputs**: Use a recessed "Neumorphic" styleâ€”a dark, inner-shadowed container that looks "carved" into the glass surface.
- **Floating Navigation**: A pill-shaped bar docked at the bottom of the screen with a heavy backdrop-blur and a high elevation shadow.
- **Learning Chips**: Small, semi-transparent capsules for grammar points or vocabulary categories, using a colored "glow" dot next to the text.
- **3D Icons**: Supplement the UI with soft-shadowed, 3D-rendered icons (e.g., a 3D book, flag, or microphone) to reinforce the tactile theme.