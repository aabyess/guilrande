'use client';

import { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGameStore, UnitInstance } from '../../store/useGameStore';
import type { OtherPlayerUnit } from '../../store/useGameStore';
import { getPathPosition } from '../../game/path/EnemyPath';
import { UNIT_TYPES } from '../../game/units/UnitTypes';

const RARITY_EMISSIVE: Record<string, string> = {
  common: '#000000', uncommon: '#004a46', rare: '#3a0070',
  epic: '#5a3000', legendary: '#5a0000',
};
const RARITY_EMISSIVE_INTENSITY: Record<string, number> = {
  common: 0, uncommon: 0.3, rare: 0.5, epic: 0.6, legendary: 0.8,
};

const SCALE = 1.6;

const BASE_URL = 'https://pub-23e93def3f974eee929ae729aee77d73.r2.dev';

const UNIT_MODEL_MAP: Record<string, string> = {
  '김수빈': `${BASE_URL}/subin.glb`,
  '최상호': `${BASE_URL}/onePieces/onepiece_fake_luffy.glb`,
  '노태현': `${BASE_URL}/onePieces/onepiece_akainu.glb`,
  '양재모': `${BASE_URL}/onePieces/onepiece_jabra_cp0.glb`,
  '박민석': `${BASE_URL}/onePieces/onepiece_sanji.glb`,
  '강주혁': `${BASE_URL}/onePieces/onepiece_whitebeard.glb`,
  '강재규': `${BASE_URL}/onePieces/onepiece_chopper.glb`,
  '문필환': `${BASE_URL}/jojos/yoshikage_jojo.glb`,
  '박민수': `${BASE_URL}/bleachs/Ikkaku_bleach.glb`,
  '임장혁': `${BASE_URL}/onePieces/onepiece_magellan.glb`,
};

const UNIT_MODEL_ROTATION: Record<string, [number, number, number]> = {
  '김수빈': [0, 0, 0],
  '최상호': [0, Math.PI, 0],
  '노태현': [0, Math.PI, 0],
  '양재모': [0, Math.PI, 0],
  '박민석': [0, Math.PI, 0],
  '강주혁': [0, Math.PI, 0],
  '강재규': [0, Math.PI, 0],
  '문필환': [0, Math.PI, 0],
  '박민수': [0, Math.PI, 0],
  '임장혁': [0, Math.PI, 0],
};

// 📌 유닛별 개별 스케일 (기본값 SCALE=1.6 대신 적용)
const UNIT_MODEL_SCALE: Record<string, number> = {
  '강주혁': 0.01,
  '임장혁': 0.8,
};

// 유닛별 자체 애니 이름 (idle / attack)
// 없으면 default.glb fallback 사용
const UNIT_ANIM_MAP: Record<string, { idle: string; attack: string }> = {
  '최상호': { idle: 'pl_demaroblack_orig01_idle_a', attack: 'pl_demaroblack_orig01_combo_a' },
  '노태현': { idle: 'pl_akainu_gens01_idle_a',      attack: 'pl_akainu_gens01_combo_a'     },
  '양재모': { idle: 'pl_jabra_jinj01_idle_a',       attack: 'pl_jabra_jinj01_combo_a'      },
  // 박민석(sanji)은 mixamo 애니 1개 → default fallback 사용
};

// 자체 애니가 있는 유닛
const NATIVE_ANIM_UNITS = new Set<string>(Object.keys(UNIT_ANIM_MAP));

// 📌 수정 포인트: 반대면 두 줄만 swap
const ANIM_ATTACK = 'mixamo.com';      // index 0
const ANIM_IDLE   = 'mixamo.com.001';  // index 1

// 📌 애니메이션 완전히 끄고 싶은 유닛 이름 추가
const NO_ANIMATION_UNITS = new Set<string>([
  '김수빈',
  '강주혁',
]);

// ── 모델별 scene 캐시 (clone 비용 절감) ──────────────────────
const sceneCache = new Map<string, THREE.Group>();

// GLB 로딩 중 표시할 fallback — 반투명 박스
function UnitModelFallback({ rarity }: { rarity: string }) {
  const color = RARITY_EMISSIVE[rarity] === '#000000'
    ? '#888888'
    : RARITY_EMISSIVE[rarity];
  return (
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[1, 3, 1]} />
      <meshStandardMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
}

function UnitModel({ unit, isSelected, hovered, isAttacking }: {
  unit: UnitInstance; isSelected: boolean; hovered: boolean; isAttacking: boolean;
}) {
  const modelPath  = UNIT_MODEL_MAP[unit.type.name] ?? `${BASE_URL}/default.glb`;
  const rotation   = UNIT_MODEL_ROTATION[unit.type.name] ?? [0, Math.PI, 0];
  const scale      = UNIT_MODEL_SCALE[unit.type.name] ?? SCALE;
  const isNative   = NATIVE_ANIM_UNITS.has(unit.type.name);
  const nativeAnim = UNIT_ANIM_MAP[unit.type.name];

  // 메시용 GLB
  const { scene } = useGLTF(modelPath);
  // 자체 애니가 없는 유닛은 default.glb에서 애니 차용
  const { animations: defaultAnims } = useGLTF(`${BASE_URL}/default.glb`);
  const { animations: modelAnims }   = useGLTF(modelPath);

  const animations = isNative ? modelAnims : defaultAnims;

  // scene 캐시 → clone
  const clonedScene = useMemo(() => {
    if (!sceneCache.has(modelPath)) sceneCache.set(modelPath, scene);
    return SkeletonUtils.clone(sceneCache.get(modelPath)!);
  }, [modelPath, scene]);

  const groupRef = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, groupRef);
  const facingRef = useRef<number>(0);

  const emissiveColor = RARITY_EMISSIVE[unit.type.rarity] ?? '#000000';
  const emissiveInt   = RARITY_EMISSIVE_INTENSITY[unit.type.rarity] ?? 0;

  const prevAttackingRef = useRef<boolean | null>(null);

  useEffect(() => {
    // NO_ANIMATION_UNITS → 무조건 정지
    if (NO_ANIMATION_UNITS.has(unit.type.name)) return;
    if (!actions) return;

    const attackKey = isNative ? nativeAnim?.attack : ANIM_ATTACK;
    const idleKey   = isNative ? nativeAnim?.idle   : ANIM_IDLE;

    // 처음 마운트 시 → idle 재생
    if (prevAttackingRef.current === null) {
      if (idleKey && actions[idleKey]) {
        actions[idleKey]?.reset().fadeIn(0.2).play();
      } else {
        Object.values(actions).forEach(a => a?.stop());
      }
      prevAttackingRef.current = false;
      return;
    }

    // 상태 변화 없으면 스킵
    if (prevAttackingRef.current === isAttacking) return;
    prevAttackingRef.current = isAttacking;

    if (isAttacking) {
      if (idleKey) actions[idleKey]?.fadeOut(0.15);
      if (attackKey && actions[attackKey]) {
        actions[attackKey]?.reset().fadeIn(0.15).play();
      }
    } else {
      if (attackKey) actions[attackKey]?.fadeOut(0.15);
      if (idleKey && actions[idleKey]) {
        actions[idleKey]?.reset().fadeIn(0.2).play();
      }
    }
  }, [actions, isAttacking, isNative, nativeAnim, unit.type.name]);

  useFrame((_, delta) => {
    // 애니메이션만 NO_ANIMATION_UNITS 제외, facing은 모든 유닛 적용
    if (!NO_ANIMATION_UNITS.has(unit.type.name)) {
      const ATTACK_SPEED = 0.005;
      const IDLE_SPEED   = 0.8;
      mixer?.update(delta * (isAttacking ? ATTACK_SPEED : IDLE_SPEED));
    }

    if (!groupRef.current) return;

    const enemies = useGameStore.getState().enemies;
    let targetAngle: number | null = null;

    if (isAttacking && enemies.length > 0) {
      // 공격 중 → A키 타겟 우선, 없으면 가장 가까운 적
      let nearestAngle = facingRef.current;
      let minDist = Infinity;

      const attackTarget = unit.attackTargetId
        ? enemies.find(e => e.id === unit.attackTargetId)
        : undefined;

      const targets = attackTarget ? [attackTarget] : enemies;

      for (const enemy of targets) {
        const ePos = getPathPosition(enemy.t);
        const dx = ePos.x - unit.x;
        const dz = ePos.z - unit.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < minDist) {
          minDist = dist;
          nearestAngle = Math.atan2(dx, dz);
        }
      }
      targetAngle = nearestAngle;
    } else if (!isAttacking && unit.attackTargetId !== undefined) {
      // A키 타겟 추적 이동 중 → 타겟 방향 바라보기
      const attackTarget = enemies.find(e => e.id === unit.attackTargetId);
      if (attackTarget) {
        const ePos = getPathPosition(attackTarget.t);
        const dx = ePos.x - unit.x;
        const dz = ePos.z - unit.z;
        targetAngle = Math.atan2(dx, dz);
      }
    } else if (!isAttacking && unit.targetX !== undefined && unit.targetZ !== undefined) {
      // 이동 중 → 이동 방향
      const dx = unit.targetX - unit.x;
      const dz = unit.targetZ - unit.z;
      if (Math.abs(dx) > 0.05 || Math.abs(dz) > 0.05) {
        targetAngle = Math.atan2(dx, dz);
      }
    }

    if (targetAngle !== null) {
      // 📌 수정 포인트: 회전 보간 속도 (높을수록 빠르게 돌아봄)
      const ROTATE_SPEED = 8;
      let diff = targetAngle - facingRef.current;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      facingRef.current += diff * Math.min(1, ROTATE_SPEED * delta);
      groupRef.current.rotation.y = facingRef.current;
    }
  });

  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;

      // GLB 서브메시 raycast 비활성화 → 클릭은 투명 박스가 담당
      mesh.raycast = () => {};

      const mats = Array.isArray(mesh.material)
        ? mesh.material as THREE.Material[]
        : [mesh.material as THREE.Material];
      mats.forEach(mat => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.emissive.setStyle(isSelected ? '#00ff88' : hovered ? '#ffffff' : emissiveColor);
          mat.emissiveIntensity = isSelected ? 0.4 : hovered ? 0.2 : emissiveInt;
        }
      });
    });
  }, [isSelected, hovered, emissiveColor, emissiveInt, clonedScene]);

  return (
    <group ref={groupRef} scale={scale} rotation={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
}

interface UnitMeshProps { unit: UnitInstance; }

export function UnitMesh({ unit }: UnitMeshProps) {
  const { selectUnits, selectedUnitIds, attackingUnitIds } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const isSelected  = selectedUnitIds.includes(unit.id);
  const isAttacking = attackingUnitIds.has(unit.id);
  const color = `#${unit.type.color.toString(16).padStart(6, '0')}`;

  return (
    <group
      position={[unit.x, 0, unit.z]}
      onClick={e => { e.stopPropagation(); isSelected ? selectUnits(selectedUnitIds.filter(id => id !== unit.id)) : selectUnits([unit.id]); }}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {/* 클릭 범위 확장용 투명 박스 — 📌 수정 포인트: args=[가로, 높이, 깊이] */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 4, 3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]} scale={[1,0.6,1]}>
        <circleGeometry args={[0.5,16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {(() => {
        const AURA: Record<string, { color: string; opacity: number; r1: number; r2: number }> = {
          common:    { color: '#00ff88', opacity: 0.45, r1: 0.55, r2: 0.85 },
          uncommon:  { color: '#00ff88', opacity: 0.65, r1: 0.55, r2: 0.90 },
          rare:      { color: '#ff8800', opacity: 0.75, r1: 0.55, r2: 0.95 },
          epic:      { color: '#aa44ff', opacity: 0.85, r1: 0.55, r2: 1.00 },
          legendary: { color: '#ff2222', opacity: 0.95, r1: 0.55, r2: 1.05 },
        };
        const a = AURA[unit.type.rarity] ?? AURA.common;
        return (
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[a.r1, a.r2, 32]} />
            <meshBasicMaterial color={a.color} transparent opacity={a.opacity} />
          </mesh>
        );
      })()}

      {isSelected && (
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,0]}>
          <ringGeometry args={[0.55,0.85,32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.9} />
        </mesh>
      )}
      {isSelected && selectedUnitIds.length === 1 && (
        <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.03,0]}>
          <ringGeometry args={[unit.type.range/10-0.08, unit.type.range/10, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}

      <Suspense fallback={<UnitModelFallback rarity={unit.type.rarity} />}>
        <UnitModel unit={unit} isSelected={isSelected} hovered={hovered} isAttacking={isAttacking} />
      </Suspense>

      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div style={{ width:'80px', pointerEvents:'none' }}>
          <div style={{
            textAlign: 'center', color: '#ffffff', fontSize: '30px', fontWeight: 'bold',
            fontFamily: '"Dotum", "굴림", sans-serif',
            textShadow: '0 0 4px #000, 0 0 4px #000', marginBottom: '3px', whiteSpace: 'nowrap',
          }}>
            {unit.type.name}
          </div>
          <div style={{ width:'100%', height:'7px', backgroundColor:'#111', border:'1px solid #444', borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ width:`${(unit.hp/unit.maxHp)*100}%`, height:'100%', backgroundColor: unit.hp>unit.maxHp*0.5?'#00e676':'#ff4757', transition:'width 0.1s' }} />
          </div>
          <div style={{ width:'100%', height:'4px', backgroundColor:'#111', border:'1px solid #333', borderRadius:'2px', marginTop:'2px', overflow:'hidden' }}>
            <div style={{ width:`${unit.skillGauge}%`, height:'100%', backgroundColor:'#00cfff' }} />
          </div>
        </div>
      </Html>
    </group>
  );
}
// ── 다른 플레이어 유닛 (고스트) ──────────────────────────────
// UnitMesh와 동일하게 렌더링하되 클릭/선택 불가
export function GhostUnitMesh({ unit }: { unit: OtherPlayerUnit }) {
  const unitType = UNIT_TYPES.find(t => t.name === unit.name);
  if (!unitType) return null;

  // UnitModel이 요구하는 최소 UnitInstance 구성
  const fakeUnit: UnitInstance = {
    id:         unit.id,
    type:       unitType,
    x:          unit.x,
    z:          unit.z,
    hp:         unit.hp,
    maxHp:      unit.maxHp,
    skillGauge: 0,
    lastFired:  0,
  };

  const color = `#${unit.color.toString(16).padStart(6, '0')}`;

  const AURA: Record<string, { color: string; opacity: number; r1: number; r2: number }> = {
    common:    { color: '#00ff88', opacity: 0.45, r1: 0.55, r2: 0.85 },
    uncommon:  { color: '#00ff88', opacity: 0.65, r1: 0.55, r2: 0.90 },
    rare:      { color: '#ff8800', opacity: 0.75, r1: 0.55, r2: 0.95 },
    epic:      { color: '#aa44ff', opacity: 0.85, r1: 0.55, r2: 1.00 },
    legendary: { color: '#ff2222', opacity: 0.95, r1: 0.55, r2: 1.05 },
  };
  const aura = AURA[unit.rarity] ?? AURA.common;

  return (
    <group position={[unit.x, 0, unit.z]}>
      {/* 그림자 */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.01, 0]} scale={[1, 0.6, 1]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} />
      </mesh>

      {/* 오라 링 */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[aura.r1, aura.r2, 32]} />
        <meshBasicMaterial color={aura.color} transparent opacity={aura.opacity} />
      </mesh>

      {/* 실제 GLB 모델 (클릭 불가) */}
      <Suspense fallback={<UnitModelFallback rarity={unit.rarity} />}>
        <UnitModel
          unit={fakeUnit}
          isSelected={false}
          hovered={false}
          isAttacking={false}
        />
      </Suspense>

      {/* 이름 + HP 바 */}
      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div style={{ width: '80px', pointerEvents: 'none' }}>
          <div style={{
            textAlign: 'center', color: '#cccccc', fontSize: '30px', fontWeight: 'bold',
            fontFamily: '"Dotum", "굴림", sans-serif',
            textShadow: '0 0 4px #000, 0 0 4px #000',
            marginBottom: '3px', whiteSpace: 'nowrap',
          }}>
            {unit.name}
          </div>
          <div style={{ width: '100%', height: '7px', backgroundColor: '#111', border: '1px solid #444', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              width: `${(unit.hp / unit.maxHp) * 100}%`,
              height: '100%',
              backgroundColor: '#44aaff',  // 파란색으로 구분 (내 유닛은 초록/빨강)
              transition: 'width 0.1s',
            }} />
          </div>
        </div>
      </Html>
    </group>
  );
}