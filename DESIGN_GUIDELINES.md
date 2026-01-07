# QuartettNation Design Guidelines

## 1. Design Philosophy
QuartettNation features a **Premium Dark Modern** aesthetic.
*   **Core Concepts:** Deep dark backgrounds, vibrant gradients, glassmorphism overlays, and smooth micro-interactions.
*   **Goal:** The app should feel immersive and "native-like" on mobile, avoiding generic "bootstrap" looks.

## 2. Color Palette
All colors are defined as CSS variables in `index.css`.

| Role | Variable | Value | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `--background` | `#0f172a` (Slate 900) | Main page background. |
| **Surface** | `--surface` | `#1e293b` (Slate 800) | Cards, list items, panels. |
| **Primary** | `--primary` | `#6366f1` (Indigo 500) | Primary actions, links, active states. |
| **Secondary** | `--secondary` | `#ec4899` (Pink 500) | Secondary accents, fun elements. |
| **Accent** | `--accent` | `#f59e0b` (Amber 500) | Highlights, warnings, special statuses. |
| **Text** | `--text` | `#f8fafc` (Slate 50) | Primary text. |
| **Text Dim** | `--text-dim` | `#94a3b8` (Slate 400) | Subtitles, labels, hints. |
| **Glass** | `--glass` | `rgba(30, 41, 59, 0.7)` | Overlays, headers, sticky elements. |

## 3. Typography
*   **Font Family:** `Inter`, system-ui, sans-serif.
*   **Heading Weight:** `700` (bold) with `letter-spacing: -0.025em`.
*   **Body Weight:** `400` (regular).
*   **Labels/Buttons:** `500` or `600` (medium/semibold).

## 4. Components

### Buttons (`.btn`)
*   **Touch Target:** Minimum height `48px` for all interactive elements (mobile-first).
*   **Border Radius:** `--radius-md` (16px) for standard buttons, `--radius-sm` (8px) for small controls.
*   **Primary:** Gradient background (`--primary` to `#4f46e5`), white text, subtle shadow glow (`--primary-glow`).
*   **Secondary:** Surface color background, glass border, text color.
*   **Ghost:** Transparent background, dim text until hover.

### Cards & Panels
*   **Glass Panel:** Use `.glass-panel` for floating overlays.
*   **App Card:** Use `.app-card` for main content containers (lobbies, forms).
*   **Borders:** Subtle 1px borders using `--glass-border` (`rgba(255, 255, 255, 0.1)`).

### Inputs
*   **Style:** Minimalist, flat background (`--surface-alt`), light border.
*   **Focus:** Glow effect with `--primary` color.

## 5. Layout & Spacing
*   **Grid:** Use `.modern-grid` for card layouts (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`).
*   **Lists:** Use `.modern-list` and `.modern-list-item`.
*   **Spacing:** Use variables `--spacing-xs` (4px) to `--spacing-xl` (32px). Avoid magic numbers.
*   **Mobile:** Max-width containers (`--card-max-width: 380px` for game cards) to ensure playability on phones.

## 6. Interactions
*   **Gestures:** Use `@use-gesture/react` for complex interactions (drag, zoom).
*   **Feedback:** All interactive elements must have `:hover` and `:active` states.
*   **Scrolling:** prevent body scroll when interacting with canvas/zoom elements (`touch-action: none`).
