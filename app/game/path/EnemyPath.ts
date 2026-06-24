import * as THREE from 'three';

// 맵 크기 기준 경로 포인트 (XZ 평면, Y=0)
export const PATH_POINTS = [
  new THREE.Vector3(-12, 0,  8),
  new THREE.Vector3(-12, 0, -8),
  new THREE.Vector3( 12, 0, -8),
  new THREE.Vector3( 12, 0,  8),
  new THREE.Vector3(-12, 0,  8),
];

export const enemyPath = new THREE.CatmullRomCurve3(PATH_POINTS, true);

// t(0~1) 값으로 경로상 위치 반환
export function getPathPosition(t: number): THREE.Vector3 {
  return enemyPath.getPoint(t % 1);
}