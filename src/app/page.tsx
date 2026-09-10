"use client";

import dynamic from "next/dynamic";

const LiveApp = dynamic(() => import("../live/LiveApp"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        color: "#6b57bd",
        fontWeight: 600,
      }}
    >
      Đang tải MatureX...
    </div>
  ),
});

export default function Home() {
  return <LiveApp />;
}
