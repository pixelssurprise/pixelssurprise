"use client";

import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./scene3d"), { ssr: false });

/* Fills whatever box the page gives it (the page controls the height). */
export default function SceneBackground() {
  return (
    <div className="relative w-full h-full min-w-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(224,82,122,0.2),transparent_62%)]" />
      <div className="absolute inset-0">
        <Scene3D />
      </div>
    </div>
  );
}