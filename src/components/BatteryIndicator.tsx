import { useState, useEffect, useRef } from 'react';
import { Zap, AlertTriangle } from 'lucide-react';

interface BatteryIndicatorProps {
  isDarkMode: boolean;
}

export default function BatteryIndicator({ isDarkMode }: BatteryIndicatorProps) {
  const [level, setLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);
  const prevLevelRef = useRef<number | null>(null);

  // Génération sonore autonome via AudioContext (bip d'alerte sans assets externes)
  const playLowBatteryBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // Double tonalité d'avertissement grave
      playTone(440, now, 0.18);
      playTone(330, now + 0.22, 0.35);
    } catch (e) {
      console.warn("Audio non autorisé ou indisponible :", e);
    }
  };

  useEffect(() => {
    let batteryInstance: any = null;

    const updateBattery = (battery: any) => {
      const rawLevel = battery.level;
      const normalizedLevel = rawLevel <= 1 ? Math.round(rawLevel * 100) : Math.round(rawLevel);

      setLevel(normalizedLevel);
      setCharging(battery.charging);

      // Déclenchement de l'alerte sonore si on passe sous les 15% hors charge
      if (!battery.charging && normalizedLevel <= 15) {
        if (!hasAlerted || (prevLevelRef.current !== null && prevLevelRef.current > 15)) {
          playLowBatteryBeep();
          setHasAlerted(true);
        }
      } else if (battery.charging || normalizedLevel > 15) {
        setHasAlerted(false);
      }

      prevLevelRef.current = normalizedLevel;
    };

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        updateBattery(battery);

        battery.addEventListener('levelchange', () => updateBattery(battery));
        battery.addEventListener('chargingchange', () => updateBattery(battery));
      });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', () => updateBattery(batteryInstance));
        batteryInstance.removeEventListener('chargingchange', () => updateBattery(batteryInstance));
      }
    };
  }, [hasAlerted]);

  if (level === null) return null;

  const isCritical = !charging && level <= 15;

  const getTheme = () => {
    if (charging) {
      return {
        text: 'text-blue-500',
        bg: isDarkMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200',
        bar: 'bg-blue-500',
        stroke: '#3B82F6'
      };
    }
    if (isCritical) {
      return {
        text: 'text-rose-500',
        bg: isDarkMode ? 'bg-rose-500/20 border-rose-500' : 'bg-rose-100 border-rose-400',
        bar: 'bg-rose-600',
        stroke: '#E11D48'
      };
    }
    if (level <= 20) {
      return {
        text: 'text-rose-500',
        bg: isDarkMode ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-50 border-rose-200',
        bar: 'bg-rose-500',
        stroke: '#F43F5E'
      };
    }
    if (level <= 50) {
      return {
        text: 'text-amber-500',
        bg: isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200',
        bar: 'bg-amber-500',
        stroke: '#F59E0B'
      };
    }
    return {
      text: 'text-emerald-500',
      bg: isDarkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200',
      bar: 'bg-emerald-500',
      stroke: '#10B981'
    };
  };

  const theme = getTheme();
  const fillWidth = Math.max(1, Math.round((Math.min(level, 100) / 100) * 11));

  return (
    <div
      onClick={() => {
        // En cas de batterie critique, un tap manuel rejoue le bip de rappel
        if (isCritical) playLowBatteryBeep();
      }}
      className={`relative flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border text-xs font-black select-none transition-all cursor-pointer ${
        theme.bg
      } ${theme.text} ${
        isCritical 
          ? 'animate-pulse ring-2 ring-rose-500/70 shadow-lg shadow-rose-500/30' 
          : 'shadow-xs'
      }`}
      title={
        isCritical 
          ? `Batterie critique (${level}%) : veuillez brancher la tablette !` 
          : `Batterie : ${level}% ${charging ? '(En charge)' : ''}`
      }
    >
      <div className="relative flex items-center justify-center">
        {/* Jauge vectorielle dynamique */}
        <svg
          viewBox="0 0 24 14"
          className="w-5 h-3.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="1"
            y="1"
            width="18"
            height="12"
            rx="3"
            stroke={theme.stroke}
            strokeWidth="2"
          />
          <path
            d="M21 4.5C21.8 4.5 22.5 5.2 22.5 6V8C22.5 8.8 21.8 9.5 21 9.5"
            stroke={theme.stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect
            x="3.5"
            y="3.5"
            width={fillWidth}
            height="7"
            rx="1.5"
            className={`${theme.bar} transition-all duration-300`}
            fill="currentColor"
          />
        </svg>

        {/* Éclair de charge */}
        {charging && (
          <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-[1px] shadow-xs">
            <Zap className="w-2.5 h-2.5 fill-white stroke-[2]" />
          </div>
        )}

        {/* Triangle d'avertissement clignotant sous 15% */}
        {isCritical && (
          <div className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-[2px] shadow-sm animate-bounce">
            <AlertTriangle className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}
      </div>

      <span className="font-mono tracking-tight">{level}%</span>
    </div>
  );
}