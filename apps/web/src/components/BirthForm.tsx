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
import {
  getSessionInterpretationLocale,
  setSessionInterpretationLocale,
  type InterpretationLocale,
} from '../lib/personal-interpretation';
import { PersonalInterpretation } from './PersonalInterpretation';

const MIN_SUPPORTED_DATE = '1989-01-01';
const MAX_SUPPORTED_DATE = '2024-12-31';

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

function validationError(value: BirthFormValue): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value.localDate)) {
    return 'Enter a birth date before calculating.';
  }
  if (value.localDate < MIN_SUPPORTED_DATE || value.localDate > MAX_SUPPORTED_DATE) {
    return 'This preview currently supports birth dates from 1989 through 2024. The calculation did not run because dates outside that validated range are not supported yet.';
  }
  if (value.temporalSupport === 'exact' && !value.exactTime) {
    return 'Enter the exact birth time, or choose Unknown if you do not know it.';
  }
  if (value.temporalSupport === 'approximate'
    && (!value.approximateStart || !value.approximateEnd || value.approximateStart >= value.approximateEnd)) {
    return 'Approximate ranges must run from an earlier time to a later time.';
  }
  if (value.temporalSupport === 'disputed'
    && (!value.disputedTimeA || !value.disputedTimeB || value.disputedTimeA === value.disputedTimeB)) {
    return 'Disputed times require two different plausible times.';
  }
  return null;
}

export function BirthForm({ idPrefix, title, description, submitLabel, onCalculated }: BirthFormProps) {
  const [value, setValue] = useState<BirthFormValue>(INITIAL_VALUE);
  const [error, setError] = useState<string | null>(null);
  const [calculatedProfile, setCalculatedProfile] = useState<CalculatedProfile | null>(null);
  const [interpretationLocale, setInterpretationLocale] = useState<InterpretationLocale>(() => getSessionInterpretationLocale());

  const update = <K extends keyof BirthFormValue>(key: K, next: BirthFormValue[K]) => {
    setValue((current) => ({ ...current, [key]: next }));
    setError(null);
  };

  const changeInterpretationLocale = (locale: InterpretationLocale) => {
    setSessionInterpretationLocale(locale);
    setInterpretationLocale(locale);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formError = validationError(value);
    if (formError) {
      setError(formError);
      return;
    }

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
    setCalculatedProfile(result.profile);
    onCalculated(result.profile);
    setError(null);
  };

  const errorId = `${idPrefix}-error`;
  const showPersonalInterpretation = idPrefix === 'personal';

  return (
    <>
      <form className="birth-form" onSubmit={submit} noValidate aria-describedby={error ? errorId : undefined}>
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
              value={value.localDate}
              onChange={(event) => update('localDate', event.target.value)}
            />
            <small>Candidate calculation currently supports 1989–2024. Unsupported dates show an explicit message instead of failing silently.</small>
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
            <small>Birthplace affects timezone calculation. Interpretation region is selected separately after calculation.</small>
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
            <input type="time" value={value.exactTime} onChange={(event) => update('exactTime', event.target.value)} />
          </label>
        )}
        {value.temporalSupport === 'approximate' && (
          <div className="field-grid" aria-label="Approximate birth-time range">
            <label><span>Earliest possible time</span><input type="time" value={value.approximateStart} onChange={(event) => update('approximateStart', event.target.value)} /></label>
            <label><span>Latest possible time</span><input type="time" value={value.approximateEnd} onChange={(event) => update('approximateEnd', event.target.value)} /></label>
          </div>
        )}
        {value.temporalSupport === 'disputed' && (
          <div className="field-grid" aria-label="Disputed birth-time possibilities">
            <label><span>First reported time</span><input type="time" value={value.disputedTimeA} onChange={(event) => update('disputedTimeA', event.target.value)} /></label>
            <label><span>Second reported time</span><input type="time" value={value.disputedTimeB} onChange={(event) => update('disputedTimeB', event.target.value)} /></label>
          </div>
        )}

        {error && <p className="form-error" id={errorId} role="alert">{error}</p>}
        <button className="primary-button" type="submit">{submitLabel}<span aria-hidden="true">→</span></button>
        <p className="form-privacy">Nothing entered here is written to browser storage, a URL, analytics, or an application server.</p>
      </form>

      {showPersonalInterpretation && calculatedProfile && (
        <PersonalInterpretation
          profile={calculatedProfile}
          locale={interpretationLocale}
          onLocaleChange={changeInterpretationLocale}
        />
      )}
    </>
  );
}
