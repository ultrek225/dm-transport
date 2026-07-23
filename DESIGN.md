# DM Transport — Design Direction

## Direction
Logistics & parcel management tool. Neutral, professional, utilitarian. Built for transporters and admins moving parcels through status stages.

## Tone
Industrial-utilitarian. Restrained, high-density, no decoration. Information over ornament. Confidence through clarity.

## Differentiation
Dual interface: public landing + transporter dashboard (own parcels only) vs admin console (full fleet, search/filter). Same visual language, different density.

## Color Palette
| Token | OKLCH | Use |
|---|---|---|
| background | 0.985 0.002 240 | app surface |
| foreground | 0.21 0.012 250 | primary text |
| card | 1 0 0 | elevated surfaces |
| primary | 0.21 0.012 250 | actions, key UI |
| accent | 0.55 0.07 235 | steel-blue highlights |
| muted | 0.96 0.004 240 | secondary text bg |
| border | 0.91 0.004 240 | hairlines |
| status-pending | 0.78 0.15 75 | amber — en attente |
| status-in-transit | 0.55 0.07 235 | steel-blue — en cours |
| status-delivered | 0.65 0.14 145 | green — livré |
| destructive | 0.58 0.18 25 | errors |

## Typography
| Role | Font | Use |
|---|---|---|
| Display | Space Grotesk | headings, brand, numbers |
| Body | DM Sans | UI text, forms, tables |
| Mono | Geist Mono | tracking IDs, codes, data |

## Elevation
Minimal. `subtle` (0 1px 2px / 0.05) for cards, `elevated` (0 4px 12px / 0.08) for popovers/menus. No drop shadows on flat surfaces.

## Structural Zones
| Zone | Content |
|---|---|
| Public | landing, actualité feed, login (Internet Identity) |
| Transporter | sidebar nav, mes colis table, parcel detail, status update |
| Admin | sidebar nav, all colis, search/filter, carrier validation, actualité editor |

## Spacing
Compact density. 4px base grid, 8px section gaps, 12px card padding. Tables tight, forms breathable.

## Component Patterns
- Data tables: dense rows, mono tracking IDs, sticky headers
- Status pills: rounded-full, status color bg, uppercase tracking-wide label
- Sidebar nav: dark surface, icon + label, active = accent left border
- Forms: labeled inputs, 0.375rem radius, ring on focus
- Cards: 1px border, subtle shadow, no rounded excess

## Motion
Subtle. `fade-in` 200ms on mount, `slide-up` 240ms on list transitions. No bounce, no parallax.

## Constraints
- Interface en français (labels, status: en attente / en cours / livré)
- Identité neutre — no branding, no logo lockup, no marketing voice
- Transporters see only their own parcels (confidentiality)
- Search/filter admin-only

## Signature Detail
Status color pills on parcel cards — amber/steel-blue/green chips that make parcel state readable at a glance, the single chromatic moment in an otherwise near-monochrome interface.
