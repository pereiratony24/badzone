import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getFFBaDCategory, getSeasonLabel } from '../lib/ffbadCategories';
import { 
  ArrowLeft, 
  Search, 
  UserPlus, 
  Check, 
  X, 
  Users, 
  Loader2, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  birth_year: number;
  gender?: 'M' | 'F';
  category: string;
  active: boolean;
}

interface AttendanceModuleProps {
  onBack: () => void;
  isDarkMode: boolean;
}

export default function AttendanceModule({ onBack, isDarkMode }: AttendanceModuleProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [attendances, setAttendances] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [groupFilter, setGroupFilter] = useState<'all' | 'jeunes' | 'seniors' | 'veterans'>('all');
  const [specificCatFilter, setSpecificCatFilter] = useState<string>('all');
  const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Modal ajout
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newBirthYear, setNewBirthYear] = useState<number>(2012);
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeSeasonLabel = getSeasonLabel(new Date(sessionDate));

  useEffect(() => {
    fetchData();
  }, [sessionDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: playersData, error: playersErr } = await supabase
        .from('players')
        .select('*')
        .eq('active', true)
        .order('last_name', { ascending: true });

      if (playersErr) throw playersErr;

      const { data: attendData, error: attendErr } = await supabase
        .from('attendances')
        .select('player_id, present')
        .eq('session_date', sessionDate);

      if (attendErr) throw attendErr;

      const sDate = new Date(sessionDate);
      const computedPlayers = (playersData || []).map((p: any) => ({
        ...p,
        category: p.birth_year ? getFFBaDCategory(p.birth_year, sDate) : (p.category || 'Sénior')
      }));

      setPlayers(computedPlayers);

      const attMap: Record<string, boolean> = {};
      attendData?.forEach((a) => {
        attMap[a.player_id] = a.present;
      });
      setAttendances(attMap);
    } catch (err: any) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleAttendance(playerId: string) {
    const currentStatus = attendances[playerId] ?? false;
    const nextStatus = !currentStatus;

    setAttendances((prev) => ({ ...prev, [playerId]: nextStatus }));

    try {
      const { error } = await supabase
        .from('attendances')
        .upsert(
          {
            player_id: playerId,
            session_date: sessionDate,
            present: nextStatus
          },
          { onConflict: 'player_id,session_date' }
        );

      if (error) throw error;
    } catch (err) {
      console.error('Erreur lors du pointage:', err);
      setAttendances((prev) => ({ ...prev, [playerId]: currentStatus }));
    }
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const fName = newFirstName.trim();
    const lName = newLastName.trim();

    if (!fName || !lName) {
      setErrorMessage('Veuillez renseigner un nom et un prénom.');
      return;
    }

    setIsSubmitting(true);

    try {
      const computedCategory = getFFBaDCategory(newBirthYear, new Date(sessionDate));

      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            first_name: fName,
            last_name: lName,
            birth_year: newBirthYear,
            gender: newGender,
            category: computedCategory,
            active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const fullPlayerData = { ...data, category: computedCategory };
        setPlayers((prev) => [...prev, fullPlayerData].sort((a, b) => a.last_name.localeCompare(b.last_name)));
        
        setAttendances((prev) => ({ ...prev, [data.id]: true }));
        await supabase.from('attendances').upsert(
          {
            player_id: data.id,
            session_date: sessionDate,
            present: true
          },
          { onConflict: 'player_id,session_date' }
        );
      }

      setNewFirstName('');
      setNewLastName('');
      setShowAddModal(false);
    } catch (err: any) {
      console.error('Erreur Supabase ajout joueur:', err);
      setErrorMessage(err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const filteredPlayers = players.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const reverseFullName = `${p.last_name} ${p.first_name}`.toLowerCase();
    const q = search.toLowerCase().trim();
    const matchesSearch = q === '' || fullName.includes(q) || reverseFullName.includes(q);

    let matchesFilter = true;
    if (specificCatFilter !== 'all') {
      matchesFilter = p.category === specificCatFilter;
    } else if (groupFilter === 'jeunes') {
      matchesFilter = ['Minibad', 'Poussin', 'Benjamin', 'Minime', 'Cadet', 'Junior'].includes(p.category);
    } else if (groupFilter === 'seniors') {
      matchesFilter = p.category === 'Sénior';
    } else if (groupFilter === 'veterans') {
      matchesFilter = p.category.startsWith('Vétéran');
    }

    return matchesSearch && matchesFilter;
  });

  const presentCount = Object.values(attendances).filter(Boolean).length;
  const previewCategory = getFFBaDCategory(newBirthYear, new Date(sessionDate));
  const availableCategories = Array.from(new Set(players.map((p) => p.category)));

  return (
    <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden">
      
      {/* Barre d'action supérieure */}
      <div className="px-6 py-3 max-w-7xl mx-auto w-full flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-2xl border transition-all cursor-pointer flex items-center space-x-2.5 active:scale-95 shadow-sm ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="w-6 h-6 rounded-xl bg-gradient-to-tr from-[#FF4C85] to-[#8C52FF] text-white flex items-center justify-center">
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.8]" />
            </div>
            <span className="text-xs sm:text-sm font-black tracking-tight">Retour menu</span>
          </button>
          
          <div className="hidden sm:block">
            <h2 className={`text-base sm:text-lg font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Gestion Effectif
            </h2>
            <span className="text-xs font-bold text-[#FF4C85] uppercase tracking-wider">
              Saison {activeSeasonLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
          }`}>
            <Calendar className="w-4 h-4 text-[#FF4C85]" />
            <input 
              type="date" 
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="bg-transparent border-none outline-hidden cursor-pointer text-xs sm:text-sm font-bold"
            />
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF4C85] to-[#FF7B60] text-white text-xs sm:text-sm font-black shadow-sm flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{presentCount} présent{presentCount > 1 ? 's' : ''}</span>
          </div>

          <button
            onClick={() => {
              setErrorMessage(null);
              setShowAddModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#8C52FF] to-[#B24CF6] text-white text-xs sm:text-sm font-bold active:scale-95 shadow-sm cursor-pointer flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nouveau joueur</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres de familles sans artefact de bordure */}
      <div className="px-6 py-2.5 max-w-7xl mx-auto w-full flex items-center gap-3 shrink-0">
        <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border flex-1 max-w-md ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}>
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher par nom ou prénom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-hidden text-xs sm:text-sm w-full placeholder:text-slate-400 font-semibold"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Boutons de filtres nettoyés */}
        <div className="flex items-center space-x-2 shrink-0">
          {[
            { id: 'all', label: `Tous (${players.length})` },
            { id: 'jeunes', label: 'Jeunes' },
            { id: 'seniors', label: 'Séniors' },
            { id: 'veterans', label: 'Vétérans' }
          ].map((tab) => {
            const isSelected = groupFilter === tab.id && specificCatFilter === 'all';
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setGroupFilter(tab.id as any);
                  setSpecificCatFilter('all');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF4C85] to-[#8C52FF] text-white shadow-md ring-1 ring-white/20'
                    : isDarkMode 
                    ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700' 
                    : 'bg-white border border-slate-200 text-slate-700 shadow-xs hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* Sélecteur spécifique */}
          <select
            value={specificCatFilter}
            onChange={(e) => {
              setSpecificCatFilter(e.target.value);
              if (e.target.value !== 'all') {
                setGroupFilter('all');
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold outline-hidden cursor-pointer transition-all ${
              specificCatFilter !== 'all'
                ? 'bg-gradient-to-r from-[#FF4C85] to-[#8C52FF] text-white shadow-md ring-1 ring-white/20'
                : isDarkMode 
                ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700' 
                : 'bg-white border border-slate-200 text-slate-700 shadow-xs hover:border-slate-300'
            }`}
          >
            <option value="all" className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
              Préciser catégorie...
            </option>
            {availableCategories.map((c) => (
              <option key={c} value={c} className={isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grille tactile des joueurs */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-2 min-h-0 overflow-y-auto overscroll-contain transform-gpu">
        {loading ? (
          <div className="h-full flex items-center justify-center space-x-2 text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF4C85]" />
            <span>Chargement des licenciés...</span>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm space-y-2">
            <Users className="w-10 h-10 stroke-1 text-slate-500" />
            <p>Aucun joueur trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-6">
            {filteredPlayers.map((player) => {
              const isPresent = attendances[player.id] ?? false;
              const isFemale = player.gender === 'F';

              return (
                <div
                  key={player.id}
                  onClick={() => toggleAttendance(player.id)}
                  className={`p-4 rounded-2xl border transition-colors duration-150 flex items-center justify-between cursor-pointer select-none active:scale-[0.99] ${
                    isPresent
                      ? isDarkMode
                        ? 'bg-emerald-950/80 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-emerald-50 border-emerald-400 shadow-sm ring-1 ring-emerald-400/50'
                      : isDarkMode
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                      : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <h3 className={`text-base sm:text-lg font-black truncate leading-tight tracking-tight ${
                      isPresent 
                        ? isDarkMode ? 'text-emerald-300' : 'text-emerald-950' 
                        : isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {player.last_name.toUpperCase()}
                    </h3>
                    <p className={`text-sm sm:text-base font-bold truncate mt-0.5 ${
                      isPresent ? 'text-emerald-400' : isDarkMode ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {player.first_name}
                    </p>
                    
                    <div className="flex items-center space-x-1.5 mt-2">
                      {/* Badge Catégorie */}
                      <span className={`inline-block text-xs font-black uppercase px-2 py-0.5 rounded-lg border ${
                        isPresent 
                          ? 'bg-emerald-800 text-white border-emerald-700' 
                          : isDarkMode ? 'bg-purple-950 text-purple-300 border-purple-800' : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {player.category}
                      </span>

                      {/* Badge Sexe en toutes lettres : Femme ou Homme */}
                      <span className={`inline-flex items-center space-x-1 text-xs font-black px-2 py-0.5 rounded-lg border ${
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

                  {/* Bouton tactile carré large */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                    isPresent
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md scale-105'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isPresent ? <Check className="w-6 h-6 stroke-[3]" /> : <X className="w-5 h-5 stroke-[2.5]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Ajout */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
            isDarkMode ? 'bg-[#131024] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-lg font-black mb-3">Ajouter un nouveau joueur</h3>

            {errorMessage && (
              <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddPlayer} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Nom</label>
                <input
                  type="text"
                  required
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  placeholder="ex: MOREAU"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm mt-1 outline-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Prénom</label>
                <input
                  type="text"
                  required
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  placeholder="ex: Lucas"
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm mt-1 outline-hidden ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              {/* Choix Sexe */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Sexe</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setNewGender('M')}
                    className={`py-2 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                      newGender === 'M'
                        ? 'bg-sky-500 text-white border-sky-400 shadow-xs'
                        : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>♂</span>
                    <span>Homme</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewGender('F')}
                    className={`py-2 rounded-xl border text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                      newGender === 'F'
                        ? 'bg-pink-500 text-white border-pink-400 shadow-xs'
                        : isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>♀</span>
                    <span>Femme</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400">Année de naissance</label>
                <input
                  type="number"
                  min="1940"
                  max="2025"
                  required
                  value={newBirthYear}
                  onChange={(e) => setNewBirthYear(parseInt(e.target.value) || 2012)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm mt-1 outline-hidden font-bold ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Catégorie {activeSeasonLabel} :</span>
                <span className="text-xs font-black text-[#FF4C85] uppercase tracking-wide">
                  {previewCategory}
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF4C85] to-[#8C52FF] text-white shadow-md cursor-pointer active:scale-95 flex items-center space-x-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}