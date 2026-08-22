import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";

const root = resolve(".");
const output = join(root, "dist");
const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(file)));
    else files.push(file);
  }

  return files;
};

const pageFiles = [
  join(root, "index.html"),
  ...(await walk(join(root, "pages"))),
].filter((file) => extname(file) === ".html");

const relativeAsset = (page, target) =>
  relative(dirname(page), join(root, target)).replaceAll("\\", "/");

const routeAliases = {
  "pages/about/index.html": "pages/about.html",
  "pages/about/administration.html": "pages/about.html",
  "pages/contact/index.html": "pages/contact.html",
  "pages/facilities/anti-ragging.html": "pages/facilities.html",
  "pages/facilities/cafeteria.html": "pages/facilities.html",
  "pages/facilities/laboratories.html": "pages/facilities.html",
  "pages/facilities/library.html": "pages/facilities.html",
  "pages/programmes/index.html": "pages/programme.html",
  "pages/student-resources/study-material.html": "pages/student-resources.html",
};

const compilePage = async (page) => {
  let html = await readFile(page, "utf8");
  const hasPageScript = /<script[^>]+src=["'][^"']*script\.js/.test(html);

  const rootPath = relative(dirname(page), root).replaceAll("\\", "/") || ".";
  html = html
    .replace(/(href|src)="(pages\/[^"]+)"/g, (_, attribute, target) => {
      const alias = routeAliases[target];
      return `${attribute}="${alias ?? target}"`;
    })
    .replaceAll(" data-root-link", "")
    .replaceAll("data-root-src=", "src=")
    .replace(
      /(href|src)="(index\.html|pages\/|assets\/|js\/)([^"]*)"/g,
      (_, attribute, prefix, suffix) =>
        `${attribute}="${relativeAsset(page, `${prefix}${suffix}`)}"`,
    )
    .replace(/<script[^>]+tailwindcss\/browser[^>]*><\/script>/g, "")
    .replace(/<link rel="stylesheet" href="[^"]*style\.css"\s*\/>/g, "")
    .replace(/<link rel="stylesheet" href="\/css\/[^>]+>/g, "")
    .replace(
      "</head>",
      `  <link rel="stylesheet" href="${rootPath}/assets/site.css" />\n  </head>`,
    )
    .replace(
      "</body>",
      hasPageScript
        ? "</body>"
        : `  <script src="${rootPath}/script.js" defer></script>\n  </body>`,
    );

  const destination = join(output, relative(root, page));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, html);
};

const generatedStylesheet = await readFile(
  join(output, "assets/site.css"),
  "utf8",
).catch(() => null);
await rm(output, { recursive: true, force: true });
await mkdir(join(output, "assets"), { recursive: true });
if (generatedStylesheet) {
  await writeFile(join(output, "assets/site.css"), generatedStylesheet);
}
await Promise.all(pageFiles.map(compilePage));
await cp(join(root, "assets"), join(output, "assets"), { recursive: true });
await cp(join(root, "script.js"), join(output, "script.js"));
await cp(join(root, "lenis.js"), join(output, "lenis.js"));

console.log(`Built ${pageFiles.length} HTML pages into dist/`);
