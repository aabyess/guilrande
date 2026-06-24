export interface UnitType {
  name: string;
  color: number;
  range: number;
  damage: number;
  fireRate: number;
  speed: number;
  skillGauge: number;
  emoji: string;
  attackType: 'physical' | 'magic';
  hp: number;
}

export const UNIT_TYPES: UnitType[] = [
  { name: '전사', color: 0x4ecdc4, range: 60, damage: 25, fireRate: 800, speed: 150, skillGauge: 100, emoji: '⚔️', attackType: 'physical', hp: 200 },
  { name: '궁수', color: 0xffe66d, range: 150, damage: 15, fireRate: 600, speed: 130, skillGauge: 100, emoji: '🏹', attackType: 'physical', hp: 120 },
  { name: '마법사', color: 0xa855f7, range: 120, damage: 35, fireRate: 1200, speed: 110, skillGauge: 100, emoji: '🔮', attackType: 'magic', hp: 100 },
  { name: '버서커', color: 0xff6b6b, range: 50, damage: 45, fireRate: 500, speed: 170, skillGauge: 100, emoji: '🪓', attackType: 'physical', hp: 150 },
];