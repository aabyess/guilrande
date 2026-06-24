'use client';

import { useEffect, useRef, MutableRefObject } from 'react';
import { getCombinationsForUnit, canCombine } from '../game/combinations/Combinations';

interface GameProps {
  onUnitSelect: (unit: any) => void;
  selectedUnit: any;
  allUnits: any[];
  onCamUpdate: (info: any) => void;
  camInfo: { x: number; y: number; w: number; h: number };
  moveCamRef: MutableRefObject<((x: number, y: number) => void) | null>;
  combineRef: MutableRefObject<((materials: string[]) => void) | null>;
  onUnitsUpdate: (units: any[]) => void;
}

interface Unit {
  name: string;
  emoji: string;
  color: string;
  hp: number;
  maxHp: number;
  damage: number;
  range: number;
  attackType: string;
  skillGauge: number;
}

export default function Game({
  onUnitSelect, selectedUnit, allUnits,
  onCamUpdate, camInfo, moveCamRef, combineRef, onUnitsUpdate
}: GameProps) {
  const gameRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0, inGame: false });

  useEffect(() => {
    if (gameRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const container = document.getElementById('game-container');
    const onMouseMove = (e: MouseEvent) => {
      const rect = container?.getBoundingClientRect();
      if (!rect) return;
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        inGame: (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        )
      };
    };
    window.addEventListener('mousemove', onMouseMove);

    const initGame = async () => {
      const Phaser = (await import('phaser')).default;
      const { createGameScene } = await import('../game/scenes/GameScene');
      const GameScene = createGameScene(
        Phaser, onUnitSelect, mouseRef,
        onCamUpdate, moveCamRef, combineRef, onUnitsUpdate
      );

      const w = window.innerWidth;
      const h = window.innerHeight - 220;

      const config: any = {
        type: Phaser.AUTO,
        width: w,
        height: h,
        backgroundColor: '#1a3a1a',
        parent: 'game-container',
        scene: GameScene,
      };

      gameRef.current = new Phaser.Game(config);
    };

    initGame();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', onMouseMove);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unit: Unit | null = selectedUnit;
  const combinations = unit ? getCombinationsForUnit(unit.name) : [];

  return (
    <div style={{ width: '100vw', height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: '#0f0f1e' }}>
      <div
        id="game-container"
        onContextMenu={(e) => e.preventDefault()}
        style={{ width: '100%', height: 'calc(100dvh - 220px)', flexShrink: 0 }}
      />

      {/* 하단 UI */}
      <div style={{
        width: '100%',
        height: '220px',
        backgroundColor: '#12122a',
        borderTop: '3px solid #6366f1',
        display: 'flex',
        fontFamily: 'sans-serif',
        flexShrink: 0,
      }}>
        {/* 왼쪽: 미니맵 */}
        <div style={{
          width: '240px',
          height: '100%',
          borderRight: '2px solid #4a4a6a',
          backgroundColor: '#0a0a1e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexShrink: 0,
        }}>
          <div style={{ color: '#74B9FF', fontSize: '13px', fontWeight: 'bold' }}>🗺️ 미니맵</div>
          <div
            style={{
              width: '190px',
              height: '160px',
              backgroundColor: '#2d5a27',
              border: '2px solid #4a4a6a',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const px = (e.clientX - rect.left) / rect.width;
              const py = (e.clientY - rect.top) / rect.height;
              moveCamRef.current?.(px * 2400, py * 1600);
            }}
          >
            <div style={{ position: 'absolute', left: '20%', top: '10%', width: '10px', height: '80%', backgroundColor: '#8B7355' }} />
            <div style={{ position: 'absolute', left: '20%', top: '10%', width: '70%', height: '10px', backgroundColor: '#8B7355' }} />
            <div style={{ position: 'absolute', right: '10%', top: '10%', width: '10px', height: '80%', backgroundColor: '#8B7355' }} />
            <div style={{ position: 'absolute', left: '20%', bottom: '10%', width: '70%', height: '10px', backgroundColor: '#8B7355' }} />
            <div style={{
              position: 'absolute',
              left: `${(camInfo.x / 2400) * 100}%`,
              top: `${(camInfo.y / 1600) * 100}%`,
              width: `${(camInfo.w / 2400) * 100}%`,
              height: `${(camInfo.h / 1600) * 100}%`,
              border: '2px solid #ffffff',
              backgroundColor: 'rgba(255,255,255,0.1)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* 가운데: 유닛 정보 */}
        <div style={{
          flex: 1,
          height: '100%',
          borderRight: '2px solid #4a4a6a',
          padding: '16px 28px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
        }}>
          {unit ? (
            <>
              <div style={{
                width: '110px', height: '110px',
                borderRadius: '50%',
                backgroundColor: unit.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '50px',
                border: '4px solid #ffffff',
                flexShrink: 0,
                boxShadow: `0 0 20px ${unit.color}88`,
              }}>
                {unit.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#FFD700', fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>
                  {unit.emoji} {unit.name}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '3px' }}>
                    ❤️ HP: {unit.hp} / {unit.maxHp}
                  </div>
                  <div style={{ width: '280px', height: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
                    <div style={{
                      width: `${(unit.hp / unit.maxHp) * 100}%`,
                      height: '100%', backgroundColor: '#ff4757',
                      borderRadius: '5px', transition: 'width 0.2s',
                    }} />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '3px' }}>
                    ✨ 스킬 게이지: {unit.skillGauge}%
                  </div>
                  <div style={{ width: '280px', height: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
                    <div style={{
                      width: `${unit.skillGauge}%`,
                      height: '100%', backgroundColor: '#00cfff',
                      borderRadius: '5px', transition: 'width 0.2s',
                    }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ color: '#ff6b6b', fontSize: '14px' }}>⚔️ 공격력: {unit.damage}</div>
                  <div style={{ color: '#74B9FF', fontSize: '14px' }}>🎯 사거리: {unit.range}</div>
                  <div style={{ color: '#a855f7', fontSize: '14px' }}>
                    🔰 타입: {unit.attackType === 'physical' ? '물리' : '마법'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: '#555', fontSize: '18px', margin: 'auto' }}>
              유닛을 클릭해서 선택하세요
            </div>
          )}
        </div>

        {/* 오른쪽: 스킬 + 조합 */}
        <div style={{
          width: '360px',
          height: '100%',
          padding: '12px 16px',
          display: 'flex',
          gap: '12px',
          flexShrink: 0,
        }}>
          {/* 스킬 */}
          <div style={{ width: '90px' }}>
            <div style={{ color: '#FFD700', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>⚡ 스킬</div>
            {unit ? (
              <div style={{
                width: '70px', height: '70px',
                backgroundColor: '#2d2d4e',
                border: '2px solid #6366f1',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ fontSize: '28px' }}>💥</div>
                <div style={{ color: '#aaa', fontSize: '10px' }}>폭발</div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0,
                  width: '100%',
                  height: `${100 - unit.skillGauge}%`,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  transition: 'height 0.2s',
                }} />
              </div>
            ) : <div style={{ color: '#444', fontSize: '12px' }}>-</div>}
          </div>

          {/* 조합 */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#FFD700', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>🧪 조합</div>
            {unit && combinations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {combinations.map((combo, i) => {
                  const possible = canCombine(combo, allUnits);
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (possible) combineRef.current?.(combo.materials);
                      }}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: possible ? '#1e3a1e' : '#1a1a2e',
                        border: `2px solid ${possible ? '#00ff88' : '#333'}`,
                        borderRadius: '8px',
                        cursor: possible ? 'pointer' : 'not-allowed',
                        opacity: possible ? 1 : 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '20px' }}>{combo.resultEmoji}</div>
                      <div>
                        <div style={{ color: possible ? '#00ff88' : '#aaa', fontSize: '12px', fontWeight: 'bold' }}>
                          {combo.result}
                        </div>
                        <div style={{ color: '#666', fontSize: '10px' }}>
                          {combo.materials.join(' + ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: '#444', fontSize: '12px' }}>
                {unit ? '조합 없음' : '-'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}