"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../../App.jsx"), {
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
      Đang tải bản demo MatureX...
    </div>
  ),
});

export default function DemoPage() {
  return <App />;
}
