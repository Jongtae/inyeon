import { readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { describe, expect, it } from 'vitest';

import {
  ALLOWED_LOCAL_BROWSER_CAPABILITIES,
  FORBIDDEN_RUNTIME_CAPABILITIES,
  PRIVACY_CONTRACT_VERSION,
  PROTECTED_PERSONAL_DATA,
} from './privacy-contract';

const SOURCE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEST_SOURCE = /(?:^|\/)[^/]+\.(?:test|spec)\.[cm]?[jt]sx?$/u;

const anyAccessRoots = new Set([
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'console',
]);
const forbiddenMemberReferences = new Set([
  'navigator.serviceWorker.register',
  'navigator.sendBeacon',
  'history.pushState',
  'history.replaceState',
  'document.cookie',
]);

function runtimeSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return runtimeSourceFiles(path);
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name))) return [];
    return TEST_SOURCE.test(path) ? [] : [path];
  });
}

function constantString(expression: ts.Expression): string | null {
  if (ts.isStringLiteralLike(expression)) return expression.text;
  if (ts.isBinaryExpression(expression) && expression.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = constantString(expression.left);
    const right = constantString(expression.right);
    return left !== null && right !== null ? left + right : null;
  }
  return null;
}

function expressionPath(expression: ts.Expression, aliases: ReadonlyMap<string, string>): string | null {
  if (ts.isIdentifier(expression)) return aliases.get(expression.text) ?? expression.text;
  if (ts.isPropertyAccessExpression(expression)) {
    const owner = expressionPath(expression.expression, aliases);
    return owner ? `${owner}.${expression.name.text}` : null;
  }
  if (ts.isElementAccessExpression(expression) && expression.argumentExpression) {
    const owner = expressionPath(expression.expression, aliases);
    const key = constantString(expression.argumentExpression);
    return owner && key !== null ? `${owner}.${key}` : null;
  }
  return null;
}

function accessRoot(path: string): string {
  return globalPath(path).split('.')[0];
}

function globalPath(path: string): string {
  return path.replace(/^(?:window|globalThis|self)\./u, '');
}

function privacyBoundaryViolations(sourceText: string, file = 'privacy-fixture.ts'): string[] {
  const source = ts.createSourceFile(
    file,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const violations: string[] = [];
  const aliases = new Map<string, string>();
  const report = (node: ts.Node, capability: string) => {
    const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
    violations.push(`${relative(SOURCE_ROOT, file)}:${line + 1}:${character + 1} uses ${capability}`);
  };
  const isForbiddenPath = (path: string) => {
    const normalizedPath = globalPath(path);
    return anyAccessRoots.has(accessRoot(path))
      || forbiddenMemberReferences.has(normalizedPath)
      || normalizedPath.startsWith('console.');
  };

  const visit = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const target = expressionPath(node.initializer, aliases);
      if (target) aliases.set(node.name.text, target);
    }

    if (ts.isIdentifier(node) && anyAccessRoots.has(node.text)) {
      const isMemberName = ts.isPropertyAccessExpression(node.parent) && node.parent.name === node;
      const isLiteralElementKey = ts.isElementAccessExpression(node.parent)
        && node.parent.argumentExpression === node;
      if (!isMemberName && !isLiteralElementKey) {
        report(node, node.text);
        return;
      }
    }

    if (ts.isIdentifier(node) && !(ts.isVariableDeclaration(node.parent) && node.parent.name === node)) {
      const target = aliases.get(node.text);
      if (target && isForbiddenPath(target)) {
        report(node, target);
        return;
      }
    }

    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const path = expressionPath(node, aliases);
      if (path && isForbiddenPath(path)) {
        report(node, path);
        return;
      }
    }

    ts.forEachChild(node, visit);
  };
  visit(source);
  return violations;
}

function findPrivacyBoundaryViolations(file: string): string[] {
  return privacyBoundaryViolations(readFileSync(file, 'utf8'), file);
}

describe('versioned zero-retention source contract', () => {
  it('names the protected data and narrow local-output exceptions explicitly', () => {
    expect(PRIVACY_CONTRACT_VERSION).toBe('inyeon-zero-retention-v1');
    expect(PROTECTED_PERSONAL_DATA).toEqual(expect.arrayContaining([
      'birth-date',
      'birth-time-and-precision',
      'birthplace-and-coordinates',
      'normalized-personal-chart-and-four-pillars',
      'derived-personal-chart-features',
      'private-pair-compatibility-evidence',
      'user-entered-someone-i-know-data',
    ]));
    expect(FORBIDDEN_RUNTIME_CAPABILITIES.map(({ capability }) => capability)).toEqual(expect.arrayContaining([
      'localStorage',
      'sessionStorage',
      'indexedDB',
      'caches',
      'document.cookie',
      'navigator.serviceWorker.register',
      'navigator.sendBeacon',
      'fetch',
      'XMLHttpRequest',
      'WebSocket',
      'console',
      'history.pushState/replaceState',
    ]));
    expect(ALLOWED_LOCAL_BROWSER_CAPABILITIES).toEqual(expect.arrayContaining([
      'native-web-share-with-validated-share-artifacts',
      'canvas-rendering',
      'blob-and-short-lived-object-url-downloads',
      'dynamic-import-of-checked-in-static-assets',
    ]));
  });

  it('keeps forbidden persistence, egress, logging, and history calls out of runtime source', () => {
    const files = runtimeSourceFiles(SOURCE_ROOT);
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap(findPrivacyBoundaryViolations)).toEqual([]);
  });

  it('detects direct, qualified, computed, constructed, and aliased forbidden capabilities', () => {
    const violations = privacyBoundaryViolations(`
      localStorage.setItem('key', 'value');
      const storageAlias = window['sessionStorage'];
      indexedDB.open('private');
      caches.open('private');
      document.cookie = 'private=true';
      navigator.serviceWorker.register('/worker.js');
      navigator.sendBeacon('/collect', 'private');
      fetch('/collect');
      const fetchAlias = window.fetch;
      new XMLHttpRequest();
      new self.WebSocket('wss://example.test');
      console.log('private');
      history.pushState({}, '', '/private');
      window.history.replaceState({}, '', '/private');
      const browser = window;
      browser['fe' + 'tch']('/collect');
      const nav = navigator;
      nav['send' + 'Beacon']('/collect', 'private');
      const root = window;
      const storage = root['local' + 'Storage'];
      storage.setItem('key', 'private');
    `);

    expect(violations.length).toBeGreaterThanOrEqual(18);
    expect(violations.join('\n')).toMatch(/localStorage|sessionStorage|indexedDB|caches|cookie/u);
    expect(violations.join('\n')).toMatch(/serviceWorker\.register|sendBeacon|fetch|XMLHttpRequest|WebSocket/u);
    expect(violations.join('\n')).toMatch(/console\.log|history\.pushState|history\.replaceState/u);
  });

  it('allows the existing local share, canvas, blob, and static-import paths', () => {
    expect(privacyBoundaryViolations(`
      navigator.share({ url: safeUrl });
      navigator.clipboard.writeText(safeUrl);
      const canvas = document.createElement('canvas');
      const image = new Blob(['safe'], { type: 'image/png' });
      const objectUrl = URL.createObjectURL(image);
      URL.revokeObjectURL(objectUrl);
      void import('./checked-in-static-asset');
      canvas.toBlob(() => undefined);
    `)).toEqual([]);
  });
});
