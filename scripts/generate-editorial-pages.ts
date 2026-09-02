import { dirname, join } from "node:path";
import { EDITORIAL_PAGES } from "../web/content/editorial-pages.ts";
import { renderEditorialHtml } from "../web/render/editorial.ts";

const root = process.cwd();
for (const page of EDITORIAL_PAGES) {
  const target = join(root, page.source);
  await Bun.write(target, renderEditorialHtml(page));
  if (!(await Bun.file(join(dirname(target), "index.html")).exists())) {
    throw new Error(`Kunne ikke generere ${page.route}`);
  }
}
console.log(`Genererede ${EDITORIAL_PAGES.length} redaktionelle sider`);
