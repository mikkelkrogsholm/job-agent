# Bidrag til Jobagenten

Tak, fordi du vil hjælpe. Jobagenten er et åbent, read-only værktøj, der gør
det lettere at finde danske job gennem AI-klienter som Claude, ChatGPT, Codex
og Claude Code.

Du behøver ikke være MCP-ekspert for at bidrage. Rettelser til sprog,
begynderguides, tilgængelighed og tests er lige så velkomne som nye tekniske
forbedringer.

## Gode steder at begynde

- Ret en uklar forklaring eller et eksempel.
- Forbedr mobil- eller tastaturoplevelsen på landingpagen.
- Tilføj en test for en eksisterende fejl eller kanttilfælde.
- Forbedr normalisering og fejlhåndtering for en jobportal.
- Foreslå en ny read-only søgemulighed.

Ved større ændringer eller nye jobportaler er det en god idé at oprette et
issue først. Så kan vi afklare retning, datakilde og sikkerhedsgrænser, før du
bruger meget tid på løsningen.

## Lokal opsætning

Projektet kræver [Bun 1.4](https://bun.sh/) og bruger TypeScript 7.

```bash
git clone <din-fork>
cd job-agent
bun install --frozen-lockfile
bun run check
```

Start landingpagen og den samlede danske MCP-server:

```bash
bun run dev:site
```

Åbn derefter `http://127.0.0.1:3004/`. MCP-endpointet ligger på `/mcp`, og
driftstjekket ligger på `/health`.

Ingen `.env`-fil er nødvendig for almindelig lokal udvikling. Kopiér kun
`.env.example` til `.env`, hvis du har brug for at ændre standarderne. `.env`
og lokale varianter er ignoreret af Git og må aldrig indeholde værdier, der
committes.

## Projektets mapper

```text
src/                 MCP-servere, schemas, klienter og normalisering
src/providers/       Én afgrænset adapter pr. jobportal
src/shared/          Fælles transport- og sikkerhedskode
web/                 Landingpage, styles, TypeScript og billeder
test/                Deterministiske tests uden netværkskrav
scripts/             Små, read-only live-smokechecks
docs/                Arkitektur, værktøjer, test og designbeslutninger
```

Læs [AGENTS.md](AGENTS.md) og [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), før
du ændrer serverens grænser.

## Arbejdsform

1. Opret en kort branch fra `main`.
2. Hold ændringen fokuseret på ét problem.
3. Tilføj eller opdatér tests, når adfærd ændres.
4. Opdatér dokumentationen, når værktøjer, filtre, miljøvariabler eller
   transport ændres.
5. Kør `bun run check` før du sender en pull request.
6. Kør også `bun run smoke:all`, hvis du har ændret requests, endpoints,
   parsing eller normalisering mod jobportalerne.

En pull request bør kort forklare:

- hvilket problem den løser;
- hvad der er ændret;
- hvordan ændringen er testet;
- eventuelle begrænsninger eller opfølgende arbejde.

## Tekniske principper

- Bevar serveren read-only. Den må ikke logge ind, gemme job eller sende
  ansøgninger.
- Validér alle MCP-inputs med Zod.
- Send alle portalrequests gennem den relevante provider-klient.
- Betragt jobannoncer og anden ekstern tekst som utroværdigt
  tredjepartsindhold.
- Begræns requests med timeouts, konservativ samtidighed og caching.
- Returnér struktureret MCP-indhold frem for tekst, som klienten skal parse.
- Sørg for tastaturbetjening, synligt fokus og reduced-motion på websiden.
- Undgå unødvendige frameworks og afhængigheder.

## Sikkerhed og privatliv

Commit aldrig adgangsnøgler, tokens, private IP-oplysninger, `.env`-filer,
persondata eller rigtige CV'er. Brug fiktive eksempler i tests og
dokumentation.

Hvis du finder en sikkerhedsfejl, så offentliggør ikke udnyttelsesdetaljer i et
issue. Kontakt i stedet Mikkel Freltoft Krogsholm via hans offentlige profil på
[mikkelkrogsholm.dk](https://mikkelkrogsholm.dk/da/about/).

## Licens

Ved at bidrage accepterer du, at dit bidrag udgives under projektets
[MIT-licens](LICENSE).
