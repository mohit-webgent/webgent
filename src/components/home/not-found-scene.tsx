"use client";

import dynamic from "next/dynamic";

const AssemblyScene = dynamic(() => import("./assembly-scene"), { ssr: false });

export function NotFoundScene() {
  return <AssemblyScene cloudOnly className="absolute inset-0 -z-10 opacity-60" />;
}
