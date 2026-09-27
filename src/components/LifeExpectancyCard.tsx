import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Globe,
  Hourglass,
  Skull,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../utils/sound';

interface CountryLifeData {
  id: string;
  name: string;
  flag: string;
  expectancy: number; // in years
}

const COUNTRY_LIFE_EXPECTANCY: CountryLifeData[] = [
  { id: 'global', name: 'Global Average', flag: '🌐', expectancy: 73.4 },
  { id: 'my', name: 'Myanmar', flag: '🇲🇲', expectancy: 67.1 },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', expectancy: 84.6 },
  { id: 'sg', name: 'Singapore', flag: '🇸🇬', expectancy: 84.1 },
  { id: 'kr', name: 'South Korea', flag: '🇰🇷', expectancy: 83.7 },
  { id: 'ch', name: 'Switzerland', flag: '🇨🇭', expectancy: 84.0 },
  { id: 'th', name: 'Thailand', flag: '🇹🇭', expectancy: 77.7 },
  { id: 'us', name: 'United States', flag: '🇺🇸', expectancy: 77.5 },
  { id: 'gb', name: 'United Kingdom', flag: '🇬🇧', expectancy: 81.3 },
  { id: 'cn', name: 'China', flag: '🇨🇳', expectancy: 78.2 },
  { id: 'in', name: 'India', flag: '🇮🇳', expectancy: 70.8 },
  { id: 'au', name: 'Australia', flag: '🇦🇺', expectancy: 83.3 },
  { id: 'de', name: 'Germany', flag: '🇩🇪', expectancy: 81.0 },
  { id: 'fr', name: 'France', flag: '🇫🇷', expectancy: 82.5 },
  { id: 'ca', name: 'Canada', flag: '🇨🇦', expectancy: 82.8 },
  { id: 'it', name: 'Italy', flag: '🇮🇹', expectancy: 83.4 },
  { id: 'es', name: 'Spain', flag: '🇪🇸', expectancy: 83.6 },
  { id: 'ae', name: 'United Arab Emirates', flag: '🇦🇪', expectancy: 79.2 },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', expectancy: 76.9 },
  { id: 'my-sea', name: 'Malaysia', flag: '🇲🇾', expectancy: 76.3 },
  { id: 'vn', name: 'Vietnam', flag: '🇻🇳', expectancy: 75.4 },
  { id: 'ph', name: 'Philippines', flag: '🇵🇭', expectancy: 71.2 },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', expectancy: 71.7 },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Props {
  onFlipBack?: () => void;
  onSpin360?: () => void;
}

export const LifeExpectancyCard: React.FC<Props> = ({ onFlipBack }) => {
  const [birthDateStr, setBirthDateStr] = useState<string>(() => {
    try {
      return localStorage.getItem('auracalc_dob') || '2000-01-01';
    } catch {
      return '2000-01-01';
    }
  });

  const [selectedCountryId, setSelectedCountryId] = useState<string>(() => {
    try {
      return localStorage.getItem('auracalc_country_exp') || 'my';
    } catch {
      return 'my';
    }
  });

  const [now, setNow] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Calendar View State for easy year / month jumping
  const initialDate = new Date(birthDateStr);
  const [calYear, setCalYear] = useState<number>(!isNaN(initialDate.getFullYear()) ? initialDate.getFullYear() : 2000);
  const [calMonth, setCalMonth] = useState<number>(!isNaN(initialDate.getMonth()) ? initialDate.getMonth() : 0);

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDateChange = (val: string) => {
    setBirthDateStr(val);
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      setCalYear(d.getFullYear());
      setCalMonth(d.getMonth());
    }
    try {
      localStorage.setItem('auracalc_dob', val);
    } catch {
      // Ignore
    }
  };

  const handleCountryChange = (id: string) => {
    setSelectedCountryId(id);
    try {
      localStorage.setItem('auracalc_country_exp', id);
    } catch {
      // Ignore
    }
  };

  const selectedCountry =
    COUNTRY_LIFE_EXPECTANCY.find((c) => c.id === selectedCountryId) ||
    COUNTRY_LIFE_EXPECTANCY[0];

  // Age & Remaining Life Calculations
  const birthDate = new Date(birthDateStr);
  const isValidDate = !isNaN(birthDate.getTime()) && birthDate < now;

  let currentAgeYears = 0;
  let currentAgeDays = 0;
  let currentAgeHours = 0;
  let currentAgeMins = 0;
  let currentAgeSecs = 0;

  let remainingYears = 0;
  let remainingDays = 0;
  let isBorrowedTime = false;
  let percentageLived = 0;
  let estimatedHeartbeats = 0;

  if (isValidDate) {
    const diffMs = now.getTime() - birthDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffDaysTotal = Math.floor(diffSecs / 86400);

    let years = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    const dayDiff = now.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      years--;
    }

    const lastBirthday = new Date(
      now.getFullYear() - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0),
      birthDate.getMonth(),
      birthDate.getDate()
    );
    const msSinceBirthday = now.getTime() - lastBirthday.getTime();
    const daysSinceBirthday = Math.floor(msSinceBirthday / (1000 * 60 * 60 * 24));

    currentAgeYears = Math.max(0, years);
    currentAgeDays = Math.max(0, daysSinceBirthday);
    currentAgeHours = now.getHours();
    currentAgeMins = now.getMinutes();
    currentAgeSecs = now.getSeconds();

    const totalExpectedDays = Math.floor(selectedCountry.expectancy * 365.25);
    const daysRemainingTotal = totalExpectedDays - diffDaysTotal;

    if (daysRemainingTotal >= 0) {
      remainingYears = Math.floor(daysRemainingTotal / 365.25);
      remainingDays = Math.floor(daysRemainingTotal % 365.25);
      percentageLived = Math.min(100, Math.max(0, (diffDaysTotal / totalExpectedDays) * 100));
    } else {
      isBorrowedTime = true;
      const bonusDays = Math.abs(daysRemainingTotal);
      remainingYears = Math.floor(bonusDays / 365.25);
      remainingDays = Math.floor(bonusDays % 365.25);
      percentageLived = 100;
    }

    estimatedHeartbeats = Math.floor(
      diffDaysTotal * 109440 + (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) * 1.26
    );
  }

  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const formatted = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    handleDateChange(formatted);
    setIsCalendarOpen(false);
    sound.playGlassTap(1250, 0.05, 0.15);
  };

  const formattedDisplayDate = isValidDate
    ? birthDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : birthDateStr;

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none overflow-y-auto text-white">
      {/* Top Bar: Discreet Flip Icon */}
      {onFlipBack && (
        <div className="absolute top-3 right-4 z-20">
          <button
            onClick={() => {
              sound.playGlassTap(1100, 0.04, 0.12);
              onFlipBack();
            }}
            className="prevent-swipe p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-white/70 hover:text-cyan-300 transition-all cursor-pointer shadow-sm"
            title="Flip to Calculator"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-between py-2 space-y-2">
        {/* ========================================================
            HYPER-REALISTIC 3D BIOLOGICAL HUMAN HEART
           ======================================================== */}
        <div className="relative flex flex-col items-center justify-center pt-2">
          {/* Ambient Glowing Atmospheric Blood Chambers */}
          <div className="absolute w-36 h-36 rounded-full bg-red-600/25 blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute w-24 h-24 rounded-full bg-rose-500/20 blur-xl pointer-events-none" />

          {/* Biological Heart Muscle Motion Container */}
          <motion.div
            animate={{
              scale: [1, 1.13, 1.04, 1.21, 1],
              rotate: [0, -2, 0.5, -1.5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.08,
              ease: 'easeInOut',
              times: [0, 0.14, 0.28, 0.44, 1],
            }}
            className="relative cursor-pointer group"
            onClick={() => sound.playGlassTap(650, 0.08, 0.2)}
            title="Living Anatomical Human Heart (Real-time Pumping)"
          >
            <svg
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_4px_30px_rgba(220,38,38,0.7)]"
              viewBox="0 0 140 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="realMuscleGrad" cx="38%" cy="42%" r="68%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="28%" stopColor="#dc2626" />
                  <stop offset="55%" stopColor="#991b1b" />
                  <stop offset="85%" stopColor="#5b0b0b" />
                  <stop offset="100%" stopColor="#2c0404" />
                </radialGradient>

                <radialGradient id="realAortaGrad" cx="45%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="30%" stopColor="#e11d48" />
                  <stop offset="70%" stopColor="#9f1239" />
                  <stop offset="100%" stopColor="#4c0519" />
                </radialGradient>

                <linearGradient id="realVenaCavaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="40%" stopColor="#0284c7" />
                  <stop offset="80%" stopColor="#1e3a8a" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>

                <linearGradient id="realPulmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="50%" stopColor="#0369a1" />
                  <stop offset="100%" stopColor="#172554" />
                </linearGradient>

                <radialGradient id="fatDepositGrad" cx="40%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#fde047" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="moistSheen" x1="20%" y1="10%" x2="70%" y2="90%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                <filter id="realHeartShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#7f1d1d" floodOpacity="0.7" />
                </filter>
              </defs>

              {/* 1. Superior Vena Cava */}
              <path
                d="M45 18 C46 12, 54 10, 58 14 C62 18, 61 28, 59 36 C54 34, 48 30, 45 18 Z"
                fill="url(#realVenaCavaGrad)"
              />
              <path d="M47 18 C50 14, 56 14, 57 18" stroke="#7dd3fc" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

              {/* 2. Aortic Arch */}
              <path
                d="M57 24 C58 10, 78 8, 86 18 C92 27, 90 38, 86 44 C82 39, 72 32, 57 24 Z"
                fill="url(#realAortaGrad)"
              />
              <path d="M66 12 L64 4 C64 2, 67 2, 67 4 L69 11" fill="url(#realAortaGrad)" stroke="#fca5a5" strokeWidth="0.8" />
              <path d="M74 9 L75 3 C75 1, 78 1, 78 3 L78 9" fill="url(#realAortaGrad)" stroke="#fca5a5" strokeWidth="0.8" />
              <path d="M82 12 L86 5 C86 3, 89 4, 88 6 L84 13" fill="url(#realAortaGrad)" stroke="#fca5a5" strokeWidth="0.8" />

              {/* 3. Pulmonary Trunk */}
              <path
                d="M66 32 C74 30, 83 36, 79 46 C72 49, 62 42, 66 32 Z"
                fill="url(#realPulmGrad)"
              />
              <path
                d="M80 38 C88 36, 94 40, 92 46 C87 47, 82 43, 80 38 Z"
                fill="url(#realPulmGrad)"
                opacity="0.85"
              />

              {/* 4. Right Atrium & Left Atrium */}
              <path
                d="M36 44 C34 33, 49 28, 58 38 C51 49, 41 51, 36 44 Z"
                fill="url(#realMuscleGrad)"
              />
              <path
                d="M82 39 C91 32, 103 39, 98 52 C91 53, 84 48, 82 39 Z"
                fill="url(#realMuscleGrad)"
              />

              {/* 5. Ventricular Muscular Mass */}
              <path
                d="M35 48 C27 64, 34 94, 62 120 C67 124, 71 123, 76 117 C97 88, 108 65, 98 49 C88 35, 45 34, 35 48 Z"
                fill="url(#realMuscleGrad)"
                filter="url(#realHeartShadow)"
              />

              {/* 6. Epicardial Adipose */}
              <path
                d="M50 44 C58 40, 74 42, 84 46 C78 52, 68 50, 56 48 Z"
                fill="url(#fatDepositGrad)"
              />
              <path
                d="M64 56 C68 62, 70 72, 68 84 C64 80, 63 68, 64 56 Z"
                fill="url(#fatDepositGrad)"
              />

              {/* 7. Branching Coronary Arteries */}
              <path
                d="M67 48 C65 65, 71 88, 70 116"
                stroke="#fecaca"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M67 48 C65 65, 71 88, 70 116"
                stroke="#dc2626"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M69 49 C67 66, 73 89, 72 114"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.8"
              />
              <path d="M66 66 C57 72, 50 78, 47 84" stroke="#fca5a5" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M47 84 C44 87, 43 92, 42 96" stroke="#f87171" strokeWidth="0.8" strokeLinecap="round" />
              <path d="M68 82 C77 86, 85 91, 88 97" stroke="#fca5a5" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M69 96 C63 101, 59 106, 58 110" stroke="#fca5a5" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M70 104 C74 107, 78 111, 79 114" stroke="#f87171" strokeWidth="0.8" strokeLinecap="round" />

              {/* 8. Specular Highlights */}
              <path
                d="M42 54 C38 66, 43 85, 52 98 C48 86, 45 71, 47 58 C48 54, 46 51, 42 54 Z"
                fill="url(#moistSheen)"
              />
              <ellipse cx="62" cy="116" rx="3" ry="1.5" fill="#ffffff" opacity="0.4" />
            </svg>
          </motion.div>

          {/* Heart rate indicator / estimated beats */}
          <div className="flex items-center gap-1.5 mt-1.5 px-3 py-0.5 rounded-full bg-red-950/70 border border-red-500/40 text-[10px] text-red-300 font-mono tracking-wider shadow-inner backdrop-blur-md">
            <Activity className="w-3 h-3 text-red-400 animate-pulse" />
            <span>~{estimatedHeartbeats.toLocaleString()} BEATS PULSED</span>
          </div>
        </div>

        {/* ========================================================
            PURE GREEN / EMERALD ANIMATED WAVEFORM (NO BLACK BOX, NO TEXT)
           ======================================================== */}
        <div className="w-full px-4 py-1 flex items-center justify-center">
          <div className="relative w-full h-8 overflow-hidden flex items-center">
            {/* Glowing ECG Line */}
            <svg className="w-full h-full" viewBox="0 0 300 24" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pureGreenWave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
                </linearGradient>
                <filter id="waveGlow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                d="
                  M 0 12 
                  L 25 12 
                  Q 35 12 40 15 
                  Q 45 9 50 12 
                  L 65 12 
                  L 70 8 
                  L 74 18 
                  L 78 2 
                  L 84 22 
                  L 88 12 
                  L 95 12 
                  Q 102 7 110 12 
                  L 140 12
                  L 165 12 
                  Q 175 12 180 15 
                  Q 185 9 190 12 
                  L 205 12 
                  L 210 8 
                  L 214 18 
                  L 218 2 
                  L 224 22 
                  L 228 12 
                  L 235 12 
                  Q 242 7 250 12 
                  L 300 12
                "
                fill="none"
                stroke="url(#pureGreenWave)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#waveGlow)"
              />
            </svg>

            {/* Glowing sweep shine moving left-to-right */}
            <motion.div
              animate={{
                left: ['-10%', '105%'],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'linear',
              }}
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_#34d399,0_0_24px_#10b981] pointer-events-none"
            />
          </div>
        </div>

        {/* ========================================================
            UNIFIED HORIZONTAL FILTERS (2 FILTERS SIDE-BY-SIDE)
           ======================================================== */}
        <div className="w-full relative">
          <div className="w-full grid grid-cols-2 gap-2">
            {/* Filter 1: Calendar Date Trigger Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  sound.playGlassTap(1150, 0.04, 0.1);
                  setIsCalendarOpen(true);
                }}
                className="prevent-swipe w-full h-10 px-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] active:scale-95 border border-white/20 hover:border-cyan-400/60 backdrop-blur-md flex items-center justify-between text-xs text-white transition-all cursor-pointer shadow-sm group"
                title="Open Calendar to select birth date"
              >
                <div className="flex items-center gap-2 truncate">
                  <CalendarIcon className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="font-mono text-white/90 truncate">{formattedDisplayDate}</span>
                </div>
              </button>

              <input
                ref={dateInputRef}
                type="date"
                value={birthDateStr}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChange(e.target.value)}
                className="sr-only"
              />
            </div>

            {/* Filter 2: Country Expectancy Dropdown */}
            <div className="relative">
              <div className="prevent-swipe w-full h-10 px-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 hover:border-emerald-400/60 backdrop-blur-md flex items-center justify-between text-xs text-white transition-all shadow-sm">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <select
                    value={selectedCountryId}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-transparent text-white text-xs font-medium focus:outline-none cursor-pointer truncate"
                  >
                    {COUNTRY_LIFE_EXPECTANCY.map((c) => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {c.flag} {c.name} ({c.expectancy}y)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Calculation Output Display (Frameless on Original Transparent Background) */}
        <div className="w-full space-y-1 px-1">
          {/* 1. Current Age Display */}
          <div className="px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-white/60 tracking-wider">
                  Current Age Lived
                </div>
                <div className="text-[11px] text-white/40 font-mono">
                  {currentAgeHours.toString().padStart(2, '0')}:
                  {currentAgeMins.toString().padStart(2, '0')}:
                  {currentAgeSecs.toString().padStart(2, '0')} ticking
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base sm:text-lg font-light text-cyan-200 font-mono">
                {currentAgeYears} <span className="text-xs text-white/60">Years</span> {currentAgeDays} <span className="text-xs text-white/60">Days</span>
              </div>
            </div>
          </div>

          {/* 2. Remaining Lifespan Display - NO big box, NO borders, Pure text on original transparent frosted glass */}
          <div className="px-2 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skull className={`w-5 h-5 ${isBorrowedTime ? 'text-amber-400' : 'text-rose-400'}`} />
              <div>
                <div className="text-[11px] uppercase font-bold tracking-wider text-white/90">
                  {isBorrowedTime ? 'Bonus Time Exceeded' : 'Estimated Remaining Life'}
                </div>
                <div className="text-[11px] text-white/50">
                  {selectedCountry.name} ({selectedCountry.expectancy} yrs)
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]">
                {isBorrowedTime ? `+${remainingYears}y ${remainingDays}d` : `${remainingYears} Years, ${remainingDays} Days`}
              </div>
            </div>
          </div>

          {/* Progress Life Meter */}
          <div className="space-y-1 px-2 pt-1">
            <div className="flex items-center justify-between text-[10px] text-white/50">
              <span>Mortality Progress</span>
              <span className="font-mono text-white/80">{percentageLived.toFixed(2)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentageLived}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  percentageLived > 80
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                    : 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          FULL CALENDAR PICKER MODAL DIALOG
         ======================================================== */}
      <AnimatePresence>
        {isCalendarOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.2 }}
              className="prevent-swipe w-full max-w-sm p-5 rounded-3xl bg-slate-950 border border-cyan-400/50 shadow-2xl text-white space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold tracking-tight text-white">
                    Select Date of Birth
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Year & Month Selectors */}
              <div className="flex items-center justify-between gap-2">
                <select
                  value={calMonth}
                  onChange={(e) => setCalMonth(Number(e.target.value))}
                  className="flex-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={m} value={idx} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={calYear}
                  onChange={(e) => setCalYear(Number(e.target.value))}
                  className="w-28 px-2.5 py-1.5 text-xs font-mono font-semibold rounded-xl bg-white/10 border border-white/20 text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {Array.from(
                    { length: new Date().getFullYear() - 1920 + 1 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((y) => (
                    <option key={y} value={y} className="bg-slate-900 text-white">
                      {y}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 0) {
                        setCalMonth(11);
                        setCalYear((prev) => prev - 1);
                      } else {
                        setCalMonth((prev) => prev - 1);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 11) {
                        setCalMonth(0);
                        setCalYear((prev) => prev + 1);
                      } else {
                        setCalMonth((prev) => prev + 1);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-white/50">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-8 h-8" />
                ))}

                {Array.from({ length: daysInCalMonth }, (_, i) => i + 1).map((day) => {
                  const isSelected =
                    isValidDate &&
                    birthDate.getFullYear() === calYear &&
                    birthDate.getMonth() === calMonth &&
                    birthDate.getDate() === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`w-8 h-8 rounded-xl font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.9)] scale-105'
                          : 'hover:bg-white/15 text-white/90'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    dateInputRef.current?.showPicker?.();
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-white/15 text-cyan-300 transition-colors cursor-pointer"
                >
                  Use Native Wheel
                </button>

                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer shadow-md"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
