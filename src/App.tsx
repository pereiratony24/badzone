import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { 
  Users, 
  Dumbbell, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Sun, 
  Moon 
} from 'lucide-react';

function ShuttlecockIcon({ className = "w-28 h-28" }: { className?: string }) {
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
          d="M48 74 C 44 76, 44 86, 50 94 C 55 100, 65 100, 70 94 C 76 86, 76 76, 72 74 Z"
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('badzone_theme') === 'dark';
  });

  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSupabaseConnection() {
      try {
        const { error } = await supabase.from('players').select('id').limit(1);
        setDbConnected(!error);
      } catch {
        setDbConnected(false);
      }
    }

    checkSupabaseConnection();

    const handleOnline = () => checkSupabaseConnection();
    const handleOffline = () => setDbConnected(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('badzone_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('badzone_theme', 'light');
    }
  }, [isDarkMode]);

  const modules = [
    {
      id: 'attendance',
      title: 'Effectif & Présences',
      subtitle: 'Émargement express & groupes',
      description: 'Pointage tactile en 15 secondes au gymnase, listing des joueurs par niveau et historique annuel des présences.',
      icon: Users,
      badge: 'MODULE 01',
      gradient: 'from-[#FF4C85] to-[#FF7B60]',
      shadow: 'shadow-pink-500/20',
      pillBg: 'bg-pink-500/10 text-[#FF4C85] border-pink-200 dark:border-pink-900/50',
      features: ['Pointage tactile rapide', 'Gestion par créneaux', 'Export vers tournoi']
    },
    {
      id: 'training',
      title: 'Séances & Pédagogie',
      subtitle: 'Ateliers & chronomètres',
      description: 'Banque d’exercices par filière (routine, filet, fond de court, cardio) avec timer de rotation et bips sonores audibles.',
      icon: Dumbbell,
      badge: 'MODULE 02',
      gradient: 'from-[#8C52FF] to-[#B24CF6]',
      shadow: 'shadow-purple-500/20',
      pillBg: 'bg-purple-500/10 text-[#8C52FF] border-purple-200 dark:border-purple-900/50',
      features: ['Bibliothèque d’ateliers', 'Timer de rotation club', 'Plans personnalisés']
    },
    {
      id: 'tournament',
      title: 'Tournois & Matchs',
      subtitle: 'Poules, élimination & direct',
      description: 'Création modulaire selon le nombre d’adhérents (poules, arbre, consolante), gestion au temps ou aux points et scores en direct.',
      icon: Trophy,
      badge: 'MODULE 03',
      gradient: 'from-[#4FACFE] to-[#00F2FE]',
      shadow: 'shadow-cyan-500/20',
      pillBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/50',
      features: ['Poules & Arbres automatiques', 'Matchs en temps ou points', 'Affichage grand écran']
    }
  ];

  return (
    <div className={`min-h-screen md:h-screen w-full md:overflow-hidden font-sans selection:bg-pink-200 selection:text-pink-900 relative flex flex-col justify-between transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0B0914] text-slate-100' : 'bg-[#F6F5FD] text-slate-800'
    }`}>
      
      {/* Halos lumineux d'ambiance */}
      <div className={`absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
        isDarkMode ? 'bg-gradient-to-br from-[#FF4C85]/20 via-[#8C52FF]/20 to-transparent opacity-60' : 'bg-gradient-to-br from-[#FF5E8E]/25 via-[#8C52FF]/20 to-transparent opacity-100'
      }`} />
      
      <div className={`absolute top-[20%] right-[-120px] w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
        isDarkMode ? 'bg-gradient-to-tl from-[#8C52FF]/25 via-[#FF4C85]/15 to-transparent opacity-60' : 'bg-gradient-to-tl from-[#8C52FF]/30 via-[#FF4C85]/15 to-transparent opacity-100'
      }`} />

      {/* Header */}
      <header className="relative z-20 px-6 sm:px-8 py-3.5 max-w-7xl mx-auto w-full flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF4C85] to-[#8C52FF] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-pink-500/30">
            BZ
          </div>
          <span className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Bad<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4C85] to-[#8C52FF]">Zone</span>
          </span>
        </div>

        {/* Statut dynamique Supabase & Bouton Dark/Light */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md transition-all ${
            dbConnected === null
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              : dbConnected
              ? isDarkMode ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
              : isDarkMode ? 'bg-rose-950/40 border-rose-800/40 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
          }`}>
            {dbConnected === null ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[11px] sm:text-xs">Connexion...</span>
              </>
            ) : dbConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] sm:text-xs">Mode en ligne</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[11px] sm:text-xs">Mode hors ligne</span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Basculer le thème"
            className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
              isDarkMode 
                ? 'bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800 shadow-lg shadow-purple-950/30' 
                : 'bg-white/90 border-white text-slate-700 hover:bg-white shadow-sm'
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Contenu principal : scrollable naturellement sur mobile, ajusté sur desktop */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6 md:py-2 flex-1 w-full flex flex-col justify-start md:justify-center overflow-y-auto md:overflow-hidden">
        
        {/* Volant + Titre */}
        <div className="text-center max-w-2xl mx-auto mb-6 md:mb-5 flex flex-col items-center shrink-0">
          <div className="relative mb-1 select-none pointer-events-none">
            <ShuttlecockIcon className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-lg" />
          </div>

          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Prêt pour le prochain volant ?
          </h1>
          
          <p className={`text-xs md:text-sm leading-relaxed px-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Sélectionnez votre espace de travail pour lancer l’émargement, planifier vos ateliers d’entraînement ou démarrer vos matchs en direct.
          </p>
        </div>

        {/* Grille des 3 Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 md:pb-0">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const isSelected = activeModule === mod.id;
            
            return (
              <div
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`group relative rounded-[28px] p-6 border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between cursor-pointer transform hover:-translate-y-1.5 ${
                  isDarkMode 
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 shadow-xl shadow-black/40' 
                    : 'bg-white/80 border-white hover:shadow-2xl hover:shadow-purple-900/15 shadow-xl shadow-purple-900/5'
                } ${isSelected ? 'ring-2 ring-[#FF4C85] border-transparent' : ''}`}
              >
                <div className={`absolute top-0 right-0 w-28 h-28 rounded-full bg-gradient-to-br ${mod.gradient} opacity-5 blur-2xl group-hover:opacity-20 transition-opacity`} />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${mod.gradient} flex items-center justify-center text-white shadow-md ${mod.shadow} group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${mod.pillBg}`}>
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className={`text-xl font-black mb-1 transition-all group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#FF4C85] group-hover:to-[#8C52FF] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {mod.title}
                  </h3>
                  <p className={`text-[11px] font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {mod.subtitle}
                  </p>
                  
                  <p className={`text-xs leading-relaxed mb-4 font-normal line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {mod.description}
                  </p>
                </div>

                <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-100/80'}`}>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {mod.features.map((feat, idx) => (
                      <span 
                        key={idx}
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${
                          isDarkMode 
                            ? 'bg-slate-800/60 text-slate-300 border-slate-700/60' 
                            : 'bg-slate-100/70 text-slate-600 border-slate-200/50'
                        }`}
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  <button className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${mod.gradient} shadow-md ${mod.shadow} group-hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95`}>
                    <span>ACCÉDER AU MODULE</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feedback de sélection */}
        {activeModule && (
          <div className={`mt-4 mx-auto max-w-md w-full p-3 rounded-2xl border shadow-lg flex items-center justify-between text-xs animate-fade-in backdrop-blur-md shrink-0 ${
            isDarkMode 
              ? 'bg-slate-900/95 border-slate-800 text-slate-200' 
              : 'bg-white/95 border-white text-slate-700 shadow-purple-900/10'
          }`}>
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF4C85] to-[#8C52FF] text-white flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">
                Accès : <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{modules.find(m => m.id === activeModule)?.title}</strong>
              </span>
            </div>
            <button 
              onClick={() => setActiveModule(null)}
              className="text-[#FF4C85] font-bold hover:underline cursor-pointer px-1"
            >
              Fermer
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-3.5 w-full flex flex-col sm:flex-row items-center justify-between text-[11px] border-t shrink-0 transition-colors ${
        isDarkMode ? 'border-slate-800/60 text-slate-500' : 'border-purple-100/60 text-slate-400'
      }`}>
        <div>BadZone — Outil terrain pour clubs de badminton</div>
        <div className="flex space-x-6 mt-1 sm:mt-0 font-medium">
          <span className={`cursor-pointer ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-700'}`}>PWA</span>
          <span className={`cursor-pointer ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-700'}`}>Mode Gymnase</span>
          <span className={`cursor-pointer ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-700'}`}>Cloud</span>
        </div>
      </footer>
    </div>
  );
}