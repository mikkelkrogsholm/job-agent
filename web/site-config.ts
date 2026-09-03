// Add a link here only when its registered route is generated. This prevents a
// partial rollout from advertising a dead destination.
export const PRIMARY_NAVIGATION = [
  { href: "/forloeb/", label: "Find og søg job" },
  { href: "/platforme/", label: "Vælg din AI" },
  { href: "/prompts/", label: "Prompts" },
  { href: "/tryghed/", label: "Tryghed" },
  { href: "/about/", label: "Om" },
] as const;
export const FOOTER_NAVIGATION = [
  { href: "/forloeb/", label: "Find og søg job" },
  { href: "/platforme/", label: "Vælg din AI" },
  { href: "/prompts/", label: "Prompts" },
  { href: "/tryghed/", label: "Tryghed" },
  { href: "/ai/", label: "Til AI-assistenter" },
  { href: "/about/", label: "Om Mikkel" },
  { href: "/privacy/", label: "Privatlivspolitik" },
  { href: "/kontakt/", label: "Kontakt" },
  { href: "https://github.com/mikkelkrogsholm/job-agent", label: "GitHub" },
  { href: "https://mikkelkrogsholm.dk/da/about/", label: "Samarbejd med mig" },
  { href: "/health", label: "Driftsstatus" },
] as const;
export const GUIDE_SAFETY = ["Jobagenten kan kun søge og læse job. Den logger ikke ind og sender ikke ansøgninger.", "Din AI må ikke opfinde erfaring, uddannelse, resultater eller motivation.", "Kontrollér altid den originale annonce, frist og vigtige oplysninger.", "Du gennemgår materialet og sender selv ansøgningen."] as const;
