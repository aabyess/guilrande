'use client';

import { useGameStore } from '../../store/useGameStore';
import { getCombinationsForUnit, canCombine } from '../../game/combinations/Combinations';
import { RARITY_LABEL } from '../../game/units/UnitTypes';

const RARITY_STYLE: Record<string, { bg: string; color: string }> = {
  common:    { bg: '#444',    color: '#aaaaaa' },
  uncommon:  { bg: '#0e6655', color: '#4ecdc4' },
  rare:      { bg: '#4a235a', color: '#c39bd3' },
  epic:      { bg: '#7d4f00', color: '#f39c12' },
  legendary: { bg: '#7b0000', color: '#ff4444' },
};

export function BottomUI() {
  const {
    phase, round, roundTime, rollCount, gameOver,
    units, enemies, selectedUnitIds,
    rollUnit, executeCombination, setPhase,
  } = useGameStore();

  const selectedUnit = selectedUnitIds.length === 1 ? (units.find(u => u.id === selectedUnitIds[0]) ?? null) : null;
  const combinations = selectedUnit ? getCombinationsForUnit(selectedUnit.type.name) : [];
  const allUnitInfos = units.map(u => ({ type: u.type }));

  const rarityStyle = selectedUnit
    ? RARITY_STYLE[selectedUnit.type.rarity] ?? RARITY_STYLE.common
    : null;

  return (
    <div style={{
      width: '100%', height: '240px',
      backgroundColor: '#12122a',
      borderTop: '3px solid #6366f1',
      display: 'flex',
      fontFamily: 'sans-serif',
      flexShrink: 0,
    }}>

      {/* 왼쪽: 게임 정보 + 뽑기 */}
      <div style={{
        width: '220px', height: '100%',
        borderRight: '2px solid #4a4a6a',
        backgroundColor: '#0a0a1e',
        display: 'flex', flexDirection: 'column',
        padding: '16px', gap: '8px',
        flexShrink: 0,
      }}>
        <div style={{ color: '#74B9FF', fontSize: '14px' }}>🌊 라운드: {round}</div>
        <div style={{ color: '#FFD700', fontSize: '14px' }}>⏱️ {phase === 'prepare' ? '준비 중' : `${roundTime}초`}</div>
        <div style={{ color: '#FF6B6B', fontSize: '14px' }}>👾 적: {enemies.length}/100</div>
        <div style={{ color: '#00ff88', fontSize: '14px' }}>🎲 뽑기: {rollCount}회</div>

        {gameOver && (
          <div style={{ color: '#ff0000', fontSize: '20px', fontWeight: 'bold', marginTop: '8px' }}>
            💀 GAME OVER
          </div>
        )}

        <button
          onClick={rollUnit}
          disabled={rollCount <= 0 || gameOver}
          style={{
            marginTop: 'auto',
            padding: '10px',
            backgroundColor: rollCount > 0 ? '#4f46e5' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: rollCount > 0 ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
          }}
        >
          🎲 유닛 소환
        </button>

        {phase === 'prepare' && (
          <button
            onClick={() => setPhase('battle')}
            style={{
              padding: '10px',
              backgroundColor: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ▶ 전투 시작
          </button>
        )}
      </div>

      {/* 가운데: 선택 유닛 정보 */}
      <div style={{
        flex: 1, height: '100%',
        borderRight: '2px solid #4a4a6a',
        padding: '16px 24px',
        display: 'flex', gap: '20px', alignItems: 'center',
      }}>
        {selectedUnit ? (
          <>
            {/* 유닛 아이콘 */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              backgroundColor: `#${selectedUnit.type.color.toString(16).padStart(6, '0')}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px', border: '4px solid #ffffff', flexShrink: 0,
            }}>
              {selectedUnit.type.emoji}
            </div>

            <div style={{ flex: 1 }}>
              {/* 이름 + 등급 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: '#FFD700', fontSize: '20px', fontWeight: 'bold' }}>
                  {selectedUnit.type.emoji} {selectedUnit.type.name}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 'bold', padding: '2px 8px',
                  borderRadius: '10px', border: '1px solid currentColor',
                  backgroundColor: rarityStyle!.bg, color: rarityStyle!.color,
                }}>
                  {RARITY_LABEL[selectedUnit.type.rarity] ?? selectedUnit.type.rarity}
                </span>
              </div>

              {/* HP */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '3px' }}>
                  ❤️ HP: {Math.round(selectedUnit.hp)} / {selectedUnit.maxHp}
                </div>
                <div style={{ width: '300px', height: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
                  <div style={{
                    width: `${(selectedUnit.hp / selectedUnit.maxHp) * 100}%`,
                    height: '100%', backgroundColor: '#ff4757', borderRadius: '5px',
                  }} />
                </div>
              </div>

              {/* 스킬 게이지 */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#aaa', fontSize: '14px', marginBottom: '3px' }}>
                  ✨ 스킬: {Math.round(selectedUnit.skillGauge)}%
                </div>
                <div style={{ width: '300px', height: '10px', backgroundColor: '#333', borderRadius: '5px' }}>
                  <div style={{
                    width: `${selectedUnit.skillGauge}%`,
                    height: '100%', backgroundColor: '#00cfff', borderRadius: '5px',
                  }} />
                </div>
              </div>

              {/* 스탯 */}
              <div style={{ display: 'flex', gap: '20px' }}>
                <span style={{ color: '#ff6b6b', fontSize: '14px' }}>⚔️ {selectedUnit.type.damage}</span>
                <span style={{ color: '#74B9FF', fontSize: '14px' }}>🎯 {selectedUnit.type.range}</span>
                <span style={{ color: '#a855f7', fontSize: '14px' }}>
                  🔰 {selectedUnit.type.attackType === 'physical' ? '물리' : '마법'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ color: '#555', fontSize: '18px', margin: 'auto' }}>
            유닛을 클릭해서 선택하세요
          </div>
        )}
      </div>

      {/* 오른쪽: 조합 패널 */}
      <div style={{
        width: '320px', height: '100%',
        padding: '16px',
        flexShrink: 0,
        overflowY: 'auto',
      }}>
        <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          🧪 조합
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
                  backgroundColor: possible ? '#1e3a1e' : '#1a1a2e',
                  border: `2px solid ${possible ? '#00ff88' : '#333'}`,
                  borderRadius: '8px',
                  cursor: possible ? 'pointer' : 'not-allowed',
                  opacity: possible ? 1 : 0.5,
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '22px' }}>{combo.resultEmoji}</span>
                <div>
                  <div style={{ color: possible ? '#00ff88' : '#aaa', fontSize: '13px', fontWeight: 'bold' }}>
                    {combo.result}
                  </div>
                  <div style={{ color: '#666', fontSize: '11px' }}>
                    {combo.materials.join(' + ')}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ color: '#444', fontSize: '13px' }}>
            {selectedUnit ? '조합 없음' : '-'}
          </div>
        )}
      </div>
    </div>
  );
}