export interface Combination {
  result: string;
  resultEmoji: string;
  resultColor: number;
  materials: string[];
  description: string;
}

export const COMBINATIONS: Combination[] = [
  // ── 안흔함 (흔함 2종 조합) ──────────────────────────────
  { result: '황정기',        resultEmoji: '👑', resultColor: 0xf1c40f, materials: ['최상호', '노태현'],  description: '최상호 + 노태현' },
  { result: '박준희',        resultEmoji: '🎯', resultColor: 0x27ae60, materials: ['노태현', '문필환'],  description: '노태현 + 문필환' },
  { result: '김경현',        resultEmoji: '🌊', resultColor: 0x2980b9, materials: ['양재모', '박민수'],  description: '양재모 + 박민수' },
  { result: '김민준',        resultEmoji: '⚡', resultColor: 0xe74c3c, materials: ['강주혁', '박민석'],  description: '강주혁 + 박민석' },
  { result: '김용태',        resultEmoji: '🔥', resultColor: 0x8e44ad, materials: ['강재규', '박민석'],  description: '강재규 + 박민석' },
  { result: '신문철',        resultEmoji: '🌀', resultColor: 0x16a085, materials: ['박민석', '임장혁'],  description: '박민석 + 임장혁' },
  { result: '김수빈',        resultEmoji: '🌸', resultColor: 0xd35400, materials: ['문필환', '최상호'],  description: '문필환 + 최상호' },
  { result: '이재윤',        resultEmoji: '🌙', resultColor: 0x2c3e50, materials: ['박민수', '문필환'],  description: '박민수 + 문필환' },
  { result: '엄태웅',        resultEmoji: '🦁', resultColor: 0xe67e22, materials: ['임장혁', '양재모'],  description: '임장혁 + 양재모' },
  // 자가 조합
  { result: '알라',          resultEmoji: '🌙', resultColor: 0xf39c12, materials: ['강주혁', '강주혁'],  description: '강주혁 × 2' },
  { result: '재규어',        resultEmoji: '🐆', resultColor: 0x9b59b6, materials: ['강재규', '강재규'],  description: '강재규 × 2' },
  { result: '쇼타',          resultEmoji: '✨', resultColor: 0xf1c40f, materials: ['문필환', '문필환'],  description: '문필환 × 2' },
  { result: '로이킴',        resultEmoji: '🎸', resultColor: 0x1abc9c, materials: ['박민수', '박민수'],  description: '박민수 × 2' },

  // ── 특별함 (흔함 × 3) ──────────────────────────────────
  { result: '최상호 일진',      resultEmoji: '😈', resultColor: 0xe74c3c, materials: ['최상호', '최상호', '최상호'],  description: '최상호 × 3' },
  { result: '노태현 노티',      resultEmoji: '🎩', resultColor: 0x3498db, materials: ['노태현', '노태현', '노태현'],  description: '노태현 × 3' },
  { result: '양재모 늑대',      resultEmoji: '🐺', resultColor: 0x2ecc71, materials: ['양재모', '양재모', '양재모'],  description: '양재모 × 3' },
  { result: '박민석 빡빡이',    resultEmoji: '💀', resultColor: 0x1abc9c, materials: ['박민석', '박민석', '박민석'],  description: '박민석 × 3' },
  { result: '임장혁 장애인',    resultEmoji: '⚡', resultColor: 0x8e44ad, materials: ['임장혁', '임장혁', '임장혁'],  description: '임장혁 × 3' },
  // 안흔함 조합
  { result: '황정기 헝그리맨',  resultEmoji: '🍖', resultColor: 0xf1c40f, materials: ['황정기', '황정기', '박민석'],  description: '황정기 × 2 + 박민석' },
  { result: '임채준 따까리',    resultEmoji: '🐕', resultColor: 0xe67e22, materials: ['황정기', '로이킴', '최상호'],  description: '황정기 + 로이킴 + 최상호' },
  { result: '박기찬 야동마스터', resultEmoji: '📺', resultColor: 0xd35400, materials: ['박준희', '김용태', '최상호'],  description: '박준희 + 김용태 + 최상호' },
  { result: '이현빈 파파라치',  resultEmoji: '📷', resultColor: 0x27ae60, materials: ['박준희', '신문철', '임장혁'],  description: '박준희 + 신문철 + 임장혁' },
  { result: '조세민 이청용',    resultEmoji: '⚽', resultColor: 0x2980b9, materials: ['김경현', '박민수', '양재모'],  description: '김경현 + 박민수 + 양재모' },
  { result: '왕승환 왕싱싱',    resultEmoji: '👊', resultColor: 0xc0392b, materials: ['김경현', '김용태', '강주혁'],  description: '김경현 + 김용태 + 강주혁' },
  { result: '이병준 불법체류자',resultEmoji: '🚫', resultColor: 0x7f8c8d, materials: ['김민준', '최상호', '양재모'],  description: '김민준 + 최상호 + 양재모' },
  { result: '김정래 프로그래머',resultEmoji: '💻', resultColor: 0x2c3e50, materials: ['김민준', '재규어', '강주혁'],  description: '김민준 + 재규어 + 강주혁' },
  { result: '김용태 흑화',      resultEmoji: '🖤', resultColor: 0x1a1a2e, materials: ['김용태', '김용태'],            description: '김용태 × 2' },
  { result: '이정범 벨튀선구자',resultEmoji: '🏃', resultColor: 0x6c3483, materials: ['김용태', '엄태웅', '노태현'],  description: '김용태 + 엄태웅 + 노태현' },
  { result: '유재헌 피망',      resultEmoji: '🌶️', resultColor: 0xc0392b, materials: ['신문철', '김경현', '최상호'],  description: '신문철 + 김경현 + 최상호' },
  { result: '주영호 마마보이',  resultEmoji: '👩', resultColor: 0x16a085, materials: ['신문철', '황정기', '강재규'],  description: '신문철 + 황정기 + 강재규' },
  { result: '고우선 전정실부인',resultEmoji: '💍', resultColor: 0xe91e63, materials: ['김수빈', '박준희', '노태현'],  description: '김수빈 + 박준희 + 노태현' },
  { result: '이지원 음지소녀',  resultEmoji: '🌑', resultColor: 0x4a235a, materials: ['김수빈', '쇼타', '최상호'],    description: '김수빈 + 쇼타 + 최상호' },
  { result: '서아인 사이코패스',resultEmoji: '🔪', resultColor: 0x922b21, materials: ['이재윤', '엄태웅', '노태현'],  description: '이재윤 + 엄태웅 + 노태현' },
  { result: '박예원 성대결절',  resultEmoji: '🎤', resultColor: 0x9b59b6, materials: ['이재윤', '김수빈', '강재규'],  description: '이재윤 + 김수빈 + 강재규' },
  { result: '조성진 작은메주',  resultEmoji: '🍡', resultColor: 0x795548, materials: ['엄태웅', '알라', '임장혁'],    description: '엄태웅 + 알라 + 임장혁' },
  { result: '박진웅 축구의달인',resultEmoji: '⚽', resultColor: 0x27ae60, materials: ['엄태웅', '김경현', '박민수'],  description: '엄태웅 + 김경현 + 박민수' },
  { result: '노건완 노가리',    resultEmoji: '🐟', resultColor: 0x3498db, materials: ['알라', '황정기', '임장혁'],    description: '알라 + 황정기 + 임장혁' },
  { result: '최동준 구일톱블랙홀',resultEmoji:'🕳️',resultColor:0x0d0d0d, materials: ['알라', '엄태웅', '양재모'],    description: '알라 + 엄태웅 + 양재모' },
  { result: '강주혁 코알라',    resultEmoji: '🐨', resultColor: 0x7b9e87, materials: ['알라', '알라'],                description: '알라 × 2' },
  { result: '정승준 저승사자',  resultEmoji: '💀', resultColor: 0x2c2c2c, materials: ['재규어', '이재윤', '임장혁'],  description: '재규어 + 이재윤 + 임장혁' },
  { result: '배성령 해커',      resultEmoji: '💾', resultColor: 0x00ff41, materials: ['재규어', '노태현', '양재모'],  description: '재규어 + 노태현 + 양재모' },
  { result: '김태영 일베조무사',resultEmoji: '🤡', resultColor: 0xff6b35, materials: ['쇼타', '알라', '노태현'],      description: '쇼타 + 알라 + 노태현' },
  { result: '최준우 원조렝가',  resultEmoji: '🧱', resultColor: 0xd4a017, materials: ['쇼타', '김민준', '강재규'],    description: '쇼타 + 김민준 + 강재규' },
  { result: '송형성 틱장애',    resultEmoji: '💥', resultColor: 0xff4500, materials: ['로이킴', '박준희', '강재규'],  description: '로이킴 + 박준희 + 강재규' },
  { result: '박민수 루키인싸',  resultEmoji: '😎', resultColor: 0x00bcd4, materials: ['로이킴', '김경현', '양재모'],  description: '로이킴 + 김경현 + 양재모' },
  { result: '조도연 좆돼지',    resultEmoji: '🐷', resultColor: 0xff69b4, materials: ['이호준 볼보이', '이호준 볼보이', '이호준 볼보이', '최상호'], description: '이호준 볼보이 × 3 + 최상호' },
];

// 주 유닛 기준으로 가능한 조합 찾기
export function getCombinationsForUnit(unitName: string): Combination[] {
  return COMBINATIONS.filter(c => c.materials[0] === unitName);
}

// 조합 가능 여부 체크
export function canCombine(combo: Combination, myUnits: any[]): boolean {
  const needed = [...combo.materials];
  for (const unit of myUnits) {
    const idx = needed.indexOf(unit.type.name);
    if (idx !== -1) needed.splice(idx, 1);
  }
  return needed.length === 0;
}