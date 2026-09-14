import type { CalculatedProfile } from './product';

export type InterpretationLocale = 'en-US' | 'ko-KR';

export const INTERPRETATION_LOCALES = Object.freeze([
  Object.freeze({ id: 'en-US' as const, label: 'United States · English' }),
  Object.freeze({ id: 'ko-KR' as const, label: '대한민국 · 한국어' }),
]);

const ELEMENT_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
type ElementId = (typeof ELEMENT_ORDER)[number];

const ELEMENT_LABELS: Record<InterpretationLocale, Record<ElementId, string>> = {
  'en-US': {
    wood: 'Wood',
    fire: 'Fire',
    earth: 'Earth',
    metal: 'Metal',
    water: 'Water',
  },
  'ko-KR': {
    wood: '목(木)',
    fire: '화(火)',
    earth: '토(土)',
    metal: '금(金)',
    water: '수(水)',
  },
};

const DAY_MASTER_COPY: Record<InterpretationLocale, Record<ElementId, string>> = {
  'en-US': {
    wood: 'Wood is traditionally associated with growth, direction, and extending outward. As a reflection prompt, notice where you prefer to develop something over time instead of forcing an immediate result.',
    fire: 'Fire is traditionally associated with expression, warmth, and visible momentum. As a reflection prompt, notice when enthusiasm helps you connect—and when you need space before acting on it.',
    earth: 'Earth is traditionally associated with steadiness, context, and holding things together. As a reflection prompt, notice where reliability matters most to you and where too much stability can become inertia.',
    metal: 'Metal is traditionally associated with structure, discernment, and clear standards. As a reflection prompt, notice where precision helps you feel grounded and where flexibility may create more room for connection.',
    water: 'Water is traditionally associated with adaptability, movement, and reading the surrounding context. As a reflection prompt, notice where flexibility serves you and where you benefit from making a firmer choice.',
  },
  'ko-KR': {
    wood: '목(木)은 전통적으로 성장, 방향성, 바깥으로 뻗어가는 움직임과 연결해 봅니다. 하나의 성찰 질문으로, 결과를 바로 밀어붙이기보다 시간을 두고 키워 가는 쪽이 편한 순간이 언제인지 살펴보세요.',
    fire: '화(火)는 전통적으로 표현, 온기, 눈에 보이는 추진력과 연결해 봅니다. 하나의 성찰 질문으로, 열정이 관계를 여는 순간과 감정을 바로 행동으로 옮기기 전에 여백이 필요한 순간을 나눠 보세요.',
    earth: '토(土)는 전통적으로 안정, 맥락, 무언가를 지탱하고 이어 주는 성질과 연결해 봅니다. 하나의 성찰 질문으로, 신뢰와 안정이 특히 중요한 영역과 지나친 안정이 정체로 느껴지는 영역을 구분해 보세요.',
    metal: '금(金)은 전통적으로 구조, 분별, 명확한 기준과 연결해 봅니다. 하나의 성찰 질문으로, 정확한 기준이 마음을 편하게 해주는 순간과 조금 더 유연해야 관계가 편해지는 순간을 살펴보세요.',
    water: '수(水)는 전통적으로 유연함, 흐름, 주변 맥락을 읽는 움직임과 연결해 봅니다. 하나의 성찰 질문으로, 유연함이 강점이 되는 순간과 오히려 분명한 선택이 필요한 순간을 나눠 보세요.',
  },
};

export interface PersonalInterpretation {
  readonly locale: InterpretationLocale;
  readonly title: string;
  readonly statusLabel: string;
  readonly intro: string;
  readonly dayMasterHeading: string;
  readonly dayMasterText: string;
  readonly balanceHeading: string;
  readonly balanceText: string;
  readonly reflectionHeading: string;
  readonly reflectionText: string;
  readonly methodologyNote: string;
}

export function defaultInterpretationLocale(languages?: readonly string[]): InterpretationLocale {
  const candidates = languages ?? (typeof navigator === 'undefined'
    ? []
    : [navigator.language, ...(navigator.languages ?? [])]);
  return candidates.some((language) => language.toLowerCase().startsWith('ko')) ? 'ko-KR' : 'en-US';
}

let sessionInterpretationLocale: InterpretationLocale = defaultInterpretationLocale();

export function getSessionInterpretationLocale(): InterpretationLocale {
  return sessionInterpretationLocale;
}

export function setSessionInterpretationLocale(locale: InterpretationLocale): void {
  sessionInterpretationLocale = locale;
}

function elementSummary(profile: CalculatedProfile, locale: InterpretationLocale): string {
  const stable = profile.derived.stable.visibleElementOccurrences;
  if (stable.support !== 'invariant') {
    return locale === 'ko-KR'
      ? '출생시간 가능성에 따라 보이는 오행 구성이 달라집니다. INYEON은 하나의 구성을 임의로 선택하지 않습니다.'
      : 'The visible Five Element pattern changes across the retained birth-time possibilities, so INYEON does not choose one pattern for you.';
  }

  const parts = ELEMENT_ORDER.map((element) => `${ELEMENT_LABELS[locale][element]} ${stable.value[element]}`);
  return locale === 'ko-KR'
    ? `현재 계산에서 겉으로 확인되는 ${stable.value.observedSymbolCount}개 기호의 오행 분포는 ${parts.join(', ')}입니다. 이 숫자는 보이는 기호를 세어 묘사한 값이며, 숫자만으로 성격이나 운명을 단정하지 않습니다.`
    : `Across the ${stable.value.observedSymbolCount} visible symbols in this candidate chart, the element counts are ${parts.join(', ')}. These are descriptive counts only; INYEON does not infer a fixed personality or destiny from the totals.`;
}

export function interpretPersonalSaju(profile: CalculatedProfile, locale: InterpretationLocale): PersonalInterpretation {
  const dayMaster = profile.derived.stable.dayMaster;
  const dayMasterText = dayMaster.support === 'invariant'
    ? DAY_MASTER_COPY[locale][dayMaster.value.element.id]
    : locale === 'ko-KR'
      ? '출생시간 가능성에 따라 일간이 달라질 수 있어 하나의 개인 해석으로 고정하지 않습니다.'
      : 'The Day Master can vary across the retained birth-time possibilities, so INYEON does not lock you into one personal interpretation.';

  if (locale === 'ko-KR') {
    return {
      locale,
      title: '궁합보다 먼저, 나의 사주 읽기',
      statusLabel: '후보 해석 · 전문가 검토 전',
      intro: '먼저 내 사주에서 안정적으로 확인되는 정보만으로 나를 돌아봅니다. 현재 해석은 일간과 겉으로 보이는 오행 분포를 중심으로 한 제한적인 후보 해석이며, 전통 명리의 전체 풀이를 대신하지 않습니다.',
      dayMasterHeading: '내 일간에서 시작하기',
      dayMasterText,
      balanceHeading: '지금 확인되는 오행의 모습',
      balanceText: elementSummary(profile, locale),
      reflectionHeading: '상대를 연결하기 전 생각해 볼 것',
      reflectionText: '앞으로 누군가와 비교할 때는 “누가 더 잘 맞는가”보다, 내가 자연스럽게 느끼는 속도·표현 방식·기준과 상대의 방식이 어디에서 이어지고 어디에서 조율이 필요한지를 살펴보는 기준점으로 사용하세요.',
      methodologyNote: '사주 계산 방식과 문화적 해석은 아직 검토 중입니다. 계산 결과와 해석 문구는 버전이 분리되어 있으며, 지역별 문구가 사주 원국 자체를 바꾸지는 않습니다.',
    };
  }

  return {
    locale,
    title: 'Read your Saju before compatibility',
    statusLabel: 'CANDIDATE INTERPRETATION · NOT YET EXPERT REVIEWED',
    intro: 'Start with your own chart and only the signals that are stable enough to show. This is a limited candidate reflection built from the Day Master and visible Five Element pattern—not a complete traditional reading.',
    dayMasterHeading: 'Start with your Day Master',
    dayMasterText,
    balanceHeading: 'What is visible in this chart',
    balanceText: elementSummary(profile, locale),
    reflectionHeading: 'Before you connect another person',
    reflectionText: 'When you compare later, use this as a baseline for noticing pace, expression, standards, and adjustment—not as a ranking of who is “more compatible.” The useful question is where two styles connect naturally and where they may need translation.',
    methodologyNote: 'The Saju calculation method and cultural interpretation are still under review. Calculation data and localized narrative are versioned separately; changing locale does not change the underlying Four Pillars.',
  };
}
