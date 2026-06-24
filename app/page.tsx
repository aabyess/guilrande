'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

const Game = dynamic(() => import('./components/Game'), { ssr: false });

export default function Home() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [allUnits, setAllUnits] = useState<any[]>([]);
  const [camInfo, setCamInfo] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const moveCamRef = useRef<((x: number, y: number) => void) | null>(null);
  const combineRef = useRef<((materials: string[]) => void) | null>(null);

  const handleUnitSelect = useCallback((unit: any) => setSelectedUnit(unit), []);
  const handleCamUpdate = useCallback((info: any) => setCamInfo(info), []);
  const handleUnitsUpdate = useCallback((units: any[]) => setAllUnits(units), []);

  return (
    <main style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <Game
        onUnitSelect={handleUnitSelect}
        selectedUnit={selectedUnit}
        allUnits={allUnits}
        onCamUpdate={handleCamUpdate}
        camInfo={camInfo}
        moveCamRef={moveCamRef}
        combineRef={combineRef}
        onUnitsUpdate={handleUnitsUpdate}
      />
    </main>
  );
}