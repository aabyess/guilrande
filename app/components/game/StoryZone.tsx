'use client';

import { useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, StoryBuilding } from '../../store/useGameStore';

// 포탈 위치 — 2사분면 하단 (3사분면 경계 근처)
const PORTAL_POS: [number, number, number] = [-30, 0, -10];
// 신전 월드 위치 (useGameStore와 동일)
const TEMPLE_ARRIVE: { x: number; z: number } = { x: -30, z: 34 };
// 포탈 감지 반경
const PORTAL_RADIUS = 4;

// ── 포탈 ────────────────────────────────────────────────────
export function StoryPortal() {
  const portalRef  = useRef<THREE.Mesh>(null);
  const ringRef    = useRef<THREE.Mesh>(null);
  const { units, moveUnit } = useGameStore();
  const teleportedRef = useRef<Set<string>>(new Set());

  // 매 프레임: 포탈 회전 + 유닛 순간이동 감지
  useFrame((_state: RootState, delta: number): void => {
    if (portalRef.current) portalRef.current.rotation.y += delta * 1.2;
    if (ringRef.current)   ringRef.current.rotation.z  += delta * 2.0;

    // 포탈 반경 내 유닛 감지 → 스토리존으로 순간이동
    units.forEach(unit => {
      const dx   = unit.x - PORTAL_POS[0];
      const dz   = unit.z - PORTAL_POS[2];
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < PORTAL_RADIUS) {
        if (!teleportedRef.current.has(unit.id)) {
          teleportedRef.current.add(unit.id);
          moveUnit(unit.id, TEMPLE_ARRIVE.x, TEMPLE_ARRIVE.z);
        }
      } else {
        // 포탈에서 멀어지면 재사용 가능하게 리셋
        teleportedRef.current.delete(unit.id);
      }
    });
  });

  return (
    <group position={PORTAL_POS}>
      {/* 바닥 링 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.8, 2.6, 32]} />
        <meshBasicMaterial color="#8800ff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* 내부 원 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[1.8, 32]} />
        <meshBasicMaterial color="#aa44ff" transparent opacity={0.4} />
      </mesh>
      {/* 메인 링 (회전) */}
      <mesh ref={portalRef} position={[0, 1.5, 0]}>
        <torusGeometry args={[1.0, 0.15, 8, 32]} />
        <meshStandardMaterial color="#cc66ff" emissive="#8800ff" emissiveIntensity={1.5} />
      </mesh>
      {/* 보조 링 */}
      <mesh ref={ringRef} position={[0, 1.5, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.2, 0.08, 6, 32]} />
        <meshStandardMaterial color="#ff88ff" emissive="#cc00ff" emissiveIntensity={1.2} />
      </mesh>
      {/* 감지 반경 표시 (바닥) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[PORTAL_RADIUS - 0.2, PORTAL_RADIUS, 48]} />
        <meshBasicMaterial color="#aa44ff" transparent opacity={0.15} />
      </mesh>

      <pointLight position={[0, 1.5, 0]} color="#aa44ff" intensity={6} distance={10} decay={2} />

      <Html position={[0, 3.4, 0]} center distanceFactor={12}>
        <div style={{
          backgroundColor: 'rgba(80,0,140,0.88)',
          border: '1px solid #cc66ff',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '4px 10px',
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
          ⚔ 스토리존 — 가까이 가면 이동
        </div>
      </Html>
    </group>
  );
}

// ── 고대 신전 ────────────────────────────────────────────────
const ATTACK_COOLDOWN = 1000;

function Temple({ building }: { building: StoryBuilding }) {
  const { damageBuilding, spawnBoss, storyZone, setBossSpawned, units } = useGameStore();
  const lastAttackRef = useRef<Record<string, number>>({});
  const glowRef       = useRef<THREE.PointLight>(null);

  useFrame((_state: RootState): void => {
    if (building.defeated) return;
    const now = Date.now();
    units.forEach(unit => {
      const dx   = unit.x - building.x;
      const dz   = unit.z - building.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > building.radius) return;
      const last = lastAttackRef.current[unit.id] ?? 0;
      if (now - last < ATTACK_COOLDOWN) return;
      lastAttackRef.current[unit.id] = now;
      damageBuilding(building.id, unit.type.damage);
    });
  });

  useEffect(() => {
    if (building.defeated && !storyZone.bossSpawned) {
      setBossSpawned(true);
      spawnBoss(1);
    }
  }, [building.defeated, storyZone.bossSpawned, setBossSpawned, spawnBoss]);

  useFrame((_state: RootState): void => {
    if (!glowRef.current) return;
    const ratio = building.hp / building.maxHp;
    glowRef.current.intensity = building.defeated ? 0 : 2 + (1 - ratio) * 6;
    glowRef.current.color.setStyle(ratio > 0.5 ? '#ff8800' : '#ff2200');
  });

  const hpRatio = building.hp / building.maxHp;
  const pillars: [number, number, number][] = [[-3,0,-3],[3,0,-3],[-3,0,3],[3,0,3]];

  return (
    <group position={[building.x, 0, building.z]}>
      <mesh position={[0, 0.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[10, 0.6, 10]} />
        <meshStandardMaterial color="#6a5a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 0]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.8, 8]} />
        <meshStandardMaterial color="#7a6a4a" roughness={0.85} />
      </mesh>
      {pillars.map((p, i) => (
        <mesh key={i} position={[p[0], 2.5, p[2]]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 4, 8]} />
          <meshStandardMaterial color={building.defeated ? '#3a2a1a' : '#c8a060'} roughness={0.7} />
        </mesh>
      ))}
      {!building.defeated && (
        <mesh position={[0, 5.5, 0]} castShadow>
          <coneGeometry args={[5.5, 2.5, 4]} />
          <meshStandardMaterial color="#8a6a30" roughness={0.8} />
        </mesh>
      )}
      {building.defeated && (
        ([ [-2,0.3,1],[1,0.2,-2],[2,0.4,2],[-1,0.3,-1] ] as [number,number,number][]).map((p, i) => (
          <mesh key={i} position={p} castShadow>
            <boxGeometry args={[1.5 + i * 0.3, 0.5, 1.2 + i * 0.2]} />
            <meshStandardMaterial color="#4a3a2a" roughness={1} />
          </mesh>
        ))
      )}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[2, 1.2, 2]} />
        <meshStandardMaterial
          color={building.defeated ? '#2a1a0a' : '#aa8840'}
          emissive={building.defeated ? '#000' : '#553300'}
          emissiveIntensity={building.defeated ? 0 : 0.5}
          roughness={0.6}
        />
      </mesh>
      <pointLight ref={glowRef} position={[0, 3, 0]} color="#ff8800" intensity={2} distance={15} decay={2} />

      {!building.defeated && (
        <Html position={[0, 8, 0]} center distanceFactor={18}>
          <div style={{ width: '110px', pointerEvents: 'none' }}>
            <div style={{ color: '#ffcc44', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginBottom: '3px', textShadow: '0 0 6px #ff8800' }}>
              🏛 고대 신전
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#111', border: '1px solid #664400', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${hpRatio * 100}%`, height: '100%', backgroundColor: hpRatio > 0.5 ? '#ff8800' : '#ff2200', transition: 'width 0.1s' }} />
            </div>
            <div style={{ color: '#aaa', fontSize: '10px', textAlign: 'center', marginTop: '2px' }}>
              {building.hp} / {building.maxHp}
            </div>
          </div>
        </Html>
      )}
      {building.defeated && (
        <Html position={[0, 5, 0]} center distanceFactor={18}>
          <div style={{ color: '#ff4444', fontSize: '14px', fontWeight: 'bold', textShadow: '0 0 8px #ff0000' }}>
            💀 신전 파괴됨
          </div>
        </Html>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[building.radius - 0.1, building.radius, 64]} />
        <meshBasicMaterial color={building.defeated ? '#330000' : '#ff6600'} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

// ── 루트 ─────────────────────────────────────────────────────
export function StoryZoneObjects() {
  const { storyZone } = useGameStore();
  return (
    <>
      <StoryPortal />
      {storyZone.buildings.map(b => (
        <Temple key={b.id} building={b} />
      ))}
    </>
  );
}