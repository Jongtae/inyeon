import type { FiveElement, Polarity, VisibleSymbolFeature } from './types.js';

export const ELEMENTS = Object.freeze({
  wood: Object.freeze({ id: 'wood', hangul: '목', hanja: '木', englishLabel: 'Wood' }),
  fire: Object.freeze({ id: 'fire', hangul: '화', hanja: '火', englishLabel: 'Fire' }),
  earth: Object.freeze({ id: 'earth', hangul: '토', hanja: '土', englishLabel: 'Earth' }),
  metal: Object.freeze({ id: 'metal', hangul: '금', hanja: '金', englishLabel: 'Metal' }),
  water: Object.freeze({ id: 'water', hangul: '수', hanja: '水', englishLabel: 'Water' }),
} satisfies Record<string, FiveElement>);

export const POLARITIES = Object.freeze({
  yang: Object.freeze({ id: 'yang', hangul: '양', hanja: '陽', englishLabel: 'Yang' }),
  yin: Object.freeze({ id: 'yin', hangul: '음', hanja: '陰', englishLabel: 'Yin' }),
} satisfies Record<string, Polarity>);

function symbol(id: string, kind: VisibleSymbolFeature['kind'], hangul: string, hanja: string, romanization: string,
  element: FiveElement, polarity: Polarity): VisibleSymbolFeature {
  return Object.freeze({ id, kind, hangul, hanja, romanization, element, polarity });
}

export const HEAVENLY_STEMS = Object.freeze({
  갑: symbol('stem-gap', 'heavenly-stem', '갑', '甲', 'Gap', ELEMENTS.wood, POLARITIES.yang),
  을: symbol('stem-eul', 'heavenly-stem', '을', '乙', 'Eul', ELEMENTS.wood, POLARITIES.yin),
  병: symbol('stem-byeong', 'heavenly-stem', '병', '丙', 'Byeong', ELEMENTS.fire, POLARITIES.yang),
  정: symbol('stem-jeong', 'heavenly-stem', '정', '丁', 'Jeong', ELEMENTS.fire, POLARITIES.yin),
  무: symbol('stem-mu', 'heavenly-stem', '무', '戊', 'Mu', ELEMENTS.earth, POLARITIES.yang),
  기: symbol('stem-gi', 'heavenly-stem', '기', '己', 'Gi', ELEMENTS.earth, POLARITIES.yin),
  경: symbol('stem-gyeong', 'heavenly-stem', '경', '庚', 'Gyeong', ELEMENTS.metal, POLARITIES.yang),
  신: symbol('stem-sin', 'heavenly-stem', '신', '辛', 'Sin', ELEMENTS.metal, POLARITIES.yin),
  임: symbol('stem-im', 'heavenly-stem', '임', '壬', 'Im', ELEMENTS.water, POLARITIES.yang),
  계: symbol('stem-gye', 'heavenly-stem', '계', '癸', 'Gye', ELEMENTS.water, POLARITIES.yin),
} as const);

export const EARTHLY_BRANCHES = Object.freeze({
  자: symbol('branch-ja', 'earthly-branch', '자', '子', 'Ja', ELEMENTS.water, POLARITIES.yang),
  축: symbol('branch-chuk', 'earthly-branch', '축', '丑', 'Chuk', ELEMENTS.earth, POLARITIES.yin),
  인: symbol('branch-in', 'earthly-branch', '인', '寅', 'In', ELEMENTS.wood, POLARITIES.yang),
  묘: symbol('branch-myo', 'earthly-branch', '묘', '卯', 'Myo', ELEMENTS.wood, POLARITIES.yin),
  진: symbol('branch-jin', 'earthly-branch', '진', '辰', 'Jin', ELEMENTS.earth, POLARITIES.yang),
  사: symbol('branch-sa', 'earthly-branch', '사', '巳', 'Sa', ELEMENTS.fire, POLARITIES.yin),
  오: symbol('branch-o', 'earthly-branch', '오', '午', 'O', ELEMENTS.fire, POLARITIES.yang),
  미: symbol('branch-mi', 'earthly-branch', '미', '未', 'Mi', ELEMENTS.earth, POLARITIES.yin),
  신: symbol('branch-sin', 'earthly-branch', '신', '申', 'Sin', ELEMENTS.metal, POLARITIES.yang),
  유: symbol('branch-yu', 'earthly-branch', '유', '酉', 'Yu', ELEMENTS.metal, POLARITIES.yin),
  술: symbol('branch-sul', 'earthly-branch', '술', '戌', 'Sul', ELEMENTS.earth, POLARITIES.yang),
  해: symbol('branch-hae', 'earthly-branch', '해', '亥', 'Hae', ELEMENTS.water, POLARITIES.yin),
} as const);
