'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type { Group } from 'three';
import Scene from '../Scene';

/** Normalized pointer/touch position shared with the parallax rig. */
function usePointer(reducedMotion: boolean) {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    const onMouse = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      pointer.current.x = (t.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (t.clientY / window.innerHeight) * 2 - 1;
    };
    const reset = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };

    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchend', reset, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchend', reset);
    };
  }, [reducedMotion]);

  return pointer;
}

/**
 * Eased parallax: the whole diorama leans very slightly toward the
 * pointer/finger, plus a slow autonomous sway so the scene always
 * feels alive on phones even before the first touch.
 */
function ParallaxRig({
  children,
  reducedMotion,
}: {
  children: React.ReactNode;
  reducedMotion: boolean;
}) {
  const rig = useRef<Group>(null);
  const pointer = usePointer(reducedMotion);

  useFrame(({ clock }, delta) => {
    if (!rig.current) return;
    if (reducedMotion) return;
    const t = clock.getElapsedTime();
    const idleX = Math.sin(t * 0.22) * 0.028;
    const idleY = Math.sin(t * 0.17 + 1.3) * 0.012;
    const targetY = idleX + pointer.current.x * 0.07;
    const targetX = idleY + pointer.current.y * 0.035;
    const ease = Math.min(delta * 2.2, 1);
    rig.current.rotation.y += (targetY - rig.current.rotation.y) * ease;
    rig.current.rotation.x += (targetX - rig.current.rotation.x) * ease;
  });

  return <group ref={rig}>{children}</group>;
}

/** Warm flour-dust motes drifting around the shopfront. */
function FlourDust({ mobile }: { mobile: boolean }) {
  return (
    <Sparkles
      count={mobile ? 42 : 70}
      scale={[420, 260, 160]}
      position={[0, 150, 60]}
      size={mobile ? 5.5 : 6.5}
      speed={0.18}
      opacity={0.55}
      color="#ffdfae"
      noise={0.6}
    />
  );
}

export default function HeroCanvas() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    setMobile(window.innerWidth < 768);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <Canvas
      orthographic
      flat
      linear
      shadows
      dpr={[1, 2]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent', touchAction: 'pan-y' }}
    >
      <Suspense fallback={null}>
        <ParallaxRig reducedMotion={reducedMotion}>
          <Scene reducedMotion={reducedMotion} />
          <FlourDust mobile={mobile} />
        </ParallaxRig>
      </Suspense>
    </Canvas>
  );
}
