"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
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
      Đang chuyển hướng về trang chủ...
    </div>
  );
}
