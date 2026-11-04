import { useState, useEffect } from 'react';
import { 
  BatteryCharging, 
  BatteryFull, 
  BatteryMedium, 
  BatteryLow, 
  BatteryWarning 
} from 'lucide-react';

interface BatteryState {
  level: number;
  charging: boolean;
}

export default function BatteryIndicator({ isDarkMode }: { isDarkMode: boolean }) {
  const [battery, setBattery] = useState<BatteryState | null>(null);

  useEffect(() => {
    const nav = navigator as any;
    if (!nav.getBattery) return;

    let batteryManager: any = null;

    const updateBattery = () => {
      if (!batteryManager) return;
      setBattery({
        level: Math.round(batteryManager.level * 100),
        charging: batteryManager.charging
      });
    };

    nav.getBattery().then((bm: any) => {
      batteryManager = bm;
      updateBattery();

      bm.addEventListener('levelchange', updateBattery);
      bm.addEventListener('chargingchange', updateBattery);
    }).catch(() => {});

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', updateBattery);
        batteryManager.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  if (!battery) return null;

  const { level, charging } = battery;
  const isCritical = level <= 15;
  const isLow = level <= 30;

  // Sélection de l'icône dynamique selon le niveau réel
  const renderBatteryIcon = () => {
    if (charging) {
      return <BatteryCharging className="w-4 h-4 text-emerald-400 stroke-[2.2]" />;
    }
    if (isCritical) {
      return <BatteryWarning className="w-4 h-4 text-rose-500 stroke-[2.2] animate-pulse" />;
    }
    if (isLow) {
      return <BatteryLow className="w-4 h-4 text-amber-500 stroke-[2.2]" />;
    }
    if (level <= 65) {
      return <BatteryMedium className="w-4 h-4 text-[#FF4C85] stroke-[2.2]" />;
    }
    return <BatteryFull className="w-4 h-4 text-emerald-500 stroke-[2.2]" />;
  };

  return (
    <div
      title={charging ? `En charge (${level}%)` : `Sur batterie (${level}%)`}
      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all ${
        isCritical && !charging
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 animate-pulse'
          : isDarkMode
          ? 'bg-slate-900/80 border-slate-800 text-slate-300'
          : 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'
      }`}
    >
      {renderBatteryIcon()}
      <span>{level}%</span>
    </div>
  );
}