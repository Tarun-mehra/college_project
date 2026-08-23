import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
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

const findElementEnd = (html, start) => {
  const openingTag = html.slice(start).match(/^<(div|nav|header)\b[^>]*>/);
  if (!openingTag) return -1;

  const tagName = openingTag[1];
  const tagPattern = new RegExp(`<!--[^]*?-->|</?${tagName}\\b[^>]*>`, "g");
  tagPattern.lastIndex = start;
  let depth = 0;
  let match;

  while ((match = tagPattern.exec(html))) {
    if (match[0].startsWith("<!--")) continue;
    if (match[0].startsWith(`</${tagName}`)) {
      depth -= 1;
      if (depth === 0) return tagPattern.lastIndex;
    } else if (!match[0].endsWith("/>") && !match[0].startsWith("<!--")) {
      depth += 1;
    }
  }

  return -1;
};

const navigationStartPatterns = [
  /<div id="nav"/,
  /<div id="about-page-nav"/,
  /<div id="main-nav"/,
  /<nav class="site-nav"/,
  /<header class="site-page-header"/,
];

const replaceNavigation = (html, navigation) => {
  const bodyStart = html.indexOf("<body");
  const contentStart = html.indexOf(">", bodyStart) + 1;
  const matches = navigationStartPatterns
    .map((pattern) => {
      const match = html.slice(contentStart).match(pattern);
      return match ? contentStart + match.index : -1;
    })
    .filter((index) => index >= 0);
  const firstElement = Math.min(...matches);
  const end = findElementEnd(html, firstElement);
  if (bodyStart < 0 || firstElement < 0 || end < 0) return html;
  return html.slice(0, firstElement) + navigation + html.slice(end);
};

const navigation = await readFile(join(root, "components/navbar.html"), "utf8");

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

const imageDimensions = async (source) => {
  try {
    const buffer = await readFile(source);
    const svg = buffer.toString("utf8").match(/<svg\b[^>]*\bviewBox="[^"]*"[^>]*>/i)?.[0];
    if (svg) {
      const [, width, height] = svg.match(/viewBox="\s*[^\s]+\s+[^\s]+\s+([\d.]+)\s+([\d.]+)/i) || [];
      if (width && height) return { width, height };
    }
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }

    if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xc3) {
        return {
          width: buffer.readUInt16BE(offset + 7),
          height: buffer.readUInt16BE(offset + 5),
        };
      }
      offset += 2 + length;
    }
  } catch {}
  return null;
};

const normalizeImages = async (html, page) => {
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)];
  const dimensions = new Map();
  await Promise.all(
    imageTags.map(async ([tag]) => {
      const source = tag.match(/\bsrc="([^"]+)"/i)?.[1];
      if (!source || /^(?:https?:|data:|#)/i.test(source)) return;
      const file = join(dirname(page), source);
      if (!(await stat(file).catch(() => null))) return;
      const size = await imageDimensions(file);
      if (size) dimensions.set(tag, size);
    }),
  );

  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const isHero = /hero|preloader/i.test(tag) || /hero-poster/i.test(tag);
    const size = dimensions.get(tag) || (/(?:logo|icon)/i.test(tag)
      ? { width: 64, height: 64 }
      : { width: 800, height: 600 });
    let normalized = tag;
    const addAttribute = (value, attribute) =>
      value.replace(/\s*\/?>(\s*)$/, ` ${attribute}$&`);
    if (size) {
      if (!/\bwidth=/i.test(normalized)) normalized = addAttribute(normalized, `width="${size.width}"`);
      if (!/\bheight=/i.test(normalized)) normalized = addAttribute(normalized, `height="${size.height}"`);
    }
    if (!isHero && !/\bloading=/i.test(normalized)) normalized = addAttribute(normalized, 'loading="lazy"');
    if (!/\bdecoding=/i.test(normalized)) normalized = addAttribute(normalized, 'decoding="async"');
    return normalized;
  });
};

const normalizeHeadResources = (html) => {
  const externalHosts = [...html.matchAll(/(?:src|href)="https:\/\/([^/"\s]+)/gi)]
    .map(([, host]) => host)
    .filter((host, index, hosts) => hosts.indexOf(host) === index);
  const preconnects = externalHosts
    .filter((host) => !html.includes(`rel="preconnect" href="https://${host}"`))
    .map((host) => `    <link rel="preconnect" href="https://${host}" crossorigin />`)
    .join("\n");
  return html
    .replace(/<script\b(?=[^>]*\bsrc=)(?![^>]*\bdefer\b)([^>]*)>/gi, "<script defer$1>")
    .replace("</head>", `${preconnects}${preconnects ? "\n" : ""}  </head>`);
};

const compilePage = async (page) => {
  let html = await readFile(page, "utf8");
  const hasPageScript = /<script[^>]+src=["'][^"']*script\.js/.test(html);

  html = replaceNavigation(html, navigation);

  const rootPath = relative(dirname(page), root).replaceAll("\\", "/") || ".";
  html = html
    .replace(
      /(href|src)="\/(index\.html|pages\/|assets\/|js\/|docs\/)([^"]*)"/g,
      (_, attribute, prefix, suffix) =>
        `${attribute}="${relativeAsset(page, `${prefix}${suffix}`)}"`,
    )
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

  html = normalizeHeadResources(await normalizeImages(html, page));
  if (page === join(root, "index.html") && !html.includes("hero-poster.jpg")) {
    html = html.replace(
      "</head>",
      `    <link rel="preload" as="image" href="assets/images/hero-poster.jpg" fetchpriority="high" />\n  </head>`,
    );
  }

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
await cp(join(root, "docs"), join(output, "docs"), { recursive: true });
await cp(join(root, "js"), join(output, "js"), { recursive: true });
await cp(join(root, "script.js"), join(output, "script.js"));
await cp(join(root, "lenis.js"), join(output, "lenis.js"));

console.log(`Built ${pageFiles.length} HTML pages into dist/`);
