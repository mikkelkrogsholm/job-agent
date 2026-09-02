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
- sitemap genereret og valideret fra sideregistret
- øvrige maskinlæsbare discovery-filer til stede og JSON-filer syntaktisk
  gyldige; semantisk sync er endnu ikke håndhævet

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

## Kommende guideunivers

Produktretningen for forløbs-, platform- og AI-læsbare guides er beskrevet i
[JOBSOEGERREJSEN.md](JOBSOEGERREJSEN.md). Alle nye HTML-sider i den plan skal
følge kontrakten ovenfor og registreres enkeltvis.

Det kanoniske sideinventar og byggerækkefølgen findes i
[PUBLIC_GUIDE_SITE_PLAN.md](PUBLIC_GUIDE_SITE_PLAN.md).

Den foreslåede udvidelse til Markdown-ledsagere, capability-check og genereret
discovery er specificeret i
[AGENT_READABLE_GUIDES.md](AGENT_READABLE_GUIDES.md).

Kontrakten håndhæver endnu ikke en én-til-én-relation mellem HTML-guides og
Markdown-versioner, genererer ikke `llms.txt` og kræver fortsat direkte
navigation fra hver side til alle øvrige offentlige sider. De begrænsninger
skal løses i registret og testsuiten, før guideuniverset bliver stort. Indtil da
skal `llms.txt` opdateres manuelt, og hver ny side skal indeholde en overskuelig
komplet navigation, så de eksisterende tests fortsat afspejler den faktiske
kontrakt.
