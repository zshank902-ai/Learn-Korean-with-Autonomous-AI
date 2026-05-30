"use client";

import dynamic from 'next/dynamic';

const ThreeScene = dynamic(() => import('@/components/ThreeScene'), { ssr: false });

export default function ThreeSceneWrapper({ children }: { children?: React.ReactNode }) {
  return <ThreeScene>{children}</ThreeScene>;
}
