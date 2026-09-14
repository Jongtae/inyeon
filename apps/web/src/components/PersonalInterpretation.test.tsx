import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  calculateProfile,
  chartContextFromForm,
  type BirthFormValue,
} from '../lib/product';
import { PersonalInterpretation } from './PersonalInterpretation';

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

describe('PersonalInterpretation', () => {
  it('shows candidate personal value before comparison and allows locale override', () => {
    const onLocaleChange = vi.fn();
    const calculated = profile();
    const { rerender } = render(
      <PersonalInterpretation
        profile={calculated}
        locale="en-US"
        onLocaleChange={onLocaleChange}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Read your Saju before compatibility' })).toBeInTheDocument();
    expect(screen.getByText(/NOT YET EXPERT REVIEWED/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Start with your Day Master' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Interpretation region / language'), { target: { value: 'ko-KR' } });
    expect(onLocaleChange).toHaveBeenCalledWith('ko-KR');

    rerender(
      <PersonalInterpretation
        profile={calculated}
        locale="ko-KR"
        onLocaleChange={onLocaleChange}
      />,
    );
    expect(screen.getByRole('heading', { name: '궁합보다 먼저, 나의 사주 읽기' })).toBeInTheDocument();
    expect(screen.getByText(/후보 해석 · 전문가 검토 전/)).toBeInTheDocument();
    expect(screen.getByText(/지역 설정은 설명 방식만 바꾸며 사주 원국 계산은 바꾸지 않습니다/)).toBeInTheDocument();
  });
});
