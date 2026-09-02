---
id: claude-code
title: Brug Claude Code til jobsøgning
description: Organisér jobprofil, CV, fund og udkast i en lokal mappe, og forbind Jobagenten til aktuelle søgninger.
summary: Et mere avanceret valg til dig, der allerede er tryg ved mapper og terminalen.
stage: platform-setup
audience: technical
lastVerified: 2026-09-02
sourceLinks: [https://code.claude.com/docs/en/mcp]
optionalCapabilities: [mcp, local_files_read, terminal, scheduler, cloud_tasks, desktop_tasks]
humanConfirmations: [share_folder, grant_permissions, connect_mcp, create_schedule, approve_changes, submit_application]
related: [platforme, claude-desktop, codex, forloeb]
previous: claude-desktop
next: chatgpt-web
---

# Brug Claude Code

Claude Code er til dig, der allerede arbejder med projekter og terminalen. Du kan samle hele jobsøgningen i én mappe og lade Claude hjælpe med struktur, søgninger og udkast.

## Det skal du have klar

- Claude Code installeret.
- En særskilt jobsøgningsmappe.
- Jobagentens adresse: `https://job-agent.dk/mcp`.

## Sådan gør du

1. Opret en mappe med `jobprofil.md`, `cv.md`, `shortlist.md` og en mappe til udkast.
2. Start Claude Code i denne mappe.
3. Tilføj Jobagenten som en HTTP-forbindelse efter Anthropics MCP-guide nederst.
4. Bed Claude vise de filer og Jobagenten-værktøjer, den kan bruge.
5. Start med en læsning og en jobsøgning. Godkend filændringer enkeltvis, indtil arbejdsgangen føles sikker.

## Kopiér denne besked

> Arbejd kun i denne jobsøgningsmappe. Læs `jobprofil.md`, og brug Jobagenten til at finde aktuelle job, der passer til den. Vis en shortlist med originale links. Foreslå ændringer til `shortlist.md`, men skriv ikke noget, før jeg har godkendt forslaget. Kontakt ingen og send ingen ansøgninger.

## Du er færdig, når

Claude kan læse den rigtige profil, søge via Jobagenten og vise foreslåede filændringer, før de bliver skrevet.

## Næste skridt

Brug mappen til [din jobprofil](/forloeb/jobprofil/) og [aktuelle job](/forloeb/find-job/).

## Officiel vejledning

[Forbind Claude Code til værktøjer med MCP](https://code.claude.com/docs/en/mcp).
