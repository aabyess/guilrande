'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { getPathPosition } from '../../game/path/EnemyPath';

const ENEMIES_PER_ROUND = 40;
const ROUND_DURATION = 40;
const SPAWN_WINDOW = 30; // 스폰은 처음 30초 안에만
const MAX_ENEMIES = 100;
const BOSS_ROUNDS = new Set([10, 20, 30, 40, 50, 60]);

function calcDamage(damage: number, attackType: string, armor: number, magicResist: number) {
  if (attackType === 'physical') return Math.max(1, damage - armor);
  return Math.max(1, damage - magicResist);
}

export function useGameLoop() {
  const spawnCountRef  = useRef(0);
  const lastSpawnRef   = useRef(0);
  const roundTickRef   = useRef(0);
  const lastTickRef    = useRef(0);
  const prepareTimeRef = useRef(10);
  const lastPrepareRef = useRef(0);
  const countdownRef   = useRef(0);
  const isCountingRef  = useRef(false);

  const startRound = () => {
    spawnCountRef.current = 0;
    lastSpawnRef.current  = 0;
    roundTickRef.current  = 0;
    lastTickRef.current   = 0;
    useGameStore.getState().setRoundTime(ROUND_DURATION);
  };

  useEffect(() => {
    const unsub = useGameStore.subscribe(
      (s, prev) => { if (s.round !== prev.round) startRound(); }
    );
    return unsub;
  }, []);

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (s.gameOver) return;

    const now = performance.now();

    // ── 준비 페이즈 ───────────────────────────────────
    if (s.phase === 'prepare') {
      if (now - lastPrepareRef.current >= 1000) {
        lastPrepareRef.current = now;
        const next = prepareTimeRef.current - 1;
        prepareTimeRef.current = next;
        s.setPrepareTime(next);
        if (next <= 0) {
          prepareTimeRef.current = 10;
          s.setPrepareTime(10);
          s.setPhase('battle');
          startRound();
        }
      }
      return;
    }

    // ── 라운드 타이머 ─────────────────────────────────
    if (now - lastTickRef.current >= 1000) {
      lastTickRef.current = now;
      roundTickRef.current++;
      const remaining = ROUND_DURATION - roundTickRef.current;
      s.setRoundTime(remaining);
      if (remaining <= 0) {
        s.setRollCount(s.rollCount + 2);
        s.setRound(s.round + 1);
        roundTickRef.current = 0;
      }
    }

    // ── 적 스폰 ───────────────────────────────────────
    const isBossRound = BOSS_ROUNDS.has(s.round);
    const spawnInterval = (SPAWN_WINDOW * 1000) / ENEMIES_PER_ROUND; // 30초 안에 40마리
    const roundElapsed = roundTickRef.current;

    if (isBossRound) {
      // 보스 라운드: 라운드 시작 직후 보스 1마리만 스폰
      if (spawnCountRef.current === 0) {
        spawnCountRef.current = 1;
        lastSpawnRef.current = now;
        s.spawnBoss(s.round);
      }
    } else {
      // 일반 라운드: 30초 안에 40마리
      if (spawnCountRef.current < ENEMIES_PER_ROUND && roundElapsed < SPAWN_WINDOW && now - lastSpawnRef.current >= spawnInterval) {
        lastSpawnRef.current = now;
        spawnCountRef.current++;
        s.spawnEnemy(s.round);
      }
    }

    // ── 적 이동 — 배치 setState (핵심 최적화) ─────────
    // 개별 updateEnemyT 대신 enemies 배열 전체를 한 번에 교체
    useGameStore.setState(cur => ({
      enemies: cur.enemies.map(e => ({ ...e, t: (e.t + e.speed) % 1 })),
    }));

    // ── 게임오버 체크 ─────────────────────────────────
    const enemies = useGameStore.getState().enemies;
    if (enemies.length >= MAX_ENEMIES) {
      if (!isCountingRef.current) { isCountingRef.current = true; countdownRef.current = 10; }
      countdownRef.current -= delta;
      if (countdownRef.current <= 0) { s.setGameOver(true); return; }
    } else {
      isCountingRef.current = false;
    }

    // ── 유닛 이동 (lerp) — 배치 setState ─────────────
    const MOVE_SPEED = 0.08;
    const units = useGameStore.getState().units;
    const currentEnemiesForMove = useGameStore.getState().enemies;

    const hasMoving = units.some(u => u.targetX !== undefined || u.attackTargetId !== undefined);
    if (hasMoving) {
      useGameStore.setState(cur => ({
        units: cur.units.map(u => {
          // A키 공격 타겟 추적 이동
          if (u.attackTargetId !== undefined) {
            const targetEnemy = currentEnemiesForMove.find(e => e.id === u.attackTargetId);
            if (!targetEnemy) {
              // 타겟 사라짐 → 타겟 해제
              return { ...u, attackTargetId: undefined };
            }
            const ePos = getPathPosition(targetEnemy.t);
            const dx = ePos.x - u.x;
            const dz = ePos.z - u.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            // 사거리 안에 들어오면 이동 멈추고 공격
            if (dist < u.type.range / 10) {
              return { ...u, targetX: undefined, targetZ: undefined };
            }
            // 사거리 밖이면 타겟 방향으로 이동
            const nx = u.x + (dx / dist) * MOVE_SPEED;
            const nz = u.z + (dz / dist) * MOVE_SPEED;
            return { ...u, x: nx, z: nz, targetX: undefined, targetZ: undefined };
          }

          // 일반 이동
          if (u.targetX === undefined || u.targetZ === undefined) return u;
          const dx = u.targetX - u.x;
          const dz = u.targetZ - u.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < 0.05) return { ...u, x: u.targetX, z: u.targetZ, targetX: undefined, targetZ: undefined };
          return { ...u, x: u.x + dx * MOVE_SPEED, z: u.z + dz * MOVE_SPEED };
        }),
      }));
    }

    // ── 유닛 공격 ─────────────────────────────────────
    // 데미지/스킬 변경사항을 모아서 한 번에 적용
    const currentUnits   = useGameStore.getState().units;
    const currentEnemies = useGameStore.getState().enemies;

    // 적 HP 델타 맵
    const enemyDmgMap = new Map<string, number>();
    // 유닛 변경 맵
    const unitUpdates = new Map<string, { lastFired: number; skillGauge: number }>();

    for (const unit of currentUnits) {
      if (now - unit.lastFired < unit.type.fireRate) continue;

      for (const enemy of currentEnemies) {
        const ePos = getPathPosition(enemy.t);
        const dist = Math.sqrt((unit.x - ePos.x) ** 2 + (unit.z - ePos.z) ** 2);

        if (dist < unit.type.range / 10) {
          const dmg = calcDamage(unit.type.damage, unit.type.attackType, enemy.armor, enemy.magicResist);
          enemyDmgMap.set(enemy.id, (enemyDmgMap.get(enemy.id) ?? 0) + dmg);

          const newGauge = Math.min(100, unit.skillGauge + 10);
          unitUpdates.set(unit.id, { lastFired: now, skillGauge: newGauge });

          // 스킬 발동
          if (newGauge >= 100) {
            unitUpdates.set(unit.id, { lastFired: now, skillGauge: 0 });
            for (const e of currentEnemies) {
              const ep = getPathPosition(e.t);
              const sd = Math.sqrt((unit.x - ep.x) ** 2 + (unit.z - ep.z) ** 2);
              if (sd < unit.type.range / 6) {
                enemyDmgMap.set(e.id, (enemyDmgMap.get(e.id) ?? 0) + unit.type.damage * 3);
              }
            }
          }
          break;
        }
      }
    }

    // 적 HP 배치 업데이트 + 죽은 적 제거 — 1번 setState
    if (enemyDmgMap.size > 0) {
      useGameStore.setState(cur => ({
        enemies: cur.enemies
          .map(e => enemyDmgMap.has(e.id) ? { ...e, hp: e.hp - enemyDmgMap.get(e.id)! } : e)
          .filter(e => e.hp > 0),
      }));
    } else {
      // 데미지 없어도 hp<=0 제거
      useGameStore.setState(cur => ({
        enemies: cur.enemies.filter(e => e.hp > 0),
      }));
    }

    // 유닛 상태 배치 업데이트 — 1번 setState
    if (unitUpdates.size > 0) {
      useGameStore.setState(cur => ({
        units: cur.units.map(u => {
          const upd = unitUpdates.get(u.id);
          return upd ? { ...u, ...upd } : u;
        }),
      }));
    }

    // 공격 중인 유닛 ID → store에 반영 (UnitMesh 애니메이션 전환용)
    // unitUpdates에 들어간 유닛 = 이번 프레임에 실제로 공격한 유닛
    useGameStore.getState().setAttackingUnitIds(new Set(unitUpdates.keys()));
  });
}