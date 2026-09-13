import type { NormalizedChartContext } from '@inyeon/saju-adapter';

import {
  SYNTHETIC_AVATAR_MOTIFS,
  SYNTHETIC_AVATAR_PALETTES,
  SYNTHETIC_DISCLOSURE,
  SYNTHETIC_GENERATOR_PROFILE,
  SYNTHETIC_SCENARIO_PROMPTS,
} from './profile.js';
import type { SyntheticCharacter, SyntheticInventory, SyntheticReferenceSubject } from './types.js';

const dayMs = 86_400_000;
const startMs = Date.parse(`${SYNTHETIC_GENERATOR_PROFILE.birthFixtureDateRange.start}T00:00:00.000Z`);
const endMs = Date.parse(`${SYNTHETIC_GENERATOR_PROFILE.birthFixtureDateRange.endInclusive}T00:00:00.000Z`);
if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
  throw new Error('Synthetic birth-fixture date range is invalid.');
}
const dayCount = Math.floor((endMs - startMs) / dayMs) + 1;

function mix32(value: number): number {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x21f0aaad);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x735a2d97);
  return (mixed ^ (mixed >>> 15)) >>> 0;
}

function valueFor(seedIndex: number, stream: number): number {
  return mix32(SYNTHETIC_GENERATOR_PROFILE.masterSeed ^ Math.imul(seedIndex + 1, 0x9e3779b1) ^ stream);
}

function boundedValue(seedIndex: number, stream: number, bound: number): number {
  const limit = Math.floor(0x1_0000_0000 / bound) * bound;
  let round = 0;
  let value = valueFor(seedIndex, stream);
  while (value >= limit) {
    round += 1;
    value = valueFor(seedIndex, stream ^ Math.imul(round, 0x85ebca6b));
  }
  return value % bound;
}

function choose<T>(values: readonly T[], seedIndex: number, stream: number): T {
  const selected = values[boundedValue(seedIndex, stream, values.length)];
  if (selected === undefined) throw new Error('Synthetic generator profile contains an empty distribution.');
  return selected;
}

function formatTime(totalMinutes: number): string {
  return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
}

function localDate(seedIndex: number): string {
  return new Date(startMs + boundedValue(seedIndex, 0x101, dayCount) * dayMs).toISOString().slice(0, 10);
}

function temporalSupport(seedIndex: number): NormalizedChartContext['temporalSupport'] {
  switch (seedIndex % 20) {
    case 0: return 'date-only';
    case 1: return 'unknown';
    case 2: return 'approximate';
    case 3: return 'disputed';
    default: return 'exact';
  }
}

function birthContext(seedIndex: number): NormalizedChartContext {
  const date = localDate(seedIndex);
  const timeZone = SYNTHETIC_GENERATOR_PROFILE.supportedTimeZones[seedIndex % SYNTHETIC_GENERATOR_PROFILE.supportedTimeZones.length];
  if (!timeZone) throw new Error('Synthetic time-zone distribution is invalid.');
  const base = {
    calendarKind: 'solar' as const,
    timeZone,
    profileVersion: 'korean-saju-v1' as const,
    timezoneDataVersion: 'iana-2026c-inyeon-filter-v1' as const,
    referenceDataVersion: 'issue-12-day-hour-uncertainty-v1' as const,
  };
  const support = temporalSupport(seedIndex);
  if (support === 'date-only') return { ...base, temporalSupport: 'date-only', localDate: date };
  if (support === 'unknown') return { ...base, temporalSupport: 'unknown', localDate: date };
  const center = 8 * 60 + boundedValue(seedIndex, 0x303, 12 * 60);
  if (support === 'exact') return { ...base, temporalSupport: 'exact', localDate: date, localTime: formatTime(center) };
  if (support === 'approximate') return {
    ...base,
    temporalSupport: 'approximate',
    window: {
      startLocalDateTime: `${date}T${formatTime(center - 15)}`,
      endLocalDateTime: `${date}T${formatTime(center + 15)}`,
    },
  };
  const second = center <= 12 * 60 ? center + 6 * 60 : center - 6 * 60;
  return {
    ...base,
    temporalSupport: 'disputed',
    windows: [center, second].sort((left, right) => left - right).map((minute) => ({
      startLocalDateTime: `${date}T${formatTime(minute)}`,
      endLocalDateTime: `${date}T${formatTime(minute)}`,
    })),
  };
}

export function generateSyntheticCharacter(seedIndex: number): SyntheticCharacter {
  if (!Number.isSafeInteger(seedIndex) || seedIndex < 0 || seedIndex >= SYNTHETIC_GENERATOR_PROFILE.recordCount) {
    throw new RangeError('Synthetic character seed index is outside the pinned inventory.');
  }
  const firstPromptIndex = boundedValue(seedIndex, 0x404, SYNTHETIC_SCENARIO_PROMPTS.length);
  const secondPromptIndex = (firstPromptIndex + 1 + boundedValue(seedIndex, 0x505, SYNTHETIC_SCENARIO_PROMPTS.length - 1))
    % SYNTHETIC_SCENARIO_PROMPTS.length;
  const firstPrompt = SYNTHETIC_SCENARIO_PROMPTS[firstPromptIndex];
  const secondPrompt = SYNTHETIC_SCENARIO_PROMPTS[secondPromptIndex];
  if (!firstPrompt || !secondPrompt) throw new Error('Synthetic prompt distribution is invalid.');
  const motif = choose(SYNTHETIC_AVATAR_MOTIFS, seedIndex, 0x606);
  const code = String(seedIndex + 1).padStart(5, '0');
  return {
    kind: 'synthetic',
    id: `synthetic:synthetic-character-generator-v1:${code}`,
    recordVersion: 'synthetic-character-record-v1',
    dataVersion: 'synthetic-characters-v1',
    generatorVersion: 'synthetic-character-generator-v1',
    seedIndex,
    displayName: `Inyeon Lab Character ${code}`,
    fictional: {
      status: 'fictional',
      disclosureVersion: 'synthetic-fiction-disclosure-v1',
      shortDisclosure: SYNTHETIC_DISCLOSURE.short,
    },
    avatar: {
      kind: 'abstract-token',
      motifId: motif.id,
      motifLabel: motif.label,
      paletteId: choose(SYNTHETIC_AVATAR_PALETTES, seedIndex, 0x707),
      alt: 'Abstract art for a fictional Inyeon Lab character.',
    },
    scenarioPrompts: [firstPrompt, secondPrompt],
    promptProvenance: {
      distributionVersion: 'independent-fictional-prompts-v1',
      chartDerived: false,
      populationClaim: false,
    },
    birthFixture: { origin: 'generator-defined-fictional-fixture', context: birthContext(seedIndex) },
    pipelineVersions: {
      ...SYNTHETIC_GENERATOR_PROFILE.pipelineVersions,
    },
    productionEligible: false,
  };
}

export function createSyntheticInventory(enabled: boolean): SyntheticInventory {
  return Object.freeze({
    enabled,
    count: enabled ? SYNTHETIC_GENERATOR_PROFILE.recordCount : 0,
    get: (seedIndex: number) => (enabled ? generateSyntheticCharacter(seedIndex) : null),
    list: (offset: number, limit: number) => {
      if (!enabled) return [];
      if (!Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(limit) || limit < 0 || limit > 100) {
        throw new RangeError('Synthetic inventory pagination is invalid.');
      }
      const end = Math.min(offset + limit, SYNTHETIC_GENERATOR_PROFILE.recordCount);
      return Object.freeze(Array.from({ length: Math.max(0, end - offset) }, (_, index) => generateSyntheticCharacter(offset + index)));
    },
  });
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function generateSyntheticReferenceSubject(seedIndex: number): SyntheticReferenceSubject {
  const record = generateSyntheticCharacter(seedIndex);
  return deepFreeze({
    kind: record.kind,
    id: record.id,
    displayName: record.displayName,
    fictional: structuredClone(record.fictional),
    chartContext: structuredClone(record.birthFixture.context),
    pipelineVersions: structuredClone(record.pipelineVersions),
  });
}
