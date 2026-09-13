import { describe, expect, it } from 'vitest';

import { generatedTimezoneData } from '../src/generated-timezone-data.js';

describe('generated runtime timezone data', () => {
  it('is deeply frozen before the public resolver is imported', async () => {
    const seoul = generatedTimezoneData.zones.find((zone) => zone.name === 'Asia/Seoul')!;
    expect(Object.isFrozen(generatedTimezoneData)).toBe(true);
    expect(Object.isFrozen(generatedTimezoneData.zones)).toBe(true);
    expect(Object.isFrozen(seoul)).toBe(true);
    expect(Object.isFrozen(seoul.offsetsSecondsEast)).toBe(true);
    expect(() => (seoul.offsetsSecondsEast as unknown as number[]).fill(0)).toThrow(TypeError);

    const { TIMEZONE_DATA_VERSION, TIMEZONE_RESOLVER_CAPABILITIES, inyeonLocalTimeResolver } = await import('../src/index.js');
    expect(TIMEZONE_RESOLVER_CAPABILITIES.transitionTableSha256).toBe(
      '3e64bb05dfb4d8492c10a4ab11ca1cd6566748893998863c94db6deef85064d7',
    );
    expect(inyeonLocalTimeResolver.resolve({
      localDate: '2024-01-15',
      localTime: '12:00',
      timePrecision: 'exact',
      timeZone: 'Asia/Seoul',
      timezoneDataVersion: TIMEZONE_DATA_VERSION,
    })).toMatchObject({
      status: 'unambiguous',
      candidates: [{ instant: '2024-01-15T03:00:00.000Z', offsetSeconds: 32400 }],
    });
  });
});
