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

      <Html position={[0, size * 0.8 + 0.6, 0]} center distanceFactor={8}>
        <div style={{ width: '60px', pointerEvents: 'none' }}>
          {/* HP 바 */}
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