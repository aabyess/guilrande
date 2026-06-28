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

  rollUnit: () => void;
  rollSpecial: () => void;
  placeUnit: (type: UnitType, x: number, z: number) => void;
  moveUnit: (id: string, x: number, z: number) => void;
  moveSelectedUnits: (targetX: number, targetZ: number) => void;
  gatherSameType: () => void;
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

// ── 라운드별 적 이름 ──────────────────────────────────────────
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
    const { rollCount, placeUnit } = get();
    if (rollCount <= 0) return;
    const type = ROLL_POOL[Math.floor(Math.random() * ROLL_POOL.length)];
    placeUnit(type, -30, -30);
    set(s => ({ rollCount: s.rollCount - 1 }));
  },

  rollSpecial: () => {
    const { specialRollCount, placeUnit } = get();
    if (specialRollCount <= 0) return;
    // 특별함 = rarity 'rare'
    const pool = UNIT_TYPES.filter(t => t.rarity === 'rare');
    if (pool.length === 0) return;
    const type = pool[Math.floor(Math.random() * pool.length)];
    placeUnit(type, -30, -30);
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
    const { selectedUnitIds, units } = get();
    const selected = units.filter(u => selectedUnitIds.includes(u.id));
    set(s => ({
      units: s.units.map(u => {
        const idx = selected.findIndex(t => t.id === u.id);
        if (idx === -1) return u;
        const cols = Math.ceil(Math.sqrt(selected.length));
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const ox = (col - Math.floor(cols / 2)) * 0.4;
        const oz = (row - Math.floor(selected.length / cols / 2)) * 0.4;
        return { ...u, targetX: targetX + ox, targetZ: targetZ + oz };
      })
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
    const { units, removeUnit, placeUnit } = get();
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
    const spawnX = toRemove[0].x;
    const spawnZ = toRemove[0].z;
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