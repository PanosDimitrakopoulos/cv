// Builds downloads/<Name>_CV.pdf and downloads/<Name>_CV.docx from cv.yaml
// Usage: node scripts/build-cv.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { chromium } from 'playwright';
import {
  Document, Packer, Paragraph, TextRun, AlignmentType, LevelFormat, BorderStyle,
  TabStopType, ExternalHyperlink,
} from 'docx';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'downloads');
const cv = yaml.load(fs.readFileSync(path.join(ROOT, 'cv.yaml'), 'utf8'));
const baseName = `${cv.personal.name.replace(/\s+/g, '_')}_CV`;
fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------- PDF
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.yaml': 'text/yaml',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, () => r(server)));
}

async function buildPdf() {
  const server = await serve();
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage();
  // Serve js-yaml locally instead of the CDN, so the build never depends on it
  await page.route('**/js-yaml.min.js', r => r.fulfill({
    path: path.join(ROOT, 'node_modules/js-yaml/dist/js-yaml.min.js'), contentType: 'text/javascript' }));
  await page.goto(`http://localhost:${server.address().port}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#cv-loading', { state: 'hidden' }).catch(() => {});
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: path.join(OUT_DIR, `${baseName}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  server.close();
}

// ---------------------------------------------------------------- DOCX
const FONT = 'Arial';
const ACCENT = '1F3A68';
const t = (text, o = {}) => new TextRun({ text, font: FONT, size: 20, ...o });

const heading = text => new Paragraph({
  spacing: { before: 240, after: 80 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
  children: [t(text.toUpperCase(), { bold: true, size: 22, color: ACCENT })],
});
const bullet = text => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 40 }, children: [t(text)] });
const rightTab = [{ type: TabStopType.RIGHT, position: 10466 }]; // A4 width minus margins
const lineWithDates = (left, dates, o = {}) => new Paragraph({
  tabStops: rightTab, spacing: { before: o.before ?? 160, after: 20 }, keepNext: true,
  children: [t(left, { bold: true, size: 21 }), t(`\t${dates}`, { size: 20 })],
});

function contactParagraph(c, loc) {
  const parts = [];
  const link = (label, url) => new ExternalHyperlink({ link: url, children: [t(label, { size: 19, color: ACCENT })] });
  if (c.email) parts.push(link(c.email, `mailto:${c.email}`));
  if (c.mobile) parts.push(t(c.mobile, { size: 19 }));
  for (const k of ['linkedin', 'github', 'portfolio']) if (c[k]) parts.push(link(c[k].label, c[k].url));
  if (loc) parts.push(t(loc, { size: 19 }));
  const children = [];
  parts.forEach((p, i) => { if (i) children.push(t('  |  ', { size: 19, color: '888888' })); children.push(p); });
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children });
}

async function buildDocx() {
  const p = cv.personal;
  const body = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [t(p.name, { bold: true, size: 36 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [t(p.title, { size: 22, color: ACCENT })] }),
    contactParagraph(cv.contact, p.location),
  ];

  if (cv.about) body.push(heading('Summary'), new Paragraph({ spacing: { after: 60 }, children: [t(cv.about.trim().replace(/\s+/g, ' '))] }));

  body.push(heading('Experience'));
  cv.experience.forEach((job, i) => {
    body.push(lineWithDates(job.title, job.dates, { before: i ? 180 : 60 }));
    body.push(new Paragraph({ spacing: { after: 60 }, keepNext: true, children: [t(`${job.company}  ·  ${job.location}`, { italics: true, color: '444444' })] }));
    for (const c of job.clients || []) {
      body.push(new Paragraph({ tabStops: rightTab, spacing: { after: 20 }, keepNext: true,
        children: [t(c.name, { bold: true, size: 19 }), t(`\t${c.dates}`, { size: 19, color: '444444' })] }));
    }
    (job.bullets || []).forEach(b => body.push(bullet(b)));
  });

  body.push(heading('Education'));
  for (const e of cv.education || []) {
    body.push(lineWithDates(e.degree, e.dates, { before: 60 }));
    body.push(new Paragraph({ spacing: { after: 20 }, children: [t(e.school, { italics: true, color: '444444' })] }));
    if (e.note) body.push(new Paragraph({ spacing: { after: 40 }, children: [t(e.note)] }));
  }

  body.push(heading('Certifications'));
  (cv.certifications || []).forEach(c => body.push(bullet(c)));

  body.push(heading('Skills'));
  for (const s of cv.skills || []) {
    body.push(new Paragraph({ spacing: { after: 40 }, children: [t(`${s.category}: `, { bold: true }), t(s.items.join(', '))] }));
  }

  body.push(heading('Languages'));
  body.push(new Paragraph({ children: [t((cv.languages || []).join('  |  '))] }));

  const doc = new Document({
    creator: p.name, title: `${p.name} - CV`,
    styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022',
      alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } }] }] },
    sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: body }],
  });
  fs.writeFileSync(path.join(OUT_DIR, `${baseName}.docx`), await Packer.toBuffer(doc));
}

await Promise.all([buildPdf(), buildDocx()]);
console.log(`Built downloads/${baseName}.pdf and downloads/${baseName}.docx`);
