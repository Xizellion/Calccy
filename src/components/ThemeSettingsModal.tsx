import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Hand,
  Globe,
  Palette,
  Search,
  Check,
  CloudFog,
} from 'lucide-react';
import { AuroraTheme, VaporDensity, ButtonSizingMode } from '../types';
import {
  SUPPORTED_LANGUAGES,
  LanguageNumeralSystem,
} from '../utils/languages';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sizingMode: ButtonSizingMode;
  onSizingModeChange: (mode: ButtonSizingMode) => void;
  vaporDensity: VaporDensity;
  onVaporDensityChange: (density: VaporDensity) => void;
  theme: AuroraTheme;
  onThemeChange: (theme: AuroraTheme) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  enableWipeEffect: boolean;
  onWipeToggle: () => void;
  selectedLanguage: LanguageNumeralSystem;
  onLanguageChange: (lang: LanguageNumeralSystem) => void;
}

export const ThemeSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sizingMode,
  onSizingModeChange,
  vaporDensity,
  onVaporDensityChange,
  theme,
  onThemeChange,
  soundEnabled,
  onSoundToggle,
  enableWipeEffect,
  onWipeToggle,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [activeTab, setActiveTab] = useState<'country' | 'theme'>('country');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-40 flex flex-col backdrop-blur-3xl bg-white/[0.08] dark:bg-black/[0.22] border border-white/20 text-white overflow-hidden rounded-[44px] shadow-2xl"
        >
          {/* Top Bar with Minimal Visual Segmented Switch */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10 bg-white/[0.02]">
            {/* Visual Segmented Control */}
            <div className="flex items-center p-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
              <button
                onClick={() => {
                  sound.playGlassTap(1100, 0.04, 0.1);
                  setActiveTab('country');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'country'
                    ? 'bg-white/30 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Country</span>
              </button>

              <button
                onClick={() => {
                  sound.playGlassTap(1200, 0.04, 0.1);
                  setActiveTab('theme');
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-white/30 text-white shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'country' ? (
              /* TAB 1: Clean Country List (No samples, pure country buttons) */
              <div className="space-y-2.5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-cyan-300 transition-colors backdrop-blur-md"
                  />
                </div>

                {/* Grid of Clean Country Glass Buttons */}
                <div className="grid grid-cols-2 gap-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCountries.map((c) => {
                    const isSelected = selectedLanguage.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          sound.playGlassTap(1200, 0.05, 0.15);
                          onLanguageChange(c);
                        }}
                        className={`p-2.5 rounded-2xl flex items-center justify-between border text-left transition-all cursor-pointer backdrop-blur-md ${
                          isSelected
                            ? 'bg-white/35 border-white text-white shadow-lg shadow-white/15'
                            : 'bg-white/[0.06] border-white/10 text-white/80 hover:bg-white/[0.14] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-base shrink-0">{c.flag}</span>
                          <span className="text-xs font-medium truncate">{c.name}</span>
                        </div>
                        {isSelected && (
                          <div className="p-0.5 rounded-full bg-white text-slate-950 shrink-0 ml-1">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB 2: Clean Theme & Button Design (Minimal text, visual buttons) */
              <div className="space-y-4">
                {/* 1. Button Shape (Visual Pebble Buttons) */}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-white/60 mb-2 font-medium">
                    Button Style
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Uneven Pebbles Button */}
                    <button
                      onClick={() => {
                        sound.playGlassTap(1200, 0.05, 0.15);
                        onSizingModeChange('organic');
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all cursor-pointer backdrop-blur-md ${
                        sizingMode === 'organic'
                          ? 'bg-white/30 border-white text-white shadow-lg'
                          : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                      }`}
                    >
                      <div className="flex items-center gap-1 h-6">
                        <span className="w-5 h-5 rounded-full bg-white/90" />
                        <span className="w-3 h-3 rounded-full bg-white/60" />
                        <span className="w-6 h-6 rounded-full bg-white/95" />
                      </div>
                      <span className="text-[11px] font-medium">Uneven Pebbles</span>
                    </button>

                    {/* Uniform Circles Button */}
                    <button
                      onClick={() => {
                        sound.playGlassTap(1000, 0.05, 0.15);
                        onSizingModeChange('classic');
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all cursor-pointer backdrop-blur-md ${
                        sizingMode === 'classic'
                          ? 'bg-white/30 border-white text-white shadow-lg'
                          : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                      }`}
                    >
                      <div className="flex items-center gap-1 h-6">
                        <span className="w-4 h-4 rounded-full bg-white/80" />
                        <span className="w-4 h-4 rounded-full bg-white/80" />
                        <span className="w-4 h-4 rounded-full bg-white/80" />
                      </div>
                      <span className="text-[11px] font-medium">Classic Circles</span>
                    </button>

                    {/* Droplets Button */}
                    <button
                      onClick={() => {
                        sound.playGlassTap(1300, 0.05, 0.15);
                        onSizingModeChange('droplet');
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 border text-center transition-all cursor-pointer backdrop-blur-md ${
                        sizingMode === 'droplet'
                          ? 'bg-white/30 border-white text-white shadow-lg'
                          : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                      }`}
                    >
                      <div className="flex items-center gap-1 h-6">
                        <span className="w-2.5 h-2.5 rounded-full bg-white/60" />
                        <span className="w-6 h-6 rounded-full bg-white/95" />
                        <span className="w-3.5 h-3.5 rounded-full bg-white/70" />
                      </div>
                      <span className="text-[11px] font-medium">Droplets</span>
                    </button>
                  </div>
                </div>

                {/* 2. Aurora Color Palette (Visual Color Buttons) */}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-white/60 mb-2 font-medium">
                    Glass Theme & Refraction
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'white_metallic', label: 'White Metallic', bg: 'from-white via-slate-200 to-zinc-400', text: 'text-slate-900' },
                      { id: 'liquid_silver', label: 'Liquid Silver', bg: 'from-slate-100 via-zinc-300 to-slate-400', text: 'text-slate-900' },
                      { id: 'sunset_aurora', label: 'Sunset', bg: 'from-pink-500 via-rose-500 to-amber-400', text: 'text-white' },
                      { id: 'midnight_purple', label: 'Midnight', bg: 'from-purple-600 via-violet-600 to-blue-500', text: 'text-white' },
                      { id: 'deep_ocean', label: 'Ocean', bg: 'from-cyan-400 via-teal-500 to-blue-600', text: 'text-white' },
                      { id: 'frosted_emerald', label: 'Emerald', bg: 'from-emerald-400 via-teal-600 to-lime-500', text: 'text-white' },
                    ].map((th) => (
                      <button
                        key={th.id}
                        onClick={() => {
                          sound.playGlassTap(1050, 0.05, 0.12);
                          onThemeChange(th.id as AuroraTheme);
                        }}
                        className={`h-12 px-2 rounded-2xl flex flex-col items-center justify-center border transition-all cursor-pointer bg-gradient-to-tr ${th.bg} ${
                          theme === th.id
                            ? 'ring-2 ring-white scale-105 shadow-lg'
                            : 'opacity-70 hover:opacity-100 border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {theme === th.id && (
                            <div className="p-0.5 rounded-full bg-black/40 text-white">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          <span className={`text-[10px] font-semibold tracking-tight ${th.text}`}>
                            {th.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Vapor Mist Density (Visual Glass Pills) */}
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-white/60 mb-2 font-medium flex items-center gap-1.5">
                    <CloudFog className="w-3.5 h-3.5" />
                    <span>Mist Vapor</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['subtle', 'misty', 'dense', 'droplets'] as VaporDensity[]).map((v) => (
                      <button
                        key={v}
                        onClick={() => {
                          sound.playGlassTap(1100, 0.04, 0.12);
                          onVaporDensityChange(v);
                        }}
                        className={`py-2 px-1 text-xs rounded-xl border text-center transition-all cursor-pointer backdrop-blur-md capitalize ${
                          vaporDensity === v
                            ? 'bg-white/30 border-white text-white font-medium shadow-md'
                            : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Controls: Wipe & Sound (Visual Toggles) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Finger Wipe Mist Toggle */}
                  <button
                    onClick={onWipeToggle}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer backdrop-blur-md ${
                      enableWipeEffect
                        ? 'bg-white/25 border-white text-white shadow-md'
                        : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hand className="w-4 h-4 text-cyan-300" />
                      <span className="text-xs font-medium">Finger Wipe</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                      {enableWipeEffect ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Glass Sound Toggle */}
                  <button
                    onClick={onSoundToggle}
                    className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer backdrop-blur-md ${
                      soundEnabled
                        ? 'bg-white/25 border-white text-white shadow-md'
                        : 'bg-white/[0.06] border-white/10 text-white/60 hover:bg-white/[0.14]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-white/40" />
                      )}
                      <span className="text-xs font-medium">Sound</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
                      {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
