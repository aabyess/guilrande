'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { GameCanvas } from './components/game/GameCanvas';
import { BottomUI, TopHUD } from './components/ui/BottomUI';

export default function Home() {
  const cameraRef = useRef<THREE.Camera | null>(null);
  const orbitRef = useRef<any>(null);

  return (
    <main style={{
      width: '100vw', height: '100dvh',
      position: 'relative',
      backgroundColor: '#0a1520', overflow: 'hidden',
    }}>
      <GameCanvas cameraRef={cameraRef} orbitRef={orbitRef} />
      <TopHUD />
      <BottomUI cameraRef={cameraRef} orbitRef={orbitRef} />
    </main>
  );
}