import { useRef, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
// VISION_PRESETS, VisionLevel은 useGameStore에 있음 (ChatBox가 아님)
import { useGameStore, VisionLevel, VISION_PRESETS } from '../../store/useGameStore';

// ──────────────────────────────────────────────
// 📌 수정 포인트 1: 줌 애니메이션 속도
// 값이 클수록 빠르게 이동 (0.01 ~ 0.2 사이 추천)
// ──────────────────────────────────────────────
const LERP_SPEED = 0.08;

export function useCameraZoom() {
  const { camera } = useThree();

  // 목표 카메라 Y값 (애니메이션 타겟)
  const targetYRef = useRef<number | null>(null);
  // RAF ID (cleanup용)
  const rafRef = useRef<number | null>(null);

  const animateToY = useCallback((targetY: number) => {
    // 기존 애니메이션 취소
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    targetYRef.current = targetY;

    const animate = () => {
      if (targetYRef.current === null) return;

      const currentY = camera.position.y;
      const diff = targetYRef.current - currentY;

      if (Math.abs(diff) < 0.1) {
        // ──────────────────────────────────────────────
        // 📌 수정 포인트 2: 도착 판정 임계값 (0.1)
        // 너무 작으면 진동 생길 수 있음
        // ──────────────────────────────────────────────
        camera.position.y = targetYRef.current;
        targetYRef.current = null;
        return;
      }

      // Lerp (선형 보간) — 부드러운 줌 이동
      camera.position.y += diff * LERP_SPEED;

      // ──────────────────────────────────────────────
      // 📌 수정 포인트 3: OrthographicCamera라면
      // camera.position.y 대신 camera.zoom 을 조절해야 함.
      // 예시:
      //   camera.zoom += (targetZoom - camera.zoom) * LERP_SPEED;
      //   camera.updateProjectionMatrix();
      // ──────────────────────────────────────────────

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [camera]);

  const setVision = useCallback((level: VisionLevel, cameraValue: number) => {
    // ──────────────────────────────────────────────
    // 📌 수정 포인트 4: lookAt 유지
    // 카메라가 특정 지점을 바라보는 구조라면
    // position.y만 바꾸면 각도가 틀어질 수 있음.
    // 그 경우엔 아래처럼 lookAt도 같이 업데이트:
    //   camera.position.y = cameraValue;
    //   camera.lookAt(camera.position.x, 0, camera.position.z);
    // ──────────────────────────────────────────────
    animateToY(cameraValue);
  }, [animateToY]);

  return { setVision };
}