import type { NormalizedChartContext } from '@inyeon/saju-adapter';

export type SyntheticTemporalSupport = NormalizedChartContext['temporalSupport'];
export type SyntheticTimeZone = NormalizedChartContext['timeZone'];

export interface SyntheticScenarioPrompt {
  readonly id: string;
  readonly label: string;
}

export interface SyntheticAvatarToken {
  readonly kind: 'abstract-token';
  readonly motifId: string;
  readonly motifLabel: string;
  readonly paletteId: string;
  readonly alt: 'Abstract art for a fictional Inyeon Lab character.';
}

export interface SyntheticCharacter {
  readonly kind: 'synthetic';
  readonly id: `synthetic:synthetic-character-generator-v1:${string}`;
  readonly recordVersion: 'synthetic-character-record-v1';
  readonly dataVersion: 'synthetic-characters-v1';
  readonly generatorVersion: 'synthetic-character-generator-v1';
  readonly seedIndex: number;
  readonly displayName: string;
  readonly fictional: {
    readonly status: 'fictional';
    readonly disclosureVersion: 'synthetic-fiction-disclosure-v1';
    readonly shortDisclosure: 'Fictional character—not a real person or member.';
  };
  readonly avatar: SyntheticAvatarToken;
  readonly scenarioPrompts: readonly [SyntheticScenarioPrompt, SyntheticScenarioPrompt];
  readonly promptProvenance: {
    readonly distributionVersion: 'independent-fictional-prompts-v1';
    readonly chartDerived: false;
    readonly populationClaim: false;
  };
  readonly birthFixture: {
    readonly origin: 'generator-defined-fictional-fixture';
    readonly context: NormalizedChartContext;
  };
  readonly pipelineVersions: {
    readonly profileVersion: 'korean-saju-v1';
    readonly adapterVersion: '0.4.0';
    readonly derivedFeatureVersion: 'korean-saju-derived-v1';
    readonly compatibilitySnapshotVersion: 'compatibility-snapshot-v2';
    readonly evidenceAvailabilityVersion: 'evidence-availability-v1';
    readonly ruleSetVersion: 'korean-compatibility-rules-v1';
    readonly taxonomyVersion: 'inclusive-compatibility-v1';
  };
  readonly productionEligible: false;
}

export interface SyntheticInventory {
  readonly enabled: boolean;
  readonly count: number;
  readonly get: (seedIndex: number) => SyntheticCharacter | null;
  readonly list: (offset: number, limit: number) => readonly SyntheticCharacter[];
}

export interface SyntheticReferenceSubject {
  readonly kind: 'synthetic';
  readonly id: SyntheticCharacter['id'];
  readonly displayName: string;
  readonly fictional: SyntheticCharacter['fictional'];
  readonly chartContext: NormalizedChartContext;
  readonly pipelineVersions: SyntheticCharacter['pipelineVersions'];
}
