'use client';

import { Html } from '@react-three/drei';
import { useGameStore } from '../../store/useGameStore';

// GameLoop.tsx의 ZONE_CENTERS_MAP / ZONE_HALF와 동일한 값 — 좌표 어긋나지 않게 유지
const ZONE_CENTERS: [number, number][] = [
  [-30, -30], [30, -30], [-30, 30], [30, 30],
];
const ZONE_HALF = 20.5;

/**
 * 4개 존 전체에 상점 오브젝트를 배치. 각 존의 남쪽 벽 바로 바깥(업그레이드소 왼쪽)에 위치.
 * 본인 zoneIndex와 일치하는 상점만 클릭 가능, 다른 플레이어 상점은 보이기만 하고 클릭 막힘.
 * 클릭하면 3D 패널 대신 store의 activeShopPanel을 'shop'으로 세팅 — 실제 패널 UI는
 * ShopUpgradePanel.tsx가 하단 UI(일반 HTML) 영역에서 이 값을 구독해 렌더링함.
 * GameCanvas.tsx의 <Canvas> 안, <SkillEffects />와 같은 레벨에 <ShopBuildings /> 한 번만 넣으면 됨.
 */
export function ShopBuildings() {
  const myZoneIndex = useGameStore(s => s.zoneIndex);

  return (
    <>
      {ZONE_CENTERS.map((center, zi) => (
        <ShopMarker key={zi} center={center} isMine={zi === myZoneIndex} />
      ))}
    </>
  );
}

function ShopMarker({
  center,
  isMine,
}: {
  center: [number, number];
  isMine: boolean;
}) {
  const setActiveShopPanel = useGameStore(s => s.setActiveShopPanel);
  const [cx, cz] = center;

  const shopX = cx - 14;
  const shopZ = cz + ZONE_HALF + 6;

  return (
    <group position={[shopX, 0, shopZ]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (isMine) setActiveShopPanel('shop');
        }}
        onPointerOver={() => { if (isMine) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[4.5, 3.6, 4.5]} />
        <meshStandardMaterial
          color={isMine ? '#d4a017' : '#555566'}
          opacity={isMine ? 1 : 0.55}
          transparent={!isMine}
        />
      </mesh>

      <Html position={[0, 3, 0]} center distanceFactor={18} occlude={false}>
        <div
          style={{
            color: isMine ? '#FFD700' : '#888',
            fontSize: '13px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            textShadow: '0 0 4px #000',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {isMine ? '🏪 상점 (클릭)' : '🏪 상점'}
        </div>
      </Html>
    </group>
  );
}