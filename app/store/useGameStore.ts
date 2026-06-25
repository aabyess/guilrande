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
  t: number;          // 경로상 위치 0~1
  speed: number;
  armor: number;
  magicResist: number;
  isBoss: boolean;
}

interface GameState {
  // 게임 페이즈
  phase: 'prepare' | 'battle';
  round: number;
  roundTime: number;
  prepareTime: number;
  rollCount: number;
  gameOver: boolean;

  // 유닛/적
  units: UnitInstance[];
  enemies: EnemyInstance[];

  // 선택
  selectedUnitIds: string[];

  // 액션
  rollUnit: () => void;
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
}

let eid = 0;
let uid = 0;

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'prepare',
  round: 1,
  roundTime: 60,
  prepareTime: 10,
  rollCount: 5,
  gameOver: false,
  units: [],
  enemies: [],
  selectedUnitIds: [],

  rollUnit: () => {
    const { rollCount, placeUnit } = get();
    if (rollCount <= 0) return;
    const type = ROLL_POOL[Math.floor(Math.random() * ROLL_POOL.length)];
    // 플레이어1 구역 (2사분면) 정중앙
    placeUnit(type, -30, -30);
    set(s => ({ rollCount: s.rollCount - 1 }));
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
    set(s => ({
      units: s.units.map(u => u.id === id ? { ...u, x, z } : u)
    }));
  },

  moveSelectedUnits: (targetX, targetZ) => {
    const { selectedUnitIds, units } = get();
    const selected = units.filter(u => selectedUnitIds.includes(u.id));
    set(s => ({
      units: s.units.map(u => {
        const idx = selected.findIndex(t => t.id === u.id);
        if (idx === -1) return u;
        // 약간씩만 퍼지게 (0.4 간격 — 유닛 크기 0.7보다 작아서 겹침)
        const cols = Math.ceil(Math.sqrt(selected.length));
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const ox = (col - Math.floor(cols / 2)) * 0.4;
        const oz = (row - Math.floor(selected.length / cols / 2)) * 0.4;
        return { ...u, targetX: targetX + ox, targetZ: targetZ + oz };
      })
    }));
  },

  // V키: 같은 타입 유닛 집결
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

  removeUnit: (id) => {
    set(s => ({ units: s.units.filter(u => u.id !== id) }));
  },

  spawnEnemy: (round) => {
    const enemy: EnemyInstance = {
      id: `e${eid++}`,
      hp: 80 + round * 30,
      maxHp: 80 + round * 30,
      t: 0,
      speed: 0.00025,
      armor: 5 + round * 2,
      magicResist: 3 + round * 2,
      isBoss: false,
    };
    set(s => ({ enemies: [...s.enemies, enemy] }));
  },

  spawnBoss: (round) => {
    const enemy: EnemyInstance = {
      id: `e${eid++}`,
      hp: 500 + round * 100,
      maxHp: 500 + round * 100,
      t: 0,
      speed: 0.00012,
      armor: 20 + round * 5,
      magicResist: 15 + round * 5,
      isBoss: true,
    };
    set(s => ({ enemies: [...s.enemies, enemy] }));
  },

  damageEnemy: (id, dmg) => {
    set(s => ({
      enemies: s.enemies.map(e => e.id === id ? { ...e, hp: e.hp - dmg } : e)
    }));
  },

  removeEnemy: (id) => {
    set(s => ({ enemies: s.enemies.filter(e => e.id !== id) }));
  },

  updateEnemyT: (id, t) => {
    set(s => ({
      enemies: s.enemies.map(e => e.id === id ? { ...e, t } : e)
    }));
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
      if (idx !== -1) {
        needed.splice(idx, 1);
        toRemove.push(unit);
      }
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
}));