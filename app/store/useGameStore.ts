import { create } from 'zustand';
import { UnitType, ROLL_POOL, UNIT_TYPES } from '../game/units/UnitTypes';
import { COMBINATIONS } from '../game/combinations/Combinations';

export interface UnitInstance {
  id: string;
  type: UnitType;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  skillGauge: number;
  lastFired: number;
  targetX?: number;
  targetZ?: number;
  attackTargetId?: string;
  holding?: boolean;        // H키 홀딩 상태
}

export interface EnemyInstance {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  t: number;
  speed: number;
  armor: number;
  magicResist: number;
  isBoss: boolean;
  zoneIndex: number;      // 어느 존의 경로를 따라가는지 (0~3)
}

export interface StoryBuilding {
  id: string;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  radius: number;
  defeated: boolean;
}

export interface StoryZoneState {
  active: boolean;
  buildings: StoryBuilding[];
  bossSpawned: boolean;
  currentStage: number;
  clearedStages: number[];
}

// ─────────────────────────────────────────────
// 📌 시야(줌) 프리셋 — 카메라 Y 높이값
// 수정 포인트: 실제 게임에서 보이는 시야가 너무 좁거나 넓으면
// 아래 숫자를 조절하세요. 숫자가 클수록 더 멀리서 봄(줌아웃).
// GameCanvas camera 초기값이 position: [0, 45, 30] 이므로 그 기준으로 잡음.
// ─────────────────────────────────────────────
// 시야 프리셋 — Y값만 지정, Z는 GameCanvas에서 Y:Z 비율 유지하며 자동 계산
// 초기 카메라: position[0, 45, 30] → Y:Z = 45:30 = 3:2 비율 고정
// 📌 수정 포인트: 줌 범위 맘에 안 들면 여기 숫자만 수정하면 됨
export const VISION_PRESETS = {
  100: 30,
  150: 35,
  200: 40,
} as const;
export type VisionLevel = keyof typeof VISION_PRESETS;

export interface OtherPlayerUnit {
  id: string;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  rarity: string;
  color: number;
  name: string;
}

export interface OtherPlayerData {
  playerId: string;
  zoneIndex: number;
  units: OtherPlayerUnit[];
}

interface GameState {
  phase: 'prepare' | 'battle';
  round: number;
  roundTime: number;
  prepareTime: number;
  rollCount: number;
  specialRollCount: number;
  gameOver: boolean;

  units: UnitInstance[];
  enemies: EnemyInstance[];
  selectedUnitIds: string[];
  storyZone: StoryZoneState;

  // 다른 플레이어 유닛 (렌더링 전용, 조종 불가)
  otherPlayersUnits: OtherPlayerData[];
  updateOtherPlayerUnits: (data: OtherPlayerData) => void;

  // ─────────────────────────────────────────────
  // 📌 추가된 카메라 시야 상태
  // ─────────────────────────────────────────────
  visionLevel: VisionLevel;
  targetCameraY: number;
  zoneIndex: number;
  setZoneIndex: (index: number) => void;
  setCameraVision: (level: VisionLevel) => void;
  setTargetCameraY: (y: number) => void;

  // 현재 공격 중인 유닛 ID 목록 (애니메이션 전환용)
  attackingUnitIds: Set<string>;
  setAttackingUnitIds: (ids: Set<string>) => void;

  rollUnit: () => void;
  rollSpecial: () => void;
  placeUnit: (type: UnitType, x: number, z: number) => void;
  moveUnit: (id: string, x: number, z: number) => void;
  moveSelectedUnits: (targetX: number, targetZ: number) => void;
  gatherSameType: () => void;
  stopSelectedUnits: () => void;
  holdSelectedUnits: () => void;  // H키: 그 자리 홀딩 토글
  setAttackTarget: (targetId: string | undefined) => void;
  selectUnits: (ids: string[]) => void;
  clearSelection: () => void;
  removeUnit: (id: string) => void;

  spawnEnemy: (round: number) => void;
  spawnBoss: (round: number) => void;
  damageEnemy: (id: string, dmg: number) => void;
  removeEnemy: (id: string) => void;
  updateEnemyT: (id: string, t: number) => void;

  updateUnitHp: (id: string, hp: number) => void;
  updateUnitSkill: (id: string, gauge: number) => void;
  updateUnitLastFired: (id: string, time: number) => void;

  setPhase: (phase: 'prepare' | 'battle') => void;
  setRound: (round: number) => void;
  setRoundTime: (t: number) => void;
  setPrepareTime: (t: number) => void;
  setRollCount: (n: number) => void;
  setGameOver: (v: boolean) => void;

  executeCombination: (materials: string[]) => void;

  enterStoryZone: () => void;
  exitStoryZone: () => void;
  damageBuilding: (id: string, dmg: number) => void;
  setBossSpawned: (v: boolean) => void;
  advanceStoryStage: () => void;
  setStoryStage: (stage: number) => void;
}

const ROUND_ENEMY_NAMES: Record<number, string> = {
  1:'박진웅', 2:'김갑식', 3:'반항아이승우', 4:'배병욱', 5:'왕승환',
  6:'이재윤', 7:'인홍진', 8:'문필환', 9:'김민준(안경)',
  11:'주영호', 12:'김정래', 13:'박예원', 14:'조도연', 15:'이상혁',
  16:'유재헌', 17:'이하림', 18:'문채홍', 19:'박기찬',
  21:'박은석', 22:'박도진', 23:'이호준', 24:'구주호', 25:'최준우',
  26:'이정범', 27:'임채준', 28:'신림초패거리', 29:'송형성',
  31:'김만경', 32:'장명자', 33:'어철승', 34:'이수은', 35:'장하민',
  36:'서승혁', 37:'최혜륜', 38:'조성진', 39:'선효진',
  41:'고어진', 42:'김용태', 43:'엄태웅', 44:'유시은', 45:'양문호',
  46:'강민호', 47:'이현빈', 48:'노수신', 49:'정다희',
  51:'진연서', 52:'이현주', 53:'이태훈', 54:'최수지', 55:'임준성',
  56:'이진수', 57:'지성현', 58:'박병규', 59:'박찬형',
  60:'서한빈',
};

const BOSS_NAMES: Record<number, string> = {
  10: '레벨 보스 — 초등학교 저학년 (박민수)',
  20: '레벨 보스 — 초등학교 고학년 (박은석)',
  30: '레벨 보스 — 중학교 저학년 (박민수)',
  40: '레벨 보스 — 중학교 고학년 (김용태)',
  50: '레벨 보스 — 고등학교 저학년 (이태훈)',
  60: '레벨 보스 — 고등학교 고학년 (정윤식)',
};

let eid = 0;
let uid = 0;

// 플레이어 존 중심 좌표 (zoneIndex 0~3)
const ZONE_CENTERS: [number, number][] = [
  [-30, -30], // P1 좌상단
  [ 30, -30], // P2 우상단
  [-30,  30], // P3 좌하단
  [ 30,  30], // P4 우하단
];

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'prepare',
  round: 1,
  roundTime: 60,
  prepareTime: 10,
  rollCount: 5,
  specialRollCount: 1,
  gameOver: false,
  units: [],
  enemies: [],
  selectedUnitIds: [],

  // ─────────────────────────────────────────────
  // 📌 카메라 초기 시야: 150 (Y=45, Canvas camera 기본값과 맞춤)
  // ─────────────────────────────────────────────
  visionLevel: 150,
  targetCameraY: 35,
  zoneIndex: 0,
  attackingUnitIds: new Set<string>(),
  otherPlayersUnits: [],

  setCameraVision: (level: VisionLevel) => {
    set({ visionLevel: level, targetCameraY: VISION_PRESETS[level] });
  },

  setTargetCameraY: (y: number) => set({ targetCameraY: y }),
  setZoneIndex: (index: number) => set({ zoneIndex: index }),
  setAttackingUnitIds: (ids: Set<string>) => set({ attackingUnitIds: ids }),

  updateOtherPlayerUnits: (data: OtherPlayerData) => {
    set(s => {
      const filtered = s.otherPlayersUnits.filter(p => p.playerId !== data.playerId);
      return { otherPlayersUnits: [...filtered, data] };
    });
  },

  storyZone: {
    active: false,
    bossSpawned: false,
    currentStage: 1,
    clearedStages: [],
    buildings: [
      { id: 'stage_1', x: 0, z: 140, hp: 800, maxHp: 800, radius: 12, defeated: false },
    ],
  },

  rollUnit: () => {
    const { rollCount, placeUnit, zoneIndex } = get();
    if (rollCount <= 0) return;
    const type = ROLL_POOL[Math.floor(Math.random() * ROLL_POOL.length)];
    const [zx, zz] = ZONE_CENTERS[zoneIndex] ?? [-30, -30];
    placeUnit(type, zx, zz);
    set(s => ({ rollCount: s.rollCount - 1 }));
  },

  rollSpecial: () => {
    const { specialRollCount, placeUnit, zoneIndex } = get();
    if (specialRollCount <= 0) return;
    const pool = UNIT_TYPES.filter(t => t.rarity === 'rare');
    if (pool.length === 0) return;
    const type = pool[Math.floor(Math.random() * pool.length)];
    const [zx, zz] = ZONE_CENTERS[zoneIndex] ?? [-30, -30];
    placeUnit(type, zx, zz);
    set({ specialRollCount: 0 });
  },

  placeUnit: (type, x, z) => {
    const unit: UnitInstance = {
      id: `u${uid++}`,
      type, x, z,
      hp: type.hp, maxHp: type.hp,
      skillGauge: 0,
      lastFired: 0,
    };
    set(s => ({ units: [...s.units, unit] }));
  },

  moveUnit: (id, x, z) => {
    set(s => ({ units: s.units.map(u => u.id === id ? { ...u, x, z } : u) }));
  },

  moveSelectedUnits: (targetX, targetZ) => {
    const { selectedUnitIds, units, zoneIndex } = get();
    const selected = units.filter(u => selectedUnitIds.includes(u.id));

    // 내 존 경계로 목표 좌표 클램프
    const ZONE_C: [number, number][] = [[-30,-30],[30,-30],[-30,30],[30,30]];
    const HALF = 20.5;
    const [zcx, zcz] = ZONE_C[zoneIndex] ?? [-30, -30];
    const clampedX = Math.max(zcx - HALF, Math.min(zcx + HALF, targetX));
    const clampedZ = Math.max(zcz - HALF, Math.min(zcz + HALF, targetZ));

    set(s => ({
      units: s.units.map(u => {
        const idx = selected.findIndex(t => t.id === u.id);
        if (idx === -1) return u;
        const cols = Math.ceil(Math.sqrt(selected.length));
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const ox = (col - Math.floor(cols / 2)) * 0.4;
        const oz = (row - Math.floor(selected.length / cols / 2)) * 0.4;
        return { ...u, targetX: clampedX + ox, targetZ: clampedZ + oz, holding: false };
      })
    }));
  },

  stopSelectedUnits: () => {
    const { selectedUnitIds } = get();
    set(s => ({
      units: s.units.map(u =>
        selectedUnitIds.includes(u.id)
          ? { ...u, targetX: undefined, targetZ: undefined, attackTargetId: undefined }
          : u
      ),
    }));
  },

  holdSelectedUnits: () => {
    const { selectedUnitIds } = get();
    set(s => ({
      units: s.units.map(u => {
        if (!selectedUnitIds.includes(u.id)) return u;
        const nextHolding = !u.holding;
        return {
          ...u,
          holding: nextHolding,
          // 홀딩 시 이동 명령 취소
          targetX: nextHolding ? undefined : u.targetX,
          targetZ: nextHolding ? undefined : u.targetZ,
          attackTargetId: nextHolding ? undefined : u.attackTargetId,
        };
      }),
    }));
  },

  setAttackTarget: (targetId) => {
    const { selectedUnitIds } = get();
    set(s => ({
      units: s.units.map(u =>
        selectedUnitIds.includes(u.id)
          ? { ...u, attackTargetId: targetId }
          : u
      ),
    }));
  },

  gatherSameType: () => {
    const { selectedUnitIds, units } = get();
    if (selectedUnitIds.length === 0) return;
    const anchor = units.find(u => u.id === selectedUnitIds[0]);
    if (!anchor) return;
    const sameType = units.filter(u => u.type.name === anchor.type.name);
    const cols = Math.ceil(Math.sqrt(sameType.length));
    set(s => ({
      units: s.units.map(u => {
        const idx = sameType.findIndex(t => t.id === u.id);
        if (idx === -1) return u;
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const ox = (col - Math.floor(cols / 2)) * 0.4;
        const oz = (row - Math.floor(sameType.length / cols / 2)) * 0.4;
        return { ...u, targetX: anchor.x + ox, targetZ: anchor.z + oz };
      }),
      selectedUnitIds: sameType.slice(0, 12).map(u => u.id),
    }));
  },

  selectUnits: (ids) => set({ selectedUnitIds: ids }),
  clearSelection: () => set({ selectedUnitIds: [] }),
  removeUnit: (id) => set(s => ({ units: s.units.filter(u => u.id !== id) })),

  spawnEnemy: (round) => {
    const name = ROUND_ENEMY_NAMES[round] ?? `적 ${round}라운드`;
    const enemy: EnemyInstance = {
      id: `e${eid++}`,
      name,
      hp: 160 + round * 60,
      maxHp: 160 + round * 60,
      t: 0,
      speed: 0.0008,
      armor: 5 + round * 2,
      magicResist: 3 + round * 2,
      isBoss: false,
      zoneIndex: 0,
    };
    set(s => ({ enemies: [...s.enemies, enemy] }));
  },

  spawnBoss: (round) => {
    const name = BOSS_NAMES[round] ?? `레벨 보스 ${round}라운드`;
    const enemy: EnemyInstance = {
      id: `e${eid++}`,
      name,
      hp: 1000 + round * 200,
      maxHp: 1000 + round * 200,
      t: 0,
      speed: 0.0005,
      armor: 20 + round * 5,
      magicResist: 15 + round * 5,
      isBoss: true,
      zoneIndex: 0,
    };
    set(s => ({ enemies: [...s.enemies, enemy] }));
  },

  damageEnemy: (id, dmg) => {
    set(s => ({ enemies: s.enemies.map(e => e.id === id ? { ...e, hp: e.hp - dmg } : e) }));
  },
  removeEnemy: (id) => set(s => ({ enemies: s.enemies.filter(e => e.id !== id) })),
  updateEnemyT: (id, t) => {
    set(s => ({ enemies: s.enemies.map(e => e.id === id ? { ...e, t } : e) }));
  },
  updateUnitHp: (id, hp) => {
    set(s => ({ units: s.units.map(u => u.id === id ? { ...u, hp } : u) }));
  },
  updateUnitSkill: (id, gauge) => {
    set(s => ({ units: s.units.map(u => u.id === id ? { ...u, skillGauge: gauge } : u) }));
  },
  updateUnitLastFired: (id, time) => {
    set(s => ({ units: s.units.map(u => u.id === id ? { ...u, lastFired: time } : u) }));
  },

  setPhase: (phase) => set({ phase }),
  setRound: (round) => set({ round }),
  setRoundTime: (roundTime) => set({ roundTime }),
  setPrepareTime: (prepareTime) => set({ prepareTime }),
  setRollCount: (rollCount) => set({ rollCount }),
  setGameOver: (gameOver) => set({ gameOver }),

  executeCombination: (materials) => {
    const { units, removeUnit, placeUnit, selectedUnitIds } = get();
    const needed = [...materials];
    const toRemove: UnitInstance[] = [];
    for (const unit of units) {
      const idx = needed.indexOf(unit.type.name);
      if (idx !== -1) { needed.splice(idx, 1); toRemove.push(unit); }
    }
    if (needed.length > 0) return;
    const combo = COMBINATIONS.find(c =>
      JSON.stringify([...c.materials].sort()) === JSON.stringify([...materials].sort())
    );
    if (!combo) return;
    const resultType = UNIT_TYPES.find(t => t.name === combo.result);
    if (!resultType) return;

    // 선택된 유닛 위치 우선 → 없으면 첫 번째 재료 위치
    const selectedUnit = toRemove.find(u => selectedUnitIds.includes(u.id));
    const spawnX = (selectedUnit ?? toRemove[0]).x;
    const spawnZ = (selectedUnit ?? toRemove[0]).z;

    toRemove.forEach(u => removeUnit(u.id));
    placeUnit(resultType, spawnX, spawnZ);
  },

  enterStoryZone: () => set(s => ({ storyZone: { ...s.storyZone, active: true } })),
  exitStoryZone: () => set(s => ({ storyZone: { ...s.storyZone, active: false } })),

  damageBuilding: (id, dmg) => {
    set(s => ({
      storyZone: {
        ...s.storyZone,
        buildings: s.storyZone.buildings.map(b => {
          if (b.id !== id) return b;
          const newHp = Math.max(0, b.hp - dmg);
          return { ...b, hp: newHp, defeated: newHp <= 0 };
        }),
      },
    }));
  },

  setBossSpawned: (v) => set(s => ({ storyZone: { ...s.storyZone, bossSpawned: v } })),

  advanceStoryStage: () => {
    const { storyZone } = get();
    const nextStage = Math.min(storyZone.currentStage + 1, 10);
    const clearedStages = [...storyZone.clearedStages, storyZone.currentStage];
    const hp = getStageHp(nextStage);
    set(s => ({
      storyZone: {
        ...s.storyZone,
        currentStage: nextStage,
        clearedStages,
        bossSpawned: false,
        buildings: [{ id: `stage_${nextStage}`, x: 0, z: 140, hp, maxHp: hp, radius: 12 + nextStage, defeated: false }],
      },
    }));
  },

  setStoryStage: (stage) => {
    const hp = getStageHp(stage);
    set(s => ({
      storyZone: {
        ...s.storyZone,
        currentStage: stage,
        bossSpawned: false,
        buildings: [{ id: `stage_${stage}`, x: 0, z: 140, hp, maxHp: hp, radius: 12 + stage, defeated: false }],
      },
    }));
  },
}));

function getStageHp(stage: number): number {
  const hpTable: Record<number, number> = {
    1: 800, 2: 1200, 3: 1800,
    4: 2500, 5: 3500, 6: 5000,
    7: 7000, 8: 10000, 9: 15000,
    10: 25000,
  };
  return hpTable[stage] ?? 1000;
}