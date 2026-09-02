# Redaktionsplan for Jobagentens guides

## Målet

Alle offentlige sider skal kunne forstås af en 25-årig dansk jobsøgende uden kendskab til AI, MCP eller tekniske agentbegreber. Efter at have læst en side skal man kunne svare på tre ting: Hvad hjælper siden mig med? Hvad gør jeg nu? Hvornår er jeg færdig?

Siderne skal fortsat kunne læses af en AI via deres Markdown-version. Det kræver klare handlinger og grænser, ikke synlige researchnoter.

## Det auditten fandt

1. De 22 guides bruger cirka 550–900 ord hver; promptbiblioteket bruger cirka 1.900 ord.
2. Platformssiderne viser interne statusmarkører som “verificeret”, “betinget” og “ikke verificeret”. De hører til research og vedligeholdelse, ikke til brugerens hovedforløb.
3. Ord som `capability`, `fallback`, `read-only`, `scheduler`, `scope`, `MCP` og `WebMCP` bruges, før de er forklaret — eller selv når brugeren slet ikke behøver dem.
4. Sikkerhedsgrænser gentages i brødtekst, prompt, “Til AI-assistenten” og det fælles sikkerhedspanel.
5. Mange prompts er skrevet som specifikationer til en agent frem for som en naturlig besked, et menneske har lyst til at sende.
6. Flere sider forklarer systemet, før de hjælper med opgaven. Den vigtigste handling kommer for sent.

## Ny tone of voice

- Skriv til “du” som en rolig, erfaren hjælper.
- Start med udbyttet, ikke teknologien.
- Brug almindelige danske ord. Forklar et nødvendigt fagord samme sted, første gang det bruges.
- Skriv korte afsnit og hele sætninger. Ét afsnit skal helst bære én pointe.
- Brug konkrete eksempler fra jobsøgning frem for abstrakte kategorier.
- Sig “hvis din AI kan …” i stedet for “lav et capability-check”.
- Sig “søg selv på portalen” i stedet for “brug manuel fallback”.
- Sig “Jobagenten kan kun læse og søge” én gang, hvor det er relevant.
- Undgå at tale om researchprocessen. Fortæl kun det, brugeren skal vide for at handle sikkert.

## Fast opbygning for en guide

1. En titel, der beskriver brugerens handling.
2. En kort indledning på højst to afsnit med det konkrete udbytte.
3. “Det skal du have klar” med højst fire punkter.
4. “Sådan gør du” med tre til seks nummererede trin.
5. “Kopiér denne besked” med en kort, naturlig og selvbærende prompt.
6. “Du er færdig, når …” med et observerbart resultat.
7. “Næste skridt” med én primær vej og højst én alternativ vej.

Det fælles sikkerhedspanel og kildeområdet skal bære de tværgående forbehold. Særskilte afsnit med “Til AI-assistenten”, researchstatus og gentagne sendekanter fjernes fra brødteksten.

## Side-for-side beslutning

### Jobsøgerforløbet

- `/forloeb/`: Gør det til en enkel indgang baseret på “Hvor er du lige nu?” og fjern systemforklaringen.
- `/forloeb/find-retning/`: Bevar det guidede interview, men brug hverdagsspørgsmål og et enkelt retningsark.
- `/forloeb/jobprofil/`: Forklar profilen som en huskeseddel til AI’en, ikke som en versioneret datafil.
- `/forloeb/find-job/`: Start direkte med jobtype og sted; forklar Jobagenten i én sætning.
- `/forloeb/hold-oeje/`: Brug “planlagt søgning” og “påmindelse”; undgå scheduler- og scope-sprog.
- `/forloeb/vurder-job/`: Erstat kravmatrix/trade-offs med en enkel sammenligning: passer, uklart, passer ikke.
- `/forloeb/uopfordret/`: Fokusér på valg af virksomheder og et kort udkast.
- `/forloeb/cv/`: Fokusér på relevans, sandhed og konkrete ændringer.
- `/forloeb/ansoegning/`: Fokusér på motivation, to eksempler og egen stemme.
- `/forloeb/kvalitetstjek-og-send/`: Gør siden til en kort slutkontrol; mennesket sender selv.
- `/forloeb/foelg-op/`: Giv en enkel beslutning om hvorvidt, hvornår og hvordan man følger op.
- `/forloeb/jobsamtale/`: Erstat “evidenskort” med “din eksempelliste” og gør øvelsen konkret.

### Platforme

- `/platforme/`: Start med det produkt, brugeren allerede har. Sammenlign i hverdagssprog.
- De seks platformsguides: Fjern “Hvad der er kendt”, “Capability-check”, “Betinget” og “Ikke verificeret”. Vis i stedet en kort opsætning, en prøvesøgning og én enkel vej videre, hvis menupunktet ikke findes.
- Forklar MCP højst én gang som “forbindelsen til Jobagenten”. Brug derefter “Jobagenten”.
- Bevar officielle links nederst, så ændrede menuer kan kontrolleres uden at gøre researchstatus til indhold.

### Prompts, tryghed og AI

- `/prompts/`: Del prompts efter brugerens næste skridt, giv hver prompt en menneskelig titel, og fjern gentaget kontraktsprog.
- `/tryghed/`: Brug fem konkrete regler og eksempler på oplysninger, man ikke bør dele.
- `/ai/`: Gør siden til en kort maskin- og menneskelæsbar arbejdsregel. Forklar tekniske forbindelser i en ordliste nederst.

### Forside og redaktionelle sider

- Forsiden, Om og Kontakt har allerede den rigtige menneskelige stemme; kun faktuelle produktløfter og tekniske formuleringer kvalitetstjekkes.
- Privatliv skal fortsat være præcis, men tekniske logningsdetaljer skal forklares i almindeligt sprog.

## Acceptkriterier

1. Ingen menneskevendt guide bruger overskrifterne “Hvad der er kendt”, “Capability-check” eller “Til AI-assistenten”.
2. Ingen synlig brødtekst bruger “verificeret”, “ikke verificeret”, `fallback`, `scope` eller `cadence` som intern arbejdsstatus.
3. Nødvendige forekomster af MCP, WebMCP og read-only forklares eller flyttes til AI-/opsætningskontekst.
4. Hver guide har ét tydeligt færdigkriterium og højst to næste veje.
5. Prompts lyder som beskeder fra en jobsøgende, men bevarer sandhed, privatliv og menneskelig afsendelse.
6. Markdown-, HTML-, link-, side- og responsive kontrakter består via `bun run check`.
7. Alle 26 produktionssider gennemgås i browser ved mobil og desktop efter deployment.
