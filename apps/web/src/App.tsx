import { useEffect, useState } from 'react';

import { BrandMark } from './components/BrandMark';
import { type AppRoute, hashForRoute, routeFromHash } from './lib/routing';

const pillars = [
  {
    index: '01',
    title: 'Your Saju',
    titleEn: 'Four Pillars',
    description: 'Read your Four Pillars through validated calendar rules and explicit uncertainty.',
  },
  {
    index: '02',
    title: 'Relationship texture',
    titleEn: 'Not a score',
    description: 'Explore what may click, where tension could appear, and the evidence behind it.',
  },
  {
    index: '03',
    title: 'Private by design',
    titleEn: 'Memory only',
    description: 'Personal input stays in active browser memory and disappears when you refresh.',
  },
];

function useHashRoute(): AppRoute {
  const [route, setRoute] = useState(() => routeFromHash(window.location.hash));

  useEffect(() => {
    const updateRoute = () => setRoute(routeFromHash(window.location.hash));
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  return route;
}

function Methodology() {
  return (
    <section className="detail-page" aria-labelledby="methodology-title">
      <p className="eyebrow">METHODOLOGY</p>
      <h1 id="methodology-title">Evidence and limits come before interpretation.</h1>
      <p className="detail-lead">
        INYEON does not present Saju as scientific prediction or fixed destiny. Calendar calculations and
        relationship rules are deterministic and versioned. When a birth time is missing or a source is
        disputed, the product shows that uncertainty instead of hiding it.
      </p>
      <div className="principle-grid">
        <article><span>CALCULATION</span><h2>Reproducible rules</h2><p>The same input and versions produce the same result.</p></article>
        <article><span>MEANING</span><h2>Context, not destiny</h2><p>We offer perspectives for conversation, not verdicts on a relationship.</p></article>
        <article><span>CONFIDENCE</span><h2>Unknown stays unknown</h2><p>We never invent a missing birth time to create false precision.</p></article>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="detail-page" aria-labelledby="privacy-title">
      <p className="eyebrow">PRIVACY</p>
      <h1 id="privacy-title">Designed so your birth data does not linger.</h1>
      <p className="detail-lead">
        In the first public release, personal birth input and private comparison results are processed only
        in active browser memory. There is no account or application server, and INYEON does not send that
        input to browser storage, URLs, analytics, or third parties.
      </p>
      <div className="privacy-note">
        <strong>The product foundation is still being built.</strong>
        <p>This preview has no birth-data form or calculation yet. Features appear only after validation.</p>
        <p>GitHub Pages and internet infrastructure may keep separate access and security logs.</p>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">KOREAN COMPATIBILITY LAB</p>
          <h1 id="hero-title">
            Connection is not a verdict.<br />
            <em>It is a conversation.</em>
          </h1>
          <p className="hero-lead">
            Explore Korean Saju and compatibility as one lens for understanding relationship dynamics—not a prediction of your future.
          </p>
          <a className="primary-link" href={hashForRoute('/methodology')}>
            See our approach <span aria-hidden="true">↗</span>
          </a>
          <p className="release-note">CALCULATIONS LAUNCH ONLY AFTER VALIDATION · PREVIEW FOUNDATION</p>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit orbit-outer" />
          <div className="orbit orbit-inner" />
          <div className="orb orb-sun" />
          <div className="orb orb-moon" />
          <span className="glyph glyph-left">인</span>
          <span className="glyph glyph-right">연</span>
        </div>
      </section>
      <section className="pillars" aria-label="Product principles">
        {pillars.map((pillar) => (
          <article key={pillar.index}>
            <span className="pillar-index">{pillar.index}</span>
            <h2>{pillar.title}<small>{pillar.titleEn}</small></h2>
            <p>{pillar.description}</p>
          </article>
        ))}
      </section>
      <aside className="context-note">
        <span>COMPATIBILITY IS CONTEXT, NOT DESTINY.</span>
        <p>Compatibility is language for exploring a dynamic—not a score that judges people or predicts a future.</p>
      </aside>
    </>
  );
}

export default function App() {
  const route = useHashRoute();

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href={hashForRoute('/')} aria-label="INYEON home">
          <BrandMark />
          <span>INYEON<small>인연 · CONNECTION</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a aria-current={route === '/' ? 'page' : undefined} href={hashForRoute('/')}>Lab</a>
          <a aria-current={route === '/methodology' ? 'page' : undefined} href={hashForRoute('/methodology')}>Methodology</a>
          <a aria-current={route === '/privacy' ? 'page' : undefined} href={hashForRoute('/privacy')}>Privacy</a>
        </nav>
      </header>
      <main>{route === '/' ? <Landing /> : route === '/methodology' ? <Methodology /> : <Privacy />}</main>
      <footer>
        <span>INYEON · CONNECTION</span>
        <p>Translating traditional language carefully for relationships today.</p>
        <span>SEOUL · 2026</span>
      </footer>
    </div>
  );
}
