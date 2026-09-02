# Researchgrundlag for AI-platformguides

Status: Volatilt researchgrundlag, ikke færdig webtekst  
Kontrolleret: 2. september 2026

## Redaktionel regel

Platformfunktioner skal beskrives pr. overflade, plan, region og execution
mode. At en funktion findes i én ChatGPT- eller Claude-overflade beviser ikke,
at den findes i en anden. Hver publiceret platformsguide skal have en synlig
`Senest kontrolleret`-dato og links til officielle kilder.

Brug disse statusmærker:

- **Verificeret:** direkte understøttet af en aktuel officiel kilde.
- **Betinget:** tilgængelighed afhænger af plan, region, workspace eller model.
- **Ikke verificeret:** må ikke loves; giv en manuel fallback.

## Fælles capability-model

Hver guide skal undersøge følgende særskilt:

- Kan brugeren forbinde et remote MCP eller en custom app?
- Kan AI'en læse projektfiler eller lokale filer?
- Bevares kontekst på tværs af samtaler?
- Kan den browse eller bruge en browser?
- Kan den automatisere browserhandlinger?
- Kan den køre planlagte opgaver, og hvor kører de?
- Har en planlagt opgave adgang til filer og connectors?
- Kræver eksterne handlinger bekræftelse?

## Platformmatrix

| Platform | Jobagenten/MCP | Filer og vedvarende kontekst | Planlægning | Browser/handlinger | Guideposition |
| --- | --- | --- | --- | --- | --- |
| Claude i browseren | Remote custom connectors er verificeret; plan- og workspacevilkår gælder | Projects og filuploads er verificeret | Almindelig Claude-chat-scheduling er ikke dokumenteret som generel egenskab; Cowork er særskilt | Web/connectors afhænger af produkt og plan | God begyndervenlig standardvej |
| Claude Desktop/Cowork | Remote connectors; lokale MCP'er er en særskilt Desktop-mekanisme | Cowork kan bruge connectors, skills og valgte lokale mapper | Scheduled tasks er verificeret på betalte planer; cloud og local har forskellig adgang | Lokale handlinger kræver relevant lokal mode | God til tilbagevendende arbejde og mapper |
| Claude Code | MCP og lokale filer er verificeret | Arbejder i projekt/repository og lokale filer | `/loop`, Desktop tasks og cloud routines har forskellige livscykler | Terminal- og værktøjsadgang efter permissions | Avanceret spor |
| ChatGPT i browseren | Full MCP er verificeret for Business og Enterprise/Edu; Pro har en smallere read/fetch-vej i developer mode | Projects og uploads findes, men en Task i et Project kan ikke tilgå Project-filer | Tasks er verificeret; adgang til en custom Jobagenten-app i Tasks skal testes på den konkrete konto | Cloud browser/agent er plan- og handlingsafhængig | God almindelig AI-vej, men MCP-opsætning er betinget |
| ChatGPT Desktop | Remote appmuligheder må verificeres mod den konkrete konto | Desktop kan have bredere arbejdsflader; lokal filparitet er ikke dokumenteret generelt | Tasks findes på understøttede klienter; Windows-status skal kontrolleres | Site tools/WebMCP findes kun, når konto, model og side understøtter det | Lov aldrig automatisk site-tool-opdagelse endnu |
| Codex Desktop | Den aktuelle Codex-app kan arbejde med MCP/plugins i understøttede projekter | Stærk lokal fil- og projektarbejdsgang | Lokale recurring tasks/heartbeats findes i den aktuelle app, men offentlig guide skal følge officiel produktdokumentation | Kan arbejde med browser/terminal efter værktøjer og tilladelser | Organiseret/avanceret jobsøgningsmappe |

## Platformnoter

### Claude i browseren

Remote custom connectors forbindes fra Anthropics cloud. Et remote MCP skal
derfor være offentligt tilgængeligt. Den officielle vejledning angiver
tilgængelighed på Free, Pro, Max, Team og Enterprise, med en begrænsning på én
custom connector for gratisbrugere. Team- og Enterprise-workspaces kan have
administratorstyring.

Projects kan samle chats og viden. Filtyper og grænser ændrer sig og skal ikke
kopieres til Jobagentens guide uden ny verifikation.

### Claude Desktop og Cowork

Remote connectors er brokered gennem Claude-kontoen, også i Desktop. Lokale
MCP-servere konfigureret direkte i Desktop er en anden mekanisme og er ikke
automatisk tilgængelige i Claude Web eller Cowork.

Cowork scheduled tasks er på kontroltidspunktet tilgængelige på betalte planer.
Remote opgaver kan køre, når computeren er slukket, men er ikke knyttet til en
lokal mappe. Opgaver, der kræver lokale filer eller apps, skal køre lokalt.

### Claude Code

Claude Code har tre relevante scheduling-mønstre:

- `/loop` i den aktuelle session, som kræver at sessionen kører;
- Desktop scheduled tasks på brugerens maskine med lokal adgang;
- cloud routines, som kan køre uden brugerens maskine.

De har forskellige adgangs-, permission- og levetidsregler. En guide må ikke
kalde dem én samlet funktion.

### ChatGPT i browseren

Apps kan søge, hente kontekst og i nogle tilfælde udføre write actions med
bekræftelse. Den officielle dokumentation beskriver full MCP for Business og
Enterprise/Edu og en smallere read/fetch-vej for Pro i developer mode. Der er
ikke verificeret en custom MCP-vej for Free, Go eller Plus. Den nuværende
Jobagenten-guide skal derfor begynde med et availability-check og tilbyde en
manuel portal-/tekstfallback i stedet for at love en universel `Create app`-
menu.

ChatGPT Tasks kan køre, når brugeren ikke er online. På kontroltidspunktet:

- understøttes Tasks ikke af alle modeller;
- afhænger antallet af aktive Tasks af brugerens plan;
- kan Tasks ikke bruge voice chats eller GPTs;
- kan en Task oprettet i et Project ikke tilgå Project-filer eller filer, som
  er uploadet i det Project;
- er adgang til en vilkårlig custom MCP-app ikke verificeret alene af den
  generelle Tasks-dokumentation;
- afhænger klientunderstøttelse af platform.

En planlagt jobsøgning skal derfor indeholde en selvstændig jobprofil og
søgekriterier i opgaveinstruktionen, medmindre en senere test viser en anden
connector-/filadgang.

### ChatGPT Desktop og WebMCP

Site tools i ChatGPT Desktops indbyggede browser anvender WebMCP-værktøjer,
som den aktuelle side stiller til rådighed. De virker ikke i almindelig Chrome
alene, følger ikke automatisk brugeren på tværs af websites og er afhængige af
konto og model. Jobagenten tilbyder ikke WebMCP-site tools endnu.

Browser- eller computer-use-funktioner er heller ikke tilladelse til at sende
en ansøgning. Guiden skal stoppe ved en menneskelig afsendelsesport.

### Codex Desktop

Codex er særlig velegnet til en lokal jobsøgningsmappe med `profil.md`,
`shortlist.csv`, CV og ansøgningsudkast. Den offentlige guide skal dog beskrive
observerede, officielle funktioner og ikke gøre den aktuelle udviklersession
til et løfte om alle konti eller fremtidige versioner.

## Påstande siden ikke må fremsætte

- At alle ChatGPT-brugere kan forbinde et custom MCP.
- At en planlagt ChatGPT-opgave kan læse brugerens Project-filer.
- At remote Claude-connectors kører direkte fra brugerens laptop.
- At Claude Web, Cowork, Desktop og Claude Code har samme fil- og scheduleradgang.
- At WebMCP er universelt understøttet eller allerede implementeret på siden.
- At browserautomation betyder, at Jobagenten kan sende en ansøgning.
- At en scheduler kan bruge Jobagenten, før det er verificeret på den konkrete
  platform og konto.

## Officielle kilder

OpenAI:

- Apps i ChatGPT:
  <https://help.openai.com/en/articles/11487775-connectors-in-chatgpt>
- Developer mode og MCP apps:
  <https://help.openai.com/en/articles/12584461>
- Tasks i ChatGPT:
  <https://help.openai.com/en/articles/10291617-tasks-inchatgpt>
- Site tools i ChatGPT Desktop:
  <https://help.openai.com/en/articles/20001423-using-site-tools-in-the-chatgpt-desktop-app>
- Codex-dokumentation:
  <https://developers.openai.com/codex/>

Anthropic:

- Custom connectors med remote MCP:
  <https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp>
- Desktop- og web-connectors:
  <https://support.anthropic.com/en/articles/11725091-when-to-use-desktop-and-web-connectors>
- Projects:
  <https://support.anthropic.com/en/articles/9517075-what-are-projects>
- Filuploads:
  <https://support.anthropic.com/en/articles/8241126-what-kinds-of-documents-can-i-upload-to-claude-ai>
- Cowork scheduled tasks:
  <https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork>
- Claude Code scheduled tasks:
  <https://code.claude.com/docs/en/scheduled-tasks>
- Claude Code cloud routines:
  <https://code.claude.com/docs/en/web-scheduled-tasks>
