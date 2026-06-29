'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { GameCanvas } from './components/game/GameCanvas';
import { BottomUI, TopHUD } from './components/ui/BottomUI';
import { useGameStore } from './store/useGameStore';

const Lobby = dynamic(() => import('./components/ui/Lobby'), { ssr: false });

const WC_BORDER2 = '#8a7030';
const WC_BG      = '#0d0a04';

interface MultiSession {
  roomId:    string;
  nickname:  string;
  playerId:  string;
  zoneIndex: number;
}

function EscMenu({ onClose }: { onClose: () => void }) {
  const { phase, setPhase, gameOver } = useGameStore();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.75)',
    }}>
      <div style={{
        backgroundColor: WC_BG,
        border: `3px solid ${WC_BORDER2}`,
        outline: '1px solid #5a4a1a',
        boxShadow: '0 0 40px rgba(0,0,0,0.9)',
        padding: '32px 48px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        fontFamily: '"Dotum", "굴림", sans-serif',
        minWidth: '240px',
      }}>
        <div style={{
          color: '#ffd060', fontSize: '22px', fontWeight: 'bold',
          textShadow: '0 0 10px #aa7700',
          borderBottom: `1px solid ${WC_BORDER2}`,
          width: '100%', textAlign: 'center', paddingBottom: '12px', marginBottom: '4px',
        }}>
          ⚔ GuilRanDe
        </div>

        <MenuBtn color="#44aaff" onClick={onClose}>▶ 게임 계속</MenuBtn>

        {!gameOver && (
          phase === 'prepare' ? (
            <MenuBtn color="#ff8844" onClick={() => { setPhase('battle'); onClose(); }}>
              ⚔ 전투 시작
            </MenuBtn>
          ) : (
            <MenuBtn color="#ffcc44" onClick={() => { setPhase('prepare'); onClose(); }}>
              ⏸ 전투 정지
            </MenuBtn>
          )
        )}

        <MenuBtn color="#ff4444" onClick={() => { window.location.reload(); }}>
          🔄 처음부터
        </MenuBtn>
      </div>
    </div>
  );
}

function MenuBtn({ children, onClick, color }: {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '10px 0',
        background: hovered
          ? `linear-gradient(to bottom, #2a2008, #1a1204)`
          : `linear-gradient(to bottom, #1a1508, #0e0c04)`,
        border: `2px solid ${hovered ? color : '#3a3010'}`,
        outline: `1px solid ${hovered ? '#4a3810' : '#1a1a10'}`,
        color: hovered ? color : '#aa9060',
        fontSize: '14px', fontWeight: 'bold',
        fontFamily: '"Dotum", "굴림", sans-serif',
        cursor: 'pointer', transition: 'all 0.1s',
        boxShadow: hovered ? `0 0 8px ${color}44` : 'none',
      }}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [session, setSession] = useState<MultiSession | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const orbitRef  = useRef<any>(null);
  const onEnemySelectRef = useRef<((id: string) => void) | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMenuOpen(prev => !prev);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleGameStart = useCallback((
    roomId: string, nickname: string, playerId: string, zoneIndex: number
  ) => {
    setSession({ roomId, nickname, playerId, zoneIndex });
    useGameStore.getState().setZoneIndex(zoneIndex); // 존 좌표 store에 저장
  }, []);

  // ── 로비 ────────────────────────────────────────────────────────────────────
  if (!session) {
    return <Lobby onGameStart={handleGameStart} />;
  }

  // ── 게임 ────────────────────────────────────────────────────────────────────
  return (
    <main style={{
      width: '100vw', height: '100dvh',
      position: 'relative',
      backgroundColor: '#0a1520', overflow: 'hidden',
    }}>
      <GameCanvas cameraRef={cameraRef} orbitRef={orbitRef} onEnemySelectRef={onEnemySelectRef} />
      <TopHUD />
      <BottomUI cameraRef={cameraRef} orbitRef={orbitRef} onEnemySelectRef={onEnemySelectRef} />

      {menuOpen && <EscMenu onClose={() => setMenuOpen(false)} />}
    </main>
  );
}