import { useState, useEffect, useCallback } from 'react';

// Native install prompt requires production build + HTTPS (Serwist SW disabled in dev).
function getIsInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function getIsIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function getIsAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

export function usePwaInstall({ alwaysShow = false } = {}) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsInstalled(getIsInstalled());
    setReady(true);

    const mq = window.matchMedia('(max-width: 1023px)');
    const updateMobile = () => setIsMobile(mq.matches);
    updateMobile();
    mq.addEventListener('change', updateMobile);

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      mq.removeEventListener('change', updateMobile);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const isIOS = getIsIOS();
  const hasNativePrompt = Boolean(deferredPrompt);

  const canShow =
    ready &&
    !isInstalled &&
    (hasNativePrompt || isIOS || isMobile || alwaysShow);

  const getInstallHint = useCallback(() => {
    if (isIOS) {
      return 'Tap Share, then "Add to Home Screen" to install Socio Gram.';
    }
    if (getIsAndroid()) {
      return 'Open the browser menu (⋮) and tap "Install app" or "Add to Home screen".';
    }
    return 'Use the install icon in your browser address bar, or open the menu and choose "Install Socio Gram".';
  }, [isIOS]);

  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return outcome === 'accepted';
    }
    return false;
  }, [deferredPrompt]);

  return {
    canShow,
    hasNativePrompt,
    isInstalled,
    isIOS,
    isMobile,
    getInstallHint,
    promptInstall,
  };
}
