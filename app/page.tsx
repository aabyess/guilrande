import { GameCanvas } from './components/game/GameCanvas';
import { BottomUI } from './components/ui/BottomUI';

export default function Home() {
  return (
    <main style={{
      width: '100vw', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      backgroundColor: '#0a1520', overflow: 'hidden',
    }}>
      <GameCanvas />
      <BottomUI />
    </main>
  );
}