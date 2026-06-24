'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { getPathPosition } from '../../game/path/EnemyPath';
import * as THREE from 'three';

const ENEMIES_PER_ROUND = 40;
const ROUND_DURATION = 60;
const MAX_ENEMIES = 100;
const BOSS_ROUND = 5; // 5라운드마다 보스

function calcDamage(damage: number, attackType: string, armor: number, magicResist: number) {
  if (attackType === 'physical') return Math.max(1, damage - armor);
  return Math.max(1, damage - magicResist);
}

export function useGameLoop() {
  const store = useGameStore();
  const spawnCountRef = useRef(0);
  const lastSpawnRef = useRef(0);
  const roundTickRef = useRef(0);
  const lastTickRef = useRef(0);
  const prepareTickRef = useRef(0);
  const lastPrepareRef = useRef(0);
  const prepareTimeRef = useRef(10);
  const countdownRef = useRef(0);
  const isCountingRef = useRef(false);

  // 라운드 리셋
  const startRound = () => {
    spawnCountRef.current = 0;
    lastSpawnRef.current = 0;
    roundTickRef.current = 0;
    lastTickRef.current = 0;
    store.setRoundTime(ROUND_DURATION);
  };

  useEffect(() => {
    startRound();
  }, [store.round]);

  useFrame((_, delta) => {
    const {
      phase, round, gameOver, enemies, units,
      setPhase, setRound, setRollCount, rollCount,
      spawnEnemy, spawnBoss, removeEnemy, updateEnemyT,
      damageEnemy, updateUnitLastFired, updateUnitSkill,
      roundTime, setRoundTime, setGameOver, setPrepareTime, prepareTime,
    } = useGameStore.getState();

    if (gameOver) return;

    const now = performance.now();

    // ── 준비 페이즈 카운트다운 ──────────────────────────
    if (phase === 'prepare') {
      if (now - lastPrepareRef.current >= 1000) {
        lastPrepareRef.current = now;
        const next = prepareTimeRef.current - 1;
        prepareTimeRef.current = next;
        setPrepareTime(next);
        if (next <= 0) {
          prepareTimeRef.current = 10;
          setPrepareTime(10);
          setPhase('battle');
          startRound();
        }
      }
      return;
    }

    // ── 배틀 페이즈 ────────────────────────────────────

    // 라운드 타이머
    if (now - lastTickRef.current >= 1000) {
      lastTickRef.current = now;
      roundTickRef.current++;
      const remaining = ROUND_DURATION - roundTickRef.current;
      setRoundTime(remaining);

      if (remaining <= 0) {
        // 라운드 종료
        setRollCount(rollCount + 2);
        setRound(round + 1);
        roundTickRef.current = 0;
      }
    }

    // 적 스폰
    const spawnInterval = (ROUND_DURATION * 1000) / ENEMIES_PER_ROUND;
    if (
      spawnCountRef.current < ENEMIES_PER_ROUND &&
      now - lastSpawnRef.current >= spawnInterval
    ) {
      lastSpawnRef.current = now;
      spawnCountRef.current++;
      spawnEnemy(round);

      // 보스 (5라운드마다)
      if (round % BOSS_ROUND === 0 && spawnCountRef.current === 1) {
        spawnBoss(round);
      }
    }

    // 적 이동
    const currentEnemies = useGameStore.getState().enemies;
    for (const enemy of currentEnemies) {
      const newT = (enemy.t + enemy.speed) % 1;
      updateEnemyT(enemy.id, newT);
    }

    // 게임오버 체크
    if (currentEnemies.length >= MAX_ENEMIES) {
      if (!isCountingRef.current) {
        isCountingRef.current = true;
        countdownRef.current = 10;
      }
      countdownRef.current -= delta;
      if (countdownRef.current <= 0) {
        setGameOver(true);
        return;
      }
    } else {
      isCountingRef.current = false;
    }

    // 유닛 부드러운 이동 (lerp)
    const movingUnits = useGameStore.getState().units;
    const MOVE_SPEED = 0.08;
    for (const unit of movingUnits) {
      if (unit.targetX === undefined || unit.targetZ === undefined) continue;
      const dx = unit.targetX - unit.x;
      const dz = unit.targetZ - unit.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < 0.05) {
        useGameStore.setState(s => ({
          units: s.units.map(u => u.id === unit.id
            ? { ...u, x: unit.targetX!, z: unit.targetZ!, targetX: undefined, targetZ: undefined }
            : u)
        }));
      } else {
        const nx = unit.x + dx * MOVE_SPEED;
        const nz = unit.z + dz * MOVE_SPEED;
        useGameStore.setState(s => ({
          units: s.units.map(u => u.id === unit.id ? { ...u, x: nx, z: nz } : u)
        }));
      }
    }

    // 유닛 공격
    const currentUnits = useGameStore.getState().units;
    const currentEnemiesForAttack = useGameStore.getState().enemies;

    for (const unit of currentUnits) {
      if (now - unit.lastFired < unit.type.fireRate) continue;

      for (const enemy of currentEnemiesForAttack) {
        const ePos = getPathPosition(enemy.t);
        const dist = Math.sqrt(
          (unit.x - ePos.x) ** 2 + (unit.z - ePos.z) ** 2
        );

        if (dist < unit.type.range / 10) {
          const dmg = calcDamage(unit.type.damage, unit.type.attackType, enemy.armor, enemy.magicResist);
          damageEnemy(enemy.id, dmg);
          updateUnitLastFired(unit.id, now);

          const newGauge = Math.min(100, unit.skillGauge + 10);
          updateUnitSkill(unit.id, newGauge);

          // 스킬 발동
          if (newGauge >= 100) {
            updateUnitSkill(unit.id, 0);
            // 범위 내 적 데미지
            for (const e of useGameStore.getState().enemies) {
              const ep = getPathPosition(e.t);
              const sd = Math.sqrt((unit.x - ep.x) ** 2 + (unit.z - ep.z) ** 2);
              if (sd < unit.type.range / 6) {
                damageEnemy(e.id, unit.type.damage * 3);
              }
            }
          }
          break;
        }
      }
    }

    // 죽은 적 제거
    for (const enemy of useGameStore.getState().enemies) {
      if (enemy.hp <= 0) removeEnemy(enemy.id);
    }
  });

}