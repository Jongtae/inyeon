import { readFile } from 'node:fs/promises';

const indexPath = new URL('../apps/web/dist/index.html', import.meta.url);
const html = await readFile(indexPath, 'utf8');

const requiredAssetBase = /(?:src|href)="\/inyeon\/assets\//;
const rootRelativeAsset = /(?:src|href)="\/assets\//;

if (!requiredAssetBase.test(html)) {
  throw new Error('static build does not reference assets under /inyeon/assets/');
}

if (rootRelativeAsset.test(html)) {
  throw new Error('static build contains a root-relative /assets/ URL');
}

console.log('Static build verification PASSED: assets use the /inyeon/ Pages base path.');
