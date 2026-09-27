import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';
import { sound } from '../utils/sound';

export interface MarketItem {
  id: 'gold' | 'oil' | 'usd' | 'btc';
  name: string;
  symbol: string;
  price: number;
  changePercent: number;
  isPositive: boolean;
  prefix: string;
  sparkline: number[];
}

const DEFAULT_MARKET_DATA: MarketItem[] = [
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU',
    price: 2658.40,
    changePercent: 0.72,
    isPositive: true,
    prefix: '$',
    sparkline: [2630, 2638, 2635, 2648, 2642, 2652, 2658],
  },
  {
    id: 'oil',
    name: 'Oil',
    symbol: 'WTI',
    price: 71.45,
    changePercent: -0.45,
    isPositive: false,
    prefix: '$',
    sparkline: [73.2, 72.8, 72.4, 71.9, 72.2, 71.6, 71.45],
  },
  {
    id: 'usd',
    name: 'Dollar',
    symbol: 'DXY',
    price: 101.35,
    changePercent: 0.16,
    isPositive: true,
    prefix: '',
    sparkline: [100.9, 101.0, 101.1, 101.05, 101.2, 101.28, 101.35],
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 64820,
    changePercent: 2.65,
    isPositive: true,
    prefix: '$',
    sparkline: [62400, 63100, 62900, 63800, 63400, 64200, 64820],
  },
];

const INITIAL_HEADLINES: string[] = [
  'Gold rallies near record highs as central banks expand precious metal holdings',
  'Bitcoin surges past key levels driven by institutional spot exchange volume',
  'Global stock indices advance amid steady interest rate benchmarks',
  'Crude oil trading steadies following international energy supply revisions',
  'US Dollar Index holds firm at 101.4 as global commerce metrics balance',
  'IMF upgrades world economic development projection led by technological innovation',
  'Global semiconductor production expands to meet soaring artificial intelligence demand',
  'Clean energy and modern infrastructure investments accelerate worldwide',
];

interface Props {
  onSelectPrice?: (priceStr: string) => void;
}

export const WorldMarketTicker: React.FC<Props> = ({ onSelectPrice }) => {
  const [items, setItems] = useState<MarketItem[]>(DEFAULT_MARKET_DATA);
  const [headlines, setHeadlines] = useState<string[]>(INITIAL_HEADLINES);
  const isFetchingRef = useRef<boolean>(false);

  // 1. Live Market Online Fetcher
  const fetchLiveMarketOnline = async () => {
    if (isFetchingRef.current || !navigator.onLine) return;
    isFetchingRef.current = true;

    try {
      const btcRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
        { signal: AbortSignal.timeout(4000) }
      );
      if (btcRes.ok) {
        const data = await btcRes.json();
        if (data?.bitcoin?.usd) {
          const liveBtc = data.bitcoin.usd;
          const liveBtcChange = Number((data.bitcoin.usd_24h_change || 0).toFixed(2));
          setItems((prev) =>
            prev.map((it) => {
              if (it.id === 'btc') {
                return {
                  ...it,
                  price: liveBtc,
                  changePercent: liveBtcChange,
                  isPositive: liveBtcChange >= 0,
                  sparkline: [...it.sparkline.slice(1), liveBtc],
                };
              }
              return it;
            })
          );
        }
      }
    } catch {
      // Fallback cleanly
    } finally {
      isFetchingRef.current = false;
    }
  };

  // 2. Live World Breaking News Online Fetcher
  const fetchLiveNewsOnline = async () => {
    if (!navigator.onLine) return;
    try {
      const res = await fetch(
        'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml',
        { signal: AbortSignal.timeout(4500) }
      );
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json?.items) && json.items.length > 0) {
          const fetchedTitles: string[] = json.items
            .map((item: { title: string }) => item.title?.trim())
            .filter((t: string) => Boolean(t && t.length > 10))
            .slice(0, 10);
          if (fetchedTitles.length >= 4) {
            setHeadlines(fetchedTitles);
          }
        }
      }
    } catch {
      // Retain existing headlines
    }
  };

  // Periodic online sync & micro-tick simulation
  useEffect(() => {
    fetchLiveMarketOnline();
    fetchLiveNewsOnline();

    // Online refresh interval (every 45 seconds)
    const onlineSyncTimer = setInterval(() => {
      fetchLiveMarketOnline();
      fetchLiveNewsOnline();
    }, 45000);

    // Micro-fluctuation realistic ticker (every 4 seconds)
    const tickerTimer = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          if (Math.random() > 0.45) return item;
          const delta = (Math.random() - 0.48) * 0.002;
          const newPrice = Number((item.price * (1 + delta)).toFixed(item.id === 'btc' ? 0 : 2));
          const newChange = Number((item.changePercent + delta * 20).toFixed(2));
          return {
            ...item,
            price: newPrice,
            changePercent: newChange,
            isPositive: newChange >= 0,
            sparkline: [...item.sparkline.slice(1), newPrice],
          };
        })
      );
    }, 4000);

    return () => {
      clearInterval(onlineSyncTimer);
      clearInterval(tickerTimer);
    };
  }, []);

  const handleItemClick = (item: MarketItem) => {
    sound.playGlassTap(1200, 0.04, 0.12);
    if (onSelectPrice) {
      onSelectPrice(String(item.price));
    }
  };

  // Mini Sparkline SVG Renderer
  const renderSparklineSvg = (data: number[], isPositive: boolean) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 56;
    const height = 18;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const strokeColor = isPositive ? '#34d399' : '#f87171';
    const gradientId = `spark-${isPositive ? 'up' : 'down'}`;

    return (
      <svg className="w-full h-4 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={`${pathData} L ${width},${height} L 0,${height} Z`} fill={`url(#${gradientId})`} />
        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="1.8"
            fill={strokeColor}
            className="animate-ping origin-center"
          />
        )}
      </svg>
    );
  };

  // Continuous repeating text for marquee crawl
  const marqueeText = headlines.join('   ✦   ');

  return (
    <div className="relative z-20 w-full px-3 pb-3 pt-0.5 select-none space-y-1.5">
      {/* ========================================================
          1. 4 WORLD MARKET ASSETS (GOLD, OIL, DOLLAR, BITCOIN)
          Pure transparent frosted glass - Frameless
         ======================================================== */}
      <div className="w-full grid grid-cols-4 gap-1.5 items-center">
        {items.map((item) => {
          const formattedPrice =
            item.id === 'btc'
              ? item.price.toLocaleString()
              : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => handleItemClick(item)}
              title={`Click to calculate with ${item.name}: ${item.prefix}${formattedPrice}`}
              className="relative flex flex-col items-center justify-between py-1 px-1 rounded-xl bg-transparent hover:bg-white/[0.08] active:bg-white/[0.12] transition-all cursor-pointer group"
            >
              {/* Asset Name & 24h Change */}
              <div className="w-full flex items-center justify-between text-[10px] tracking-tight">
                <span className="font-semibold text-white/90 group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </span>
                <span
                  className={`text-[9px] font-mono font-medium ${
                    item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.isPositive ? '+' : ''}
                  {item.changePercent}%
                </span>
              </div>

              {/* Sparkline Mini Graph */}
              <div className="w-full py-0.5 pointer-events-none">
                {renderSparklineSvg(item.sparkline, item.isPositive)}
              </div>

              {/* Live Price Display */}
              <div className="w-full text-center">
                <span className="text-[11px] font-mono font-light text-white tracking-tighter drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                  {item.prefix}{formattedPrice}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ========================================================
          2. WORLD BREAKING NEWS TICKER CRAWLER
          - Pure transparent frosted glass (NO red badge, NO red text)
          - Dark text scrolling right-to-left
         ======================================================== */}
      <div className="relative w-full h-6 rounded-full overflow-hidden flex items-center bg-white/[0.15] backdrop-blur-md border border-white/20 shadow-inner px-2.5">
        {/* Subtle Frosted Globe Icon (No red button) */}
        <div className="shrink-0 flex items-center gap-1 pr-2 text-slate-900/80">
          <Globe className="w-3 h-3 text-slate-950 animate-spin-slow" />
        </div>

        {/* Marquee Track: Smooth Continuous Horizontal Scroll Right-to-Left */}
        <div className="relative flex-1 h-full overflow-hidden flex items-center">
          <div className="inline-flex whitespace-nowrap animate-marquee items-center font-bold text-[11px] tracking-tight text-slate-950 font-sans selection:bg-cyan-500/30">
            <span className="mr-8">{marqueeText}</span>
            <span className="mr-8">✦   {marqueeText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
