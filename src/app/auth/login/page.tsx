"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(
  () =>
    import("@/features/auth/components/login-form").then((m) => m.LoginForm),
  {
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
        Đang tải trang đăng nhập...
      </div>
    ),
  },
);

const PasswordRecovery = dynamic(
  () =>
    import("@/features/settings/components/account-settings").then(
      (m) => m.PasswordRecovery,
    ),
  {
    ssr: false,
  },
);

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [sessionData, setSessionData] = useState<{
    setupRequired: boolean;
  } | null>(null);
  const [mode, setMode] = useState<"login" | "forgot" | "reset">("login");
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    api<{ user: unknown; setupRequired: boolean }>("/session")
      .then((res) => {
        if (res.user) {
          router.push("/app");
        } else {
          setSessionData({ setupRequired: res.setupRequired });
        }
      })
      .catch(() => {
        setSessionData({ setupRequired: false });
      });

    const checkHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith("reset/")) {
        setResetToken(hash.split("/")[1] || null);
        setMode("reset");
      } else if (hash === "forgot") {
        setMode("forgot");
      } else {
        setMode("login");
      }
    };

    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, [router]);

  if (mode === "forgot" || mode === "reset") {
    return (
      <PasswordRecovery
        token={resetToken || undefined}
        onDone={() => {
          window.location.hash = "";
          setMode("login");
        }}
      />
    );
  }

  if (!sessionData) {
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
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <LoginForm
      setup={sessionData.setupRequired}
      onLogin={() => {
        router.push("/app");
      }}
    />
  );
}
