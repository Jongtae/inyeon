export const SYNTHETIC_GENERATOR_PROFILE = Object.freeze({
  schemaVersion: 1,
  dataVersion: 'synthetic-characters-v1',
  generatorVersion: 'synthetic-character-generator-v1',
  algorithm: 'inyeon-index-mix32-v1',
  masterSeed: 0x49_4e_59_45,
  recordCount: 10_000,
  generationMode: 'deterministic-on-demand',
  releaseFeatureDefaultEnabled: false,
  temporalAllocation: Object.freeze({ exact: 8_000, approximate: 500, disputed: 500, 'date-only': 500, unknown: 500 }),
  supportedTimeZones: Object.freeze(['America/Los_Angeles', 'America/New_York', 'Asia/Seoul'] as const),
  birthFixtureDateRange: Object.freeze({
    start: '1989-01-01',
    endInclusive: '2004-12-31',
    adultReferenceDate: '2026-09-14',
    minimumAgeYears: 18,
  }),
  fictionalPromptDistributionVersion: 'independent-fictional-prompts-v1',
  abstractAvatarVersion: 'korean-rooted-abstract-avatar-v1',
  pipelineVersions: Object.freeze({
    profileVersion: 'korean-saju-v1',
    adapterVersion: '0.4.0',
    derivedFeatureVersion: 'korean-saju-derived-v1',
    compatibilitySnapshotVersion: 'compatibility-snapshot-v2',
    evidenceAvailabilityVersion: 'evidence-availability-v1',
    ruleSetVersion: 'korean-compatibility-rules-v1',
    taxonomyVersion: 'inclusive-compatibility-v1',
  }),
  populationRepresentativenessClaim: false,
  traitsDerivedFromSaju: false,
  productionEligible: false,
} as const);

export const SYNTHETIC_DISCLOSURE = Object.freeze({
  labTitle: 'Inyeon Lab (인연 실험실)',
  short: 'Fictional character—not a real person or member.',
  full: 'This Inyeon Lab character is entirely fictional and generated for exploring Korean Saju (사주, Four Pillars; 四柱). It is not a dating profile, a real person, or simulated activity.',
  fixture: 'Birth details are generator-defined fictional fixtures, not facts about a real person.',
} as const);

export const SYNTHETIC_SCENARIO_PROMPTS = Object.freeze([
  Object.freeze({ id: 'bookstore-hour', label: 'A quiet bookstore hour' }),
  Object.freeze({ id: 'museum-afternoon', label: 'A museum afternoon' }),
  Object.freeze({ id: 'cooking-night', label: 'A cooking night' }),
  Object.freeze({ id: 'neighborhood-walk', label: 'A neighborhood photo walk' }),
  Object.freeze({ id: 'live-music', label: 'A live-music set' }),
  Object.freeze({ id: 'board-game-cafe', label: 'A board-game café' }),
  Object.freeze({ id: 'pottery-workshop', label: 'A pottery workshop' }),
  Object.freeze({ id: 'coastal-train', label: 'A coastal train ride' }),
  Object.freeze({ id: 'han-river-picnic', label: 'A Han River picnic (한강 피크닉)' }),
  Object.freeze({ id: 'noraebang', label: 'A noraebang night (노래방)' }),
  Object.freeze({ id: 'street-food', label: 'A street-food walk' }),
  Object.freeze({ id: 'home-movie', label: 'A low-key movie night' }),
] as const);

export const SYNTHETIC_AVATAR_MOTIFS = Object.freeze([
  Object.freeze({ id: 'bojagi-grid', label: 'Bojagi Grid (보자기)' }),
  Object.freeze({ id: 'dancheong-arc', label: 'Dancheong Arc (단청; 丹靑)' }),
  Object.freeze({ id: 'hanji-layer', label: 'Hanji Layer (한지; 韓紙)' }),
  Object.freeze({ id: 'moon-jar-curve', label: 'Moon Jar Curve (달항아리)' }),
  Object.freeze({ id: 'norigae-knot', label: 'Norigae Knot (노리개)' }),
] as const);

export const SYNTHETIC_AVATAR_PALETTES = Object.freeze([
  'pine-jade', 'persimmon-ink', 'indigo-cloud', 'plum-sand', 'celadon-night',
] as const);
