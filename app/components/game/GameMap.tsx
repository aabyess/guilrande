'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { PATH_POINTS } from '../../game/path/EnemyPath';

// 맵 전체 크기
const MAP_W = 120;
const MAP_H = 200;

function createGrassTexture(seed = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const colors = ['#2d5a1e','#326320','#285218','#3a6e25','#245016'];
  ctx.fillStyle = colors[seed % colors.length];
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillRect(Math.random()*512, Math.random()*512, 2+Math.random()*3, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function createStonePathTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#8a8070';
  ctx.fillRect(0, 0, 512, 512);
  const colors = ['#7a7060','#857a6a','#6e6657','#807568','#6b6255'];
  for (let i = 0; i < 80; i++) {
    const x = Math.random()*512, y = Math.random()*512;
    const w = 30+Math.random()*50, h = 18+Math.random()*35;
    ctx.fillStyle = colors[Math.floor(Math.random()*colors.length)];
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#4a4438'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createZoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#3e6030';
  ctx.fillRect(0, 0, 256, 256);
  const bW = 40, bH = 20;
  for (let row = 0; row < 256/bH+1; row++) {
    for (let col = 0; col < 256/bW+1; col++) {
      const offset = row%2===0 ? 0 : bW/2;
      const x = col*bW - offset, y = row*bH;
      ctx.fillStyle = row%3===0 ? '#365528' : '#3e6030';
      ctx.fillRect(x+1, y+1, bW-2, bH-2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createWaterTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0a2a4a';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) {
    const x = Math.random()*256, y = Math.random()*256;
    ctx.strokeStyle = `rgba(100,180,255,${0.1+Math.random()*0.15})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, 20+Math.random()*30, 5+Math.random()*10, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createDirtTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#5a4a35';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.2})`;
    ctx.fillRect(Math.random()*256, Math.random()*256, 2, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

// 경로 세그먼트 — 루프 마지막(④→①)까지 포함
function PathSegments({ stoneTexture }: { stoneTexture: THREE.Texture }) {
  const segments = useMemo(() => {
    const pts = PATH_POINTS;
    const result = [];
    // 루프이므로 마지막 점 → 첫 점 세그먼트도 추가
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length]; // 마지막은 첫 점으로 wrap
      const dx = b.x - a.x, dz = b.z - a.z;
      const len = Math.sqrt(dx*dx + dz*dz);
      result.push({
        cx: (a.x+b.x)/2, cz: (a.z+b.z)/2,
        len, angle: Math.atan2(dx, dz)
      });
    }
    return result;
  }, []);

  return (
    <>
      {segments.map((seg, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, seg.angle]} position={[seg.cx, 0.01, seg.cz]} receiveShadow>
          <planeGeometry args={[seg.len+0.2, 5]} />
          <meshStandardMaterial map={stoneTexture} roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

// 나무 하나
function Tree({ pos, scale = 1 }: { pos: [number,number,number]; scale?: number }) {
  return (
    <group position={pos} scale={scale}>
      <mesh position={[0,1.2,0]} castShadow>
        <cylinderGeometry args={[0.22,0.32,2.4,7]} />
        <meshStandardMaterial color="#5c3d1e" roughness={1} />
      </mesh>
      <mesh position={[0,3.2,0]} castShadow>
        <coneGeometry args={[1.8,2.4,7]} />
        <meshStandardMaterial color="#1e5c1e" roughness={0.9} />
      </mesh>
      <mesh position={[0,4.4,0]} castShadow>
        <coneGeometry args={[1.3,2.2,7]} />
        <meshStandardMaterial color="#226622" roughness={0.9} />
      </mesh>
      <mesh position={[0,5.5,0]} castShadow>
        <coneGeometry args={[0.8,1.6,7]} />
        <meshStandardMaterial color="#2a7a2a" roughness={0.9} />
      </mesh>
    </group>
  );
}

// 횃불
function Torch({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      <mesh position={[0,0.3,0]} castShadow>
        <cylinderGeometry args={[0.6,0.8,0.5,8]} />
        <meshStandardMaterial color="#6a6050" roughness={1} />
      </mesh>
      <mesh position={[0,0.85,0]}>
        <cylinderGeometry args={[0.07,0.07,0.6,6]} />
        <meshStandardMaterial color="#4a3828" />
      </mesh>
      <mesh position={[0,1.25,0]}>
        <sphereGeometry args={[0.18,8,8]} />
        <meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0,1.3,0]} color="#ff8800" intensity={4} distance={8} decay={2} />
    </group>
  );
}

// 돌담 세그먼트
function Wall({ pos, size }: { pos:[number,number,number]; size:[number,number,number] }) {
  return (
    <mesh position={pos} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#5a5040" roughness={1} />
    </mesh>
  );
}

// 4구역 중 한 구역 (정사각형 타일 + 담장)
function Zone({ cx, cz, size = 40, label }: { cx: number; cz: number; size?: number; label?: string }) {
  const half = size / 2;
  return (
    <group>
      {/* 잔디 바닥 */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[cx,0,cz]} receiveShadow>
        <planeGeometry args={[size,size]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.9} />
      </mesh>
      {/* 격자 */}
      <gridHelper args={[size, size, '#2a5028', '#2a5028']} position={[cx,0.02,cz]} />
      {/* 담장 4면 */}
      <Wall pos={[cx, 0.4, cz - half]} size={[size+1, 0.8, 0.6]} />
      <Wall pos={[cx, 0.4, cz + half]} size={[size+1, 0.8, 0.6]} />
      <Wall pos={[cx - half, 0.4, cz]} size={[0.6, 0.8, size+1]} />
      <Wall pos={[cx + half, 0.4, cz]} size={[0.6, 0.8, size+1]} />
    </group>
  );
}

export function GameMap() {
  const grassTex  = useMemo(() => createGrassTexture(0), []);
  const zoneTex   = useMemo(() => createZoneTexture(), []);

  // 나무 위치 + 고정 scale — Math.random 사용 금지 (render 순수성)
  const trees: { pos: [number,number,number]; scale: number }[] = [
    // 맵 외곽
    { pos: [-55,0,-55], scale: 0.9  }, { pos: [-40,0,-55], scale: 1.05 }, { pos: [-25,0,-55], scale: 0.85 },
    { pos: [  0,0,-58], scale: 1.1  }, { pos: [ 25,0,-55], scale: 0.95 }, { pos: [ 40,0,-55], scale: 1.0  },
    { pos: [ 55,0,-55], scale: 0.88 },
    { pos: [-58,0,-40], scale: 1.0  }, { pos: [-58,0,-20], scale: 0.9  }, { pos: [-58,0,  0], scale: 1.05 },
    { pos: [-58,0, 20], scale: 0.85 }, { pos: [-58,0, 40], scale: 1.1  },
    { pos: [ 58,0,-40], scale: 0.95 }, { pos: [ 58,0,-20], scale: 1.0  }, { pos: [ 58,0,  0], scale: 0.88 },
    { pos: [ 58,0, 20], scale: 1.05 }, { pos: [ 58,0, 40], scale: 0.9  },
    { pos: [-55,0, 55], scale: 1.0  }, { pos: [-40,0, 55], scale: 0.85 }, { pos: [-25,0, 55], scale: 1.1  },
    { pos: [  0,0, 58], scale: 0.95 }, { pos: [ 25,0, 55], scale: 1.0  }, { pos: [ 40,0, 55], scale: 0.9  },
    { pos: [ 55,0, 55], scale: 1.05 },
    // 4구역 사이 십자 통로 옆
    { pos: [ -5,0,-30], scale: 0.9  }, { pos: [  5,0,-30], scale: 1.0  },
    { pos: [ -5,0, 30], scale: 0.85 }, { pos: [  5,0, 30], scale: 0.95 },
    { pos: [-30,0, -5], scale: 1.05 }, { pos: [-30,0,  5], scale: 0.9  },
    { pos: [ 30,0, -5], scale: 1.0  }, { pos: [ 30,0,  5], scale: 0.88 },
  ];

  // 횃불: 경로 4개 코너 (PATH_POINTS 꼭짓점)에 배치
  // 경로: X_L=-51, X_R=-9, Z_T=-51, Z_B=-9
  const torches: [number,number,number][] = [
    [-51, 0, -51],  // ① 좌상 (스폰)
    [-51, 0,  -9],  // ② 좌하
    [ -9, 0,  -9],  // ③ 우하
    [ -9, 0, -51],  // ④ 우상
  ];

  return (
    <group>
      {/* ── 전체 바닥 (풀밭) ── */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.05,0]} receiveShadow>
        <planeGeometry args={[MAP_W+20, MAP_H+20]} />
        <meshStandardMaterial map={grassTex} roughness={0.9} />
      </mesh>



      {/* ── 4개 구역 ── */}
      {/* 2사분면 좌상 — 플레이어1 전투 구역 */}
      <Zone cx={-30} cz={-30} size={44} />
      {/* 1사분면 우상 — 플레이어2 (미래) */}
      <Zone cx={ 30} cz={-30} size={44} />
      {/* 3사분면 좌하 — 플레이어3 (미래) */}
      <Zone cx={-30} cz={ 30} size={44} />
      {/* 4사분면 우하 — 플레이어4 (미래) */}
      <Zone cx={ 30} cz={ 30} size={44} />

      {/* ── 플레이어1 유닛 배치 구역 (2사분면 중앙) ── */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[-30,0.01,-30]} receiveShadow>
        <planeGeometry args={[32,32]} />
        <meshStandardMaterial map={zoneTex} roughness={0.8} />
      </mesh>
      <gridHelper args={[32,32,'#3a6030','#3a6030']} position={[-30,0.03,-30]} />



      {/* 스폰 링 */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[PATH_POINTS[0].x, 0.05, PATH_POINTS[0].z]}>
        <ringGeometry args={[1.5,2.2,32]} />
        <meshBasicMaterial color="#ff3333" transparent opacity={0.8} />
      </mesh>


      {/* ── 스토리존 섬 (P3 섬 아래 별도 구역, z=80 중심) ── */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.05,140]} receiveShadow>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#1a3a18" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0,140]} receiveShadow>
        <planeGeometry args={[44, 30]} />
        <meshStandardMaterial color="#162e12" roughness={1} />
      </mesh>
      <gridHelper args={[44, 22, '#1e3a1a', '#1e3a1a']} position={[0,0.02,140]} />
      {/* 담장 */}
      <mesh position={[0, 0.4, 125]} castShadow receiveShadow>
        <boxGeometry args={[45, 0.8, 0.6]} />
        <meshStandardMaterial color="#3a2a1a" roughness={1} />
      </mesh>
      <mesh position={[0, 0.4, 155]} castShadow receiveShadow>
        <boxGeometry args={[45, 0.8, 0.6]} />
        <meshStandardMaterial color="#3a2a1a" roughness={1} />
      </mesh>
      <mesh position={[-22, 0.4, 140]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.8, 31]} />
        <meshStandardMaterial color="#3a2a1a" roughness={1} />
      </mesh>
      <mesh position={[22, 0.4, 140]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.8, 31]} />
        <meshStandardMaterial color="#3a2a1a" roughness={1} />
      </mesh>
      {/* 입구 횃불 */}
      <group position={[-6, 0, 125]}>
        <mesh position={[0,0.85,0]}><cylinderGeometry args={[0.07,0.07,1.6,6]} /><meshStandardMaterial color="#4a3828" /></mesh>
        <mesh position={[0,1.7,0]}><sphereGeometry args={[0.2,8,8]} /><meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.9} /></mesh>
        <pointLight position={[0,1.8,0]} color="#ff8800" intensity={5} distance={10} decay={2} />
      </group>
      <group position={[6, 0, 125]}>
        <mesh position={[0,0.85,0]}><cylinderGeometry args={[0.07,0.07,1.6,6]} /><meshStandardMaterial color="#4a3828" /></mesh>
        <mesh position={[0,1.7,0]}><sphereGeometry args={[0.2,8,8]} /><meshStandardMaterial color="#ff6600" emissive="#ff4400" emissiveIntensity={2.5} transparent opacity={0.9} /></mesh>
        <pointLight position={[0,1.8,0]} color="#ff8800" intensity={5} distance={10} decay={2} />
      </group>

      {/* ── 나무 ── */}
      {trees.map((t, i) => (
        <Tree key={i} pos={t.pos} scale={t.scale} />
      ))}

      {/* ── 횃불 ── */}
      {torches.map((pos, i) => <Torch key={i} pos={pos} />)}


    </group>
  );
}