import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getFFBaDCategory } from '../lib/ffbadCategories';
import { Search, Check, Lock, Users, CheckCircle2, Delete, X, AlertCircle } from 'lucide-react';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number;
  gender?: 'M' | 'F';
  category: string;
}

interface KioskAttendanceProps {
  onExit: () => void;
  isDarkMode: boolean;
}

const ADMIN_PIN = '6017';

export default function KioskAttendance({ onExit, isDarkMode }: KioskAttendanceProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendances, setAttendances] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Modal code PIN
  const [showPinModal, setShowPinModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function loadData() {
      const { data: pData } = await supabase
        .from('players')
        .select('id, first_name, last_name, birth_year, gender, category')
        .eq('active', true)
        .order('last_name', { ascending: true });

      const { data: aData } = await supabase
        .from('attendances')
        .select('player_id, present')
        .eq('session_date', today);

      const refDate = new Date();
      const computed = (pData || []).map((p: any) => ({
        ...p,
        category: p.birth_year ? getFFBaDCategory(p.birth_year, refDate) : (p.category || 'Sénior')
      }));

      setPlayers(computed);

      const map: Record<string, boolean> = {};
      aData?.forEach((a) => {
        map[a.player_id] = a.present;
      });
      setAttendances(map);
    }
    loadData();
  }, [today]);

  async function handleCheckIn(player: Player) {
    const isAlreadyPresent = attendances[player.id] ?? false;

    if (isAlreadyPresent) {
      setToastMessage({
        text: `${player.first_name}, tu es déjà bien noté présent ! 🏸`,
        type: 'info'
      });
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }

    setAttendances((prev) => ({ ...prev, [player.id]: true }));
    setToastMessage({
      text: `Présence validée pour ${player.first_name} ${player.last_name} !`,
      type: 'success'
    });

    setTimeout(() => {
      setToastMessage(null);
      setSearch('');
    }, 2000);

    await supabase.from('attendances').upsert(
      {
        player_id: player.id,
        session_date: today,
        present: true
      },
      { onConflict: 'player_id,session_date' }
    );
  }

  function handleKeyPress(num: string) {
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);
      setPinError(false);

      if (newPin.length === 4) {
        if (newPin === ADMIN_PIN) {
          setShowPinModal(false);
          setEnteredPin('');
          onExit();
        } else {
          setPinError(true);
          setTimeout(() => {
            setEnteredPin('');
            setPinError(false);
          }, 800);
        }
      }
    }
  }

  function handleDelete() {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError(false);
  }

  const filtered = players.filter((p) => {
    const full = `${p.first_name} ${p.last_name}`.toLowerCase();
    const reverse = `${p.last_name} ${p.first_name}`.toLowerCase();
    const q = search.toLowerCase().trim();
    return full.includes(q) || reverse.includes(q);
  });

  const presentCount = Object.values(attendances).filter(Boolean).length;

  return (
    <div className={`h-dvh w-full overflow-hidden select-none font-sans relative flex flex-col justify-between ${
      isDarkMode ? 'bg-[#08070F] text-white' : 'bg-[#F2F1FA] text-slate-900'
    }`}>
      
      {/* Toast d'alerte / confirmation */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-bounce ${
          toastMessage.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-slate-800 border border-slate-700 text-amber-300'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-6 h-6 stroke-[3]" />
          ) : (
            <AlertCircle className="w-6 h-6 stroke-[2.5]" />
          )}
          <span className="text-sm font-black">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Borne Kiosque */}
      <header className="px-6 py-3 w-full flex items-center justify-between border-b border-slate-800/40 shrink-0">
        <button
          onClick={() => {
            setEnteredPin('');
            setPinError(false);
            setShowPinModal(true);
          }}
          className={`px-3.5 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            isDarkMode 
              ? 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' 
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-[#FF4C85]" />
          <span>Quitter la borne</span>
        </button>

        <div className="flex items-center space-x-2 text-center">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF4C85] to-[#8C52FF] flex items-center justify-center font-black text-xs text-white">
            BZ
          </div>
          <span className="text-base font-black tracking-tight">Borne d'Émargement</span>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black flex items-center space-x-2">
          <Users className="w-4 h-4" />
          <span>{presentCount} pointés</span>
        </div>
      </header>

      {/* Barre de recherche */}
      <div className="px-6 pt-4 pb-2 max-w-3xl mx-auto w-full shrink-0">
        <div className={`flex items-center space-x-3 px-5 py-3 rounded-2xl border shadow-lg ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
        }`}>
          <Search className="w-6 h-6 text-[#FF4C85] shrink-0" />
          <input
            type="text"
            placeholder="Tape ton nom ou prénom pour pointer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-hidden text-base sm:text-lg font-bold placeholder:text-slate-400"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="text-xs font-black text-slate-400 px-2 py-1 rounded-lg bg-slate-800 hover:text-white cursor-pointer"
            >
              EFFACER
            </button>
          )}
        </div>
      </div>

      {/* Grille tactile des joueurs */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-3 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pb-6">
          {filtered.map((player) => {
            const isPresent = attendances[player.id] ?? false;
            const isFemale = player.gender === 'F';

            return (
              <div
                key={player.id}
                onClick={() => handleCheckIn(player)}
                className={`p-4 rounded-2xl border transition-all duration-150 flex items-center justify-between ${
                  isPresent
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-950/40 cursor-default'
                    : isDarkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100 hover:border-slate-500 shadow-md active:scale-95 cursor-pointer'
                    : 'bg-white border-slate-300 text-slate-800 shadow-sm hover:border-slate-400 active:scale-95 cursor-pointer'
                }`}
              >
                <div className="min-w-0 pr-3">
                  <h3 className="text-base sm:text-lg font-black truncate leading-tight tracking-tight">
                    {player.last_name.toUpperCase()}
                  </h3>
                  <p className={`text-sm sm:text-base font-bold truncate ${isPresent ? 'text-emerald-100' : isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {player.first_name}
                  </p>
                  
                  <div className="flex items-center space-x-1.5 mt-2">
                    {/* Badge Catégorie */}
                    <span className={`inline-block text-[11px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                      isPresent 
                        ? 'bg-emerald-800 text-white border-emerald-700' 
                        : isDarkMode 
                        ? 'bg-purple-950/70 text-purple-300 border-purple-800/80' 
                        : 'bg-purple-50 text-purple-900 border-purple-200'
                    }`}>
                      {player.category}
                    </span>

                    {/* Badge Sexe en toutes lettres : Femme ou Homme */}
                    <span className={`inline-flex items-center space-x-1 text-[11px] font-black px-2 py-0.5 rounded-lg border ${
                      isFemale
                        ? isDarkMode 
                          ? 'bg-pink-950/80 text-pink-300 border-pink-800' 
                          : 'bg-pink-50 text-pink-700 border-pink-200'
                        : isDarkMode 
                          ? 'bg-sky-950/80 text-sky-300 border-sky-800' 
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      <span>{isFemale ? '♀' : '♂'}</span>
                      <span>{isFemale ? 'Femme' : 'Homme'}</span>
                    </span>
                  </div>
                </div>

                <div className={`w-14 h-12 rounded-xl flex items-center justify-center shrink-0 font-black shadow-md transition-all ${
                  isPresent 
                    ? 'bg-white text-emerald-600' 
                    : 'bg-gradient-to-tr from-[#FF4C85] to-[#8C52FF] text-white active:scale-90 shadow-pink-500/25'
                }`}>
                  {isPresent ? (
                    <Check className="w-7 h-7 stroke-[3.5]" />
                  ) : (
                    <span className="text-xs font-black tracking-wider">ICI</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bas de page borne */}
      <footer className="py-2.5 px-6 text-center text-[11px] font-bold text-slate-500 border-t border-slate-800/30 shrink-0">
        Touche ton nom pour valider ta présence • Les modifications se font auprès du coach
      </footer>

      {/* Modal PIN */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-xs rounded-3xl p-6 border shadow-2xl flex flex-col items-center ${
            isDarkMode ? 'bg-[#120F24] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accès Entraîneur</span>
              <button 
                onClick={() => setShowPinModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#FF4C85]/10 border border-[#FF4C85]/20 flex items-center justify-center text-[#FF4C85] mb-3">
              <Lock className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h3 className="text-base font-black mb-1">Code PIN requis</h3>
            <p className="text-[11px] text-slate-400 mb-5 text-center">
              Entrez le code à 4 chiffres pour quitter le mode borne
            </p>

            <div className="flex space-x-3 mb-6">
              {[0, 1, 2, 3].map((idx) => {
                const filled = enteredPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${
                      pinError
                        ? 'border-rose-500 bg-rose-500'
                        : filled
                        ? 'border-[#FF4C85] bg-[#FF4C85] scale-110'
                        : isDarkMode
                        ? 'border-slate-700 bg-slate-800'
                        : 'border-slate-300 bg-slate-100'
                    }`}
                  />
                );
              })}
            </div>

            {pinError && (
              <p className="text-rose-500 text-xs font-bold -mt-3 mb-4 animate-pulse">
                Code PIN incorrect
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleKeyPress(digit)}
                  className={`h-14 rounded-2xl text-xl font-black flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800' 
                      : 'bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 shadow-xs'
                  }`}
                >
                  {digit}
                </button>
              ))}

              <button
                onClick={() => setShowPinModal(false)}
                className="h-14 rounded-2xl text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center justify-center cursor-pointer active:scale-95"
              >
                Annuler
              </button>

              <button
                onClick={() => handleKeyPress('0')}
                className={`h-14 rounded-2xl text-xl font-black flex items-center justify-center transition-all active:scale-90 cursor-pointer ${
                  isDarkMode 
                    ? 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800' 
                    : 'bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 shadow-xs'
                }`}
              >
                0
              </button>

              <button
                onClick={handleDelete}
                className={`h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer text-slate-400 hover:text-white ${
                  isDarkMode ? 'bg-slate-900/50' : 'bg-slate-100'
                }`}
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}