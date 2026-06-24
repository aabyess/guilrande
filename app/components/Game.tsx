'use client';

import { useEffect, useRef } from 'react';

export default function Game() {
  const gameRef = useRef<any>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const initGame = async () => {
      const Phaser = (await import('phaser')).default;
      const { createGameScene } = await import('../game/scenes/GameScene');

      const GameScene = createGameScene(Phaser);

      const config: any = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  backgroundColor: '#2d5a27',
  parent: 'game-container',
  scene: GameScene,
};

      gameRef.current = new Phaser.Game(config);
    };

    initGame();

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
  <div 
    id="game-container" 
    onContextMenu={(e) => e.preventDefault()}
  />
);
}