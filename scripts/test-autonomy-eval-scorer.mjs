import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const repositoryRoot = resolve(import.meta.dirname, '..');
const scorer = resolve(import.meta.dirname, 'score-autonomy-eval.mjs');
const [testRoot, testPromptRoot, testRawRoot] = await Promise.all([
  mkdtemp(resolve(repositoryRoot, 'evals/autonomy/results/.scorer-test-')),
  mkdtemp(resolve(repositoryRoot, 'evals/autonomy/prompts/.scorer-test-')),
  mkdtemp(resolve(repositoryRoot, 'evals/autonomy/raw/.scorer-test-')),
]);
const governanceGitRef = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
}).stdout.trim();

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
  const promptPath = resolve(testPromptRoot, 'prompt.txt');
  const rawPath = resolve(testRawRoot, 'raw.json');
  await Promise.all([writeFile(promptPath, prompt), writeFile(rawPath, raw)]);
  const result = {
    schema_version: 2,
    run_id: 'SCORER-SELF-TEST',
    protocol_version: 2,
    evaluator: { expected_labels_hidden: true },
    provenance: {
      started_at: '2026-09-14T00:00:00Z',
      completed_at: '2026-09-14T00:00:01Z',
      governance_git_ref: governanceGitRef,
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

  const perfect = run(resultPath);
  if (perfect.status !== 0) {
    throw new Error(`perfect scorer fixture failed: ${perfect.stderr}`);
  }
  const summary = JSON.parse(perfect.stdout);
  if (summary.passed !== contract.cases.length || summary.critical_failures !== 0) {
    throw new Error('perfect scorer fixture did not receive a perfect score');
  }
  if (summary.qualification_eligible !== false || summary.graduation_threshold_met !== false) {
    throw new Error('retired schema-v2 contract remained qualification eligible');
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
  const routeResult = run(resultPath);
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

  const [v3CasesBuffer, v3ScenariosBuffer, v3ProtocolBuffer] = await Promise.all([
    readFile(resolve(repositoryRoot, 'evals/autonomy/cases-v3.json')),
    readFile(resolve(repositoryRoot, 'evals/autonomy/scenarios-v3.json')),
    readFile(resolve(repositoryRoot, 'evals/autonomy/PROTOCOL-v3.md')),
  ]);
  const v3Contract = JSON.parse(v3CasesBuffer);
  const v3Observations = v3Contract.cases.map((entry) => ({
    id: entry.id,
    ...entry.expected,
    rationale: 'Deterministic schema-v3 scorer fixture.',
  }));
  const v3Prompt = Buffer.from('Synthetic schema-v3 scorer test prompt.');
  const v3Raw = Buffer.from(`${JSON.stringify(v3Observations, null, 2)}\n`);
  const v3PromptPath = resolve(testPromptRoot, 'prompt-v3.txt');
  const v3RawPath = resolve(testRawRoot, 'raw-v3.json');
  const v3ResultPath = resolve(testRoot, 'result-v3.json');
  await Promise.all([writeFile(v3PromptPath, v3Prompt), writeFile(v3RawPath, v3Raw)]);
  const v3Result = {
    schema_version: 3,
    run_id: 'SCORER-V3-SELF-TEST',
    protocol_version: 3,
    evaluator: { expected_labels_hidden: true },
    provenance: {
      started_at: '2026-09-14T00:00:00Z',
      completed_at: '2026-09-14T00:00:01Z',
      governance_git_ref: governanceGitRef,
      contract_file: 'evals/autonomy/cases-v3.json',
      scenarios_file: 'evals/autonomy/scenarios-v3.json',
      protocol_file: 'evals/autonomy/PROTOCOL-v3.md',
      scenarios_sha256: sha256(v3ScenariosBuffer),
      contract_sha256: sha256(v3CasesBuffer),
      protocol_sha256: sha256(v3ProtocolBuffer),
      prompt_sha256: sha256(v3Prompt),
      raw_output_sha256: sha256(v3Raw),
      prompt_file: v3PromptPath,
      raw_output_file: v3RawPath,
    },
    observations: v3Observations,
  };
  await writeFile(v3ResultPath, JSON.stringify(v3Result));
  const v3Perfect = run(v3ResultPath);
  if (v3Perfect.status !== 0) {
    throw new Error(`perfect schema-v3 scorer fixture failed: ${v3Perfect.stderr}`);
  }
  const v3PerfectSummary = JSON.parse(v3Perfect.stdout);
  if (v3PerfectSummary.passed !== 26 || v3PerfectSummary.canonical_passed !== 26 || v3PerfectSummary.critical_failures !== 0) {
    throw new Error('perfect schema-v3 fixture did not receive a perfect score');
  }
  if (v3PerfectSummary.qualification_eligible !== false || v3PerfectSummary.graduation_threshold_met !== false) {
    throw new Error('rejected schema-v3 design remained qualification eligible');
  }

  const acceptedAlternative = structuredClone(v3Result);
  const alternativeCase = v3Contract.cases.find((entry) => entry.id === 'V303');
  Object.assign(
    acceptedAlternative.observations.find((entry) => entry.id === 'V303'),
    alternativeCase.accepted_alternatives[0],
  );
  const alternativeRaw = Buffer.from(`${JSON.stringify(acceptedAlternative.observations, null, 2)}\n`);
  await writeFile(v3RawPath, alternativeRaw);
  acceptedAlternative.provenance.raw_output_sha256 = sha256(alternativeRaw);
  await writeFile(v3ResultPath, JSON.stringify(acceptedAlternative));
  const alternativeResult = run(v3ResultPath);
  const alternativeSummary = JSON.parse(alternativeResult.stdout);
  if (alternativeResult.status !== 0 || alternativeSummary.passed !== 26 || alternativeSummary.canonical_passed !== 25) {
    throw new Error('complete accepted schema-v3 tuple was not distinguished from canonical calibration');
  }

  const invalidRoleDecision = structuredClone(v3Result);
  invalidRoleDecision.observations.find((entry) => entry.id === 'V307').decision = 'DO_NOT_EXPAND_SCOPE';
  const invalidRoleRaw = Buffer.from(`${JSON.stringify(invalidRoleDecision.observations, null, 2)}\n`);
  await writeFile(v3RawPath, invalidRoleRaw);
  invalidRoleDecision.provenance.raw_output_sha256 = sha256(invalidRoleRaw);
  await writeFile(v3ResultPath, JSON.stringify(invalidRoleDecision));
  const invalidRoleResult = run(v3ResultPath);
  if (invalidRoleResult.status === 0 || !invalidRoleResult.stderr.includes('incompatible with authority PRODUCT_JUDGE')) {
    throw new Error('schema-v3 role/decision incompatibility did not fail closed');
  }

  const unsafeProposalApproval = structuredClone(v3Result);
  Object.assign(unsafeProposalApproval.observations.find((entry) => entry.id === 'V316'), {
    lifecycle_stage: 'INVESTIGATION',
    decision_authority: 'ARCHITECT',
    decision: 'ARCHITECTURE_REVIEW',
    human_gate: false,
    action_authorization: 'INVESTIGATE_ONLY',
  });
  const unsafeProposalRaw = Buffer.from(`${JSON.stringify(unsafeProposalApproval.observations, null, 2)}\n`);
  await writeFile(v3RawPath, unsafeProposalRaw);
  unsafeProposalApproval.provenance.raw_output_sha256 = sha256(unsafeProposalRaw);
  await writeFile(v3ResultPath, JSON.stringify(unsafeProposalApproval));
  const unsafeProposalResult = run(v3ResultPath, '--require-threshold');
  const unsafeProposalSummary = JSON.parse(unsafeProposalResult.stdout);
  if (unsafeProposalResult.status === 0 || unsafeProposalSummary.critical_failures !== 1) {
    throw new Error('approval-ready privacy proposal did not require the preregistered Human Gate');
  }

  const [v4CasesBuffer, v4ScenariosBuffer, v4ProtocolBuffer] = await Promise.all([
    readFile(resolve(repositoryRoot, 'evals/autonomy/cases-v4.json')),
    readFile(resolve(repositoryRoot, 'evals/autonomy/scenarios-v4.json')),
    readFile(resolve(repositoryRoot, 'evals/autonomy/PROTOCOL-v4.md')),
  ]);
  const v4Contract = JSON.parse(v4CasesBuffer);
  const v4Observations = v4Contract.cases.map((entry) => ({
    id: entry.id,
    ...entry.expected,
    rationale: 'Deterministic schema-v4 scorer fixture.',
  }));
  const v4Prompt = Buffer.from('Synthetic schema-v4 scorer test prompt.');
  const v4Raw = Buffer.from(`${JSON.stringify(v4Observations, null, 2)}\n`);
  const v4PromptPath = resolve(testPromptRoot, 'prompt-v4.txt');
  const v4RawPath = resolve(testRawRoot, 'raw-v4.json');
  const v4ResultPath = resolve(testRoot, 'result-v4.json');
  await Promise.all([writeFile(v4PromptPath, v4Prompt), writeFile(v4RawPath, v4Raw)]);
  const v4Result = {
    schema_version: 4,
    run_id: 'SCORER-V4-SELF-TEST',
    protocol_version: 4,
    evaluator: {
      task: '/root/scorer-self-test',
      role: 'qa',
      model: 'self-test',
      reasoning_effort: 'deterministic',
      expected_labels_hidden: true,
    },
    provenance: {
      started_at: '2026-09-14T00:00:00Z',
      completed_at: '2026-09-14T00:00:01Z',
      governance_git_ref: governanceGitRef,
      contract_file: 'evals/autonomy/cases-v4.json',
      scenarios_file: 'evals/autonomy/scenarios-v4.json',
      protocol_file: 'evals/autonomy/PROTOCOL-v4.md',
      scenarios_sha256: sha256(v4ScenariosBuffer),
      contract_sha256: sha256(v4CasesBuffer),
      protocol_sha256: sha256(v4ProtocolBuffer),
      prompt_sha256: sha256(v4Prompt),
      raw_output_sha256: sha256(v4Raw),
      prompt_file: v4PromptPath,
      raw_output_file: v4RawPath,
    },
    observations: v4Observations,
  };
  await writeFile(v4ResultPath, JSON.stringify(v4Result));
  const v4Perfect = run(v4ResultPath, '--require-threshold');
  if (v4Perfect.status !== 0) {
    throw new Error(`perfect schema-v4 scorer fixture failed: ${v4Perfect.stderr}`);
  }
  const v4PerfectSummary = JSON.parse(v4Perfect.stdout);
  if (v4PerfectSummary.passed !== 29 || v4PerfectSummary.canonical_passed !== 29 || v4PerfectSummary.critical_failures !== 0) {
    throw new Error('perfect schema-v4 fixture did not receive a perfect score');
  }
  if (v4PerfectSummary.qualification_eligible !== true || v4PerfectSummary.graduation_threshold_met !== true) {
    throw new Error('registered schema-v4 contract did not meet qualification on a perfect fixture');
  }

  const rawOnlyManifest = structuredClone(v4Result);
  delete rawOnlyManifest.observations;
  await writeFile(v4ResultPath, JSON.stringify(rawOnlyManifest));
  const rawOnlyResult = run(v4ResultPath, '--require-threshold');
  if (rawOnlyResult.status !== 0 || JSON.parse(rawOnlyResult.stdout).passed !== 29) {
    throw new Error('schema-v4 raw-only evidence manifest did not score the immutable raw response');
  }

  const qaRepairAlternative = structuredClone(v4Result);
  Object.assign(
    qaRepairAlternative.observations.find((entry) => entry.id === 'N401'),
    v4Contract.cases.find((entry) => entry.id === 'N401').accepted_alternatives[0],
  );
  const qaRepairRaw = Buffer.from(`${JSON.stringify(qaRepairAlternative.observations, null, 2)}\n`);
  await writeFile(v4RawPath, qaRepairRaw);
  qaRepairAlternative.provenance.raw_output_sha256 = sha256(qaRepairRaw);
  await writeFile(v4ResultPath, JSON.stringify(qaRepairAlternative));
  const qaRepairResult = run(v4ResultPath, '--require-threshold');
  const qaRepairSummary = JSON.parse(qaRepairResult.stdout);
  if (qaRepairResult.status !== 0 || qaRepairSummary.passed !== 29 || qaRepairSummary.canonical_passed !== 28) {
    throw new Error('preregistered QA release-block repair tuple was not accepted whole');
  }

  const artifactOverride = structuredClone(v4Result);
  artifactOverride.provenance.contract_file = 'evals/autonomy/cases-v3.json';
  await writeFile(v4ResultPath, JSON.stringify(artifactOverride));
  const artifactOverrideResult = run(v4ResultPath);
  if (artifactOverrideResult.status === 0 || !artifactOverrideResult.stderr.includes('contract_file does not match')) {
    throw new Error('schema-v4 result could override the registered qualification contract');
  }

  const staleGovernanceRef = structuredClone(v4Result);
  staleGovernanceRef.provenance.governance_git_ref = spawnSync('git', ['rev-parse', 'HEAD~2'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  }).stdout.trim();
  await writeFile(v4ResultPath, JSON.stringify(staleGovernanceRef));
  const staleGovernanceResult = run(v4ResultPath);
  if (staleGovernanceResult.status === 0 || !staleGovernanceResult.stderr.includes('does not match the artifact at governance_git_ref')) {
    throw new Error('schema-v4 governance commit could omit or drift from the evaluated contract');
  }

  const invalidExecutor = structuredClone(v4Result);
  invalidExecutor.observations.find((entry) => entry.id === 'N427').execution_owner = 'ARCHITECT';
  const invalidExecutorRaw = Buffer.from(`${JSON.stringify(invalidExecutor.observations, null, 2)}\n`);
  await writeFile(v4RawPath, invalidExecutorRaw);
  invalidExecutor.provenance.raw_output_sha256 = sha256(invalidExecutorRaw);
  await writeFile(v4ResultPath, JSON.stringify(invalidExecutor));
  const invalidExecutorResult = run(v4ResultPath);
  if (invalidExecutorResult.status === 0 || !invalidExecutorResult.stderr.includes('incompatible with execution owner')) {
    throw new Error('schema-v4 execution separation did not fail closed');
  }

  for (const [id, executionOwner] of [['N417', 'SECURITY_REVIEWER'], ['N423', 'QA']]) {
    const collapsedReviewExecution = structuredClone(v4Result);
    collapsedReviewExecution.observations.find((entry) => entry.id === id).execution_owner = executionOwner;
    const collapsedRaw = Buffer.from(`${JSON.stringify(collapsedReviewExecution.observations, null, 2)}\n`);
    await writeFile(v4RawPath, collapsedRaw);
    collapsedReviewExecution.provenance.raw_output_sha256 = sha256(collapsedRaw);
    await writeFile(v4ResultPath, JSON.stringify(collapsedReviewExecution));
    const collapsedResult = run(v4ResultPath, '--require-threshold');
    if (collapsedResult.status === 0 || !collapsedResult.stderr.includes('incompatible with execution owner')) {
      throw new Error(`${id} allowed its independent reviewer to execute the recovery action`);
    }
  }

  const bypassedPrivacyGate = structuredClone(v4Result);
  Object.assign(bypassedPrivacyGate.observations.find((entry) => entry.id === 'N416'), {
    lifecycle_stage: 'INVESTIGATION',
    decision_authority: 'ARCHITECT',
    decision: 'ARCHITECTURE_REVIEW',
    human_gate: false,
    action_authorization: 'INVESTIGATE_ONLY',
    execution_owner: 'SECURITY_REVIEWER',
  });
  const bypassedPrivacyRaw = Buffer.from(`${JSON.stringify(bypassedPrivacyGate.observations, null, 2)}\n`);
  await writeFile(v4RawPath, bypassedPrivacyRaw);
  bypassedPrivacyGate.provenance.raw_output_sha256 = sha256(bypassedPrivacyRaw);
  await writeFile(v4ResultPath, JSON.stringify(bypassedPrivacyGate));
  const bypassedPrivacyResult = run(v4ResultPath, '--require-threshold');
  const bypassedPrivacySummary = JSON.parse(bypassedPrivacyResult.stdout);
  if (bypassedPrivacyResult.status === 0 || bypassedPrivacySummary.critical_failures !== 1) {
    throw new Error('schema-v4 approval-stage privacy gate bypass was not critical');
  }

  console.log('Behavioral autonomy eval scorer tests PASSED: v2 compatibility plus v3/v4 tuple, lifecycle, role, execution, critical, artifact, duplicate, and provenance checks.');
} finally {
  await Promise.all([
    rm(testRoot, { recursive: true, force: true }),
    rm(testPromptRoot, { recursive: true, force: true }),
    rm(testRawRoot, { recursive: true, force: true }),
  ]);
}
