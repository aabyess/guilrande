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
      {/* 판타지 조명 */}
      <ambientLight intensity={0.35} color="#b8d4ff" />
      <directionalLight
        position={[8, 25, 5]}
        intensity={1.4}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      {/* 달빛 느낌 보조 조명 */}
      <directionalLight position={[-15, 10, -10]} intensity={0.3} color="#6080ff" />
      {/* 하늘 안개 */}
      <fog attach="fog" args={["#0a1520", 30, 70]} />

      <GameMap />

      {units.map(unit => <UnitMesh key={unit.id} unit={unit} />)}
      {enemies.map(enemy => <EnemyMesh key={enemy.id} enemy={enemy} />)}

      <OrbitControls
        ref={orbitRef}
        enableRotate={false}
        enablePan={true}
        enableZoom={true}
        minDistance={8}
        maxDistance={40}
        mouseButtons={{
          LEFT: undefined as any,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
        target={[0, 0, 0]}
      />
    </>
  );
}

export function GameCanvas() {
  const { units, selectedUnitIds, selectUnits, clearSelection, moveSelectedUnits, gatherSameType } = useGameStore();

  const containerRef = useRef<HTMLDivElement>(null);

  // V키: 같은 타입 유닛 집결
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'v' || e.key === 'V') gatherSameType();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gatherSameType]);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitRef = useRef<any>(null);

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
        height: 'calc(100dvh - 240px)',
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
        camera={{ position: [0, 22, 14], fov: 45 }}
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
          {selectedUnitIds.length === 1 ? '유닛 선택됨 — 우클릭으로 이동' : `${selectedUnitIds.length}개 선택됨 — 우클릭으로 이동`}
        </div>
      )}
    </div>
  );
}