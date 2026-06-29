'use client';

import { useRef, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, StoryBuilding } from '../../store/useGameStore';

const PORTAL_RADIUS = 4;

// ── 각 플레이어 섬 포탈 위치 (우상단 코너) ──────────────────
const ENTRY_PORTALS: { pos: [number,number,number]; playerId: number }[] = [
  { pos: [-8, 0, -52], playerId: 1 },
  { pos: [52, 0, -52], playerId: 2 },
  { pos: [-8, 0,   8], playerId: 3 },
  { pos: [52, 0,   8], playerId: 4 },
];

// ── 스토리존 → 플레이어 맵 귀환 포탈 위치 ──────────────────
const RETURN_PORTALS: { pos: [number,number,number]; arrive: [number,number] }[] = [
  { pos: [-18, 0, 128], arrive: [-30, -30] },  // → P1 중앙
  { pos: [ -6, 0, 128], arrive: [ 30, -30] },  // → P2 중앙
  { pos: [  6, 0, 128], arrive: [-30,  30] },  // → P3 중앙
  { pos: [ 18, 0, 128], arrive: [ 30,  30] },  // → P4 중앙
];

// 스토리존 도착 위치 — 동서남북 (P1북, P2동, P3남, P4서)
const STORY_ARRIVE_BY_ZONE: { x: number; z: number }[] = [
  { x:  0, z: 128 }, // P1 북쪽
  { x: 18, z: 140 }, // P2 동쪽
  { x:  0, z: 152 }, // P3 남쪽
  { x:-18, z: 140 }, // P4 서쪽
];

// ── 단계별 건물 스타일 ───────────────────────────────────────
interface StageStyle {
  name: string;
  wallColor: string;
  roofColor: string;
  emissive: string;
  label: string;
}

const STAGE_STYLES: Record<number, StageStyle> = {
  1:  { name: '한양영어유치원',   wallColor: '#ffcc88', roofColor: '#ff9944', emissive: '#ffaa00', label: '🐣' },
  2:  { name: '구일초등학교',     wallColor: '#88cc88', roofColor: '#44aa44', emissive: '#00cc44', label: '🎒' },
  3:  { name: '구일중학교',       wallColor: '#8888cc', roofColor: '#4444aa', emissive: '#4444ff', label: '📚' },
  4:  { name: '구일고등학교',     wallColor: '#cc8888', roofColor: '#aa4444', emissive: '#ff4444', label: '📖' },
  5:  { name: '메가스터디',       wallColor: '#cc44cc', roofColor: '#882288', emissive: '#ff00ff', label: '💀' },
  6:  { name: '7탄약창',          wallColor: '#556655', roofColor: '#334433', emissive: '#88ff44', label: '💣' },
  7:  { name: '동양미래대학교',   wallColor: '#336699', roofColor: '#223355', emissive: '#3388ff', label: '🎓' },
  8:  { name: '동양미래대학교+',  wallColor: '#224477', roofColor: '#112233', emissive: '#2266dd', label: '🎓' },
  9:  { name: '동양미래대학교++', wallColor: '#112255', roofColor: '#081122', emissive: '#1144bb', label: '🎓' },
  10: { name: '취업 성공',        wallColor: '#ccaa00', roofColor: '#aa8800', emissive: '#ffdd00', label: '💰' },
};

// ── 입장 포탈 (플레이어 섬 → 스토리존) ─────────────────────
function EntryPortal({ pos, playerId }: { pos: [number,number,number]; playerId: number }) {
  const portalRef = useRef<THREE.Mesh>(null);
  const ringRef   = useRef<THREE.Mesh>(null);
  const { units, storyZone } = useGameStore();
  const teleportedRef = useRef<Set<string>>(new Set());

  useFrame((_state: RootState, delta: number): void => {
    if (portalRef.current) portalRef.current.rotation.y += delta * 1.2;
    if (ringRef.current)   ringRef.current.rotation.z  += delta * 2.0;

    const myZoneIndex = useGameStore.getState().zoneIndex;
    const arrive = STORY_ARRIVE_BY_ZONE[myZoneIndex] ?? STORY_ARRIVE_BY_ZONE[0];

    units.forEach(unit => {
      const dx = unit.x - pos[0], dz = unit.z - pos[2];
      if (Math.sqrt(dx*dx + dz*dz) < PORTAL_RADIUS) {
        if (!teleportedRef.current.has(unit.id)) {
          teleportedRef.current.add(unit.id);
          useGameStore.setState(s => ({
            units: s.units.map(u => u.id === unit.id
              ? { ...u, x: arrive.x, z: arrive.z, targetX: undefined, targetZ: undefined }
              : u
            )
          }));
        }
      } else {
        teleportedRef.current.delete(unit.id);
      }
    });
  });

  const cleared = storyZone.clearedStages.length;
  const portalColor = '#8800ff';

  return (
    <group position={pos}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.05,0]}>
        <ringGeometry args={[1.8, 2.6, 32]} />
        <meshBasicMaterial color={portalColor} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.06,0]}>
        <circleGeometry args={[1.8,32]} />
        <meshBasicMaterial color="#aa44ff" transparent opacity={0.35} />
      </mesh>
      <mesh ref={portalRef} position={[0,1.5,0]}>
        <torusGeometry args={[1.0,0.15,8,32]} />
        <meshStandardMaterial color="#cc66ff" emissive="#8800ff" emissiveIntensity={1.5} />
      </mesh>
      <mesh ref={ringRef} position={[0,1.5,0]} rotation={[Math.PI/3,0,0]}>
        <torusGeometry args={[1.2,0.08,6,32]} />
        <meshStandardMaterial color="#ff88ff" emissive="#cc00ff" emissiveIntensity={1.2} />
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.03,0]}>
        <ringGeometry args={[PORTAL_RADIUS-0.2, PORTAL_RADIUS, 48]} />
        <meshBasicMaterial color="#aa44ff" transparent opacity={0.1} />
      </mesh>
      <pointLight position={[0,1.5,0]} color="#aa44ff" intensity={6} distance={10} decay={2} />
      <Html position={[0,3.2,0]} center distanceFactor={12}>
        <div style={{
          backgroundColor: 'rgba(60,0,110,0.9)',
          border: '1px solid #aa55ff',
          color: '#ddb8ff', fontSize: '11px', fontWeight: 'bold',
          padding: '3px 8px', borderRadius: '6px',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          ⚔ P{playerId} 스토리존 {cleared > 0 ? `(${cleared}클리어)` : ''}
        </div>
      </Html>
    </group>
  );
}

// ── 귀환 포탈 (스토리존 → 플레이어 맵) ─────────────────────
function ReturnPortal({ pos, arrive, label }: {
  pos: [number,number,number];
  arrive: [number,number];
  label: string;
}) {
  const portalRef = useRef<THREE.Mesh>(null);
  const { units } = useGameStore();
  const teleportedRef = useRef<Set<string>>(new Set());

  useFrame((_state: RootState, delta: number): void => {
    if (portalRef.current) portalRef.current.rotation.y += delta * 0.8;

    units.forEach(unit => {
      const dx = unit.x - pos[0], dz = unit.z - pos[2];
      if (Math.sqrt(dx*dx + dz*dz) < PORTAL_RADIUS - 1) {
        if (!teleportedRef.current.has(unit.id)) {
          teleportedRef.current.add(unit.id);
          useGameStore.setState(s => ({
            units: s.units.map(u => u.id === unit.id
              ? { ...u, x: arrive[0], z: arrive[1], targetX: undefined, targetZ: undefined }
              : u
            )
          }));
        }
      } else {
        teleportedRef.current.delete(unit.id);
      }
    });
  });

  return (
    <group position={pos}>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.05,0]}>
        <ringGeometry args={[1.2, 1.8, 32]} />
        <meshBasicMaterial color="#00ccff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={portalRef} position={[0,1.0,0]}>
        <torusGeometry args={[0.7,0.1,8,32]} />
        <meshStandardMaterial color="#44ddff" emissive="#0088cc" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0,1.0,0]} color="#00aaff" intensity={4} distance={8} decay={2} />
      <Html position={[0,2.4,0]} center distanceFactor={12}>
        <div style={{
          backgroundColor: 'rgba(0,60,110,0.9)',
          border: '1px solid #44aaff',
          color: '#aaddff', fontSize: '10px', fontWeight: 'bold',
          padding: '2px 6px', borderRadius: '5px',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          🔙 {label}로 귀환
        </div>
      </Html>
    </group>
  );
}

// ── 스토리 건물 ──────────────────────────────────────────────
const ATTACK_COOLDOWN = 1000;

function StoryBuilding_({ building }: { building: StoryBuilding }) {
  const { damageBuilding, units, advanceStoryStage, storyZone } = useGameStore();
  const lastAttackRef = useRef<Record<string,number>>({});
  const glowRef = useRef<THREE.PointLight>(null);
  const stage = storyZone.currentStage;
  const style = STAGE_STYLES[stage] ?? STAGE_STYLES[1];

  useFrame((_state: RootState): void => {
    if (building.defeated) return;
    const now = Date.now();
    units.forEach(unit => {
      const dx = unit.x - building.x, dz = unit.z - building.z;
      if (Math.sqrt(dx*dx + dz*dz) > building.radius) return;
      const last = lastAttackRef.current[unit.id] ?? 0;
      if (now - last < ATTACK_COOLDOWN) return;
      lastAttackRef.current[unit.id] = now;
      damageBuilding(building.id, unit.type.damage);
    });
  });

  // 건물 파괴 시 즉시 다음 단계
  useEffect(() => {
    if (building.defeated) {
      const { storyZone, advanceStoryStage } = useGameStore.getState();
      if (storyZone.currentStage < 10) {
        setTimeout(() => advanceStoryStage(), 1500); // 1.5초 후 다음 단계
      }
    }
  }, [building.defeated]);

  useFrame((_state: RootState): void => {
    if (!glowRef.current) return;
    const ratio = building.hp / building.maxHp;
    glowRef.current.intensity = building.defeated ? 0 : 2 + (1-ratio) * 8;
    glowRef.current.color.setStyle(building.defeated ? '#000' : style.emissive);
  });

  const hpRatio = building.hp / building.maxHp;
  const pillars: [number,number,number][] = [[-3,0,-3],[3,0,-3],[-3,0,3],[3,0,3]];

  return (
    <group position={[building.x, 0, building.z]}>
      {/* 기단 */}
      <mesh position={[0,0.3,0]} receiveShadow castShadow>
        <boxGeometry args={[10,0.6,10]} />
        <meshStandardMaterial color="#6a5a3a" roughness={0.9} />
      </mesh>
      <mesh position={[0,0.7,0]} receiveShadow castShadow>
        <boxGeometry args={[8,0.8,8]} />
        <meshStandardMaterial color="#7a6a4a" roughness={0.85} />
      </mesh>
      {/* 기둥 */}
      {pillars.map((p,i) => (
        <mesh key={i} position={[p[0],2.5,p[2]]} castShadow>
          <cylinderGeometry args={[0.4,0.5,4,8]} />
          <meshStandardMaterial color={building.defeated ? '#3a2a1a' : style.wallColor} roughness={0.7} />
        </mesh>
      ))}
      {/* 지붕 */}
      {!building.defeated && (
        <mesh position={[0,5.5,0]} castShadow>
          <coneGeometry args={[5.5,2.5,stage <= 3 ? 4 : stage <= 6 ? 6 : 8]} />
          <meshStandardMaterial color={style.roofColor} roughness={0.8} />
        </mesh>
      )}
      {/* 파괴 잔해 */}
      {building.defeated && (
        ([ [-2,0.3,1],[1,0.2,-2],[2,0.4,2],[-1,0.3,-1] ] as [number,number,number][]).map((p,i) => (
          <mesh key={i} position={p} castShadow>
            <boxGeometry args={[1.5+i*0.3,0.5,1.2+i*0.2]} />
            <meshStandardMaterial color="#4a3a2a" roughness={1} />
          </mesh>
        ))
      )}
      {/* 제단 */}
      <mesh position={[0,1.8,0]} castShadow>
        <boxGeometry args={[2,1.2,2]} />
        <meshStandardMaterial
          color={building.defeated ? '#2a1a0a' : style.wallColor}
          emissive={building.defeated ? '#000' : style.emissive}
          emissiveIntensity={building.defeated ? 0 : 0.4}
          roughness={0.6}
        />
      </mesh>
      <pointLight ref={glowRef} position={[0,4,0]} color={style.emissive} intensity={3} distance={18} decay={2} />

      {/* 단계 표시 */}
      {!building.defeated && (
        <Html position={[0,9,0]} center distanceFactor={18}>
          <div style={{ width:'130px', pointerEvents:'none' }}>
            <div style={{ color:'#ffcc44', fontSize:'13px', fontWeight:'bold', textAlign:'center', marginBottom:'4px', textShadow:`0 0 8px ${style.emissive}` }}>
              {style.label} {style.name}
            </div>
            <div style={{ color:'#aaa', fontSize:'10px', textAlign:'center', marginBottom:'3px' }}>
              단계 {stage} / 10
            </div>
            <div style={{ width:'100%', height:'10px', backgroundColor:'#111', border:`1px solid ${style.emissive}55`, borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ width:`${hpRatio*100}%`, height:'100%', backgroundColor: hpRatio > 0.5 ? style.emissive : '#ff2200', transition:'width 0.1s' }} />
            </div>
            <div style={{ color:'#888', fontSize:'9px', textAlign:'center', marginTop:'2px' }}>
              {building.hp.toLocaleString()} / {building.maxHp.toLocaleString()}
            </div>
          </div>
        </Html>
      )}
      {building.defeated && (
        <Html position={[0,6,0]} center distanceFactor={18}>
          <div style={{ color:'#ffaa00', fontSize:'16px', fontWeight:'bold', textShadow:'0 0 10px #ff8800', textAlign:'center' }}>
            ✅ 클리어!<br/>
            <span style={{ fontSize:'11px', color:'#ffdd88' }}>다음 단계 준비 중...</span>
          </div>
        </Html>
      )}
      {/* 사거리 표시 */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.08,0]}>
        <ringGeometry args={[building.radius-0.1, building.radius, 64]} />
        <meshBasicMaterial color={style.emissive} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// ── 루트 ─────────────────────────────────────────────────────
export function StoryZoneObjects() {
  const { storyZone } = useGameStore();

  return (
    <>
      {/* 입장 포탈 (각 플레이어 섬 → 스토리존) */}
      {ENTRY_PORTALS.map((p, i) => (
        <EntryPortal key={i} pos={p.pos} playerId={p.playerId} />
      ))}

      {/* 귀환 포탈 (스토리존 → 각 플레이어 맵) */}
      {RETURN_PORTALS.map((p, i) => (
        <ReturnPortal key={i} pos={p.pos} arrive={p.arrive} label={`P${i+1}`} />
      ))}

      {/* 스토리 건물 */}
      {storyZone.buildings.map(b => (
        <StoryBuilding_ key={b.id} building={b} />
      ))}
    </>
  );
}