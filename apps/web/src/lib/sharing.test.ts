import { afterEach, describe, expect, it, vi } from 'vitest';
import { evaluateCompatibilityPair } from '@inyeon/compatibility-rules';

import { calculateProfile, compareProfiles } from './product';
import {
  copyShareUrl,
  createShareCardViewModel,
  createSharePayload,
  downloadShareCard,
  parseShareHash,
  parseSharePayload,
  renderShareCardPng,
  serializeSharePayload,
  shareHash,
  shareUrl,
  sharingEnabled,
} from './sharing';

describe('share-safe payloads', () => {
  it('provides a build-time kill switch without changing calculation code', () => {
    expect(sharingEnabled('false')).toBe(false);
    expect(sharingEnabled('true')).toBe(true);
    expect(sharingEnabled(undefined)).toBe(true);
  });
  it('round-trips only the four allowlisted payload kinds', () => {
    const payloads = [
      createSharePayload('lab-invite'),
      createSharePayload('compare-invite'),
      createSharePayload('public-reference', 'public:wd-q10118'),
      createSharePayload('synthetic-reference', 'synthetic:synthetic-character-generator-v1:10000'),
    ];
    for (const payload of payloads) {
      expect(parseShareHash(shareHash(payload))).toEqual(payload);
      expect(Object.isFrozen(payload)).toBe(true);
    }
  });

  it('uses stable, canonical field ordering and a Pages-safe share route', () => {
    const payload = createSharePayload('public-reference', 'public:wd-q10118');
    expect(serializeSharePayload(payload)).toBe(
      'v=inyeon-share-v1&kind=public-reference&copy=share-copy-en-us-v1&method=korean-saju-v1&ref=public%3Awd-q10118',
    );
    expect(shareUrl(payload, 'https://example.test/inyeon/?old=value#/privacy')).toBe(
      'https://example.test/inyeon/#/share?v=inyeon-share-v1&kind=public-reference&copy=share-copy-en-us-v1&method=korean-saju-v1&ref=public%3Awd-q10118',
    );
  });

  it('fails closed for unknown, duplicate, prototype-like, malformed, control, and oversized input', () => {
    const valid = shareHash(createSharePayload('lab-invite'));
    expect(parseShareHash(`${valid}&birth=1990-01-01`)).toBeNull();
    expect(parseShareHash(`${valid}&kind=lab-invite`)).toBeNull();
    expect(parseShareHash(`${valid}&__proto__=x`)).toBeNull();
    expect(parseShareHash(`${valid}&constructor=x`)).toBeNull();
    expect(parseShareHash(`${valid}\u0000`)).toBeNull();
    expect(parseShareHash(`${valid}&ref=%ZZ`)).toBeNull();
    expect(parseShareHash(`#/share?${'a'.repeat(600)}`)).toBeNull();
    expect(parseShareHash('#/share?v=inyeon-share-v1')).toBeNull();
    expect(parseShareHash(valid.replace('inyeon-share-v1', 'inyeon-share-v2'))).toBeNull();
    expect(parseShareHash(valid.replace('lab-invite', 'Lab-Invite'))).toBeNull();
  });

  it('requires only exact canonical public and fictional reference IDs', () => {
    expect(() => createSharePayload('public-reference', 'public:wd-q0')).toThrow(TypeError);
    expect(() => createSharePayload('public-reference', 'public:wd-q10118/extra')).toThrow(TypeError);
    expect(() => createSharePayload('synthetic-reference', 'synthetic:synthetic-character-generator-v1:00000')).toThrow(TypeError);
    expect(() => createSharePayload('synthetic-reference', 'synthetic:synthetic-character-generator-v1:10001')).toThrow(TypeError);
    expect(parseSharePayload({
      ...createSharePayload('compare-invite'),
      ref: 'public:wd-q10118',
    })).toBeNull();
  });

  it('rejects non-plain objects and payload fields associated with personal or interpretive data', () => {
    expect(parseSharePayload(null)).toBeNull();
    expect(parseSharePayload([])).toBeNull();
    expect(parseSharePayload(new Date())).toBeNull();
    expect(parseSharePayload(new Proxy({}, { getPrototypeOf: () => { throw new Error('hostile'); } }))).toBeNull();
    const protectedCanaries = {
      birth: '1994-07-19T03:17:00+09:00',
      chart: '갑술',
      features: 'private-feature-canary',
      evidence: 'private-evidence-canary',
      narrative: 'private-narrative-canary',
      name: 'private-name-canary',
      score: 99,
    };
    for (const [key, value] of Object.entries(protectedCanaries)) {
      const candidate = { ...createSharePayload('lab-invite'), [key]: value };
      expect(parseSharePayload(candidate)).toBeNull();
      expect(() => serializeSharePayload(candidate as ReturnType<typeof createSharePayload>)).toThrow(TypeError);
    }
  });

  it('rejects actual chart, derived-feature, pair-evidence, and narrative objects at every payload mapper', () => {
    const context = (localDate: string, localTime: string) => ({
      calendarKind: 'solar' as const,
      timeZone: 'Asia/Seoul' as const,
      profileVersion: 'korean-saju-v1' as const,
      timezoneDataVersion: 'iana-2026c-inyeon-filter-v1' as const,
      referenceDataVersion: 'issue-12-day-hour-uncertainty-v1' as const,
      temporalSupport: 'exact' as const,
      localDate,
      localTime,
    });
    const first = calculateProfile(context('1994-07-19', '03:17'));
    const second = calculateProfile(context('1992-11-27', '04:23'));
    expect(first.status).toBe('ok');
    expect(second.status).toBe('ok');
    if (first.status !== 'ok' || second.status !== 'ok') throw new Error('Expected valid private profiles.');
    const evidence = evaluateCompatibilityPair(first.profile.derived, second.profile.derived);
    const comparison = compareProfiles(first.profile, second.profile, 'someone-i-know');
    expect(evidence.status).toBe('ok');
    expect(comparison.status).toBe('ok');
    if (evidence.status !== 'ok' || comparison.status !== 'ok') throw new Error('Expected valid private comparison.');

    const protectedObjects = {
      chart: first.profile.chart,
      features: first.profile.derived,
      evidence: evidence.snapshot,
      narrative: comparison.narrative,
    };
    for (const [key, value] of Object.entries(protectedObjects)) {
      const candidate = { ...createSharePayload('compare-invite'), [key]: value };
      const forged = candidate as ReturnType<typeof createSharePayload>;
      expect(parseSharePayload(candidate)).toBeNull();
      expect(() => serializeSharePayload(forged)).toThrow(TypeError);
      expect(() => shareHash(forged)).toThrow(TypeError);
      expect(() => shareUrl(forged, 'https://example.test/inyeon/')).toThrow(TypeError);
      expect(() => createShareCardViewModel(forged)).toThrow(TypeError);
    }
  });
});

describe('allowlisted share presentation', () => {
  it('creates fixed English-first copy with Hangul-primary Korean identity and no interpretation', () => {
    const card = createShareCardViewModel(createSharePayload('compare-invite'));
    expect(card).toEqual({
      brand: 'INYEON',
      koreanBrand: '인연',
      kind: 'compare-invite',
      referenceId: null,
      eyebrow: 'COMPARE LOCALLY',
      title: 'Bring your own details to INYEON',
      body: 'Open the lab and enter each person’s details on your own device. This invitation contains no birth or chart data.',
      disclosure: 'Relationship interpretation is still under review. Compatibility is context, not destiny.',
      callToAction: 'Open INYEON',
    });
    expect(JSON.stringify(card)).not.toMatch(/score|soulmate|clicks|friction|perfect match|四柱/iu);
    expect(Object.isFrozen(card)).toBe(true);
  });

  it('renders a local PNG from an exact card view model and rejects modified/freeform models', async () => {
    const addColorStop = vi.fn();
    const context = {
      createLinearGradient: vi.fn(() => ({ addColorStop })),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
      fillStyle: '',
      font: '',
    } as unknown as CanvasRenderingContext2D;
    const blob = new Blob(['png'], { type: 'image/png' });
    const canvas = document.createElement('canvas');
    vi.spyOn(document, 'createElement').mockReturnValueOnce(canvas);
    vi.spyOn(canvas, 'getContext').mockReturnValue(context);
    vi.spyOn(canvas, 'toBlob').mockImplementation((callback) => callback(blob));

    await expect(renderShareCardPng(createShareCardViewModel(createSharePayload('lab-invite')))).resolves.toBe(blob);
    expect(canvas.width).toBe(1200);
    expect(canvas.height).toBe(630);
    expect(addColorStop).toHaveBeenCalledTimes(2);
    await expect(renderShareCardPng({
      ...createShareCardViewModel(createSharePayload('lab-invite')),
      body: 'A personalized freeform claim',
    })).rejects.toThrow('Invalid share card view model');
  });
});

describe('explicit browser helpers', () => {
  afterEach(() => vi.restoreAllMocks());

  it('copies only a valid INYEON share URL through the injected clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const url = shareUrl(createSharePayload('compare-invite'), 'https://example.test/inyeon/');
    await copyShareUrl(url, { writeText });
    expect(writeText).toHaveBeenCalledWith(url);
    await expect(copyShareUrl('https://example.test/inyeon/#/privacy', { writeText })).rejects.toThrow(TypeError);
  });

  it('downloads only a PNG using a short-lived object URL', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const anchor = document.createElement('a');
    const click = vi.spyOn(anchor, 'click').mockImplementation(() => undefined);
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    const png = new Blob(['png'], { type: 'image/png' });
    downloadShareCard(png, 'inyeon-share-invite.png');
    expect(createObjectURL).toHaveBeenCalledWith(png);
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:local');
    expect(() => downloadShareCard(new Blob(['x'], { type: 'text/plain' }))).toThrow(TypeError);
    expect(() => downloadShareCard(png, '../private.png')).toThrow(TypeError);
  });
});
