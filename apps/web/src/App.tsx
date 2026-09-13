import { useEffect, useMemo, useState } from 'react';
import {
  PUBLIC_FIGURE_DISCLOSURE,
  searchPublicFigures,
  type PublicFigureCategory,
  type PublicFigureRecord,
} from '@inyeon/public-figures';
import {
  SYNTHETIC_DISCLOSURE,
  createSyntheticInventory,
  generateSyntheticReferenceSubject,
  type SyntheticCharacter,
} from '@inyeon/synthetic-characters';

import { BirthForm } from './components/BirthForm';
import { BrandMark } from './components/BrandMark';
import {
  calculateProfile,
  compareProfiles,
  temporalLabel,
  type CalculatedProfile,
  type ComparisonResult,
} from './lib/product';
import { type AppRoute, hashForRoute, routeFromHash } from './lib/routing';

const pillars = [
  { index: '01', title: 'Korean Saju', titleEn: '사주 · Four Pillars', description: 'See a Korean Four Pillars chart through explicit calendar rules and visible limits.' },
  { index: '02', title: 'Reviewed interpretation', titleEn: 'No guesswork', description: 'Relationship sections stay unavailable until evidence and cultural review are complete.' },
  { index: '03', title: 'Private by design', titleEn: 'This tab only', description: 'Personal birth details stay in active browser memory and disappear when you refresh.' },
];

const positions = [['year', 'Year'], ['month', 'Month'], ['day', 'Day'], ['hour', 'Hour']] as const;

function useHashRoute(): AppRoute {
  const [route, setRoute] = useState(() => routeFromHash(window.location.hash));
  useEffect(() => {
    const updateRoute = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);
  useEffect(() => {
    requestAnimationFrame(() => document.querySelector<HTMLElement>('#page-title')?.focus());
  }, [route]);
  return route;
}

function PageIntro({ eyebrow, title, children }: { readonly eyebrow: string; readonly title: string; readonly children: React.ReactNode }) {
  return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1 id="page-title" tabIndex={-1}>{title}</h1><div className="page-lead">{children}</div></header>;
}

function ChartCard({ profile, title }: { readonly profile: CalculatedProfile; readonly title: string }) {
  return (
    <section className="chart-card" aria-labelledby="chart-title">
      <div className="card-heading"><div><p className="eyebrow">KOREAN SAJU · 사주</p><h2 id="chart-title">{title}</h2></div><span className="status-badge">Calculation method under review</span></div>
      <p className="temporal-summary">{temporalLabel(profile.chart.temporalSupport)}</p>
      <div className="pillar-row" aria-label="Four Pillars chart">
        {positions.map(([position, label]) => {
          const stable = profile.chart.stablePillars[position];
          return (
            <article key={position}><span>{label}</span>{stable.support === 'invariant'
              ? <><strong>{stable.pillar.stem}{stable.pillar.branch}</strong><small>({stable.pillar.stemHanja}{stable.pillar.branchHanja})</small></>
              : stable.support === 'alternative'
                ? <><strong>Varies</strong><small>Across retained times</small></>
                : <><strong>Unavailable</strong><small>Not guessed</small></>}</article>
          );
        })}
      </div>
      <p className="candidate-note">This chart uses INYEON’s candidate Korean Saju method. It is reproducible, but production methodology review is still pending.</p>
    </section>
  );
}

function ComparisonPanel({ result, targetLabel }: { readonly result: ComparisonResult; readonly targetLabel: string }) {
  if (result.status === 'error') return <p className="form-error" role="alert">{result.message}</p>;
  const { narrative } = result;
  return (
    <section className="comparison-panel" aria-labelledby="comparison-title">
      <p className="eyebrow">COMPARISON DETAILS</p><h2 id="comparison-title">You + {targetLabel}</h2>
      <div className="no-evidence-panel"><strong>Compatibility interpretation isn’t available yet.</strong><p>{narrative.status.text}</p><p>INYEON currently has no relationship mappings that have completed evidence and cultural review. We won’t fill the gap with guesses.</p></div>
      {narrative.limitations.length > 0 && <div className="detail-list"><h3>What this result can and cannot support</h3><ul>{narrative.limitations.map((item) => <li key={item.copyKey}>{item.text}</li>)}</ul></div>}
      <div className="disclosure-stack">{narrative.disclosures.map((item) => <p key={item.copyKey}>{item.text}</p>)}</div>
      <div className="result-actions"><a href={hashForRoute('/methodology')}>Read the methodology</a><span>Sharing will be added after privacy review in Issue #43.</span></div>
    </section>
  );
}

function SessionEnded({ message = 'Start with your Saju before choosing a comparison.' }: { readonly message?: string }) {
  return <div className="empty-state"><strong>This private session has no saved chart.</strong><p>{message} Refreshing or clearing the tab intentionally removes personal results.</p><a className="primary-link" href={hashForRoute('/my-saju')}>Start with my Saju <span aria-hidden="true">→</span></a></div>;
}

function Landing() {
  return (
    <><section className="hero" aria-labelledby="page-title"><div className="hero-copy"><p className="eyebrow">KOREAN COMPATIBILITY LAB</p><h1 id="page-title" tabIndex={-1}>Connection isn’t a verdict.<br /><em>It’s a conversation.</em></h1><p className="hero-lead">Explore Korean Saju (사주)—part of the broader East Asian Four Pillars tradition—as a lens for reflection, not a prediction or score.</p><a className="primary-link" href={hashForRoute('/my-saju')}>Start with my Saju <span aria-hidden="true">→</span></a><p className="release-note">CANDIDATE METHOD · PUBLIC RELEASE PENDING REVIEW</p></div><div className="hero-orbit" aria-hidden="true"><div className="orbit orbit-outer" /><div className="orbit orbit-inner" /><div className="orb orb-sun" /><div className="orb orb-moon" /><span className="glyph glyph-left">인</span><span className="glyph glyph-right">연</span></div></section>
      <section className="pillars" aria-label="Product principles">{pillars.map((pillar) => <article key={pillar.index}><span className="pillar-index">{pillar.index}</span><h2>{pillar.title}<small>{pillar.titleEn}</small></h2><p>{pillar.description}</p></article>)}</section>
      <aside className="context-note"><span>COMPATIBILITY IS CONTEXT, NOT DESTINY.</span><p>INYEON never assigns a soulmate score, ranks people, or predicts whether a relationship will succeed.</p></aside></>
  );
}

function MySajuPage({ profile, onCalculated, resetVersion }: { readonly profile: CalculatedProfile | null; readonly onCalculated: (profile: CalculatedProfile) => void; readonly resetVersion: number }) {
  return (
    <section className="lab-page"><PageIntro eyebrow="STEP 1 · MY SAJU" title="Start with the details you actually know."><p>Your birth details stay in this tab. Missing time remains missing; INYEON does not invent it.</p></PageIntro>
      <BirthForm key={resetVersion} idPrefix="personal" title="Calculate my Korean Saju" description="Choose one of the three birth locations currently covered by the candidate calculation profile." submitLabel="Calculate my chart" onCalculated={onCalculated} />
      {profile && <div className="result-stack" aria-live="polite"><ChartCard profile={profile} title="Your Four Pillars" /><section className="next-step" aria-labelledby="choose-reference-title"><p className="eyebrow">STEP 2 · CHOOSE A REFERENCE</p><h2 id="choose-reference-title">Explore a comparison—without a score.</h2><div className="choice-grid"><a href={hashForRoute('/public-figures')}><strong>Public figures</strong><span>Compare with source-backed public birth data.</span></a><a href={hashForRoute('/inyeon-lab')}><strong>Fictional Lab</strong><span>Explore clearly fictional reference characters.</span></a><a href={hashForRoute('/compare-someone')}><strong>Someone I know</strong><span>Enter a second person locally, with an appropriate reason or permission.</span></a></div></section></div>}
    </section>
  );
}

function PublicFiguresPage({ personal }: { readonly personal: CalculatedProfile | null }) {
  const [catalog, setCatalog] = useState<typeof import('@inyeon/public-figures/catalog') | null>(null);
  const [catalogError, setCatalogError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PublicFigureCategory | ''>('');
  const [eligibleOnly, setEligibleOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [selected, setSelected] = useState<PublicFigureRecord | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  useEffect(() => {
    let active = true;
    void import('@inyeon/public-figures/catalog')
      .then((loaded) => { if (active) setCatalog(loaded); })
      .catch(() => { if (active) setCatalogError(true); });
    return () => { active = false; };
  }, []);
  const results = useMemo(() => searchPublicFigures(catalog?.PUBLIC_FIGURE_SEARCH_INDEX ?? [], { ...(query ? { query } : {}), ...(category ? { category } : {}) }).filter((entry) => !eligibleOnly || entry.comparisonEligibility === 'eligible'), [catalog, query, category, eligibleOnly]);
  const open = (id: PublicFigureRecord['id']) => { setSelected(catalog?.getPublicFigure(id) ?? null); setComparison(null); };
  const compare = () => {
    const context = selected?.comparisonEligibility.chartContext;
    if (!personal || !selected || !context) return;
    const target = calculateProfile(context);
    setComparison(target.status === 'ok' ? compareProfiles(personal, target.profile, 'public-figure-reference') : target);
  };
  return (
    <section className="lab-page"><PageIntro eyebrow="PUBLIC REFERENCES" title="Compare with a public figure—carefully."><p>Browse source-backed reference records. Public figures are not members, prospects, or endorsers, and only 13 current records can be compared.</p></PageIntro>{!personal && <SessionEnded />}
      <div className="browse-layout"><div><div className="filter-bar" role="search"><label><span>Search public figures</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(24); }} placeholder="Search by name" /></label><label><span>Category</span><select value={category} onChange={(event) => { setCategory(event.target.value as PublicFigureCategory | ''); setVisibleCount(24); }}><option value="">All categories</option><option value="actor">Actors</option><option value="music">Music</option><option value="sports">Sports</option><option value="creator">Creators</option></select></label><label className="checkbox-field"><input type="checkbox" checked={eligibleOnly} onChange={(event) => { setEligibleOnly(event.target.checked); setVisibleCount(24); }} /> Comparison available now</label></div><p className="result-count" aria-live="polite">{results.length} reference{results.length === 1 ? '' : 's'} found</p>
        {catalogError ? <div className="empty-state" role="alert"><strong>Public references could not be loaded.</strong><p>Refresh the page and try again.</p></div> : !catalog ? <div className="empty-state" role="status"><strong>Loading public references…</strong><p>The checked-in catalog is loading from this static site.</p></div> : results.length === 0 ? <div className="empty-state"><strong>No public references match those filters.</strong><p>Try a different name or category.</p></div> : <><div className="reference-grid">{results.slice(0, visibleCount).map((entry) => <button key={entry.id} className="reference-card" type="button" onClick={() => open(entry.id)} aria-pressed={selected?.id === entry.id}><span className="reference-monogram" aria-hidden="true">{entry.displayName.split(/\s+/u).map((part) => part[0]).join('').slice(0, 2)}</span><span><strong>{entry.displayName}</strong><small>{entry.category} · {entry.regions[0]}</small></span><em className={entry.comparisonEligibility === 'eligible' ? 'available' : ''}>{entry.comparisonEligibility === 'eligible' ? 'Comparison available' : 'Browse only'}</em></button>)}</div>{visibleCount < results.length && <button className="show-more" type="button" onClick={() => setVisibleCount((count) => count + 24)}>Show 24 more <span aria-hidden="true">↓</span></button>}</>}</div>
        <aside className="reference-detail" aria-live="polite">{selected ? <><p className="eyebrow">PUBLIC REFERENCE</p><h2>{selected.displayName}</h2><dl><div><dt>Birth date</dt><dd>{selected.birth.date.value}</dd></div><div><dt>Birth data status</dt><dd>Date only · no birth time assumed</dd></div><div><dt>Birthplace source</dt><dd>{selected.birth.place.value?.label ?? 'Unavailable'}</dd></div><div><dt>Source status</dt><dd>Single structured source</dd></div></dl><p>{PUBLIC_FIGURE_DISCLOSURE.short}</p><p>{PUBLIC_FIGURE_DISCLOSURE.dateOnly}</p><a href={selected.sourceRecords[0]?.url} target="_blank" rel="noreferrer">View source on Wikidata <span aria-hidden="true">↗</span></a>{selected.comparisonEligibility.status === 'eligible' ? <button type="button" className="primary-button" onClick={compare} disabled={!personal}>Compare with this reference</button> : <div className="unavailable-note"><strong>Comparison unavailable</strong><ul>{selected.comparisonEligibility.reasons.map((reason) => <li key={reason}>{reason === 'BIRTH_DATE_OUTSIDE_ADAPTER_RANGE' ? 'The birth date is outside the current 1989–2024 calculation range.' : 'The birthplace is outside the current Los Angeles, New York City, and Seoul timezone set.'}</li>)}</ul></div>}</> : <div className="empty-state"><strong>Select a reference.</strong><p>Source and availability details will appear here.</p></div>}</aside></div>
      {comparison && selected && <ComparisonPanel result={comparison} targetLabel={selected.displayName} />}
    </section>
  );
}

function SyntheticCard({ character, selected, onSelect }: { readonly character: SyntheticCharacter; readonly selected: boolean; readonly onSelect: () => void }) {
  return <button className="synthetic-card" type="button" onClick={onSelect} aria-pressed={selected}><span className={`abstract-avatar ${character.avatar.paletteId}`} aria-hidden="true"><i /><i /><i /></span><span><strong>{character.displayName}</strong><small>{character.avatar.motifLabel}</small></span><em>Fictional Lab character</em></button>;
}

function InyeonLabPage({ personal }: { readonly personal: CalculatedProfile | null }) {
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState<SyntheticCharacter | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const inventory = useMemo(() => createSyntheticInventory(enabled), [enabled]);
  const characters = useMemo(() => inventory.list(0, 12), [inventory]);
  const compare = () => {
    if (!personal || !selected) return;
    const target = calculateProfile(generateSyntheticReferenceSubject(selected.seedIndex).chartContext);
    setComparison(target.status === 'ok' ? compareProfiles(personal, target.profile, 'synthetic-reference') : target);
  };
  return (
    <section className="lab-page"><PageIntro eyebrow="INYEON LAB · 인연 실험실" title="Explore a clearly fictional reference."><p>Abstract characters make the calculation flow explorable without pretending to be real people, members, or dating activity.</p></PageIntro>{!personal && <SessionEnded />}
      {!enabled ? <div className="preview-gate"><p className="eyebrow">CANDIDATE PREVIEW · DEFAULT OFF</p><h2>Fictional Lab exploration is still under release review.</h2><p>{SYNTHETIC_DISCLOSURE.full}</p><button className="primary-button" type="button" onClick={() => setEnabled(true)}>Open this tab’s preview</button></div> : <><p className="persistent-disclosure">{SYNTHETIC_DISCLOSURE.short}</p><div className="synthetic-grid">{characters.map((character) => <SyntheticCard key={character.id} character={character} selected={selected?.id === character.id} onSelect={() => { setSelected(character); setComparison(null); }} />)}</div>{selected && <section className="synthetic-detail"><div className={`abstract-avatar large ${selected.avatar.paletteId}`} aria-label={selected.avatar.alt}><i /><i /><i /></div><div><p className="eyebrow">FICTIONAL LAB CHARACTER</p><h2>{selected.displayName}</h2><p>{selected.fictional.shortDisclosure}</p><p>{SYNTHETIC_DISCLOSURE.fixture}</p><p className="scenario-line">Independent scene prompts: {selected.scenarioPrompts.map(({ label }) => label).join(' · ')}</p><button className="primary-button" type="button" onClick={compare} disabled={!personal}>Compare with this fictional reference</button></div></section>}</>}
      {comparison && selected && <ComparisonPanel result={comparison} targetLabel={selected.displayName} />}
    </section>
  );
}

function SomeonePage({ personal }: { readonly personal: CalculatedProfile | null }) {
  const [other, setOther] = useState<CalculatedProfile | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  return (
    <section className="lab-page"><PageIntro eyebrow="SOMEONE I KNOW" title="Keep a private comparison private."><p>Only enter someone else’s birth information when you have an appropriate reason or permission. This is not a member search or matching feature.</p></PageIntro>{!personal && <SessionEnded />}
      {personal && <BirthForm idPrefix="someone" title="Add the second chart" description="Their details are calculated locally in this tab and are not saved." submitLabel="Prepare second chart" onCalculated={(profile) => { setOther(profile); setComparison(null); }} />}
      {personal && other && <div className="result-stack"><ChartCard profile={other} title="Second Four Pillars chart" /><button className="primary-button" type="button" onClick={() => setComparison(compareProfiles(personal, other, 'someone-i-know'))}>View comparison details</button></div>}
      {comparison && <ComparisonPanel result={comparison} targetLabel="someone you know" />}
    </section>
  );
}

function Methodology() {
  return <section className="detail-page" aria-labelledby="page-title"><PageIntro eyebrow="METHODOLOGY" title="Evidence and limits come before interpretation."><p>INYEON does not present Saju as scientific prediction or fixed destiny. The current calculation profile is a candidate. Any relationship interpretation must come from reviewed, versioned deterministic rules; none are approved yet.</p></PageIntro><div className="principle-grid"><article><span>CALCULATION</span><h2>Reproducible rules</h2><p>The same input and versioned method produce the same chart.</p></article><article><span>MEANING</span><h2>Context, not destiny</h2><p>INYEON will offer perspectives for conversation only after review—not verdicts on a relationship.</p></article><article><span>AVAILABLE DETAIL</span><h2>Unknown stays unknown</h2><p>Missing or disputed birth time is preserved instead of converted into false precision.</p></article></div><section className="glossary" aria-labelledby="glossary-title"><h2 id="glossary-title">Korean-rooted terms</h2><dl><div><dt>Saju (사주; 四柱)</dt><dd>A Korean practice within the broader East Asian Four Pillars tradition.</dd></div><div><dt>Gung-hap (궁합; 宮合)</dt><dd>A Korean compatibility tradition. INYEON has not yet approved modern relationship mappings.</dd></div><div><dt>Inyeon (인연; 因緣)</dt><dd>A word for connection or relational ties—the name behind this Lab.</dd></div></dl></section></section>;
}

function Privacy() {
  return <section className="detail-page" aria-labelledby="page-title"><PageIntro eyebrow="PRIVACY" title="Your birth details stay in this tab."><p>Personal birth input and private comparison results are processed in active browser memory. INYEON has no account or application server and does not put those details in browser storage, URLs, analytics, or app requests.</p></PageIntro><div className="privacy-note"><strong>What “this tab only” means</strong><p>Refresh the page or use Clear personal data to remove the active personal session.</p><p>Static files are hosted on GitHub Pages. GitHub and internet infrastructure may keep separate access and security logs, but personal birth details are not part of INYEON’s request URLs.</p></div></section>;
}

function LabNav({ route }: { readonly route: AppRoute }) {
  const items = [['/my-saju', 'My Saju'], ['/public-figures', 'Public figures'], ['/inyeon-lab', 'Fictional Lab'], ['/compare-someone', 'Someone I know']] as const;
  if (!items.some(([path]) => path === route)) return null;
  return <nav className="lab-nav" aria-label="Lab steps">{items.map(([path, label], index) => <a key={path} aria-current={route === path ? 'step' : undefined} href={hashForRoute(path)}><span>{index + 1}</span>{label}</a>)}</nav>;
}

export default function App() {
  const route = useHashRoute();
  const [personal, setPersonal] = useState<CalculatedProfile | null>(null);
  const [resetVersion, setResetVersion] = useState(0);
  const [clearMessage, setClearMessage] = useState('');
  const clearPersonalData = () => { setPersonal(null); setResetVersion((value) => value + 1); setClearMessage('Personal data cleared from this tab.'); };
  let page: React.ReactNode;
  if (route === '/') page = <Landing />;
  else if (route === '/my-saju') page = <MySajuPage profile={personal} onCalculated={(profile) => { setPersonal(profile); setClearMessage(''); }} resetVersion={resetVersion} />;
  else if (route === '/public-figures') page = <PublicFiguresPage key={resetVersion} personal={personal} />;
  else if (route === '/inyeon-lab') page = <InyeonLabPage key={resetVersion} personal={personal} />;
  else if (route === '/compare-someone') page = <SomeonePage key={resetVersion} personal={personal} />;
  else if (route === '/methodology') page = <Methodology />;
  else page = <Privacy />;
  return (
    <div className="site-shell"><button className="skip-link" type="button" onClick={() => document.querySelector<HTMLElement>('#main-content')?.focus()}>Skip to main content</button><header className="site-header"><a className="brand" href={hashForRoute('/')} aria-label="INYEON home"><BrandMark /><span>INYEON<small>인연 · CONNECTION</small></span></a><nav aria-label="Primary navigation"><a aria-current={route === '/' || route === '/my-saju' || route === '/public-figures' || route === '/inyeon-lab' || route === '/compare-someone' ? 'page' : undefined} href={hashForRoute('/')}>Lab</a><a aria-current={route === '/methodology' ? 'page' : undefined} href={hashForRoute('/methodology')}>Methodology</a><a aria-current={route === '/privacy' ? 'page' : undefined} href={hashForRoute('/privacy')}>Privacy</a></nav>{personal && <button className="clear-button" type="button" onClick={clearPersonalData}>Clear personal data</button>}</header><LabNav route={route} /><p className="sr-only" role="status" aria-live="polite">{clearMessage}</p><main id="main-content" tabIndex={-1}>{page}</main><footer><span>INYEON · 인연</span><p>Exploring Korean Saju with clear limits.</p><span>SEOUL · 2026</span></footer></div>
  );
}
