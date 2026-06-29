'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore, OtherPlayerData } from '../../store/useGameStore';
import { getPathPosition } from '../../game/path/EnemyPath';
import { getSocket } from '../../lib/socket';

const MOVE_SPEED = 0.055;

// 존 경계 클램프 — 내 맵 밖으로 이동 불가
const ZONE_CENTERS_MAP: [number, number][] = [
  [-30, -30], [30, -30], [-30, 30], [30, 30],
];
const ZONE_HALF = 20.5; // 벽 안쪽 경계 (Zone size=44 → half=22, 벽 두께 감안)

function clampToZone(x: number, z: number, zi: number): [number, number] {
  const [cx, cz] = ZONE_CENTERS_MAP[zi] ?? [-30, -30];
  return [
    Math.max(cx - ZONE_HALF, Math.min(cx + ZONE_HALF, x)),
    Math.max(cz - ZONE_HALF, Math.min(cz + ZONE_HALF, z)),
  ];
}

function calcDamage(damage: number, attackType: string, armor: number, magicResist: number) {
  if (attackType === 'physical') return Math.max(1, damage - armor);
  return Math.max(1, damage - magicResist);
}

export function useGameLoop() {
  // ── 서버 이벤트 수신 ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();

    socket.on('game_tick', ({
      enemies, phase, round, roundTime, prepareTime,
    }: {
      enemies: any[];
      phase: 'prepare' | 'battle';
      round: number;
      roundTime: number;
      prepareTime: number;
    }) => {
      const prevRound = useGameStore.getState().round;

      useGameStore.setState({ enemies, phase, round, roundTime, prepareTime });

      // 라운드 넘어갈 때마다 소환권 2회 지급
      if (round > prevRound) {
        useGameStore.setState(cur => ({ rollCount: cur.rollCount + 2 }));
      }
    });

    // 서버가 게임오버 판정 → 해당 플레이어에게만 전송
    socket.on('zone_game_over', () => {
      useGameStore.getState().setGameOver(true);
    });

    socket.on('enemy_died', ({ enemyId }: { enemyId: string }) => {
      useGameStore.setState(cur => ({
        enemies: cur.enemies.filter(e => e.id !== enemyId),
      }));
    });

    // 다른 플레이어 유닛 위치 수신
    socket.on('other_player_units', (data: OtherPlayerData) => {
      useGameStore.getState().updateOtherPlayerUnits(data);
    });

    // 다른 존 게임오버 → 해당 존 에너미 제거 (이미 서버에서 제거하지만 즉시 반영)
    socket.on('zone_eliminated', ({ zoneIndex }: { zoneIndex: number }) => {
      useGameStore.setState(cur => ({
        enemies: cur.enemies.filter(e => e.zoneIndex !== zoneIndex),
        otherPlayersUnits: cur.otherPlayersUnits.filter(p => p.zoneIndex !== zoneIndex),
      }));
    });

    return () => {
      socket.off('game_tick');
      socket.off('enemy_died');
      socket.off('other_player_units');
      socket.off('zone_eliminated');
      socket.off('zone_game_over');
    };
  }, []);

  // ── 내 유닛 위치 주기적 브로드캐스트 (500ms마다) ───────────────────────────
  useEffect(() => {
    const socket = getSocket();
    const interval = setInterval(() => {
      const units = useGameStore.getState().units;
      if (units.length === 0) return;
      socket.emit('unit_positions', {
        units: units.map(u => ({
          id:     u.id,
          x:      u.x,
          z:      u.z,
          hp:     u.hp,
          maxHp:  u.maxHp,
          rarity: u.type.rarity,
          color:  u.type.color,
          name:   u.type.name,
        })),
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // ── 프레임 루프 ─────────────────────────────────────────────────────────────
  useFrame(() => {
    const s = useGameStore.getState();
    if (s.gameOver || s.phase !== 'battle') return;

    const now = performance.now();
    const myZoneIndex = s.zoneIndex;

    // ── 유닛 이동 ─────────────────────────────────────────────
    const units   = s.units;
    const enemies = s.enemies;

    const hasMoving = units.some(u => u.targetX !== undefined || u.attackTargetId !== undefined);
    if (hasMoving) {
      useGameStore.setState(cur => ({
        units: cur.units.map(u => {
          // 홀딩 중 → 이동 명령 무시, 공격은 계속
          if (u.holding) return u;

          if (u.attackTargetId !== undefined) {
            const targetEnemy = enemies.find(e => e.id === u.attackTargetId && (e.zoneIndex ?? 0) === myZoneIndex);
            if (!targetEnemy) return { ...u, attackTargetId: undefined };
            const ePos = getPathPosition(targetEnemy.t, targetEnemy.zoneIndex ?? 0);
            const dx = ePos.x - u.x;
            const dz = ePos.z - u.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < u.type.range / 10) return { ...u, targetX: undefined, targetZ: undefined };
            const rawX = u.x + (dx / dist) * MOVE_SPEED;
            const rawZ = u.z + (dz / dist) * MOVE_SPEED;
            const [cx, cz] = clampToZone(rawX, rawZ, myZoneIndex);
            return { ...u, x: cx, z: cz, targetX: undefined, targetZ: undefined };
          }
          if (u.targetX === undefined || u.targetZ === undefined) return u;
          const dx = u.targetX - u.x;
          const dz = u.targetZ - u.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 0.05) return { ...u, x: u.targetX, z: u.targetZ, targetX: undefined, targetZ: undefined };
          const rawX = u.x + dx * MOVE_SPEED;
          const rawZ = u.z + dz * MOVE_SPEED;
          const [cx2, cz2] = clampToZone(rawX, rawZ, myZoneIndex);
          return { ...u, x: cx2, z: cz2 };
        }),
      }));
    }

    // ── 유닛 공격 → 내 존 에너미만 대상 ───────────────────
    const currentUnits     = useGameStore.getState().units;
    const currentEnemies   = useGameStore.getState().enemies;
    const attackableEnemies = currentEnemies.filter(e => (e.zoneIndex ?? 0) === myZoneIndex);
    const socket = getSocket();

    const unitUpdates = new Map<string, { lastFired: number; skillGauge: number }>();

    for (const unit of currentUnits) {
      if (now - unit.lastFired < unit.type.fireRate) continue;

      for (const enemy of attackableEnemies) {
        const ePos = getPathPosition(enemy.t, enemy.zoneIndex ?? 0);
        const dist = Math.sqrt((unit.x - ePos.x) ** 2 + (unit.z - ePos.z) ** 2);

        if (dist < unit.type.range / 10) {
          const dmg = calcDamage(unit.type.damage, unit.type.attackType, enemy.armor, enemy.magicResist);
          socket.emit('enemy_hit', { enemyId: enemy.id, damage: dmg });

          const newGauge = Math.min(100, unit.skillGauge + 10);
          unitUpdates.set(unit.id, { lastFired: now, skillGauge: newGauge });

          if (newGauge >= 100) {
            unitUpdates.set(unit.id, { lastFired: now, skillGauge: 0 });
            for (const e of attackableEnemies) {
              const ep = getPathPosition(e.t, e.zoneIndex ?? 0);
              const sd = Math.sqrt((unit.x - ep.x) ** 2 + (unit.z - ep.z) ** 2);
              if (sd < unit.type.range / 6) {
                socket.emit('enemy_hit', { enemyId: e.id, damage: unit.type.damage * 3 });
              }
            }
          }
          break;
        }
      }
    }

    if (unitUpdates.size > 0) {
      useGameStore.setState(cur => ({
        units: cur.units.map(u => {
          const upd = unitUpdates.get(u.id);
          return upd ? { ...u, ...upd } : u;
        }),
      }));
    }

    useGameStore.getState().setAttackingUnitIds(new Set(unitUpdates.keys()));
  });
}