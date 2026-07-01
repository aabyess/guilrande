'use client';

import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';

// ShopBuildings.tsx / GameLoop.tsx와 동일한 존 좌표 — 어긋나지 않게 유지
const ZONE_CENTERS: [number, number][] = [
  [-30, -30], [30, -30], [-30, 30], [30, 30],
];
const ZONE_HALF = 20.5;

/**
 * 상점과 같은 남쪽 벽 바깥 줄에, 상점 바로 오른쪽에 나란히 배치.
 * 본인 존만 클릭 가능 — ShopBuildings.tsx와 동일한 패턴.
 * 클릭하면 store의 activeShopPanel을 'upgrade'로 세팅 — 실제 패널은 ShopUpgradePanel.tsx(하단 UI)에서 렌더링.
 * GameCanvas.tsx의 <Canvas> 안에 <UpgradeBuildings /> 한 번만 추가하면 됨.
 */
export function UpgradeBuildings() {
  const myZoneIndex = useGameStore(s => s.zoneIndex);

  return (
    <>
      {ZONE_CENTERS.map((center, zi) => (
        <UpgradeMarker key={zi} center={center} isMine={zi === myZoneIndex} />
      ))}
    </>
  );
}

function UpgradeMarker({
  center,
  isMine,
}: {
  center: [number, number];
  isMine: boolean;
}) {
  const setActiveShopPanel = useGameStore(s => s.setActiveShopPanel);
  const [cx, cz] = center;

  const upgradeX = cx - 4;
  const upgradeZ = cz + ZONE_HALF + 6;

  return (
    <group position={[upgradeX, 0, upgradeZ]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (isMine) setActiveShopPanel('upgrade');
        }}
        onPointerOver={() => { if (isMine) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[4.5, 3.6, 4.5]} />
        <meshStandardMaterial
          color={isMine ? '#9b59b6' : '#555566'}
          opacity={isMine ? 1 : 0.55}
          transparent={!isMine}
        />
      </mesh>

      <Html position={[0, 3, 0]} center distanceFactor={18} occlude={false}>
        <div
          style={{
            color: isMine ? '#c77dff' : '#888',
            fontSize: '13px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textShadow: '0 0 4px #000',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {isMine ? '⬆️ 업그레이드소 (클릭)' : '⬆️ 업그레이드소'}
        </div>
      </Html>
    </group>
  );
}