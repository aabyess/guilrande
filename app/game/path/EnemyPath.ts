import * as THREE from 'three';

// P1 존 기준 경로 (좌상단)
const X_L = -51;
const X_R =  -9;
const Z_T = -51;
const Z_B =  -9;

export const PATH_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(X_L, 0, Z_T),  // ① 좌상 (스폰)
  new THREE.Vector3(X_L, 0, Z_B),  // ② 좌하
  new THREE.Vector3(X_R, 0, Z_B),  // ③ 우하
  new THREE.Vector3(X_R, 0, Z_T),  // ④ 우상
];

// 존별 오프셋 — P1 경로를 각 존 위치로 이동
// P1(-30,-30) P2(30,-30) P3(-30,30) P4(30,30)
const ZONE_OFFSETS: [number, number][] = [
  [  0,  0],  // P1 좌상단 (기준)
  [ 60,  0],  // P2 우상단
  [  0, 60],  // P3 좌하단
  [ 60, 60],  // P4 우하단
];

const segments = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 0 },
];

const segLengths = segments.map(s => {
  const a = PATH_POINTS[s.from];
  const b = PATH_POINTS[s.to % PATH_POINTS.length] ?? PATH_POINTS[0];
  return a.distanceTo(b);
});
const totalLength = segLengths.reduce((a, b) => a + b, 0);

const cumulative = [0];
segLengths.forEach((len, i) => {
  cumulative.push(cumulative[i] + len / totalLength);
});

function getBasePathPosition(t: number): THREE.Vector3 {
  const tLoop = ((t % 1) + 1) % 1;
  for (let i = 0; i < segments.length; i++) {
    const segStart = cumulative[i];
    const segEnd   = cumulative[i + 1];
    if (tLoop >= segStart && tLoop <= segEnd) {
      const localT = (tLoop - segStart) / (segEnd - segStart);
      const a = PATH_POINTS[segments[i].from];
      const b = i === segments.length - 1 ? PATH_POINTS[0] : PATH_POINTS[segments[i].to];
      return new THREE.Vector3(
        a.x + (b.x - a.x) * localT,
        0,
        a.z + (b.z - a.z) * localT,
      );
    }
  }
  return PATH_POINTS[0].clone();
}

/**
 * t(0~1) + zoneIndex → 해당 존의 경로상 월드 위치
 * zoneIndex 기본값 0 → 기존 코드 하위 호환
 */
export function getPathPosition(t: number, zoneIndex: number = 0): THREE.Vector3 {
  const base = getBasePathPosition(t);
  const [ox, oz] = ZONE_OFFSETS[zoneIndex] ?? [0, 0];
  return new THREE.Vector3(base.x + ox, 0, base.z + oz);
}

export const enemyPath = {
  getPoint: (t: number) => getPathPosition(t, 0),
};