import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import lunar from 'lunar-javascript';
import { calculateFourPillars } from 'manseryeok';

const gan = Object.fromEntries([...'甲乙丙丁戊己庚辛壬癸'].map((value, index) => [value, ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'][index]]));
const zhi = Object.fromEntries([...'子丑寅卯辰巳午未申酉戌亥'].map((value, index) => [value, ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'][index]]));
const toHangul = (value) => `${gan[value[0]]}${zhi[value[1]]}`;
const primary = (date, time, dayBoundary) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return calculateFourPillars({ year, month, day, hour, minute, dayBoundary }).toObject();
};
const comparison = (date, time) => {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const value = lunar.Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  return {
    day: toHangul(value.getDayInGanZhiExact()),
    hour: toHangul(value.getTimeInGanZhi()),
  };
};
const localTime = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const hourBoundaryRecords = [];
for (const boundaryMinute of [60, 180, 300, 420, 540, 660, 780, 900, 1020, 1140, 1260, 1380]) {
  for (const [state, delta] of [['before', -1], ['at', 0], ['after', 1]]) {
    const time = localTime(boundaryMinute + delta);
    const output = primary('2024-06-15', time, 'midnight');
    const compared = comparison('2024-06-15', time);
    hourBoundaryRecords.push({
      id: `hour-${time.replace(':', '')}-${state}`,
      state,
      localTime: time,
      primary: { day: output.day, hour: output.hour },
      comparison: compared,
      classification: output.day === compared.day && output.hour === compared.hour ? 'agreement' : 'methodology_difference',
    });
  }
}

const modeRecords = [];
for (const dayBoundary of ['midnight', 'jasi', 'splitJasi']) {
  for (const [date, time] of [['2024-06-15', '22:59'], ['2024-06-15', '23:00'], ['2024-06-15', '23:59'], ['2024-06-16', '00:00']]) {
    const output = primary(date, time, dayBoundary);
    modeRecords.push({
      id: `${dayBoundary}-${date}-${time.replace(':', '')}`,
      dayBoundary,
      date,
      localTime: time,
      primary: { day: output.day, hour: output.hour },
      comparison: comparison(date, time),
    });
  }
}

const fullRangeRepresentativeTimes = [
  '00:00', '01:00', '03:00', '05:00', '07:00', '09:00', '11:00',
  '12:34', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00',
];
const fullRangeDifferential = {
  startDate: '1989-01-01',
  endDate: '2024-12-31',
  representativeTimes: fullRangeRepresentativeTimes,
  civilDateCount: 0,
  observationCount: 0,
  dayMismatchCount: 0,
  hourMismatchCount: 0,
  mismatchOutside2300Count: 0,
};
for (
  let dayMilliseconds = Date.UTC(1989, 0, 1);
  dayMilliseconds <= Date.UTC(2024, 11, 31);
  dayMilliseconds += 86_400_000
) {
  const date = new Date(dayMilliseconds).toISOString().slice(0, 10);
  fullRangeDifferential.civilDateCount += 1;
  for (const time of fullRangeRepresentativeTimes) {
    const output = primary(date, time, 'midnight');
    const compared = comparison(date, time);
    const dayDiffers = output.day !== compared.day;
    const hourDiffers = output.hour !== compared.hour;
    fullRangeDifferential.observationCount += 1;
    if (dayDiffers) fullRangeDifferential.dayMismatchCount += 1;
    if (hourDiffers) fullRangeDifferential.hourMismatchCount += 1;
    if ((dayDiffers || hourDiffers) && time !== '23:00') fullRangeDifferential.mismatchOutside2300Count += 1;
  }
}

const corpus = {
  schemaVersion: 1,
  generatedAt: '2026-09-14',
  adapterVersion: '0.4.0',
  profileVersion: 'korean-saju-v1',
  referenceDataVersion: 'issue-12-day-hour-uncertainty-v1',
  uncertaintyAlgebraVersion: 'birth-time-uncertainty-v1',
  profileStatus: 'candidate',
  productionValidated: false,
  productionEligible: false,
  correctionCount: 0,
  primaryApiMode: { dayBoundary: 'midnight', trueSolarTime: false },
  comparisonApiMode: {
    day: 'getDayInGanZhiExact',
    hour: 'getTimeInGanZhi',
    observedLateZiSemantics: '23:00 begins the comparison implementation next-day day/hour-stem convention',
  },
  evidenceScope: {
    separateImplementationForDayHourMapping: true,
    independentKoreanMethodologyAuthority: false,
    limitation: 'The comparison reproduces a deliberate late 자시 (Jasi) convention difference. It cannot production-approve one Korean methodology.',
  },
  summary: { hourBoundaryRecordCount: hourBoundaryRecords.length, upstreamModeRecordCount: modeRecords.length },
  fullRangeDifferential,
  hourBoundaryRecords,
  modeRecords,
};

const target = fileURLToPath(new URL('../data/day-hour-evidence.v1.json', import.meta.url));
const serialized = `${JSON.stringify(corpus, null, 2)}\n`;
if (process.argv.includes('--check')) {
  const committed = await readFile(target, 'utf8').catch(() => '');
  if (committed !== serialized) throw new Error('day-hour-evidence.v1.json is stale; regenerate it without --check');
} else {
  await writeFile(target, serialized);
}
