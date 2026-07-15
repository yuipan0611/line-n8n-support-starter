"use client";

import { useEffect, useState } from "react";

type LiffState = {
  ready: boolean;
  inClient: boolean;
  displayName: string;
};

export function useLiff() {
  const [state, setState] = useState<LiffState>({
    ready: true,
    inClient: false,
    displayName: "Mock LIFF",
  });

  useEffect(() => {
    // Without NEXT_PUBLIC_LIFF_ID the app stays in mock mode (no LINE login).
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      return;
    }

    let mounted = true;
    import("@line/liff")
      .then(async ({ default: liff }) => {
        await liff.init({ liffId });
        if (!mounted) return;
        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }
        const profile = await liff.getProfile().catch(() => null);
        setState({
          ready: true,
          inClient: liff.isInClient(),
          displayName: profile?.displayName ?? "LINE 使用者",
        });
      })
      .catch(() => {
        if (mounted) setState({ ready: true, inClient: false, displayName: "Mock LIFF" });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
