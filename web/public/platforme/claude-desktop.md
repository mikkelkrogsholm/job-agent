---
id: claude-desktop
title: Claude Desktop og Cowork til job
description: Vælg sikkert mellem Claude Desktops lokale MCP og Coworks remote connector. Brug filer og planlagte opgaver uden at blande lokal og cloud-adgang sammen.
summary: Vælg først lokal eller cloud, og test derefter præcis den adgang du vil bruge.
stage: platform-setup
audience: jobseeker
lastVerified: 2026-09-02
sourceLinks: [https://support.anthropic.com/en/articles/11725091-when-to-use-desktop-and-web-connectors, https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork, https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp]
optionalCapabilities: [mcp, remote_connector, local_mcp, local_files_read, scheduler, cloud_tasks]
humanConfirmations: [choose_execution_mode, connect_mcp, share_folder, create_schedule, approve_search_criteria, submit_application]
related: [platforme, claude-web, claude-code, forloeb]
previous: claude-web
next: claude-code
---

# Claude Desktop og Cowork til job

Denne vej passer, når du vil arbejde med mapper eller gentagne jobsøgninger. Det afgørende valg er, om opgaven skal køre lokalt på din computer eller i skyen.

## Det skal du have klar

- Claude Desktop eller Cowork og en plan, der viser den ønskede funktion.
- En enkel mappe med `profil.md`, `cv.md` og `shortlist.csv`, hvis du vil bruge lokale filer.
- Godkendte søgekriterier og en beslutning om lokal eller cloud-kørsel.

## Hvad der er kendt

- **Verificeret:** remote connectors kan bruges via Claude-kontoen; lokal MCP i Desktop er en særskilt mekanisme.
- **Verificeret:** Cowork scheduled tasks findes på betalte planer.
- **Betinget:** Team-, plan- og permissionregler kan begrænse connectors, filer og opgaver.
- **Betinget:** cloud-opgaver kan køre, når computeren er slukket, men har ikke automatisk adgang til en lokal mappe; lokale opgaver kræver lokal kørsel.
- **Ikke verificeret:** en connector eller mappe, der virker i én mode, virker ikke dermed i en anden.

## Sæt det op trin for trin

1. Vælg **lokal**, hvis opgaven skal læse en mappe på din computer; vælg **cloud**, hvis den skal kunne køre uden din computer.
2. Giv kun adgang til en afgrænset jobsøgningsmappe, ikke hele disken.
3. For en remote connector bruger du `https://job-agent.dk/mcp`. For en lokal MCP følger du Claude Desktops lokale MCP-vej; bland ikke de to opsætninger sammen.
4. Opret først en planlagt opgave, når du har godkendt søgekriterier, hyppighed og beskedregel.

## Capability-check

Bed Claude oplyse separat: “Kører du lokalt eller i cloud? Kan du bruge Jobagenten her? Kan du læse denne mappe? Kan en planlagt opgave bruge samme adgang?” Markér ukendte svar som ikke verificeret.

## Ufarlig read-only test

Søg én gang efter “socialrådgiver Odense”. Kontrollér at resultatet viser kilde-URL'er. Hvis du valgte lokal mode, bed derefter om at læse kun `profil.md` og sammenfatte den uden at ændre filen.

## Manuel fallback uden MCP

Opbevar profil og shortlist som almindelige filer, søg manuelt på jobportaler, og indsæt nye fund i `shortlist.csv` selv. Brug Claude til at sammenligne tekst, ikke til at udføre eksterne handlinger.

## Kopiér til Claude

> Fortæl først, om denne opgave kører lokalt eller i cloud, om Jobagenten er forbundet her, og hvilke valgte filer du kan læse. Hvis MCP virker, søg read-only efter “socialrådgiver Odense” og vis originale URL'er. Hvis noget mangler, giv en manuel søgevej. Ændr ingen filer, opret ingen planlagt opgave og kontakt ingen uden min særskilte bekræftelse.

## Når opsætningen virker

Du er færdig, når mode, connector og filadgang er entydige, og en read-only søgning eller manuel fallback giver et kontrollerbart resultat.

## Det tjekker du selv

- Er lokal og cloud-adgang tydeligt adskilt?
- Er kun den valgte jobsøgningsmappe delt?
- Har søgeresultatet originale kilde-URL'er?

## Næste skridt

Prøv [find aktuelle job](/forloeb/find-job/) eller byg en [overvågningsrutine](/forloeb/hold-oeje/).

## Begrænsninger og sendekant

En scheduler er ikke en tilladelse til at sende noget. Planlagte opgaver skal kun rapportere nye relevante fund eller fejl. Du godkender delte mapper, opgaver og materiale; du overtager før login, kontakt og afsendelse.

## Til AI-assistenten

Undlad at overføre lokal adgang til cloud eller omvendt. Bekræft mode, filer og connector før hver arbejdsgang. Brug read-only søgning, beskyt persondata og stop med en tjekliste før enhver ekstern kontakt.

## Officielle kilder

Senest kontrolleret: 2026-09-02. [Desktop- og web-connectors](https://support.anthropic.com/en/articles/11725091-when-to-use-desktop-and-web-connectors), [Cowork scheduled tasks](https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork) og [remote MCP](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).
