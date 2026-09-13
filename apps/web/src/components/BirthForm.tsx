import { useState, type FormEvent } from 'react';

import {
  SUPPORTED_BIRTHPLACES,
  calculateProfile,
  chartContextFromForm,
  type BirthFormValue,
  type CalculatedProfile,
  type PersonalTemporalSupport,
  type SupportedTimeZone,
} from '../lib/product';

const INITIAL_VALUE: BirthFormValue = {
  localDate: '',
  timeZone: 'America/Los_Angeles',
  temporalSupport: 'exact',
  exactTime: '',
  approximateStart: '',
  approximateEnd: '',
  disputedTimeA: '',
  disputedTimeB: '',
};

interface BirthFormProps {
  readonly idPrefix: string;
  readonly title: string;
  readonly description: string;
  readonly submitLabel: string;
  readonly onCalculated: (profile: CalculatedProfile) => void;
}

export function BirthForm({ idPrefix, title, description, submitLabel, onCalculated }: BirthFormProps) {
  const [value, setValue] = useState<BirthFormValue>(INITIAL_VALUE);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof BirthFormValue>(key: K, next: BirthFormValue[K]) => {
    setValue((current) => ({ ...current, [key]: next }));
    setError(null);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const context = chartContextFromForm(value);
    if (!context) {
      setError('Check the date and time details. Approximate ranges must run from an earlier time to a later time, and disputed times must be different.');
      return;
    }
    const result = calculateProfile(context);
    if (result.status === 'error') {
      setError(result.message);
      return;
    }
    onCalculated(result.profile);
    setError(null);
  };

  const errorId = `${idPrefix}-error`;

  return (
    <form className="birth-form" onSubmit={submit} aria-describedby={error ? errorId : undefined}>
      <div className="section-heading compact-heading">
        <p className="eyebrow">PRIVATE INPUT · MEMORY ONLY</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="field-grid">
        <label>
          <span>Birth date</span>
          <input
            type="date"
            min="1989-01-01"
            max="2024-12-31"
            value={value.localDate}
            onChange={(event) => update('localDate', event.target.value)}
            required
          />
          <small>Currently supported: 1989–2024.</small>
        </label>

        <label>
          <span>Birthplace / time zone</span>
          <select
            value={value.timeZone}
            onChange={(event) => update('timeZone', event.target.value as SupportedTimeZone)}
          >
            {SUPPORTED_BIRTHPLACES.map((place) => (
              <option key={place.id} value={place.timeZone}>{place.label}</option>
            ))}
          </select>
          <small>More places will be added after timezone validation.</small>
        </label>
      </div>

      <fieldset className="time-support">
        <legend>How is the birth time known?</legend>
        {([
          ['exact', 'Exact', 'A specific recorded time'],
          ['approximate', 'Approximate', 'A known time range'],
          ['disputed', 'Disputed', 'Two plausible times'],
          ['unknown', 'Unknown', 'No birth time available'],
        ] as const).map(([mode, label, detail]) => (
          <label className="radio-card" key={mode}>
            <input
              type="radio"
              name={`${idPrefix}-temporal-support`}
              value={mode}
              checked={value.temporalSupport === mode}
              onChange={() => update('temporalSupport', mode as PersonalTemporalSupport)}
            />
            <span><strong>{label}</strong><small>{detail}</small></span>
          </label>
        ))}
      </fieldset>

      {value.temporalSupport === 'exact' && (
        <label className="single-field">
          <span>Birth time</span>
          <input type="time" value={value.exactTime} onChange={(event) => update('exactTime', event.target.value)} required />
        </label>
      )}
      {value.temporalSupport === 'approximate' && (
        <div className="field-grid" aria-label="Approximate birth-time range">
          <label><span>Earliest possible time</span><input type="time" value={value.approximateStart} onChange={(event) => update('approximateStart', event.target.value)} required /></label>
          <label><span>Latest possible time</span><input type="time" value={value.approximateEnd} onChange={(event) => update('approximateEnd', event.target.value)} required /></label>
        </div>
      )}
      {value.temporalSupport === 'disputed' && (
        <div className="field-grid" aria-label="Disputed birth-time possibilities">
          <label><span>First reported time</span><input type="time" value={value.disputedTimeA} onChange={(event) => update('disputedTimeA', event.target.value)} required /></label>
          <label><span>Second reported time</span><input type="time" value={value.disputedTimeB} onChange={(event) => update('disputedTimeB', event.target.value)} required /></label>
        </div>
      )}

      {error && <p className="form-error" id={errorId} role="alert">{error}</p>}
      <button className="primary-button" type="submit">{submitLabel}<span aria-hidden="true">→</span></button>
      <p className="form-privacy">Nothing entered here is written to browser storage, a URL, analytics, or an application server.</p>
    </form>
  );
}
