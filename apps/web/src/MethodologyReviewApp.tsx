import { useState } from 'react';

import { BirthForm } from './components/BirthForm';
import { temporalLabel, type CalculatedProfile } from './lib/product';

const positions = [
  ['year', 'Year'],
  ['month', 'Month'],
  ['day', 'Day'],
  ['hour', 'Hour'],
] as const;

function StablePillars({ profile }: { readonly profile: CalculatedProfile }) {
  return (
    <div className="review-pillars" aria-label="Stable Four Pillars output">
      {positions.map(([position, label]) => {
        const item = profile.chart.stablePillars[position];
        return (
          <article key={position}>
            <span>{label}</span>
            {item.support === 'invariant' ? (
              <>
                <strong>{item.pillar.stem}{item.pillar.branch}</strong>
                <small>{item.pillar.stemHanja}{item.pillar.branchHanja}</small>
              </>
            ) : (
              <>
                <strong>{item.support === 'alternative' ? 'Varies' : 'Unavailable'}</strong>
                <small>{item.support}</small>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}

function ReviewEvidence({ profile }: { readonly profile: CalculatedProfile }) {
  const chart = profile.chart;
  return (
    <section className="review-evidence" aria-labelledby="review-output-title">
      <div className="review-heading-row">
        <div>
          <p className="eyebrow">CANDIDATE CALCULATION OUTPUT</p>
          <h2 id="review-output-title">Methodology evidence for review</h2>
        </div>
        <span className="review-status">NOT PRODUCTION VALIDATED</span>
      </div>

      <dl className="review-summary">
        <div><dt>Temporal support</dt><dd>{temporalLabel(chart.temporalSupport)}</dd></div>
        <div><dt>Result status</dt><dd>{chart.status}</dd></div>
        <div><dt>Candidate variants</dt><dd>{chart.variantCount}</dd></div>
        <div><dt>Evaluated civil minutes</dt><dd>{chart.evaluatedCivilMinuteCount}</dd></div>
        <div><dt>Nonexistent civil minutes</dt><dd>{chart.nonexistentCivilMinuteCount}</dd></div>
        <div><dt>DST fold present</dt><dd>{chart.containsFold ? 'Yes' : 'No'}</dd></div>
      </dl>

      <StablePillars profile={profile} />

      <div className="review-conventions">
        <h3>Candidate conventions that require expert acceptance or correction</h3>
        <dl>
          <div><dt>Day boundary</dt><dd>{chart.provenance.dayBoundary}</dd></div>
          <div><dt>Hour branch convention</dt><dd>{chart.provenance.hourBranchConvention}</dd></div>
          <div><dt>True solar time</dt><dd>{chart.provenance.trueSolarTime ? 'Applied' : 'Not applied'}</dd></div>
          <div><dt>Solar-term data</dt><dd>{chart.provenance.solarTermDataVersion}</dd></div>
          <div><dt>Profile version</dt><dd>{chart.provenance.profileVersion} · {chart.provenance.profileStatus}</dd></div>
          <div><dt>Upstream engine</dt><dd>{chart.provenance.upstreamName} {chart.provenance.upstreamVersion}</dd></div>
        </dl>
      </div>

      <details className="review-raw">
        <summary>Open full technical chart snapshot</summary>
        <pre>{JSON.stringify(chart, null, 2)}</pre>
      </details>

      <aside className="review-request">
        <strong>Requested reviewer decision</strong>
        <p>For the entered case, please classify the calculation as <code>accept</code>, <code>change</code>, or <code>disputed</code>, and note the specific rule or source supporting that decision.</p>
      </aside>
    </section>
  );
}

export function MethodologyReviewApp() {
  const [profile, setProfile] = useState<CalculatedProfile | null>(null);
  return (
    <div className="review-shell">
      <header className="review-banner">
        <div>
          <span>INYEON · 인연</span>
          <strong>Methodology Review Build</strong>
        </div>
        <p>Expert review only · not a production release · not indexed</p>
      </header>

      <main>
        <section className="review-intro">
          <p className="eyebrow">#14 · KOREAN SAJU CALCULATION REVIEW</p>
          <h1>Review the calculation rules, not the product claim.</h1>
          <p>This temporary build exists to validate Four Pillars calculation behavior before public release. Relationship interpretation remains disabled. Personal birth details stay in this browser tab and are not sent to an INYEON application backend.</p>
        </section>

        <section className="review-checklist" aria-labelledby="review-checklist-title">
          <h2 id="review-checklist-title">Please focus on these methodology questions</h2>
          <ol>
            <li>Year and month pillar changes at solar-term boundaries.</li>
            <li>Day rollover: local civil midnight versus late-Zi / 야자시 convention.</li>
            <li>Hour-pillar branch/stem convention around 23:00–01:00.</li>
            <li>Whether true solar time should be applied, and under what scope.</li>
            <li>Timezone and DST treatment for overseas births.</li>
            <li>Any case where a 61–72 second solar-term disagreement changes the expected pillar.</li>
          </ol>
        </section>

        <BirthForm
          idPrefix="methodology-review"
          title="Run a review case"
          description="Enter a known or synthetic case. The current candidate implementation supports Seoul, Los Angeles, and New York City."
          submitLabel="Calculate candidate chart"
          onCalculated={setProfile}
        />

        {profile && <ReviewEvidence profile={profile} />}
      </main>

      <footer className="review-footer">
        <span>Candidate method only</span>
        <span>Production validation: false</span>
      </footer>
    </div>
  );
}
