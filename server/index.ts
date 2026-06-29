import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const TICK_RATE         = 20;
const TICK_MS           = 1000 / TICK_RATE;
const FRAME_MULT        = 60 / TICK_RATE;
const ENEMIES_PER_ROUND = 40;
const SPAWN_WINDOW_SEC  = 30;
const BOSS_ROUNDS       = new Set([10, 20, 30, 40, 50, 60]);

// ─── 타입 ─────────────────────────────────────────────────────────────────────

interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
}

interface ServerEnemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  t: number;
  speed: number;
  armor: number;
  magicResist: number;
  isBoss: boolean;
  zoneIndex: number;      // 어느 존 경로를 따라가는지
}

interface RoomGameState {
  gamePhase: 'prepare' | 'battle';
  round: number;
  roundTime: number;
  prepareTime: number;
  enemies: ServerEnemy[];
  eid: number;
  spawnCount: number;
  totalTicks: number;
  lastSpawnTick: number;
  roundStartTick: number;
  zoneCount: number;       // 게임 시작 시 플레이어 수 (존 수)
  deadZones: Set<number>;  // 게임오버된 존
}

interface Room {
  id: string;
  players: Player[];
  phase: 'waiting' | 'playing';
  gameState: RoomGameState | null;
  gameInterval: ReturnType<typeof setInterval> | null;
}

// ─── 이름 테이블 ──────────────────────────────────────────────────────────────

const ROUND_ENEMY_NAMES: Record<number, string> = {
  1:'박진웅', 2:'김갑식', 3:'반항아이승우', 4:'배병욱', 5:'왕승환',
  6:'이재윤', 7:'인홍진', 8:'문필환', 9:'김민준(안경)',
  11:'주영호', 12:'김정래', 13:'박예원', 14:'조도연', 15:'이상혁',
  16:'유재헌', 17:'이하림', 18:'문채홍', 19:'박기찬',
  21:'박은석', 22:'박도진', 23:'이호준', 24:'구주호', 25:'최준우',
  26:'이정범', 27:'임채준', 28:'신림초패거리', 29:'송형성',
  31:'김만경', 32:'장명자', 33:'어철승', 34:'이수은', 35:'장하민',
  36:'서승혁', 37:'최혜륜', 38:'조성진', 39:'선효진',
  41:'고어진', 42:'김용태', 43:'엄태웅', 44:'유시은', 45:'양문호',
  46:'강민호', 47:'이현빈', 48:'노수신', 49:'정다희',
  51:'진연서', 52:'이현주', 53:'이태훈', 54:'최수지', 55:'임준성',
  56:'이진수', 57:'지성현', 58:'박병규', 59:'박찬형',
};

const BOSS_NAMES: Record<number, string> = {
  10: '레벨 보스 — 초등학교 저학년 (박민수)',
  20: '레벨 보스 — 초등학교 고학년 (박은석)',
  30: '레벨 보스 — 중학교 저학년 (박민수)',
  40: '레벨 보스 — 중학교 고학년 (김용태)',
  50: '레벨 보스 — 고등학교 저학년 (이태훈)',
  60: '레벨 보스 — 고등학교 고학년 (정윤식)',
};

// ─── 상태 ─────────────────────────────────────────────────────────────────────

const rooms = new Map<string, Room>();

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return rooms.has(code) ? generateRoomId() : code;
}

function findRoomBySocket(socketId: string): Room | null {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socketId)) return room;
  }
  return null;
}

function removePlayer(room: Room, socketId: string): void {
  room.players = room.players.filter(p => p.id !== socketId);
  if (room.players.length > 0 && !room.players.some(p => p.isHost)) {
    room.players[0].isHost = true;
  }
}

// ─── 게임 로직 ────────────────────────────────────────────────────────────────

function spawnEnemyForZone(gs: RoomGameState, zoneIndex: number): void {
  const name = ROUND_ENEMY_NAMES[gs.round] ?? `적 ${gs.round}라운드`;
  gs.enemies.push({
    id: `e${gs.eid++}`,
    name,
    hp:          160 + gs.round * 60,
    maxHp:       160 + gs.round * 60,
    t:           0,
    speed:       0.0005,  // 느리게 (기존 0.0008)
    armor:       5 + gs.round * 2,
    magicResist: 3 + gs.round * 2,
    isBoss:      false,
    zoneIndex,
  });
}

function spawnBossForZone(gs: RoomGameState, zoneIndex: number): void {
  const name = BOSS_NAMES[gs.round] ?? `레벨 보스 ${gs.round}라운드`;
  gs.enemies.push({
    id: `e${gs.eid++}`,
    name,
    hp:          1000 + gs.round * 200,
    maxHp:       1000 + gs.round * 200,
    t:           0,
    speed:       0.0003,  // 보스 느리게
    armor:       20 + gs.round * 5,
    magicResist: 15 + gs.round * 5,
    isBoss:      true,
    zoneIndex,
  });
}

function startNewRound(gs: RoomGameState): void {
  gs.spawnCount     = 0;
  gs.lastSpawnTick  = gs.totalTicks;
  gs.roundStartTick = gs.totalTicks;
  gs.roundTime      = 40;
}

function startGameLoop(io: Server, room: Room): void {
  if (room.gameInterval) clearInterval(room.gameInterval);

  const gs: RoomGameState = {
    gamePhase:     'prepare',
    round:         1,
    roundTime:     40,
    prepareTime:   5,
    enemies:       [],
    eid:           0,
    spawnCount:    0,
    totalTicks:    0,
    lastSpawnTick: 0,
    roundStartTick: 0,
    zoneCount:     room.players.length,  // 게임 시작 시 플레이어 수
    deadZones:     new Set(),
  };
  room.gameState = gs;

  room.gameInterval = setInterval(() => {
    if (room.players.length === 0) { stopGameLoop(room); return; }

    gs.totalTicks++;

    // ── 준비 페이즈 ──────────────────────────────────────────
    if (gs.gamePhase === 'prepare') {
      if (gs.totalTicks % TICK_RATE === 0) {
        gs.prepareTime--;
        if (gs.prepareTime <= 0) {
          gs.gamePhase   = 'battle';
          gs.prepareTime = 5;
          startNewRound(gs);
          console.log(`[${room.id}] 라운드 ${gs.round} 전투 시작`);
        }
      }
    } else {
      // ── 라운드 타이머 ────────────────────────────────────
      if (gs.totalTicks % TICK_RATE === 0) {
        gs.roundTime--;
        if (gs.roundTime <= 0) {
          gs.round++;
          startNewRound(gs);
          console.log(`[${room.id}] 라운드 ${gs.round} 시작`);
        }
      }

      // ── 적 스폰 (살아있는 존마다) ─────────────────────────
      const isBoss = BOSS_ROUNDS.has(gs.round);
      if (isBoss) {
        // 보스: 존마다 아직 스폰 안 된 것만
        for (let zi = 0; zi < gs.zoneCount; zi++) {
          if (gs.deadZones.has(zi)) continue;
          const alreadySpawned = gs.enemies.some(
            e => e.isBoss && e.zoneIndex === zi
          );
          if (!alreadySpawned && gs.spawnCount === 0) {
            spawnBossForZone(gs, zi);
          }
        }
        if (gs.spawnCount === 0) gs.spawnCount = 1;
      } else {
        const spawnIntervalTicks = (SPAWN_WINDOW_SEC * TICK_RATE) / ENEMIES_PER_ROUND;
        const roundElapsedSec    = (gs.totalTicks - gs.roundStartTick) / TICK_RATE;
        const ticksSinceSpawn    = gs.totalTicks - gs.lastSpawnTick;

        if (
          gs.spawnCount < ENEMIES_PER_ROUND &&
          roundElapsedSec < SPAWN_WINDOW_SEC &&
          ticksSinceSpawn >= spawnIntervalTicks
        ) {
          gs.lastSpawnTick = gs.totalTicks;
          gs.spawnCount++;
          // 살아있는 존마다 하나씩 스폰
          for (let zi = 0; zi < gs.zoneCount; zi++) {
            if (gs.deadZones.has(zi)) continue;
            spawnEnemyForZone(gs, zi);
          }
        }
      }

      // ── 적 이동 ──────────────────────────────────────────
      for (const enemy of gs.enemies) {
        enemy.t = (enemy.t + enemy.speed * FRAME_MULT) % 1;
      }

      // ── 존별 게임오버 체크 (서버가 직접 판단) ────────────
      const MAX_ZONE_ENEMIES = 100;
      for (let zi = 0; zi < gs.zoneCount; zi++) {
        if (gs.deadZones.has(zi)) continue;
        const count = gs.enemies.filter(e => e.zoneIndex === zi).length;
        if (count >= MAX_ZONE_ENEMIES) {
          gs.deadZones.add(zi);
          gs.enemies = gs.enemies.filter(e => e.zoneIndex !== zi); // 즉시 제거
          const player = room.players[zi];
          if (player) io.to(player.id).emit('zone_game_over'); // 해당 플레이어에게만
          io.to(room.id).emit('zone_eliminated', { zoneIndex: zi }); // 전체 알림
          console.log(`[${room.id}] 존 ${zi} 게임오버 (적 ${count}마리)`);
        }
      }
    }

    // ── 브로드캐스트 ─────────────────────────────────────────
    io.to(room.id).emit('game_tick', {
      enemies:     gs.enemies,
      phase:       gs.gamePhase,
      round:       gs.round,
      roundTime:   gs.roundTime,
      prepareTime: gs.prepareTime,
    });
  }, TICK_MS);
}

function stopGameLoop(room: Room): void {
  if (room.gameInterval) { clearInterval(room.gameInterval); room.gameInterval = null; }
  room.gameState = null;
}

// ─── 소켓 서버 ───────────────────────────────────────────────────────────────

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
  console.log(`[+] 접속: ${socket.id}`);

  socket.on('create_room', () => {
    const existing = findRoomBySocket(socket.id);
    if (existing) leaveRoom(socket, existing);
    const roomId = generateRoomId();
    const player: Player = { id: socket.id, nickname: '플레이어1', isHost: true, isReady: false };
    const room: Room = { id: roomId, players: [player], phase: 'waiting', gameState: null, gameInterval: null };
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('room_created', { roomId, players: room.players });
    console.log(`[방 생성] ${roomId}`);
  });

  socket.on('join_room', ({ roomId }: { roomId: string }) => {
    const room = rooms.get(roomId);
    if (!room)                    { socket.emit('room_not_found'); return; }
    if (room.players.length >= 4) { socket.emit('room_full'); return; }
    if (room.phase === 'playing') { socket.emit('game_already_started'); return; }
    const existing = findRoomBySocket(socket.id);
    if (existing) leaveRoom(socket, existing);
    const nickname = `플레이어${room.players.length + 1}`;
    const player: Player = { id: socket.id, nickname, isHost: false, isReady: true }; // 자동 준비
    room.players.push(player);
    socket.join(roomId);
    socket.emit('room_joined', { roomId, players: room.players });
    socket.to(roomId).emit('player_joined', { players: room.players });
    console.log(`[입장] ${nickname} → ${roomId} (${room.players.length}/4)`);
  });

  socket.on('toggle_ready', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.isHost) return; // 방장은 준비 버튼 없음
    player.isReady = !player.isReady;
    io.to(room.id).emit('player_ready_changed', { players: room.players });
  });

  socket.on('start_game', () => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;
    const host = room.players.find(p => p.id === socket.id);
    if (!host?.isHost) return;
    room.phase = 'playing';
    room.players.forEach((p, index) => {
      io.to(p.id).emit('game_started', { players: room.players, zoneIndex: index });
    });
    startGameLoop(io, room);
    console.log(`[게임 시작] ${room.id} (${room.players.length}명, ${room.players.length}개 존)`);
  });

  // 유닛 공격 → HP 차감
  socket.on('enemy_hit', ({ enemyId, damage }: { enemyId: string; damage: number }) => {
    const room = findRoomBySocket(socket.id);
    if (!room?.gameState) return;
    const enemy = room.gameState.enemies.find(e => e.id === enemyId);
    if (!enemy) return;
    enemy.hp -= damage;
    if (enemy.hp <= 0) {
      room.gameState.enemies = room.gameState.enemies.filter(e => e.id !== enemyId);
      io.to(room.id).emit('enemy_died', { enemyId });
    }
  });

  // 유닛 위치 브로드캐스트 (다른 플레이어에게)
  socket.on('unit_positions', ({ units }: { units: any[] }) => {
    const room = findRoomBySocket(socket.id);
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    const zoneIndex = room.players.indexOf(player);
    socket.to(room.id).emit('other_player_units', {
      playerId: socket.id,
      zoneIndex,
      units,
    });
  });

  socket.on('leave_room', () => {
    const room = findRoomBySocket(socket.id);
    if (room) leaveRoom(socket, room);
  });

  socket.on('disconnect', () => {
    console.log(`[-] 끊김: ${socket.id}`);
    const room = findRoomBySocket(socket.id);
    if (room) leaveRoom(socket, room);
  });
});

function leaveRoom(socket: Socket, room: Room): void {
  const player = room.players.find(p => p.id === socket.id);
  removePlayer(room, socket.id);
  socket.leave(room.id);
  if (room.players.length === 0) {
    stopGameLoop(room);
    rooms.delete(room.id);
    console.log(`[방 삭제] ${room.id}`);
  } else {
    io.to(room.id).emit('player_left', {
      players: room.players,
      leftPlayerNickname: player?.nickname ?? '?',
    });
  }
}

const PORT = Number(process.env.PORT ?? 4000);
httpServer.listen(PORT, () => {
  console.log(`✅ 구랜디 소켓 서버 실행 중: http://localhost:${PORT}`);
});