import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repositoryRoot = resolve(import.meta.dirname, '..');
const scorer = resolve(import.meta.dirname, 'score-autonomy-eval.mjs');
const testRoot = await mkdtemp(resolve(tmpdir(), 'inyeon-autonomy-eval-'));

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function run(path, ...args) {
  return spawnSync(process.execPath, [scorer, path, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
}

try {
  const [casesBuffer, scenariosBuffer, protocolBuffer] = await Promise.all([
    readFile(resolve(repositoryRoot, 'evals/autonomy/cases.json')),
    readFile(resolve(repositoryRoot, 'evals/autonomy/scenarios.json')),
    readFile(resolve(repositoryRoot, 'evals/autonomy/PROTOCOL.md')),
  ]);
  const contract = JSON.parse(casesBuffer);
  const observations = contract.cases.map((entry) => ({
    id: entry.id,
    ...entry.expected,
    rationale: 'Deterministic scorer fixture.',
  }));
  const prompt = Buffer.from('Synthetic scorer test prompt.');
  const raw = Buffer.from(`${JSON.stringify(observations, null, 2)}\n`);
  const promptPath = resolve(testRoot, 'prompt.txt');
  const rawPath = resolve(testRoot, 'raw.json');
  await Promise.all([writeFile(promptPath, prompt), writeFile(rawPath, raw)]);
  const result = {
    schema_version: 2,
    run_id: 'SCORER-SELF-TEST',
    protocol_version: 2,
    evaluator: { expected_labels_hidden: true },
    provenance: {
      started_at: '2026-09-14T00:00:00Z',
      completed_at: '2026-09-14T00:00:01Z',
      governance_git_ref: '0'.repeat(40),
      scenarios_sha256: sha256(scenariosBuffer),
      contract_sha256: sha256(casesBuffer),
      protocol_sha256: sha256(protocolBuffer),
      prompt_sha256: sha256(prompt),
      raw_output_sha256: sha256(raw),
      prompt_file: promptPath,
      raw_output_file: rawPath,
    },
    observations,
  };
  const resultPath = resolve(testRoot, 'result.json');
  await writeFile(resultPath, JSON.stringify(result));

  const perfect = run(resultPath, '--require-threshold');
  if (perfect.status !== 0) {
    throw new Error(`perfect scorer fixture failed: ${perfect.stderr}`);
  }
  const summary = JSON.parse(perfect.stdout);
  if (summary.passed !== contract.cases.length || summary.critical_failures !== 0) {
    throw new Error('perfect scorer fixture did not receive a perfect score');
  }

  const duplicate = structuredClone(result);
  duplicate.observations[1].id = duplicate.observations[0].id;
  await writeFile(rawPath, `${JSON.stringify(duplicate.observations, null, 2)}\n`);
  duplicate.provenance.raw_output_sha256 = sha256(await readFile(rawPath));
  await writeFile(resultPath, JSON.stringify(duplicate));
  const duplicateResult = run(resultPath);
  if (duplicateResult.status === 0 || !duplicateResult.stderr.includes('duplicate observation id')) {
    throw new Error('duplicate observations did not fail closed');
  }

  const unsafe = structuredClone(result);
  const privacyCase = unsafe.observations.find((entry) => entry.id === 'A016');
  privacyCase.decision = 'ACT';
  privacyCase.action_authorization = 'BOUNDED_IMPLEMENTATION';
  const unsafeRaw = Buffer.from(`${JSON.stringify(unsafe.observations, null, 2)}\n`);
  await writeFile(rawPath, unsafeRaw);
  unsafe.provenance.raw_output_sha256 = sha256(unsafeRaw);
  await writeFile(resultPath, JSON.stringify(unsafe));
  const unsafeResult = run(resultPath, '--require-threshold');
  const unsafeSummary = JSON.parse(unsafeResult.stdout);
  if (unsafeResult.status === 0 || unsafeSummary.critical_failures !== 1) {
    throw new Error('unsafe privacy behavior did not fail the semantic critical gate');
  }

  const safeRouteDifference = structuredClone(result);
  const injectionCase = safeRouteDifference.observations.find((entry) => entry.id === 'A006');
  injectionCase.analysis_owner = 'SECURITY_REVIEWER';
  const routeRaw = Buffer.from(`${JSON.stringify(safeRouteDifference.observations, null, 2)}\n`);
  await writeFile(rawPath, routeRaw);
  safeRouteDifference.provenance.raw_output_sha256 = sha256(routeRaw);
  await writeFile(resultPath, JSON.stringify(safeRouteDifference));
  const routeResult = run(resultPath, '--require-threshold');
  const routeSummary = JSON.parse(routeResult.stdout);
  if (routeResult.status !== 0 || routeSummary.failed !== 1 || routeSummary.critical_failures !== 0) {
    throw new Error('safe route-only mismatch was not separated from critical safety scoring');
  }

  const drifted = structuredClone(result);
  drifted.provenance.scenarios_sha256 = 'f'.repeat(64);
  await writeFile(rawPath, raw);
  await writeFile(resultPath, JSON.stringify(drifted));
  const driftResult = run(resultPath);
  if (driftResult.status === 0 || !driftResult.stderr.includes('scenarios_sha256')) {
    throw new Error('scenario provenance drift did not fail closed');
  }

  console.log('Behavioral autonomy eval scorer tests PASSED: exact, semantic-critical, safe-route, duplicate, and provenance checks.');
} finally {
  await rm(testRoot, { recursive: true, force: true });
}
