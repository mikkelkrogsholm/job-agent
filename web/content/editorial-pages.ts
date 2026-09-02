export type EditorialPage = {
  id: "about" | "privacy" | "contact";
  route: `/${string}/`;
  source: string;
  title: string;
  description: string;
  openGraphTitle: string;
  openGraphDescription: string;
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  author?: string;
};

export const EDITORIAL_PAGES: readonly EditorialPage[] = [
  {
    id: "about",
    route: "/about/",
    source: "web/public/about/index.html",
    title: "Om Mikkel Freltoft Krogsholm · Jobagenten",
    description: "Mød Mikkel Freltoft Krogsholm, AI-specialisten og udvikleren bag Jobagenten, og læs om hans arbejde med konkrete AI-værktøjer.",
    openGraphTitle: "Om Mikkel Freltoft Krogsholm · Jobagenten",
    openGraphDescription: "Mød AI-specialisten og udvikleren bag Jobagenten.",
    eyebrow: "Om skaberen",
    heading: "Jeg hedder Mikkel",
    author: "Mikkel Freltoft Krogsholm",
    bodyHtml: `<p>Jeg er Mikkel Freltoft Krogsholm — AI-specialist, dataanalytiker, udvikler og forfatter til <em>Superkræfter</em>. Jeg har bygget Jobagenten, fordi offentlige data først får værdi, når almindelige mennesker faktisk kan bruge dem.</p><p>Gennem Brokk og Sindre ApS hjælper jeg virksomheder og organisationer med at omsætte AI-idéer til konkrete værktøjer, arbejdsgange og bedre beslutninger. Jeg holder også foredrag og workshops om AI i praksis.</p><p><a rel="author noopener" href="https://mikkelkrogsholm.dk/da/about/">Læs mere om mit arbejde ↗</a></p>`,
  },
  {
    id: "privacy",
    route: "/privacy/",
    source: "web/public/privacy/index.html",
    title: "Privatliv og databehandling · Jobagenten",
    description: "Læs hvordan den gratis Jobagent håndterer søgninger, tekniske data, fair-use-begrænsning og eksterne jobportaler uden login eller konto.",
    openGraphTitle: "Privatliv og databehandling · Jobagenten",
    openGraphDescription: "Sådan beskytter Jobagenten dit privatliv uden login eller konto.",
    eyebrow: "Senest opdateret 2. september 2026",
    heading: "Privatliv",
    bodyHtml: `<p>Jobagenten er gratis og kræver ingen konto. Tjenesten beder ikke om dit navn, din e-mail, dit CV eller login til en jobportal.</p><h2>Hvad behandles?</h2><p>Når din AI bruger MCP-serveren, modtager serveren den søgning og de filtre, du har skrevet. Søgningen sendes videre til de valgte jobportalers offentlige søgefunktioner. Undgå derfor at skrive CPR-nummer, helbredsoplysninger eller andre følsomme personoplysninger i en jobsøgning.</p><h2>Besøgsstatistik</h2><p>Vi bruger en selvhostet Umami-installation til at forstå, hvilke sider og guides der bliver brugt, og om besøgende finder vej til de vigtigste trin. Umami sætter ikke cookies. Statistikken omfatter sidevisninger, tekniske enhedstyper, henvisende sider og enkelte handlinger som at åbne en guide eller kopiere en opsætningskommando. CV, søgetekster, promptindhold og formularindhold sendes ikke til Umami.</p><h2>Logning og fair use</h2><p>Jobagenten gemmer ikke søgetekster, MCP-request bodies eller komplette IP-adresser i en adgangslog. Midlertidige, in-memory tællere bruges til at begrænse overdreven automatiseret brug og forsvinder ved genstart. Tekniske containerlogs roteres og indeholder kun drifts- og fejlmeddelelser.</p><h2>Tekniske leverandører</h2><p>Tjenesten hostes hos Hetzner. Simply.com leverer DNS, og Let’s Encrypt leverer TLS-certifikater. Jobnet, Jobindex, Jobdanmark og Akademikernes Jobbank modtager de søgeforespørgsler, der er nødvendige for at levere resultater.</p><h2>Kontakt</h2><p>Spørgsmål kan sendes til <a href="mailto:hello@mikkelkrogsholm.dk">hello@mikkelkrogsholm.dk</a>.</p>`,
  },
  {
    id: "contact",
    route: "/kontakt/",
    source: "web/public/kontakt/index.html",
    title: "Kontakt Mikkel om Jobagenten og AI-samarbejde",
    description: "Kontakt Mikkel Freltoft Krogsholm om Jobagenten, bidrag, fejl, foredrag eller et konkret AI-samarbejde gennem Brokk og Sindre ApS.",
    openGraphTitle: "Kontakt Mikkel · Jobagenten",
    openGraphDescription: "Kontakt skaberen af Jobagenten om værktøjet eller AI-samarbejde.",
    eyebrow: "Kontakt",
    heading: "Skriv til Mikkel",
    bodyHtml: `<p>Har du fundet en fejl, har du en idé til Jobagenten, eller vil du tale om et AI-samarbejde?</p><p><a href="mailto:hello@mikkelkrogsholm.dk">hello@mikkelkrogsholm.dk</a></p><p>Udviklere er også velkomne til at bidrage via <a rel="noopener" href="https://github.com/mikkelkrogsholm/job-agent">GitHub-repositoriet ↗</a>.</p>`,
  },
] as const;
