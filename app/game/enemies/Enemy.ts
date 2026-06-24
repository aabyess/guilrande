export interface Enemy {
  t: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  armor: number;       // 물리 방어력
  magicResist: number; // 마법 방어력
  stunned: boolean;
  obj: any;
  hpBar: any;
}

export function createEnemy(scene: any, wave: number): Enemy {
  return {
    t: 0,
    hp: 80 + wave * 30,
    maxHp: 80 + wave * 30,
    speed: 0.00025,
    baseSpeed: 0.00025,
    armor: 5 + wave * 2,        // 라운드마다 방어력 증가
    magicResist: 3 + wave * 2,  // 라운드마다 마법저항 증가
    stunned: false,
    obj: scene.add.circle(250, 120, 11, 0xFF4757).setDepth(4),
    hpBar: scene.add.rectangle(0, 0, 22, 3, 0x00ff00).setDepth(5),
  };
}

export function calcDamage(damage: number, attackType: 'physical' | 'magic', enemy: Enemy): number {
  if (attackType === 'physical') {
    return Math.max(1, damage - enemy.armor);
  } else {
    return Math.max(1, damage - enemy.magicResist);
  }
}

export function updateEnemy(enemy: Enemy, path: any) {
  if (!enemy.stunned) {
    enemy.t += enemy.speed;
    if (enemy.t >= 1) enemy.t -= 1;
  }

  const pos = path.getPoint(enemy.t);
  if (!pos) return;

  enemy.obj.setPosition(pos.x, pos.y);
  enemy.hpBar.setPosition(pos.x, pos.y - 18);
  enemy.hpBar.width = 22 * (enemy.hp / enemy.maxHp);
  enemy.hpBar.fillColor = enemy.hp > 50 ? 0x00ff00 : 0xff4444;
}

export function destroyEnemy(enemy: Enemy) {
  enemy.obj.destroy();
  enemy.hpBar.destroy();
}

export function createBoss(scene: any, wave: number): Enemy {
  return {
    t: 0,
    hp: 500 + wave * 100,
    maxHp: 500 + wave * 100,
    speed: 0.00012,
    baseSpeed: 0.00012,
    armor: 20 + wave * 5,
    magicResist: 15 + wave * 5,
    stunned: false,
    obj: scene.add.circle(250, 120, 22, 0xFF0000).setDepth(4), // 크기 22
    hpBar: scene.add.rectangle(0, 0, 44, 6, 0x00ff00).setDepth(5), // HP바도 크게
  };
}