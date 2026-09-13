export const SHARE_SCHEMA_VERSION = 'inyeon-share-v1' as const;
export const SHARE_COPY_VERSION = 'share-copy-en-us-v1' as const;
export const SHARE_METHOD_VERSION = 'korean-saju-v1' as const;
export const SHARE_ROUTE = '#/share' as const;

export const SHARE_KINDS = Object.freeze([
  'lab-invite',
  'compare-invite',
  'public-reference',
  'synthetic-reference',
] as const);

export type ShareKind = (typeof SHARE_KINDS)[number];
export type PublicReferenceId = `public:wd-q${string}`;
export type SyntheticReferenceId = `synthetic:synthetic-character-generator-v1:${string}`;

interface SharePayloadBase {
  readonly v: typeof SHARE_SCHEMA_VERSION;
  readonly kind: ShareKind;
  readonly copy: typeof SHARE_COPY_VERSION;
  readonly method: typeof SHARE_METHOD_VERSION;
}

export type SharePayload =
  | (SharePayloadBase & { readonly kind: 'lab-invite' | 'compare-invite' })
  | (SharePayloadBase & { readonly kind: 'public-reference'; readonly ref: PublicReferenceId })
  | (SharePayloadBase & { readonly kind: 'synthetic-reference'; readonly ref: SyntheticReferenceId });

export interface ShareCardViewModel {
  readonly brand: 'INYEON';
  readonly koreanBrand: '인연';
  readonly kind: ShareKind;
  readonly referenceId: PublicReferenceId | SyntheticReferenceId | null;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly disclosure: string;
  readonly callToAction: 'Open INYEON';
}

const MAX_HASH_LENGTH = 512;
const PAYLOAD_KEYS = Object.freeze(['v', 'kind', 'copy', 'method'] as const);
const REFERENCE_PAYLOAD_KEYS = Object.freeze([...PAYLOAD_KEYS, 'ref'] as const);
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/u;
const PUBLIC_REFERENCE_ID = /^public:wd-q[1-9]\d{0,11}$/u;
const SYNTHETIC_REFERENCE_ID = /^synthetic:synthetic-character-generator-v1:(?:0000[1-9]|000[1-9]\d|00[1-9]\d{2}|0[1-9]\d{3}|10000)$/u;
const PROTOTYPE_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function sharingEnabled(configuredValue: string | undefined): boolean {
  return configuredValue !== 'false';
}

export const SHARING_ENABLED = sharingEnabled(import.meta.env.VITE_SHARING_ENABLED);

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(record: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(record);
  return keys.length === expected.length
    && keys.every((key) => !PROTOTYPE_KEYS.has(key) && expected.includes(key));
}

function isReferenceForKind(kind: ShareKind, value: unknown): value is PublicReferenceId | SyntheticReferenceId {
  return typeof value === 'string'
    && !CONTROL_CHARACTERS.test(value)
    && (kind === 'public-reference'
      ? PUBLIC_REFERENCE_ID.test(value)
      : kind === 'synthetic-reference' && SYNTHETIC_REFERENCE_ID.test(value));
}

function parseSharePayloadUnchecked(value: unknown): SharePayload | null {
  if (!isPlainRecord(value)) return null;
  const kind = value.kind;
  if (typeof kind !== 'string' || !SHARE_KINDS.includes(kind as ShareKind)) return null;
  const typedKind = kind as ShareKind;
  const needsReference = typedKind === 'public-reference' || typedKind === 'synthetic-reference';
  if (!exactKeys(value, needsReference ? REFERENCE_PAYLOAD_KEYS : PAYLOAD_KEYS)) return null;
  if (value.v !== SHARE_SCHEMA_VERSION || value.copy !== SHARE_COPY_VERSION
    || value.method !== SHARE_METHOD_VERSION) return null;
  if (needsReference) {
    if (!isReferenceForKind(typedKind, value.ref)) return null;
    return Object.freeze({
      v: SHARE_SCHEMA_VERSION,
      kind: typedKind,
      copy: SHARE_COPY_VERSION,
      method: SHARE_METHOD_VERSION,
      ref: value.ref,
    }) as SharePayload;
  }
  return Object.freeze({
    v: SHARE_SCHEMA_VERSION,
    kind: typedKind,
    copy: SHARE_COPY_VERSION,
    method: SHARE_METHOD_VERSION,
  }) as SharePayload;
}

export function parseSharePayload(value: unknown): SharePayload | null {
  try {
    return parseSharePayloadUnchecked(value);
  } catch {
    return null;
  }
}

export function createSharePayload(
  kind: 'lab-invite' | 'compare-invite',
): SharePayload;
export function createSharePayload(
  kind: 'public-reference', ref: PublicReferenceId,
): SharePayload;
export function createSharePayload(
  kind: 'synthetic-reference', ref: SyntheticReferenceId,
): SharePayload;
export function createSharePayload(kind: ShareKind, ref?: string): SharePayload {
  const candidate = {
    v: SHARE_SCHEMA_VERSION,
    kind,
    copy: SHARE_COPY_VERSION,
    method: SHARE_METHOD_VERSION,
    ...(ref === undefined ? {} : { ref }),
  };
  const payload = parseSharePayload(candidate);
  if (!payload) throw new TypeError('Invalid share payload.');
  return payload;
}

export function serializeSharePayload(payload: SharePayload): string {
  const validated = parseSharePayload(payload);
  if (!validated) throw new TypeError('Invalid share payload.');
  const query = new URLSearchParams();
  query.set('v', validated.v);
  query.set('kind', validated.kind);
  query.set('copy', validated.copy);
  query.set('method', validated.method);
  if ('ref' in validated) query.set('ref', validated.ref);
  return query.toString();
}

export function shareHash(payload: SharePayload): string {
  return `${SHARE_ROUTE}?${serializeSharePayload(payload)}`;
}

export function parseShareHash(hash: string): SharePayload | null {
  if (!SHARING_ENABLED) return null;
  if (typeof hash !== 'string' || hash.length > MAX_HASH_LENGTH || CONTROL_CHARACTERS.test(hash)) return null;
  const prefix = `${SHARE_ROUTE}?`;
  if (!hash.startsWith(prefix)) return null;
  const query = hash.slice(prefix.length);
  if (query === '' || query.includes('#') || /%(?![\da-f]{2})/iu.test(query)) return null;
  try {
    const params = new URLSearchParams(query);
    const record: Record<string, string> = Object.create(null);
    for (const [key, value] of params) {
      if (PROTOTYPE_KEYS.has(key) || Object.hasOwn(record, key)) return null;
      record[key] = value;
    }
    return parseSharePayload(record);
  } catch {
    return null;
  }
}

export function shareUrl(payload: SharePayload, pageUrl: string | URL): string {
  const url = new URL(pageUrl.toString());
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('Share links require an HTTP(S) page URL.');
  }
  url.search = '';
  url.hash = shareHash(payload).slice(1);
  return url.toString();
}

const CARD_COPY: Readonly<Record<ShareKind, Omit<ShareCardViewModel, 'brand' | 'koreanBrand' | 'kind' | 'referenceId' | 'callToAction'>>> = Object.freeze({
  'lab-invite': Object.freeze({
    eyebrow: 'KOREAN COMPATIBILITY LAB',
    title: 'Explore Korean Saju with INYEON',
    body: 'A browser-only lab for learning how Korean Saju frames connection—with clear limits and no destiny claims.',
    disclosure: 'Relationship interpretation is still under review. Saju is a cultural tradition, not a scientific prediction.',
  }),
  'compare-invite': Object.freeze({
    eyebrow: 'COMPARE LOCALLY',
    title: 'Bring your own details to INYEON',
    body: 'Open the lab and enter each person’s details on your own device. This invitation contains no birth or chart data.',
    disclosure: 'Relationship interpretation is still under review. Compatibility is context, not destiny.',
  }),
  'public-reference': Object.freeze({
    eyebrow: 'PUBLIC REFERENCE',
    title: 'Explore a public reference in INYEON',
    body: 'Open this sourced reference in the Korean Compatibility Lab. Public figures are references—not members or endorsers.',
    disclosure: 'Relationship interpretation is still under review. No private-life or relationship claims are implied.',
  }),
  'synthetic-reference': Object.freeze({
    eyebrow: 'FICTIONAL LAB REFERENCE',
    title: 'Explore a fictional INYEON reference',
    body: 'Open this visibly fictional Lab character. It is not a real person, member, or simulation of dating activity.',
    disclosure: 'Relationship interpretation is still under review. Fictional reference only; no population or relationship claim.',
  }),
});

export function createShareCardViewModel(payload: SharePayload): ShareCardViewModel {
  const validated = parseSharePayload(payload);
  if (!validated) throw new TypeError('Invalid share payload.');
  return Object.freeze({
    brand: 'INYEON',
    koreanBrand: '인연',
    kind: validated.kind,
    referenceId: 'ref' in validated ? validated.ref : null,
    ...CARD_COPY[validated.kind],
    callToAction: 'Open INYEON',
  });
}

function isShareCardViewModel(value: unknown): value is ShareCardViewModel {
  if (!isPlainRecord(value)) return false;
  if (!exactKeys(value, ['brand', 'koreanBrand', 'kind', 'referenceId', 'eyebrow', 'title', 'body', 'disclosure', 'callToAction'])) return false;
  if (typeof value.kind !== 'string' || !SHARE_KINDS.includes(value.kind as ShareKind)) return false;
  const kind = value.kind as ShareKind;
  const validReference = kind === 'public-reference' || kind === 'synthetic-reference'
    ? isReferenceForKind(kind, value.referenceId)
    : value.referenceId === null;
  const copy = CARD_COPY[kind];
  return validReference && value.brand === 'INYEON'
    && value.koreanBrand === '인연'
    && value.callToAction === 'Open INYEON'
    && value.eyebrow === copy.eyebrow
    && value.title === copy.title
    && value.body === copy.body
    && value.disclosure === copy.disclosure;
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(' ');
  let line = '';
  let cursorY = y;
  for (const word of words) {
    const candidate = line === '' ? word : `${line} ${word}`;
    if (line !== '' && context.measureText(candidate).width > maxWidth) {
      context.fillText(line, x, cursorY);
      cursorY += lineHeight;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line !== '') context.fillText(line, x, cursorY);
  return cursorY + lineHeight;
}

export function renderShareCardPng(viewModel: ShareCardViewModel): Promise<Blob> {
  if (!isShareCardViewModel(viewModel)) return Promise.reject(new TypeError('Invalid share card view model.'));
  if (typeof document === 'undefined') return Promise.reject(new Error('Canvas rendering requires a browser.'));
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('Canvas rendering is unavailable.'));

  const gradient = context.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#f7f0e4');
  gradient.addColorStop(1, '#dce8df');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 630);
  context.fillStyle = '#17352d';
  context.font = '700 30px Georgia, serif';
  context.fillText(`${viewModel.brand} · ${viewModel.koreanBrand}`, 72, 78);
  context.font = '700 18px system-ui, sans-serif';
  context.fillText(viewModel.eyebrow, 72, 140);
  context.font = '700 54px Georgia, serif';
  const afterTitle = wrapCanvasText(context, viewModel.title, 72, 220, 1056, 64);
  context.font = '400 27px system-ui, sans-serif';
  const afterBody = wrapCanvasText(context, viewModel.body, 72, afterTitle + 24, 990, 39);
  context.font = '400 20px system-ui, sans-serif';
  context.fillStyle = '#38584f';
  const afterDisclosure = wrapCanvasText(context, viewModel.disclosure, 72, afterBody + 28, 990, 30);
  if (viewModel.referenceId) {
    context.font = '600 17px ui-monospace, monospace';
    context.fillText(`Reference: ${viewModel.referenceId}`, 72, Math.min(afterDisclosure + 22, 535));
  }
  context.font = '700 20px system-ui, sans-serif';
  context.fillText(viewModel.callToAction, 72, 574);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG generation failed.'));
    }, 'image/png');
  });
}

export async function copyShareUrl(
  url: string,
  clipboard: Pick<Clipboard, 'writeText'> = navigator.clipboard,
): Promise<void> {
  const parsed = new URL(url);
  if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') || !parseShareHash(parsed.hash)) {
    throw new TypeError('Invalid share URL.');
  }
  await clipboard.writeText(parsed.toString());
}

export function downloadShareCard(blob: Blob, filename = 'inyeon-share.png'): void {
  if (blob.type !== 'image/png' || !/^inyeon-share(?:-[a-z0-9-]+)?\.png$/u.test(filename)) {
    throw new TypeError('Invalid share image download.');
  }
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
