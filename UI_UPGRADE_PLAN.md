## AvoSpace UI Upgrade Plan

### Scope

- **Phase 1**: Visual system foundation + Navbar refinement.
- **Phase 2**: Login / Sign Up (`/`) page redesign.
- **Phase 3**: Home feed (`/home`) redesign.
- (Future) **Phase 4**: Account/profile (`/account`) redesign.

---

### Phase 1 – Visual System + Navbar

- **Goals**
  - Define a simple, modern visual system (colors, spacing, typography, card styles).
  - Make `Navbar` feel more like a slim app shell header instead of a generic Bootstrap bar.

- **Tasks**
  - [x] Add/adjust CSS tokens in `globals.css` for:
    - Background, surface, accent colors.
    - Base font stack, font sizes, and border-radius.
    - Generic `app-shell`, `page-container`, and `card` style helpers.
  - [x] Polish `Navbar` styles:
    - Reduce height, add a subtle bottom border/shadow.
    - Improve spacing between logo and nav actions.
    - Ensure it looks clean on mobile and desktop.

- **Status**
  - Overall: **Completed (Phase 1 base styles + Navbar polish)**
  - `globals.css` tokens: **Done**
  - `Navbar` styling: **Done**

---

### Phase 2 – Login / Sign Up (`/`) Page

- **Goals**
  - Create an Instagram-like, modern auth experience.
  - Use a two-column hero layout on desktop and a single-column layout on mobile.

- **Tasks**
  - [x] Replace the basic centered container with:
    - A left branding/hero column (logo, tagline, short explanation).
    - A right auth card with login/sign up form.
  - [x] Introduce a card-based form:
    - Clear heading and toggle between “Log in” and “Sign up”.
    - Styled inputs and primary button using the visual system from Phase 1.
    - Inline error messaging instead of `alert()` for auth errors.
  - [x] Ensure layout is responsive:
    - Stack columns on small screens.
    - Full-width inputs on mobile.

- **Status**
  - Overall: **Completed**
  - Layout structure: **Implemented (two-column desktop, single-column mobile)**
  - Auth card design: **Implemented (card, toggle, headings)**
  - Error handling UX: **Implemented (inline error banner)**

---

### Phase 3 – Home Feed (`/home`)

- **Goals**
  - Make the home experience feel like a modern social feed centered on the page.
  - Introduce an Instagram-inspired **left sidebar** with icons only, showing text labels when the sidebar is hovered.

- **Tasks**
  - [x] Replace the old left sidebar with a slim, icon-only vertical sidebar:
    - Icons for **Home**, **Friends**, and **Post**.
    - Sidebar expands / reveals full text labels when hovered.
  - [x] Center the feed column:
    - Use a max-width content column for posts, aligned similarly to Instagram.
    - Ensure background and card styles use the Phase 1 visual system.
  - [x] Refine loading and empty states for both Home and Friends tabs.
  - [ ] Prepare `Post` card styling so it can be reused consistently across pages.

- **Status**
  - Overall: **In progress**
  - Sidebar behavior (icons + hover labels): **Implemented**
  - Centered feed layout: **Implemented**
  - Post card styling unification: **Planned (shared with Phase 3 post card todo)**

---

### Progress Log

- **Completed**:
  - Implemented Phase 1 visual tokens and Navbar polish.
  - Redesigned the login page according to Phase 2.

