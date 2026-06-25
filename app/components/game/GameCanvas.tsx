'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { GameMap } from './GameMap';
import { UnitMesh } from './UnitMesh';
import { EnemyMesh } from './EnemyMesh';
import { useGameLoop } from './GameLoop';
import { useGameStore } from '../../store/useGameStore';

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function getWorldPos(
  clientX: number,
  clientY: number,
  camera: THREE.Camera,
  domElement: HTMLElement
): THREE.Vector3 | null {
  const rect = domElement.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((clientY - rect.top) / rect.height) * 2 + 1;
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
  const target = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(GROUND_PLANE, target);
  return hit ? target : null;
}

// Scene 안에서 camera/gl 가져와서 ref에 저장
function SceneInner({
  cameraRef,
  glRef,
  orbitRef,
}: {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  glRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
  orbitRef: React.MutableRefObject<any>;
}) {
  const { camera, gl } = useThree();
  const { units, enemies } = useGameStore();

  useGameLoop();

  useEffect(() => {
    cameraRef.current = camera;
    glRef.current = gl;
  }, [camera, gl]);

  return (
    <>
      {/* 주 조명 — 밝은 낮 */}
      <ambientLight intensity={0.9} color="#e8f0ff" />
      <directionalLight
        position={[20, 60, 20]}
        intensity={2.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      {/* 보조 채광 */}
      <directionalLight position={[-30, 30, -20]} intensity={0.6} color="#c8e0ff" />

      <GameMap />

      {units.map(unit => <UnitMesh key={unit.id} unit={unit} />)}
      {enemies.map(enemy => <EnemyMesh key={enemy.id} enemy={enemy} />)}

      <OrbitControls
        ref={orbitRef}
        enableRotate={false}
        enablePan={false}
        enableZoom={true}
        zoomToCursor={false}
        minDistance={12}
        maxDistance={100}
        mouseButtons={{
          LEFT: undefined as any,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: undefined as any,
        }}
        touches={{
          ONE: undefined as any,
          TWO: undefined as any,
        }}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function GameCanvas({
  cameraRef: externalCameraRef,
  orbitRef: externalOrbitRef,
}: {
  cameraRef?: React.MutableRefObject<THREE.Camera | null>;
  orbitRef?: React.MutableRefObject<any>;
}) {
  const { units, selectedUnitIds, selectUnits, clearSelection, moveSelectedUnits, gatherSameType } = useGameStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // 키보드 상태 추적 (방향키)
  const keysRef = useRef<Set<string>>(new Set());

  // V키 + 방향키 통합
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V') gatherSameType();
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gatherSameType]);
  const internalCameraRef = useRef<THREE.Camera | null>(null);
  const cameraRef = externalCameraRef ?? internalCameraRef;
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const internalOrbitRef = useRef<any>(null);
  const orbitRef = externalOrbitRef ?? internalOrbitRef;

  // 엣지 스크롤 설정
  const EDGE_THRESHOLD = 60;   // 가장자리 감지 픽셀
  const SCROLL_SPEED = 0.1;   // 카메라 이동 속도
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const edgeScrollRafRef = useRef<number | null>(null);

  // 엣지 스크롤 + 방향키 이동 통합 루프
  useEffect(() => {
    const KEY_SPEED = 0.5; // 방향키 이동 속도

    const loop = () => {
      edgeScrollRafRef.current = requestAnimationFrame(loop);
      if (!cameraRef.current || !orbitRef.current) return;

      const cam = cameraRef.current as THREE.PerspectiveCamera;
      const controls = orbitRef.current;

      const forward = new THREE.Vector3();
      cam.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      const right = new THREE.Vector3();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

      let dx = 0, dz = 0;

      // ── 방향키 ──
      const keys = keysRef.current;
      if (keys.has('ArrowLeft'))  dx -= KEY_SPEED;
      if (keys.has('ArrowRight')) dx += KEY_SPEED;
      if (keys.has('ArrowUp'))    dz -= KEY_SPEED;
      if (keys.has('ArrowDown'))  dz += KEY_SPEED;

      // ── 엣지 스크롤 ──
      const container = containerRef.current;
      const mp = mousePosRef.current;
      if (container && mp) {
        const rect = container.getBoundingClientRect();
        const lx = mp.x - rect.left;
        const ly = mp.y - rect.top;
        const rw = rect.width, rh = rect.height;
        if (mp.x >= rect.left && mp.x <= rect.right && mp.y >= rect.top && mp.y <= rect.bottom) {
          if (lx < EDGE_THRESHOLD) dx -= ((EDGE_THRESHOLD - lx) / EDGE_THRESHOLD) * SCROLL_SPEED * 10;
          else if (lx > rw - EDGE_THRESHOLD) dx += ((lx - (rw - EDGE_THRESHOLD)) / EDGE_THRESHOLD) * SCROLL_SPEED * 10;
          if (ly < EDGE_THRESHOLD) dz -= ((EDGE_THRESHOLD - ly) / EDGE_THRESHOLD) * SCROLL_SPEED * 10;
          else if (ly > rh - EDGE_THRESHOLD) dz += ((ly - (rh - EDGE_THRESHOLD)) / EDGE_THRESHOLD) * SCROLL_SPEED * 10;
        }
      }

      if (dx === 0 && dz === 0) return;

      const move = new THREE.Vector3()
        .addScaledVector(right, dx)
        .addScaledVector(forward, -dz);

      cam.position.add(move);
      if (controls.target) controls.target.add(move);
      controls.update();
    };

    edgeScrollRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (edgeScrollRafRef.current) cancelAnimationFrame(edgeScrollRafRef.current);
    };
  }, []);

  // 전역 마우스 위치 추적 (컨테이너 밖까지)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      mousePosRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // 드래그 상태
  const isDraggingRef = useRef(false);
  const dragStartScreen = useRef<{ x: number; y: number } | null>(null);
  const dragStartWorld = useRef<THREE.Vector3 | null>(null);
  const [dragBox, setDragBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return; // 좌클릭만
    isDraggingRef.current = false;
    dragStartScreen.current = { x: e.clientX, y: e.clientY };

    if (cameraRef.current && glRef.current) {
      dragStartWorld.current = getWorldPos(e.clientX, e.clientY, cameraRef.current, glRef.current.domElement);
    }
    // OrbitControls 좌클릭 pan 비활성화 (드래그 선택 중)
    if (orbitRef.current) orbitRef.current.enabled = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStartScreen.current) return;
    const dx = e.clientX - dragStartScreen.current.x;
    const dy = e.clientY - dragStartScreen.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDraggingRef.current = true;
      const rect = containerRef.current!.getBoundingClientRect();
      setDragBox({
        x: Math.min(dragStartScreen.current.x, e.clientX) - rect.left,
        y: Math.min(dragStartScreen.current.y, e.clientY) - rect.top,
        w: Math.abs(dx),
        h: Math.abs(dy),
      });
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (orbitRef.current) orbitRef.current.enabled = true;
    setDragBox(null);

    if (!dragStartScreen.current || !cameraRef.current || !glRef.current) {
      dragStartScreen.current = null;
      return;
    }

    if (isDraggingRef.current && dragStartWorld.current) {
      // 드래그 박스 → 유닛 선택
      const endWorld = getWorldPos(e.clientX, e.clientY, cameraRef.current, glRef.current.domElement);
      if (endWorld) {
        const minX = Math.min(dragStartWorld.current.x, endWorld.x);
        const maxX = Math.max(dragStartWorld.current.x, endWorld.x);
        const minZ = Math.min(dragStartWorld.current.z, endWorld.z);
        const maxZ = Math.max(dragStartWorld.current.z, endWorld.z);

        const selected = units
          .filter(u => u.x >= minX && u.x <= maxX && u.z >= minZ && u.z <= maxZ)
          .slice(0, 12)
          .map(u => u.id);

        if (selected.length > 0) selectUnits(selected);
        else clearSelection();
      }
    } else {
      // 단순 클릭 → 선택 해제 (유닛 클릭은 UnitMesh에서 처리)
      clearSelection();
    }

    isDraggingRef.current = false;
    dragStartScreen.current = null;
    dragStartWorld.current = null;
  }, [units, selectUnits, clearSelection]);

  // 우클릭 → 선택 유닛 이동
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedUnitIds.length === 0 || !cameraRef.current || !glRef.current) return;
    const pos = getWorldPos(e.clientX, e.clientY, cameraRef.current, glRef.current.domElement);
    if (pos) moveSelectedUnits(pos.x, pos.z);
  }, [selectedUnitIds, moveSelectedUnits]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100dvh',
        position: 'relative',
        userSelect: 'none',
        cursor: selectedUnitIds.length > 0 ? 'crosshair' : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
    >
      <Canvas
        shadows
        camera={{ position: [0, 45, 30], fov: 45 }}
        gl={{ antialias: true }}
        onContextMenu={e => e.preventDefault()}
      >
        <Suspense fallback={null}>
          <SceneInner
            cameraRef={cameraRef}
            glRef={glRef}
            orbitRef={orbitRef}
          />
        </Suspense>
      </Canvas>

      {/* 드래그 선택 박스 */}
      {dragBox && (
        <div style={{
          position: 'absolute',
          left: dragBox.x,
          top: dragBox.y,
          width: dragBox.w,
          height: dragBox.h,
          border: '1px solid #00ff88',
          backgroundColor: 'rgba(0,255,136,0.05)',
          pointerEvents: 'none',
        }} />
      )}

      {/* 선택 유닛 수 표시 */}
      {selectedUnitIds.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.65)',
          color: '#00ff88',
          fontSize: '13px',
          fontWeight: 'bold',
          padding: '4px 14px',
          borderRadius: '12px',
          pointerEvents: 'none',
          border: '1px solid #00ff88',
        }}>
          {selectedUnitIds.length === 1 ? '유닛 선택됨 — 우클릭으로 이동 · 가장자리로 카메라 이동' : `${selectedUnitIds.length}개 선택됨 — 우클릭으로 이동 · 가장자리로 카메라 이동`}
        </div>
      )}
    </div>
  );
}