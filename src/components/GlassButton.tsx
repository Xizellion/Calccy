import React from 'react';
import { motion } from 'motion/react';
import { ButtonType, ButtonSizingMode } from '../types';
import { sound } from '../utils/sound';

interface Props {
  label: string;
  subLabel?: string;
  type: ButtonType;
  isActive?: boolean;
  isWide?: boolean;
  sizeFactor?: number;
  organicRadius?: string;
  sizingMode: ButtonSizingMode;
  onClick: () => void;
}

export const GlassButton: React.FC<Props> = ({
  label,
  subLabel,
  type,
  isActive = false,
  isWide = false,
  sizeFactor = 1.0,
  organicRadius,
  sizingMode,
  onClick,
}) => {
  const handleClick = () => {
    if (type === 'number') {
      sound.playNumberTap(label);
    } else if (type === 'operator') {
      sound.playOperatorTap();
    } else if (label === 'AC' || label === 'C') {
      sound.playClearSound();
    } else if (label === '=') {
      sound.playEqualsChime();
    } else {
      sound.playGlassTap(950, 0.05, 0.14);
    }
    onClick();
  };

  // Base dimension calibrated for comfortable touch & full-screen presence
  const baseDim = 72; // px
  let computedWidth = baseDim;
  let computedHeight = baseDim;

  if (sizingMode === 'organic') {
    const factor = sizeFactor || 1.0;
    computedHeight = Math.round(baseDim * factor);
    computedWidth = isWide ? Math.round(baseDim * 2.25 * factor) : computedHeight;
  } else if (sizingMode === 'droplet') {
    const factor = (sizeFactor - 1) * 1.5 + 1;
    computedHeight = Math.round(baseDim * factor);
    computedWidth = isWide ? Math.round(baseDim * 2.2 * factor) : computedHeight;
  } else {
    computedHeight = baseDim;
    computedWidth = isWide ? baseDim * 2.25 : baseDim;
  }

  // Visual appearance styles
  let bgClasses = 'bg-white/[0.13] text-white hover:bg-white/[0.22] border-white/25';
  let textClasses = 'text-2xl sm:text-3xl font-light tracking-tight text-white';

  if (type === 'operator') {
    if (isActive) {
      bgClasses = 'bg-white text-amber-600 shadow-[0_0_24px_rgba(255,255,255,0.7)] border-white';
      textClasses = 'text-3xl font-medium text-amber-600';
    } else {
      bgClasses = 'bg-gradient-to-b from-amber-500/90 to-amber-600/90 text-white shadow-[0_6px_20px_rgba(245,158,11,0.35)] border-amber-300/40 hover:from-amber-400 hover:to-amber-500';
      textClasses = 'text-3xl font-light text-white';
    }
  } else if (type === 'action') {
    bgClasses = 'bg-white/[0.28] text-white/95 hover:bg-white/[0.38] border-white/40 shadow-[0_4px_16px_rgba(255,255,255,0.1)]';
    textClasses = 'text-xl sm:text-2xl font-medium text-white/95';
  } else if (label === '=') {
    bgClasses = 'bg-gradient-to-b from-emerald-500/90 to-teal-600/90 text-white shadow-[0_6px_22px_rgba(16,185,129,0.4)] border-emerald-300/50 hover:from-emerald-400 hover:to-teal-500';
    textClasses = 'text-3xl font-normal text-white';
  }

  const customRadius = sizingMode === 'organic' && organicRadius ? organicRadius : '9999px';

  return (
    <div className={`flex items-center justify-center ${isWide ? 'w-full' : 'w-full h-full max-w-[82px] max-h-[82px]'}`}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9, rotate: sizingMode === 'organic' ? (sizeFactor > 1 ? 1.5 : -1.5) : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
        onClick={handleClick}
        style={{
          width: isWide ? '100%' : `${computedWidth}px`,
          height: `${computedHeight}px`,
          maxWidth: isWide ? '176px' : '82px',
          maxHeight: '82px',
          borderRadius: customRadius,
        }}
        className={`relative flex items-center justify-center border backdrop-blur-xl transition-colors duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 overflow-hidden shadow-lg ${bgClasses}`}
      >
        {/* Top-left specular rim highlight */}
        <span
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 40%, transparent 70%)',
            borderRadius: customRadius,
          }}
        />

        {/* Bottom subtle shadow refraction */}
        <span
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 40%)',
            borderRadius: customRadius,
          }}
        />

        {/* Content text */}
        <span className={`relative z-10 flex flex-col items-center justify-center ${textClasses}`}>
          <span className={subLabel ? 'leading-none -mb-0.5' : ''}>{label}</span>
          {subLabel && (
            <span className="text-[10px] font-normal opacity-60 tracking-wider">
              {subLabel}
            </span>
          )}
        </span>
      </motion.button>
    </div>
  );
};
