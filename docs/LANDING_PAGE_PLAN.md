# Landingpage-plan for Jobagenten

Status: Første responsive implementering findes i `web/`. Åbne produkt- og
deploybeslutninger nedenfor er fortsat gældende.

## Formål

Landingpagen på `https://job-agent.dk/` skal gøre det let for en almindelig
jobsøgende at:

1. forstå, hvad Jobagenten gør;
2. afgøre, om den er relevant;
3. forbinde den til ChatGPT eller Claude;
4. gennemføre sin første jobsøgning;
5. føle sig tryg ved, hvad tjenesten kan og ikke kan.

Det primære succeskriterium er ikke trafik eller tilmeldinger. Det er, at en
førstegangsbruger kan gå fra forsiden til en vellykket søgning uden teknisk
hjælp.

## Målgruppe

Primær målgruppe:

- jobsøgende i Danmark;
- personer, som allerede bruger ChatGPT eller Claude i browseren;
- personer uden kendskab til MCP, API'er, terminaler eller udvikling;
- både ledige og personer, der undersøger et muligt jobskifte.

Sekundær målgruppe:

- karriererådgivere, fagforeninger og a-kasser;
- tekniske brugere af Codex og Claude Code;
- organisationer, som vil tilbyde Jobagenten internt.

## Kernebudskab

Arbejdstitel:

> Jobagenten

Primært løfte:

> Find relevante job på tværs af danske jobportaler direkte i ChatGPT eller
> Claude.

Kort forklaring:

> Fortæl, hvad du leder efter. Jobagenten søger aktuelle stillinger og hjælper
> dig med at sammenligne dem. Du behøver ikke lære et nyt jobsøgningssystem.

Vigtige støttebudskaber:

- Samler søgning på tværs af Jobnet, Jobindex, Jobdanmark og Akademikernes
  Jobbank.
- Returnerer links til de oprindelige jobannoncer.
- Er read-only: Den søger og læser, men søger aldrig et job for brugeren.
- Kræver ikke CV-upload eller adgang til Jobnet-profil.
- Kan bruges med naturligt dansk.

## Informationsarkitektur

Siden planlægges som én fokuseret landingpage med ankerlinks:

1. Topnavigation
2. Hero og primær handling
3. Hvad Jobagenten hjælper med
4. Sådan virker den
5. Vælg hvor du vil bruge den
6. Browserguide: Claude
7. Browserguide: ChatGPT
8. Avancerede guides: Codex og Claude Code
9. Eksempelprompts
10. Datakilder og tryghed
11. Begrænsninger
12. FAQ
13. Footer

På mobil vises guiderne som almindelige kort eller accordions. På større
skærme kan de fire platforme vises som faner. Grundlæggende indhold må ikke
være afhængigt af JavaScript.

## 1. Topnavigation

Indhold:

- Logo/ordmærke: `Jobagenten`
- `Sådan virker det`
- `Kom i gang`
- `Eksempler`
- `Tryghed`
- Primær knap: `Forbind Jobagenten`

På mobil bør kun ordmærke og den primære knap være synlige før menuen åbnes.

## 2. Hero

Forslag til overskrift:

> Lad din AI hjælpe med at finde dit næste job

Forslag til brødtekst:

> Jobagenten giver ChatGPT og Claude adgang til aktuelle stillinger fra flere
> danske jobportaler. Beskriv jobbet, området og det, der betyder noget for
> dig — så får du en overskuelig liste med links til de rigtige annoncer.

Primær handling:

> Kom i gang på 2 minutter

Sekundær handling:

> Se et eksempel

Tryghedslinje under handlingerne:

> Ingen CV-upload · Ingen ansøgninger sendes · Du beholder kontrollen

Heroen bør vise et enkelt, realistisk eksempel på en samtale frem for en
teknisk systemillustration:

> **Dig:** Find deltidsjob inden for kommunikation i Aarhus, som stadig kan
> søges.
>
> **Din AI med Jobagenten:** Jeg fandt 8 relevante stillinger. Her er de fem
> bedste med arbejdsgiver, sted, frist og link.

## 3. Hvad Jobagenten hjælper med

Tre til fire konkrete anvendelser:

### Find relevante stillinger

Søg efter jobtitel, kompetencer, geografi, arbejdstid og andre ønsker i
almindeligt sprog.

### Søg flere steder på én gang

Lad din AI undersøge flere danske jobportaler i stedet for at gentage den
samme søgning manuelt.

### Sammenlign muligheder

Få stillinger sammenlignet på blandt andet arbejdssted, frist, ansvar og
efterspurgte kompetencer.

### Bliv klogere på din søgning

Bed din AI om at udvide søgeord, finde beslægtede jobtitler eller forklare,
hvorfor en stilling matcher.

Vi må ikke love automatisk overvågning, gemte søgninger, lønoplysninger eller
jobansøgninger, før disse funktioner faktisk findes.

## 4. Sådan virker den

Trin 1:

> **Forbind Jobagenten**
> Tilføj den én gang i ChatGPT eller Claude.

Trin 2:

> **Beskriv dit ønskede job**
> Skriv jobtype, område og det, der er vigtigt for dig.

Trin 3:

> **Få aktuelle resultater**
> Din AI søger, samler og præsenterer stillinger med links til kilden.

Trin 4:

> **Undersøg videre**
> Sammenlign job, justér kravene eller åbn annoncen hos jobportalen.

Ordet “MCP” behøver først optræde i en lille forklaring længere nede:

> Jobagenten er en MCP-forbindelse. Det betyder blot, at din AI får et sikkert,
> afgrænset sæt værktøjer til at søge og læse offentlige jobannoncer.

## 5. Vælg hvor du vil bruge den

Overskrift:

> Hvor bruger du din AI?

Undertekst:

> Vælg den løsning, du allerede bruger. Vi viser kun de trin, du har brug for.

Platformskort:

| Platform | Målgruppe | Etiket |
| --- | --- | --- |
| Claude i browseren | De fleste begyndere | Nemmest |
| ChatGPT i browseren | Brugere med understøttet plan | Tjek din plan |
| Codex | Tekniske brugere | Avanceret |
| Claude Code | Tekniske brugere | Avanceret |

Hvert kort skal vise forventet tid, forudsætninger og en tydelig `Vis guide`-
handling.

## 6. Guide: Claude i browseren

Intro:

> Denne vej er normalt den letteste. Du skal kun tilføje webadressen én gang.

Forudsætninger:

- En Claude-konto.
- Adgang til brugerdefinerede connectors på brugerens plan.
- På Team og Enterprise kan en ejer være nødt til at tilføje forbindelsen
  først.

Trin:

1. Åbn Claude og vælg `Customize`.
2. Vælg `Connectors`.
3. Tryk `+` og derefter `Add custom connector`.
4. Skriv navnet `Jobagenten`.
5. Indsæt `https://job-agent.dk/mcp`.
6. Tryk `Add`.
7. Åbn en ny samtale.
8. Tryk `+`, vælg `Connectors`, og slå Jobagenten til.
9. Indsæt den foreslåede testprompt.

Handlinger i guiden:

- `Kopiér adressen`
- `Åbn Claude`
- `Kopiér testprompt`

Kvittering:

> Det virker, når Claude viser eller bruger Jobagentens jobsøgningsværktøjer og
> returnerer job med links til de oprindelige annoncer.

## 7. Guide: ChatGPT i browseren

Intro:

> ChatGPT kalder forbindelsen en app. Funktionen afhænger af dit abonnement og
> eventuelle regler på din arbejdsplads.

Forudsætninger:

- En ChatGPT-plan, som understøtter brugerdefinerede MCP-apps.
- Developer mode skal være tilgængelig.
- På arbejdspladskonti kan en administrator skulle aktivere eller udgive
  appen.

Trin:

1. Åbn `Settings` i ChatGPT.
2. Vælg `Apps` og derefter `Advanced settings`.
3. Aktivér `Developer mode`, hvis muligheden er tilgængelig.
4. Gå tilbage til `Apps` og vælg `Create app`.
5. Skriv navnet `Jobagenten`.
6. Indsæt `https://job-agent.dk/mcp` som endpoint.
7. Vælg ingen loginmetode, hvis den offentlige beta fortsat er uden login.
8. Tryk `Scan tools`, kontrollér resultatet, og vælg `Create`.
9. Åbn en ny chat og vælg Jobagenten fra værktøjsmenuen.
10. Indsæt testprompten.

Hvis funktionen ikke findes:

> Kan du ikke se Developer mode eller Create app? Funktionen er muligvis ikke
> inkluderet i din plan eller kan være slået fra af din administrator. Du kan
> i stedet bruge Claude-guiden.

Vi skal genverificere ordlyd, menupunkter og planadgang mod OpenAIs officielle
dokumentation umiddelbart før lancering.

## 8. Avanceret: Codex og Claude Code

Sektionen skal være lukket som standard, så begyndere ikke møder en terminal
som en del af hovedflowet.

### Codex

```bash
codex mcp add job-agent --url https://job-agent.dk/mcp
```

Kontrol:

```bash
codex mcp list
```

### Claude Code

```bash
claude mcp add --transport http --scope user job-agent https://job-agent.dk/mcp
```

Forklaring i almindeligt sprog:

> `--scope user` gør Jobagenten tilgængelig, uanset hvilken mappe Claude Code
> er startet i.

## 9. Første testprompt

Standardprompt:

> Brug Jobagenten til at finde 10 relevante stillinger som [jobtitel] i
> nærheden af [område]. Søg på tværs af de tilgængelige danske jobportaler.
> Vis titel, arbejdsgiver, sted, ansøgningsfrist og direkte link. Stil mig højst
> tre spørgsmål, hvis du mangler vigtige oplysninger.

Begyndervenlig promptbygger:

- Felt 1: `Hvilket job leder du efter?`
- Felt 2: `Hvor vil du arbejde?`
- Felt 3: `Hvad er vigtigt for dig?` — valgfrit
- Knap: `Lav min prompt`
- Resultat med knappen `Kopiér prompt`

Promptbyggeren skal fungere lokalt i browseren. Teksten skal ikke sendes til
serveren eller gemmes.

## 10. Flere eksempelprompts

### Bred jobsøgning

> Find aktuelle kommunikationsjob på Sjælland. Medtag også beslægtede
> jobtitler, som jeg måske ikke selv har tænkt på.

### Geografisk søgning

> Find fleksjob inden for 30 kilometer af postnummer 8000. Vis de nyeste først.

### Deltid

> Find deltidsjob mellem 20 og 30 timer om ugen i København inden for
> administration eller kundeservice.

### Akademiske stillinger

> Find stillinger inden for dataanalyse, evaluering og samfundsvidenskab i
> Aarhus. Søg også i Akademikernes Jobbank.

### Sammenligning

> Sammenlign disse stillinger på ansvar, kompetencekrav, arbejdssted,
> ansøgningsfrist og mulige spørgsmål til en jobsamtale.

### Udforskning

> Jeg har erfaring med undervisning, projektledelse og kommunikation. Foreslå
> fem relevante jobtitler, og søg derefter efter aktuelle stillinger.

## 11. Datakilder og tryghed

Overskrift:

> Du beholder kontrollen

Indhold:

- Jobagenten søger kun i offentligt tilgængelige jobannoncer.
- Den logger ikke ind på jobportaler på brugerens vegne.
- Den læser ikke brugerens CV eller profil.
- Den gemmer ikke job og sender ikke ansøgninger.
- Resultater linker tilbage til den oprindelige portal.
- Annonceindhold behandles som tredjepartsindhold og kan indeholde fejl.
- Brugeren bør altid kontrollere frist og oplysninger i originalannoncen.

Datakilder vises med navn og kort forklaring:

- Jobnet — bred offentlig jobportal.
- Jobindex — bred privat jobportal.
- Jobdanmark — danske stillinger på tværs af fagområder.
- Akademikernes Jobbank — især akademiske og højtuddannede profiler.

Vi bør undgå formuleringer, der antyder partnerskab, godkendelse eller officiel
tilknytning til portalerne.

## 12. Begrænsninger

En kort, ærlig sektion:

> Jobagenten gør søgningen lettere, men kan ikke garantere, at alle annoncer
> findes, stadig er åbne eller indeholder komplette oplysninger. Jobportaler
> kan ændre deres systemer, og samme stilling kan optræde flere steder.

Andre relevante begrænsninger:

- Filtre varierer mellem portalerne.
- Ikke alle portaler oplyser løn, arbejdstid eller hjemmearbejde.
- Jobagenten vurderer ikke juridiske eller kontraktlige forhold.
- Den skriver eller indsender ikke ansøgninger i første version.

## 13. FAQ

### Er Jobagenten gratis?

Forslag til svar afhænger af den endelige adgangsmodel. I en offentlig beta:

> Ja, Jobagenten er gratis at bruge i betaen. Din AI-tjeneste kan kræve et
> bestemt abonnement for at tilføje egne forbindelser.

### Skal jeg oprette en konto?

> Ikke hos Jobagenten i den offentlige beta. Du skal have en konto hos ChatGPT
> eller Claude.

### Skal jeg uploade mit CV?

> Nej. Du kan beskrive dine ønsker direkte i samtalen. Jobagenten modtager kun
> de søgekriterier, din AI bruger til jobsøgningen.

### Kan Jobagenten søge et job for mig?

> Nej. Den kan finde og sammenligne annoncer, men den kan ikke sende en
> ansøgning eller ændre oplysninger på dine vegne.

### Hvor kommer stillingerne fra?

> Fra offentligt tilgængelige annoncer hos Jobnet, Jobindex, Jobdanmark og
> Akademikernes Jobbank. Du får et link til originalen.

### Hvorfor kan jeg ikke tilføje den i ChatGPT?

> Brugerdefinerede apps er ikke tilgængelige på alle abonnementer og kan være
> deaktiveret af en administrator. Prøv Claude-guiden, eller kontakt din
> workspace-administrator.

### Hvad bliver gemt om mig?

Svaret skal færdiggøres, når logging- og privatlivsdesignet er besluttet. Målet
er ingen konti, ingen profilering og ingen lagring af individuelle søgninger.

### Kan jeg stole på resultaterne?

> Jobagenten hjælper med at finde og strukturere annoncer, men AI kan tage
> fejl. Kontrollér altid oplysninger og ansøgningsfrist i originalannoncen.

## Footer

Foreslåede links:

- Om Jobagenten
- Datakilder
- Privatliv
- Driftsstatus
- Kontakt
- For udviklere
- GitHub, hvis repositoryet senere offentliggøres

Footer-note:

> Jobagenten er en uafhængig tjeneste og er ikke en del af eller godkendt af de
> nævnte jobportaler.

## Visuel retning

- Roligt og menneskeligt frem for futuristisk AI-design.
- Varm, lys grundflade med høj kontrast og én tydelig handlingsfarve.
- Stor, venlig typografi med korte linjer.
- Runde hjørner i moderat grad; ikke et generisk dashboardudtryk.
- En original hero-illustration eller et autentisk motiv om jobsøgning kan
  støtte målgruppen. Den må ikke ligne en tilfældig stockphoto.
- Platformsguider bruger genkendelige ord og eventuelt officielle ikoner, når
  brugsvilkårene tillader det.
- Animation begrænses til diskrete overgange og feedback på kopier-knapper.

## Tilgængelighed og begyndervenlighed

- Skriv til læseniveau svarende til almindeligt hverdagssprog.
- Én handling pr. trin.
- Brug både tekst og ikon; aldrig ikon alene.
- Alle kopier-knapper giver synlig feedback: `Kopieret`.
- Tastaturbetjening og tydelig fokusmarkering.
- Ingen kritisk information kun i farver, animationer eller tooltips.
- Forklar engelske menupunkter nøjagtigt, fordi produkternes brugerflade kan
  være på engelsk.
- Vis platformens krav, før brugeren starter guiden.
- Bevar brugerens indtastede promptbyggertekst ved skift mellem guidefaner.

## Indhold, der skal verificeres før lancering

- Aktuelle ChatGPT-planer og menunavne for custom MCP-apps.
- Aktuelle Claude-planer og menunavne for custom connectors.
- De præcise Codex- og Claude Code-kommandoer i seneste version.
- At både ChatGPT og Claude kan scanne alle værktøjer fra det endelige endpoint.
- At authless Streamable HTTP fungerer i begge browsertjenester.
- Portalernes aktuelle vilkår, robots-politikker og krav til attribution.
- Den endelige privatlivstekst i forhold til proxy- og applikationslogs.

## Åbne produktbeslutninger

1. Skal navnet være `Jobagenten`, `Job-agent` eller noget tredje?
2. Skal første version være gratis og uden login?
3. Skal alle fire jobportaler være aktive fra lanceringen?
4. Skal der være en offentlig driftsstatusside?
5. Hvilken kontaktkanal skal brugerne have?
6. Skal vi have anonym, privatlivsvenlig statistik over sidebesøg og fejl?
7. Skal siden kun være på dansk i første version?
8. Skal vi offentliggøre kildekoden eller blot beskrive sikkerhedsmodellen?

## Foreslået første leverance

Den første sammenhængende sideversion bør indeholde:

- navigation og hero;
- den korte “sådan virker det”-forklaring;
- fire platformskort;
- fulde guides til Claude og ChatGPT;
- avancerede kommandoer til Codex og Claude Code;
- første testprompt og tre ekstra eksempler;
- tryghedssektion, begrænsninger og FAQ;
- footer med privatliv, kontakt og datakilder.

Promptbygger, detaljeret statusvisning og eventuelle analytics kan komme efter,
at det centrale forbindelsesflow er testet med rigtige førstegangsbrugere.
