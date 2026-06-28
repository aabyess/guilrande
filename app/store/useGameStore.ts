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
    const enemy: EnemyInstance = {
      id: `e${eid++}`,
      hp: 160 + round * 60,
      maxHp: 80 + round * 30,
      t: 0,
      speed: 0.0008,
      armor: 5 + round * 2,
      magicResist: 3 + round * 2,
      isBoss: false,
    };
    set(s => ({ enemies: [...s.enemies, enemy] }));
  },

  spawnBoss: (round) => {
    const enemy: EnemyInstance = {
      id: `e${eid++}`,
      hp: 1000 + round * 100,
      maxHp: 1000 + round * 100,
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