---
id: claude-web
title: Brug Claude i browseren til jobsøgning
description: Forbind Jobagenten til Claude, prøv din første jobsøgning, og brug Claude til jobprofil, CV og ansøgning.
summary: Den enkle vej til at bruge Jobagenten direkte i en Claude-samtale.
stage: platform-setup
audience: jobseeker
lastVerified: 2026-09-02
sourceLinks: [https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp, https://support.anthropic.com/en/articles/9517075-what-are-projects, https://support.anthropic.com/en/articles/8241126-what-kinds-of-documents-can-i-upload-to-claude-ai]
optionalCapabilities: [remote_connector, mcp, file_upload, project_context, web_read]
humanConfirmations: [connect_mcp, share_files, approve_search_criteria, verify_sources, submit_application]
related: [platforme, claude-desktop, forloeb]
previous: platforme
next: claude-desktop
---

# Brug Claude i browseren

Claude kan hjælpe dig med at finde job, forstå annoncer og arbejde med dit CV. Når du forbinder Jobagenten, kan Claude også søge i aktuelle danske jobopslag direkte fra samtalen.

## Det skal du have klar

- En Claude-konto.
- Jobagentens adresse: `https://job-agent.dk/mcp`.
- En kort sætning om det job og det område, du søger i.

## Forbind Jobagenten

1. Åbn Claude og find **Settings** eller **Customize**.
2. Åbn området med **Connectors**.
3. Vælg at tilføje din egen connector.
4. Kald den **Jobagenten**, og indsæt `https://job-agent.dk/mcp`.
5. Åbn en ny samtale, og slå Jobagenten til, hvis Claude viser den som et valg.

Menunavne kan ændre sig. Hvis du ikke kan finde muligheden, så brug Anthropics officielle vejledning nederst på siden. Du kan stadig bruge Claude til CV og ansøgning uden forbindelsen.

## Prøv en enkel søgning

> Brug Jobagenten til at finde pædagogjob i Odense. Vis højst fem job med titel, arbejdssted, frist og link til den originale annonce. Hvis du ikke kan bruge Jobagenten i denne samtale, så sig det tydeligt og giv mig gode søgeord til en manuel søgning.

Åbn selv mindst ét link, og kontrollér at job og frist stadig er aktuelle.

## Du er færdig, når

Claude enten kan vise aktuelle job med originale links, eller du har fået en enkel søgning, du selv kan bruge på jobportalerne.

## Næste skridt

Lav din [jobprofil](/forloeb/jobprofil/), eller gå direkte til [find aktuelle job](/forloeb/find-job/).

## Officiel vejledning

[Sådan tilføjer du en custom connector i Claude](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp).
