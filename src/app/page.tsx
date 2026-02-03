'use client';

import dynamic from 'next/dynamic';

const MinecraftSkinEditor = dynamic(
  () => import('@/components/editor/MinecraftSkinEditor').then(mod => ({ default: mod.MinecraftSkinEditor })),
  {
    ssr: false,
    loading: () => null
  }
);

export default function Home() {
  return <MinecraftSkinEditor />;
}
