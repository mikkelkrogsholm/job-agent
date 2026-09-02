# Byggeplan for Jobagentens offentlige guideunivers

Status: Implementerbar side- og indholdsplan  
Senest opdateret: 2. september 2026

## Formål

Jobagentens side skal hjælpe en almindelig dansk jobsøgende fra den første
usikkerhed om retning til en ansøgning, som personen selv har gennemgået og er
klar til at sende.

Siden skal samtidig kunne læses af en AI-assistent. AI'en skal kunne:

1. forstå Jobagentens read-only grænse;
2. finde den relevante guide;
3. undersøge sine egne capabilities;
4. vælge en sikker arbejdsgang;
5. hjælpe brugeren uden at opfinde oplysninger eller sende noget.

Dette dokument er sideinventaret og byggeplanen. Produktprincipperne findes i
[JOBSOEGERREJSEN.md](JOBSOEGERREJSEN.md), mens research, platformfakta, prompts
og agentkontrakt findes i de tilknyttede researchdokumenter.

## Produktgrænse

Guideuniverset må gerne hjælpe med at:

- afklare jobretning og præferencer;
- skabe en genanvendelig jobprofil;
- søge og overvåge aktuelle job;
- prioritere og undersøge muligheder;
- målrette CV og skrive ansøgningsudkast;
- kvalitetstjekke materiale;
- forberede manuel afsendelse, opfølgning og jobsamtale.

Guideuniverset og Jobagentens MCP-server må ikke:

- logge ind på brugerens vegne;
- ændre profiler eller gemme job på en ekstern tjeneste;
- opfinde erfaring, motivation, resultater eller kvalifikationer;
- afgive juridiske vurderinger om ydelser eller rådighed;
- indsende en ansøgning eller påstå, at den er sendt.

## Overordnet navigation

Den primære navigation skal holdes kort, selv om sitet får mange sider:

- `Find og søg job` → `/forloeb/`
- `Vælg din AI` → `/platforme/`
- `Prompts` → `/prompts/`
- `Tryghed` → `/tryghed/`
- `Om` → `/about/`

Kontakt og privatliv ligger i footeren. `Til AI-assistenter` kan ligge i footer,
discovery og på relevante guides frem for i den primære navigation.

Hver underside skal have:

- breadcrumb;
- aktiv placering i den relevante sidegruppe;
- relaterede guides;
- én tydelig primær næste handling;
- forrige/næste trin, når siden er del af jobsøgerrejsen;
- link til sin Markdown-ledsager.

## Sideinventar

Planen indeholder 22 nye offentlige HTML-sider. Sammen med de fire eksisterende
sider giver det 26 offentlige sider. De nye sider fordeler sig på:

- 12 sider om jobsøgerrejsen;
- 7 platformssider;
- 3 tværgående sider om prompts, tryghed og AI-assistenter.

Antallet må gerne reduceres under implementering, hvis en fungerende prototype
viser, at to sider reelt er samme brugeropgave. To forskellige jobtrin må ikke
adskilles alene af hensyn til SEO.

## A. Jobsøgerrejsen

### A1. Hele forløbet

- **Route:** `/forloeb/`
- **Markdown:** `/forloeb.md`
- **Brugerspørgsmål:** Hvor begynder jeg, og hvordan ser hele processen ud?
- **Kerneindhold:** Det samlede rejsekort, mulighed for at begynde midt i
  forløbet, hvad AI kan hjælpe med, og hvad brugeren selv beslutter.
- **Primær handling:** `Vælg hvor du vil begynde`.
- **AI-indhold:** Capability-check og routing til den rigtige delguide.
- **Prompts:** En kort universel samtalestarter.
- **Næste:** Den valgte forløbsside.

### A2. Find min jobretning

- **Route:** `/forloeb/find-retning/`
- **Markdown:** `/forloeb/find-retning.md`
- **Brugerspørgsmål:** Hvilke job er realistiske og interessante for mig?
- **Kerneindhold:** Erfaring, overførbare kompetencer, energigivende opgaver,
  rammer og to til fire mulige retninger.
- **Primær handling:** `Start det guidede interview`.
- **AI-indhold:** Ét spørgsmål ad gangen; fakta, præference, hypotese og ukendt.
- **Promptmodul:** `Afklar min jobretning`.
- **Output:** Et godkendt retningsnotat.
- **Næste:** `/forloeb/jobprofil/`.

### A3. Lav min jobprofil

- **Route:** `/forloeb/jobprofil/`
- **Markdown:** `/forloeb/jobprofil.md`
- **Brugerspørgsmål:** Hvordan samler jeg det, jeg søger, i noget min AI kan
  genbruge?
- **Kerneindhold:** Dokumenteret erfaring, jobtitler, søgeord, geografi,
  arbejdstid, ansættelsesform, skal-krav, ønsker, fravalg og ukendte forhold.
- **Primær handling:** `Lav min jobprofil`.
- **AI-indhold:** Undersøg eksisterende CV først; spørg kun om manglende
  beslutninger.
- **Promptmoduler:** `Lav min genanvendelige jobprofil` og `Udvid jobtitler og
  søgeord`.
- **Output:** `profil.md` eller en kopierbar Markdown-profil.
- **Næste:** `/forloeb/find-job/`.

### A4. Find aktuelle job

- **Route:** `/forloeb/find-job/`
- **Markdown:** `/forloeb/find-job.md`
- **Brugerspørgsmål:** Hvordan finder jeg aktuelle job, der passer til min
  profil?
- **Kerneindhold:** Søgestrategi, titelvarianter, portalfiltre, bred versus
  præcis søgning, kilde-URL og kontrol af frist.
- **Primær handling:** `Søg med Jobagenten`.
- **AI-indhold:** Brug Jobagenten, hvis MCP er tilgængelig; ellers lever en
  manuel søgeprompt og portallinks.
- **Promptmodul:** `Søg efter aktuelle job`.
- **Output:** Et overskueligt resultatsæt med kilder.
- **Næste:** `/forloeb/vurder-job/` eller `/forloeb/hold-oeje/`.

### A5. Hold øje med nye job

- **Route:** `/forloeb/hold-oeje/`
- **Markdown:** `/forloeb/hold-oeje.md`
- **Brugerspørgsmål:** Kan min AI gentage søgningen og kun fortælle om nye
  relevante job?
- **Kerneindhold:** Capability-check for scheduler og Jobagenten, valg af
  cadence, criteria, deduplikering og quiet-unless-changed-notifikation.
- **Primær handling:** `Lav min overvågningsprompt`.
- **AI-indhold:** Platformtilpasset opskrift; opret intet før bekræftelse.
- **Promptmodul:** `Hold øje med nye job`.
- **Output:** En planlagt opgave eller en genbrugelig manuel prompt.
- **Næste:** `/forloeb/vurder-job/`.

### A6. Vurder og sammenlign job

- **Route:** `/forloeb/vurder-job/`
- **Markdown:** `/forloeb/vurder-job.md`
- **Brugerspørgsmål:** Hvilke job er tiden værd, og hvorfor?
- **Kerneindhold:** Shortlist, must/should-krav, match, huller, trade-offs,
  frist, arbejdsvilkår og kritisk læsning af annoncen.
- **Primær handling:** `Sammenlign mine job`.
- **AI-indhold:** Skeln mellem annoncetekst og fortolkning; link til originalen.
- **Promptmoduler:** `Lav min shortlist`, `Analysér jobannoncen` og
  `Undersøg arbejdsgiveren`.
- **Output:** Tre til fem prioriterede muligheder eller en begrundet beslutning
  om ét job.
- **Næste:** `/forloeb/cv/` eller `/forloeb/uopfordret/`.

### A7. Find muligheder uden et opslag

- **Route:** `/forloeb/uopfordret/`
- **Markdown:** `/forloeb/uopfordret.md`
- **Brugerspørgsmål:** Hvordan finder og kontakter jeg relevante virksomheder,
  når der ikke er et jobopslag?
- **Kerneindhold:** Virksomhedsliste, netværk, research, beslutningstager,
  kort henvendelse og respektfuld opfølgning.
- **Primær handling:** `Lav min virksomhedsplan`.
- **AI-indhold:** Virksomhedsbehov og kontaktveje markeres som hypoteser.
- **Promptmodul:** `Find muligheder uden et jobopslag`.
- **Output:** Prioriteret manuel kontaktplan og udkast.
- **Næste:** `/forloeb/cv/` eller `/forloeb/ansoegning/`.

### A8. Tilpas mit CV

- **Route:** `/forloeb/cv/`
- **Markdown:** `/forloeb/cv.md`
- **Brugerspørgsmål:** Hvordan målretter jeg mit CV uden at overdrive?
- **Kerneindhold:** Gapanalyse, prioritering, rækkefølge, konkrete resultater,
  relevante nøgleord og sporbarhed fra påstand til kilde.
- **Primær handling:** `Gennemgå mit CV mod jobbet`.
- **AI-indhold:** Indsæt-tekst-fallback uden filadgang; ingen ny erfaring.
- **Promptmoduler:** `Find huller mellem mit CV og jobbet` og `Tilpas mit CV`.
- **Output:** Ændringsplan og godkendt CV-udkast.
- **Næste:** `/forloeb/ansoegning/`.

### A9. Skriv min ansøgning

- **Route:** `/forloeb/ansoegning/`
- **Markdown:** `/forloeb/ansoegning.md`
- **Brugerspørgsmål:** Hvordan får jeg et konkret og personligt udkast?
- **Kerneindhold:** Motivation, virksomhedens behov, brugerens evidens, tone,
  struktur, pladsholdere og fjernelse af generiske formuleringer.
- **Primær handling:** `Start mit ansøgningsudkast`.
- **AI-indhold:** Ingen motivation må opfindes; brugerens stemme skal bevares.
- **Promptmoduler:** `Skriv første ansøgningsudkast` og `Gør ansøgningen mindre
  generisk`.
- **Output:** Godkendt ansøgningsudkast med synlige åbne punkter.
- **Næste:** `/forloeb/kvalitetstjek-og-send/`.

### A10. Kvalitetstjek og send selv

- **Route:** `/forloeb/kvalitetstjek-og-send/`
- **Markdown:** `/forloeb/kvalitetstjek-og-send.md`
- **Brugerspørgsmål:** Er materialet sandt, komplet og klar til, at jeg selv
  sender det?
- **Kerneindhold:** Sandhedstjek, stavefejl, uklarhed, frist, modtager, bilag,
  filnavne, kontaktdata og forskellen mellem Joblog-upload og afsendelse.
- **Primær handling:** `Kør den sidste tjekliste`.
- **AI-indhold:** Stop før login, formular og sendeknap.
- **Promptmoduler:** `Sandheds- og kvalitetstjek` og `Klar til selv at sende`.
- **Output:** Gennemgået tjekliste; mennesket overtager afsendelsen.
- **Næste:** `/forloeb/foelg-op/`.

### A11. Følg op og hold styr på søgningen

- **Route:** `/forloeb/foelg-op/`
- **Markdown:** `/forloeb/foelg-op.md`
- **Brugerspørgsmål:** Hvornår og hvordan følger jeg op uden at være påtrængende?
- **Kerneindhold:** Kontekstafhængig timing, kort udkast, trackingfelter,
  Joblog-status og eventuel påmindelse.
- **Primær handling:** `Lav min opfølgning`.
- **AI-indhold:** Ingen universel ventetid; ingen kontakt uden mennesket.
- **Promptmodul:** `Følg op`.
- **Output:** Godkendt udkast og næste dato.
- **Næste:** `/forloeb/jobsamtale/` eller tilbage til `/forloeb/find-job/`.

### A12. Forbered jobsamtalen

- **Route:** `/forloeb/jobsamtale/`
- **Markdown:** `/forloeb/jobsamtale.md`
- **Brugerspørgsmål:** Hvordan forbereder jeg ærlige, konkrete svar?
- **Kerneindhold:** Første/anden/video-samtale, evidenskort, almindelige
  spørgsmål, brugerens egne spørgsmål, løn og håndtering af afslag.
- **Primær handling:** `Øv samtalen med min AI`.
- **AI-indhold:** Ét spørgsmål ad gangen; ingen opdigtede STAR-eksempler.
- **Promptmodul:** `Forbered jobsamtalen`.
- **Output:** Evidenskort, øvelse og egne spørgsmål.
- **Næste:** Relevant opfølgning eller nyt søgeforløb.

## B. Platformguides

### B1. Vælg din AI-platform

- **Route:** `/platforme/`
- **Markdown:** `/platforme.md`
- **Brugerspørgsmål:** Hvilken løsning passer til mig og det, jeg vil gøre?
- **Kerneindhold:** Sammenligning af setup, MCP, filer, projekter, scheduler,
  browser, lokal/cloud og planbegrænsninger.
- **Primær handling:** `Vælg min guide`.
- **AI-indhold:** Capability-matrix og routing uden at antage platformparitet.
- **Næste:** Den valgte platformside.

### B2. Claude i browseren

- **Route:** `/platforme/claude-web/`
- **Markdown:** `/platforme/claude-web.md`
- **Kerneindhold:** Remote custom connector, Projects, filer, første søgning,
  manuel fallback og aktuelle plan/workspace-forhold.
- **Primær handling:** `Forbind Jobagenten til Claude`.
- **Test:** Kør en ufarlig søgning og kontroller kilde-URL'er.

### B3. Claude Desktop og Cowork

- **Route:** `/platforme/claude-desktop/`
- **Markdown:** `/platforme/claude-desktop.md`
- **Kerneindhold:** Forskellen på remote connector og lokal MCP, Cowork-filer,
  cloud versus local scheduled tasks og permissions.
- **Primær handling:** `Vælg lokal eller cloud arbejdsgang`.
- **Test:** Kontroller både connector og den valgte fil-/scheduleradgang.

### B4. Claude Code

- **Route:** `/platforme/claude-code/`
- **Markdown:** `/platforme/claude-code.md`
- **Kerneindhold:** MCP, lokal jobsøgningsmappe, `/loop`, Desktop tasks, cloud
  routines, permissions og sessioners levetid.
- **Primær handling:** `Opret min jobsøgningsmappe`.
- **Test:** Read-only jobsøgning og lokalt udkast uden ekstern handling.

### B5. ChatGPT i browseren

- **Route:** `/platforme/chatgpt-web/`
- **Markdown:** `/platforme/chatgpt-web.md`
- **Kerneindhold:** Full MCP versus read/fetch developer mode, planmatrix,
  Projects, filer, Tasks-begrænsninger og manuel fallback for planer uden en
  verificeret custom MCP-vej.
- **Primær handling:** `Kontrollér min ChatGPT-adgang`.
- **Test:** Bekræft den konkrete app-menu og udfør en read-only søgning.

### B6. ChatGPT Desktop

- **Route:** `/platforme/chatgpt-desktop/`
- **Markdown:** `/platforme/chatgpt-desktop.md`
- **Kerneindhold:** Indbygget browser, site tools, WebMCP, computer use,
  konto/model-afhængighed og menneskelig afsendelsesgrænse.
- **Primær handling:** `Åbn Jobagenten i den indbyggede browser`.
- **Test:** Opdag read-only site tools, hvis de er tilgængelige; ellers brug
  Markdown/MCP-fallback.

### B7. Codex Desktop

- **Route:** `/platforme/codex/`
- **Markdown:** `/platforme/codex.md`
- **Kerneindhold:** Projektmappe, lokale filer, Jobagenten/MCP, gentagne tasks,
  review af ændringer og sikker håndtering af CV-data.
- **Primær handling:** `Start et organiseret jobsøgningsprojekt`.
- **Test:** Opret lokale eksempelartefakter og gennemfør en read-only søgning.

## C. Tværgående sider

### C1. Promptbibliotek

- **Route:** `/prompts/`
- **Markdown:** `/prompts.md`
- **Brugerspørgsmål:** Hvilken samtalestarter skal jeg bruge lige nu?
- **Kerneindhold:** De 18 moduler fra [GUIDED_PROMPTS.md](GUIDED_PROMPTS.md),
  grupperet efter forløbstrin og capability.
- **Primær handling:** `Kopiér og start samtalen`.
- **Vigtig adfærd:** Kopiknappen samler fælles sikker kerne, capability-fallback
  og modultekst. Den korte synlige starter må aldrig kopieres alene.
- **Næste:** Den relevante forløbsside.

### C2. Tryg brug af AI i jobsøgningen

- **Route:** `/tryghed/`
- **Markdown:** `/tryghed.md`
- **Brugerspørgsmål:** Hvad skal jeg kontrollere og undgå?
- **Kerneindhold:** Persondata, dataminimering, sandhed, prompt injection,
  svindelkontrol, ydelsesråd, originalannonce og menneskelig afsendelse.
- **Primær handling:** `Se sikkerhedstjeklisten`.
- **Promptmodul:** `Tjek om annoncen og arbejdsgiveren virker troværdige`.
- **Relation:** `/privacy/` forklarer Jobagentens databehandling;
  `/tryghed/` forklarer brugerens sikre arbejdsform.

### C3. Til AI-assistenter

- **Route:** `/ai/`
- **Markdown:** `/ai/jobsoegning.md`
- **Brugerspørgsmål:** Hvordan hjælper jeg denne bruger med de capabilities,
  jeg faktisk har?
- **Kerneindhold:** Capability-check, sikre workflowgrene, Jobagentens grænse,
  menneskelige gates, guideindeks, MCP-endpoint og no-tools fallback.
- **Primær handling:** `Læs capabilities og vælg workflow`.
- **Discovery:** Linkes fra `llms.txt`, HTML `describedby`, serverdescriptor og
  relevante Markdown-guides.

## D. Eksisterende sider, som skal opdateres

### Forsiden `/`

Forsiden skal skifte tyngdepunkt fra `forbind MCP` til `hvad vil du have hjælp
til?`. Den skal stadig demonstrere aktuelle jobsøgninger, men også vise hele
rejsen og tilbyde tre hurtige indgange:

- `Find job nu`
- `Lav min jobprofil`
- `Hjælp mig med en ansøgning`

Platformopsætning flyttes til `/platforme/`, mens forsiden beholder en kort
platformvælger og et hurtigt setup-link.

### Privatliv `/privacy/`

Bevar siden som præcis beskrivelse af Jobagentens egen databehandling. Tilføj
links til `/tryghed/`, men bland ikke generelle AI-råd ind i privatlivsteksten.

### Om `/about/` og kontakt `/kontakt/`

Opdatér navigation og relevante links, men bevar sidernes nuværende formål.

## Fælles sidekontrakt for guides

Ud over [PAGE_CONTRACT.md](PAGE_CONTRACT.md) skal hver guide have:

- synligt mål og forventet output;
- `Det skal du have klar`;
- trinvis menneskelig guide;
- capability-check;
- kopierbar, selvbærende prompt;
- no-tools fallback;
- `Sådan ved du, at du er færdig`;
- `Det skal du selv kontrollere`;
- næste trin;
- officielle kilder og `Senest kontrolleret`;
- Markdown-ledsager med samme metadata og sikkerhedsregler.

Platformguides skal bruge statusmærkerne `Verificeret`, `Betinget` og `Ikke
verificeret`.

## WebMCP-spor

WebMCP er et sitewide capability-lag, ikke en separat erstatning for siderne.
Første version bør kun eksponere read-only værktøjer:

- `get_jobagenten_capabilities`
- `get_jobseeker_guide`
- `search_danish_jobs`
- `get_danish_job_details`

Alle input skal valideres server-side. Output skal være saneret og begrænset.
Jobannoncer forbliver ubetroet indhold. WebMCP må aldrig få et `apply`,
`submit`, `login` eller profilværktøj.

WebMCP-fravær skal være usynligt for almindelige brugere: HTML, Markdown og
remote MCP fungerer fortsat.

## Teknisk fundament før sideproduktion

Følgende skal gennemføres først eller i den første integrerede byggegren:

1. Udvid `web/pages.ts` med sidegrupper, Markdown-route, stage, audience,
   capabilities, confirmations, kilder og verificeringsdato.
2. Erstat all-to-all-navigationstesten med krav til global navigation,
   breadcrumbs, gruppeindeks og relaterede sider.
3. Indfør en fælles statisk sideskabelon/generator, så navigation, metadata og
   sikkerhedsblokke ikke kopieres manuelt.
4. Generér sitemap og `llms.txt` fra registret.
5. Test HTML/Markdown-paritet og linkrelationer.
6. Gør `/.well-known/api-catalog` fuldt RFC 9727-kompatibelt eller fjern den
   reserverede URI til fordel for en projektspecifik descriptor.
7. Afklar og generér MCP registry-/projektdescriptor fra samme kilde som den
   faktiske server.
8. Tilføj tastatur-, fokus-, reduced-motion- og grundlæggende
   accessibility-tests.

## Byggerækkefølge

### Bølge 0: fundament

- Registry/schema og statisk generator.
- Navigation og Markdown-kontrakt.
- `llms.txt`, sitemap og discovery.
- RFC 9727-beslutning.
- WebMCP-prototype med no-op fallback.

### Bølge 1: orientering

- Forside.
- `/forloeb/`.
- `/platforme/`.
- `/prompts/`.
- `/tryghed/`.
- `/ai/`.

Denne bølge skal prototypetestes med mindst én ikke-teknisk jobsøgende, før
resten låses. Testen skal især vise, om brugeren kan vælge den rigtige indgang
uden at forstå MCP.

### Bølge 2: jobsøgerrejsen

- De elleve specialiserede forløbssider under `/forloeb/`.
- Hver side får Markdown, prompt og næste-trin-navigation samtidigt.

### Bølge 3: platformguides

- De seks specialiserede platformssider.
- Hver volatile påstand kontrolleres mod officiel dokumentation på
  publiceringsdagen.

### Bølge 4: samlet kvalitet

- Kilde- og aktualitetsreview.
- Indholds- og sikkerhedsreview.
- Mobil, tablet og desktop.
- Tastatur og reduced motion.
- HTML/Markdown/discovery-paritet.
- Rigtig MCP-klient og understøttet WebMCP-klient.

## Parallel arbejdsdeling

Når siderne bygges med agenter, bør ejerskabet være:

- **Fundament-agent:** registry, generator, discovery og tests.
- **Jobsøgerrejse-agenter:** hver sin ikke-overlappende gruppe af forløbssider.
- **Platformagenter:** én OpenAI-familie og én Anthropic-familie.
- **Meta-agent:** prompts, `/ai/`, Markdown og WebMCP-copy.
- **Integrator:** navigation, konsistent tone, samlet build og test.
- **Reviewer:** kilde-, sikkerheds- og capability-review uden skriveejerskab.

Parallelle write-agenter må ikke dele checkout eller overlappende filområder.
Implementering skal følge repositoryets regler for isolerede worktrees og
integration.

## Acceptkriterier for hele guideuniverset

- Alle 26 offentlige HTML-sider er registreret og har unikke metadata.
- Alle 22 guides har en registreret Markdown-ledsager.
- Alle guides virker uden JavaScript og uden AI-værktøjer.
- Alle prompts kopierer sikker kerne, fallback og modultekst samlet.
- `llms.txt` og sitemap genereres fra registret.
- En AI kan begynde på `/ai/` og vælge korrekt no-tools-, MCP-, files-,
  scheduler- eller browserworkflow.
- WebMCP tilbyder kun read-only tools og er valgfrit.
- Ingen side eller prompt påstår, at Jobagenten sender ansøgninger.
- Platformpåstande har officielle kilder og frisk verificeringsdato.
- Alle kontrakt-, browser-, accessibility-, MCP- og buildchecks består.
- En ikke-teknisk testbruger kan finde en relevant indgang, gennemføre et
  guidet trin og forstå, hvad personen selv skal gøre bagefter.

## Ikke en del af denne byggeplan

- Brugerkonti eller central lagring af CV og jobprofil.
- Automatisk jobansøgning eller formularafsendelse.
- Login til Jobnet, a-kasse eller arbejdsgiverportaler.
- Juridisk rådgivning om ydelser og rådighed.
- Write-capabilities i MCP eller WebMCP.

