# Sidekontrakt for Jobagenten

Alle offentlige HTML-sider skal være registreret i `web/pages.ts`. Registret er den fælles sandhedskilde for URL, kildefil, titel, beskrivelse, Open Graph-data og sitemap.

## Krav til alle sider

`bun run check` fejler, hvis en offentlig side ikke lever op til kontrakten:

- dansk sprog, viewport-meta, favicon og præcis én synlig `h1` samt ét synligt `main`
- unik titel og metabeskrivelse med aftalte længder
- canonical URL, Open Graph-data og Twitter-kort
- præcis én fælles `SiteHeader` og `SiteFooter`, skip-link, shell-CSS og shell-JavaScript
- nøjagtig samme primære navigation, CTA, footerlinks og linkrækkefølge som forsiden
- korrekt `aria-current="page"` i primær navigation samt grupperede relaterede og forrige/næste-links på guides
- gyldige interne links og eksisterende mål for hash-links
- `noopener` på links, der åbner en ny fane
- ingen vandret overflow eller browserfejl ved 390, 768, 1024 og 1440 px
- synlig header og footer i Chromium ved alle fire skærmstørrelser
- fungerende platform-faner og understøttelse af reduceret bevægelse på alle sidefamilier
- sitemap genereret og valideret fra sideregistret
- øvrige maskinlæsbare discovery-filer til stede og JSON-filer syntaktisk
  gyldige; semantisk sync er endnu ikke håndhævet

## Sådan tilføjes en almindelig side

1. Tilføj indhold og metadata til en eksisterende sidefamilies centrale register. Redaktionelle sider ligger i `web/content/editorial-pages.ts`; guides ligger under `web/content/guides/`.
2. Genbrug sidefamiliens renderer. Nye sidefamilier skal komponere `renderSiteHeader()` og `renderSiteFooter()` fra `web/render/site-shell.ts`; kopier aldrig deres HTML ind i en side.
3. Registrér siden i `PUBLIC_PAGES` via familiens register eller generator.
4. Tilføj kun global navigation i `web/site-config.ts`, når destinationen findes og skal være tilgængelig på alle sider.
5. Kør `bun run pages:sync` for at generere HTML og regenerere `sitemap.xml`.
6. Kør `bun run check` og ret alle kontraktbrud.

Komponenternes ansvar, anatomi, varianter, tilstande og kinetiske regler er kanonisk defineret i [DESIGN.md](../DESIGN.md). Delte shell-styles ligger i `web/public/site-shell.css`; den progressive, finite reveal-adfærd ligger i `web/public/site-shell.js` og skal altid have en umiddelbar reduced-motion-fallback.

Chromium til browserkontrollen installeres én gang med:

```sh
bunx playwright install chromium
```

De hurtige HTML-kontrakttests ligger i `test/page-contract.test.ts`. Den rigtige browserkontrol ligger i `scripts/check-responsive.ts`. Skærmstørrelserne ejes centralt af `RESPONSIVE_VIEWPORTS` i `web/pages.ts`.

## Sådan tilføjes en guide

1. Opret `web/content/guides/<gruppe>/<slug>/index.md` med det validerede
   frontmatter fra `web/content/schema.ts`.
2. Brug `route` og `markdownRoute`, når den offentlige URL ikke skal følge
   kildemappen. Relationer skal bruge et registreret guide-id eller en kendt
   offentlig route.
3. Skriv én `h1`, en selvbærende prompt, forventet output/færdigkriterium,
   brugerens tjekliste, næste skridt og AI-assistentens sikkerhedsgrænse.
4. Kør `bun run pages:sync`. Generatoren opdaterer HTML, Markdown-ledsager,
   sideregister, sitemap, `llms.txt`, API-katalog og browserens WebMCP-modul.
5. Kør `bun run check`.

## Guideunivers

Produktretningen for forløbs-, platform- og AI-læsbare guides er beskrevet i
[JOBSOEGERREJSEN.md](JOBSOEGERREJSEN.md). Alle nye HTML-sider i den plan skal
følge kontrakten ovenfor og registreres enkeltvis.

Det kanoniske sideinventar og byggerækkefølgen findes i
[PUBLIC_GUIDE_SITE_PLAN.md](PUBLIC_GUIDE_SITE_PLAN.md).

Markdown-ledsagere, capability-check og genereret discovery er specificeret i
[AGENT_READABLE_GUIDES.md](AGENT_READABLE_GUIDES.md).

Kontrakten håndhæver nu én-til-én-relationen mellem guidekilde, HTML og
Markdown, genererer discovery-filer og bruger grupperet navigation, så hver
guide ikke behøver at linke direkte til alle øvrige sider.
