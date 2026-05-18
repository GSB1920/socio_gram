import { useCallback, useEffect, useState } from "react";

function getIsInstalled() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function getIsIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent);
}

/**
 * Captures beforeinstallprompt for Chromium install UI.
 * iOS has no programmatic install; use showIosHint from promptInstall().
 */
export default function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const installed = getIsInstalled();
    const ios = getIsIOS();
    setIsInstalled(installed);
    setIsIOS(ios);
    setReady(true);

    if (installed) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canInstall =
    ready && !isInstalled && (Boolean(deferredPrompt) || isIOS);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted" || outcome === "dismissed") {
        setDeferredPrompt(null);
      }
      return { outcome, showIosHint: false };
    }
    if (isIOS) {
      return { outcome: null, showIosHint: true };
    }
    return { outcome: null, showIosHint: false };
  }, [deferredPrompt, isIOS]);

  return {
    canInstall,
    isInstalled,
    isIOS,
    ready,
    promptInstall,
  };
}
