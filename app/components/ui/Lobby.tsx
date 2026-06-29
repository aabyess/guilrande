'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { connectSocket } from '../../lib/socket';
import type { Socket } from 'socket.io-client';

type Phase = 'landing' | 'waiting';

export interface LobbyPlayer {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
}

export interface LobbyProps {
  onGameStart: (roomId: string, nickname: string, playerId: string, zoneIndex: number) => void;
}

const C = {
  bg: '#080812', card: '#0d0d1f', panel: '#121228',
  border: '#1e1e3a', purple: '#6366f1', gold: '#FFD700',
  green: '#22c55e', red: '#ef4444', muted: '#4a4a6a',
  text: '#e2e2f0', sub: '#8888aa',
} as const;

const styles = {
  btnPrimary: (): React.CSSProperties => ({
    width: '100%', padding: '13px',
    backgroundColor: C.purple, border: 'none', borderRadius: '8px',
    color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
    letterSpacing: '0.04em',
  }),
  btnGhost: (): React.CSSProperties => ({
    width: '100%', padding: '13px',
    backgroundColor: 'transparent', border: `1.5px solid ${C.border}`,
    borderRadius: '8px', color: C.sub, fontSize: '15px', fontWeight: 600, cursor: 'pointer',
  }),
};

function PlayerSlot({ index, player }: { index: number; player: LobbyPlayer | null }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
      backgroundColor: player ? C.panel : 'transparent',
      border: `1.5px ${player ? 'solid' : 'dashed'} ${player ? (player.isReady ? `${C.green}60` : C.border) : '#151530'}`,
      borderRadius: '10px', transition: 'all 0.2s',
    }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        backgroundColor: player ? C.purple : '#151530',
        border: `1.5px solid ${player ? C.purple : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 800, color: player ? '#fff' : C.muted,
        flexShrink: 0, fontFamily: 'monospace',
      }}>
        {index + 1}
      </div>
      {player ? (
        <>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: C.text, fontSize: '14px', fontWeight: 600 }}>
              {player.nickname}
            </span>
            {player.isHost && (
              <span style={{
                fontSize: '10px', fontWeight: 700, color: C.gold,
                backgroundColor: `${C.gold}18`, border: `1px solid ${C.gold}40`,
                borderRadius: '4px', padding: '1px 6px',
              }}>방장</span>
            )}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: player.isReady ? C.green : C.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: player.isReady ? C.green : C.muted }} />
            {player.isReady ? '준비' : '대기'}
          </div>
        </>
      ) : (
        <div style={{ flex: 1, color: C.muted, fontSize: '13px' }}>대기 중...</div>
      )}
    </div>
  );
}

export default function Lobby({ onGameStart }: LobbyProps) {
  const [phase, setPhase]         = useState<Phase>('landing');
  const [joinCode, setJoinCode]   = useState('');
  const [roomId, setRoomId]       = useState('');
  const [players, setPlayers]     = useState<LobbyPlayer[]>([]);
  const [isReady, setIsReady]     = useState(true); // 입장 시 자동 준비
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState('');
  const [connecting, setConnecting] = useState(false);

  const [myId] = useState<string>(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : `user-${Date.now()}`
  );

  const socketRef = useRef<Socket | null>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const currentRoomId = useRef('');

  // ── 소켓 이벤트 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const normalize = (ps: LobbyPlayer[]) =>
      ps.map(p => ({ ...p, id: p.id === socket.id ? myId : p.id }));

    socket.on('room_created', ({ roomId: rid, players: ps }) => {
      setRoomId(rid); currentRoomId.current = rid;
      setPlayers(normalize(ps));
      setPhase('waiting'); setConnecting(false);
    });
    socket.on('room_joined', ({ roomId: rid, players: ps }) => {
      setRoomId(rid); currentRoomId.current = rid;
      setPlayers(normalize(ps));
      setPhase('waiting'); setConnecting(false);
    });
    socket.on('player_joined',         ({ players: ps }) => setPlayers(normalize(ps)));
    socket.on('player_ready_changed',  ({ players: ps }) => setPlayers(normalize(ps)));
    socket.on('player_left',           ({ players: ps }) => setPlayers(normalize(ps)));

    socket.on('game_started', ({ players: ps, zoneIndex }: { players: LobbyPlayer[]; zoneIndex: number }) => {
      const me = ps[zoneIndex];
      onGameStart(currentRoomId.current, me?.nickname ?? `플레이어${zoneIndex + 1}`, myId, zoneIndex);
    });

    socket.on('room_not_found',       () => { setError('방을 찾을 수 없습니다'); setConnecting(false); });
    socket.on('room_full',            () => { setError('방이 가득 찼습니다 (4/4)'); setConnecting(false); });
    socket.on('game_already_started', () => { setError('이미 게임이 시작됐습니다'); setConnecting(false); });
    socket.on('connect_error',        () => { setError('서버 연결 실패'); setConnecting(false); });

    return () => {
      ['room_created','room_joined','player_joined','player_ready_changed',
       'player_left','game_started','room_not_found','room_full',
       'game_already_started','connect_error'].forEach(e => socket.off(e));
    };
  }, [myId, onGameStart]);

  // ── 핸들러 ──────────────────────────────────────────────────────────────────
  const handleCreateRoom = useCallback(() => {
    setConnecting(true); setError('');
    socketRef.current?.emit('create_room');
  }, []);

  const handleJoinRoom = useCallback(() => {
    if (joinCode.trim().length !== 6) { setError('방 코드는 6자리입니다'); return; }
    setConnecting(true); setError('');
    socketRef.current?.emit('join_room', { roomId: joinCode.trim().toUpperCase() });
  }, [joinCode]);

  const handleToggleReady = useCallback(() => {
    const next = !isReady;
    setIsReady(next);
    socketRef.current?.emit('toggle_ready');
  }, [isReady]);

  const handleCopyCode = useCallback(async () => {
    try { await navigator.clipboard.writeText(roomId); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* ignore */ }
  }, [roomId]);

  const handleLeave = useCallback(() => {
    socketRef.current?.emit('leave_room');
    setPhase('landing'); setPlayers([]); setIsReady(false); setRoomId(''); setError('');
  }, []);

  // ── 파생 상태 (핸들러보다 먼저) ────────────────────────────────────────────
  const me     = players.find(p => p.id === myId) ?? null;
  const isHost = me?.isHost ?? false;
  const slots: (LobbyPlayer | null)[] = [
    ...players, ...Array(Math.max(0, 4 - players.length)).fill(null),
  ];

  // 서버에서 host 여부 검증하므로 클라이언트 체크 불필요
  const handleStartGame = useCallback(() => {
    socketRef.current?.emit('start_game');
  }, []);

  const wrapper: React.CSSProperties = {
    width: '100vw', height: '100dvh', backgroundColor: C.bg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Segoe UI','Apple SD Gothic Neo',sans-serif",
  };
  const card: React.CSSProperties = {
    backgroundColor: C.card, border: `1.5px solid ${C.border}`,
    borderRadius: '16px', boxShadow: `0 0 80px rgba(99,102,241,0.08)`,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 랜딩
  // ═══════════════════════════════════════════════════════════════════════════
  if (phase === 'landing') {
    return (
      <div style={wrapper}>
        <div style={{ ...card, width: '380px', padding: '44px 36px' }}>
          {/* 타이틀 */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '44px', marginBottom: '10px' }}>⚔️</div>
            <div style={{ color: C.gold, fontSize: '32px', fontWeight: 900, letterSpacing: '0.12em', textShadow: `0 0 24px rgba(255,215,0,0.25)` }}>
              길란데
            </div>
            <div style={{ color: C.muted, fontSize: '12px', letterSpacing: '0.14em', marginTop: '6px', textTransform: 'uppercase' }}>
              4인 멀티플레이어
            </div>
          </div>

          {/* 방 만들기 */}
          <button
            style={{ ...styles.btnPrimary(), opacity: connecting ? 0.6 : 1, marginBottom: '16px' }}
            onClick={handleCreateRoom}
            disabled={connecting}
          >
            {connecting ? '연결 중...' : '🏰 방 만들기'}
          </button>

          {/* 구분선 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 16px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: C.border }} />
            <span style={{ color: C.muted, fontSize: '12px' }}>또는 코드 입력</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: C.border }} />
          </div>

          {/* 코드 입장 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={codeInputRef}
              style={{
                flex: 1, padding: '12px 14px',
                backgroundColor: C.bg, border: `1.5px solid ${C.border}`,
                borderRadius: '8px', color: C.text, fontSize: '18px',
                outline: 'none', textTransform: 'uppercase',
                textAlign: 'center', letterSpacing: '0.2em',
                fontFamily: 'monospace',
              }}
              placeholder="XXXXXX"
              value={joinCode}
              maxLength={6}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
            />
            <button
              style={{ ...styles.btnGhost(), width: 'auto', padding: '12px 20px', color: C.text, whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={handleJoinRoom}
              disabled={connecting}
            >
              입장
            </button>
          </div>

          {error && (
            <div style={{ color: C.red, fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>⚠ {error}</div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 대기실
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={wrapper}>
      <div style={{ ...card, width: '440px', padding: '36px' }}>

        {/* 방 코드 */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ color: C.muted, fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '14px' }}>
            방 코드
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              {roomId.split('').map((char, i) => (
                <div key={i} style={{
                  width: '44px', height: '52px', backgroundColor: C.panel,
                  border: `1.5px solid ${C.purple}50`, borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: 900, color: C.gold,
                  fontFamily: 'monospace', userSelect: 'none',
                }}>{char}</div>
              ))}
            </div>
            <button
              onClick={handleCopyCode}
              style={{
                background: 'none', border: `1.5px solid ${copied ? C.green : C.border}`,
                borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                color: copied ? C.green : C.sub, fontSize: '12px', fontWeight: 700,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {copied ? '✓ 복사됨' : '📋 복사'}
            </button>
          </div>
          <div style={{ color: C.muted, fontSize: '12px', marginTop: '10px' }}>
            이 코드를 친구에게 공유하세요
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '18px' }} />

        {/* 플레이어 슬롯 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
          {slots.map((player, i) => <PlayerSlot key={i} index={i} player={player} />)}
        </div>

        {/* 진행 바 */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
          {slots.map((player, i) => (
            <div key={i} style={{
              flex: 1, height: '3px', borderRadius: '2px',
              backgroundColor: player ? (player.isReady ? C.green : C.purple) : C.border,
              transition: 'background-color 0.3s',
            }} />
          ))}
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ ...styles.btnGhost(), flex: 1 }} onClick={handleLeave}>← 나가기</button>

          {isHost ? (
            <button
              style={{ ...styles.btnPrimary(), flex: 2, backgroundColor: C.green, color: '#000' }}
              onClick={handleStartGame}
            >
              {players.length < 4 ? `게임 시작 (${players.length}/4)` : '게임 시작 ▶'}
            </button>
          ) : (
            <button
              style={{
                flex: 2, padding: '13px',
                backgroundColor: isReady ? `${C.green}18` : C.purple,
                border: `1.5px solid ${isReady ? C.green : 'transparent'}`,
                borderRadius: '8px', color: isReady ? C.green : '#fff',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onClick={handleToggleReady}
            >
              {isReady ? '✓ 준비 완료 (취소)' : '준비'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}