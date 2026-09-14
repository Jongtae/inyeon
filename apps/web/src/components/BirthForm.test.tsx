import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BirthForm } from './BirthForm';

function renderForm() {
  const onCalculated = vi.fn();
  render(
    <BirthForm
      idPrefix="test"
      title="Calculate my Korean Saju"
      description="Test form"
      submitLabel="Calculate my chart"
      onCalculated={onCalculated}
    />,
  );
  return onCalculated;
}

describe('BirthForm submit feedback', () => {
  it('shows a React error instead of silently relying on native browser constraints', () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a birth date');

    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1979-12-22' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(screen.getByRole('alert')).toHaveTextContent('1989 through 2024');

    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1995-10-21' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Enter the exact birth time');
  });

  it('still calculates a supported exact-time chart', () => {
    const onCalculated = renderForm();
    fireEvent.change(screen.getByLabelText(/^Birth date/), { target: { value: '1995-10-21' } });
    fireEvent.change(screen.getByLabelText('Birth time'), { target: { value: '14:30' } });
    fireEvent.change(screen.getByLabelText(/^Birthplace \/ time zone/), { target: { value: 'Asia/Seoul' } });
    fireEvent.click(screen.getByRole('button', { name: 'Calculate my chart' }));

    expect(onCalculated).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
