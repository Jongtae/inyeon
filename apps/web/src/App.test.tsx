import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import App from './App';

describe('INYEON application shell', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('presents the product honestly without claiming a calculation is available', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Connection is not a verdict/ })).toBeInTheDocument();
    expect(screen.getByText(/CALCULATIONS LAUNCH ONLY AFTER VALIDATION/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /calculate|start/i })).not.toBeInTheDocument();
  });

  it('navigates to fixed methodology and privacy routes using the URL hash', () => {
    render(<App />);

    const methodologyLink = screen.getByRole('link', { name: 'Methodology' });
    expect(methodologyLink).toHaveAttribute('href', '#/methodology');
    window.location.hash = '#/methodology';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(screen.getByRole('heading', { name: /Evidence and limits/ })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/methodology');

    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    expect(privacyLink).toHaveAttribute('href', '#/privacy');
    window.location.hash = '#/privacy';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(screen.getByRole('heading', { name: /birth data does not linger/ })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/privacy');
  });

  it('renders a direct hash route again after the application is remounted', () => {
    window.location.hash = '#/privacy';

    const firstLoad = render(<App />);
    expect(screen.getByRole('heading', { name: /birth data does not linger/ })).toBeInTheDocument();

    firstLoad.unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: /birth data does not linger/ })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/privacy');
  });
});
