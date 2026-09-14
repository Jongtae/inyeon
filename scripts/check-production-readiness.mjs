import { readFile } from 'node:fs/promises';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

const adapter = await readJson('../packages/saju-adapter/data/capabilities.v1.json');
const corpus = await readJson('../packages/saju-golden-corpus/data/golden-chart-corpus.v1.json');
const approvals = await readJson('../packages/saju-golden-corpus/data/golden-chart-approvals.v1.json');

const checks = [
  ['adapter production eligibility', adapter.productionEligible === true],
  ['chart calculation validation', adapter.chartCalculation?.productionValidated === true],
  ['derived-feature validation', adapter.derivedFeatures?.productionValidated === true],
  ['golden-corpus capability validation', adapter.goldenCorpus?.productionValidated === true && adapter.goldenCorpus?.productionEligible === true],
  ['at least 200 candidate regression fixtures', Number(adapter.goldenCorpus?.positiveFixtureCount) >= 200 && Number(corpus.coverage?.positiveFixtureCount) >= 200],
  ['approved exact-property anchors', Number(adapter.goldenCorpus?.approvedExpectedCount) > 0 && approvals.approvedExpected?.length === adapter.goldenCorpus?.approvedExpectedCount],
  ['approved expectations production validation', approvals.productionValidated === true && approvals.productionEligible === true],
  ['corpus production validation', corpus.productionValidated === true && corpus.productionEligible === true],
];

const blocked = checks.filter(([, passed]) => !passed).map(([label]) => label);
if (blocked.length > 0) {
  throw new Error(`Public production deployment is blocked by repository governance: ${blocked.join('; ')}`);
}

console.log(`Production readiness PASSED: ${corpus.coverage.positiveFixtureCount} fixtures and ${approvals.approvedExpected.length} approved exact-property anchors.`);
