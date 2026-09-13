import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import App from './App';

describe('INYEON application shell', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  it('presents the product honestly without claiming a calculation is available', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /인연을 맞히는 대신/ })).toBeInTheDocument();
    expect(screen.getByText(/계산 기능은 검증을 마친 뒤 공개됩니다/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /계산|시작/ })).not.toBeInTheDocument();
  });

  it('navigates to fixed methodology and privacy routes using the URL hash', () => {
    render(<App />);

    const methodologyLink = screen.getByRole('link', { name: 'Methodology' });
    expect(methodologyLink).toHaveAttribute('href', '#/methodology');
    window.location.hash = '#/methodology';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(screen.getByRole('heading', { name: /해석보다 먼저/ })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/methodology');

    const privacyLink = screen.getByRole('link', { name: 'Privacy' });
    expect(privacyLink).toHaveAttribute('href', '#/privacy');
    window.location.hash = '#/privacy';
    fireEvent(window, new HashChangeEvent('hashchange'));
    expect(screen.getByRole('heading', { name: /정보가 머무르지 않도록/ })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/privacy');
  });

  it('renders a direct hash route again after the application is remounted', () => {
    window.location.hash = '#/privacy';

    const firstLoad = render(<App />);
    expect(screen.getByRole('heading', { name: /정보가 머무르지 않도록/ })).toBeInTheDocument();

    firstLoad.unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: /정보가 머무르지 않도록/ })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/privacy');
  });
});
