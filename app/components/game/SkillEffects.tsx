'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

const DURATION = 450; // ms, 이펙트 지속 시간

/**
 * 스킬 발동 시 잠깐 나타났다 사라지는 VFX 모음을 렌더링.
 * GameLoop.tsx에서 addSkillEffect()로 store에 큐잉되면,
 * 여기서 진행률에 따라 확장 링 + 파티클을 그리고 끝나면 자동 제거.
 * GameCanvas.tsx의 <Canvas> 안 어딘가에 <SkillEffects /> 한 번만 넣으면 됨.
 */
export function SkillEffects() {
  const skillEffects = useGameStore(s => s.skillEffects);
  const zoneIndex = useGameStore(s => s.zoneIndex);
  const removeSkillEffect = useGameStore(s => s.removeSkillEffect);

  // 내 존에서 발동한 이펙트만 렌더링 (다른 존은 안 보여도 됨)
  const visible = skillEffects.filter(e => e.zoneIndex === zoneIndex);

  return (
    <>
      {visible.map(effect => (
        <SingleSkillEffect
          key={effect.id}
          effect={effect}
          onDone={() => removeSkillEffect(effect.id)}
        />
      ))}
    </>
  );
}

function SingleSkillEffect({
  effect,
  onDone,
}: {
  effect: {
    id: string;
    x: number;
    z: number;
    color: number;
    radius: number;
    startTime: number;
    particleDirs: { x: number; z: number; y: number }[];
  };
  onDone: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const doneRef = useRef(false);

  const color = useMemo(() => new THREE.Color(effect.color), [effect.color]);
  const maxRadius = Math.max(1, effect.radius);
  const particleDirs = effect.particleDirs;

  useFrame(() => {
    if (doneRef.current) return;
    const t = (performance.now() - effect.startTime) / DURATION; // 0 ~ 1

    if (t >= 1) {
      doneRef.current = true;
      onDone();
      return;
    }

    // 링: 0 → maxRadius로 확장하면서 점점 투명해짐
    if (ringRef.current) {
      const scale = 0.2 + t * (maxRadius / 0.5);
      ringRef.current.scale.set(scale, scale, scale);
    }
    if (ringMatRef.current) {
      ringMatRef.current.opacity = 1 - t;
    }

    // 파티클: 바깥으로 퍼지며 위로 살짝 솟구치고 페이드아웃
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const dir = particleDirs[i];
        const mesh = child as THREE.Mesh;
        mesh.position.set(dir.x * t, dir.y * Math.sin(t * Math.PI), dir.z * t);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 1 - t;
      });
    }
  });

  return (
    <group position={[effect.x, 0.05, effect.z]}>
      {/* 확장하는 링 */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={color}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 중심 플래시 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* 튀는 파티클들 */}
      <group ref={particlesRef}>
        {particleDirs.map((_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.12, 6, 6]} />
            <meshBasicMaterial color={color} transparent opacity={1} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}