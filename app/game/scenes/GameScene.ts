import React from 'react';
import { UNIT_TYPES, UnitType } from '../units/UnitTypes';
import { Enemy, createEnemy, createBoss, updateEnemy, destroyEnemy, calcDamage } from '../enemies/Enemy';
import { COMBINATIONS } from '../combinations/Combinations';

const MAP_W = 2400;
const MAP_H = 1600;

export function createGameScene(
  Phaser: any,
  onUnitSelect: (unit: any) => void,
  mouseRef: React.MutableRefObject<{ x: number; y: number; inGame: boolean }>,
  onCamUpdate: (info: any) => void,
  moveCamRef: React.MutableRefObject<((x: number, y: number) => void) | null>,
  combineRef: React.MutableRefObject<((materials: string[]) => void) | null>,
  onUnitsUpdate: (units: any[]) => void,
) {
  return class GameScene extends Phaser.Scene {
    private path!: any;
    private enemies: Enemy[] = [];
    private myUnits: any[] = [];
    private selectedUnits: any[] = [];
    private isDragging: boolean = false;
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private graphics!: any;
    private phase: 'prepare' | 'battle' = 'prepare';
    private prepareTime: number = 10;
    private prepareText!: any;
    private unitCountText!: any;
    private countdownText!: any;
    private roundText!: any;
    private roundTimerText!: any;
    private rollCountText!: any;
    private rollBtn!: any;
    private rollBtnText!: any;
    private isCountingDown: boolean = false;
    private countdown: number = 10;
    private countdownTimer: any = null;
    private gameOver: boolean = false;
    private round: number = 1;
    private roundTime: number = 60;
    private rollCount: number = 5;
    private totalSpawned: number = 0;
    private roundEnded: boolean = false;
    private spawnTimer: any = null;
    private roundTimerEvent: any = null;
    private cam!: any;
    private camSpeed: number = 8;
    private edgeSize: number = 40;

    constructor() {
      super({ key: 'GameScene' });
    }

    create() {
      this.graphics = this.add.graphics();
      this.cam = this.cameras.main;
      this.cam.setBounds(0, 0, MAP_W, MAP_H);
      this.cam.setScroll(MAP_W / 2 - this.scale.width / 2, MAP_H / 2 - this.scale.height / 2);

      this.path = new Phaser.Curves.Path(800, 400);
      this.path.lineTo(800, 1200);
      this.path.lineTo(1600, 1200);
      this.path.lineTo(1600, 400);
      this.path.lineTo(800, 400);

      // 미니맵 카메라 이동 콜백
      moveCamRef.current = (worldX: number, worldY: number) => {
        this.cam.setScroll(
          worldX - this.scale.width / 2,
          worldY - this.scale.height / 2
        );
      };

      // 조합 실행 콜백
      combineRef.current = (materials: string[]) => {
        const needed = [...materials];
        const toRemove: any[] = [];

        for (const unit of this.myUnits) {
          const idx = needed.indexOf(unit.type.name);
          if (idx !== -1) {
            needed.splice(idx, 1);
            toRemove.push(unit);
          }
        }

        if (needed.length > 0) return;

        const firstUnit = toRemove[0];
        const spawnX = firstUnit.x;
        const spawnY = firstUnit.y;

        toRemove.forEach(unit => {
          unit.obj.destroy();
          unit.label.destroy();
          unit.rangeCircle.destroy();
          unit.skillBar.destroy();
          unit.skillBg.destroy();
          this.myUnits.splice(this.myUnits.indexOf(unit), 1);
        });

        const combo = COMBINATIONS.find(c =>
          JSON.stringify([...c.materials].sort()) === JSON.stringify([...materials].sort())
        );
        if (!combo) return;

        const resultUnitType = UNIT_TYPES.find(t => t.name === combo.result);
        if (!resultUnitType) return;

        this.placeUnitAt(resultUnitType, spawnX, spawnY);
      };

      // UI
      this.prepareText = this.add.text(this.scale.width / 2, 30, '⏳ 준비 시간: 10초', {
        fontSize: '22px', color: '#FFD700', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(10).setScrollFactor(0);

      this.unitCountText = this.add.text(10, 10, '👾 적: 0/100', {
        fontSize: '18px', color: '#FF6B6B'
      }).setDepth(10).setScrollFactor(0);

      this.roundText = this.add.text(10, 35, '🌊 라운드: 1', {
        fontSize: '18px', color: '#74B9FF'
      }).setDepth(10).setScrollFactor(0);

      this.roundTimerText = this.add.text(10, 60, '⏱️ 60초', {
        fontSize: '18px', color: '#FFD700'
      }).setDepth(10).setScrollFactor(0);

      this.rollCountText = this.add.text(10, 85, '🎲 뽑기: 5회', {
        fontSize: '18px', color: '#00ff88'
      }).setDepth(10).setScrollFactor(0);

      this.countdownText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
        fontSize: '80px', color: '#FF0000', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(20).setScrollFactor(0);

      this.createRollPanel();

      this.input.on('pointerdown', (pointer: any) => {
        if (pointer.leftButtonDown()) {
          this.isDragging = true;
          this.dragStartX = pointer.x;
          this.dragStartY = pointer.y;
          this.selectedUnits.forEach(u => u.obj.setStrokeStyle(0));
          this.selectedUnits = [];
          onUnitSelect(null);
        }
        if (pointer.rightButtonDown() && this.selectedUnits.length > 0) {
          const worldX = pointer.x + this.cam.scrollX;
          const worldY = pointer.y + this.cam.scrollY;
          this.moveUnitsTo(worldX, worldY);
        }
      });

      this.input.on('pointerup', () => {
        if (this.isDragging) {
          this.isDragging = false;
          const pointer = this.input.activePointer;
          this.selectUnitsInRect(
            this.dragStartX, this.dragStartY,
            pointer.x, pointer.y
          );
        }
      });

      this.input.keyboard!.on('keydown-V', () => {
        if (this.selectedUnits.length === 0) return;
        const anchor = this.selectedUnits[0];
        const type = anchor.type.name;
        const sameType = this.myUnits.filter(u => u.type.name === type);

        this.selectedUnits.forEach(u => u.obj.setStrokeStyle(0));
        this.selectedUnits = sameType.slice(0, 12);
        this.selectedUnits.forEach(u => u.obj.setStrokeStyle(2, 0xffffff));

        sameType.forEach(unit => {
          unit.x = anchor.x;
          unit.y = anchor.y;
          unit.obj.setPosition(anchor.x, anchor.y);
          unit.label.setPosition(anchor.x, anchor.y - 22);
          unit.rangeCircle.setPosition(anchor.x, anchor.y);
          unit.skillBg.setPosition(anchor.x - 14, anchor.y + 20);
          unit.skillBar.setPosition(anchor.x - 14, anchor.y + 20);
        });
      });

      this.time.addEvent({
        delay: 1000,
        repeat: 9,
        callback: () => {
          this.prepareTime--;
          this.prepareText.setText(`⏳ 준비 시간: ${this.prepareTime}초`);
          if (this.prepareTime <= 0) this.startBattle();
        }
      });
    }

    createRollPanel() {
      this.rollBtn = this.add.rectangle(90, this.scale.height - 25, 160, 44, 0x4f46e5)
        .setInteractive().setDepth(10).setScrollFactor(0);
      this.rollBtnText = this.add.text(90, this.scale.height - 25, '🎲 유닛 소환', {
        fontSize: '16px', color: '#ffffff'
      }).setOrigin(0.5).setDepth(11).setScrollFactor(0);

      this.rollBtn.on('pointerdown', () => {
        if (this.rollCount <= 0) return;
        const type = UNIT_TYPES[Phaser.Math.Between(0, UNIT_TYPES.length - 1)];
        this.placeUnit(type);
        this.rollCount--;
      });
      this.rollBtn.on('pointerover', () => {
        if (this.rollCount > 0) this.rollBtn.setFillStyle(0x6366f1);
      });
      this.rollBtn.on('pointerout', () => {
        this.rollBtn.setFillStyle(this.rollCount > 0 ? 0x4f46e5 : 0x555555);
      });
    }

    placeUnit(type: UnitType) {
      this.placeUnitAt(type, MAP_W / 2, MAP_H / 2);
    }

    placeUnitAt(type: UnitType, x: number, y: number) {
      const circle = this.add.circle(x, y, 14, type.color).setInteractive().setDepth(5);
      const label = this.add.text(x, y - 22, type.emoji, { fontSize: '14px' }).setOrigin(0.5).setDepth(6);
      const rangeCircle = this.add.circle(x, y, type.range, type.color, 0.1).setDepth(3);
      const skillBg = this.add.rectangle(x - 14, y + 20, 28, 4, 0x333333).setOrigin(0, 0.5).setDepth(5);
      const skillBar = this.add.rectangle(x - 14, y + 20, 0, 4, 0x00ffff).setOrigin(0, 0.5).setDepth(6);

      const unit = {
        x, y, type,
        hp: type.hp, maxHp: type.hp,
        skillGauge: 0,
        obj: circle, label, rangeCircle, skillBar, skillBg,
        lastFired: 0,
      };

      this.myUnits.push(unit);
      onUnitsUpdate(this.myUnits.map(u => ({ type: u.type })));
    }

    selectUnitsInRect(x1: number, y1: number, x2: number, y2: number) {
      const wx1 = x1 + this.cam.scrollX;
      const wy1 = y1 + this.cam.scrollY;
      const wx2 = x2 + this.cam.scrollX;
      const wy2 = y2 + this.cam.scrollY;

      const minX = Math.min(wx1, wx2);
      const maxX = Math.max(wx1, wx2);
      const minY = Math.min(wy1, wy2);
      const maxY = Math.max(wy1, wy2);

      if (maxX - minX < 5 && maxY - minY < 5) {
        const clicked = this.myUnits.find(u =>
          Phaser.Math.Distance.Between(u.obj.x, u.obj.y, wx1, wy1) < 20
        );
        if (clicked) {
          this.selectedUnits = [clicked];
          clicked.obj.setStrokeStyle(2, 0xffffff);
          onUnitSelect({
            name: clicked.type.name,
            emoji: clicked.type.emoji,
            color: `#${clicked.type.color.toString(16).padStart(6, '0')}`,
            hp: Math.round(clicked.hp),
            maxHp: clicked.maxHp,
            damage: clicked.type.damage,
            range: clicked.type.range,
            attackType: clicked.type.attackType,
            skillGauge: Math.round(clicked.skillGauge),
          });
        }
        return;
      }

      this.selectedUnits = this.myUnits
        .filter(u => u.obj.x >= minX && u.obj.x <= maxX && u.obj.y >= minY && u.obj.y <= maxY)
        .slice(0, 12);
      this.selectedUnits.forEach(u => u.obj.setStrokeStyle(2, 0xffffff));

      if (this.selectedUnits.length === 1) {
        const u = this.selectedUnits[0];
        onUnitSelect({
          name: u.type.name,
          emoji: u.type.emoji,
          color: `#${u.type.color.toString(16).padStart(6, '0')}`,
          hp: Math.round(u.hp),
          maxHp: u.maxHp,
          damage: u.type.damage,
          range: u.type.range,
          attackType: u.type.attackType,
          skillGauge: Math.round(u.skillGauge),
        });
      }
    }

    moveUnitsTo(targetX: number, targetY: number) {
      const count = this.selectedUnits.length;
      const cols = Math.ceil(Math.sqrt(count));

      this.selectedUnits.forEach((unit, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const offsetX = (col - Math.floor(cols / 2)) * 35;
        const offsetY = (row - Math.floor(count / cols / 2)) * 35;
        this.moveUnitTo(unit, targetX + offsetX, targetY + offsetY);
      });
    }

    moveUnitTo(unit: any, x: number, y: number) {
      this.tweens.killTweensOf(unit.obj);
      unit.x = x;
      unit.y = y;

      this.tweens.add({
        targets: unit.obj,
        x, y,
        duration: 200,
        ease: 'Linear',
        onUpdate: () => {
          unit.label.setPosition(unit.obj.x, unit.obj.y - 22);
          unit.rangeCircle.setPosition(unit.obj.x, unit.obj.y);
          unit.skillBg.setPosition(unit.obj.x - 14, unit.obj.y + 20);
          unit.skillBar.setPosition(unit.obj.x - 14, unit.obj.y + 20);
        },
        onComplete: () => {
          unit.x = unit.obj.x;
          unit.y = unit.obj.y;
        }
      });
    }

    startBattle() {
      this.phase = 'battle';
      this.prepareText.setVisible(false);
      this.startRound();
    }

    startRound() {
      if (this.gameOver) return;
      this.roundEnded = false;
      this.totalSpawned = 0;
      this.roundTime = 60;
      this.roundText.setText(`🌊 라운드: ${this.round}`);

      this.spawnTimer?.remove();
      this.roundTimerEvent?.remove();
      this.spawnTimer = null;
      this.roundTimerEvent = null;

      if (this.round === 2) {
        this.time.delayedCall(3000, () => {
          if (this.roundEnded || this.gameOver) return;
          const boss = createBoss(this, this.round);
          this.enemies.push(boss);
        });
      }

      let spawnCount = 0;
      const spawnInterval = 60000 / 40;

      const doSpawn = () => {
        if (this.roundEnded || this.gameOver) return;
        if (spawnCount >= 40) return;
        const enemy = createEnemy(this, this.round);
        this.enemies.push(enemy);
        spawnCount++;
        this.totalSpawned++;
        if (spawnCount < 40) {
          this.spawnTimer = this.time.delayedCall(spawnInterval, doSpawn);
        }
      };
      this.spawnTimer = this.time.delayedCall(spawnInterval, doSpawn);

      let tickCount = 0;
      const doTick = () => {
        if (this.roundEnded || this.gameOver) return;
        tickCount++;
        this.roundTime = 60 - tickCount;
        this.roundTimerText.setText(`⏱️ ${this.roundTime}초`);
        if (this.roundTime <= 0) {
          this.endRound();
          return;
        }
        this.roundTimerEvent = this.time.delayedCall(1000, doTick);
      };
      this.roundTimerEvent = this.time.delayedCall(1000, doTick);
    }

    endRound() {
      if (this.roundEnded || this.gameOver) return;
      this.roundEnded = true;

      this.spawnTimer?.remove();
      this.roundTimerEvent?.remove();
      this.spawnTimer = null;
      this.roundTimerEvent = null;

      this.rollCount += 2;
      this.round++;

      this.time.delayedCall(1000, () => this.startRound());
    }

    startCountdown() {
      if (this.isCountingDown) return;
      this.isCountingDown = true;
      this.countdown = 10;
      this.countdownText.setText(`⚠️ ${this.countdown}`);

      this.countdownTimer = this.time.addEvent({
        delay: 1000,
        repeat: 9,
        callback: () => {
          this.countdown--;
          if (this.countdown <= 0) {
            if (this.enemies.length >= 100) this.endGame(false);
            else { this.countdownText.setText(''); this.isCountingDown = false; }
          } else {
            this.countdownText.setText(`⚠️ ${this.countdown}`);
          }
        }
      });
    }

    endGame(win: boolean) {
      if (this.gameOver) return;
      this.gameOver = true;
      this.spawnTimer?.remove();
      this.roundTimerEvent?.remove();
      this.scene.pause();
      this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 500, 150, 0x000000, 0.8)
        .setDepth(30).setScrollFactor(0);
      this.add.text(this.scale.width / 2, this.scale.height / 2, win ? '🎉 승리!' : '💀 GAME OVER', {
        fontSize: '64px', color: win ? '#FFD700' : '#FF0000', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(31).setScrollFactor(0);
    }

    useSkill(unit: any) {
      const skillCircle = this.add.circle(unit.x, unit.y, unit.type.range * 1.5, 0xffffff, 0.3).setDepth(8);
      this.tweens.add({
        targets: skillCircle, alpha: 0, duration: 400,
        onComplete: () => skillCircle.destroy()
      });

      const toRemove: number[] = [];
      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];
        const dist = Phaser.Math.Distance.Between(unit.x, unit.y, enemy.obj.x, enemy.obj.y);
        if (dist < unit.type.range * 1.5) {
          enemy.hp -= unit.type.damage * 3;
          if (enemy.hp <= 0) toRemove.push(i);
        }
      }
      for (const idx of toRemove.reverse()) {
        destroyEnemy(this.enemies[idx]);
        this.enemies.splice(idx, 1);
      }
    }

    update(time: number) {
      if (this.gameOver) return;

      const mouse = mouseRef.current;
      const w = this.scale.width;
      const h = this.scale.height;

      if (mouse.inGame) {
        if (mouse.x < this.edgeSize) this.cam.scrollX -= this.camSpeed;
        if (mouse.x > w - this.edgeSize) this.cam.scrollX += this.camSpeed;
        if (mouse.y < this.edgeSize) this.cam.scrollY -= this.camSpeed;
        if (mouse.y > h - this.edgeSize) this.cam.scrollY += this.camSpeed;
      }

      if (Math.floor(time / 16) % 4 === 0) {
        onCamUpdate({
          x: this.cam.scrollX,
          y: this.cam.scrollY,
          w: this.scale.width,
          h: this.scale.height,
        });
        onUnitsUpdate(this.myUnits.map(u => ({ type: u.type })));
      }

      this.graphics.clear();
      this.graphics.lineStyle(30, 0x8B7355);
      this.path.draw(this.graphics);

      if (this.isDragging) {
        const pointer = this.input.activePointer;
        this.graphics.lineStyle(1, 0xffffff, 0.8);
        this.graphics.strokeRect(
          this.dragStartX + this.cam.scrollX,
          this.dragStartY + this.cam.scrollY,
          pointer.x - this.dragStartX,
          pointer.y - this.dragStartY
        );
      }

      for (const enemy of this.enemies) {
        updateEnemy(enemy, this.path);
      }

      const toRemove = new Set<number>();

      for (const unit of this.myUnits) {
        if (time - unit.lastFired < unit.type.fireRate) continue;

        for (let ei = 0; ei < this.enemies.length; ei++) {
          if (toRemove.has(ei)) continue;
          const enemy = this.enemies[ei];
          const dist = Phaser.Math.Distance.Between(unit.x, unit.y, enemy.obj.x, enemy.obj.y);
          if (dist < unit.type.range) {
            enemy.hp -= calcDamage(unit.type.damage, unit.type.attackType, enemy);
            unit.lastFired = time;
            unit.skillGauge = Math.min(100, unit.skillGauge + 10);
            unit.skillBar.width = 28 * (unit.skillGauge / 100);

            const bullet = this.add.circle(unit.x, unit.y, 4, 0xffffff).setDepth(7);
            this.tweens.add({
              targets: bullet, x: enemy.obj.x, y: enemy.obj.y, duration: 120,
              onComplete: () => bullet.destroy()
            });

            if (unit.skillGauge >= 100) {
              unit.skillGauge = 0;
              unit.skillBar.width = 0;
              this.useSkill(unit);
            }

            if (enemy.hp <= 0) toRemove.add(ei);
            break;
          }
        }
      }

      Array.from(toRemove).sort((a, b) => b - a).forEach(idx => {
        const enemy = this.enemies[idx];
        if (enemy && enemy.obj) {
          destroyEnemy(enemy);
          this.enemies.splice(idx, 1);
        }
      });

      if (this.phase === 'battle') {
        if (this.enemies.length >= 100 && !this.isCountingDown) this.startCountdown();
        if (this.isCountingDown && this.enemies.length < 100) {
          this.countdownText.setText('');
          this.isCountingDown = false;
          this.countdownTimer?.remove();
        }
      }

      this.unitCountText.setText(`👾 적: ${this.enemies.length}/100`);
      this.rollCountText.setText(`🎲 뽑기: ${this.rollCount}회`);
      this.rollBtn.setFillStyle(this.rollCount > 0 ? 0x4f46e5 : 0x555555);
    }
  };
}