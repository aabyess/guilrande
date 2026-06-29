export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'transcendent' | 'hidden';

export interface UnitType {
  name: string;
  fullName: string;      // 이름 + 별명 (예: "최상호 일진")
  rarity: Rarity;
  color: number;
  range: number;
  damage: number;
  fireRate: number;
  speed: number;
  skillGauge: number;
  emoji: string;
  attackType: 'physical' | 'magic';
  hp: number;
}

// 등급별 색상 (미니맵/UI용)
export const RARITY_COLOR: Record<Rarity, number> = {
  common:    0xaaaaaa,  // 회색
  uncommon:  0x4ecdc4,  // 청록
  rare:      0xa855f7,  // 보라
  epic:      0xff9900,  // 주황
  legendary:     0xff2222,  // 빨강
  transcendent:  0x00ffff,  // 초월 싸이안
  hidden:        0xff00ff,  // 히든 보라
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common:    '흔함',
  uncommon:  '안흔함',
  rare:      '특별함',
  epic:      '희귀함',
  legendary:    '전설적인',
  transcendent: '초월',
  hidden:       '히든',
};

// ─────────────────────────────────────────
// 흔함 (뽑기풀 기본 유닛, 9종)
// ─────────────────────────────────────────
const COMMON_UNITS: UnitType[] = [
  { name: '최상호', fullName: '최상호', rarity: 'common', color: 0xe74c3c, range: 70,  damage: 22, fireRate: 750,  speed: 150, skillGauge: 100, emoji: '😤', attackType: 'physical', hp: 180 },
  { name: '노태현', fullName: '노태현', rarity: 'common', color: 0x3498db, range: 140, damage: 14, fireRate: 580,  speed: 135, skillGauge: 100, emoji: '🏹', attackType: 'physical', hp: 110 },
  { name: '양재모', fullName: '양재모', rarity: 'common', color: 0x2ecc71, range: 110, damage: 30, fireRate: 1100, speed: 115, skillGauge: 100, emoji: '🔮', attackType: 'magic',    hp: 95  },
  { name: '강주혁', fullName: '강주혁', rarity: 'common', color: 0xe67e22, range: 55,  damage: 40, fireRate: 480,  speed: 175, skillGauge: 100, emoji: '🪓', attackType: 'physical', hp: 160 },
  { name: '강재규', fullName: '강재규', rarity: 'common', color: 0x9b59b6, range: 65,  damage: 28, fireRate: 820,  speed: 145, skillGauge: 100, emoji: '⚔️', attackType: 'physical', hp: 175 },
  { name: '박민석', fullName: '박민석', rarity: 'common', color: 0x1abc9c, range: 90,  damage: 18, fireRate: 650,  speed: 130, skillGauge: 100, emoji: '🛡️', attackType: 'physical', hp: 220 },
  { name: '문필환', fullName: '문필환', rarity: 'common', color: 0xf39c12, range: 130, damage: 32, fireRate: 1300, speed: 105, skillGauge: 100, emoji: '💫', attackType: 'magic',    hp: 90  },
  { name: '박민수', fullName: '박민수', rarity: 'common', color: 0x16a085, range: 80,  damage: 20, fireRate: 700,  speed: 140, skillGauge: 100, emoji: '🥊', attackType: 'physical', hp: 140 },
  { name: '임장혁', fullName: '임장혁', rarity: 'common', color: 0x8e44ad, range: 60,  damage: 35, fireRate: 600,  speed: 160, skillGauge: 100, emoji: '💢', attackType: 'physical', hp: 155 },
];

// ─────────────────────────────────────────
// 안흔함 (2재료 조합 결과, 13종 + 볼보이)
// ─────────────────────────────────────────
const UNCOMMON_UNITS: UnitType[] = [
  // 2종 조합
  { name: '황정기', fullName: '황정기',      rarity: 'uncommon', color: 0xf1c40f, range: 100, damage: 55, fireRate: 900,  speed: 145, skillGauge: 100, emoji: '👑', attackType: 'physical', hp: 300 },
  { name: '박준희', fullName: '박준희',      rarity: 'uncommon', color: 0x27ae60, range: 160, damage: 40, fireRate: 700,  speed: 130, skillGauge: 100, emoji: '🎯', attackType: 'physical', hp: 250 },
  { name: '김경현', fullName: '김경현',      rarity: 'uncommon', color: 0x2980b9, range: 120, damage: 65, fireRate: 1100, speed: 110, skillGauge: 100, emoji: '🌊', attackType: 'magic',    hp: 220 },
  { name: '김민준', fullName: '김민준',      rarity: 'uncommon', color: 0xe74c3c, range: 80,  damage: 70, fireRate: 650,  speed: 155, skillGauge: 100, emoji: '⚡', attackType: 'physical', hp: 280 },
  { name: '김용태', fullName: '김용태',      rarity: 'uncommon', color: 0x8e44ad, range: 70,  damage: 60, fireRate: 600,  speed: 160, skillGauge: 100, emoji: '🔥', attackType: 'physical', hp: 260 },
  { name: '신문철', fullName: '신문철',      rarity: 'uncommon', color: 0x16a085, range: 90,  damage: 50, fireRate: 850,  speed: 140, skillGauge: 100, emoji: '🌀', attackType: 'magic',    hp: 240 },
  { name: '김수빈', fullName: '김수빈',      rarity: 'uncommon', color: 0xd35400, range: 110, damage: 58, fireRate: 950,  speed: 125, skillGauge: 100, emoji: '🌸', attackType: 'magic',    hp: 210 },
  { name: '이재윤', fullName: '이재윤',      rarity: 'uncommon', color: 0x2c3e50, range: 95,  damage: 62, fireRate: 800,  speed: 135, skillGauge: 100, emoji: '🌙', attackType: 'magic',    hp: 230 },
  { name: '엄태웅', fullName: '엄태웅',      rarity: 'uncommon', color: 0xe67e22, range: 75,  damage: 75, fireRate: 550,  speed: 165, skillGauge: 100, emoji: '🦁', attackType: 'physical', hp: 290 },
  // 자가 조합
  { name: '알라',   fullName: '강주혁 알라', rarity: 'uncommon', color: 0xf39c12, range: 85,  damage: 90, fireRate: 500,  speed: 180, skillGauge: 100, emoji: '🌙', attackType: 'physical', hp: 320 },
  { name: '재규어', fullName: '강재규 재규어 라이딩', rarity: 'uncommon', color: 0x9b59b6, range: 80, damage: 85, fireRate: 520, speed: 170, skillGauge: 100, emoji: '🐆', attackType: 'physical', hp: 310 },
  { name: '쇼타',   fullName: '문필환 오네쇼타',     rarity: 'uncommon', color: 0xf1c40f, range: 130, damage: 78, fireRate: 1000, speed: 110, skillGauge: 100, emoji: '✨', attackType: 'magic', hp: 270 },
  { name: '로이킴', fullName: '박민수 로이킴',       rarity: 'uncommon', color: 0x1abc9c, range: 95,  damage: 72, fireRate: 750,  speed: 145, skillGauge: 100, emoji: '🎸', attackType: 'physical', hp: 285 },
  // 특수
  { name: '이호준 볼보이', fullName: '이호준 볼보이', rarity: 'uncommon', color: 0x3498db, range: 150, damage: 68, fireRate: 680, speed: 135, skillGauge: 100, emoji: '⚽', attackType: 'physical', hp: 265 },
];

// ─────────────────────────────────────────
// 특별함 (3재료 조합 결과)
// ─────────────────────────────────────────
const RARE_UNITS: UnitType[] = [
  { name: '최상호 일진',      fullName: '최상호 일진',      rarity: 'rare', color: 0xe74c3c, range: 90,  damage: 110, fireRate: 700,  speed: 160, skillGauge: 100, emoji: '😈', attackType: 'physical', hp: 500 },
  { name: '노태현 노티',      fullName: '노태현 노티',      rarity: 'rare', color: 0x3498db, range: 170, damage: 90,  fireRate: 580,  speed: 140, skillGauge: 100, emoji: '🎩', attackType: 'physical', hp: 440 },
  { name: '양재모 늑대',      fullName: '양재모 늑대',      rarity: 'rare', color: 0x2ecc71, range: 140, damage: 130, fireRate: 1100, speed: 120, skillGauge: 100, emoji: '🐺', attackType: 'magic',    hp: 420 },
  { name: '박민석 빡빡이',    fullName: '박민석 빡빡이',    rarity: 'rare', color: 0x1abc9c, range: 100, damage: 100, fireRate: 820,  speed: 135, skillGauge: 100, emoji: '💀', attackType: 'physical', hp: 560 },
  { name: '임장혁 장애인',    fullName: '임장혁 장애인',    rarity: 'rare', color: 0x8e44ad, range: 80,  damage: 140, fireRate: 580,  speed: 170, skillGauge: 100, emoji: '⚡', attackType: 'physical', hp: 480 },
  { name: '황정기 헝그리맨',  fullName: '황정기 헝그리맨',  rarity: 'rare', color: 0xf1c40f, range: 110, damage: 150, fireRate: 900,  speed: 145, skillGauge: 100, emoji: '🍖', attackType: 'physical', hp: 600 },
  { name: '임채준 따까리',    fullName: '임채준 따까리',    rarity: 'rare', color: 0xe67e22, range: 95,  damage: 120, fireRate: 750,  speed: 155, skillGauge: 100, emoji: '🐕', attackType: 'physical', hp: 520 },
  { name: '박기찬 야동마스터',fullName: '박기찬 야동마스터',rarity: 'rare', color: 0xd35400, range: 120, damage: 135, fireRate: 850,  speed: 130, skillGauge: 100, emoji: '📺', attackType: 'magic',    hp: 490 },
  { name: '이현빈 파파라치',  fullName: '이현빈 파파라치',  rarity: 'rare', color: 0x27ae60, range: 175, damage: 105, fireRate: 700,  speed: 140, skillGauge: 100, emoji: '📷', attackType: 'physical', hp: 460 },
  { name: '조세민 이청용',    fullName: '조세민 이청용',    rarity: 'rare', color: 0x2980b9, range: 130, damage: 145, fireRate: 1100, speed: 115, skillGauge: 100, emoji: '⚽', attackType: 'magic',    hp: 430 },
  { name: '왕승환 왕싱싱',    fullName: '왕승환 왕싱싱',    rarity: 'rare', color: 0xc0392b, range: 90,  damage: 160, fireRate: 630,  speed: 165, skillGauge: 100, emoji: '👊', attackType: 'physical', hp: 550 },
  { name: '이병준 불법체류자',fullName: '이병준 불법체류자',rarity: 'rare', color: 0x7f8c8d, range: 85,  damage: 125, fireRate: 680,  speed: 160, skillGauge: 100, emoji: '🚫', attackType: 'physical', hp: 510 },
  { name: '김정래 프로그래머',fullName: '김정래 프로그래머',rarity: 'rare', color: 0x2c3e50, range: 115, damage: 138, fireRate: 950,  speed: 125, skillGauge: 100, emoji: '💻', attackType: 'magic',    hp: 470 },
  { name: '김용태 흑화',      fullName: '김용태 흑화',      rarity: 'rare', color: 0x1a1a2e, range: 80,  damage: 170, fireRate: 580,  speed: 170, skillGauge: 100, emoji: '🖤', attackType: 'physical', hp: 540 },
  { name: '이정범 벨튀선구자',fullName: '이정범 벨튀선구자',rarity: 'rare', color: 0x6c3483, range: 100, damage: 115, fireRate: 770,  speed: 150, skillGauge: 100, emoji: '🏃', attackType: 'physical', hp: 500 },
  { name: '유재헌 피망',      fullName: '유재헌 피망',      rarity: 'rare', color: 0xc0392b, range: 125, damage: 142, fireRate: 1050, speed: 120, skillGauge: 100, emoji: '🌶️', attackType: 'magic',    hp: 445 },
  { name: '주영호 마마보이',  fullName: '주영호 마마보이',  rarity: 'rare', color: 0x16a085, range: 105, damage: 118, fireRate: 800,  speed: 135, skillGauge: 100, emoji: '👩', attackType: 'physical', hp: 495 },
  { name: '고우선 전정실부인',fullName: '고우선 전정실부인',rarity: 'rare', color: 0xe91e63, range: 135, damage: 108, fireRate: 920,  speed: 128, skillGauge: 100, emoji: '💍', attackType: 'magic',    hp: 460 },
  { name: '이지원 음지소녀',  fullName: '이지원 음지소녀',  rarity: 'rare', color: 0x4a235a, range: 120, damage: 128, fireRate: 1000, speed: 118, skillGauge: 100, emoji: '🌑', attackType: 'magic',    hp: 440 },
  { name: '서아인 사이코패스',fullName: '서아인 사이코패스',rarity: 'rare', color: 0x922b21, range: 95,  damage: 155, fireRate: 720,  speed: 155, skillGauge: 100, emoji: '🔪', attackType: 'physical', hp: 525 },
  { name: '박예원 성대결절',  fullName: '박예원 성대결절',  rarity: 'rare', color: 0x9b59b6, range: 130, damage: 112, fireRate: 970,  speed: 122, skillGauge: 100, emoji: '🎤', attackType: 'magic',    hp: 455 },
  { name: '조성진 작은메주',  fullName: '조성진 작은메주',  rarity: 'rare', color: 0x795548, range: 75,  damage: 148, fireRate: 620,  speed: 158, skillGauge: 100, emoji: '🍡', attackType: 'physical', hp: 515 },
  { name: '박진웅 축구의달인',fullName: '박진웅 축구의달인',rarity: 'rare', color: 0x27ae60, range: 110, damage: 132, fireRate: 860,  speed: 142, skillGauge: 100, emoji: '⚽', attackType: 'physical', hp: 485 },
  { name: '노건완 노가리',    fullName: '노건완 노가리',    rarity: 'rare', color: 0x3498db, range: 145, damage: 102, fireRate: 680,  speed: 133, skillGauge: 100, emoji: '🐟', attackType: 'physical', hp: 470 },
  { name: '최동준 구일톱블랙홀',fullName:'최동준 구일톱블랙홀',rarity:'rare',color: 0x0d0d0d, range: 88, damage: 165, fireRate: 600,  speed: 168, skillGauge: 100, emoji: '🕳️', attackType: 'physical', hp: 535 },
  { name: '강주혁 코알라',    fullName: '강주혁 코알라',    rarity: 'rare', color: 0x7b9e87, range: 82,  damage: 175, fireRate: 570,  speed: 172, skillGauge: 100, emoji: '🐨', attackType: 'physical', hp: 560 },
  { name: '정승준 저승사자',  fullName: '정승준 저승사자',  rarity: 'rare', color: 0x2c2c2c, range: 98,  damage: 158, fireRate: 740,  speed: 152, skillGauge: 100, emoji: '💀', attackType: 'physical', hp: 530 },
  { name: '배성령 해커',      fullName: '배성령 해커',      rarity: 'rare', color: 0x00ff41, range: 140, damage: 122, fireRate: 1030, speed: 118, skillGauge: 100, emoji: '💾', attackType: 'magic',    hp: 450 },
  { name: '김태영 일베조무사',fullName: '김태영 일베조무사',rarity: 'rare', color: 0xff6b35, range: 105, damage: 135, fireRate: 880,  speed: 128, skillGauge: 100, emoji: '🤡', attackType: 'physical', hp: 475 },
  { name: '최준우 원조렝가',  fullName: '최준우 원조렝가',  rarity: 'rare', color: 0xd4a017, range: 88,  damage: 145, fireRate: 650,  speed: 155, skillGauge: 100, emoji: '🧱', attackType: 'physical', hp: 505 },
  { name: '송형성 틱장애',    fullName: '송형성 틱장애',    rarity: 'rare', color: 0xff4500, range: 78,  damage: 152, fireRate: 600,  speed: 163, skillGauge: 100, emoji: '💥', attackType: 'physical', hp: 520 },
  { name: '박민수 루키인싸',  fullName: '박민수 루키인싸',  rarity: 'rare', color: 0x00bcd4, range: 115, damage: 125, fireRate: 820,  speed: 138, skillGauge: 100, emoji: '😎', attackType: 'physical', hp: 490 },
  { name: '엄태웅 알라',      fullName: '엄태웅 알라',      rarity: 'rare', color: 0xff9800, range: 85,  damage: 168, fireRate: 560,  speed: 170, skillGauge: 100, emoji: '🌙', attackType: 'physical', hp: 545 },
  { name: '조도연 좆돼지',    fullName: '조도연 좆돼지',    rarity: 'rare', color: 0xff69b4, range: 72,  damage: 180, fireRate: 540,  speed: 175, skillGauge: 100, emoji: '🐷', attackType: 'physical', hp: 570 },
  { name: '이승우 악의근원',  fullName: '이승우 악의근원',  rarity: 'rare', color: 0x8b0000, range: 92,  damage: 200, fireRate: 640,  speed: 162, skillGauge: 100, emoji: '😇', attackType: 'physical', hp: 600 },
];

// ─────────────────────────────────────────
// 희귀함 (특별함 3개 조합, 약 40종 - 일부 선발)
// ─────────────────────────────────────────
const EPIC_UNITS: UnitType[] = [
  { name: '최상호 윤식파의두뇌',   fullName: '최상호 윤식파의두뇌',   rarity: 'epic', color: 0xe74c3c, range: 120, damage: 280, fireRate: 700,  speed: 165, skillGauge: 100, emoji: '🧠', attackType: 'physical', hp: 900  },
  { name: '노태현 노짱',           fullName: '노태현 노짱',           rarity: 'epic', color: 0x3498db, range: 200, damage: 240, fireRate: 560,  speed: 148, skillGauge: 100, emoji: '👓', attackType: 'physical', hp: 820  },
  { name: '양재모 상호파의개',     fullName: '양재모 상호파의개',     rarity: 'epic', color: 0x2ecc71, range: 160, damage: 310, fireRate: 1050, speed: 125, skillGauge: 100, emoji: '🐕', attackType: 'magic',    hp: 780  },
  { name: '두유찬 차가운젖꼭지',   fullName: '두유찬 차가운젖꼭지',   rarity: 'epic', color: 0x1abc9c, range: 110, damage: 290, fireRate: 820,  speed: 140, skillGauge: 100, emoji: '🧊', attackType: 'physical', hp: 870  },
  { name: '엄태웅 엄티',           fullName: '엄태웅 엄티',           rarity: 'epic', color: 0xe67e22, range: 95,  damage: 330, fireRate: 560,  speed: 178, skillGauge: 100, emoji: '🦁', attackType: 'physical', hp: 960  },
  { name: '황준석 구일외교관',     fullName: '황준석 구일외교관',     rarity: 'epic', color: 0xf1c40f, range: 130, damage: 270, fireRate: 750,  speed: 152, skillGauge: 100, emoji: '🤝', attackType: 'physical', hp: 840  },
  { name: '이용민 만삭',           fullName: '이용민 만삭',           rarity: 'epic', color: 0x9b59b6, range: 145, damage: 255, fireRate: 900,  speed: 132, skillGauge: 100, emoji: '🤰', attackType: 'magic',    hp: 800  },
  { name: '강보명 과거의그림자',   fullName: '강보명 과거의그림자',   rarity: 'epic', color: 0x2c3e50, range: 115, damage: 300, fireRate: 780,  speed: 145, skillGauge: 100, emoji: '👻', attackType: 'magic',    hp: 850  },
  { name: '박기찬 DDR의권위자',    fullName: '박기찬 DDR의권위자',    rarity: 'epic', color: 0xd35400, range: 135, damage: 285, fireRate: 840,  speed: 138, skillGauge: 100, emoji: '🕺', attackType: 'physical', hp: 830  },
  { name: '노수신 말파이트보법장인',fullName: '노수신 말파이트보법장인',rarity:'epic',color: 0x16a085, range: 125, damage: 295, fireRate: 760,  speed: 142, skillGauge: 100, emoji: '🪨', attackType: 'physical', hp: 860  },
  { name: '임채민 채민파리더',     fullName: '임채민 채민파리더',     rarity: 'epic', color: 0x8e44ad, range: 118, damage: 305, fireRate: 800,  speed: 148, skillGauge: 100, emoji: '👑', attackType: 'physical', hp: 880  },
  { name: '김경현 야구부주장',     fullName: '김경현 야구부주장',     rarity: 'epic', color: 0x2980b9, range: 108, damage: 320, fireRate: 720,  speed: 155, skillGauge: 100, emoji: '⚾', attackType: 'physical', hp: 920  },
  { name: '배병규 아랍왕자',       fullName: '배병규 아랍왕자',       rarity: 'epic', color: 0xffd700, range: 140, damage: 275, fireRate: 880,  speed: 136, skillGauge: 100, emoji: '🤴', attackType: 'magic',    hp: 810  },
  { name: '박수찬 심각한로리콘',   fullName: '박수찬 심각한로리콘',   rarity: 'epic', color: 0xff69b4, range: 155, damage: 260, fireRate: 960,  speed: 128, skillGauge: 100, emoji: '🎀', attackType: 'magic',    hp: 790  },
  { name: '김정래 은석패밀리해체자',fullName:'김정래 은석패밀리해체자',rarity:'epic',color: 0x2c3e50, range: 130, damage: 315, fireRate: 940,  speed: 128, skillGauge: 100, emoji: '💣', attackType: 'magic',    hp: 840  },
  { name: '김만경 구일단속반',     fullName: '김만경 구일단속반',     rarity: 'epic', color: 0x1a1a2e, range: 105, damage: 340, fireRate: 600,  speed: 170, skillGauge: 100, emoji: '🚔', attackType: 'physical', hp: 950  },
  { name: '이태훈 폭군',           fullName: '이태훈 폭군',           rarity: 'epic', color: 0x8b0000, range: 98,  damage: 360, fireRate: 580,  speed: 172, skillGauge: 100, emoji: '👿', attackType: 'physical', hp: 980  },
  { name: '윤현모 비지니스',       fullName: '윤현모 비지니스',       rarity: 'epic', color: 0x34495e, range: 125, damage: 298, fireRate: 780,  speed: 143, skillGauge: 100, emoji: '💼', attackType: 'physical', hp: 855  },
  { name: '장태영 경찰을꿈꾸는샛별',fullName:'장태영 경찰을꿈꾸는샛별',rarity:'epic',color: 0x3498db, range: 142, damage: 268, fireRate: 700,  speed: 150, skillGauge: 100, emoji: '⭐', attackType: 'physical', hp: 815  },
  { name: '유재헌 토토교수',       fullName: '유재헌 토토교수',       rarity: 'epic', color: 0xc0392b, range: 148, damage: 278, fireRate: 1020, speed: 122, skillGauge: 100, emoji: '🎲', attackType: 'magic',    hp: 800  },
  { name: '최현우 마술사',         fullName: '최현우 마술사',         rarity: 'epic', color: 0x6c3483, range: 160, damage: 290, fireRate: 1100, speed: 118, skillGauge: 100, emoji: '🎩', attackType: 'magic',    hp: 785  },
  { name: '이재윤 논란의중심',     fullName: '이재윤 논란의중심',     rarity: 'epic', color: 0xe74c3c, range: 112, damage: 325, fireRate: 740,  speed: 158, skillGauge: 100, emoji: '🔥', attackType: 'physical', hp: 910  },
  { name: '배현진 퀸카',           fullName: '배현진 퀸카',           rarity: 'epic', color: 0xff1493, range: 155, damage: 262, fireRate: 680,  speed: 135, skillGauge: 100, emoji: '💅', attackType: 'magic',    hp: 795  },
  { name: '고어진 분노조절장애',   fullName: '고어진 분노조절장애',   rarity: 'epic', color: 0xff4500, range: 96,  damage: 345, fireRate: 570,  speed: 175, skillGauge: 100, emoji: '😡', attackType: 'physical', hp: 960  },
  { name: '정내연 그림쟁이',       fullName: '정내연 그림쟁이',       rarity: 'epic', color: 0xff9900, range: 138, damage: 272, fireRate: 1000, speed: 120, skillGauge: 100, emoji: '🎨', attackType: 'magic',    hp: 805  },
  { name: '서민성 정글설계사',     fullName: '서민성 정글설계사',     rarity: 'epic', color: 0x145a32, range: 122, damage: 308, fireRate: 770,  speed: 145, skillGauge: 100, emoji: '🌿', attackType: 'physical', hp: 875  },
  { name: '조현규 피즈',           fullName: '조현규 피즈',           rarity: 'epic', color: 0x00bcd4, range: 118, damage: 315, fireRate: 800,  speed: 148, skillGauge: 100, emoji: '🐟', attackType: 'magic',    hp: 890  },
  { name: '선효진 프로고백러',     fullName: '선효진 프로고백러',     rarity: 'epic', color: 0xff6b9d, range: 152, damage: 258, fireRate: 680,  speed: 133, skillGauge: 100, emoji: '💌', attackType: 'physical', hp: 788  },
  { name: '이상혁 거권',           fullName: '이상혁 거권',           rarity: 'epic', color: 0x00ff41, range: 128, damage: 335, fireRate: 760,  speed: 158, skillGauge: 100, emoji: '💪', attackType: 'physical', hp: 930  },
  { name: '현성현 모범생',         fullName: '현성현 모범생',         rarity: 'epic', color: 0x4a90d9, range: 145, damage: 265, fireRate: 840,  speed: 130, skillGauge: 100, emoji: '📚', attackType: 'magic',    hp: 808  },
  { name: '구주호 조성진스승',     fullName: '구주호 조성진스승',     rarity: 'epic', color: 0x795548, range: 105, damage: 318, fireRate: 720,  speed: 152, skillGauge: 100, emoji: '🎓', attackType: 'physical', hp: 895  },
  { name: '박도진 거인학살자',     fullName: '박도진 거인학살자',     rarity: 'epic', color: 0x2c2c2c, range: 102, damage: 350, fireRate: 610,  speed: 168, skillGauge: 100, emoji: '🗡️', attackType: 'physical', hp: 970  },
  { name: '강주혁 악동',           fullName: '강주혁 악동',           rarity: 'epic', color: 0xe67e22, range: 92,  damage: 340, fireRate: 590,  speed: 175, skillGauge: 100, emoji: '😼', attackType: 'physical', hp: 955  },
  { name: '강재규 뒤틀린사랑',     fullName: '강재규 뒤틀린사랑',     rarity: 'epic', color: 0x9b59b6, range: 108, damage: 328, fireRate: 730,  speed: 155, skillGauge: 100, emoji: '💔', attackType: 'physical', hp: 915  },
  { name: '이은엽 드럼신동',       fullName: '이은엽 드럼신동',       rarity: 'epic', color: 0xf39c12, range: 115, damage: 312, fireRate: 810,  speed: 145, skillGauge: 100, emoji: '🥁', attackType: 'physical', hp: 885  },
  { name: '배성령 CY창설자',       fullName: '배성령 CY창설자',       rarity: 'epic', color: 0x00ff41, range: 158, damage: 285, fireRate: 990,  speed: 125, skillGauge: 100, emoji: '💻', attackType: 'magic',    hp: 820  },
  { name: '박은석 은석패밀리두목', fullName: '박은석 은석패밀리두목', rarity: 'epic', color: 0x8e44ad, range: 112, damage: 322, fireRate: 750,  speed: 152, skillGauge: 100, emoji: '🦅', attackType: 'physical', hp: 900  },
  { name: '김청운 애국보수',       fullName: '김청운 애국보수',       rarity: 'epic', color: 0xc0392b, range: 128, damage: 295, fireRate: 770,  speed: 142, skillGauge: 100, emoji: '🇰🇷', attackType: 'physical', hp: 858  },
  { name: '김기연 시조의게이',     fullName: '김기연 시조의게이',     rarity: 'epic', color: 0xff69b4, range: 135, damage: 278, fireRate: 900,  speed: 132, skillGauge: 100, emoji: '🌈', attackType: 'magic',    hp: 812  },
  { name: '장하민 캐나다갱단',     fullName: '장하민 캐나다갱단',     rarity: 'epic', color: 0xff0000, range: 105, damage: 338, fireRate: 680,  speed: 162, skillGauge: 100, emoji: '🍁', attackType: 'physical', hp: 935  },
  { name: '박민수 슈퍼인싸',       fullName: '박민수 슈퍼인싸',       rarity: 'epic', color: 0x00bcd4, range: 128, damage: 305, fireRate: 800,  speed: 148, skillGauge: 100, emoji: '🌟', attackType: 'physical', hp: 878  },
];

// ─────────────────────────────────────────
// 전설적인 (희귀함 3개 조합, 최상위)
// ─────────────────────────────────────────
const LEGENDARY_UNITS: UnitType[] = [
  { name: '최상호 상호파수장',        fullName: '최상호 상호파수장',        rarity: 'legendary', color: 0xff2222, range: 160, damage: 600, fireRate: 650,  speed: 175, skillGauge: 100, emoji: '👑', attackType: 'physical', hp: 2000 },
  { name: '노태현 사회복무요원',       fullName: '노태현 사회복무요원',       rarity: 'legendary', color: 0x3498db, range: 240, damage: 520, fireRate: 520,  speed: 155, skillGauge: 100, emoji: '🪖', attackType: 'physical', hp: 1800 },
  { name: '양재모 상호파비밀병기',     fullName: '양재모 상호파비밀병기',     rarity: 'legendary', color: 0x2ecc71, range: 200, damage: 680, fireRate: 1000, speed: 130, skillGauge: 100, emoji: '🐺', attackType: 'magic',    hp: 1700 },
  { name: '정준영 준영파보스',         fullName: '정준영 준영파보스',         rarity: 'legendary', color: 0xf1c40f, range: 170, damage: 720, fireRate: 860,  speed: 148, skillGauge: 100, emoji: '💰', attackType: 'physical', hp: 1900 },
  { name: '엄태웅 짱스파최대전력',     fullName: '엄태웅 짱스파최대전력',     rarity: 'legendary', color: 0xe67e22, range: 145, damage: 780, fireRate: 540,  speed: 188, skillGauge: 100, emoji: '🔱', attackType: 'physical', hp: 2100 },
  { name: '이유선 페미니스트',         fullName: '이유선 페미니스트',         rarity: 'legendary', color: 0xff69b4, range: 190, damage: 560, fireRate: 680,  speed: 145, skillGauge: 100, emoji: '♀️', attackType: 'magic',    hp: 1750 },
  { name: '임채현 호모사피엔스',       fullName: '임채현 호모사피엔스',       rarity: 'legendary', color: 0x9b59b6, range: 175, damage: 640, fireRate: 750,  speed: 158, skillGauge: 100, emoji: '🧬', attackType: 'physical', hp: 1850 },
  { name: '박병규 세상물정모르는도련님',fullName:'박병규 세상물정모르는도련님',rarity:'legendary',color: 0x2c3e50, range: 155, damage: 590, fireRate: 700,  speed: 148, skillGauge: 100, emoji: '🎭', attackType: 'physical', hp: 1780 },
  { name: '임채민 교회파리더',         fullName: '임채민 교회파리더',         rarity: 'legendary', color: 0x8e44ad, range: 165, damage: 660, fireRate: 780,  speed: 155, skillGauge: 100, emoji: '✝️', attackType: 'physical', hp: 1860 },
  { name: '박민석 혹독한요리사',       fullName: '박민석 혹독한요리사',       rarity: 'legendary', color: 0xe74c3c, range: 152, damage: 700, fireRate: 800,  speed: 145, skillGauge: 100, emoji: '🍳', attackType: 'physical', hp: 1920 },
  { name: '홍인창 고슴도치',           fullName: '홍인창 고슴도치',           rarity: 'legendary', color: 0x8b4513, range: 148, damage: 615, fireRate: 720,  speed: 152, skillGauge: 100, emoji: '🦔', attackType: 'physical', hp: 1810 },
  { name: '김정래 전교회장',           fullName: '김정래 전교회장',           rarity: 'legendary', color: 0x2c3e50, range: 175, damage: 650, fireRate: 920,  speed: 132, skillGauge: 100, emoji: '🏆', attackType: 'magic',    hp: 1840 },
  { name: '정윤식 SM설립자',           fullName: '정윤식 SM설립자',           rarity: 'legendary', color: 0x1a1a2e, range: 158, damage: 730, fireRate: 600,  speed: 175, skillGauge: 100, emoji: '🎤', attackType: 'physical', hp: 1980 },
  { name: '김민규 미래를보는눈',       fullName: '김민규 미래를보는눈',       rarity: 'legendary', color: 0x6c3483, range: 195, damage: 580, fireRate: 1050, speed: 125, skillGauge: 100, emoji: '👁️', attackType: 'magic',    hp: 1760 },
  { name: '신문철 장난꾸러기',         fullName: '신문철 장난꾸러기',         rarity: 'legendary', color: 0x16a085, range: 170, damage: 625, fireRate: 1100, speed: 122, skillGauge: 100, emoji: '🃏', attackType: 'magic',    hp: 1790 },
  { name: '이재윤 이중인격',           fullName: '이재윤 이중인격',           rarity: 'legendary', color: 0xe74c3c, range: 162, damage: 710, fireRate: 720,  speed: 162, skillGauge: 100, emoji: '🎭', attackType: 'physical', hp: 1950 },
  { name: '진연서 윤식파여장부',       fullName: '진연서 윤식파여장부',       rarity: 'legendary', color: 0xff1493, range: 185, damage: 570, fireRate: 660,  speed: 138, skillGauge: 100, emoji: '⚔️', attackType: 'physical', hp: 1770 },
  { name: '이현주 그분의애마',         fullName: '이현주 그분의애마',         rarity: 'legendary', color: 0xff9900, range: 172, damage: 608, fireRate: 730,  speed: 150, skillGauge: 100, emoji: '🐎', attackType: 'physical', hp: 1820 },
  { name: '이시원 일러스트레이터',     fullName: '이시원 일러스트레이터',     rarity: 'legendary', color: 0xff6b35, range: 178, damage: 595, fireRate: 980,  speed: 128, skillGauge: 100, emoji: '🖌️', attackType: 'magic',    hp: 1780 },
  { name: '김민준 초대마스터',         fullName: '김민준 초대마스터',         rarity: 'legendary', color: 0xf1c40f, range: 140, damage: 760, fireRate: 680,  speed: 168, skillGauge: 100, emoji: '🌟', attackType: 'physical', hp: 2050 },
  { name: '김건 YM파행동대장',         fullName: '김건 YM파행동대장',         rarity: 'legendary', color: 0x00ff41, range: 155, damage: 740, fireRate: 760,  speed: 162, skillGauge: 100, emoji: '⚡', attackType: 'physical', hp: 2020 },
  { name: '백기현 코끼리다리',         fullName: '백기현 코끼리다리',         rarity: 'legendary', color: 0x7b9e87, range: 135, damage: 800, fireRate: 580,  speed: 178, skillGauge: 100, emoji: '🦣', attackType: 'physical', hp: 2200 },
  { name: '이일중 엄친아',             fullName: '이일중 엄친아',             rarity: 'legendary', color: 0x4a90d9, range: 168, damage: 622, fireRate: 840,  speed: 142, skillGauge: 100, emoji: '😇', attackType: 'magic',    hp: 1830 },
  { name: '구주호 희대의사기꾼',       fullName: '구주호 희대의사기꾼',       rarity: 'legendary', color: 0x795548, range: 148, damage: 688, fireRate: 720,  speed: 158, skillGauge: 100, emoji: '🎰', attackType: 'physical', hp: 1880 },
  { name: '임건웅 초대받지않은외부인', fullName: '임건웅 초대받지않은외부인', rarity: 'legendary', color: 0x2c2c2c, range: 142, damage: 750, fireRate: 630,  speed: 172, skillGauge: 100, emoji: '🚪', attackType: 'physical', hp: 2000 },
  { name: '신지우 빅맘',               fullName: '신지우 빅맘',               rarity: 'legendary', color: 0xff0066, range: 155, damage: 820, fireRate: 700,  speed: 168, skillGauge: 100, emoji: '👊', attackType: 'physical', hp: 2300 },
  { name: '임장혁 짱스파단장',         fullName: '임장혁 짱스파단장',         rarity: 'legendary', color: 0x8e44ad, range: 132, damage: 840, fireRate: 590,  speed: 180, skillGauge: 100, emoji: '💢', attackType: 'physical', hp: 2250 },
  { name: '박은석 은석가족두목',       fullName: '박은석 은석가족두목',       rarity: 'legendary', color: 0x8e44ad, range: 145, damage: 780, fireRate: 740,  speed: 155, skillGauge: 100, emoji: '🦅', attackType: 'physical', hp: 2150 },
  { name: '양문호 트위터노출남',       fullName: '양문호 트위터노출남',       rarity: 'legendary', color: 0x1da1f2, range: 175, damage: 598, fireRate: 880,  speed: 135, skillGauge: 100, emoji: '🐦', attackType: 'magic',    hp: 1795 },
  { name: '박성호 리플리증후군',       fullName: '박성호 리플리증후군',       rarity: 'legendary', color: 0x9b59b6, range: 162, damage: 672, fireRate: 810,  speed: 148, skillGauge: 100, emoji: '🎭', attackType: 'magic',    hp: 1865 },
  { name: '김용태 되돌아온동료',       fullName: '김용태 되돌아온동료',       rarity: 'legendary', color: 0x1a1a2e, range: 138, damage: 798, fireRate: 640,  speed: 172, skillGauge: 100, emoji: '🔄', attackType: 'physical', hp: 2120 },
  { name: '박민수 윤식파오른팔',       fullName: '박민수 윤식파오른팔',       rarity: 'legendary', color: 0x00bcd4, range: 152, damage: 718, fireRate: 760,  speed: 155, skillGauge: 100, emoji: '💪', attackType: 'physical', hp: 1970 },
  { name: '이승우 구일의악을흩뿌린장본인',fullName:'이승우 구일의악을흩뿌린장본인',rarity:'legendary',color:0x8b0000,range:148,damage:900,fireRate:620,speed:175,skillGauge:100,emoji:'😇',attackType:'physical',hp:2500},
];


// ─────────────────────────────────────────
// 랜덤유닛 (뽑기풀 외 특수 소환)
// ─────────────────────────────────────────
const RANDOM_UNITS: UnitType[] = [
  { name: '이민형',       fullName: '이민형 보조딜',        rarity: 'uncommon', color: 0x95a5a6, range: 120, damage: 55,  fireRate: 800,  speed: 140, skillGauge: 100, emoji: '🤝', attackType: 'physical', hp: 280 },
  { name: '주호페이크',   fullName: '주호페이크',           rarity: 'uncommon', color: 0x8e44ad, range: 999, damage: 80,  fireRate: 700,  speed: 150, skillGauge: 100, emoji: '👻', attackType: 'magic',    hp: 260 },
  { name: '김건모',       fullName: '김건모',               rarity: 'uncommon', color: 0xe74c3c, range: 100, damage: 50,  fireRate: 500,  speed: 160, skillGauge: 100, emoji: '⚡', attackType: 'physical', hp: 240 },
  { name: '야사카 카나코', fullName: '야사카 카나코',        rarity: 'uncommon', color: 0x9b59b6, range: 150, damage: 90,  fireRate: 1100, speed: 120, skillGauge: 100, emoji: '🌀', attackType: 'magic',    hp: 220 },
  { name: '호시노 아이',  fullName: '호시노 아이',           rarity: 'uncommon', color: 0xf1c40f, range: 110, damage: 45,  fireRate: 900,  speed: 135, skillGauge: 100, emoji: '⭐', attackType: 'magic',    hp: 230 },
  { name: '카마도 탄지로', fullName: '카마도 탄지로',        rarity: 'uncommon', color: 0x27ae60, range: 80,  damage: 70,  fireRate: 650,  speed: 165, skillGauge: 100, emoji: '🔥', attackType: 'physical', hp: 300 },
  { name: '가사이 유노',  fullName: '가사이 유노',           rarity: 'uncommon', color: 0xe67e22, range: 70,  damage: 100, fireRate: 480,  speed: 175, skillGauge: 100, emoji: '🗡️', attackType: 'physical', hp: 270 },
  { name: '이타도리 유지', fullName: '이타도리 유지',        rarity: 'uncommon', color: 0x2c3e50, range: 90,  damage: 75,  fireRate: 700,  speed: 155, skillGauge: 100, emoji: '👊', attackType: 'physical', hp: 290 },
  { name: '모몬가',       fullName: '모몬가',               rarity: 'uncommon', color: 0x1a1a2e, range: 140, damage: 85,  fireRate: 1000, speed: 125, skillGauge: 100, emoji: '💀', attackType: 'magic',    hp: 250 },
  { name: '한마 바키',    fullName: '한마 바키',            rarity: 'uncommon', color: 0xd35400, range: 75,  damage: 95,  fireRate: 600,  speed: 170, skillGauge: 100, emoji: '💪', attackType: 'physical', hp: 310 },
  { name: '리바이 아커만', fullName: '리바이 아커만',        rarity: 'uncommon', color: 0x2980b9, range: 999, damage: 88,  fireRate: 750,  speed: 145, skillGauge: 100, emoji: '⚔️', attackType: 'physical', hp: 275 },
  { name: '손오공',       fullName: '손오공',               rarity: 'uncommon', color: 0xf39c12, range: 130, damage: 92,  fireRate: 900,  speed: 160, skillGauge: 100, emoji: '🐒', attackType: 'magic',    hp: 265 },
  { name: '미도리야 이즈쿠', fullName: '미도리야 이즈쿠',   rarity: 'uncommon', color: 0x27ae60, range: 120, damage: 78,  fireRate: 850,  speed: 140, skillGauge: 100, emoji: '🦸', attackType: 'magic',    hp: 255 },
  { name: '이즈미 신이치', fullName: '이즈미 신이치',        rarity: 'uncommon', color: 0x16a085, range: 160, damage: 82,  fireRate: 680,  speed: 138, skillGauge: 100, emoji: '🎯', attackType: 'physical', hp: 245 },
  { name: '나나미 치아키', fullName: '나나미 치아키 다른세계', rarity: 'uncommon', color: 0xff69b4, range: 110, damage: 60, fireRate: 920, speed: 130, skillGauge: 100, emoji: '🎮', attackType: 'magic',   hp: 235 },
];

// ─────────────────────────────────────────
// 확장팩 (랜덤유닛 조합 결과)
// ─────────────────────────────────────────
const EXPANSION_UNITS: UnitType[] = [
  { name: '고태훈',       fullName: '고태훈',               rarity: 'rare', color: 0x8e44ad, range: 999, damage: 180, fireRate: 720,  speed: 145, skillGauge: 100, emoji: '💥', attackType: 'magic',    hp: 700 },
  { name: '김건부',       fullName: '김건부',               rarity: 'rare', color: 0x2c3e50, range: 95,  damage: 160, fireRate: 580,  speed: 160, skillGauge: 100, emoji: '🔵', attackType: 'physical', hp: 680 },
  { name: '모리야 스와코', fullName: '모리야 스와코',        rarity: 'rare', color: 0x27ae60, range: 130, damage: 200, fireRate: 990,  speed: 130, skillGauge: 100, emoji: '🐸', attackType: 'magic',    hp: 650 },
  { name: '고죠 사토루',  fullName: '고죠 사토루',           rarity: 'rare', color: 0x00bcd4, range: 180, damage: 220, fireRate: 800,  speed: 148, skillGauge: 100, emoji: '♾️', attackType: 'magic',    hp: 620 },
  { name: '올마이트',     fullName: '올마이트',             rarity: 'rare', color: 0xf1c40f, range: 110, damage: 240, fireRate: 640,  speed: 155, skillGauge: 100, emoji: '💪', attackType: 'physical', hp: 750 },
  { name: '한마 유지로',  fullName: '한마 유지로',           rarity: 'rare', color: 0xd35400, range: 85,  damage: 260, fireRate: 560,  speed: 168, skillGauge: 100, emoji: '👊', attackType: 'physical', hp: 780 },
  { name: '브로리',       fullName: '브로리',               rarity: 'rare', color: 0x2ecc71, range: 100, damage: 280, fireRate: 520,  speed: 175, skillGauge: 100, emoji: '🔱', attackType: 'physical', hp: 820 },
  { name: '호시노 루비',  fullName: '호시노 루비',           rarity: 'rare', color: 0xff69b4, range: 140, damage: 170, fireRate: 1050, speed: 128, skillGauge: 100, emoji: '💎', attackType: 'magic',    hp: 640 },
];

// ─────────────────────────────────────────
// 불멸 (특수 조합)
// ─────────────────────────────────────────
const IMMORTAL_UNITS: UnitType[] = [
  { name: '정윤식 구일의지배자', fullName: '정윤식 구일의지배자', rarity: 'epic', color: 0x9b59b6, range: 155, damage: 380, fireRate: 850,  speed: 145, skillGauge: 100, emoji: '👁️', attackType: 'magic',    hp: 1200 },
  { name: '김용태 유명인사',     fullName: '김용태 유명인사',     rarity: 'epic', color: 0x1a1a2e, range: 999, damage: 340, fireRate: 640,  speed: 162, skillGauge: 100, emoji: '🌟', attackType: 'physical', hp: 1150 },
  { name: '정준영 최종보스',     fullName: '정준영 최종보스',     rarity: 'epic', color: 0xf1c40f, range: 120, damage: 420, fireRate: 750,  speed: 148, skillGauge: 100, emoji: '💰', attackType: 'physical', hp: 1300 },
  { name: '박은석 구일전설',     fullName: '박은석 구일전설',     rarity: 'epic', color: 0x8e44ad, range: 130, damage: 400, fireRate: 700,  speed: 155, skillGauge: 100, emoji: '🦅', attackType: 'physical', hp: 1250 },
  { name: '신지우 공포를몰아오는신', fullName: '신지우 공포를몰아오는신', rarity: 'epic', color: 0xff0066, range: 145, damage: 360, fireRate: 780, speed: 152, skillGauge: 100, emoji: '👊', attackType: 'magic', hp: 1180 },
  { name: '이승우 태초의악마',   fullName: '이승우 태초의악마',   rarity: 'epic', color: 0x8b0000, range: 138, damage: 440, fireRate: 720,  speed: 158, skillGauge: 100, emoji: '😇', attackType: 'magic',    hp: 1350 },
  { name: '고도현 전교1등',      fullName: '고도현 전교1등',      rarity: 'epic', color: 0x4a90d9, range: 160, damage: 330, fireRate: 900,  speed: 132, skillGauge: 100, emoji: '📚', attackType: 'magic',    hp: 1100 },
  { name: '이이삭 싸움패왕',     fullName: '이이삭 싸움패왕',     rarity: 'epic', color: 0xd35400, range: 110, damage: 460, fireRate: 620,  speed: 165, skillGauge: 100, emoji: '👑', attackType: 'physical', hp: 1400 },
];

// ─────────────────────────────────────────
// 영원 (Save 조합)
// ─────────────────────────────────────────
const ETERNAL_UNITS: UnitType[] = [
  { name: '김영원 교수의은사',   fullName: '김영원 교수의은사',   rarity: 'legendary', color: 0xf1c40f, range: 150, damage: 550, fireRate: 700,  speed: 150, skillGauge: 100, emoji: '🎓', attackType: 'physical', hp: 1800 },
  { name: '조세민 타락한신',     fullName: '조세민 타락한신의추종자', rarity: 'legendary', color: 0x9b59b6, range: 135, damage: 580, fireRate: 920, speed: 145, skillGauge: 100, emoji: '😈', attackType: 'magic', hp: 1750 },
  { name: '이지원 악의구렁텅이', fullName: '이지원 악의구렁텅이의여제', rarity: 'legendary', color: 0x4a235a, range: 165, damage: 620, fireRate: 860, speed: 138, skillGauge: 100, emoji: '🌑', attackType: 'magic', hp: 1850 },
  { name: '문필환 구일왕자',     fullName: '문필환 구일왕자',     rarity: 'legendary', color: 0xf39c12, range: 140, damage: 660, fireRate: 780,  speed: 148, skillGauge: 100, emoji: '👑', attackType: 'physical', hp: 1900 },
  { name: '서민성 은둔고수',     fullName: '서민성 은둔고수',     rarity: 'legendary', color: 0x145a32, range: 125, damage: 700, fireRate: 650,  speed: 158, skillGauge: 100, emoji: '🌿', attackType: 'magic',    hp: 1950 },
  { name: '김정래 언변술사',     fullName: '김정래 언변술사',     rarity: 'legendary', color: 0x2c3e50, range: 148, damage: 720, fireRate: 920,  speed: 132, skillGauge: 100, emoji: '🏆', attackType: 'physical', hp: 2000 },
  { name: '윤현모 교활한바보',   fullName: '윤현모 교활하고비겁한바보병신', rarity: 'legendary', color: 0x34495e, range: 155, damage: 650, fireRate: 800, speed: 142, skillGauge: 100, emoji: '💼', attackType: 'physical', hp: 1880 },
  { name: '최상호 킹카',         fullName: '최상호 킹카',         rarity: 'legendary', color: 0xff2222, range: 160, damage: 800, fireRate: 650,  speed: 175, skillGauge: 100, emoji: '♠️', attackType: 'physical', hp: 2400 },
];

// ─────────────────────────────────────────
// 제한 (특수 조건 조합)
// ─────────────────────────────────────────
const LIMITED_UNITS: UnitType[] = [
  { name: '이충민',       fullName: '이충민',               rarity: 'epic', color: 0x8e44ad, range: 145, damage: 300, fireRate: 950,  speed: 138, skillGauge: 100, emoji: '🎲', attackType: 'magic',    hp: 1050 },
  { name: '최영민',       fullName: '최영민',               rarity: 'epic', color: 0x3498db, range: 130, damage: 320, fireRate: 820,  speed: 142, skillGauge: 100, emoji: '🛡️', attackType: 'physical', hp: 1100 },
  { name: '김강민',       fullName: '김강민',               rarity: 'epic', color: 0xf1c40f, range: 105, damage: 380, fireRate: 680,  speed: 158, skillGauge: 100, emoji: '⚡', attackType: 'physical', hp: 1200 },
  { name: '이유범',       fullName: '이유범',               rarity: 'epic', color: 0xe67e22, range: 118, damage: 340, fireRate: 720,  speed: 152, skillGauge: 100, emoji: '💢', attackType: 'physical', hp: 1150 },
  { name: '전법규',       fullName: '전법규',               rarity: 'epic', color: 0x7f8c8d, range: 160, damage: 310, fireRate: 1000, speed: 130, skillGauge: 100, emoji: '🌀', attackType: 'magic',    hp: 1000 },
  { name: '김민규',       fullName: '김민규',               rarity: 'epic', color: 0x6c3483, range: 170, damage: 290, fireRate: 1050, speed: 128, skillGauge: 100, emoji: '👁️', attackType: 'magic',    hp: 980  },
  { name: '임준성',       fullName: '임준성',               rarity: 'epic', color: 0x2c3e50, range: 155, damage: 305, fireRate: 880,  speed: 135, skillGauge: 100, emoji: '🎰', attackType: 'magic',    hp: 1020 },
  { name: '강보명',       fullName: '강보명',               rarity: 'epic', color: 0x27ae60, range: 100, damage: 360, fireRate: 600,  speed: 168, skillGauge: 100, emoji: '💥', attackType: 'physical', hp: 1180 },
  { name: '박성호',       fullName: '박성호',               rarity: 'epic', color: 0x9b59b6, range: 140, damage: 330, fireRate: 780,  speed: 148, skillGauge: 100, emoji: '🎭', attackType: 'magic',    hp: 1080 },
];

// ─────────────────────────────────────────
// 초월 (최상위 조합)
// ─────────────────────────────────────────
const TRANSCENDENT_UNITS: UnitType[] = [
  { name: '최상호 킹카될뻔한사나이', fullName: '최상호 킹카가될뻔했던사나이', rarity: 'transcendent', color: 0x00ffff, range: 150, damage: 1200, fireRate: 650,  speed: 178, skillGauge: 100, emoji: '♠️', attackType: 'physical', hp: 5000 },
  { name: '최상호 씹덕대마왕',       fullName: '최상호 씹덕대마왕',           rarity: 'transcendent', color: 0x00e5ff, range: 160, damage: 1100, fireRate: 700,  speed: 172, skillGauge: 100, emoji: '👑', attackType: 'magic',    hp: 4800 },
  { name: '노태현 초구일급절망',     fullName: '노태현 초구일급절망',         rarity: 'transcendent', color: 0x00bcd4, range: 180, damage: 1300, fireRate: 560,  speed: 165, skillGauge: 100, emoji: '😱', attackType: 'magic',    hp: 5200 },
  { name: '양재모 물리간호사',       fullName: '양재모 물리간호사',           rarity: 'transcendent', color: 0x00e676, range: 130, damage: 1400, fireRate: 600,  speed: 158, skillGauge: 100, emoji: '💊', attackType: 'physical', hp: 5500 },
  { name: '강주혁 명석한두뇌',       fullName: '강주혁 명석한두뇌',           rarity: 'transcendent', color: 0x69f0ae, range: 155, damage: 1150, fireRate: 820,  speed: 168, skillGauge: 100, emoji: '🧠', attackType: 'magic',    hp: 4900 },
  { name: '강재규 극악무도악질소악마', fullName: '강재규 극악무도악질소악마', rarity: 'transcendent', color: 0xb9f6ca, range: 140, damage: 1250, fireRate: 730,  speed: 162, skillGauge: 100, emoji: '😈', attackType: 'physical', hp: 5100 },
  { name: '박민석 만년공복',         fullName: '박민석 만년공복',             rarity: 'transcendent', color: 0x00ffb3, range: 148, damage: 1350, fireRate: 750,  speed: 155, skillGauge: 100, emoji: '🍳', attackType: 'physical', hp: 5300 },
  { name: '김민준 외동판다',         fullName: '김민준 외동판다!',            rarity: 'transcendent', color: 0x40c4ff, range: 165, damage: 1080, fireRate: 900,  speed: 148, skillGauge: 100, emoji: '🐼', attackType: 'magic',    hp: 4700 },
  { name: '박민수 카무쿠라이즈루',   fullName: '박민수 카무쿠라이즈루',       rarity: 'transcendent', color: 0x00b0ff, range: 130, damage: 1450, fireRate: 580,  speed: 175, skillGauge: 100, emoji: '🎭', attackType: 'physical', hp: 5600 },
  { name: '이재윤 원숭이왕',         fullName: '이재윤 원숭이왕',             rarity: 'transcendent', color: 0x80d8ff, range: 999, damage: 1180, fireRate: 650,  speed: 162, skillGauge: 100, emoji: '🐵', attackType: 'physical', hp: 5000 },
  { name: '임장혁 훌륭한장애인',     fullName: '임장혁 훌륭한장애인',         rarity: 'transcendent', color: 0x84ffff, range: 145, damage: 1220, fireRate: 700,  speed: 168, skillGauge: 100, emoji: '💢', attackType: 'magic',    hp: 5050 },
  { name: '엄태웅 태웅사마',         fullName: '엄태웅 태웅사마',             rarity: 'transcendent', color: 0xa7ffeb, range: 120, damage: 1500, fireRate: 540,  speed: 180, skillGauge: 100, emoji: '💣', attackType: 'physical', hp: 5800 },
  { name: '조성진 상냥한작은거인',   fullName: '조성진 상냥한마음을가진작은거인', rarity: 'transcendent', color: 0xccff90, range: 135, damage: 1280, fireRate: 620, speed: 158, skillGauge: 100, emoji: '🌱', attackType: 'physical', hp: 5150 },
  { name: '박기찬 섹스킹',           fullName: '박기찬 섹스킹',               rarity: 'transcendent', color: 0xf4ff81, range: 140, damage: 1320, fireRate: 690,  speed: 165, skillGauge: 100, emoji: '😎', attackType: 'physical', hp: 5250 },
  { name: '김만경 집행의심판자',     fullName: '김만경 집행의심판자',         rarity: 'transcendent', color: 0xffe57f, range: 130, damage: 1200, fireRate: 760,  speed: 152, skillGauge: 100, emoji: '⚖️', attackType: 'physical', hp: 5000 },
  { name: '이태훈 골목대장',         fullName: '이태훈 골목대장',             rarity: 'transcendent', color: 0xffd180, range: 145, damage: 1380, fireRate: 640,  speed: 172, skillGauge: 100, emoji: '👿', attackType: 'physical', hp: 5400 },
  { name: '신문철 문철이는못말려',   fullName: '신문철 문철이는못말려',       rarity: 'transcendent', color: 0xff9e80, range: 150, damage: 1160, fireRate: 880,  speed: 148, skillGauge: 100, emoji: '🌀', attackType: 'magic',    hp: 4850 },
  { name: '김건 돌아와줘건아',       fullName: '김건 돌아와줘,건아!',         rarity: 'transcendent', color: 0xea80fc, range: 999, damage: 1420, fireRate: 760,  speed: 162, skillGauge: 100, emoji: '⚡', attackType: 'physical', hp: 5500 },
  { name: '배성령 인간탈쓴암살자',   fullName: '배성령 인간의탈을쓴암살자',  rarity: 'transcendent', color: 0xff80ab, range: 180, damage: 1260, fireRate: 680,  speed: 158, skillGauge: 100, emoji: '🗡️', attackType: 'magic',    hp: 5100 },
  { name: '구주호 힘법사',           fullName: '구주호 힘법사',               rarity: 'transcendent', color: 0xff6e40, range: 125, damage: 1340, fireRate: 720,  speed: 160, skillGauge: 100, emoji: '💪', attackType: 'physical', hp: 5300 },
  { name: '황준석 구일대표홍보대사', fullName: '황준석 구일대표홍보대사',     rarity: 'transcendent', color: 0xffd740, range: 999, damage: 1100, fireRate: 800,  speed: 150, skillGauge: 100, emoji: '🤝', attackType: 'physical', hp: 4900 },
  { name: '김경현 셰프빅헤드',       fullName: '김경현 셰프빅헤드',           rarity: 'transcendent', color: 0x69f0ae, range: 145, damage: 1280, fireRate: 840,  speed: 145, skillGauge: 100, emoji: '👨‍🍳', attackType: 'magic',   hp: 5100 },
  { name: '두유찬 꺽다리',           fullName: '두유찬 꺽다리',               rarity: 'transcendent', color: 0x40c4ff, range: 130, damage: 1200, fireRate: 700,  speed: 155, skillGauge: 100, emoji: '🦴', attackType: 'physical', hp: 5000 },
  { name: '임채민 흔들리지않는신앙', fullName: '임채민 흔들리지않는신앙심',  rarity: 'transcendent', color: 0x84ffff, range: 150, damage: 1150, fireRate: 860,  speed: 148, skillGauge: 100, emoji: '✝️', attackType: 'magic',    hp: 4850 },
  { name: '유재헌 영겁의도망꾼',     fullName: '유재헌 영겁의도망꾼',         rarity: 'transcendent', color: 0xb9f6ca, range: 999, damage: 1180, fireRate: 780,  speed: 165, skillGauge: 100, emoji: '🏃', attackType: 'physical', hp: 4950 },
];

// ─────────────────────────────────────────
// 히든 (특수 조합 히든 유닛)
// ─────────────────────────────────────────
const HIDDEN_UNITS: UnitType[] = [
  // 사람
  { name: '최윤서',   fullName: '최윤서',   rarity: 'hidden', color: 0xff00ff, range: 160, damage: 800,  fireRate: 950,  speed: 140, skillGauge: 100, emoji: '💜', attackType: 'magic',    hp: 3000 },
  { name: '이동엽',   fullName: '이동엽',   rarity: 'hidden', color: 0xcc00cc, range: 999, damage: 720,  fireRate: 700,  speed: 155, skillGauge: 100, emoji: '🌑', attackType: 'physical', hp: 2800 },
  { name: '황정기',   fullName: '황정기 히든', rarity: 'hidden', color: 0xaa00aa, range: 130, damage: 900, fireRate: 800, speed: 148, skillGauge: 100, emoji: '👑', attackType: 'physical', hp: 3200 },
  { name: '전유라',   fullName: '전유라',   rarity: 'hidden', color: 0xdd44dd, range: 145, damage: 750,  fireRate: 1000, speed: 138, skillGauge: 100, emoji: '🌸', attackType: 'magic',    hp: 2900 },
  { name: '전주연',   fullName: '전주연',   rarity: 'hidden', color: 0xff44ff, range: 155, damage: 780,  fireRate: 920,  speed: 135, skillGauge: 100, emoji: '💫', attackType: 'magic',    hp: 2950 },
  { name: '여은서',   fullName: '여은서',   rarity: 'hidden', color: 0xee22ee, range: 110, damage: 820,  fireRate: 850,  speed: 145, skillGauge: 100, emoji: '⚡', attackType: 'physical', hp: 3050 },
  { name: '최경범',   fullName: '최경범',   rarity: 'hidden', color: 0xbb00bb, range: 105, damage: 850,  fireRate: 760,  speed: 158, skillGauge: 100, emoji: '💀', attackType: 'physical', hp: 3100 },
  { name: '석성례',   fullName: '석성례',   rarity: 'hidden', color: 0xcc22cc, range: 130, damage: 830,  fireRate: 820,  speed: 145, skillGauge: 100, emoji: '🔥', attackType: 'physical', hp: 3080 },
  { name: '정기훈',   fullName: '정기훈',   rarity: 'hidden', color: 0xdd00dd, range: 150, damage: 760,  fireRate: 980,  speed: 132, skillGauge: 100, emoji: '✨', attackType: 'magic',    hp: 2880 },
  { name: '서승혁',   fullName: '서승혁',   rarity: 'hidden', color: 0xaa22aa, range: 125, damage: 870,  fireRate: 700,  speed: 162, skillGauge: 100, emoji: '🗡️', attackType: 'physical', hp: 3150 },
  { name: '이요한',   fullName: '이요한',   rarity: 'hidden', color: 0xff22ff, range: 140, damage: 810,  fireRate: 880,  speed: 148, skillGauge: 100, emoji: '🌊', attackType: 'magic',    hp: 3020 },
  { name: '정욱진',   fullName: '정욱진',   rarity: 'hidden', color: 0xee44ee, range: 160, damage: 790,  fireRate: 1020, speed: 128, skillGauge: 100, emoji: '🌀', attackType: 'magic',    hp: 2960 },
  { name: '한나웅',   fullName: '한나웅',   rarity: 'hidden', color: 0xcc44cc, range: 115, damage: 860,  fireRate: 750,  speed: 155, skillGauge: 100, emoji: '💥', attackType: 'physical', hp: 3120 },
  { name: '김영학',   fullName: '김영학',   rarity: 'hidden', color: 0xbb22bb, range: 999, damage: 840,  fireRate: 800,  speed: 150, skillGauge: 100, emoji: '⭐', attackType: 'physical', hp: 3060 },
  // 장소 (음식 캐릭터)
  { name: '호치킨',       fullName: '호치킨',       rarity: 'hidden', color: 0xff66ff, range: 110, damage: 720,  fireRate: 680,  speed: 165, skillGauge: 100, emoji: '🍗', attackType: 'physical', hp: 2750 },
  { name: '이삭토스트',   fullName: '이삭토스트',   rarity: 'hidden', color: 0xee66ee, range: 999, damage: 700,  fireRate: 650,  speed: 160, skillGauge: 100, emoji: '🍞', attackType: 'physical', hp: 2700 },
  { name: '미소야',       fullName: '미소야',       rarity: 'hidden', color: 0xdd66dd, range: 125, damage: 680,  fireRate: 1000, speed: 145, skillGauge: 100, emoji: '🍜', attackType: 'magic',    hp: 2680 },
  { name: '맥주만땅',     fullName: '맥주만땅',     rarity: 'hidden', color: 0xcc66cc, range: 130, damage: 760,  fireRate: 900,  speed: 155, skillGauge: 100, emoji: '🍺', attackType: 'magic',    hp: 2800 },
  { name: '감탄떡볶이',   fullName: '감탄떡볶이',   rarity: 'hidden', color: 0xff44cc, range: 115, damage: 740,  fireRate: 750,  speed: 158, skillGauge: 100, emoji: '🌶️', attackType: 'physical', hp: 2780 },
];


// ─────────────────────────────────────────
// 전체 유닛 목록 (뽑기풀 = COMMON만)
// ─────────────────────────────────────────
export const UNIT_TYPES: UnitType[] = [
  ...COMMON_UNITS,
  ...UNCOMMON_UNITS,
  ...RARE_UNITS,
  ...EXPANSION_UNITS,
  ...EPIC_UNITS,
  ...IMMORTAL_UNITS,
  ...LIMITED_UNITS,
  ...LEGENDARY_UNITS,
  ...ETERNAL_UNITS,
  ...RANDOM_UNITS,
  ...TRANSCENDENT_UNITS,
  ...HIDDEN_UNITS,
];

// 뽑기풀 (흔함만)
export const ROLL_POOL: UnitType[] = COMMON_UNITS;

// 등급별 필터 헬퍼
export const getUnitsByRarity = (rarity: Rarity): UnitType[] =>
  UNIT_TYPES.filter(u => u.rarity === rarity);