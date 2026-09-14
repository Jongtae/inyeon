import { describe, expect, it } from 'vitest';

import {
  calculateProfile,
  chartContextFromForm,
  type BirthFormValue,
} from './product';
import {
  defaultInterpretationLocale,
  interpretPersonalSaju,
} from './personal-interpretation';

const birth: BirthFormValue = {
  localDate: '1995-10-21',
  timeZone: 'America/Los_Angeles',
  temporalSupport: 'exact',
  exactTime: '14:30',
  approximateStart: '',
  approximateEnd: '',
  disputedTimeA: '',
  disputedTimeB: '',
};

function profile() {
  const context = chartContextFromForm(birth);
  if (!context) throw new Error('fixture context should be valid');
  const result = calculateProfile(context);
  if (result.status !== 'ok') throw new Error(result.message);
  return result.profile;
}

describe('personal Saju interpretation', () => {
  it('maps Korean browser locales to ko-KR and otherwise falls back to en-US', () => {
    expect(defaultInterpretationLocale(['ko-KR'])).toBe('ko-KR');
    expect(defaultInterpretationLocale(['ko'])).toBe('ko-KR');
    expect(defaultInterpretationLocale(['en-GB', 'ja-JP'])).toBe('en-US');
  });

  it('localizes narrative framing without changing the calculated chart', () => {
    const calculated = profile();
    const before = JSON.stringify(calculated.chart);

    const english = interpretPersonalSaju(calculated, 'en-US');
    const korean = interpretPersonalSaju(calculated, 'ko-KR');

    expect(english.title).toBe('Read your Saju before compatibility');
    expect(english.statusLabel).toContain('NOT YET EXPERT REVIEWED');
    expect(korean.title).toBe('궁합보다 먼저, 나의 사주 읽기');
    expect(korean.statusLabel).toContain('전문가 검토 전');
    expect(english.dayMasterText).not.toBe(korean.dayMasterText);
    expect(JSON.stringify(calculated.chart)).toBe(before);
  });

  it('keeps uncertain Day Master evidence uncertain instead of inventing one interpretation', () => {
    const calculated = profile();
    const uncertain = {
      ...calculated,
      derived: {
        ...calculated.derived,
        stable: {
          ...calculated.derived.stable,
          dayMaster: {
            support: 'alternative' as const,
            values: [],
          },
        },
      },
    };

    expect(interpretPersonalSaju(uncertain, 'en-US').dayMasterText).toContain('does not lock you into one');
    expect(interpretPersonalSaju(uncertain, 'ko-KR').dayMasterText).toContain('고정하지 않습니다');
  });
});
