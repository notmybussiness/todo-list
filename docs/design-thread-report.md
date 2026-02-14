# Design Thread Report (Glass Morphism / Monochrome Silver)

## Figma MCP Artifact
- FigJam design map: [Todo Glass Morphism Design Map](https://www.figma.com/online-whiteboard/create-diagram/10405a8f-29a8-4b60-8b1f-4b9e3bc44222?utm_source=other&utm_content=edit_in_figjam&oai_id=&request_id=1be741c4-55bf-40cb-80c5-b30d66d42a67)
- Note: current MCP permission scope did not allow `get_figjam` read-back for this generated board.

## Token Table (`:root` in `styles.css`)
| Category | Token | Value |
|---|---|---|
| Background | `--bg-0` | `#0d0f12` |
| Background | `--bg-1` | `#151920` |
| Background | `--bg-2` | `#1f2530` |
| Text | `--text-main` | `#f2f5fb` |
| Text | `--text-soft` | `#a4adbc` |
| Glass | `--glass` | `rgba(242, 246, 255, 0.1)` |
| Glass | `--glass-strong` | `rgba(242, 246, 255, 0.16)` |
| Stroke | `--stroke` | `rgba(242, 246, 255, 0.26)` |
| Stroke | `--stroke-soft` | `rgba(242, 246, 255, 0.18)` |
| Focus | `--focus` | `rgba(179, 194, 224, 0.8)` |
| Elevation | `--shadow-1` | `0 14px 30px rgba(7, 8, 12, 0.45)` |
| Elevation | `--shadow-2` | `0 24px 80px rgba(8, 11, 18, 0.66)` |
| Radius | `--radius-xl` | `26px` |
| Radius | `--radius-lg` | `16px` |
| Radius | `--radius-md` | `12px` |
| Blur | `--blur-md` | `22px` |
| Motion | `--easing-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` |

## Component States
- `App Shell`: gradient background + radial highlights
- `Glass Card`: translucent layer + blur + inner highlight stroke
- `Input`: default/focus with high-contrast focus ring
- `Primary Button`: subtle lift on hover, pressed reset
- `Filter Button`: default/hover/active (`.filter-btn.active`)
- `Todo Item`: default/completed (`.is-completed`) / edit input mode
- `Inline Error`: high-contrast danger text
- `Empty State`: dashed stroke glass panel

## Frame Targets
- Desktop: 1440 baseline layout (content container max-width 760)
- Mobile: 390 baseline behavior (stacked form, 2-row todo item)
