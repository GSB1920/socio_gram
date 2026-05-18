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
}) {
  const { canInstall, isInstalled, isIOS, ready, promptInstall } = usePwaInstall();
  const [showIosHint, setShowIosHint] = useState(false);

  if (!ready || isInstalled || !canInstall) {
    return null;
  }

  async function handleClick() {
    const { showIosHint: iosHint } = await promptInstall();
    if (iosHint || isIOS) {
      setShowIosHint(true);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        className={`flex w-full items-center justify-center gap-2 rounded-[4px] px-4 py-2 text-sm font-semibold transition-colors ${VARIANTS[variant] ?? VARIANTS.primary}`}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </button>
      {showIosHint && (
        <p className="mt-2 text-center text-xs leading-4 text-zinc-500">
          Tap the Share button in Safari, then choose &ldquo;Add to Home Screen&rdquo;.
        </p>
      )}
    </div>
  );
}
