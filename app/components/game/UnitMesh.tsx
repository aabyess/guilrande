'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Html, useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { useGameStore, UnitInstance } from '../../store/useGameStore';

const RARITY_EMISSIVE: Record<string, string> = {
  common: '#000000', uncommon: '#004a46', rare: '#3a0070',
  epic: '#5a3000', legendary: '#5a0000',
};
const RARITY_EMISSIVE_INTENSITY: Record<string, number> = {
  common: 0, uncommon: 0.3, rare: 0.5, epic: 0.6, legendary: 0.8,
};

const SCALE = 1.6;

const UNIT_MODEL_MAP: Record<string, string> = {
  '김수빈': '/models/subin.glb',
};

const UNIT_MODEL_ROTATION: Record<string, [number, number, number]> = {
  '김수빈': [0, 0, 0],
};

// ── 모델별 scene 캐시 (clone 비용 절감) ──────────────────────
const sceneCache = new Map<string, THREE.Group>();

function UnitModel({ unit, isSelected, hovered }: {
  unit: UnitInstance; isSelected: boolean; hovered: boolean;
}) {
  const modelPath = UNIT_MODEL_MAP[unit.type.name] ?? '/models/default.glb';
  const rotation  = UNIT_MODEL_ROTATION[unit.type.name] ?? [0, Math.PI, 0];

  // 메시용 GLB
  const { scene } = useGLTF(modelPath);
  // 애니메이션은 항상 default.glb에서 (subin.glb엔 없음)
  const { animations } = useGLTF('/models/default.glb');

  // scene 캐시 → clone
  const clonedScene = useMemo(() => {
    if (!sceneCache.has(modelPath)) sceneCache.set(modelPath, scene);
    return SkeletonUtils.clone(sceneCache.get(modelPath)!);
  }, [modelPath, scene]);

  const groupRef = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, groupRef);

  const emissiveColor = RARITY_EMISSIVE[unit.type.rarity] ?? '#000000';
  const emissiveInt   = RARITY_EMISSIVE_INTENSITY[unit.type.rarity] ?? 0;

  useEffect(() => {
    if (!actions) return;
    const keys = Object.keys(actions);
    if (keys.length === 0) return;
    const action = actions['Idle'] ?? actions['idle'] ?? actions[keys[0]];
    action?.reset().fadeIn(0.3).play();
    return () => { action?.fadeOut(0.2); };
  }, [actions]);

  useFrame((_, delta) => { mixer?.update(delta); });

  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const mesh = obj as THREE.Mesh;
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
    <group ref={groupRef} scale={SCALE} rotation={rotation}>
      <primitive object={clonedScene} />
    </group>
  );
}

// preload — 앱 시작 시 즉시 캐싱
useGLTF.preload('/models/default.glb');
useGLTF.preload('/models/subin.glb');

interface UnitMeshProps { unit: UnitInstance; }

export function UnitMesh({ unit }: UnitMeshProps) {
  const { selectUnits, selectedUnitIds } = useGameStore();
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedUnitIds.includes(unit.id);
  const color = `#${unit.type.color.toString(16).padStart(6, '0')}`;

  return (
    <group
      position={[unit.x, 0, unit.z]}
      onClick={e => { e.stopPropagation(); isSelected ? selectUnits(selectedUnitIds.filter(id => id !== unit.id)) : selectUnits([unit.id]); }}
      onPointerOver={e => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
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

      <UnitModel unit={unit} isSelected={isSelected} hovered={hovered} />

      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div style={{ width:'80px', pointerEvents:'none' }}>
          <div style={{
            textAlign: 'center', color: '#ffffff', fontSize: '11px', fontWeight: 'bold',
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