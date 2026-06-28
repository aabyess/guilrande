'use client';

import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { GameMap } from './GameMap';
import { UnitMesh } from './UnitMesh';
import { EnemyMesh } from './EnemyMesh';
import { StoryZoneObjects } from './StoryZone';
import { useGameLoop } from './GameLoop';
import { useGameStore } from '../../store/useGameStore';

useGLTF.preload('/models/default.glb');
useGLTF.preload('/models/subin.glb');
useGLTF.preload('/models/onepiece_fake_luffy.glb');
useGLTF.preload('/models/onepiece_akainu.glb');
useGLTF.preload('/models/onepiece_jabra_cp0.glb');
useGLTF.preload('/models/onepiece_sanji.glb');

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

// ─────────────────────────────────────────────
// 카메라 Y값을 부드럽게 이동시키는 컴포넌트
// useThree()로 camera 가져온 뒤 ref에 담아서 useFrame 안에서 안전하게 접근
// ─────────────────────────────────────────────
function CameraZoomController({ orbitRef }: { orbitRef: React.MutableRefObject<any> }) {
  const { camera, gl } = useThree();
  const camRef = useRef(camera);
  // 마우스 휠로 줌 중인지 추적 — canvas 엘리먼트에 직접 이벤트 등록
  const isWheelZoomingRef = useRef(false);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    camRef.current = camera;
  }, [camera]);

  useEffect(() => {
    // gl.domElement = Canvas 엘리먼트 (orbitRef보다 확실하게 존재)
    const dom = gl.domElement;

    const onWheel = () => {
      isWheelZoomingRef.current = true;
      // 현재 카메라 Y를 targetCameraY로 즉시 동기화 → Lerp 복귀 차단
      useGameStore.getState().setTargetCameraY(camRef.current.position.y);

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      // 휠 멈추고 500ms 후에 해제 (넉넉하게)
      wheelTimerRef.current = setTimeout(() => {
        isWheelZoomingRef.current = false;
        // 멈춘 시점의 Y를 다시 동기화해서 미세한 복귀도 차단
        useGameStore.getState().setTargetCameraY(camRef.current.position.y);
      }, 500);
    };

    dom.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      dom.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [gl]);

  useFrame(() => {
    // 마우스 휠 줌 중엔 Lerp 완전 스킵
    if (isWheelZoomingRef.current) return;

    const targetCameraY = useGameStore.getState().targetCameraY;
    const cam = camRef.current;
    const controls = orbitRef.current;

    const diff = targetCameraY - cam.position.y;
    if (Math.abs(diff) < 0.05) return;

    // 📌 수정 포인트: Lerp 속도 (0.08 = 부드럽게, 0.2 = 빠르게)
    const delta = diff * 0.08;

    const tz = controls?.target?.z ?? 0;
    const offsetY = cam.position.y;
    const offsetZ = cam.position.z - tz;
    const ratio = offsetY > 0.01 ? offsetZ / offsetY : 23 / 35;

    cam.position.y += delta;
    cam.position.z = tz + cam.position.y * ratio;

    if (controls) controls.update();
  });

  return null;
}

function SceneInner({
  cameraRef,
  glRef,
  orbitRef,
  onEnemySelectRef,
  attackModeRef,
  setAttackTarget,
  selectedUnitIds,
}: {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  glRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
  orbitRef: React.MutableRefObject<any>;
  onEnemySelectRef: React.MutableRefObject<((id: string) => void) | null>;
  attackModeRef: React.MutableRefObject<boolean>;
  setAttackTarget: (id: string | undefined) => void;
  selectedUnitIds: string[];
}) {
  const { camera, gl } = useThree();
  const { units, enemies } = useGameStore();

  useGameLoop();

  useEffect(() => {
    cameraRef.current = camera;
    glRef.current = gl;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl]);

  return (
    <>
      <ambientLight intensity={0.9} color="#e8f0ff" />
      <directionalLight
        position={[20, 60, 20]}
        intensity={2.2}
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <directionalLight position={[-30, 30, -20]} intensity={0.6} color="#c8e0ff" />

      <GameMap />

      {units.map(unit => <UnitMesh key={unit.id} unit={unit} />)}
      {enemies.map(enemy => <EnemyMesh key={enemy.id} enemy={enemy} onSelect={(id) => {
        if (attackModeRef.current && selectedUnitIds.length > 0) {
          setAttackTarget(id);
          attackModeRef.current = false;
        } else {
          onEnemySelectRef.current?.(id);
        }
      }} />)}

      <StoryZoneObjects />

      {/* ─────────────────────────────────────────────
          카메라 줌 컨트롤러 — targetCameraY 변경 시 자동으로 부드럽게 이동
          ───────────────────────────────────────────── */}
      <CameraZoomController orbitRef={orbitRef} />

      <OrbitControls
        ref={orbitRef}
        enableRotate={false}
        enablePan={false}
        enableZoom={true}
        zoomToCursor={false}
        // 📌 수정 포인트: minDistance/maxDistance가 시야100~200의 Y범위와 맞아야 함
        // VISION_PRESETS { 100:25, 150:45, 200:80 } 기준으로 설정
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
  onEnemySelectRef: externalOnEnemySelectRef,
}: {
  cameraRef?: React.MutableRefObject<THREE.Camera | null>;
  orbitRef?: React.MutableRefObject<any>;
  onEnemySelectRef?: React.MutableRefObject<((id: string) => void) | null>;
}) {
  const { units, selectedUnitIds, selectUnits, clearSelection, moveSelectedUnits, gatherSameType, stopSelectedUnits, setAttackTarget } = useGameStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const attackModeRef = useRef(false); // A키 누른 상태

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 입력창 포커스 중엔 단축키 무시
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'v' || e.key === 'V') gatherSameType();
      // A키: 공격 이동 (현재 미구현 — 기능 붙일 때 여기 채우면 됨)
      if (e.key === 'a' || e.key === 'A') {
        attackModeRef.current = !attackModeRef.current;
      }
      // S키: 선택된 유닛 이동 즉시 정지
      if (e.key === 's' || e.key === 'S') {
        stopSelectedUnits();
      }
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
  }, [gatherSameType, stopSelectedUnits]);

  const internalCameraRef = useRef<THREE.Camera | null>(null);
  const cameraRef = externalCameraRef ?? internalCameraRef;
  const internalOnEnemySelectRef = useRef<((id: string) => void) | null>(null);
  const onEnemySelectRef = externalOnEnemySelectRef ?? internalOnEnemySelectRef;
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const internalOrbitRef = useRef<any>(null);
  const orbitRef = externalOrbitRef ?? internalOrbitRef;

  const EDGE_THRESHOLD = 60;
  const SCROLL_SPEED = 0.1;
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const edgeScrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    const KEY_SPEED = 0.4;

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

      const keys = keysRef.current;
      if (keys.has('ArrowLeft'))  dx -= KEY_SPEED;
      if (keys.has('ArrowRight')) dx += KEY_SPEED;
      if (keys.has('ArrowUp'))    dz -= KEY_SPEED;
      if (keys.has('ArrowDown'))  dz += KEY_SPEED;

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const isDraggingRef = useRef(false);
  const dragStartScreen = useRef<{ x: number; y: number } | null>(null);
  const dragStartWorld = useRef<THREE.Vector3 | null>(null);
  const [dragBox, setDragBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = false;
    dragStartScreen.current = { x: e.clientX, y: e.clientY };
    if (cameraRef.current && glRef.current) {
      dragStartWorld.current = getWorldPos(e.clientX, e.clientY, cameraRef.current, glRef.current.domElement);
    }
    if (orbitRef.current) orbitRef.current.enabled = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      clearSelection();
    }
    isDraggingRef.current = false;
    dragStartScreen.current = null;
    dragStartWorld.current = null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, selectUnits, clearSelection]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedUnitIds.length === 0 || !cameraRef.current || !glRef.current) return;
    const pos = getWorldPos(e.clientX, e.clientY, cameraRef.current, glRef.current.domElement);
    if (pos) moveSelectedUnits(pos.x, pos.z);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // 📌 수정 포인트: 초기 카메라 Y = 45 (시야150과 동일)
        // VISION_PRESETS[150] = 45 와 맞춰져 있음
        camera={{ position: [0, 35, 23], fov: 45 }}
        gl={{ antialias: true }}
        onContextMenu={e => e.preventDefault()}
      >
        <Suspense fallback={null}>
          <SceneInner
            cameraRef={cameraRef}
            glRef={glRef}
            orbitRef={orbitRef}
            onEnemySelectRef={onEnemySelectRef}
            attackModeRef={attackModeRef}
            setAttackTarget={setAttackTarget}
            selectedUnitIds={selectedUnitIds}
          />
        </Suspense>
      </Canvas>

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