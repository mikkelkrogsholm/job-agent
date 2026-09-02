# Responsive visual QA

Reference: `landing-page-concept-v1.png` (1536 × 1024, SHA-256
`010dcc7ec5491a917d58c7f3ed750c9be85082132f91263cf332594a32db7852`).

Browser verification performed 2 September 2026 against the Bun development
server after the entrance animation had settled.

| Viewport | Layout mode | Horizontal overflow | Result |
| --- | --- | --- | --- |
| 1440 × 1000 | Editorial two-column hero | None | Matches the reference composition |
| 1024 × 900 | Compact two-column hero | None | Conversation card remains inside the clipped stage |
| 768 × 1024 | Dedicated tablet stack | None | Hero copy leads; animated job stream follows |
| 390 × 844 | Mobile stack | None | Cards flatten into a legible feed |
| 320 × 760 | Narrow mobile | None | Navigation, headline and primary CTA remain usable |

Interaction checks:

- Claude/ChatGPT guide tabs update `aria-selected`, panel visibility and URL anchors.
- Guide tabs support left/right arrow keys.
- Address and prompt copy controls provide visible success feedback.
- Direct platform-card links activate the matching guide before scrolling.
- `prefers-reduced-motion: reduce` removes transforms and keeps all revealed
  content at full opacity.
- The landing page, bundled assets and health endpoint return HTTP 200.

The in-app preview remains available at `http://127.0.0.1:3014/` during this
development session. Production is intentionally not deployed by this work.
