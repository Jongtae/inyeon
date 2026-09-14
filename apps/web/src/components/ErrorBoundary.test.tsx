import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PRIVACY_SAFE_ROOT_ERROR_HANDLERS } from '../lib/error-handlers';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = false;

function TestContent() {
  if (shouldThrow) throw new Error('private birth detail: 1995-10-21 at 14:30');
  return <p>Lab ready</p>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = false;
    window.location.hash = '#/my-saju';
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders children while the application is healthy', () => {
    render(
      <ErrorBoundary>
        <TestContent />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Lab ready')).toBeInTheDocument();
  });

  it('keeps React root error hooks silent even when an exception contains private input', () => {
    const canary = new Error('1995-10-21 14:30 Asia/Seoul');

    PRIVACY_SAFE_ROOT_ERROR_HANDLERS.onCaughtError(canary);
    PRIVACY_SAFE_ROOT_ERROR_HANDLERS.onUncaughtError(canary);
    PRIVACY_SAFE_ROOT_ERROR_HANDLERS.onRecoverableError(canary);

    expect(console.error).not.toHaveBeenCalled();
  });

  it('fails closed without exposing raw exception details and reloads on request', () => {
    const reloadPage = vi.fn();
    shouldThrow = true;

    render(
      <ErrorBoundary reloadPage={reloadPage}>
        <TestContent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'This page needs a fresh start.' })).toBeInTheDocument();
    expect(screen.getByText(/did not send an error report/u)).toBeInTheDocument();
    expect(screen.queryByText(/1995-10-21/u)).not.toBeInTheDocument();
    expect(screen.queryByText(/14:30/u)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reload the page' }));
    expect(reloadPage).toHaveBeenCalledOnce();
  });

  it('returns to the home route and remounts clean content', () => {
    shouldThrow = true;
    render(
      <ErrorBoundary>
        <TestContent />
      </ErrorBoundary>,
    );
    shouldThrow = false;

    fireEvent.click(screen.getByRole('button', { name: 'Return to INYEON home' }));

    expect(window.location.hash).toBe('#/');
    expect(screen.getByText('Lab ready')).toBeInTheDocument();
  });
});
