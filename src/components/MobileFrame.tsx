import React from 'react';

interface Props {
  children: React.ReactNode;
  showPhoneFrame?: boolean;
  onToggleFrame?: () => void;
  onOpenFlutterCode?: () => void;
  onOpenHistory?: () => void;
  onOpenSettings?: () => void;
  onToggleScientific?: () => void;
  isScientificOpen?: boolean;
}

export const MobileFrame: React.FC<Props> = ({ children }) => {
  // Mobile device: 100% full screen edge-to-edge (no frame, no outer borders)
  // Desktop screen: Elegant centered slab glass
  return (
    <div className="relative w-full h-full min-h-[100dvh] sm:min-h-[780px] sm:max-w-[425px] sm:mx-auto sm:my-auto flex flex-col justify-between rounded-none sm:rounded-[44px] overflow-hidden border-0 sm:border sm:border-white/20 bg-slate-950/90 sm:bg-slate-950/60 backdrop-blur-3xl shadow-none sm:shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(6,182,212,0.1)] transition-all">
      <div
        className="relative w-full h-full flex-1 flex flex-col justify-between overflow-visible"
        style={{ perspective: 1400 }}
      >
        {children}
      </div>
    </div>
  );
};
