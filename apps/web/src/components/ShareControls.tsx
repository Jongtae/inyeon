import { useEffect, useMemo, useRef, useState } from 'react';

import {
  SHARING_ENABLED,
  copyShareUrl,
  createShareCardViewModel,
  downloadShareCard,
  renderShareCardPng,
  shareUrl,
  type SharePayload,
} from '../lib/sharing';

export function ShareControls({
  payload,
  heading = 'Share this reference—not your private result.',
}: {
  readonly payload: SharePayload;
  readonly heading?: string;
}) {
  const card = useMemo(() => createShareCardViewModel(payload), [payload]);
  const url = useMemo(() => shareUrl(payload, window.location.href), [payload]);
  const [expanded, setExpanded] = useState(false);
  const [image, setImage] = useState<{ readonly blob: Blob; readonly url: string } | null>(null);
  const [status, setStatus] = useState('');
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image.url);
  }, [image]);

  if (!SHARING_ENABLED) return null;

  const prepareImage = async (): Promise<Blob> => {
    if (image) return image.blob;
    const blob = await renderShareCardPng(card);
    setImage({ blob, url: URL.createObjectURL(blob) });
    return blob;
  };

  const openPreview = async () => {
    setExpanded(true);
    setStatus('Preparing a local preview…');
    try {
      await prepareImage();
      setStatus('Preview ready. It contains no birth details, chart, or private comparison evidence.');
    } catch {
      setStatus('Image preview is unavailable in this browser. You can still copy the safe link.');
    }
  };

  const share = async () => {
    if (!navigator.share) {
      setStatus('Web Share is unavailable here. Download the image or copy the link instead.');
      return;
    }
    try {
      const blob = await prepareImage();
      const file = new File([blob], 'inyeon-share.png', { type: 'image/png' });
      const text = `Explore INYEON · 인연: ${url}`;
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'INYEON · 인연', text, files: [file] });
      } else {
        await navigator.share({ title: 'INYEON · 인연', text, url });
      }
      setStatus('Share sheet opened. Anything you send may become public.');
    } catch (error) {
      setStatus(error instanceof DOMException && error.name === 'AbortError'
        ? 'Sharing canceled.'
        : 'Sharing could not be opened. Download the image or copy the link instead.');
    }
  };

  const download = async () => {
    try {
      const blob = await prepareImage();
      downloadShareCard(blob);
      setStatus('PNG downloaded locally. The file may become public if you post it.');
    } catch {
      setStatus('The PNG could not be generated in this browser.');
    }
  };

  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await copyShareUrl(url, navigator.clipboard);
      setStatus('Safe link copied. It contains no birth details, chart, or private comparison evidence.');
    } catch {
      linkRef.current?.focus();
      linkRef.current?.select();
      setStatus('Automatic copy is unavailable. The safe link is selected for manual copying.');
    }
  };

  return (
    <section className="share-controls" aria-labelledby={`share-heading-${payload.kind}`}>
      <p className="eyebrow">PRIVACY-SAFE SHARING</p>
      <h3 id={`share-heading-${payload.kind}`}>{heading}</h3>
      <p>This export uses a fixed public allowlist. It contains no birth details, Four Pillars chart, private comparison evidence, score, or relationship interpretation.</p>
      {!expanded
        ? <button className="secondary-button" type="button" onClick={() => void openPreview()}>Preview share options</button>
        : <div className="share-workspace">
          <div className="share-card-preview">
            {image
              ? <img src={image.url} alt="Claim-free INYEON share card preview" />
              : <div className="share-card-placeholder" role="status">Preparing the local image…</div>}
          </div>
          <label className="share-link"><span>Share-safe link</span><input ref={linkRef} readOnly value={url} /></label>
          <div className="share-buttons">
            <button className="primary-button" type="button" onClick={() => void share()}>Open share sheet</button>
            <button className="secondary-button" type="button" onClick={() => void download()}>Download PNG</button>
            <button className="secondary-button" type="button" onClick={() => void copy()}>Copy safe link</button>
          </div>
        </div>}
      <p className="share-status" role="status" aria-live="polite">{status}</p>
      <p className="share-public-note">Review before sharing. A downloaded card or copied link may become public after it leaves this tab.</p>
    </section>
  );
}
