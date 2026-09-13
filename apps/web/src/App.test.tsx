import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';

function navigate(route: string) {
  window.location.hash = route;
  fireEvent(window, new HashChangeEvent('hashchange'));
}

function completePersonalChart() {
  navigate('#/my-saju');
  fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1995-10-21' } });
  fireEvent.change(screen.getByLabelText('Birth time'), { target: { value: '14:30' } });
  fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
  expect(screen.getByRole('heading', { name: 'Your Four Pillars' })).toBeInTheDocument();
}

describe('INYEON Compatibility Lab', () => {
  beforeEach(() => {
    window.location.hash = '#/';
  });

  afterEach(() => vi.restoreAllMocks());

  it('presents a US-first Korean-rooted product without claiming approved relationship meaning', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Connection isn’t a verdict/ })).toBeInTheDocument();
    expect(screen.getByText(/Korean Saju \(사주\)/)).toBeInTheDocument();
    expect(screen.getByText(/CANDIDATE METHOD/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start with my Saju/ })).toHaveAttribute('href', '#/my-saju');
    expect(screen.queryByText('What clicks')).not.toBeInTheDocument();
    expect(screen.queryByText('Potential friction')).not.toBeInTheDocument();
  });

  it('navigates all fixed Pages-safe routes and restores direct hash routes', () => {
    render(<App />);
    for (const [route, heading] of [
      ['#/my-saju', /Start with the details/],
      ['#/public-figures', /Compare with a public figure/],
      ['#/inyeon-lab', /clearly fictional reference/],
      ['#/compare-someone', /Keep a private comparison private/],
      ['#/methodology', /Evidence and limits/],
      ['#/privacy', /birth details stay in this tab/],
    ] as const) {
      navigate(route);
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    }
    navigate('#/unknown?birth=private');
    expect(screen.getByRole('heading', { name: /Connection isn’t a verdict/ })).toBeInTheDocument();
  });

  it('states the application-level zero-retention promise without denying platform logs', () => {
    render(<App />);
    navigate('#/privacy');
    expect(screen.getByText(/processed in active browser memory/u)).toBeInTheDocument();
    expect(screen.getByText(/does not put those details in browser storage, URLs, analytics, or app requests/u)).toBeInTheDocument();
    expect(screen.getByText(/GitHub and internet infrastructure may keep separate access and security logs/u)).toBeInTheDocument();
    expect(screen.getByText(/personal birth details are not part of INYEON’s request URLs/u)).toBeInTheDocument();
  });

  it('skips to main content without changing the hash route', () => {
    render(<App />);
    navigate('#/public-figures');
    fireEvent.click(screen.getByRole('button', { name: 'Skip to main content' }));
    expect(window.location.hash).toBe('#/public-figures');
    expect(document.activeElement).toBe(screen.getByRole('main'));
    expect(screen.getByRole('heading', { name: /Compare with a public figure/ })).toBeInTheDocument();
  });

  it('calculates exact and unknown-time charts, shows Hangul first, and clears the session', () => {
    render(<App />);
    completePersonalChart();
    const chart = screen.getByRole('region', { name: 'Your Four Pillars' });
    expect(within(chart).getByText('Calculation method under review')).toBeInTheDocument();
    expect(within(chart).getByText('Exact time provided')).toBeInTheDocument();
    const token = within(chart).getAllByRole('strong')[0]?.textContent ?? '';
    expect(token).toMatch(/[갑을병정무기경신임계][자축인묘진사오미신유술해]/u);
    fireEvent.click(screen.getByRole('button', { name: 'Clear personal data' }));
    expect(screen.queryByRole('heading', { name: 'Your Four Pillars' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Personal data cleared from this tab.');

    fireEvent.click(screen.getByLabelText(/^Unknown/));
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1995-10-21' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(screen.getByText('Birth time unknown')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Not guessed')).toBeInTheDocument();
  });

  it('fails closed for an invalid approximate range', () => {
    render(<App />);
    navigate('#/my-saju');
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1995-10-21' } });
    fireEvent.click(screen.getByLabelText(/^Approximate/));
    fireEvent.change(screen.getByLabelText('Earliest possible time'), { target: { value: '18:00' } });
    fireEvent.change(screen.getByLabelText('Latest possible time'), { target: { value: '10:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Approximate ranges');
  });

  it('calculates valid approximate and disputed time states without false precision', () => {
    render(<App />);
    navigate('#/my-saju');
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1995-10-21' } });
    fireEvent.click(screen.getByLabelText(/^Approximate/));
    fireEvent.change(screen.getByLabelText('Earliest possible time'), { target: { value: '13:30' } });
    fireEvent.change(screen.getByLabelText('Latest possible time'), { target: { value: '15:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(screen.getByText('Approximate time range')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear personal data' }));
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1995-10-21' } });
    fireEvent.click(screen.getByLabelText(/^Disputed/));
    fireEvent.change(screen.getByLabelText('First reported time'), { target: { value: '01:30' } });
    fireEvent.change(screen.getByLabelText('Second reported time'), { target: { value: '03:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(screen.getByText('Multiple time possibilities')).toBeInTheDocument();
  });

  it('completes a public-reference comparison with source and non-endorsement disclosure', async () => {
    render(<App />);
    completePersonalChart();
    navigate('#/public-figures');
    fireEvent.change(screen.getByLabelText('Search public figures'), { target: { value: 'Billie Eilish' } });
    fireEvent.click(await screen.findByRole('button', { name: /Billie Eilish/ }));
    expect(screen.getByText('Date only · no birth time assumed')).toBeInTheDocument();
    expect(screen.getByText('Public reference—not a member or endorsement.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Compare with this reference' }));
    expect(screen.getByRole('heading', { name: 'You + Billie Eilish' })).toBeInTheDocument();
    expect(screen.getByText('Compatibility interpretation isn’t available yet.')).toBeInTheDocument();
    expect(screen.queryByText('What clicks')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear personal data' }));
    expect(screen.queryByRole('heading', { name: 'You + Billie Eilish' })).not.toBeInTheDocument();
    expect(screen.getByText('This private session has no saved chart.')).toBeInTheDocument();
  });

  it('lets people browse beyond the first public-reference page', async () => {
    render(<App />);
    navigate('#/public-figures');
    await screen.findByText('582 references found');
    expect(document.querySelectorAll('.reference-card')).toHaveLength(24);
    fireEvent.click(screen.getByRole('button', { name: /Show 24 more/ }));
    expect(document.querySelectorAll('.reference-card')).toHaveLength(48);
  });

  it('explains unsupported public records and has an honest empty search state', async () => {
    render(<App />);
    navigate('#/public-figures');
    fireEvent.change(screen.getByLabelText('Search public figures'), { target: { value: 'Andy Murray' } });
    fireEvent.click(await screen.findByRole('button', { name: /Andy Murray/ }));
    expect(screen.getByText('Comparison unavailable')).toBeInTheDocument();
    expect(screen.getByText('The birth date is outside the current 1989–2024 calculation range.')).toBeInTheDocument();
    expect(screen.getByText(/birthplace is outside the current Los Angeles/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search public figures'), { target: { value: 'no-such-reference' } });
    expect(screen.getByText('No public references match those filters.')).toBeInTheDocument();
  });

  it('keeps the fictional Lab default-off and labels list, detail, and result states', () => {
    render(<App />);
    completePersonalChart();
    navigate('#/inyeon-lab');
    expect(screen.getByText(/DEFAULT OFF/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open this tab’s preview' }));
    expect(screen.getByText('Fictional character—not a real person or member.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Inyeon Lab Character 00001/ }));
    expect(screen.getByRole('heading', { name: 'Inyeon Lab Character 00001' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Compare with this fictional reference' }));
    expect(screen.getByRole('heading', { name: /You \+ Inyeon Lab Character 00001/ })).toBeInTheDocument();
    expect(screen.getAllByText(/Fictional character—not a real person or member/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Clear personal data' }));
    expect(screen.queryByRole('heading', { name: /You \+ Inyeon Lab Character 00001/ })).not.toBeInTheDocument();
    expect(screen.getByText(/DEFAULT OFF/)).toBeInTheDocument();
  });

  it('completes a local someone-I-know comparison without relationship claims', () => {
    render(<App />);
    completePersonalChart();
    navigate('#/compare-someone');
    expect(screen.getByText(/appropriate reason or permission/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1992-11-27' } });
    fireEvent.click(screen.getByLabelText(/^Unknown/));
    fireEvent.click(screen.getByRole('button', { name: 'Prepare second chart' }));
    fireEvent.click(screen.getByRole('button', { name: 'View comparison details' }));
    expect(screen.getByRole('heading', { name: 'You + someone you know' })).toBeInTheDocument();
    expect(screen.getByText('Compatibility interpretation isn’t available yet.')).toBeInTheDocument();
    expect(screen.queryByText('Why this?')).not.toBeInTheDocument();
  });

  it('does not write personal canaries to persistence, URLs, history, or console', () => {
    const localSpy = vi.spyOn(Storage.prototype, 'setItem');
    const historySpy = vi.spyOn(history, 'pushState');
    const replaceSpy = vi.spyOn(history, 'replaceState');
    const consoleSpy = vi.spyOn(console, 'log');
    render(<App />);
    navigate('#/my-saju');
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1994-07-19' } });
    fireEvent.change(screen.getByLabelText('Birth time'), { target: { value: '03:17' } });
    fireEvent.change(screen.getByLabelText(/^Birthplace \/ time zone/), { target: { value: 'Asia/Seoul' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(localSpy).not.toHaveBeenCalled();
    expect(historySpy).not.toHaveBeenCalled();
    expect(replaceSpy).not.toHaveBeenCalled();
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(window.location.href).not.toContain('1994-07-19');
    expect(window.location.href).not.toContain('03%3A17');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('keeps Hanja secondary to the matching Hangul in methodology copy', () => {
    render(<App />);
    navigate('#/methodology');
    const text = screen.getByRole('main').textContent ?? '';
    for (const [hangul, hanja] of [['사주', '四柱'], ['궁합', '宮合'], ['인연', '因緣']]) {
      expect(text.indexOf(hangul)).toBeGreaterThanOrEqual(0);
      expect(text.indexOf(hangul)).toBeLessThan(text.indexOf(hanja));
    }
  });

  it('previews a locally generated claim-free Lab card and safe link', async () => {
    const context = {
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
      fillStyle: '',
      font: '',
    } as unknown as CanvasRenderingContext2D;
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['safe-png'], { type: 'image/png' })));
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:inyeon-local-preview');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Preview share options' }));
    expect(await screen.findByRole('img', { name: 'Claim-free INYEON share card preview' })).toHaveAttribute('src', 'blob:inyeon-local-preview');
    const link = screen.getByLabelText('Share-safe link') as HTMLInputElement;
    expect(link.value).toContain('#/share?v=inyeon-share-v1&kind=lab-invite');
    expect(link.value).not.toMatch(/birth|chart|evidence|1995-10-21|14%3A30/iu);
    expect(screen.getByText(/contains no birth details, Four Pillars chart/)).toBeInTheDocument();
  });

  it('reconstructs only verified reference or invitation hints and rejects altered links', async () => {
    render(<App />);
    navigate('#/share?v=inyeon-share-v1&kind=public-reference&copy=share-copy-en-us-v1&method=korean-saju-v1&ref=public%3Awd-q29564107');
    expect(await screen.findByRole('heading', { name: 'Explore Billie Eilish in INYEON.' })).toBeInTheDocument();
    expect(screen.getByText(/not imply endorsement, participation/)).toBeInTheDocument();
    expect(screen.getByText('No private result traveled with this link.')).toBeInTheDocument();

    navigate('#/share?v=inyeon-share-v1&kind=compare-invite&copy=share-copy-en-us-v1&method=korean-saju-v1');
    expect(screen.getByRole('heading', { name: 'You’re invited to compare—privately.' })).toBeInTheDocument();
    expect(screen.getByText(/contains no birth details or chart/)).toBeInTheDocument();

    navigate('#/share?v=inyeon-share-v1&kind=lab-invite&copy=share-copy-en-us-v1&method=korean-saju-v1&birth=1995-10-21');
    expect(screen.getByRole('heading', { name: 'This invitation couldn’t be verified.' })).toBeInTheDocument();
  });

  it('keeps Someone I Know results private while offering a separate data-free invitation', () => {
    render(<App />);
    completePersonalChart();
    navigate('#/compare-someone');
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1992-11-27' } });
    fireEvent.click(screen.getByLabelText(/^Unknown/));
    fireEvent.click(screen.getByRole('button', { name: 'Prepare second chart' }));
    fireEvent.click(screen.getByRole('button', { name: 'View comparison details' }));
    const comparison = screen.getByRole('region', { name: 'You + someone you know' });
    expect(within(comparison).queryByText(/PRIVACY-SAFE SHARING/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Invite someone into one private session.' })).toBeInTheDocument();
    expect(screen.getByText(/fixed public allowlist/)).toBeInTheDocument();
  });
});
