---
name: Jobagenten
description: "Warm editorial clarity with restrained kinetic utility for Danish job-search guidance."
colors:
  primary: "#17211c"
  secondary: "#69716b"
  accent: "#2855e8"
  accent-deep: "#173cb5"
  accent-pale: "#dbe4ff"
  neutral: "#f3efe5"
  neutral-deep: "#e9e2d5"
  white: "#fffefb"
  agent-surface: "#f0ede5"
  line: "rgba(27, 38, 31, 0.16)"
  coral: "#ed795e"
  yellow: "#edc74f"
  green: "#4e9e72"
typography:
  hero:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "7rem"
    fontWeight: 430
    lineHeight: 0.87
    letterSpacing: "-0.064em"
  section-heading:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "5.9rem"
    fontWeight: 430
    lineHeight: 0.93
    letterSpacing: "-0.055em"
  guide-heading:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "3.6rem"
    fontWeight: 430
    lineHeight: 0.98
    letterSpacing: "-0.055em"
  body-md:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.65
  lede:
    fontFamily: "Newsreader Variable, Georgia, serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "-0.015em"
  label-caps:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.16em"
  button:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 750
    lineHeight: 1.2
  metadata:
    fontFamily: "Manrope Variable, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 750
    lineHeight: 1.5
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  page-inline: "92px"
  page-inline-mobile: "20px"
  content-max: "1360px"
  hero-max: "1480px"
  reading-max: "750px"
rounded:
  small: "12px"
  medium: "18px"
  card: "24px"
  portrait: "30px"
  pill: "999px"
components:
  page:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
  header:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    height: "72px"
    padding: "10px 24px"
  footer:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    padding: "42px 92px"
  primary-button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    height: "61px"
    padding: "6px 7px 6px 25px"
  primary-button-hover:
    backgroundColor: "{colors.accent-deep}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.primary}"
    rounded: "{rounded.card}"
    padding: "24px"
  guide-intro:
    textColor: "{colors.secondary}"
    typography: "{typography.lede}"
  safety-card:
    backgroundColor: "{colors.accent-pale}"
    textColor: "{colors.primary}"
    rounded: "{rounded.medium}"
    padding: "20px"
  endpoint-card:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.card}"
    padding: "22px 22px 22px 27px"
  agent-message:
    backgroundColor: "{colors.agent-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.medium}"
    padding: "16px"
  eyebrow:
    textColor: "{colors.accent}"
    typography: "{typography.label-caps}"
  metadata:
    textColor: "{colors.secondary}"
    typography: "{typography.metadata}"
  divider:
    backgroundColor: "{colors.line}"
    height: "1px"
  table-header:
    backgroundColor: "{colors.neutral-deep}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
  example-coral:
    backgroundColor: "{colors.coral}"
    rounded: "{rounded.small}"
  example-yellow:
    backgroundColor: "{colors.yellow}"
    rounded: "{rounded.small}"
  status-success:
    backgroundColor: "{colors.green}"
    rounded: "{rounded.pill}"
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

### Production model

Components are build-time HTML renderers with shared CSS and progressively enhanced JavaScript. They do not require hydration or a client-side framework. `web/render/site-shell.ts` owns the global shell; page-family renderers compose it rather than copying its markup. `web/public/site-shell.css` owns shell layout and shell states, while `web/public/site-shell.js` owns optional one-shot reveals. Navigation labels and destinations have one source of truth in `web/site-config.ts`.

Every public page must compose exactly one `SiteHeader`, one `main`, and one `SiteFooter`, include the skip link, and load the shared shell CSS and JavaScript. A new page family should add a renderer or reuse an existing one; it must not paste a private variation of the header or footer. The page contract verifies this structure, exact link order, active navigation, responsive visibility, and reduced-motion behavior.

### Canonical component inventory

| Component | Responsibility and anatomy | Variants and states | Kinetic behavior | Implementation |
| --- | --- | --- | --- | --- |
| `SiteHeader` | Global landmark containing `Wordmark`, `PrimaryNavigation`, a mobile `NavigationToggle`, and the single “Start dit forløb” CTA. | Current section uses `aria-current="page"`; below 960px the toggle opens the same navigation links in a compact panel. Escape and outside click close it, and focus returns to the toggle. | One entrance from `-14px`; the mobile icon changes from two lines to a close symbol; wordmark and CTA keep their existing responses. | `web/render/site-shell.ts`, `web/public/site-shell.css`, `web/public/site-shell.js` |
| `NavigationToggle` | Labelled button controlling `PrimaryNavigation` through `aria-controls` and `aria-expanded`. | Hidden above 960px. Below 960px it exposes every primary link without replacing the persistent journey CTA. | Two lines cross once when opened; reduced motion removes the transition. | `web/render/site-shell.ts`, `web/public/site-shell.css`, `web/public/site-shell.js` |
| `SiteFooter` | Global landmark with wordmark, independence/read-only statement, and the canonical support links in fixed order. | Two columns below 960px and one column below 700px. No page-specific footer links. | One entrance from `18px`; links use a still underline/color state. | `web/render/site-shell.ts`, `web/public/site-shell.css` |
| `Wordmark` | Blue circular mark plus “Jobagenten”; always links home and has a descriptive label in the header. | Light-header and reversed dark-footer color treatments. | Finite rotation/scale on hover or keyboard focus, then returns to rest. | `web/render/site-shell.ts`, `web/public/site-shell.css` |
| `PageIntro` | Eyebrow, one `h1`, and optional summary/metadata at the start of a guide or editorial page. | Guide intro, journey intro, platform intro, and quiet editorial intro share typography but may differ in measure. | Optional one-shot entrance; never loops and never delays reading under reduced motion. | `web/render/guide.ts`, `web/render/editorial.ts` |
| `Breadcrumbs` | Shows the user’s location and links to the parent collection. | Current page is text, ancestors are links; omitted on the homepage. | No component motion. | `web/render/guide.ts` |
| `GuideLayout` | Reading column plus supporting asides; contains intro, authored content, sources, machine-readable link, and journey navigation. | Collapses to one column at 960px. Asides become part of the reading flow. | Section reveals may run once as content enters; content remains present without JavaScript. | `web/render/guide.ts`, `web/public/guide.css`, `web/public/guide.js` |
| `SafetyPanel` | Persistent “Du har kontrollen” boundary: read-only service, no invented user facts, untrusted advertisements, and human send confirmation. | Same four rules across every guide; may be supplemented but not weakened. | No hover animation; any entrance is one-shot. | `web/site-config.ts`, `web/render/guide.ts` |
| `RelatedLinks` | Small list of registered, contextually adjacent guides. | Hidden when no related pages exist; never filled with dead or unregistered links. | Link underline only. | `web/render/guide.ts` |
| `StepNavigation` | Previous/next journey actions that keep a sequential job-search flow legible. | Previous, next, or both according to the page registry. Labels communicate direction in text, not arrow alone. | Optional 1px hover lift only; still on touch and reduced motion. | `web/render/guide.ts` |
| `PromptCard` | Copy-ready prompt text, assembled safety context, explicit copy button, and live feedback. | Default, copied, and clipboard-fallback states. Feedback uses `aria-live`; fallback selects the full prompt. | Button response only; prompt text itself never moves. | `web/public/guide.js`, prompt guide content |
| `AgentHandoff` | Homepage bridge from a plain-language promise to the site’s agent-readable package: canonical site URL, copy-ready opening message, platform caveat, and four-step capability map. | Browser-aware WebMCP path for Codex/ChatGPT plus an explicit remote-MCP alternative for Claude Desktop. Never implies that every browser supports WebMCP. | One scroll entrance and restrained hover/press responses. The capability map is static after entrance and collapses to a linear list on mobile. | `web/index.html`, `web/styles.css`, `web/main.ts` |
| `SourceMeta` | Verification date and links to official sources, followed by the page’s Markdown representation. | Source list or verification date only. External links use `noopener noreferrer`. | No motion. | `web/render/guide.ts` |
| `EditorialPage` | Quiet long-form template for about, privacy, and contact: `PageIntro`, reading column, and global shell. | Content and metadata come from the central editorial registry. | Intro and footer may reveal once; legal/privacy body text remains still. | `web/content/editorial-pages.ts`, `web/render/editorial.ts`, `web/public/legal.css` |
| `Reveal` | Progressive enhancement primitive selected with `data-shell-reveal` or `data-component-reveal`. It cannot contain meaning available only after animation. | Header enters upward; ordinary components enter downward. Without JavaScript, content is visible. | `opacity` and `transform` only, 600ms, observed once and immediately unobserved. Reduced motion reveals immediately. | `web/public/site-shell.js`, `web/public/site-shell.css` |

Homepage-only compositions—`JobCardConstellation`, `ConversationDemo`, `PlatformCard`, `SetupTabs`, `TrustList`, and the founder panel—may retain their bespoke storytelling behavior. Promote one into the canonical inventory only when a second page needs the same semantics and states; visual resemblance alone is not enough.

### Composition rules

- Guides compose `SiteHeader → Breadcrumbs → GuideLayout(PageIntro + authored content + SourceMeta + StepNavigation, SafetyPanel + RelatedLinks) → SiteFooter`.
- Editorial pages compose `SiteHeader → EditorialPage(PageIntro + authored content) → SiteFooter`.
- The homepage composes its bespoke sections inside the same `SiteHeader` and `SiteFooter` contract.
- Component motion is optional enhancement, never state, navigation, validation, or meaning. Use a single finite response to entrance, hover, focus, press, or disclosure; do not add autonomous loops.
- Extend an existing component when semantics and interaction are the same. Create a new component when responsibility or accessibility behavior changes. Do not add variants merely to accommodate one page’s spacing.

**Header and navigation.** Use the translucent white pill header, wordmark mark, text links, and dark header CTA. Below 960px, preserve every primary link behind the labelled menu toggle; never hide navigation without an accessible replacement. Link underlines animate from the right and expose on hover and keyboard focus. Preserve the skip link; it begins offscreen and becomes visible on focus.

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
