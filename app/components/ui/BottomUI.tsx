'use client';

import { useGameStore } from '../../store/useGameStore';
import { getCombinationsForUnit, canCombine } from '../../game/combinations/Combinations';
import { RARITY_LABEL } from '../../game/units/UnitTypes';
import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { getPathPosition } from '../../game/path/EnemyPath';

// 맵 월드 사이즈
const MAP_W = 120;
const MAP_H = 120;

const RARITY_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  common:    { bg: '#1a1a1a', border: '#555',    color: '#cccccc' },
  uncommon:  { bg: '#0a2a20', border: '#2ecc71', color: '#2ecc71' },
  rare:      { bg: '#1a0a2e', border: '#9b59b6', color: '#c39bd3' },
  epic:      { bg: '#2a1500', border: '#e67e22', color: '#f39c12' },
  legendary: { bg: '#2a0000', border: '#e74c3c', color: '#ff6b6b' },
};

// ─── 미니맵 (순수 2D 탑뷰) ─────────────────────────────────
function MiniMap({
  cameraRef,
  orbitRef,
}: {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  orbitRef: React.MutableRefObject<any>;
}) {
  const { units, enemies } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  const PX = 220;
  const PY = 220;

  // 월드 → 미니맵 픽셀 (순수 탑뷰: x→px.x, z→px.y)
  const toMini = useCallback((wx: number, wz: number) => ({
    x: ((wx + MAP_W / 2) / MAP_W) * PX,
    y: ((wz + MAP_H / 2) / MAP_H) * PY,
  }), []);

  // 미니맵 픽셀 → 월드 XZ
  const toWorld = useCallback((px: number, py: number) => ({
    x: (px / PX) * MAP_W - MAP_W / 2,
    z: (py / PY) * MAP_H - MAP_H / 2,
  }), []);

  // 미니맵 클릭 → 카메라 이동
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !cameraRef.current || !orbitRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { x: wx, z: wz } = toWorld(px, py);

    const cam = cameraRef.current as THREE.PerspectiveCamera;
    const controls = orbitRef.current;
    // 카메라 높이 유지하면서 XZ만 이동
    const offsetX = cam.position.x - controls.target.x;
    const offsetZ = cam.position.z - controls.target.z;
    controls.target.set(wx, 0, wz);
    cam.position.set(wx + offsetX, cam.position.y, wz + offsetZ);
    controls.update();
  }, [cameraRef, orbitRef, toWorld]);

  // 경로 점 (60스텝)
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

      ctx.clearRect(0, 0, PX, PY);

      // ── 배경 (숲) ──
      ctx.fillStyle = '#1a3010';
      ctx.fillRect(0, 0, PX, PY);

      // ── 4개 구역 (밝은 녹색 사각형) ──
      const zoneColor = '#243d18';
      const zoneBorder = '#3a5a28';
      [
        { cx: -30, cz: -30 }, // 2사분면 (플레이어1)
        { cx:  30, cz: -30 }, // 1사분면
        { cx: -30, cz:  30 }, // 3사분면
        { cx:  30, cz:  30 }, // 4사분면
      ].forEach(({ cx, cz }) => {
        const a = toMini(cx - 22, cz - 22);
        const b = toMini(cx + 22, cz + 22);
        ctx.fillStyle = zoneColor;
        ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
        ctx.strokeStyle = zoneBorder;
        ctx.lineWidth = 1;
        ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
      });

      // ── 중앙 수로 (파란색 십자) ──
      ctx.fillStyle = '#0a2a4a';
      const hA = toMini(-MAP_W/2, -4), hB = toMini(MAP_W/2, 4);
      ctx.fillRect(hA.x, hA.y, hB.x - hA.x, hB.y - hA.y);
      const vA = toMini(-4, -MAP_H/2), vB = toMini(4, MAP_H/2);
      ctx.fillRect(vA.x, vA.y, vB.x - vA.x, vB.y - vA.y);

      // ── 유닛 배치 구역 (2사분면 플레이어1 구역 중앙) ──
      const uA = toMini(-30-16, -30-16), uB = toMini(-30+16, -30+16);
      ctx.fillStyle = 'rgba(80,160,60,0.25)';
      ctx.fillRect(uA.x, uA.y, uB.x - uA.x, uB.y - uA.y);
      ctx.strokeStyle = '#4a8a30';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(uA.x, uA.y, uB.x - uA.x, uB.y - uA.y);

      // ── 경로 ──
      const pp = pathPts();
      if (pp.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pp[0].x, pp[0].y);
        pp.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = '#b0a070';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // ── 카메라 시야 사각형 (순수 2D: target 중심, 높이로 크기 추산) ──
      const cam = cameraRef.current as THREE.PerspectiveCamera | null;
      const controls = orbitRef.current;
      if (cam && controls) {
        const target = controls.target as THREE.Vector3;
        const camH = cam.position.y; // 높이가 높을수록 시야 넓음
        // FOV + aspect 로 지면 가시 반경 추산
        const fovRad = (cam.fov ?? 45) * (Math.PI / 180);
        const aspect = cam.aspect ?? (window.innerWidth / window.innerHeight);
        const halfH = Math.tan(fovRad / 2) * camH;
        const halfW = halfH * aspect;

        const tl = toMini(target.x - halfW, target.z - halfH);
        const br = toMini(target.x + halfW, target.z + halfH);
        const rw = br.x - tl.x;
        const rh = br.y - tl.y;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(tl.x, tl.y, rw, rh);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(tl.x, tl.y, rw, rh);
      }

      // ── 유닛 (파란 점 + 외곽선) ──
      units.forEach(u => {
        const p = toMini(u.x, u.z);
        // 외곽 글로우
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(68,170,255,0.25)';
        ctx.fill();
        // 본체
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#44aaff';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // ── 적 (빨간 점 + 외곽선, 보스는 더 크게) ──
      enemies.forEach(e => {
        const v = getPathPosition(e.t);
        const p = toMini(v.x, v.z);
        const r = e.isBoss ? 5.5 : 3.5;
        // 외곽 글로우
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 2, 0, Math.PI * 2);
        ctx.fillStyle = e.isBoss ? 'rgba(255,136,0,0.3)' : 'rgba(255,51,51,0.25)';
        ctx.fill();
        // 본체
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = e.isBoss ? '#ff8800' : '#ff3333';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // ── 포탈 표시 (보라색 마름모) ──
      const portalMini = toMini(-30, -10);
      ctx.save();
      ctx.translate(portalMini.x, portalMini.y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#aa44ff';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();

      // ── 외곽 테두리 ──
      ctx.strokeStyle = '#5a8a40';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, PX - 2, PY - 2);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [units, enemies, toMini, pathPts]);

  return (
    <canvas
      ref={canvasRef}
      width={PX}
      height={PY}
      onClick={handleClick}
      style={{ display: 'block', imageRendering: 'pixelated', cursor: 'crosshair' }}
    />
  );
}

// ─── TopHUD ───────────────────────────────────────────────
export function TopHUD() {
  const { phase, round, roundTime, rollCount, gameOver, enemies } = useGameStore();

  return (
    <div style={{
      position: 'fixed',
      top: 8, right: 8,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      pointerEvents: 'none',
      fontFamily: '"Malgun Gothic", sans-serif',
    }}>
      {[
        { label: '라운드', value: String(round),                          color: '#74B9FF' },
        { label: phase === 'prepare' ? '준비' : '전투', value: phase === 'prepare' ? '준비 중' : `${roundTime}초`, color: '#FFD700' },
        { label: '적',     value: `${enemies.length} / 100`,             color: '#FF6B6B' },
        { label: '소환권', value: `${rollCount}회`,                       color: '#00ff88' },
      ].map(item => (
        <div key={item.label} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#0d0d1a',
          border: '1px solid #333',
          padding: '3px 8px',
          minWidth: '120px',
        }}>
          <span style={{ color: '#888', fontSize: '11px', flex: 1 }}>{item.label}</span>
          <span style={{ color: item.color, fontSize: '12px', fontWeight: 'bold' }}>{item.value}</span>
        </div>
      ))}
      {gameOver && (
        <div style={{
          color: '#ff0000', fontSize: '20px', fontWeight: 'bold',
          textAlign: 'center', padding: '6px 10px',
          backgroundColor: '#1a0000',
          border: '2px solid #ff0000',
          pointerEvents: 'auto',
        }}>
          💀 GAME OVER
        </div>
      )}
    </div>
  );
}

// ─── BottomUI (워크/원랜디 스타일, 불투명 패널) ─────────────
export function BottomUI({
  cameraRef,
  orbitRef,
}: {
  cameraRef: React.MutableRefObject<THREE.Camera | null>;
  orbitRef: React.MutableRefObject<any>;
}) {
  const {
    phase, rollCount, gameOver,
    units, selectedUnitIds,
    rollUnit, executeCombination, setPhase, selectUnits,
  } = useGameStore();

  const selectedUnit = selectedUnitIds.length === 1
    ? (units.find(u => u.id === selectedUnitIds[0]) ?? null)
    : null;
  const combinations = selectedUnit ? getCombinationsForUnit(selectedUnit.type.name) : [];
  const allUnitInfos = units.map(u => ({ type: u.type }));
  const rs = selectedUnit ? (RARITY_STYLE[selectedUnit.type.rarity] ?? RARITY_STYLE.common) : null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 0, left: 0,
      width: '100%',
      height: '300px',
      display: 'flex',
      fontFamily: '"Malgun Gothic", sans-serif',
      zIndex: 10,
      backgroundColor: '#0d0d1a',
      borderTop: '3px solid #2a2a4a',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.8)',
    }}>

      {/* ── 왼쪽: 미니맵 패널 ── */}
      <div style={{
        width: '248px',
        height: '100%',
        flexShrink: 0,
        backgroundColor: '#080810',
        borderRight: '2px solid #1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '8px',
      }}>
        {/* 소환/전투 버튼 — 미니맵 위 */}
        <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
          <button
            onClick={rollUnit}
            disabled={rollCount <= 0 || gameOver}
            style={{
              flex: 1, padding: '8px 0',
              backgroundColor: rollCount > 0 ? '#3730a3' : '#1a1a2e',
              color: rollCount > 0 ? '#c7d2fe' : '#444',
              border: `1px solid ${rollCount > 0 ? '#6366f1' : '#2a2a4a'}`,
              fontSize: '13px', fontWeight: 'bold',
              cursor: rollCount > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            🎲 소환
          </button>
          {phase === 'prepare' && (
            <button
              onClick={() => setPhase('battle')}
              style={{
                flex: 1, padding: '8px 0',
                backgroundColor: '#14532d',
                color: '#86efac',
                border: '1px solid #16a34a',
                fontSize: '13px', fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              ▶ 전투
            </button>
          )}
        </div>

        {/* 미니맵 */}
        <div style={{
          border: '2px solid #3a5a28',
          outline: '1px solid #1a2a10',
          lineHeight: 0,
        }}>
          <MiniMap cameraRef={cameraRef} orbitRef={orbitRef} />
        </div>
      </div>

      {/* ── 가운데: 유닛 정보 패널 ── */}
      <div style={{
        flex: 1,
        height: '100%',
        borderRight: '2px solid #1a1a2e',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        overflow: 'hidden',
      }}>
        {/* 단일 선택 */}
        {selectedUnit && rs ? (
          <>
            {/* 유닛 초상화 */}
            <div style={{
              width: '110px', height: '110px',
              backgroundColor: rs.bg,
              border: `3px solid ${rs.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '56px',
              flexShrink: 0,
              position: 'relative',
            }}>
              {selectedUnit.type.emoji}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                textAlign: 'center',
                backgroundColor: rs.bg,
                borderTop: `1px solid ${rs.border}`,
                color: rs.color,
                fontSize: '11px', fontWeight: 'bold',
                padding: '2px 0',
              }}>
                {RARITY_LABEL[selectedUnit.type.rarity] ?? selectedUnit.type.rarity}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#FFD700', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                {selectedUnit.type.name}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#ff6b6b', fontSize: '13px' }}>❤️ HP</span>
                  <span style={{ color: '#ccc', fontSize: '13px' }}>{Math.round(selectedUnit.hp)} / {selectedUnit.maxHp}</span>
                </div>
                <div style={{ height: '11px', backgroundColor: '#1a0a0a', border: '1px solid #3a1010' }}>
                  <div style={{ width: `${(selectedUnit.hp / selectedUnit.maxHp) * 100}%`, height: '100%', backgroundColor: '#c0392b' }} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ color: '#00cfff', fontSize: '13px' }}>✨ 스킬</span>
                  <span style={{ color: '#ccc', fontSize: '13px' }}>{Math.round(selectedUnit.skillGauge)}%</span>
                </div>
                <div style={{ height: '11px', backgroundColor: '#0a1a1a', border: '1px solid #103030' }}>
                  <div style={{ width: `${selectedUnit.skillGauge}%`, height: '100%', backgroundColor: '#0088aa' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '18px' }}>
                <span style={{ color: '#e74c3c', fontSize: '14px' }}>⚔ {selectedUnit.type.damage}</span>
                <span style={{ color: '#3498db', fontSize: '14px' }}>🎯 {selectedUnit.type.range}</span>
                <span style={{ color: '#9b59b6', fontSize: '14px' }}>
                  {selectedUnit.type.attackType === 'physical' ? '🗡 물리' : '🔮 마법'}
                </span>
              </div>
            </div>
          </>

        /* 다중 선택 — 워크래프트 초상화 그리드 */
        ) : selectedUnitIds.length > 1 ? (() => {
          const selectedUnits = units.filter(u => selectedUnitIds.includes(u.id));
          return (
            <div style={{ width: '100%' }}>
              {/* 선택 수 표시 */}
              <div style={{ color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>
                {selectedUnits.length}개 유닛 선택됨
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px',
                maxHeight: '220px',
                overflowY: 'auto',
              }}>
                {selectedUnits.map(u => {
                  const uRs = RARITY_STYLE[u.type.rarity] ?? RARITY_STYLE.common;
                  return (
                    <div
                      key={u.id}
                      title={u.type.name}
                      style={{
                        width: '58px', height: '58px',
                        backgroundColor: uRs.bg,
                        border: `2px solid ${uRs.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        position: 'relative',
                        boxSizing: 'border-box',
                      }}
                      onClick={() => selectUnits([u.id])}
                    >
                      {u.type.emoji}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: '5px', backgroundColor: '#111',
                      }}>
                        <div style={{
                          width: `${(u.hp / u.maxHp) * 100}%`,
                          height: '100%',
                          backgroundColor: u.hp > u.maxHp * 0.5 ? '#00e676' : '#ff4757',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ color: '#444', fontSize: '11px', marginTop: '5px' }}>
                초상화 클릭 시 단독 선택
              </div>
            </div>
          );
        })() : (
          <div style={{ color: '#333', fontSize: '16px', margin: 'auto', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🖱️</div>
            유닛을 클릭하여 선택
          </div>
        )}
      </div>

      {/* ── 오른쪽: 조합 패널 ── */}
      <div style={{
        width: '320px',
        height: '100%',
        flexShrink: 0,
        padding: '12px',
        overflowY: 'auto',
      }}>
        <div style={{
          color: '#FFD700', fontSize: '14px', fontWeight: 'bold',
          marginBottom: '8px', borderBottom: '1px solid #2a2a3a',
          paddingBottom: '5px',
        }}>
          🧪 조합 레시피
        </div>

        {selectedUnit && combinations.length > 0 ? (
          combinations.map((combo, i) => {
            const possible = canCombine(combo, allUnitInfos);
            return (
              <div
                key={i}
                onClick={() => possible && executeCombination(combo.materials)}
                style={{
                  padding: '8px 12px', marginBottom: '6px',
                  backgroundColor: possible ? '#0a1f0a' : '#111118',
                  border: `1px solid ${possible ? '#2ecc71' : '#2a2a3a'}`,
                  cursor: possible ? 'pointer' : 'default',
                  opacity: possible ? 1 : 0.45,
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{combo.resultEmoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: possible ? '#2ecc71' : '#888', fontSize: '14px', fontWeight: 'bold' }}>
                    {combo.result}
                  </div>
                  <div style={{ color: '#666', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                    {combo.materials.join(' + ')}
                  </div>
                </div>
                {possible && <span style={{ color: '#2ecc71', fontSize: '18px' }}>▶</span>}
              </div>
            );
          })
        ) : (
          <div style={{ color: '#2a2a3a', fontSize: '13px', paddingTop: '8px' }}>
            {selectedUnit ? '조합 없음' : '유닛을 선택하세요'}
          </div>
        )}
      </div>
    </div>
  );
}