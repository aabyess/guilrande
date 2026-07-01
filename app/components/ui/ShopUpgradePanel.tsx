'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';

const WOOD_TIERS: { key: 'special' | 'rare' | 'legendary'; label: string; rate: string; cost: number; color: string }[] = [
  { key: 'special',   label: '특별함', rate: '80%', cost: 1, color: '#4ecdc4' },
  { key: 'rare',      label: '희귀함', rate: '60%', cost: 2, color: '#a855f7' },
  { key: 'legendary', label: '전설',   rate: '40%', cost: 3, color: '#ffd700' },
];

/**
 * 상점/업그레이드소 건물을 3D에서 클릭하면 store.activeShopPanel이 'shop' | 'upgrade'로 바뀌고
 * 이 컴포넌트가 그걸 구독해서 하단 UI 가운데 영역에 패널을 띄움.
 * 부모 레이아웃(예: Game.tsx)의 "명령/조합 레시피"가 있는 하단 UI 영역 안에
 * <ShopUpgradePanel /> 한 번만 넣어주면 됨. activeShopPanel이 null이면 아무것도 렌더링 안 함.
 */
export function ShopUpgradePanel() {
  const activeShopPanel = useGameStore(s => s.activeShopPanel);

  if (activeShopPanel === 'shop') return <ShopPanelContent />;
  if (activeShopPanel === 'upgrade') return <UpgradePanelContent />;
  return null;
}

function PanelShell({
  title,
  icon,
  accentColor,
  onClose,
  children,
}: {
  title: string;
  icon: string;
  accentColor: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // mousedown으로 등록 — 패널을 여는 그 클릭(3D 건물 클릭)과 같은 click 이벤트에 걸려
    // 열리자마자 바로 닫혀버리는 걸 방지
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a2e',
        border: `2px solid ${accentColor}`,
        borderRadius: '10px',
        padding: '12px 16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
        <div style={{ color: accentColor, fontSize: '15px', fontWeight: 'bold' }}>{icon} {title}</div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

function ShopPanelContent() {
  const gold = useGameStore(s => s.gold);
  const wood = useGameStore(s => s.wood);
  const gambleGold = useGameStore(s => s.gambleGold);
  const rollWoodGacha = useGameStore(s => s.rollWoodGacha);
  const setActiveShopPanel = useGameStore(s => s.setActiveShopPanel);

  const [message, setMessage] = useState<string | null>(null);
  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2200);
  };

  const handleGamble = () => {
    const result = gambleGold();
    if (!result) { showMessage('❌ 골드가 부족합니다 (10원 필요)'); return; }
    const diff = result.won - result.spent;
    showMessage(
      diff >= 0
        ? `🎉 ${result.spent}원 베팅 → ${result.won}원 획득! (+${diff})`
        : `💸 ${result.spent}원 베팅 → ${result.won}원 획득... (${diff})`
    );
  };

  const handleWoodRoll = (tier: 'special' | 'rare' | 'legendary', cost: number) => {
    const result = rollWoodGacha(tier);
    if (!result.ok) {
      if (result.reason === 'insufficient_wood') {
        showMessage(`❌ 목재가 부족합니다 (${cost}개 필요)`);
      } else {
        showMessage('💨 꽝! 아무것도 못 얻었습니다...');
      }
      return;
    }
    const unit = result.unit!;
    showMessage(`✨ ${unit.emoji ?? ''} ${unit.name} (${unit.rarity}) 획득!`);
  };

  return (
    <PanelShell title="상점" icon="🏪" accentColor="#FFD700" onClose={() => setActiveShopPanel(null)}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '13px', flexShrink: 0 }}>
        <div style={{ color: '#ffd700' }}>💰 {gold}원</div>
        <div style={{ color: '#a3e635' }}>🪵 {wood}개</div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: 0 }}>
        {/* 도박소 */}
        <div style={{
          flex: '0 0 30%', display: 'flex', flexDirection: 'column',
          border: '2px solid #74B9FF', borderRadius: '8px', padding: '10px',
          backgroundColor: '#16213e', justifyContent: 'center', gap: '8px',
        }}>
          <div style={{ color: '#74B9FF', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>
            🎰 도박소
          </div>
          <div style={{ color: '#888', fontSize: '10px', textAlign: 'center' }}>
            10원 베팅 → 0~50원 랜덤
          </div>
          <button
            onClick={handleGamble}
            style={{
              padding: '8px', borderRadius: '6px',
              border: '2px solid #74B9FF', backgroundColor: '#0f0f1e',
              color: '#74B9FF', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
            }}
          >
            10원 도박하기
          </button>
        </div>

        {/* 목재 뽑기 3종 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ color: '#a3e635', fontSize: '11px', fontWeight: 'bold' }}>
            🪵 다른세계의 유닛 도박
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '6px' }}>
            {WOOD_TIERS.map(t => (
              <button
                key={t.key}
                onClick={() => handleWoodRoll(t.key, t.cost)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '4px', borderRadius: '8px',
                  border: `2px solid ${t.color}`, backgroundColor: '#16213e',
                  color: t.color, fontWeight: 'bold', cursor: 'pointer', fontSize: '12px',
                }}
              >
                <span>{t.label}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>({t.rate})</span>
                <span>🪵 {t.cost}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: '20px', flexShrink: 0, marginTop: '6px' }}>
        {message && (
          <div style={{
            padding: '4px 8px', borderRadius: '6px',
            backgroundColor: '#0f0f1e', color: '#fff', fontSize: '11px', textAlign: 'center',
          }}>
            {message}
          </div>
        )}
      </div>
    </PanelShell>
  );
}

const BULK_UPGRADE_TIERS: { key: 'rare' | 'epic' | 'legendary' | 'transcendent' | 'hidden'; label: string; sourceLabel: string; color: string }[] = [
  { key: 'rare',         label: '특별함', sourceLabel: '흔함+안흔함 → 특별함', color: '#4ecdc4' },
  { key: 'epic',         label: '희귀함', sourceLabel: '특별함 → 희귀함',     color: '#a855f7' },
  { key: 'legendary',    label: '전설',   sourceLabel: '희귀함 → 전설',       color: '#ffd700' },
  { key: 'transcendent', label: '초월',   sourceLabel: '전설 → 초월',         color: '#ff6b9d' },
  { key: 'hidden',       label: '불멸',   sourceLabel: '초월 → 불멸',         color: '#5eead4' },
];

function UpgradePanelContent() {
  const gold = useGameStore(s => s.gold);
  const units = useGameStore(s => s.units);
  const getBulkUpgradeInfo = useGameStore(s => s.getBulkUpgradeInfo);
  const bulkUpgradeTier = useGameStore(s => s.bulkUpgradeTier);
  const setActiveShopPanel = useGameStore(s => s.setActiveShopPanel);

  const [message, setMessage] = useState<string | null>(null);
  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2200);
  };

  const handleBulkUpgrade = (tier: 'rare' | 'epic' | 'legendary' | 'transcendent' | 'hidden', label: string) => {
    const result = bulkUpgradeTier(tier);
    if (result.success) {
      showMessage(`✨ ${label} 일괄 업그레이드! ${result.count}기 적용 (-${result.cost}원)`);
    } else {
      showMessage(`❌ ${result.reason ?? '업그레이드 실패'}`);
    }
  };

  return (
    <PanelShell title="업그레이드소" icon="⬆️" accentColor="#c77dff" onClose={() => setActiveShopPanel(null)}>
      <div style={{ color: '#ffd700', fontSize: '13px', marginBottom: '8px', flexShrink: 0 }}>💰 {gold}원</div>

      <div style={{ display: 'flex', gap: '8px', flex: 1, minHeight: 0 }}>
        {BULK_UPGRADE_TIERS.map(t => {
            const info = getBulkUpgradeInfo(t.key);
            const disabled = info.count === 0 || gold < info.totalCost || info.usesLeft <= 0;
            return (
              <button
                key={t.key}
                disabled={disabled}
                onClick={() => handleBulkUpgrade(t.key, t.label)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '4px', borderRadius: '8px', padding: '6px 4px',
                  border: `2px solid ${t.color}`,
                  backgroundColor: disabled ? '#1a1a2a' : '#16213e',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: info.count === 0 || info.usesLeft <= 0 ? 0.45 : 1,
                }}
              >
                <div style={{ color: t.color, fontWeight: 'bold', fontSize: '12px' }}>{t.label}</div>
                <div style={{ color: '#888', fontSize: '9px', textAlign: 'center', lineHeight: 1.3 }}>{t.sourceLabel}</div>
                <div style={{ color: '#aaa', fontSize: '10px' }}>대상 {info.count}기</div>
                <div style={{ color: '#aaa', fontSize: '10px' }}>{info.usesLeft}/10회</div>
                <div style={{ color: gold < info.totalCost ? '#ff6666' : '#ffd700', fontWeight: 'bold', fontSize: '12px' }}>
                  {info.usesLeft <= 0 ? '소진' : `🪙${info.totalCost}`}
                </div>
              </button>
            );
          })}
        </div>

      <div style={{ height: '20px', flexShrink: 0, marginTop: '6px' }}>
        {message && (
          <div style={{
            padding: '4px 8px', borderRadius: '6px',
            backgroundColor: '#0f0f1e', color: '#fff', fontSize: '11px', textAlign: 'center',
          }}>
            {message}
          </div>
        )}
      </div>
    </PanelShell>
  );
}