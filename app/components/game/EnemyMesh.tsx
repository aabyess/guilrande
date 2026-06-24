'use client';

import { Html } from '@react-three/drei';
import { EnemyInstance } from '../../store/useGameStore';
import { getPathPosition } from '../../game/path/EnemyPath';

interface EnemyMeshProps {
  enemy: EnemyInstance;
}

export function EnemyMesh({ enemy }: EnemyMeshProps) {
  const pos = getPathPosition(enemy.t);
  const size = enemy.isBoss ? 1.4 : 0.6;
  const color = enemy.isBoss ? '#ff0000' : '#ff4757';

  return (
    <group position={[pos.x, 0, pos.z]}>
      <mesh castShadow>
        <sphereGeometry args={[size * 0.5, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <Html position={[0, size * 0.6, 0]} center distanceFactor={8}>
        <div style={{ width: enemy.isBoss ? '70px' : '40px', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: enemy.isBoss ? '6px' : '4px', backgroundColor: '#333', borderRadius: '2px' }}>
            <div style={{
              width: `${(enemy.hp / enemy.maxHp) * 100}%`,
              height: '100%',
              backgroundColor: enemy.hp > enemy.maxHp * 0.5 ? '#00ff88' : '#ff4757',
              borderRadius: '2px',
              transition: 'width 0.05s',
            }} />
          </div>
          {enemy.isBoss && (
            <div style={{ color: '#ff0000', fontSize: '9px', textAlign: 'center', fontWeight: 'bold' }}>BOSS</div>
          )}
        </div>
      </Html>
    </group>
  );
}