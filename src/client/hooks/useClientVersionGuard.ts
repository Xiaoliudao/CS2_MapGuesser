import { useEffect } from "react";
import { APP_BUILD_ID } from "../../shared/appVersion";

const VERSION_CHECK_INTERVAL_MS = 15_000;
const RELOAD_TARGET_KEY = "cs2-map-guesser-reload-target";

interface VersionResponse {
  version?: unknown;
}

export async function checkForClientUpdate({
  currentVersion = APP_BUILD_ID,
  fetchVersion = () => fetch("/api/client-version", { cache: "no-store" }),
  onMismatch,
}: {
  currentVersion?: string;
  fetchVersion?: () => Promise<Response>;
  onMismatch: (deployedVersion: string) => void;
}): Promise<boolean> {
  const response = await fetchVersion();
  if (!response.ok) return false;
  const body = await response.json() as VersionResponse;
  if (typeof body.version !== "string" || !body.version || body.version === currentVersion) return false;
  onMismatch(body.version);
  return true;
}

export function useClientVersionGuard(): void {
  useEffect(() => {
    if (import.meta.env.DEV) return;
    let disposed = false;
    let checking = false;

    const check = async () => {
      if (checking || disposed) return;
      checking = true;
      try {
        await checkForClientUpdate({
          onMismatch: (deployedVersion) => {
            if (disposed || window.sessionStorage.getItem(RELOAD_TARGET_KEY) === deployedVersion) return;
            window.sessionStorage.setItem(RELOAD_TARGET_KEY, deployedVersion);
            window.location.reload();
          },
        });
      } catch {
        // A failed version probe must never interrupt an active match.
      } finally {
        checking = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void check();
    };
    const handleFocus = () => void check();
    const intervalId = window.setInterval(() => void check(), VERSION_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    void check();

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);
}
