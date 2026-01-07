# QuartettNation Design Guidelines

## 1. Design Philosophy
QuartettNation features a **Vintage Nostalgia ("Attic Treasures")** aesthetic.
*   **Core Concepts:** Tactile paper textures, faded retro colors, warm "basement" lighting, and the feeling of rediscovered physical objects.
*   **Goal:** The app should feel like opening a dusty shoebox of beloved trading cards from the 70s/80s. Physical, warm, and sentimental.

## 2. Color Palette
All colors are defined as CSS variables in `index.css`.

| Role | Variable | Value | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `--background` | `#2c241b` (Dark Wood/Dust) | Main background. |
| **Surface** | `--surface` | `#f4e4bc` (Aged Paper) | Cards, panels (Light background!). |
| **Surface Alt** | `--surface-alt` | `#e6d2a0` (Darker Paper) | Secondary panels. |
| **Primary** | `--primary` | `#d9534f` (Faded Red) | Primary actions. |
| **Secondary** | `--secondary` | `#5bc0de` (Retro Blue) | Secondary accents. |
| **Accent** | `--accent` | `#f0ad4e` (Mustard Yellow) | Highlights. |
| **Border** | `--border-color` | `#8c7b6c` (Cardboard/Leather) | Strokes. |

## 3. Typography
*   **Font Family:** `Courier Prime`, `Courier New`, or a rounded Sans-Serif like `Varela Round` (if available) to mimic printed text.
*   **Headings:** Bold, slightly textured or stamped look.
*   **Body:** Typewriter or clean printed style.

### Typography & Colors
**Text Colors (Strict Limit of 4):**
1.  **`--text-light`** (`#f0ead6`): Default UI text (Dark Backgrounds). Off-White.
2.  **`--text-ink`** (`#0d0d0d`): Paper/Card text. Near Black.
3.  **`--text-gold`** (`#dfa546`): Dark UI Highlights. Mustard.
4.  **`--text-red`** (`#c94c4c`): Light UI Highlights. Faded Red.

*Note: For secondary or dim text, use one of the above colors with `opacity: 0.7`.*

**Backgrounds:**
- **App Background**: `#231e18` (Dark Wood/Basement)
- **Card Surface**: `#f1d8b6` (Aged Paper)
- **Overlay**: Grainy noise with `mix-blend-mode: overlay`.

## 4. Components

### Buttons (`.btn`)
*   **Style:** Skueomorphic/Tactile. Looks like a physical button or a pressed cardboard token.
*   **Shadows:** Soft, natural drop shadows (`box-shadow: 2px 4px 8px rgba(0,0,0,0.3)`).
*   **Radius:** Rounded (`--radius-sm`).
*   **Texture:** Subtle grain or gradient.

### Cards (The Stars of the Show)
*   **Background:** Off-white/Cream (`#f4e4bc`) to look like cardstock.
*   **Borders:** Rounded corners (`--radius-md`), whitespace padding around the image.
*   **Shadows:** Realistic lift (`box-shadow: 0 4px 12px rgba(0,0,0,0.4)`).
*   **Wear:** Subtle sepia tones.

### Inputs
*   **Style:** Looks like writing on a form or uneven paper. Underlined or inset.

## 5. Layout & Spacing
*   **Spacing:** Comfortable, "analog" spacing.
*   **Grid:** `.modern-grid` remains.

## 6. Interactions
*   **Feedback:** Smooth lifts on hover (picking up the card).
*   **Animations:** Ease-in-out, gentle, like handling physical objects.
