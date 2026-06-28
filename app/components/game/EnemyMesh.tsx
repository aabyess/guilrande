'use client';

import { useGLTF, Html, useAnimations } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { EnemyInstance } from '../../store/useGameStore';
import { getPathPosition } from '../../game/path/EnemyPath';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

interface EnemyMeshProps {
  enemy: EnemyInstance;
  onSelect?: (id: string) => void;
}

const GYOZA_SCALE = 2;

function GyozaModel() {
  const { scene, animations } = useGLTF('/models/gyoza.glb');
  const groupRef = useRef<THREE.Group>(null);

  const cloned = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    actions['idle']?.reset().fadeIn(0.3).play();
  }, [actions]);

  return (
    <group ref={groupRef} scale={GYOZA_SCALE}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload('/models/gyoza.glb');

export function EnemyMesh({ enemy, onSelect }: EnemyMeshProps) {
  const pos = getPathPosition(enemy.t);
  const size = enemy.isBoss ? 1.4 : 0.6;

  return (
    <group
      position={[pos.x, 0, pos.z]}
      onClick={(e) => { e.stopPropagation(); onSelect?.(enemy.id); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      {enemy.isBoss ? (
        <mesh castShadow>
          <sphereGeometry args={[size * 0.5, 16, 16]} />
          <meshStandardMaterial color="#ff0000" />
        </mesh>
      ) : (
        <GyozaModel />
      )}

      <Html position={[0, size * 0.8 + 0.6, 0]} center distanceFactor={8}>
        <div style={{ width: '60px', pointerEvents: 'none' }}>
          <div style={{
            width: '100%', height: '7px',
            backgroundColor: '#111',
            border: '1px solid #444',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(enemy.hp / enemy.maxHp) * 100}%`,
              height: '100%',
              backgroundColor: enemy.hp > enemy.maxHp * 0.5 ? '#00e676' : '#ff4757',
              transition: 'width 0.1s',
            }} />
          </div>
          {enemy.isBoss && (
            <div style={{
              color: '#ff4444', fontSize: '9px', fontWeight: 'bold',
              textAlign: 'center', marginTop: '2px',
              textShadow: '0 0 4px #ff0000',
            }}>BOSS</div>
          )}
        </div>
      </Html>
    </group>
  );
}