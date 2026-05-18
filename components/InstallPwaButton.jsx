import { useState } from 'react';
import { Download } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function InstallPwaButton({ alwaysShow = false, className = '', size = 'default' }) {
  const { canShow, hasNativePrompt, getInstallHint, promptInstall } = usePwaInstall({ alwaysShow });
  const [hint, setHint] = useState('');

  if (!canShow) return null;

  const isCompact = size === 'sm';

  const handleClick = async () => {
    const accepted = await promptInstall();
    if (!accepted && !hasNativePrompt) {
      setHint(getInstallHint());
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        className={
          isCompact
            ? 'flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-[#0095f6] hover:opacity-80'
            : 'w-full flex items-center justify-center gap-2 bg-[#0095f6] text-white rounded-[4px] py-2 font-semibold text-sm hover:bg-[#1877f2] transition-colors'
        }
      >
        <Download className={isCompact ? 'w-4 h-4' : 'w-5 h-5'} />
        {isCompact ? 'Install' : 'Install Socio Gram'}
      </button>
      {hint && (
        <p className={`mt-2 text-xs text-zinc-600 dark:text-zinc-400 ${isCompact ? 'px-1' : 'text-center'}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
