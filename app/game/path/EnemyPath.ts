import * as THREE from 'three';

// 2사분면(플레이어1) 구역 경계
// 구역 중심 (-30, -30), 크기 44x44 → 경계 x: -52~-8, z: -52~-8
// 경로: 좌상 코너 → 시계방향으로 직선 이동
const X_L = -51;  // 왼쪽
const X_R =  -9;  // 오른쪽
const Z_T = -51;  // 위
const Z_B =  -9;  // 아래

// 꼭짓점 4개 (시계방향: 좌상 → 좌하 → 우하 → 우상 → 좌상)
export const PATH_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(X_L, 0, Z_T),  // ① 좌상 (스폰)
  new THREE.Vector3(X_L, 0, Z_B),  // ② 좌하
  new THREE.Vector3(X_R, 0, Z_B),  // ③ 우하
  new THREE.Vector3(X_R, 0, Z_T),  // ④ 우상
];

// 각 세그먼트 길이 누적 (직선 보간용)
const segments = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 0 }, // 우상 → 좌상 (루프)
];

// 각 세그먼트 월드 길이
const segLengths = segments.map(s => {
  const a = PATH_POINTS[s.from];
  const b = PATH_POINTS[s.to % PATH_POINTS.length] ?? PATH_POINTS[0];
  return a.distanceTo(b);
});
const totalLength = segLengths.reduce((a, b) => a + b, 0);

// 누적 비율 (0~1)
const cumulative = [0];
segLengths.forEach((len, i) => {
  cumulative.push(cumulative[i] + len / totalLength);
});

/**
 * t(0~1) → 경로상 정확한 월드 위치 (직선 보간)
 * t가 1을 넘으면 % 1로 루프
 */
export function getPathPosition(t: number): THREE.Vector3 {
  const tLoop = ((t % 1) + 1) % 1; // 0~1 루프

  for (let i = 0; i < segments.length; i++) {
    const segStart = cumulative[i];
    const segEnd = cumulative[i + 1];
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

// 하위 호환용 (미니맵 경로 그리기에서 사용)
export const enemyPath = {
  getPoint: (t: number) => getPathPosition(t),
};