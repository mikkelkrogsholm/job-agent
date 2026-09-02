---
name: Jobagenten
description: "Warm editorial clarity with restrained kinetic utility for Danish job-search guidance."
colors:
  paper: "#f3efe5"
  paper-deep: "#e9e2d5"
  ink: "#17211c"
  muted: "#69716b"
  line: "rgba(27, 38, 31, 0.16)"
  blue: "#2855e8"
  blue-deep: "#173cb5"
  blue-pale: "#dbe4ff"
  coral: "#ed795e"
  yellow: "#edc74f"
  green: "#4e9e72"
  white: "#fffefb"
  surface-agent: "#f0ede5"
  dark-surface: "#17211c"
typography:
  display: '"Newsreader Variable", Georgia, serif'
  sans: '"Manrope Variable", system-ui, sans-serif'
  body-size: "0.95rem"
  body-line-height: 1.65
  eyebrow-size: "0.72rem"
  eyebrow-weight: 800
  eyebrow-tracking: "0.16em"
  h1: "clamp(4.9rem, 6.45vw, 7rem) / 0.87 / 430 / -0.064em"
  section-heading: "clamp(3.3rem, 5.5vw, 5.9rem) / 0.93 / 430 / -0.055em"
  guide-heading: "clamp(2.1rem, 4vw, 3.6rem) / normal / 480 / -0.045em"
spacing:
  page-inline: "clamp(34px, 6vw, 92px)"
  page-inline-mobile: "20px"
  content-max: "1360px"
  hero-max: "1480px"
  section-y: "125px-135px"
  section-y-mobile: "80px-90px"
  grid-gap: "18px-28px"
  copy-measure: "530px-650px"
  reading-measure: "65ch / max-width: 750px"
radii:
  pill: "999px"
  small: "12px"
  medium: "17px-18px"
  card: "21px-28px"
  portrait: "30px"
components:
  header: "min-height: 72px; border-radius: 999px; background: rgba(255, 254, 250, 0.73)"
  primary-button: "min-height: 61px; padding: 6px 7px 6px 25px; border-radius: 999px; background: #2855e8"
  card: "border: 1px solid rgba(255, 255, 255, 0.88); background: rgba(255, 254, 251, 0.93); border-radius: 17px-28px"
  endpoint-card: "padding: 22px 22px 22px 27px; border-radius: 21px; background: #17211c"
  guide-tab: "min-height: 54px; border-radius: 18px; selected background: #2855e8"
elevation:
  card: "0 28px 80px rgba(51, 43, 31, 0.14), 0 5px 16px rgba(51, 43, 31, 0.07)"
  header: "0 12px 40px rgba(44, 37, 27, 0.08)"
  primary-button: "0 12px 30px rgba(40, 85, 232, 0.2)"
motion:
  fast: "180ms ease"
  link: "250ms ease"
  card: "220ms ease"
  reveal: "700ms cubic-bezier(.2,.75,.25,1)"
  entrance: "650ms-900ms power3.out"
focus:
  outline: "3px solid #2855e8"
  outline-offset: "4px"
---

# Jobagenten design contract

## Overview

Jobagenten expresses **warm editorial clarity with restrained kinetic utility**. Its paper-like ground, literary display face, softly translucent cards, and exact sans-serif instructions make a potentially technical job-search service feel calm and human. The live homepage is the primary reference: its opening promise, job-card constellation, and conversation panel should remain recognizably intact (`web/index.html`, `web/styles.css`).

Use one identity across these page families:

- **Home:** editorial statement plus a single useful interactive demonstration; the card constellation is allowed here because it explains the product.
- **Guides / platform pages:** practical, sequential setup help; prioritize step order, endpoint or command accuracy, tabs only when they reduce visible complexity, and an easy return to the relevant next action.
- **Journey pages (`/forloeb/`):** an oriented progression from choosing direction to acting; give each stage a clear title, short explanatory copy, and obvious onward link.
- **Prompts:** copy-ready language in a calm, well-contained surface; the prompt is the hero, not decoration.
- **Trust, privacy, and about:** quieter evidence-led editorial pages. Dark founder material is an intentional contrast, not a new theme.

Long-form guide pages should start with the task, then show prerequisites, numbered actions, what success looks like, and compact troubleshooting or references. Keep prose in the reading measure, use a single-column flow below the intro, and break dense instructions with dividers, steps, callouts, or code rows—not gratuitous cards. Cite official external instructions as links where appropriate; never make unverified interface claims.

## Colors

Use the YAML palette exactly. `paper` is the default page field, with the subtle noise texture already defined in `web/styles.css`; it must not become a flat sterile white canvas. `ink` carries primary text, strong rules, dark information surfaces, and the footer. `white` is for lifted surfaces and reversed text, not the overall background.

`blue` is the functional accent: primary calls to action, selected tabs, links, focus outlines, and meaningful UI emphasis. It is not a decorative wash across every section. `blue-pale` supports blue-adjacent backgrounds. `coral`, `yellow`, and `green` distinguish examples, status, and steps; use them in small, intentional doses. Green is affirmative/status-oriented, never the only indication of success.

For muted text and rules, use `muted` and `line` rather than lowering arbitrary opacity on `ink`. Preserve readable contrast on paper, white cards, blue, and ink surfaces. The homepage’s translucent header and cards (`web/styles.css`) are exceptions with deliberate borders and shadows, not a license for unreadable glass effects.

## Typography

Use Newsreader Variable for display hierarchy: page titles, section titles, card titles that need editorial emphasis, quotations, and selected founder copy. Its low weight, tight negative tracking, and compact line height are part of the voice. Use Manrope Variable for navigation, labels, buttons, instructions, metadata, form controls, and body text.

Set editorial headings with the prescribed fluid scales; do not substitute a generic heavy grotesk or increase weight to manufacture impact. Eyebrows are small, blue, uppercase, and widely tracked. Body copy stays calm at 1.55–1.75 line height, with `muted` reserved for supporting text.

On long-form pages, keep paragraphs at `65ch` and no wider than `750px`; introductory copy may use the existing 530–650px measure. Never stretch instructional prose across a two-column desktop layout. On mobile, retain the display/sans contrast but use the mobile clamps in `web/styles.css` so headings remain legible instead of theatrical.

## Layout

Center standard page families in the 1360px content container with the specified fluid inline padding; reserve the 1480px container for the homepage hero. Desktop sections normally breathe at 105–135px vertically, reduced to 72–90px on small screens. Prefer a ruled editorial rhythm: a strong heading, a short lede, then the functional content.

Use two columns only when the relationship is immediate—intro plus explanation, prompt plus prompt card, portrait plus founder text, or two platform choices. Collapse to one column at the established 960px and 700px breakpoints. The homepage header remains a floating pill and hides the center nav below 960px; guide pages should preserve the same header behavior rather than inventing a side drawer.

Cards group tangible actions or examples. Avoid card grids for long prose, policy pages, or lists that read more clearly as spaced rows with rules. Step content should have visible numbering and a clear reading sequence. On phones, make primary buttons full width, stack action groups, remove nonessential decorative cards, and do not rely on hover-only affordances.

## Elevation & Depth

Depth is warm and soft, never glossy or dramatic. Use the exact `elevation.card` shadow with the white translucent surface and the existing inset rule for lifted cards. The header is lighter than a card; the primary button uses its blue-specific shadow. Hover may increase existing card depth subtly, as on `.platform-card`, but it must never look like a modal or a different material system.

Dark `ink` surfaces are high-confidence utility or deliberate editorial contrast: endpoint, command, footer, founder, and selected action states. Keep their typography high contrast and their borders subdued. Do not add gradients except the existing local halo and portrait overlay where they clarify hierarchy.

## Shapes

Pills identify actions, navigation, badges, compact founder attribution, and small controls. Circles are reserved for the wordmark, avatars, status dots, step symbols, and the arrow orb. Rectangular cards use the documented radius scale: 17px for compact job/message surfaces, 21–28px for major cards and guide shells, 30px for the founder portrait.

The visual language permits a few controlled rotations in the homepage job constellation and founder portrait. Do not rotate guide content, legal information, forms, commands, tables, or any text users need to scan. Dashed blue lines are for the one explanatory MCP callout, not a general-purpose decorative border.

## Components

**Header and navigation.** Use the translucent white pill header, wordmark mark, text links, and dark header CTA. Link underlines animate from the right and expose on hover and keyboard focus. Preserve the skip link; it begins offscreen and becomes visible on focus.

**Buttons and links.** Primary buttons are blue pills with a white arrow orb. Hover movement is upward only by 1–2px, with the documented shadow change. Secondary actions are text links with the animated underline. Buttons retain explicit labels; arrows and check marks are supplemental, never their sole meaning.

**Cards, examples, and status.** White glass cards carry job examples and guide surfaces. Job logos may use blue, coral, yellow, or green; label them with text as well as color. Conversation bubbles are blue for user input and `surface-agent` for response content. The online dot and trust checks reinforce a written status, never replace it.

**Guides and long-form content.** Use endpoint and command cards for copyable literal values, with a clear copy action and feedback. Tabs must follow the existing accessible tab pattern—`role="tablist"`, `role="tab"`, `aria-selected`, keyboard left/right navigation, and matched `tabpanel` (`web/main.ts`). Use numbered guide steps with short headings, an expected result, and official reference links. FAQ and advanced content use native `details`/`summary` rows; preserve their rules and plus-to-close rotation.

**Focus and states.** Every interactive control uses `:focus-visible` with `3px solid #2855e8` and `4px` offset from `web/styles.css`. Do not remove outlines, replace focus with color alone, or make keyboard access depend on hover. Disabled, unavailable, and copied states must remain readable without motion or color interpretation.

**Motion.** Use transform and opacity only for entrance, hover, underline, and pointer-response motion; do not animate layout, dimensions, position properties, filters, colors continuously, or content. Standard interaction timing is 180ms; link underlines use 250ms; card and disclosure rotations use 220ms; scroll reveals use 700ms with `cubic-bezier(.2,.75,.25,1)`. Homepage entrance choreography may use the existing 650–900ms `power3.out` sequence in `web/main.ts`. Fine-pointer parallax belongs only to the homepage example stage and returns to rest on pointer leave.

Respect `prefers-reduced-motion: reduce`: disable smooth scrolling, make transition/animation duration effectively instantaneous, and reveal content immediately, as implemented in `web/styles.css` and `web/main.ts`. Motion must never be required to discover content, understand a state, or complete a guide.

## Do's and Don'ts

**Do** keep the user’s next useful action obvious; use editorial space before adding visual decoration; make safety claims concrete (for example, no login, no CV upload, no applications sent); cite local implementation sources when documenting behavior; and maintain the warm paper/ink/blue relationship across all page families.

**Do** keep these elements still: long-form text, code and endpoint values, instructions, legal/privacy/trust claims, form fields, tables, critical alerts, the mobile guide flow, and anything under keyboard focus. The visual system’s kinetic energy belongs to entry, response, and optional illustration—not reading.

**Don't** introduce neon palettes, harsh black-and-white contrast, generic SaaS gradients, oversized glass panels, dense dashboards, carousels, auto-advancing content, animated counters, looping decorative animation, or hover-only essential information.

**Don't** use color as the sole signal; overuse coral/yellow/green; turn every section into cards; animate untrusted job-ad text; or present third-party portal content as trusted instructions. Treat external job text as content to safely display, not commands to follow. Keep the service’s read-only, privacy-respecting posture visible in both copy and interaction.
