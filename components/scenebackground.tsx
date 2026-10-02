"use client";

import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./scene3d"), { ssr: false });

export default function SceneBackground() {
  return (
    <div className="relative w-full min-w-0 h-[360px] sm:h-[420px] lg:h-[440px]" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(224,82,122,0.2),transparent_62%)]" />
      <div className="absolute inset-0 overflow-hidden">
        <Scene3D />
      </div>
    </div>
  );
}