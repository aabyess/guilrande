'use client';

import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, UnitInstance } from '../../store/useGameStore';

interface UnitMeshProps {
  unit: UnitInstance;
}

export function UnitMesh({ unit }: UnitMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { selectUnits, selectedUnitIds, units } = useGameStore();

  const isSelected = selectedUnitIds.includes(unit.id);
  const color = `#${unit.type.color.toString(16).padStart(6, '0')}`;
  const size = 0.7;

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isSelected) {
      // 이미 선택된 거 클릭하면 해제
      selectUnits(selectedUnitIds.filter(id => id !== unit.id));
    } else {
      // shift 없이 클릭 → 단독 선택
      selectUnits([unit.id]);
    }
  };

  return (
    <group position={[unit.x, 0, unit.z]}>
      {/* 유닛 본체 */}
      <mesh
        ref={meshRef}
        position={[0, size * 0.7, 0]}
        onClick={handleClick}
        onPointerOver={e => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <boxGeometry args={[size, size * 1.4, size]} />
        <meshStandardMaterial
          color={color}
          emissive={isSelected ? '#00ff88' : hovered ? color : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : hovered ? 0.2 : 0}
        />
      </mesh>

      {/* 선택 링 */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[size * 0.8, size * 1.1, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.9} />
        </mesh>
      )}

      {/* 사거리 원 (단독 선택일 때만) */}
      {isSelected && selectedUnitIds.length === 1 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[unit.type.range / 10 - 0.08, unit.type.range / 10, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>
      )}

      {/* HP + 스킬 게이지 */}
      <Html position={[0, size * 1.8, 0]} center distanceFactor={10}>
        <div style={{ width: '48px', pointerEvents: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', marginBottom: '2px' }}>{unit.type.emoji}</div>
          {/* HP */}
          <div style={{ width: '100%', height: '4px', backgroundColor: '#222', borderRadius: '2px' }}>
            <div style={{
              width: `${(unit.hp / unit.maxHp) * 100}%`,
              height: '100%',
              backgroundColor: unit.hp > unit.maxHp * 0.5 ? '#00ff88' : '#ff4757',
              borderRadius: '2px',
            }} />
          </div>
          {/* 스킬 */}
          <div style={{ width: '100%', height: '3px', backgroundColor: '#222', borderRadius: '2px', marginTop: '2px' }}>
            <div style={{
              width: `${unit.skillGauge}%`,
              height: '100%',
              backgroundColor: '#00cfff',
              borderRadius: '2px',
            }} />
          </div>
        </div>
      </Html>
    </group>
  );
}