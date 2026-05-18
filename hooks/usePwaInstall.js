import { useCallback, useEffect, useState } from "react";

const MOBILE_MEDIA = "(max-width: 1023px)";

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

function getIsAndroid() {
  if (typeof window === "undefined") return false;
  return /Android/i.test(window.navigator.userAgent);
}

/** Fallback copy when beforeinstallprompt is unavailable (dev, iOS, or criteria not met). */
export function getInstallHint({ isIOS, isAndroid, hasNativePrompt }) {
  if (hasNativePrompt) return null;
  if (isIOS) {
    return 'Tap the Share button in Safari, then choose "Add to Home Screen".';
  }
  if (isAndroid) {
    return "Tap ⋮ in your browser, then Install app or Add to Home screen.";
  }
  return "Use the install icon in the address bar, or open the menu (⋮) and choose Install Socio Gram.";
}

/**
 * Captures beforeinstallprompt for Chromium install UI.
 * Native prompt requires production build + HTTPS (Serwist disables SW in dev).
 */
export default function usePwaInstall({ alwaysShow = false } = {}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const installed = getIsInstalled();
    setIsInstalled(installed);
    setIsIOS(getIsIOS());
    setIsAndroid(getIsAndroid());
    setReady(true);

    const mobileMq = window.matchMedia(MOBILE_MEDIA);
    const updateMobile = () => setIsMobile(mobileMq.matches);
    updateMobile();
    mobileMq.addEventListener("change", updateMobile);

    if (installed) {
      return () => mobileMq.removeEventListener("change", updateMobile);
    }

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
      mobileMq.removeEventListener("change", updateMobile);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const hasNativePrompt = Boolean(deferredPrompt);
  const canShow =
    ready &&
    !isInstalled &&
    (hasNativePrompt || isIOS || isMobile || alwaysShow);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted" || outcome === "dismissed") {
        setDeferredPrompt(null);
      }
      return { outcome, showHint: false };
    }
    return { outcome: null, showHint: true };
  }, [deferredPrompt]);

  const installHint = getInstallHint({ isIOS, isAndroid, hasNativePrompt });

  return {
    canShow,
    canInstall: canShow,
    isInstalled,
    isIOS,
    isAndroid,
    isMobile,
    ready,
    hasNativePrompt,
    installHint,
    promptInstall,
  };
}
