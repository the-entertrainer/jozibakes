'use client';

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

/**
 * Coordinates the entrance gate with the Spline scenes so the gate can act
 * as a real preloader: every scene registers when it mounts and reports back
 * once it has resolved (loaded, or failed over to its fallback). The gate
 * watches the counts and only lifts the curtain when all scenes are ready —
 * so the page is smooth to scroll from the very first frame, with no
 * pop-in shimmer as each 3D piece scrolls into view.
 */
type PreloadCtx = {
  /** Call on scene mount. Returns the scene's id for reportReady. */
  registerScene: () => number;
  unregisterScene: (id: number) => void;
  reportReady: (id: number) => void;
  total: number;
  ready: number;
};

const Ctx = createContext<PreloadCtx | null>(null);

export function useScenePreload() {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error('useScenePreload must be used inside <ScenePreloadProvider>');
  return ctx;
}

export default function ScenePreloadProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [total, setTotal] = useState(0);
  const [ready, setReady] = useState(0);
  const readyIds = useRef<Set<number>>(new Set());
  const nextId = useRef(0);

  const registerScene = useCallback(() => {
    const id = nextId.current++;
    setTotal((t) => t + 1);
    return id;
  }, []);

  const unregisterScene = useCallback((id: number) => {
    setTotal((t) => Math.max(0, t - 1));
    if (readyIds.current.has(id)) {
      readyIds.current.delete(id);
      setReady((r) => Math.max(0, r - 1));
    }
  }, []);

  const reportReady = useCallback((id: number) => {
    if (readyIds.current.has(id)) return; // idempotent — only count once
    readyIds.current.add(id);
    setReady((r) => r + 1);
  }, []);

  return (
    <Ctx.Provider
      value={{ registerScene, unregisterScene, reportReady, total, ready }}
    >
      {children}
    </Ctx.Provider>
  );
}
