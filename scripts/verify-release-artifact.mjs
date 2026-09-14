import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { basename, extname, relative, resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '..');
const distRoot = process.env.INYEON_DIST_DIR ? resolve(process.env.INYEON_DIST_DIR) : resolve(repositoryRoot, 'apps/web/dist');

const limits = Object.freeze({
  totalBytes: 2 * 1024 * 1024,
  totalGzipBytes: 320 * 1024,
  singleFileBytes: 1024 * 1024,
  mainJavaScriptGzipBytes: 160 * 1024,
  catalogJavaScriptGzipBytes: 120 * 1024,
  fileCount: 32,
});

const allowedLiteralOrigins = new Set([
  'http://www.w3.org',
  'https://creativecommons.org',
  'https://react.dev',
  'https://www.wikidata.org',
]);

const secretPatterns = [
  ['GitHub token', /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,255}/u],
  ['GitHub fine-grained token', /github_pat_[A-Za-z0-9_]{60,255}/u],
  ['OpenAI secret key', /sk-(?:proj-)?[A-Za-z0-9_-]{20,255}/u],
  ['AWS access key', /(?:AKIA|ASIA)[A-Z0-9]{16}/u],
  ['Google API key', /AIza[0-9A-Za-z_-]{35}/u],
  ['Slack token', /xox[baprs]-[A-Za-z0-9-]{20,255}/u],
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u],
];
const credentialBearingUrl = /https?:\/\/[^/@\s"']+:[^/@\s"']+@/u;

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    const stats = await lstat(path);
    if (stats.isSymbolicLink()) throw new Error(`release artifact contains a symbolic link: ${path}`);
    if (stats.isDirectory()) files.push(...await listFiles(path));
    else if (stats.isFile()) files.push(path);
  }
  return files;
}

const files = await listFiles(distRoot);
if (files.length > limits.fileCount) throw new Error(`release artifact has ${files.length} files; budget is ${limits.fileCount}`);

let totalBytes = 0;
let totalGzipBytes = 0;
const origins = new Set();

for (const file of files) {
  if (file.endsWith('.map')) throw new Error(`production source map is not allowed: ${basename(file)}`);
  const contents = await readFile(file);
  const gzipBytes = gzipSync(contents, { level: 9 }).byteLength;
  totalBytes += contents.byteLength;
  totalGzipBytes += gzipBytes;
  if (contents.byteLength > limits.singleFileBytes) {
    throw new Error(`${basename(file)} is ${contents.byteLength} bytes; single-file budget is ${limits.singleFileBytes}`);
  }

  if (['.html', '.js', '.css', '.json'].includes(extname(file))) {
    const text = contents.toString('utf8');
    for (const [label, pattern] of secretPatterns) {
      if (pattern.test(text)) throw new Error(`${label} signature found in ${basename(file)}`);
    }
    if (credentialBearingUrl.test(text)) throw new Error(`credential-bearing URL found in ${basename(file)}`);
    for (const match of text.matchAll(/https?:\/\/[^/\s"'`<>\\)]+/gu)) {
      origins.add(new URL(match[0]).origin);
    }

    if (file.endsWith('.js')) {
      const name = basename(file);
      if (/^index-[A-Za-z0-9_-]+\.js$/u.test(name) && gzipBytes > limits.mainJavaScriptGzipBytes) {
        throw new Error(`${name} gzip size is ${gzipBytes}; main JavaScript budget is ${limits.mainJavaScriptGzipBytes}`);
      }
      if (/^catalog-[A-Za-z0-9_-]+\.js$/u.test(name) && gzipBytes > limits.catalogJavaScriptGzipBytes) {
        throw new Error(`${name} gzip size is ${gzipBytes}; catalog JavaScript budget is ${limits.catalogJavaScriptGzipBytes}`);
      }
    }
  }
}

if (totalBytes > limits.totalBytes) throw new Error(`release artifact is ${totalBytes} bytes; total budget is ${limits.totalBytes}`);
if (totalGzipBytes > limits.totalGzipBytes) throw new Error(`release artifact gzip total is ${totalGzipBytes}; budget is ${limits.totalGzipBytes}`);

const unexpectedOrigins = [...origins].filter((origin) => !allowedLiteralOrigins.has(origin));
if (unexpectedOrigins.length > 0) {
  throw new Error(`unexpected literal external origins in artifact: ${unexpectedOrigins.join(', ')}`);
}

const index = await readFile(resolve(distRoot, 'index.html'), 'utf8');
const decodedIndex = index.replaceAll('&#39;', "'");
const expectedCsp = [
  "default-src 'none'",
  "base-uri 'none'",
  "connect-src 'none'",
  "font-src 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "img-src 'self' data: blob:",
  "manifest-src 'none'",
  "media-src 'none'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "worker-src 'none'",
].join('; ');
if (!index.includes('http-equiv="Content-Security-Policy"')) throw new Error('production index is missing its CSP meta policy');
const actualCsp = decodedIndex.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/u)?.[1];
if (actualCsp !== expectedCsp) throw new Error('production CSP does not match the exact release policy');
if (!index.includes('name="referrer" content="no-referrer"')) throw new Error('production index is missing the no-referrer policy');

const manifest = JSON.parse(await readFile(resolve(distRoot, 'release-manifest.json'), 'utf8'));
if (manifest.schemaVersion !== 1 || manifest.product !== 'INYEON Korean Compatibility Lab' || manifest.release !== 'v0.1.0' || manifest.basePath !== '/inyeon/' || !/^(?:local|[0-9a-f]{40})$/u.test(manifest.sourceSha) || !Array.isArray(manifest.artifactFiles)) {
  throw new Error('release manifest does not match the v1 Pages artifact contract');
}

const manifestEntries = new Map(manifest.artifactFiles.map((entry) => [entry.path, entry]));
const artifactFiles = files.filter((file) => basename(file) !== 'release-manifest.json');
if (manifestEntries.size !== artifactFiles.length) throw new Error('release manifest file count does not match the artifact');
for (const file of artifactFiles) {
  const contents = await readFile(file);
  const path = relative(distRoot, file).replaceAll('\\', '/');
  const entry = manifestEntries.get(path);
  const sha256 = createHash('sha256').update(contents).digest('hex');
  if (!entry || entry.bytes !== contents.byteLength || entry.sha256 !== sha256) {
    throw new Error(`release manifest digest mismatch for ${path}`);
  }
}

console.log(`Release artifact verification PASSED: ${files.length} files, ${totalBytes} bytes (${totalGzipBytes} gzip bytes), ${origins.size} allowlisted literal origins.`);
console.log('Secret/origin scanning is a defense-in-depth signature check; CSP and behavioral privacy tests remain authoritative runtime controls.');
