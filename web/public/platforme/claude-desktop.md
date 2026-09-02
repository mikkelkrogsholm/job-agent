---
id: claude-desktop
title: Brug Claude Desktop til jobsøgning
description: Brug Claude på din computer til jobprofil, CV, Jobagenten og en rolig plan for at finde nye job løbende.
summary: Saml jobsøgningen på din computer, og vælg selv hvilke filer Claude må bruge.
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

# Brug Claude Desktop

Claude Desktop er nyttig, hvis du vil samle CV, jobprofil og udkast i en mappe på din computer. Du vælger selv, hvilke filer Claude må se.

## Det skal du have klar

- Claude Desktop.
- En ny mappe kun til jobsøgning.
- Jobagentens adresse: `https://job-agent.dk/mcp`.

## Sådan kommer du i gang

1. Opret en mappe med fx `jobprofil.md`, `cv.md` og `ansoegninger`.
2. Giv kun Claude adgang til denne mappe — ikke hele computeren.
3. Tilføj Jobagenten under Claude-kontoens connectors på samme måde som i [browserguiden](/platforme/claude-web/).
4. Bed Claude læse jobprofilen og forklare den med fem korte punkter. Så ser du, om den bruger den rigtige fil.
5. Prøv derefter én jobsøgning, før du overvejer en planlagt søgning.

Hvis du laver en planlagt søgning, så bed kun om besked, når der er nye job eller en fejl. Læs opgaven igennem, før du godkender den.

## Kopiér denne besked

> Brug kun filerne i min jobsøgningsmappe. Læs min jobprofil, og find derefter fem aktuelle job med Jobagenten. Vis originale links. Hvis du ikke kan læse mappen eller bruge Jobagenten her, så sig præcis hvad der mangler. Du må ikke ændre filer eller oprette en planlagt opgave, før jeg har sagt ja.

## Du er færdig, når

Claude kan læse den valgte jobprofil og vise en søgning med originale links — uden at have adgang til flere filer end nødvendigt.

## Næste skridt

Fortsæt med [find aktuelle job](/forloeb/find-job/) eller [hold øje med nye job](/forloeb/hold-oeje/).
