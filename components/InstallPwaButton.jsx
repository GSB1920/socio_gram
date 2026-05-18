import { useState } from "react";
import { Download } from "lucide-react";
import usePwaInstall from "@/hooks/usePwaInstall";

const VARIANTS = {
  primary:
    "bg-[#0095f6] text-white hover:bg-[#1877f2] border border-transparent",
  outline:
    "bg-transparent text-[#0095f6] border border-[#0095f6] hover:bg-[#0095f6]/10 dark:text-[#0095f6] dark:hover:bg-[#0095f6]/20",
};

export default function InstallPwaButton({
  variant = "primary",
  className = "",
  label = "Install Socio Gram",
  alwaysShow = false,
  size = "default",
}) {
  const { canShow, ready, isInstalled, hasNativePrompt, installHint, promptInstall } =
    usePwaInstall({ alwaysShow });
  const [showHint, setShowHint] = useState(false);

  if (!ready || isInstalled || !canShow) {
    return null;
  }

  const isCompact = size === "sm";

  async function handleClick() {
    const { showHint: shouldShowHint } = await promptInstall();
    if (shouldShowHint || !hasNativePrompt) {
      setShowHint(true);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={label}
        className={`flex items-center justify-center gap-1.5 font-semibold transition-colors ${
          isCompact
            ? "min-h-11 min-w-11 rounded-lg px-2 py-1.5 text-xs text-[#0095f6] hover:bg-zinc-100 dark:hover:bg-zinc-900"
            : `w-full gap-2 rounded-[4px] px-4 py-2 text-sm ${VARIANTS[variant] ?? VARIANTS.primary}`
        }`}
      >
        <Download className={isCompact ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"} aria-hidden />
        {!isCompact && label}
        {isCompact && <span className="sr-only">{label}</span>}
      </button>
      {showHint && installHint && !isCompact && (
        <p className="mt-2 text-center text-xs leading-4 text-zinc-500">{installHint}</p>
      )}
    </div>
  );
}
