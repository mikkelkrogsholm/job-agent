import { FOOTER_NAVIGATION, PRIMARY_NAVIGATION } from "../site-config.ts";

function isActive(route: string, href: string): boolean {
  return route === href || (href !== "/" && route.startsWith(href));
}

export function renderSiteHeader(route: string): string {
  const navigation = PRIMARY_NAVIGATION.map(({ href, label }) =>
    `<a href="${href}"${isActive(route, href) ? ' aria-current="page"' : ""}>${label}</a>`
  ).join("");

  return `<header class="site-header" data-shell-reveal="header">
  <a class="wordmark" href="/" aria-label="Jobagenten, gå til forsiden"><span class="wordmark-mark" aria-hidden="true"><span></span><span></span><span></span></span><span>Jobagenten</span></a>
  <nav class="primary-nav" id="primary-navigation" aria-label="Primær navigation">${navigation}</nav>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation" aria-label="Åbn menu"><span class="nav-toggle-label">Menu</span><span class="nav-toggle-icon" aria-hidden="true"><span></span><span></span></span></button>
  <a class="header-cta" href="/forloeb/">Start dit forløb</a>
</header>`;
}

export function renderSiteFooter(): string {
  const navigation = FOOTER_NAVIGATION.map(({ href, label }) => `<a href="${href}">${label}</a>`).join("");
  return `<footer class="site-footer" data-shell-reveal="footer">
  <a class="wordmark footer-wordmark" href="/"><span class="wordmark-mark" aria-hidden="true"><span></span><span></span><span></span></span><span>Jobagenten</span></a>
  <p>Bygget af Mikkel Freltoft Krogsholm · Søger og læser job, men sender aldrig ansøgninger.</p>
  <div>${navigation}</div>
</footer>`;
}
