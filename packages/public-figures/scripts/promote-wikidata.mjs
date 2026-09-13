import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const canonicalPath = fileURLToPath(new URL('../source/wikidata-public-figures.v1.json', import.meta.url));
const candidatePath = fileURLToPath(new URL('../source/wikidata-public-figures.candidate.json', import.meta.url));
const reviewPath = fileURLToPath(new URL('../source/wikidata-public-figures.candidate-review.json', import.meta.url));
const expectedFlag = process.argv.indexOf('--expected-sha256');
const expected = expectedFlag >= 0 ? process.argv[expectedFlag + 1] : null;
if (!expected || !/^[a-f0-9]{64}$/u.test(expected)) {
  throw new Error('Pass the exact reviewed candidate hash: --expected-sha256 <64 lowercase hex characters>');
}

const candidateBytes = readFileSync(candidatePath);
const review = JSON.parse(readFileSync(reviewPath, 'utf8'));
const actual = createHash('sha256').update(candidateBytes).digest('hex');
if (review.candidateSha256 !== actual || expected !== actual) {
  throw new Error('Candidate bytes do not match both the refresh review and the explicitly approved SHA-256');
}
writeFileSync(canonicalPath, candidateBytes);
console.log(`Promoted the reviewed Wikidata candidate with SHA-256 ${actual}`);
