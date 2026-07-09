'use client';

import Scene from './Scene';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbf5e5] flex items-center justify-center overflow-hidden">
      <div className="w-full h-screen max-w-[1400px] mx-auto">
        <Scene />
      </div>
    </main>
  );
}
