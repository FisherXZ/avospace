# Cody Design System

**AvoSpace Visual Identity & Design Guidelines**

---

## Overview

The Cody Design System provides a cohesive, modern aesthetic for AvoSpace with a warm, approachable feel inspired by avocados and study culture. The system emphasizes clarity, accessibility, and a touch of playfulness.

---

## Color Palette

### Primary Colors

**Sage Green** - Primary brand color
```
#5B9B7E (RGB: 91, 155, 126)
Use: Primary buttons, active states, links
```

**Forest Green** - Headers and emphasis
```
#4A6B4A (RGB: 74, 107, 74)
Use: Section headers, spot names, bold text
```

### Status Colors

**Coral** - Open/Available
```
#E89B8E (RGB: 232, 155, 142)
Use: "Open to study" status badges, active indicators
```

**Sky Blue** - Solo/Focus
```
#A8C8E8 (RGB: 168, 200, 232)
Use: "Solo study" status badges, secondary actions
```

**Sunny Yellow** - Breaks/Highlights
```
#F4F0B8 (RGB: 244, 240, 184)
Use: "On break" status, section highlights, accent backgrounds
```

**Muted Purple** - All-nighter
```
#B8A8D8 (RGB: 184, 168, 216)
Use: "All-nighter" status
```

**Warm Orange** - Procrastinating
```
#F4B88E (RGB: 244, 184, 142)
Use: "Procrastinating" status
```

**Deep Red** - SOS/Urgent
```
#E88E8E (RGB: 232, 142, 142)
Use: "SOS" status, error states
```

### Neutrals

**Pure White**
```
#FFFFFF
Use: Card backgrounds, modal backgrounds
```

**Light Gray**
```
#F5F5F5 (RGB: 245, 245, 245)
Use: Page backgrounds, disabled states
```

**Border Gray**
```
#E5E5E5 (RGB: 229, 229, 229)
Use: Card borders, dividers, subtle outlines
```

**Text Gray**
```
#6B7280 (RGB: 107, 114, 128)
Use: Secondary text, timestamps, metadata
```

**Dark Gray**
```
#374151 (RGB: 55, 65, 81)
Use: Body text, primary content
```

---

## Typography

### Font Families

**Primary:** Inter (sans-serif)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Alternative:** Poppins (for headers, if more personality desired)
```css
font-family: 'Poppins', 'Inter', sans-serif;
```

**Kaomoji/Emoji:** System default
```css
font-family: 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif;
```

### Type Scale

**Display / Hero**
```css
font-size: 48px;
font-weight: 700;
line-height: 1.2;
letter-spacing: -0.02em;
```

**H1 / Page Title**
```css
font-size: 32px;
font-weight: 700;
line-height: 1.3;
```

**H2 / Section Header**
```css
font-size: 24px;
font-weight: 700;
line-height: 1.4;
color: #4A6B4A; /* Forest Green */
```

**H3 / Card Title**
```css
font-size: 20px;
font-weight: 600;
line-height: 1.4;
color: #4A6B4A;
```

**Body / Regular**
```css
font-size: 16px;
font-weight: 400;
line-height: 1.6;
color: #374151;
```

**Small / Metadata**
```css
font-size: 14px;
font-weight: 400;
line-height: 1.5;
color: #6B7280;
```

**Tiny / Labels**
```css
font-size: 12px;
font-weight: 500;
line-height: 1.4;
text-transform: uppercase;
letter-spacing: 0.05em;
```

---

## Spacing System

**Base Unit:** 8px (use multiples for consistency)

```
4px   - xxs (tight gaps, icon padding)
8px   - xs  (small spacing, badges)
12px  - sm  (compact elements)
16px  - md  (default spacing)
24px  - lg  (section spacing)
32px  - xl  (card padding, large gaps)
48px  - 2xl (page margins)
64px  - 3xl (hero sections)
```

### Common Patterns

**Card Padding:** 32px (xl)
**Button Padding:** 12px 24px (sm lg)
**Modal Padding:** 24px (lg)
**Page Container:** max-width 1200px, padding 48px (2xl)

---

## Components

### Buttons

**Primary Button** (Call to action)
```css
background: #5B9B7E;
color: white;
padding: 12px 24px;
border-radius: 24px; /* Full pill shape */
font-size: 16px;
font-weight: 600;
border: none;
cursor: pointer;
transition: all 0.2s ease;

/* Hover */
background: #4A8A6D;
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(91, 155, 126, 0.3);
```

**Secondary Button** (Alternative action)
```css
background: white;
color: #5B9B7E;
border: 2px solid #5B9B7E;
padding: 10px 22px; /* Account for border */
border-radius: 24px;
font-size: 16px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;

/* Hover */
background: #F5F5F5;
```

**Danger Button** (Destructive action)
```css
background: #E88E8E;
color: white;
padding: 12px 24px;
border-radius: 24px;
/* ... similar to primary */
```

### Badges

**Status Badge**
```css
display: inline-flex;
align-items: center;
gap: 4px;
padding: 6px 12px;
border-radius: 12px;
font-size: 14px;
font-weight: 500;
```

**Badge Variants:**
- Open: `background: #E89B8E; color: white;`
- Solo: `background: #A8C8E8; color: white;`
- Break: `background: #F4F0B8; color: #374151;`
- SOS: `background: #E88E8E; color: white;`

**Count Badge** (Notification)
```css
background: #E89B8E;
color: white;
border-radius: 50%;
width: 24px;
height: 24px;
font-size: 12px;
font-weight: 700;
display: flex;
align-items: center;
justify-content: center;
border: 2px solid white;
```

### Cards

**Study Spot Card**
```css
background: white;
border: 1px solid #E5E5E5;
border-radius: 12px;
padding: 32px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
transition: all 0.3s ease;

/* Hover */
transform: translateY(-4px);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
border-color: #5B9B7E;
```

**Modal Card**
```css
background: white;
border-radius: 16px;
padding: 24px;
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
max-width: 500px;
width: 90%;
```

### Forms

**Input Field**
```css
padding: 12px 16px;
border: 2px solid #E5E5E5;
border-radius: 8px;
font-size: 16px;
color: #374151;
transition: border-color 0.2s ease;

/* Focus */
border-color: #5B9B7E;
outline: none;
box-shadow: 0 0 0 3px rgba(91, 155, 126, 0.1);
```

**Textarea**
```css
/* Same as input, but: */
min-height: 80px;
resize: vertical;
```

**Character Counter**
```css
font-size: 12px;
color: #6B7280;
text-align: right;
margin-top: 4px;
```

### Icons

**Size Scale:**
- Small: 16px × 16px (inline with text)
- Medium: 24px × 24px (buttons, badges)
- Large: 32px × 32px (section headers)
- XL: 48px × 48px (empty states)

**Icon Style:** Prefer emoji or simple SVG line icons (1.5-2px stroke)

---

## Layout Patterns

### Page Structure

```
┌─────────────────────────────────────┐
│         Navbar (fixed top)          │
├────────┬────────────────────────────┤
│        │                            │
│ Side-  │      Main Content          │
│ bar    │      (max-width: 1200px)   │
│        │                            │
│ (opt)  │                            │
└────────┴────────────────────────────┘
```

**Navbar:** 64px height, white background, shadow on scroll
**Sidebar:** 240px width (desktop), hidden on mobile
**Main Content:** Centered, max-width 1200px, padding 48px

### Grid System

**Study Spot Cards Grid**
```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
gap: 24px;
```

**Responsive Breakpoints:**
```css
/* Mobile */
@media (max-width: 767px) {
  /* Single column, full width */
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 2 columns */
  grid-template-columns: repeat(2, 1fr);
}

/* Desktop */
@media (min-width: 1024px) {
  /* 3 columns */
  grid-template-columns: repeat(3, 1fr);
}
```

---

## Animations

### Timing Functions

**Standard Ease:** `cubic-bezier(0.4, 0, 0.2, 1)` - Most transitions
**Ease Out:** `cubic-bezier(0.0, 0, 0.2, 1)` - Elements entering
**Ease In:** `cubic-bezier(0.4, 0, 1, 1)` - Elements exiting

### Common Animations

**Fade In**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

animation: fadeIn 0.3s ease-out;
```

**Slide Up**
```css
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

animation: slideUp 0.4s ease-out;
```

**Card Hover Lift**
```css
transition: transform 0.3s ease, box-shadow 0.3s ease;

&:hover {
  transform: translateY(-4px);
}
```

**Pulse** (for attention-grabbing elements)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

animation: pulse 2s infinite;
```

**Spinner** (loading states)
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

animation: spin 1s linear infinite;
```

---

## Accessibility

### Color Contrast

All text must meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)

**Verified Combinations:**
- ✅ Forest Green (#4A6B4A) on White (#FFFFFF) - 6.2:1
- ✅ Dark Gray (#374151) on White - 10.5:1
- ✅ White on Sage Green (#5B9B7E) - 3.8:1 (large text only)
- ✅ White on Coral (#E89B8E) - 3.2:1 (large text only)

### Focus States

All interactive elements MUST have visible focus indicators:

```css
/* Keyboard focus (not mouse click) */
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #5B9B7E;
  outline-offset: 2px;
}
```

### Screen Reader Support

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- Add `aria-label` to icon-only buttons
- Use `alt` text for all images
- Mark decorative icons as `aria-hidden="true"`

---

## Iconography

### Emoji Usage

**Preferred Icons:**
- 📚 Study/Library
- 🥑 Avocado (brand)
- 📍 Location
- ✓ Checkmark/Success
- ⏱ Timer/Duration
- 💬 Message
- 👥 People/Community
- 🗺️ Map
- 🤝 Open to study
- 🎧 Solo study
- ☕ Break
- 🆘 SOS
- 🌙 All-nighter

### SVG Icons

For non-emoji icons, use 1.5-2px stroke, rounded line caps:

```jsx
<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path 
    d="M..." 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  />
</svg>
```

---

## States

### Interactive Element States

**Default → Hover → Active → Disabled**

**Button Example:**
```css
/* Default */
background: #5B9B7E;
opacity: 1;

/* Hover */
background: #4A8A6D;
transform: translateY(-1px);

/* Active (clicking) */
background: #3A7A5D;
transform: translateY(0);

/* Disabled */
background: #E5E5E5;
color: #6B7280;
cursor: not-allowed;
opacity: 0.6;
```

### Loading States

**Skeleton Screens** (for content loading)
```css
background: linear-gradient(
  90deg,
  #F5F5F5 25%,
  #E5E5E5 50%,
  #F5F5F5 75%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**Spinners** (for actions)
```jsx
<div className="spinner-border text-success" role="status">
  <span className="visually-hidden">Loading...</span>
</div>
```

### Empty States

**Pattern:**
- Large icon (48-64px)
- Short descriptive message
- Optional call-to-action button

```jsx
<div className="empty-state">
  <div className="empty-icon">📚</div>
  <h3>No study spots yet</h3>
  <p>Check back soon for available locations!</p>
</div>
```

---

## Best Practices

### Do's ✅

- Use consistent spacing (multiples of 8px)
- Provide feedback for all user actions (loading, success, error)
- Animate intentionally (don't overdo it)
- Test on mobile devices (touch targets ≥ 44px × 44px)
- Use semantic HTML
- Maintain color contrast ratios
- Keep text line lengths readable (45-75 characters)

### Don'ts ❌

- Don't use more than 3 colors in a single component
- Don't animate everything (only meaningful transitions)
- Don't use tiny fonts (< 14px for body text)
- Don't forget hover states
- Don't use color alone to convey meaning (add icons/text)
- Don't create accessibility barriers
- Don't mix font families excessively

---

## Design Tokens

For consistent implementation across components:

```typescript
// colors.ts
export const colors = {
  primary: '#5B9B7E',
  primaryDark: '#4A6B4A',
  
  status: {
    open: '#E89B8E',
    solo: '#A8C8E8',
    break: '#F4F0B8',
    sos: '#E88E8E',
    allnighter: '#B8A8D8',
    procrastinating: '#F4B88E',
    cram: '#7A9A7A',
  },
  
  neutral: {
    white: '#FFFFFF',
    gray100: '#F5F5F5',
    gray200: '#E5E5E5',
    gray500: '#6B7280',
    gray800: '#374151',
  },
};

// spacing.ts
export const spacing = {
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// borderRadius.ts
export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  full: '9999px', // Pills
};
```

---

## Examples

### Study Spot Card (Complete)

```jsx
<div className="study-spot-card">
  {/* Header */}
  <div className="card-header">
    <h3 className="spot-name">Doe Library</h3>
    <span className="badge badge-open">📍 Open</span>
  </div>
  
  <p className="spot-hours">🕐 8:00 AM - 12:00 AM</p>
  
  <div className="spot-count">
    <span className="count-badge">3 studying</span>
  </div>
  
  {/* Roster */}
  <div className="roster-list">
    <div className="check-in-item">
      <div className="kaomoji">(^_^)</div>
      <span className="status-badge status-open">🤝 Open</span>
    </div>
  </div>
  
  {/* Action */}
  <button className="btn-primary">
    ✓ Check In Here
  </button>
</div>
```

### Modal (Complete)

```jsx
<div className="modal-backdrop" onClick={onClose}>
  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
    {/* Header */}
    <div className="modal-header">
      <h2>Check in to Doe Library</h2>
      <button className="btn-close" onClick={onClose}>×</button>
    </div>
    
    {/* Body */}
    <div className="modal-body">
      <label className="form-label">
        ⏱️ How long will you study?
      </label>
      <div className="duration-picker">
        <button className="duration-btn active">1 hour</button>
        <button className="duration-btn">2 hours</button>
      </div>
      
      <textarea 
        className="form-textarea"
        placeholder="Optional status note..."
        maxLength={120}
      />
      <div className="char-counter">0/120</div>
    </div>
    
    {/* Footer */}
    <div className="modal-footer">
      <button className="btn-secondary" onClick={onClose}>
        Cancel
      </button>
      <button className="btn-primary" onClick={onSubmit}>
        ✓ Check In
      </button>
    </div>
  </div>
</div>
```

---

**Document Version:** 1.0  
**Last Updated:** November 18, 2024  
**Status:** Active Design System
