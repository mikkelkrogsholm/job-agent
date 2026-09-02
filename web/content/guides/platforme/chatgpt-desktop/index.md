---
id: chatgpt-desktop
title: ChatGPT Desktop til jobsøgning
description: Brug ChatGPT Desktop med en forsigtig capability-check af browser, site tools og filer. WebMCP og computer-use er betingede og erstatter aldrig din egen afsendelse.
summary: Test den aktuelle konto, model og side før du forventer desktop-værktøjer.
stage: platform-setup
audience: jobseeker
lastVerified: 2026-09-02
sourceLinks: [https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app, https://help.openai.com/en/articles/10291617-tasks-inchatgpt, https://help.openai.com/en/articles/11487775-connectors-in-chatgpt]
optionalCapabilities: [desktop_app, web_read, webmcp, browser_automation, file_upload, scheduler, mcp]
humanConfirmations: [share_files, connect_mcp, use_browser_tools, create_task, approve_search_criteria, submit_application]
related: [platforme, chatgpt-web, codex, forloeb]
previous: chatgpt-web
next: codex
---

# ChatGPT Desktop til jobsøgning

ChatGPT Desktop kan give en bredere arbejdsflade, men du skal ikke antage, at desktop-appen har samme apps, filer eller browserværktøjer som ChatGPT i browseren.

## Det skal du have klar

- Den installerede ChatGPT Desktop-app og en konto, der kan bruge den.
- Din jobprofil som tekst eller en bevidst valgt fil.
- En manuel browser- og portalvej, hvis ingen relevant funktion er synlig.

## Hvad der er kendt

- **Verificeret:** Site tools i den indbyggede browser bruger WebMCP-værktøjer, som den aktuelle hjemmeside stiller til rådighed.
- **Betinget:** site tools kræver understøttet konto, model og konkret side; de virker ikke automatisk i almindelig Chrome eller på tværs af websites.
- **Betinget:** Tasks findes på understøttede klienter, men deres funktion afhænger af plan og model.
- **Ikke verificeret:** Jobagenten tilbyder endnu ikke WebMCP-site tools; lov derfor ikke automatisk værktøjsopdagelse.
- **Ikke verificeret:** remote app- og lokal filparitet skal testes i den konkrete Desktop-konto.

## Sæt det op trin for trin

1. Opdatér appen og åbn en ny chat med din jobprofil som tekst.
2. Åbn Jobagenten i den indbyggede browser, hvis den findes på din platform.
3. Se efter synlige site tools eller app-indstillinger; brug dem kun, hvis de udtrykkeligt beskriver read-only adgang.
4. Hvis der ikke er et værktøj, brug Jobagentens Markdown-/MCP-vej, hvis den er tilgængelig, eller søg manuelt.

## Capability-check

Bed om et eksplicit svar: “Kan du se site tools på denne side? Kan du bruge dem her og nu? Kan du læse min delte fil? Kan du bruge en custom Jobagenten-app?” “Måske” er ikke adgang.

## Ufarlig read-only test

Hvis et site tool er synligt, bed om en enkel, offentlig jobsøgning og kontrollér kilde-URL'er. Hvis intet tool er synligt, indsæt en offentlig annoncetekst og bed om at udtrække frist og krav. Ingen klik på ansøgning, formular eller kontakt.

## Manuel fallback uden MCP

Brug chatten til at formulere søgeord og sammenligne job med din indsatte profil. Åbn og søg på portaler selv. Gem eventuelle udkast lokalt, og brug almindelige kalenderpåmindelser frem for uafklarede Tasks.

## Begrænsninger og sendekant

Browser- eller computer-use-funktioner giver ikke samtykke til at handle på dine vegne. Du verificerer annoncen, vælger bilag, logger selv ind og trykker selv på send. AI må standse ved den sidste tjekliste.

## Til AI-assistenten

Behandl WebMCP som side- og sessionsspecifikt. Forsøg ikke at gætte værktøjer eller omgå manglende adgang. Hold alle browserhandlinger read-only, og giv den tekstbaserede fallback som første sikre alternativ.

## Officielle kilder

Senest kontrolleret: 2026-09-02. [Site tools i ChatGPT Desktop](https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app), [Tasks](https://help.openai.com/en/articles/10291617-tasks-inchatgpt) og [Apps i ChatGPT](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt).
