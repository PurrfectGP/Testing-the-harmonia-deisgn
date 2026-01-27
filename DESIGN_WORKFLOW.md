# Harmonia Design Workflow Guide

## Overview

This document explains how to work with the design branches, what each branch contains, and how to use Claude and Google AI Studio efficiently for design changes.

---

## Branch Structure

Each design section has its own dedicated branch for isolated development:

| Branch Name | Purpose | Main File Section |
|-------------|---------|-------------------|
| `claude/design-home-hero-y6Pe3` | Home page hero section | Lines 431-500+ in HTML |
| `claude/design-why-harmonia-y6Pe3` | Why Harmonia page (animated icons) | Lines 6221-6556 |
| `claude/design-partnerships-y6Pe3` | Partnerships page & modal | Lines 6573-6682 |
| `claude/design-team-y6Pe3` | Team page & member cards | Lines 6682-7000+ |
| `claude/design-contact-y6Pe3` | Contact section & form | Lines 5237-5695 |
| `claude/design-navigation-y6Pe3` | Navigation, hamburger, theme toggle | Lines 138-430 |
| `claude/design-css-tokens-y6Pe3` | CSS variables, colors, typography | Lines 1-137 |
| `claude/design-animations-y6Pe3` | Keyframe animations & effects | Throughout CSS |

---

## Main Design File

**File**: `harmonia_integrated_v30 (5) (2).html`

This is a standalone 8,500+ line HTML file containing:
- All CSS styles (inline)
- All JavaScript (inline)
- Complete UI structure
- Light/Dark mode support

### Key Sections in the HTML:

```
Lines 1-6000:      CSS Styles
  - 1-137:         Root variables & design tokens
  - 138-430:       Navigation & theme toggle
  - 431-1000:      Hero section styles
  - 1000-3500:     Page layouts & responsive styles
  - 3500-6000:     Component-specific styles

Lines 6000-8000:   HTML Structure
  - 6134-6220:     Navigation HTML
  - 6168-6220:     Home page
  - 6221-6556:     Why Harmonia page
  - 6573-6682:     Partnerships page
  - 6682-7200:     Team page
  - 7200+:         Contact & Footer

Lines 8000+:       JavaScript
  - Theme toggle logic
  - Navigation interactions
  - Animations & scroll effects
```

---

## What to Put in Each Branch

### 1. `claude/design-home-hero-y6Pe3`
**Focus**: Hero landing section

**Tasks**:
- Hero grid layout (text column vs image)
- Tagline animations
- CTA button styling
- Background gradient effects
- Responsive hero adjustments

**CSS Classes to Modify**:
- `.hero`, `.hero-content`, `.tagline`
- `.cta-button`, `.hero::before`

---

### 2. `claude/design-why-harmonia-y6Pe3`
**Focus**: Why Harmonia explanation page

**Tasks**:
- Animated Eye icon (SVG)
- Animated Personality icon (dots + arcs)
- Animated DNA icon (helix + particles)
- Convergence animation (logo reveal)
- Problem cards styling

**CSS Classes to Modify**:
- `.eye-container`, `.personality-icon`
- `.dna-icon`, `.convergence-animation`
- `.problem-card`, `.section-title`

---

### 3. `claude/design-partnerships-y6Pe3`
**Focus**: Partnerships display

**Tasks**:
- Partnership tier tabs
- Partner logo grid/boxes
- Partnership modal styling
- Hover effects and transitions

**CSS Classes to Modify**:
- `.partnerships-section`, `.partner-box`
- `.partnership-modal`, `.tier-tabs`

---

### 4. `claude/design-team-y6Pe3`
**Focus**: Team member showcase

**Tasks**:
- Team member cards
- Avatar animations (laurel wreaths, etc.)
- Role badges and descriptions
- Grid/carousel layout

**CSS Classes to Modify**:
- `.team-section`, `.team-member`
- `.avatar-container`, `.member-info`

---

### 5. `claude/design-contact-y6Pe3`
**Focus**: Contact form & section

**Tasks**:
- Form input styling
- Submit button effects
- Validation states
- Success/error messages

**CSS Classes to Modify**:
- `.contact-section`, `.contact-form`
- `.form-input`, `.submit-btn`

---

### 6. `claude/design-navigation-y6Pe3`
**Focus**: Header navigation

**Tasks**:
- Logo styling and hover effects
- Nav links active states
- Hamburger menu animation
- Mobile navigation overlay
- Theme toggle switch

**CSS Classes to Modify**:
- `nav`, `.logo`, `.nav-links`
- `.hamburger`, `.theme-toggle`
- `.nav-links.mobile-open`

---

### 7. `claude/design-css-tokens-y6Pe3`
**Focus**: Design system foundation

**Tasks**:
- Color palette adjustments
- Typography scale changes
- Spacing/sizing tokens
- Light/dark mode variables

**CSS to Modify**:
- `:root { }` variables
- `[data-theme="dark"]` overrides

---

### 8. `claude/design-animations-y6Pe3`
**Focus**: Motion & effects

**Tasks**:
- Keyframe definitions
- Transition timing
- Hover/interaction animations
- Page transition effects

**CSS to Modify**:
- `@keyframes` rules
- `transition` properties
- `animation` properties

---

## Using Claude Efficiently for Design Changes

### Best Prompts for Claude

**For CSS Changes:**
```
Look at the [SECTION NAME] in harmonia_integrated_v30.html.
I want to [SPECIFIC CHANGE].
Show me the exact CSS changes needed, with before/after.
```

**For Layout Changes:**
```
The [COMPONENT] currently uses [CURRENT LAYOUT].
Change it to [DESIRED LAYOUT] while keeping the dark mode styles.
Preserve responsive breakpoints.
```

**For Animation Tweaks:**
```
The [ANIMATION NAME] animation feels too [fast/slow/jarring].
Adjust the timing/easing to be more [smooth/dramatic/subtle].
Keep the existing keyframes structure.
```

### Claude Workflow Tips

1. **Always Read First**: Ask Claude to read the relevant section before making changes
   ```
   Read lines 138-430 of harmonia_integrated_v30.html
   and explain what the navigation styles do.
   ```

2. **Be Specific About Scope**: Tell Claude exactly which classes to modify
   ```
   Only modify .hero-content and .tagline classes.
   Do not change .hero or .cta-button.
   ```

3. **Request Incremental Changes**: Don't ask for massive rewrites
   ```
   Change just the gold color value from #D4A853 to #E8B84A
   across all CSS variables.
   ```

4. **Test Dark Mode**: Always ask Claude to verify dark mode
   ```
   After this change, verify the [data-theme="dark"]
   styles still work correctly.
   ```

5. **Mobile-First Review**: Ask Claude to check responsive styles
   ```
   Check if this change breaks any @media queries
   for mobile (max-width: 768px).
   ```

---

## Using Google AI Studio Efficiently

Google AI Studio (Gemini) is great for:
- Generating creative copy/text
- Brainstorming design ideas
- Quick SVG icon generation
- Color palette suggestions

### Best Prompts for AI Studio

**For Copy/Text:**
```
Write marketing copy for a compatibility assessment app
called "Harmonia" with a Victorian Scientific aesthetic.
Tone: mysterious, romantic, slightly dramatic.
```

**For Color Ideas:**
```
Suggest 5 accent colors that complement:
- Void Black: #12090A
- Gold: #D4A853
- Maroon: #722F37
For a dark, luxurious dating app.
```

**For SVG Icons:**
```
Create an SVG icon for [CONCEPT] that matches:
- Minimalist line art style
- Works at 24x24 and 48x48 sizes
- Single color (to be styled with CSS)
```

### AI Studio Workflow Tips

1. **Use for Ideation**: Great for generating multiple variations quickly
2. **Export to Claude**: Take AI Studio ideas and have Claude implement them
3. **Batch Requests**: Ask for 5-10 variations at once
4. **Be Visual**: Describe what you see, not what you want technically

---

## Workflow: Making Design Changes

### Step 1: Choose the Right Branch
```bash
git checkout claude/design-[section]-y6Pe3
```

### Step 2: Tell Claude What You Want
```
I'm on the design-navigation branch.
Read the navigation CSS and make the logo
pulse with a gold glow on hover.
```

### Step 3: Review Changes
- Check the exact lines Claude modified
- Test in browser (light & dark mode)
- Test mobile responsive

### Step 4: Commit & Push
```bash
git add .
git commit -m "Add gold pulse effect to logo hover"
git push -u origin claude/design-[section]-y6Pe3
```

### Step 5: Merge When Ready
Create a PR to merge design changes into main branch.

---

## Design System Quick Reference

### Color Tokens
| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `--cream` | #FAF6F1 | #12090A |
| `--gold` | #D4A853 | #F0C86E |
| `--maroon` | #722F37 | #722F37 |
| `--navy` | #1E293B | #F5F0E8 |

### Typography
| Use | Font | Weights |
|-----|------|---------|
| Headers | Cormorant Garamond | 400, 500, 600, 700 |
| Body/UI | DM Sans | 400, 500, 600, 700 |
| Code | JetBrains Mono | 400 |

### Breakpoints
| Name | Width |
|------|-------|
| Mobile | max-width: 480px |
| Tablet | max-width: 768px |
| Desktop | max-width: 1024px |
| Large | max-width: 1200px |

---

## Common Tasks & Commands

### View All Design Branches
```bash
git branch -a | grep design
```

### Switch Between Branches
```bash
git checkout claude/design-home-hero-y6Pe3
git checkout claude/design-css-tokens-y6Pe3
```

### See What Changed
```bash
git diff HEAD~1 -- "harmonia_integrated_v30 (5) (2).html"
```

### Quick Test
Open the HTML file directly in browser - no build needed!

---

## Tips for Success

1. **One Change Per Commit**: Keep commits focused and atomic
2. **Test Both Themes**: Always verify light and dark mode
3. **Mobile First**: Check responsive after every change
4. **Use Comments**: Add CSS comments for complex sections
5. **Backup Before Big Changes**: Create a branch before experimenting

---

## Getting Help

- Ask Claude to explain any section of the CSS
- Use browser DevTools to inspect live styles
- Reference the PLAN.md for architectural decisions
- Check the PDF documentation for design intent

---

*Last Updated: January 2026*
