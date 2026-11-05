import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import AttendanceHub from './components/AttendanceHub';
import KioskAttendance from './components/KioskAttendance';
import AttendanceModule from './components/AttendanceModule';
import TournamentModule from './components/TournamentModule';
import BatteryIndicator from './components/BatteryIndicator';
import { 
  Users, 
  Dumbbell, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Sun, 
  Moon 
} from 'lucide-react';

function ShuttlecockIcon({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="badGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4C85" />
          <stop offset="45%" stopColor="#C84BF8" />
          <stop offset="100%" stopColor="#794CFF" />
        </linearGradient>

        <linearGradient id="featherFill" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FF4C85" stopOpacity="0.28" />
          <stop offset="50%" stopColor="#A855F7" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id="corkShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5E8E" />
          <stop offset="60%" stopColor="#8C52FF" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#C84BF8" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#softGlow)" transform="rotate(-15 60 60)">
        <path
          d="M24 24 C 42 16, 78 16, 96 24 L72 74 C 65 72, 55 72, 48 74 Z"
          fill="url(#featherFill)"
        />

        <path d="M24 24 L48 74 L54 73 L36 21 Z" fill="url(#badGradient)" fillOpacity="0.15" />
        <path d="M48 20 L57 73 L63 73 L60 19 Z" fill="url(#badGradient)" fillOpacity="0.22" />
        <path d="M72 21 L63 73 L69 74 L84 24 Z" fill="url(#badGradient)" fillOpacity="0.15" />

        <g stroke="url(#badGradient)" strokeWidth="2.2" strokeLinecap="round">
          <line x1="25" y1="24" x2="48" y2="74" />
          <line x1="38" y1="21" x2="53" y2="73" />
          <line x1="50" y1="19" x2="57" y2="73" />
          <line x1="62" y1="19" x2="63" y2="73" />
          <line x1="74" y1="21" x2="67" y2="73" />
          <line x1="87" y1="24" x2="72" y2="74" />
        </g>

        <path
          d="M31 42 Q 60 49 81 42"
          stroke="url(#badGradient)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M38 58 Q 60 64 74 58"
          stroke="url(#badGradient)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        <path
          d="M24 24 Q 60 29 96 24"
          stroke="url(#badGradient)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        <path
          d="M48 74 C 44 76, 44 86, 50 94 C 55 100, 65 100, 70 94 Z"
          fill="url(#corkShine)"
        />

        <path
          d="M48 74 Q 60 77 72 74"
          stroke="#FFFFFF"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        <circle cx="56" cy="85" r="2.5" fill="#FFFFFF" fillOpacity="0.75" />
      </g>
    </svg>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'attendance_hub' | 'kiosk' | 'attendance_admin' | 'tournament'>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('badzone_theme') === 'dark';
  });

  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ present: 0, total: 0 });

  // Détection de l'environnement DEV via Supabase ou le mode de compilation Vite
  const isDev = import.meta.env.VITE_SUPABASE_URL?.includes('dev') || import.meta.env.DEV;
  const logoSrc = isDev ? '/icons/icon-dev-192.png' : '/icons/icon-prod-192.png';

  useEffect(() => {
    async function checkSupabaseConnection() {
      try {
        const { count: totalCount, error } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('active', true);
          
        const today = new Date().toISOString().split('T')[0];
        const { count: presCount } = await supabase
          .from('attendances')
          .select('*', { count: 'exact', head: true })
          .eq('session_date', today)
          .eq('present', true);

        setDbConnected(!error);
        setStats({ total: totalCount || 0, present: presCount || 0 });
      } catch {
        setDbConnected(false);
      }
    }

    checkSupabaseConnection();
  }, [currentView]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('badzone_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('badzone_theme', 'light');
    }
  }, [isDarkMode]);

  // Mode borne kiosque plein écran sans navbar
  if (currentView === 'kiosk') {
    return <KioskAttendance onExit={() => setCurrentView('attendance_hub')} isDarkMode={isDarkMode} />;
  }

  const modules = [
    {
      id: 'attendance',
      title: 'Effectif & Présences',
      subtitle: 'Émargement express & groupes',
      description: 'Pointage tactile en 15 secondes au gymnase, listing des joueurs par niveau et historique annuel des présences.',
      icon: Users,
      gradient: 'from-[#FF4C85] to-[#FF7B60]',
      shadow: 'shadow-pink-500/25',
      features: ['Borne d’entrée', 'Gestion effectif', 'Pointage séance']
    },
    {
      id: 'training',
      title: 'Séances & Pédagogie',
      subtitle: 'Ateliers & chronomètres',
      description: 'Banque d’exercices par filière (routine, filet, cardio) avec timer de rotation et bips sonores audibles.',
      icon: Dumbbell,
      gradient: 'from-[#8C52FF] to-[#B24CF6]',
      shadow: 'shadow-purple-500/25',
      features: ['Banque d’ateliers', 'Timer de rotation', 'Plans personnalisés']
    },
    {
      id: 'tournament',
      title: 'Tournois & Matchs',
      subtitle: 'Poules, élimination & direct',
      description: 'Création modulaire selon les présents (poules, arbre), gestion au temps ou aux points et scores en direct.',
      icon: Trophy,
      gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      shadow: 'shadow-blue-500/25',
      features: ['Poules & Arbres auto', 'Temps ou points', 'Affichage direct']
    }
  ];

  return (
    <div className={`h-dvh w-full overflow-hidden select-none font-sans relative flex flex-col justify-between transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0B0914] text-slate-100' : 'bg-[#F6F5FD] text-slate-800'
    }`}>
      
      {/* Halos d'ambiance */}
      <div className={`absolute top-[-90px] left-[-70px] w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
        isDarkMode ? 'bg-gradient-to-br from-[#FF4C85]/20 via-[#8C52FF]/20 to-transparent opacity-60' : 'bg-gradient-to-br from-[#FF5E8E]/25 via-[#8C52FF]/20 to-transparent opacity-100'
      }`} />
      
      <div className={`absolute bottom-[-90px] right-[-70px] w-96 h-96 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
        isDarkMode ? 'bg-gradient-to-tl from-[#8C52FF]/25 via-[#FF4C85]/15 to-transparent opacity-60' : 'bg-gradient-to-tl from-[#8C52FF]/30 via-[#FF4C85]/15 to-transparent opacity-100'
      }`} />

      {/* Navbar principale universelle */}
      <header className="relative z-20 px-6 py-2.5 max-w-7xl mx-auto w-full flex items-center justify-between shrink-0">
        <div 
          onClick={() => setCurrentView('home')}
          className="flex items-center space-x-3 cursor-pointer select-none"
        >
          {/* Remplacement du bloc BZ par l'icône dynamique */}
          <img
            src={logoSrc}
            alt={isDev ? 'BadZone Dev' : 'BadZone'}
            className="w-9 h-9 rounded-xl object-contain shadow-md shadow-pink-500/20"
          />
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Bad<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4C85] to-[#8C52FF]">Zone</span>
            </span>
            {isDev && (
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-orange-500 text-white rounded-md shadow-sm">
                DEV
              </span>
            )}
          </div>
        </div>

        {/* Bloc d'actions à droite : Réseau, Thème, puis Batterie tout à droite */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Indicateur réseau / Supabase */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
            dbConnected === null
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              : dbConnected
              ? isDarkMode ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs'
              : isDarkMode ? 'bg-rose-950/40 border-rose-800/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs'
          }`}>
            {dbConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Mode en ligne</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="hidden sm:inline">Mode hors ligne</span>
              </>
            )}
          </div>

          {/* Toggle clair / sombre */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Basculer le thème"
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800 shadow-md shadow-purple-950/30' 
                : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white shadow-xs'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Indicateur de batterie tablette placé tout à droite */}
          <BatteryIndicator isDarkMode={isDarkMode} />
        </div>
      </header>

      {/* Vues conditionnelles */}
      {currentView === 'attendance_hub' ? (
        <AttendanceHub
          onBack={() => setCurrentView('home')}
          onSelectKiosk={() => setCurrentView('kiosk')}
          onSelectAdmin={() => setCurrentView('attendance_admin')}
          isDarkMode={isDarkMode}
          presentCount={stats.present}
          totalPlayers={stats.total}
        />
      ) : currentView === 'attendance_admin' ? (
        <AttendanceModule onBack={() => setCurrentView('attendance_hub')} isDarkMode={isDarkMode} />
      ) : currentView === 'tournament' ? (
        <TournamentModule onBack={() => setCurrentView('home')} isDarkMode={isDarkMode} />
      ) : (
        <main className="relative z-10 flex-1 w-full flex flex-col justify-center items-center px-6 min-h-0 overflow-hidden">
          <div className="w-full max-w-6xl flex flex-col items-center justify-center min-h-0">
            
            {/* Titre & Accroche */}
            <div className="flex items-center justify-center gap-4 mb-4 shrink-0 text-left">
              <div className="shrink-0 pointer-events-none">
                <ShuttlecockIcon className="w-16 h-16 drop-shadow-lg" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Prêt pour le prochain volant ?
                </h1>
                <p className={`text-xs sm:text-sm leading-snug ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sélectionnez votre univers : émargement, ateliers d'entraînement ou tournois en direct.
                </p>
              </div>
            </div>

            {/* Grille des modules principaux */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full items-stretch min-h-0">
              {modules.map((mod) => {
                const Icon = mod.icon;
                const isSelected = activeModule === mod.id;
                
                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      if (mod.id === 'attendance') {
                        setCurrentView('attendance_hub');
                      } else if (mod.id === 'tournament') {
                        setCurrentView('tournament');
                      } else {
                        setActiveModule(mod.id);
                      }
                    }}
                    className={`group relative rounded-[22px] p-5 border backdrop-blur-xl transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98] min-h-0 ${
                      isDarkMode 
                        ? 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 shadow-xl shadow-black/40' 
                        : 'bg-white/85 border-white hover:shadow-2xl hover:shadow-purple-900/10 shadow-lg shadow-purple-900/5'
                    } ${isSelected ? 'ring-2 ring-[#FF4C85] border-transparent' : ''}`}
                  >
                    <div className="min-h-0">
                      <div className="flex items-center mb-3">
                        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${mod.gradient} flex items-center justify-center text-white shadow-md ${mod.shadow} group-hover:scale-105 transition-transform duration-200`}>
                          <Icon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      </div>

                      <h3 className={`text-lg font-black mb-1 transition-all group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FF4C85] group-hover:to-[#8C52FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {mod.title}
                      </h3>
                      <p className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {mod.subtitle}
                      </p>
                      
                      <p className={`text-xs leading-relaxed mb-3 font-normal ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {mod.description}
                      </p>
                    </div>

                    <div className={`pt-3 border-t flex flex-col items-center shrink-0 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-100/80'}`}>
                      <div className="flex flex-wrap justify-center gap-1.5 mb-3 w-full">
                        {mod.features.map((feat, idx) => (
                          <span 
                            key={idx}
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border text-center ${
                              isDarkMode 
                                ? 'bg-slate-800/60 text-slate-300 border-slate-700/60' 
                                : 'bg-slate-100/70 text-slate-600 border-slate-200/50'
                            }`}
                          >
                            {feat}
                          </span>
                        ))}
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (mod.id === 'attendance') {
                            setCurrentView('attendance_hub');
                          } else if (mod.id === 'tournament') {
                            setCurrentView('tournament');
                          } else {
                            setActiveModule(mod.id);
                          }
                        }}
                        className={`w-full max-w-[210px] py-2.5 px-4 mx-auto rounded-xl text-xs font-bold text-white bg-gradient-to-r ${mod.gradient} shadow-md ${mod.shadow} active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer`}
                      >
                        <span>ACCÉDER AU MODULE</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {activeModule && (
              <div className={`mt-3 mx-auto max-w-sm w-full py-1.5 px-3.5 rounded-xl border shadow-lg flex items-center justify-between text-xs backdrop-blur-md shrink-0 ${
                isDarkMode 
                  ? 'bg-slate-900/95 border-slate-800 text-slate-200' 
                  : 'bg-white/95 border-white text-slate-700 shadow-purple-900/10'
              }`}>
                <div className="flex items-center space-x-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-[#FF4C85] shrink-0" />
                  <span className="font-semibold truncate">
                    Accès : <strong>{modules.find(m => m.id === activeModule)?.title}</strong>
                  </span>
                </div>
                <button 
                  onClick={() => setActiveModule(null)}
                  className="text-[#FF4C85] font-bold hover:underline cursor-pointer pl-2 shrink-0"
                >
                  Fermer
                </button>
              </div>
            )}

          </div>
        </main>
      )}

      {/* Footer */}
      <footer className={`relative z-20 max-w-6xl mx-auto px-6 py-2.5 w-full flex items-center justify-center text-[11px] shrink-0 transition-colors ${
        isDarkMode ? 'text-slate-500' : 'text-slate-400'
      }`}>
        <div>BadZone - Mon compagnon badiste</div>
      </footer>
    </div>
  );
}