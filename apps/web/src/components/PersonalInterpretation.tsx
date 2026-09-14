import type { CalculatedProfile } from '../lib/product';
import {
  INTERPRETATION_LOCALES,
  interpretPersonalSaju,
  type InterpretationLocale,
} from '../lib/personal-interpretation';

interface PersonalInterpretationProps {
  readonly profile: CalculatedProfile;
  readonly locale: InterpretationLocale;
  readonly onLocaleChange: (locale: InterpretationLocale) => void;
}

export function PersonalInterpretation({ profile, locale, onLocaleChange }: PersonalInterpretationProps) {
  const copy = interpretPersonalSaju(profile, locale);

  return (
    <section className="comparison-panel" aria-labelledby="personal-interpretation-title">
      <div className="card-heading">
        <div>
          <p className="eyebrow">MY SAJU · PERSONAL BASELINE</p>
          <h2 id="personal-interpretation-title">{copy.title}</h2>
        </div>
        <span className="status-badge">{copy.statusLabel}</span>
      </div>

      <label className="single-field">
        <span>{locale === 'ko-KR' ? '해석 지역 / 언어' : 'Interpretation region / language'}</span>
        <select
          aria-label="Interpretation region / language"
          value={locale}
          onChange={(event) => onLocaleChange(event.target.value as InterpretationLocale)}
        >
          {INTERPRETATION_LOCALES.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        <small>
          {locale === 'ko-KR'
            ? '지역 설정은 설명 방식만 바꾸며 사주 원국 계산은 바꾸지 않습니다.'
            : 'This changes explanatory framing only. It does not change the Four Pillars calculation.'}
        </small>
      </label>

      <p>{copy.intro}</p>

      <div className="detail-list">
        <h3>{copy.dayMasterHeading}</h3>
        <p>{copy.dayMasterText}</p>
        <h3>{copy.balanceHeading}</h3>
        <p>{copy.balanceText}</p>
        <h3>{copy.reflectionHeading}</h3>
        <p>{copy.reflectionText}</p>
      </div>

      <p className="candidate-note">{copy.methodologyNote}</p>
    </section>
  );
}
