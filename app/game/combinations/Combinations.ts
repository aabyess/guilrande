export interface Combination {
  result: string;       // 결과 유닛 이름
  resultEmoji: string;
  resultColor: number;
  materials: string[];  // 재료 유닛 이름 목록 (첫번째가 주 유닛)
  description: string;
}

export const COMBINATIONS: Combination[] = [
  {
    result: '신지우',
    resultEmoji: '👊',
    resultColor: 0xff0000,
    materials: ['버서커', '버서커'],
    description: '버서커 2마리 조합',
  },
  // 나중에 추가할 조합들
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