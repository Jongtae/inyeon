import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { evaluateCompatibilityPair } from '@inyeon/compatibility-rules';
import { inyeonSajuAdapter } from '@inyeon/saju-adapter';
import { deriveChartFeatures } from '@inyeon/saju-derived-features';
import {
  generateSyntheticCharacter,
  generateSyntheticReferenceSubject,
  SYNTHETIC_AVATAR_MOTIFS,
  SYNTHETIC_AVATAR_PALETTES,
  SYNTHETIC_GENERATOR_PROFILE,
  SYNTHETIC_SCENARIO_PROMPTS,
} from '../dist/index.js';

const profilePath = fileURLToPath(new URL('../data/synthetic-generator-profile.v1.json', import.meta.url));
const reportPath = fileURLToPath(new URL('../data/synthetic-coverage.v1.json', import.meta.url));
const manifestPath = fileURLToPath(new URL('../data/synthetic-character-manifest.v1.json', import.meta.url));
const releaseLockPath = fileURLToPath(new URL('../source/synthetic-release-lock.v1.json', import.meta.url));
const check = process.argv.includes('--check');
const outputBudgets = { profile: 65_536, report: 262_144, manifest: 16_384 };
const forbiddenKeys = new Set([
  'userId', 'accountId', 'datingProfileId', 'like', 'match', 'message', 'distance', 'online', 'activity',
  'inboundInterest', 'endorsement', 'gender', 'race', 'ethnicity', 'nationality', 'bodyType', 'sexualOrientation',
]);
const forbiddenKeyStem = /(user|account|member|datingprofile|profileid|like|match|message|distance|online|activity|availability|inbound|endorsement|testimonial|sex|pronoun|orientation|gender|race|ethnic|nationality|body|health|wealth|occupation|relationship|location|city)/u;
const unsafeText = /[\p{Cc}\p{Cf}<>]|https?:\/\//iu;
const topLevelKeys = [
  'kind', 'id', 'recordVersion', 'dataVersion', 'generatorVersion', 'seedIndex', 'displayName', 'fictional',
  'avatar', 'scenarioPrompts', 'promptProvenance', 'birthFixture', 'pipelineVersions', 'productionEligible',
];
const releaseLockBytes = readFileSync(releaseLockPath);
const releaseLock = JSON.parse(releaseLockBytes.toString('utf8'));

function hasExactKeys(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function assertContextShape(context) {
  const base = ['calendarKind', 'timeZone', 'profileVersion', 'timezoneDataVersion', 'referenceDataVersion', 'temporalSupport'];
  if (context.temporalSupport === 'exact') return hasExactKeys(context, [...base, 'localDate', 'localTime']);
  if (context.temporalSupport === 'date-only' || context.temporalSupport === 'unknown') {
    return hasExactKeys(context, [...base, 'localDate']);
  }
  if (context.temporalSupport === 'approximate') {
    return hasExactKeys(context, [...base, 'window'])
      && hasExactKeys(context.window, ['startLocalDateTime', 'endLocalDateTime']);
  }
  if (context.temporalSupport === 'disputed') {
    return hasExactKeys(context, [...base, 'windows']) && Array.isArray(context.windows)
      && context.windows.length === 2
      && context.windows.every((window) => hasExactKeys(window, ['startLocalDateTime', 'endLocalDateTime']));
  }
  return false;
}

function assertSyntheticRecordShape(record) {
  if (!hasExactKeys(record, topLevelKeys)
    || !hasExactKeys(record.fictional, ['status', 'disclosureVersion', 'shortDisclosure'])
    || !hasExactKeys(record.avatar, ['kind', 'motifId', 'motifLabel', 'paletteId', 'alt'])
    || !Array.isArray(record.scenarioPrompts) || record.scenarioPrompts.length !== 2
    || !record.scenarioPrompts.every((prompt) => hasExactKeys(prompt, ['id', 'label']))
    || !hasExactKeys(record.promptProvenance, ['distributionVersion', 'chartDerived', 'populationClaim'])
    || !hasExactKeys(record.birthFixture, ['origin', 'context']) || !assertContextShape(record.birthFixture.context)
    || !hasExactKeys(record.pipelineVersions, [
      'profileVersion', 'adapterVersion', 'derivedFeatureVersion', 'compatibilitySnapshotVersion',
      'evidenceAvailabilityVersion', 'ruleSetVersion', 'taxonomyVersion',
    ])) throw new Error(`Synthetic record violates the exact allowlisted schema: ${record?.id ?? 'unknown'}`);
}

function stable(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function increment(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function sortedCounts(map) {
  return Object.fromEntries([...map.entries()].sort(([left], [right]) => left.localeCompare(right, 'en')));
}

function rejectForbiddenKeys(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const normalizedKey = key.normalize('NFKC').replace(/[^A-Za-z]/gu, '').toLowerCase();
    if (forbiddenKeys.has(key) || (key !== 'evidenceAvailabilityVersion' && forbiddenKeyStem.test(normalizedKey))) {
      throw new Error(`Forbidden synthetic-character field: ${key}`);
    }
    rejectForbiddenKeys(child);
  }
}

function rejectUnsafeStrings(value) {
  if (typeof value === 'string') {
    if (value.length > 240 || unsafeText.test(value)) throw new Error('Unsafe synthetic-character text value');
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const child of Object.values(value)) rejectUnsafeStrings(child);
}

function writeOrCheck(path, content) {
  if (Buffer.byteLength(content) > ({
    [profilePath]: outputBudgets.profile,
    [reportPath]: outputBudgets.report,
    [manifestPath]: outputBudgets.manifest,
  })[path]) throw new Error(`Generated synthetic artifact exceeds its static byte budget: ${path}`);
  if (check) {
    if (readFileSync(path, 'utf8') !== content) throw new Error(`Generated artifact drift: ${path}`);
  } else writeFileSync(path, content);
}

if (!hasExactKeys(releaseLock, [
  'schemaVersion', 'lockVersion', 'dataVersion', 'generatorVersion', 'algorithm', 'profileSha256',
  'inventorySha256', 'changePolicy',
]) || releaseLock.schemaVersion !== 1 || releaseLock.lockVersion !== 'synthetic-release-lock-v1'
  || releaseLock.dataVersion !== SYNTHETIC_GENERATOR_PROFILE.dataVersion
  || releaseLock.generatorVersion !== SYNTHETIC_GENERATOR_PROFILE.generatorVersion
  || releaseLock.algorithm !== SYNTHETIC_GENERATOR_PROFILE.algorithm
  || !/^[a-f0-9]{64}$/u.test(releaseLock.profileSha256)
  || !/^[a-f0-9]{64}$/u.test(releaseLock.inventorySha256)) {
  throw new Error('Invalid synthetic release lock');
}

function contextDates(context) {
  if ('localDate' in context) return [context.localDate];
  if ('window' in context) return [context.window.startLocalDateTime.slice(0, 10), context.window.endLocalDateTime.slice(0, 10)];
  return context.windows.flatMap((window) => [
    window.startLocalDateTime.slice(0, 10), window.endLocalDateTime.slice(0, 10),
  ]);
}

const birthRange = SYNTHETIC_GENERATOR_PROFILE.birthFixtureDateRange;
const adultReference = new Date(`${birthRange.adultReferenceDate}T00:00:00.000Z`);
const adultCutoff = new Date(Date.UTC(
  adultReference.getUTCFullYear() - birthRange.minimumAgeYears,
  adultReference.getUTCMonth(),
  adultReference.getUTCDate(),
)).toISOString().slice(0, 10);
if (birthRange.endInclusive > adultCutoff) throw new Error('Synthetic birth-fixture profile violates its pinned adult boundary');

const inventoryHash = createHash('sha256');
const ids = new Set();
const names = new Set();
const contexts = new Set();
const contentFingerprints = new Set();
const temporalCounts = new Map();
const timeZoneCounts = new Map();
const motifCounts = new Map();
const paletteCounts = new Map();
const promptCounts = new Map();
const dayMasterCounts = new Map();
const promptByDayMasterCounts = new Map();
const visibleBranchCounts = new Map();
const visibleElementCounts = new Map();
const representativeIds = new Map();
let pipelineValidatedCount = 0;

for (let seedIndex = 0; seedIndex < SYNTHETIC_GENERATOR_PROFILE.recordCount; seedIndex += 1) {
  const record = generateSyntheticCharacter(seedIndex);
  const referenceSubject = generateSyntheticReferenceSubject(seedIndex);
  assertSyntheticRecordShape(record);
  rejectForbiddenKeys(record);
  rejectUnsafeStrings(record);
  if (contextDates(record.birthFixture.context).some((date) => date < birthRange.start || date > birthRange.endInclusive)) {
    throw new Error(`Synthetic birth fixture escaped the pinned date range: ${record.id}`);
  }
  if (record.kind !== 'synthetic' || record.seedIndex !== seedIndex || record.fictional.status !== 'fictional'
    || referenceSubject.kind !== record.kind || referenceSubject.id !== record.id
    || referenceSubject.fictional.status !== 'fictional' || !Object.isFrozen(referenceSubject)
    || record.productionEligible !== false || ids.has(record.id) || names.has(record.displayName)) {
    throw new Error(`Synthetic entity boundary failed for seed ${seedIndex}`);
  }
  ids.add(record.id);
  names.add(record.displayName);
  contexts.add(JSON.stringify(record.birthFixture.context));
  contentFingerprints.add(JSON.stringify({
    avatar: record.avatar,
    scenarioPrompts: record.scenarioPrompts,
    birthFixture: record.birthFixture,
  }));
  inventoryHash.update(`${JSON.stringify(record)}\n`);
  increment(temporalCounts, record.birthFixture.context.temporalSupport);
  increment(timeZoneCounts, record.birthFixture.context.timeZone);
  increment(motifCounts, record.avatar.motifId);
  increment(paletteCounts, record.avatar.paletteId);
  for (const prompt of record.scenarioPrompts) increment(promptCounts, prompt.id);
  if (!representativeIds.has(record.birthFixture.context.temporalSupport)) {
    representativeIds.set(record.birthFixture.context.temporalSupport, record.id);
  }

  const chart = inyeonSajuAdapter.calculateChart(referenceSubject.chartContext);
  if (chart.status === 'error') throw new Error(`Pinned chart pipeline rejected ${record.id}: ${chart.error.code}`);
  const derived = deriveChartFeatures(chart);
  if (derived.status === 'error') throw new Error(`Pinned derived-feature pipeline rejected ${record.id}`);
  if (derived.stable.dayMaster.support === 'invariant') {
    const dayMasterId = derived.stable.dayMaster.value.id;
    increment(dayMasterCounts, dayMasterId);
    for (const prompt of record.scenarioPrompts) increment(promptByDayMasterCounts, `${dayMasterId}|${prompt.id}`);
  }
  for (const variant of derived.variants) {
    for (const pillar of Object.values(variant.positions)) {
      increment(visibleBranchCounts, pillar.branch.id);
      increment(visibleElementCounts, pillar.stem.element.id);
      increment(visibleElementCounts, pillar.branch.element.id);
    }
  }
  const compatibility = evaluateCompatibilityPair(derived, derived);
  if (compatibility.status !== 'ok' || compatibility.snapshot.evidenceSummary.state !== 'no-approved-evidence'
    || compatibility.snapshot.productionEligible !== false
    || chart.provenance.profileVersion !== record.pipelineVersions.profileVersion
    || chart.provenance.adapterVersion !== record.pipelineVersions.adapterVersion
    || derived.provenance.derivedFeatureVersion !== record.pipelineVersions.derivedFeatureVersion
    || compatibility.snapshot.snapshotVersion !== record.pipelineVersions.compatibilitySnapshotVersion
    || compatibility.snapshot.evidenceModelVersion !== record.pipelineVersions.evidenceAvailabilityVersion
    || compatibility.snapshot.ruleSetVersion !== record.pipelineVersions.ruleSetVersion
    || compatibility.snapshot.taxonomyVersion !== record.pipelineVersions.taxonomyVersion
    || compatibility.snapshot.derivedFeatureVersion !== record.pipelineVersions.derivedFeatureVersion) {
    throw new Error(`Candidate compatibility boundary failed for ${record.id}`);
  }
  pipelineValidatedCount += 1;
}

if (contentFingerprints.size !== SYNTHETIC_GENERATOR_PROFILE.recordCount) {
  throw new Error('Duplicate synthetic content fingerprint detected');
}
for (const [support, expectedCount] of Object.entries(SYNTHETIC_GENERATOR_PROFILE.temporalAllocation)) {
  if (temporalCounts.get(support) !== expectedCount) throw new Error(`Synthetic temporal allocation drift: ${support}`);
}
if (dayMasterCounts.size !== 10 || [...dayMasterCounts.values()].some((count) => count < 500)
  || visibleBranchCounts.size !== 12 || visibleElementCounts.size !== 5) {
  throw new Error('Synthetic chart coverage fell below the pinned structural floor');
}
if (promptByDayMasterCounts.size !== 10 * SYNTHETIC_SCENARIO_PROMPTS.length
  || [...promptByDayMasterCounts.values()].some((count) => count < 100)) {
  throw new Error('Fictional prompt distribution is severely concentrated by generated Day Master');
}

const report = {
  schemaVersion: 1,
  reportVersion: 'synthetic-coverage-v1',
  dataVersion: SYNTHETIC_GENERATOR_PROFILE.dataVersion,
  generatorVersion: SYNTHETIC_GENERATOR_PROFILE.generatorVersion,
  algorithm: SYNTHETIC_GENERATOR_PROFILE.algorithm,
  pipelineVersions: SYNTHETIC_GENERATOR_PROFILE.pipelineVersions,
  recordCount: ids.size,
  generationMode: SYNTHETIC_GENERATOR_PROFILE.generationMode,
  releaseFeatureDefaultEnabled: SYNTHETIC_GENERATOR_PROFILE.releaseFeatureDefaultEnabled,
  inventorySha256: inventoryHash.digest('hex'),
  uniqueIdCount: ids.size,
  uniqueDisplayNameCount: names.size,
  uniqueBirthContextCount: contexts.size,
  obviousDuplicateIdCount: SYNTHETIC_GENERATOR_PROFILE.recordCount - ids.size,
  obviousDuplicateDisplayNameCount: SYNTHETIC_GENERATOR_PROFILE.recordCount - names.size,
  duplicateContentFingerprintCount: SYNTHETIC_GENERATOR_PROFILE.recordCount - contentFingerprints.size,
  temporalSupportCounts: sortedCounts(temporalCounts),
  timeZoneCounts: sortedCounts(timeZoneCounts),
  dayMasterCounts: sortedCounts(dayMasterCounts),
  visibleBranchVariantCounts: sortedCounts(visibleBranchCounts),
  visibleElementVariantCounts: sortedCounts(visibleElementCounts),
  avatarMotifCounts: sortedCounts(motifCounts),
  avatarPaletteCounts: sortedCounts(paletteCounts),
  scenarioPromptCounts: sortedCounts(promptCounts),
  scenarioPromptByDayMasterCounts: sortedCounts(promptByDayMasterCounts),
  representativeIdsByTemporalSupport: sortedCounts(representativeIds),
  pipelineValidatedCount,
  adultBoundary: {
    dateRange: { start: birthRange.start, endInclusive: birthRange.endInclusive },
    referenceDate: birthRange.adultReferenceDate,
    minimumAgeYears: birthRange.minimumAgeYears,
    latestAllowedBirthDate: adultCutoff,
    validatedRecordCount: pipelineValidatedCount,
  },
  approvedRelationshipEvidenceCoverage: {
    status: 'unavailable',
    approvedRuleCount: 0,
    reason: 'The candidate product rule catalog has no approved rules; synthetic records cannot create methodology evidence.',
  },
  stereotypeAudit: {
    protectedDemographicFields: [],
    forbiddenMarketplaceFields: [],
    promptsDerivedFromChart: false,
    styleAssignmentReadsChart: false,
    populationRepresentativenessClaim: false,
    finding: 'Scenario prompts are independent fictional details, not Saju-derived personality or population claims.',
  },
  assetStrategy: {
    imageCount: 0,
    abstractTokenCount: SYNTHETIC_GENERATOR_PROFILE.recordCount,
    motifVocabularySize: SYNTHETIC_AVATAR_MOTIFS.length,
    paletteVocabularySize: SYNTHETIC_AVATAR_PALETTES.length,
  },
  scenarioPromptVocabularySize: SYNTHETIC_SCENARIO_PROMPTS.length,
  productionEligible: false,
};

const profileBytes = stable(SYNTHETIC_GENERATOR_PROFILE);
const reportBytes = stable(report);
if (sha256(profileBytes) !== releaseLock.profileSha256 || report.inventorySha256 !== releaseLock.inventorySha256) {
  throw new Error('Synthetic v1 content changed without a new generator/data version and ID namespace');
}
const manifest = {
  schemaVersion: 1,
  manifestVersion: 'synthetic-character-manifest-v1',
  dataVersion: SYNTHETIC_GENERATOR_PROFILE.dataVersion,
  generatorVersion: SYNTHETIC_GENERATOR_PROFILE.generatorVersion,
  algorithm: SYNTHETIC_GENERATOR_PROFILE.algorithm,
  pipelineVersions: SYNTHETIC_GENERATOR_PROFILE.pipelineVersions,
  recordCount: ids.size,
  generationMode: SYNTHETIC_GENERATOR_PROFILE.generationMode,
  inventorySha256: report.inventorySha256,
  releaseLockVersion: releaseLock.lockVersion,
  releaseLockSha256: sha256(releaseLockBytes),
  files: {
    profile: { path: 'synthetic-generator-profile.v1.json', sha256: sha256(profileBytes) },
    coverage: { path: 'synthetic-coverage.v1.json', sha256: sha256(reportBytes) },
  },
  productionEligible: false,
};
const manifestBytes = stable(manifest);
writeOrCheck(profilePath, profileBytes);
writeOrCheck(reportPath, reportBytes);
writeOrCheck(manifestPath, manifestBytes);
console.log(`${check ? 'Verified' : 'Built'} ${ids.size} deterministic fictional characters (${contexts.size} unique birth contexts)`);
