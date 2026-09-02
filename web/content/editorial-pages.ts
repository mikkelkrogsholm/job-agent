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
    description: "Læs hvilke oplysninger Jobagenten bruger, når du besøger siden eller søger job, og hvordan tjenesten fungerer uden login eller konto.",
    openGraphTitle: "Privatliv og databehandling · Jobagenten",
    openGraphDescription: "Sådan beskytter Jobagenten dit privatliv uden login eller konto.",
    eyebrow: "Senest opdateret 2. september 2026",
    heading: "Privatliv",
    bodyHtml: `<p>Jobagenten er gratis og kræver ingen konto. Tjenesten beder ikke om dit navn, din e-mail, dit CV eller login til en jobportal.</p><h2>Når du søger job</h2><p>Jobagenten modtager de søgeord og filtre, du skriver, og sender dem videre til de valgte jobportalers offentlige søgninger. Skriv derfor ikke CPR-nummer, helbredsoplysninger eller andre følsomme oplysninger i din søgning.</p><h2>Besøgsstatistik</h2><p>Vi bruger vores egen Umami-løsning til at se, hvilke sider og guides der bliver brugt. Den sætter ikke cookies. Statistikken viser blandt andet sidevisninger, enhedstype, hvilken side besøget kom fra, og om en guide eller kopiknap blev brugt. CV, søgetekster og indholdet af beskeder sendes ikke til Umami.</p><h2>Drift og beskyttelse mod overforbrug</h2><p>Jobagenten gemmer ikke dine søgetekster eller komplette IP-adresser i en besøgslog. Korte, midlertidige tællere begrænser meget stor automatisk brug. De bruges kun til at holde tjenesten stabil og forsvinder ved genstart. Driftslogs indeholder kun tekniske fejl og statusbeskeder.</p><h2>Leverandører</h2><p>Tjenesten hostes hos Hetzner. Simply.com håndterer domænet, og Let’s Encrypt leverer sikker HTTPS-forbindelse. Jobnet, Jobindex, Jobdanmark og Akademikernes Jobbank modtager de søgeord, der er nødvendige for at vise resultater.</p><h2>Kontakt</h2><p>Spørgsmål kan sendes til <a href="mailto:hello@mikkelkrogsholm.dk">hello@mikkelkrogsholm.dk</a>.</p>`,
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
