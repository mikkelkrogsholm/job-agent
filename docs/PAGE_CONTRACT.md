# Sidekontrakt for Jobagenten

Alle offentlige HTML-sider skal være registreret i `web/pages.ts`. Registret er den fælles sandhedskilde for URL, kildefil, titel, beskrivelse, Open Graph-data og sitemap.

## Krav til alle sider

`bun run check` fejler, hvis en offentlig side ikke lever op til kontrakten:

- dansk sprog, viewport-meta, favicon og præcis én synlig `h1` samt ét synligt `main`
- unik titel og metabeskrivelse med aftalte længder
- canonical URL, Open Graph-data og Twitter-kort
- fungerende primær navigation samt grupperede relaterede og forrige/næste-links på guides
- gyldige interne links og eksisterende mål for hash-links
- `noopener` på links, der åbner en ny fane
- ingen vandret overflow eller browserfejl ved 390, 768, 1024 og 1440 px
- fungerende platform-faner og understøttelse af reduceret bevægelse på forsiden
- sitemap genereret og valideret fra sideregistret
- øvrige maskinlæsbare discovery-filer til stede og JSON-filer syntaktisk
  gyldige; semantisk sync er endnu ikke håndhævet

## Sådan tilføjes en almindelig side

1. Opret sidens `index.html` under `web/public/<sti>/`.
2. Tilføj siden til `PUBLIC_PAGES` i `web/pages.ts`.
3. Tilføj navigation mellem den nye side og alle eksisterende sider.
4. Kør `bun run pages:sync` for at regenerere `sitemap.xml`.
5. Kør `bun run check` og ret alle kontraktbrud.

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
