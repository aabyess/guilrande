'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { PATH_POINTS } from '../../game/path/EnemyPath';

function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#2d5a1e';
  ctx.fillRect(0, 0, 512, 512);
  const colors = ['#2d5a1e','#326320','#285218','#3a6e25','#245016'];
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(Math.random()*512, Math.random()*512, 2+Math.random()*3, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createStoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#8a8070';
  ctx.fillRect(0, 0, 512, 512);
  const colors = ['#7a7060','#857a6a','#6e6657','#807568','#6b6255'];
  for (let i = 0; i < 80; i++) {
    const x = Math.random()*512, y = Math.random()*512;
    const w = 35+Math.random()*55, h = 22+Math.random()*38;
    ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a4438'; ctx.lineWidth = 2; ctx.stroke();
  }
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.12})`;
    ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createZoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#4a6e3a';
  ctx.fillRect(0, 0, 256, 256);
  const bW = 40, bH = 20;
  for (let row = 0; row < 256/bH+1; row++) {
    for (let col = 0; col < 256/bW+1; col++) {
      const offset = row%2===0 ? 0 : bW/2;
      const x = col*bW - offset, y = row*bH;
      ctx.fillStyle = row%3===0 ? '#3e6030' : '#45683a';
      ctx.fillRect(x+1, y+1, bW-2, bH-2);
      ctx.strokeStyle = '#2d4a25'; ctx.lineWidth = 1;
      ctx.strokeRect(x+1, y+1, bW-2, bH-2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 4);
  return tex;
}

// 경로 세그먼트를 평면으로 그리기
function PathSegments({ stoneTexture }: { stoneTexture: THREE.Texture }) {
  const segments = useMemo(() => {
    const pts = PATH_POINTS;
    const result = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.sqrt(dx*dx + dz*dz);
      const cx = (a.x + b.x) / 2;
      const cz = (a.z + b.z) / 2;
      const angle = Math.atan2(dx, dz);
      result.push({ cx, cz, len, angle });
    }
    return result;
  }, []);

  return (
    <>
      {segments.map((seg, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, seg.angle]}
          position={[seg.cx, 0.01, seg.cz]}
          receiveShadow
        >
          <planeGeometry args={[seg.len + 0.1, 3.5]} />
          <meshStandardMaterial map={stoneTexture} roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

export function GameMap() {
  const grassTexture = useMemo(() => createGrassTexture(), []);
  const stoneTexture = useMemo(() => createStoneTexture(), []);
  const zoneTexture  = useMemo(() => createZoneTexture(), []);

  return (
    <group>
      {/* 풀밭 바닥 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[60, 44]} />
        <meshStandardMaterial map={grassTexture} roughness={0.9} />
      </mesh>

      {/* 돌바닥 경로 (납작한 평면) */}
      <PathSegments stoneTexture={stoneTexture} />

      {/* 유닛 배치 구역 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 1]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial map={zoneTexture} roughness={0.8} />
      </mesh>

      {/* 배치 구역 돌담 */}
      {([
        { pos: [0,    0.3, -5] as [number,number,number], size: [18.6, 0.6, 0.5] as [number,number,number] },
        { pos: [0,    0.3,  7] as [number,number,number], size: [18.6, 0.6, 0.5] as [number,number,number] },
        { pos: [-9,   0.3,  1] as [number,number,number], size: [0.5,  0.6,  12] as [number,number,number] },
        { pos: [ 9,   0.3,  1] as [number,number,number], size: [0.5,  0.6,  12] as [number,number,number] },
      ] as { pos:[number,number,number]; size:[number,number,number] }[]).map((w, i) => (
        <mesh key={i} position={w.pos} castShadow receiveShadow>
          <boxGeometry args={w.size} />
          <meshStandardMaterial color="#5a5040" roughness={1} />
        </mesh>
      ))}

      {/* 배치 구역 격자 */}
      <gridHelper args={[18, 18, '#3a6030', '#3a6030']} position={[0, 0.02, 1]} />

      {/* 나무 */}
      {([
        [-20,0,-11],[20,0,-11],[-20,0,11],[20,0,11],
        [-22,0,0], [22,0,0],  [0,0,-14], [0,0,13],
        [-16,0,-13],[16,0,-13],[-16,0,13],[16,0,13],
      ] as [number,number,number][]).map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0,1.2,0]} castShadow>
            <cylinderGeometry args={[0.2,0.3,2.4,8]} />
            <meshStandardMaterial color="#5c3d1e" roughness={1} />
          </mesh>
          <mesh position={[0,3.2,0]} castShadow>
            <coneGeometry args={[1.6,2.2,8]} />
            <meshStandardMaterial color="#1e5c1e" roughness={0.9} />
          </mesh>
          <mesh position={[0,4.2,0]} castShadow>
            <coneGeometry args={[1.2,2.0,8]} />
            <meshStandardMaterial color="#226622" roughness={0.9} />
          </mesh>
          <mesh position={[0,5.1,0]} castShadow>
            <coneGeometry args={[0.8,1.6,8]} />
            <meshStandardMaterial color="#2a7a2a" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* 경로 귀퉁이 횃불 */}
      {([[-12,0,8],[12,0,8],[-12,0,-8],[12,0,-8]] as [number,number,number][]).map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0,0.3,0]} castShadow>
            <cylinderGeometry args={[0.7,0.9,0.5,10]} />
            <meshStandardMaterial color="#6a6050" roughness={1} />
          </mesh>
          <mesh position={[0,0.85,0]}>
            <cylinderGeometry args={[0.08,0.08,0.6,6]} />
            <meshStandardMaterial color="#4a3828" />
          </mesh>
          <mesh position={[0,1.25,0]}>
            <sphereGeometry args={[0.2,8,8]} />
            <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2} transparent opacity={0.9} />
          </mesh>
          <pointLight position={[0,1.3,0]} color="#ff8800" intensity={3} distance={6} decay={2} />
        </group>
      ))}

      {/* 스폰 링 */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[-12,0.05,8]}>
        <ringGeometry args={[1.2,1.7,32]} />
        <meshBasicMaterial color="#ff3333" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}