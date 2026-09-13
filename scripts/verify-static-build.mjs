import { readFile } from 'node:fs/promises';

const indexPath = new URL('../apps/web/dist/index.html', import.meta.url);
const html = await readFile(indexPath, 'utf8');

const requiredAssetBase = /(?:src|href)="\/inyeon\/assets\//;
const rootRelativeAsset = /(?:src|href)="\/assets\//;
const hangulFavicon = /%EC%9D%B8/;
const hanjaFavicon = /%E7%B7%A3/i;

if (!requiredAssetBase.test(html)) {
  throw new Error('static build does not reference assets under /inyeon/assets/');
}

if (rootRelativeAsset.test(html)) {
  throw new Error('static build contains a root-relative /assets/ URL');
}

if (!hangulFavicon.test(html) || hanjaFavicon.test(html)) {
  throw new Error('static build favicon must use the Hangul INYEON mark, not the legacy Hanja mark');
}

console.log('Static build verification PASSED: Pages assets and Hangul favicon are correct.');
