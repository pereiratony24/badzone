import { ArrowLeft, UserCheck, Users, Sparkles, CalendarDays } from 'lucide-react';

interface AttendanceHubProps {
  onBack: () => void;
  onSelectKiosk: () => void;
  onSelectAdmin: () => void;
  isDarkMode: boolean;
  presentCount: number;
  totalPlayers: number;
}

export default function AttendanceHub({
  onBack,
  onSelectKiosk,
  onSelectAdmin,
  isDarkMode,
  presentCount
}: AttendanceHubProps) {
  // Formatage de la date du jour en grand format (ex: "Mercredi 4 Novembre 2026")
  const todayFormatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden">
      
      {/* Barre supérieure avec retour, date grand format et indicateur de présents */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-2 pb-1 flex items-center justify-between gap-4 shrink-0">
        
        {/* Bouton retour */}
        <button
          onClick={onBack}
          className={`px-3.5 py-2 rounded-2xl border transition-all cursor-pointer flex items-center space-x-2.5 active:scale-95 shadow-md shrink-0 ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-purple-900/10'
          }`}
        >
          <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-[#FF4C85] to-[#8C52FF] text-white flex items-center justify-center shadow-xs">
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.8]" />
          </div>
          <span className="text-xs font-black tracking-tight">Retour accueil</span>
        </button>

        {/* Date du jour en grand format au centre */}
        <div className="flex items-center justify-center space-x-2.5 truncate px-2">
          <CalendarDays className="w-5 h-5 text-[#FF4C85] shrink-0" />
          <span className={`text-base sm:text-lg font-black tracking-tight truncate ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {capitalizedDate}
          </span>
        </div>

        {/* Indicateur épuré : uniquement le nombre de présents */}
        <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF4C85] to-[#FF7B60] text-white text-xs font-black shadow-md shadow-pink-500/20 flex items-center space-x-2 shrink-0">
          <Users className="w-4 h-4" />
          <span>{presentCount} présent{presentCount > 1 ? 's' : ''} aujourd'hui</span>
        </div>
      </div>

      {/* Contenu centré */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-6 flex flex-col justify-center items-center min-h-0">
        
        <div className="text-center max-w-md mx-auto mb-5 shrink-0">
          <h2 className={`text-2xl sm:text-3xl font-black tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Effectif & Émargement
          </h2>
          <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Choisissez le mode d'utilisation pour cette séance.
          </p>
        </div>

        {/* 2 Choix majeurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl items-stretch">
          
          {/* OPTION 1 : BORNE D'ÉMARGEMENT JOUEURS */}
          <div
            onClick={onSelectKiosk}
            className={`group relative rounded-3xl p-6 border backdrop-blur-xl transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
              isDarkMode 
                ? 'bg-slate-900/70 border-emerald-500/40 hover:border-emerald-500 shadow-xl shadow-emerald-950/30' 
                : 'bg-white/90 border-emerald-300 hover:border-emerald-500 shadow-xl shadow-emerald-900/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />

            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-6 h-6 stroke-[2.4]" />
                </div>
              </div>

              <h3 className={`text-xl font-black mb-1.5 transition-colors group-hover:text-emerald-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Émargement Séance
              </h3>
              <p className="text-[11px] font-bold mb-2 uppercase tracking-wider text-emerald-500">
                Borne d'entrée libre-service
              </p>
              <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Placez la tablette à l’entrée. Les joueurs se recherchent en 2 touches et pointent leur arrivée de manière autonome.
              </p>
            </div>

            <button className="w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25 group-hover:brightness-105 transition-all flex items-center justify-center space-x-2 cursor-pointer">
              <Sparkles className="w-4 h-4" />
              <span>LANCER LA BORNE ENTRÉE</span>
            </button>
          </div>

          {/* OPTION 2 : GESTION EFFECTIF & ENTRAÎNEUR */}
          <div
            onClick={onSelectAdmin}
            className={`group relative rounded-3xl p-6 border backdrop-blur-xl transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
              isDarkMode 
                ? 'bg-slate-900/70 border-slate-800 hover:border-[#8C52FF] shadow-xl shadow-black/40' 
                : 'bg-white/90 border-slate-200 hover:border-[#8C52FF] shadow-xl shadow-purple-900/10'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-[#8C52FF] to-[#FF4C85] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />

            <div>
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF4C85] to-[#8C52FF] flex items-center justify-center text-white shadow-lg shadow-pink-500/25 group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6 stroke-[2.4]" />
                </div>
              </div>

              <h3 className={`text-xl font-black mb-1.5 transition-colors group-hover:text-purple-400 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Gestion & Effectif
              </h3>
              <p className={`text-[11px] font-bold mb-2 uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Administration & Suivi
              </p>
              <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Ajout de licenciés, changement de date de séance, pointage manuel complet et gestion par catégories.
              </p>
            </div>

            <button className="w-full py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-[#FF4C85] to-[#8C52FF] shadow-md shadow-pink-500/25 group-hover:brightness-105 transition-all flex items-center justify-center space-x-2 cursor-pointer">
              <span>OUVRIR LE MODULE COMPLET</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}