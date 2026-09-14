import { appendFile, cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repositoryRoot = resolve(import.meta.dirname, '..');
const sourceDist = resolve(repositoryRoot, 'apps/web/dist');
const verifier = resolve(import.meta.dirname, 'verify-release-artifact.mjs');
const testRoot = await mkdtemp(resolve(tmpdir(), 'inyeon-release-verifier-'));

async function expectRejected(name, mutate, expectedMessage) {
  const dist = resolve(testRoot, name);
  await cp(sourceDist, dist, { recursive: true });
  await mutate(dist);
  const result = spawnSync(process.execPath, [verifier], {
    encoding: 'utf8',
    env: { ...process.env, INYEON_DIST_DIR: dist },
  });
  const output = `${result.stdout}\n${result.stderr}`;
  if (result.status === 0 || !output.includes(expectedMessage)) {
    throw new Error(`${name} did not fail closed with ${expectedMessage}`);
  }
}

try {
  await expectRejected('secret', async (dist) => {
    const asset = (await readdir(resolve(dist, 'assets'))).find((name) => name.endsWith('.js'));
    await appendFile(resolve(dist, 'assets', asset), 'ghp_abcdefghijklmnopqrstuvwxyzABCDEFGHIJ');
  }, 'GitHub token signature');

  await expectRejected('origin', async (dist) => {
    const asset = (await readdir(resolve(dist, 'assets'))).find((name) => name.endsWith('.js'));
    await appendFile(resolve(dist, 'assets', asset), 'https://unexpected.example');
  }, 'unexpected literal external origins');

  await expectRejected('origin-userinfo', async (dist) => {
    const asset = (await readdir(resolve(dist, 'assets'))).find((name) => name.endsWith('.js'));
    await appendFile(resolve(dist, 'assets', asset), 'https://www.wikidata.org@evil.example/private');
  }, 'unexpected literal external origins');

  await expectRejected('origin-port', async (dist) => {
    const asset = (await readdir(resolve(dist, 'assets'))).find((name) => name.endsWith('.js'));
    await appendFile(resolve(dist, 'assets', asset), 'https://www.wikidata.org:4444/private');
  }, 'unexpected literal external origins');

  await expectRejected('csp', async (dist) => {
    const path = resolve(dist, 'index.html');
    const html = await readFile(path, 'utf8');
    await writeFile(path, html.replace('Content-Security-Policy', 'Removed-Security-Policy'));
  }, 'missing its CSP');

  await expectRejected('weakened-csp', async (dist) => {
    const path = resolve(dist, 'index.html');
    const html = await readFile(path, 'utf8');
    await writeFile(path, html.replace('img-src &#39;self&#39; data: blob:', 'img-src * data: blob:'));
  }, 'does not match the exact release policy');

  await expectRejected('digest', async (dist) => {
    const asset = (await readdir(resolve(dist, 'assets'))).find((name) => /^index-.*\.js$/u.test(name));
    await appendFile(resolve(dist, 'assets', asset), '/* artifact drift */');
  }, 'release manifest digest mismatch');

  await expectRejected('budget', async (dist) => {
    const asset = (await readdir(resolve(dist, 'assets'))).find((name) => name.endsWith('.css'));
    await appendFile(resolve(dist, 'assets', asset), 'a'.repeat(1024 * 1024));
  }, 'single-file budget');

  console.log('Release artifact verifier fault injection PASSED: secret, parsed-origin, exact-CSP, digest, and size regressions fail closed.');
} finally {
  await rm(testRoot, { recursive: true, force: true });
}
