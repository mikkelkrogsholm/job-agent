import { renderSiteFooter, renderSiteHeader } from "../web/render/site-shell.ts";

const homePath = new URL("../web/index.html", import.meta.url);
const source = await Bun.file(homePath).text();

function replaceComponent(
  html: string,
  component: "header" | "footer",
  rendered: string,
): string {
  const pattern = new RegExp(
    `(<!-- site-${component}:start -->)[\\s\\S]*?(<!-- site-${component}:end -->)`,
  );
  if (!pattern.test(html)) throw new Error(`Forsiden mangler site-${component}-markører`);
  return html.replace(pattern, `$1\n    ${rendered.replaceAll("\n", "\n    ")}\n    $2`);
}

const withHeader = replaceComponent(source, "header", renderSiteHeader("/"));
const generated = replaceComponent(withHeader, "footer", renderSiteFooter());
await Bun.write(homePath, generated);
