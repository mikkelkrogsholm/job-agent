# Sidekontrakt for Jobagenten

Alle offentlige HTML-sider skal være registreret i `web/pages.ts`. Registret er den fælles sandhedskilde for URL, kildefil, titel, beskrivelse, Open Graph-data og sitemap.

## Krav til alle sider

`bun run check` fejler, hvis en offentlig side ikke lever op til kontrakten:

- dansk sprog, viewport-meta, favicon og præcis én synlig `h1` samt ét synligt `main`
- unik titel og metabeskrivelse med aftalte længder
- canonical URL, Open Graph-data og Twitter-kort
- navigation til alle øvrige offentlige sider
- gyldige interne links og eksisterende mål for hash-links
- `noopener` på links, der åbner en ny fane
- ingen vandret overflow eller browserfejl ved 390, 768, 1024 og 1440 px
- fungerende platform-faner og understøttelse af reduceret bevægelse på forsiden
- sitemap og maskinlæsbare discovery-filer i sync

## Sådan tilføjes en side

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
