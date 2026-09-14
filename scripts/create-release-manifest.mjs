import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '..');
const distRoot = resolve(repositoryRoot, 'apps/web/dist');
const manifestPath = resolve(distRoot, 'release-manifest.json');

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else if (entry.isFile() && path !== manifestPath) files.push(path);
    else if (entry.isSymbolicLink()) throw new Error(`release artifact cannot contain a symbolic link: ${entry.name}`);
  }
  return files;
}

const sourceSha = process.env.INYEON_RELEASE_SHA ?? process.env.GITHUB_SHA ?? 'local';
if (sourceSha !== 'local' && !/^[0-9a-f]{40}$/u.test(sourceSha)) {
  throw new Error('INYEON_RELEASE_SHA/GITHUB_SHA must be a full lowercase Git commit SHA');
}

const files = await listFiles(distRoot);
const artifactFiles = [];
for (const file of files.sort()) {
  const contents = await readFile(file);
  artifactFiles.push({
    path: relative(distRoot, file).replaceAll('\\', '/'),
    bytes: contents.byteLength,
    sha256: createHash('sha256').update(contents).digest('hex'),
  });
}

const manifest = {
  schemaVersion: 1,
  product: 'INYEON Korean Compatibility Lab',
  release: 'v0.1.0',
  sourceSha,
  basePath: '/inyeon/',
  artifactFiles,
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Release manifest created for ${sourceSha}: ${artifactFiles.length} files.`);
