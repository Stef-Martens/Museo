---
name: museum-modern-design
description: Museo UI design system — editorial museum aesthetic with warm neutrals, serif typography, and restrained accents. Use when designing or styling Museo screens, components, colors, typography, or when the user asks for museum-modern, gallery, or editorial look.
---

# Museo — Museum Modern Design

## Personality

Editorial gallery app, not a mobile game. Think MoMA app, Artsy, Tate — quiet confidence, art-first, typography-led. Gamification stays subtle; the artwork is always the hero.

## Color palette

| Token | Hex | Use |
|-------|-----|-----|
| `canvas` | `#F7F5F0` | Page background (warm gallery wall) |
| `surface` | `#FFFFFF` | Cards, sheets, nav |
| `ink` | `#1A1A1A` | Primary text |
| `stone` | `#6B6560` | Secondary text |
| `mist` | `#E8E4DD` | Borders, dividers |
| `accent` | `#B8432F` | CTAs, active states (museum terracotta) |
| `accent-muted` | `#F3E8E5` | Accent backgrounds |
| `sage` | `#5C6B5A` | Tags, secondary accents |
| `charcoal` | `#2C2C2C` | Dark UI moments (camera overlay only) |

**Never use:** purple/pink/gold gradients, neon glow, `game-gradient`, rainbow text.

## Typography

- **Display:** Georgia (iOS) / serif — headings, artwork titles, brand wordmark
- **UI/body:** System font — labels, buttons, descriptions, nav
- Use `expo-font` + custom fonts (Playfair, DM Sans) when polishing for production

- Headings: `fontFamily: fonts.display`, normal or medium weight
- Labels: `fontSize: 11, letterSpacing: 2, color: stone, textTransform: 'uppercase'`
- Body: `fontSize: 14, lineHeight: 21, color: stone`

## Platform

Museo is an **Expo / React Native** app. Use `StyleSheet` and `constants/theme.ts` — not Tailwind or web CSS.

## Spacing & shape

- Generous whitespace; cards breathe
- Border radius: `rounded-lg` (8px) for cards, `rounded-full` only for pills/avatars
- Avoid `rounded-2xl` everywhere — use sparingly

## Shadows & borders

Prefer borders over glow:

```css
.card-elevated {
  @apply bg-surface border border-mist shadow-sm;
}
```

No `box-shadow` with colored glow. Camera overlay may use minimal white/charcoal only.

## Components

### Buttons
- Primary: solid `bg-accent text-white`, no gradient
- Secondary: `border border-mist bg-surface text-ink`
- Disabled/saved: `bg-sage/10 text-sage`

### Cards
- White surface, 1px `mist` border, soft shadow
- Artwork image full-bleed top; metadata below with serif title

### Navigation
- White bar, top border or bottom border in `mist`
- Active tab: `text-accent` + thin underline — not gold glow

### Scan overlay
- Thin white corner brackets on dark camera feed
- Scan line: subtle white opacity, not pink
- Status text: white on charcoal pill, understated

### Gamification
- Reframe "Lv. 5" → "Level 5" in serif
- XP bar: `accent` fill on `mist` track — no gradient
- Badges: muted icons, earned = `accent-muted` bg + `accent` ring

## Copy tone

- "Discover" not "Scan"
- "Collection" not "My Pokédex"
- "Identifying…" not flashy AR language

## Checklist before shipping UI

- [ ] No gradient buttons or text
- [ ] No purple/pink/gold tokens
- [ ] Headings use Playfair
- [ ] Background is warm off-white (except camera view)
- [ ] Cards use border + shadow-sm, not glow
- [ ] Accent color used sparingly (CTAs, active nav only)
