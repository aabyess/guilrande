'use client';

import { useGameStore } from '../../store/useGameStore';
import { getCombinationsForUnit, canCombine } from '../../game/combinations/Combinations';
import { RARITY_LABEL } from '../../game/units/UnitTypes';
import { useEffect, useRef, useCallback, useState } from 'react';import * as THREE from 'three';
import { getPathPosition } from '../../game/path/EnemyPath';

const MAP_W = 120;
const MAP_H = 220;
const MAP_Z_OFFSET = 40; // 스토리존 포함하도록 중심을 아래로 이동

const RARITY_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  common:    { bg: '#1a1a1a', border: '#666',    color: '#cccccc' },
  uncommon:  { bg: '#0a2a20', border: '#2ecc71', color: '#2ecc71' },
  rare:      { bg: '#2a1500', border: '#e67e22', color: '#f39c12' },  // 특별함 → 주황
  epic:      { bg: '#1a0a2e', border: '#9b59b6', color: '#c39bd3' },  // 희귀함 → 보라
  legendary: { bg: '#2a0000', border: '#e74c3c', color: '#ff6b6b' },
};

const WC_BORDER  = '#5a4a1a';
const WC_BORDER2 = '#8a7030';
const WC_BG      = '#0d0a04';
const WC_BG2     = '#1a1508';

// ─── 미니맵 ──────────────────────────────────────────────────
function MiniMap({
  cameraRef,
  orbitRef,
}: {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  orbitRef:  React.MutableRefObject<any>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number | null>(null);
  const PX = 200; const PY = 200;

  const toMini = useCallback((wx: number, wz: number) => ({
    x: ((wx + MAP_W / 2) / MAP_W) * PX,
    y: ((wz + MAP_H / 2 - MAP_Z_OFFSET) / MAP_H) * PY,
  }), []);

  const toWorld = useCallback((px: number, py: number) => ({
    x: (px / PX) * MAP_W - MAP_W / 2,
    z: (py / PY) * MAP_H - MAP_H / 2 + MAP_Z_OFFSET,
  }), []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !cameraRef.current || !orbitRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const { x: wx, z: wz } = toWorld(e.clientX - rect.left, e.clientY - rect.top);
    const cam = cameraRef.current as THREE.PerspectiveCamera;
    const ctrl = orbitRef.current;
    const ox = cam.position.x - ctrl.target.x;
    const oz = cam.position.z - ctrl.target.z;
    ctrl.target.set(wx, 0, wz);
    cam.position.set(wx + ox, cam.position.y, wz + oz);
    ctrl.update();
  }, [cameraRef, orbitRef, toWorld]);

  const pathPts = useCallback(() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const v = getPathPosition(i / 60);
      pts.push(toMini(v.x, v.z));
    }
    return pts;
  }, [toMini]);

  useEffect(() => {
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { units, enemies } = useGameStore.getState();

      ctx.clearRect(0, 0, PX, PY);
      ctx.fillStyle = '#0e1a08';
      ctx.fillRect(0, 0, PX, PY);

      // 4구역
      [{ cx: -30, cz: -30 }, { cx: 30, cz: -30 }, { cx: -30, cz: 30 }, { cx: 30, cz: 30 }]
        .forEach(({ cx, cz }) => {
          const a = toMini(cx - 22, cz - 22);
          const b = toMini(cx + 22, cz + 22);
          ctx.fillStyle = '#1e3510';
          ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
          const ua = toMini(cx - 16, cz - 16), ub = toMini(cx + 16, cz + 16);
          ctx.fillStyle = '#5a4820';
          ctx.fillRect(ua.x, ua.y, ub.x - ua.x, ub.y - ua.y);
          ctx.strokeStyle = '#8a7830';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
        });

      // 스토리존
      const sa = toMini(-22, 125), sb = toMini(22, 155);
      ctx.fillStyle = '#0e2208';
      ctx.fillRect(sa.x, sa.y, sb.x - sa.x, sb.y - sa.y);
      ctx.strokeStyle = '#3a6020';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(sa.x, sa.y, sb.x - sa.x, sb.y - sa.y);
      const sc = toMini(0, 140);
      ctx.fillStyle = '#aa44ff';
      ctx.beginPath(); ctx.arc(sc.x, sc.y, 3, 0, Math.PI * 2); ctx.fill();

      // 경로
      const pp = pathPts();
      if (pp.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pp[0].x, pp[0].y);
        pp.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = '#8a6a30';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // 카메라 뷰 사각형
      const cam = cameraRef.current as THREE.PerspectiveCamera | null;
      if (cam) {
        const ctrl = orbitRef.current;
        const tx = ctrl?.target?.x ?? cam.position.x;
        const tz = ctrl?.target?.z ?? cam.position.z;
        const camH  = Math.max(cam.position.y, 1);
        const fovRad = ((cam.fov ?? 45) * Math.PI) / 180;
        const aspect = cam.aspect ?? (window.innerWidth / window.innerHeight);
        const halfH  = Math.tan(fovRad / 2) * camH;
        const halfW  = halfH * aspect;
        const tl = toMini(tx - halfW, tz - halfH);
        const br = toMini(tx + halfW, tz + halfH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(tl.x, tl.y, Math.max(br.x - tl.x, 2), Math.max(br.y - tl.y, 2));
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(tl.x, tl.y, Math.max(br.x - tl.x, 2), Math.max(br.y - tl.y, 2));
      }

      // 유닛
      units.forEach(u => {
        const p = toMini(u.x, u.z);
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#44aaff'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.6; ctx.stroke();
      });

      // 적
      enemies.forEach(e => {
        const v = getPathPosition(e.t);
        const p = toMini(v.x, v.z);
        const r = e.isBoss ? 5 : 3;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = e.isBoss ? '#ff8800' : '#ff3333'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.6; ctx.stroke();
      });

      ctx.strokeStyle = '#6a5820';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, PX - 2, PY - 2);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={PX} height={PY}
      onClick={handleClick}
      style={{ display: 'block', imageRendering: 'pixelated', cursor: 'crosshair' }}
    />
  );
}

// ─── TopHUD ───────────────────────────────────────────────────
export function TopHUD() {
  const { phase, round, roundTime, rollCount, gameOver, enemies } = useGameStore();

  return (
    <div style={{
      position: 'fixed',
      top: 6, right: 6,
      zIndex: 30,
      pointerEvents: 'none',
      fontFamily: '"Dotum", "굴림", sans-serif',
    }}>
      <div style={{
        backgroundColor: 'rgba(8,6,2,0.92)',
        border: `2px solid ${WC_BORDER2}`,
        outline: `1px solid ${WC_BORDER}`,
        minWidth: '150px',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom, #3a2a08, #1a1204)',
          borderBottom: `1px solid ${WC_BORDER2}`,
          padding: '3px 8px',
          color: '#ffd060',
          fontSize: '12px',
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: '0 0 6px #ff8800',
        }}>
          ⚔ GuilRanDe
        </div>
        {[
          { label: '라운드', value: String(round), color: '#74B9FF' },
          { label: phase === 'prepare' ? '준비' : '전투', value: phase === 'prepare' ? '준비 중' : `${roundTime}초`, color: '#FFD700' },
          { label: '적',     value: `${enemies.length} / 100`, color: '#FF6B6B' },
          { label: '소환권', value: `${rollCount}회`, color: '#00ff88' },
        ].map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center',
            padding: '2px 8px',
            borderBottom: '1px solid #1a1508',
          }}>
            <span style={{ color: '#aa9060', fontSize: '11px', flex: 1 }}>{item.label}</span>
            <span style={{ color: item.color, fontSize: '12px', fontWeight: 'bold' }}>{item.value}</span>
          </div>
        ))}
      </div>
      {gameOver && (
        <div style={{
          marginTop: '6px',
          color: '#ff2222', fontSize: '22px', fontWeight: 'bold',
          textAlign: 'center', padding: '6px 14px',
          backgroundColor: '#1a0000',
          border: '2px solid #ff2222',
          textShadow: '0 0 10px #ff0000',
          pointerEvents: 'auto',
        }}>
          💀 GAME OVER
        </div>
      )}
    </div>
  );
}

// ─── BottomUI ────────────────────────────────────────────────
export function BottomUI({
  cameraRef,
  orbitRef,
  onEnemySelectRef,
}: {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  orbitRef:  React.MutableRefObject<any>;
  onEnemySelectRef?: React.MutableRefObject<((id: string) => void) | null>;
}) {
  const {
    phase, rollCount, specialRollCount, gameOver,
    units, enemies, selectedUnitIds,
    rollUnit, rollSpecial, executeCombination, setPhase, selectUnits,
  } = useGameStore();

  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  // enemies 배열에서 직접 derive — 죽으면 자동으로 null이 됨
  const selectedEnemy = selectedEnemyId
    ? (enemies.find(e => e.id === selectedEnemyId) ?? null)
    : null;

  const selectedUnit = selectedUnitIds.length === 1
    ? (units.find(u => u.id === selectedUnitIds[0]) ?? null)
    : null;
  const combinations = selectedUnit ? getCombinationsForUnit(selectedUnit.type.name) : [];
  const allUnitInfos = units.map(u => ({ type: u.type }));
  const rs = selectedUnit ? (RARITY_STYLE[selectedUnit.type.rarity] ?? RARITY_STYLE.common) : null;

  // 외부(EnemyMesh)에서 적 클릭 시 호출할 콜백 등록
  useEffect(() => {
    if (onEnemySelectRef) {
      onEnemySelectRef.current = (id: string) => {
        setSelectedEnemyId(id);
        selectUnits([]); // 유닛 선택 해제
      };
    }
    return () => { if (onEnemySelectRef) onEnemySelectRef.current = null; };
  }, [onEnemySelectRef, selectUnits]);

  const wcBtn = (active = true, color = '#c8a830'): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '54px', height: '54px',
    background: active
      ? 'linear-gradient(to bottom, #2a2008, #0e0c04)'
      : 'linear-gradient(to bottom, #1a1810, #0a0a08)',
    border: `2px solid ${active ? color : '#3a3020'}`,
    outline: `1px solid ${active ? '#4a3810' : '#1a1a10'}`,
    cursor: active ? 'pointer' : 'not-allowed',
    color: active ? color : '#4a4030',
    fontSize: '10px',
    fontFamily: '"Dotum", "굴림", sans-serif',
    gap: '2px',
    boxShadow: active ? 'inset 0 0 8px rgba(0,0,0,0.8), 0 0 4px rgba(0,0,0,0.5)' : 'none',
    userSelect: 'none',
  });

  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0,
      width: '100%',
      height: '260px',
      display: 'flex',
      fontFamily: '"Dotum", "굴림", sans-serif',
      zIndex: 10,
      backgroundColor: WC_BG,
      borderTop: `3px solid ${WC_BORDER2}`,
      outline: `1px solid ${WC_BORDER}`,
      boxShadow: '0 -6px 24px rgba(0,0,0,0.9)',
    }}>

      {/* ══ 왼쪽: 미니맵 ══════════════════════════════════════ */}
      <div style={{
        width: '216px',
        height: '100%',
        flexShrink: 0,
        backgroundColor: '#080602',
        borderRight: `2px solid ${WC_BORDER2}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '6px',
      }}>
        {/* 버튼 영역 */}
        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
          {/* 일반 소환 */}
          <button
            onClick={rollUnit}
            disabled={rollCount <= 0 || gameOver}
            style={{
              ...wcBtn(rollCount > 0 && !gameOver, '#a0c0ff'),
              flex: 1, width: 'auto', height: '28px',
              fontSize: '12px', fontWeight: 'bold',
            }}
          >
            🎲 소환 ({rollCount})
          </button>

          {/* 특별 소환 — 1회 한정, 쓰면 사라짐 */}
          {specialRollCount > 0 && (
            <button
              onClick={rollSpecial}
              disabled={gameOver}
              style={{
                ...wcBtn(!gameOver, '#ff8800'),
                flex: 1, width: 'auto', height: '28px',
                fontSize: '11px', fontWeight: 'bold',
                boxShadow: '0 0 8px rgba(255,136,0,0.5)',
              }}
            >
              ⭐ 특별 (1)
            </button>
          )}

          {/* 전투 시작 */}
          {phase === 'prepare' && (
            <button
              onClick={() => setPhase('battle')}
              style={{
                ...wcBtn(true, '#ff8844'),
                flex: 1, width: 'auto', height: '28px',
                fontSize: '12px', fontWeight: 'bold',
              }}
            >
              ▶ 전투
            </button>
          )}
        </div>

        {/* 미니맵 */}
        <div style={{
          border: `2px solid ${WC_BORDER2}`,
          outline: `1px solid ${WC_BORDER}`,
          lineHeight: 0,
        }}>
          <MiniMap cameraRef={cameraRef} orbitRef={orbitRef} />
        </div>
      </div>

      {/* ══ 가운데: 초상화 + 유닛 정보 ═══════════════════════ */}
      <div style={{
        flex: 1,
        height: '100%',
        borderRight: `2px solid ${WC_BORDER2}`,
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        backgroundColor: WC_BG2,
      }}>
        {selectedUnit && rs ? (
          <>
            {/* 초상화 */}
            <div style={{
              width: '120px', flexShrink: 0,
              background: `linear-gradient(to bottom, ${rs.bg}, #000)`,
              border: `2px solid ${rs.border}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              borderTop: 'none', borderLeft: 'none', borderBottom: 'none',
              position: 'relative',
            }}>
              <div style={{ fontSize: '64px', lineHeight: 1 }}>{selectedUnit.type.emoji}</div>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: `linear-gradient(to bottom, transparent, ${rs.bg})`,
                borderTop: `1px solid ${rs.border}`,
                color: rs.color,
                fontSize: '11px', fontWeight: 'bold',
                textAlign: 'center', padding: '3px 0',
                textShadow: `0 0 6px ${rs.border}`,
              }}>
                {RARITY_LABEL[selectedUnit.type.rarity] ?? selectedUnit.type.rarity}
              </div>
            </div>

            {/* 스탯 */}
            <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
              <div style={{
                color: '#FFD700', fontSize: '18px', fontWeight: 'bold',
                textShadow: '0 0 8px #aa8800',
                borderBottom: `1px solid ${WC_BORDER}`,
                paddingBottom: '6px',
              }}>
                {selectedUnit.type.name}
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#ff6b6b', fontSize: '12px' }}>❤ HP</span>
                  <span style={{ color: '#ccc', fontSize: '12px' }}>{Math.round(selectedUnit.hp)} / {selectedUnit.maxHp}</span>
                </div>
                <div style={{ height: '10px', background: '#1a0000', border: '1px solid #3a0808' }}>
                  <div style={{ width: `${(selectedUnit.hp / selectedUnit.maxHp) * 100}%`, height: '100%', background: 'linear-gradient(to right, #8b0000, #c0392b)' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#00cfff', fontSize: '12px' }}>✦ 스킬</span>
                  <span style={{ color: '#ccc', fontSize: '12px' }}>{Math.round(selectedUnit.skillGauge)}%</span>
                </div>
                <div style={{ height: '10px', background: '#000d1a', border: '1px solid #082840' }}>
                  <div style={{ width: `${selectedUnit.skillGauge}%`, height: '100%', background: 'linear-gradient(to right, #005080, #00aaff)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '2px' }}>
                <span style={{ color: '#ff9966', fontSize: '13px' }}>⚔ {selectedUnit.type.damage}</span>
                <span style={{ color: '#66aaff', fontSize: '13px' }}>◎ {selectedUnit.type.range}</span>
                <span style={{ color: '#cc88ff', fontSize: '13px' }}>
                  {selectedUnit.type.attackType === 'physical' ? '🗡 물리' : '🔮 마법'}
                </span>
              </div>
            </div>
          </>

        ) : selectedUnitIds.length > 1 ? (() => {
          const sel = units.filter(u => selectedUnitIds.includes(u.id));
          return (
            <div style={{ width: '100%', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ color: '#aa9060', fontSize: '11px' }}>{sel.length}개 유닛 선택</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {sel.map(u => {
                  const uRs = RARITY_STYLE[u.type.rarity] ?? RARITY_STYLE.common;
                  return (
                    <div
                      key={u.id}
                      title={u.type.name}
                      onClick={() => selectUnits([u.id])}
                      style={{
                        width: '52px', height: '52px',
                        background: `linear-gradient(to bottom, ${uRs.bg}, #000)`,
                        border: `2px solid ${uRs.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '26px', cursor: 'pointer', position: 'relative',
                      }}
                    >
                      {u.type.emoji}
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: '#111' }}>
                        <div style={{ width: `${(u.hp / u.maxHp) * 100}%`, height: '100%', background: u.hp > u.maxHp * 0.5 ? '#00cc55' : '#ff4444' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })() : (
          <div style={{ color: '#3a3020', fontSize: '14px', margin: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '6px', opacity: 0.4 }}>🖱</div>
            <div style={{ opacity: 0.4 }}>유닛을 클릭하여 선택</div>
          </div>
        )}
      </div>

      {/* ══ 조합 패널 ════════════════════════════════════════ */}
      <div style={{
        width: '280px',
        height: '100%',
        flexShrink: 0,
        borderRight: `2px solid ${WC_BORDER2}`,
        backgroundColor: WC_BG,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          background: 'linear-gradient(to bottom, #2a1e04, #120e02)',
          borderBottom: `1px solid ${WC_BORDER2}`,
          padding: '5px 10px',
          color: '#ffd060',
          fontSize: '12px',
          fontWeight: 'bold',
          flexShrink: 0,
          textShadow: '0 0 6px #aa7700',
        }}>
          🧪 조합 레시피
        </div>
        <div style={{
          flex: 1, padding: '8px', overflowY: 'auto',
          display: 'flex', flexWrap: 'wrap', gap: '6px', alignContent: 'flex-start',
        }}>
          {selectedUnit && combinations.length > 0 ? (
            combinations.map((combo, i) => {
              const possible = canCombine(combo, allUnitInfos);
              return (
                <div
                  key={i}
                  onClick={() => possible && executeCombination(combo.materials)}
                  title={`${combo.result}\n재료: ${combo.materials.join(' + ')}`}
                  style={{
                    width: '72px',
                    background: possible ? 'linear-gradient(to bottom, #1a2e10, #0a1606)' : 'linear-gradient(to bottom, #181410, #0c0a08)',
                    border: `2px solid ${possible ? '#3a7a20' : '#2a2010'}`,
                    outline: `1px solid ${possible ? '#2a5010' : '#181008'}`,
                    cursor: possible ? 'pointer' : 'default',
                    opacity: possible ? 1 : 0.45,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '6px 4px', gap: '3px', position: 'relative',
                    boxShadow: possible ? '0 0 6px rgba(60,160,30,0.3)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '28px', lineHeight: 1 }}>{combo.resultEmoji}</div>
                  <div style={{
                    color: possible ? '#88ff44' : '#5a5040',
                    fontSize: '10px', fontWeight: 'bold',
                    textAlign: 'center', lineHeight: 1.2, wordBreak: 'keep-all',
                  }}>
                    {combo.result}
                  </div>
                  {possible && (
                    <div style={{ position: 'absolute', top: 2, right: 3, color: '#88ff44', fontSize: '9px' }}>✔</div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ color: '#3a3020', fontSize: '12px', padding: '8px', width: '100%', textAlign: 'center' }}>
              {selectedUnit ? '조합 없음' : '유닛을 선택하세요'}
            </div>
          )}
        </div>
      </div>

      {/* ══ 오른쪽: 커맨드 버튼 ══════════════════════════════ */}
      <div style={{
        width: '180px',
        height: '100%',
        flexShrink: 0,
        backgroundColor: WC_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '10px',
      }}>
        <div style={{
          color: '#aa9060', fontSize: '11px', marginBottom: '2px',
          borderBottom: `1px solid ${WC_BORDER}`,
          width: '100%', textAlign: 'center', paddingBottom: '4px',
        }}>
          명령
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,54px)', gap: '4px' }}>
          <button title="공격 이동 (A)" style={wcBtn(true, '#ff8844')} onClick={() => {}}>
            <span style={{ fontSize: '20px' }}>⚔</span>
            <span>공격</span>
            <span style={{ fontSize: '9px', color: '#6a5030' }}>(A)</span>
          </button>
          <button title="정지 (S)" style={wcBtn(true, '#ccaa44')} onClick={() => {}}>
            <span style={{ fontSize: '20px' }}>🛑</span>
            <span>정지</span>
            <span style={{ fontSize: '9px', color: '#6a5030' }}>(S)</span>
          </button>
          <button title="같은 타입 모이기 (V)" style={wcBtn(true, '#44aaff')} onClick={() => useGameStore.getState().gatherSameType()}>
            <span style={{ fontSize: '20px' }}>🔵</span>
            <span>모이기</span>
            <span style={{ fontSize: '9px', color: '#304060' }}>(V)</span>
          </button>
        </div>
      </div>
    </div>
  );
}