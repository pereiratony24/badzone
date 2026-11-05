import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowLeft, 
  Trophy, 
  Play, 
  Check, 
  Clock, 
  Award, 
  RotateCcw, 
  Loader2, 
  Sparkles, 
  Users, 
  User, 
  AlertCircle, 
  Plus, 
  Minus, 
  X,
  Shuffle,
  ArrowRight,
  ArrowLeftRight
} from 'lucide-react';

interface TournamentModuleProps {
  onBack: () => void;
  isDarkMode: boolean;
}

interface Match {
  id: string;
  tournament_id: string;
  court_number: number | null;
  round_number: number;
  player1_name: string;
  player2_name: string;
  score1: number;
  score2: number;
  status: 'pending' | 'playing' | 'finished';
}

interface Tournament {
  id: string;
  title: string;
  format: string;
  match_type: 'singles' | 'doubles';
  scoring_mode: string;
  points_to_win: number;
  duration_minutes: number;
  courts_count: number;
  status: string;
}

interface DoublePair {
  id: number;
  p1: string;
  p2: string;
}

interface SelectedPlayerTarget {
  type: 'pair' | 'exempt';
  pairId?: number;
  slot?: 'p1' | 'p2';
  exemptIndex?: number;
  name: string;
}

export default function TournamentModule({ onBack, isDarkMode }: TournamentModuleProps) {
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Assistant de création
  const [presentPlayers, setPresentPlayers] = useState<string[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [title, setTitle] = useState('Tournoi du créneau');
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles');
  const [courtsCount, setCourtsCount] = useState(4);
  const [scoringMode, setScoringMode] = useState<'time' | 'points'>('time');
  const [durationMinutes, setDurationMinutes] = useState(7);
  const [pointsToWin] = useState(21);
  const [isGenerating, setIsGenerating] = useState(false);

  // Étape intermédiaire spécifique aux doubles & interversion manuelle
  const [isPairingStep, setIsPairingStep] = useState(false);
  const [generatedPairs, setGeneratedPairs] = useState<DoublePair[]>([]);
  const [exemptPlayers, setExemptPlayers] = useState<string[]>([]);
  const [tempDuration, setTempDuration] = useState(7);
  const [playerToSwap, setPlayerToSwap] = useState<SelectedPlayerTarget | null>(null);

  // Pop-up modal de saisie du temps tactile
  const [showTimeModal, setShowTimeModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTournamentData();
  }, []);

  // Détermination automatique du nombre de terrains selon le format et les présents
  useEffect(() => {
    if (selectedPlayers.length === 0) return;
    const playersPerCourt = matchType === 'singles' ? 2 : 4;
    const recommended = Math.min(7, Math.max(1, Math.ceil(selectedPlayers.length / playersPerCourt)));
    setCourtsCount(recommended);
  }, [selectedPlayers.length, matchType]);

  async function loadTournamentData() {
    setLoading(true);
    try {
      const { data: tData } = await supabase
        .from('tournaments')
        .select('*')
        .eq('date', today)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tData) {
        setActiveTournament(tData);
        const { data: mData } = await supabase
          .from('matches')
          .select('*')
          .eq('tournament_id', tData.id)
          .order('round_number', { ascending: true });

        setMatches(mData || []);
      } else {
        const { data: attData } = await supabase
          .from('attendances')
          .select('player_id, players(first_name, last_name)')
          .eq('session_date', today)
          .eq('present', true);

        const names = (attData || [])
          .map((a: any) => `${a.players?.first_name} ${a.players?.last_name}`.trim())
          .filter(Boolean);

        setPresentPlayers(names);
        setSelectedPlayers(names);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleLaunchClick() {
    if (scoringMode === 'time') {
      setShowTimeModal(true);
    } else {
      processNextStep(durationMinutes);
    }
  }

  function processNextStep(chosenDuration: number) {
    setShowTimeModal(false);
    setTempDuration(chosenDuration);

    if (matchType === 'doubles') {
      generatePairsList();
      setIsPairingStep(true);
    } else {
      executeGenerateTournament(chosenDuration);
    }
  }

  function generatePairsList() {
    const pool = [...selectedPlayers].sort(() => Math.random() - 0.5);
    const pairs: DoublePair[] = [];
    const exempts: string[] = [];

    let pairId = 1;
    while (pool.length >= 2) {
      const p1 = pool.shift()!;
      const p2 = pool.shift()!;
      pairs.push({ id: pairId++, p1, p2 });
    }

    if (pool.length === 1) {
      exempts.push(pool.shift()!);
    }

    setGeneratedPairs(pairs);
    setExemptPlayers(exempts);
    setPlayerToSwap(null);
  }

  // Interversion de deux joueurs
  function handleSelectPlayerForSwap(target: SelectedPlayerTarget) {
    if (!playerToSwap) {
      setPlayerToSwap(target);
      return;
    }

    if (
      playerToSwap.type === target.type &&
      playerToSwap.pairId === target.pairId &&
      playerToSwap.slot === target.slot &&
      playerToSwap.exemptIndex === target.exemptIndex
    ) {
      setPlayerToSwap(null);
      return;
    }

    const nextPairs = generatedPairs.map((p) => ({ ...p }));
    const nextExempts = [...exemptPlayers];

    const sourceName = playerToSwap.name;
    const destName = target.name;

    if (playerToSwap.type === 'pair' && playerToSwap.pairId !== undefined && playerToSwap.slot) {
      const sPair = nextPairs.find((p) => p.id === playerToSwap.pairId);
      if (sPair) sPair[playerToSwap.slot] = destName;
    } else if (playerToSwap.type === 'exempt' && playerToSwap.exemptIndex !== undefined) {
      nextExempts[playerToSwap.exemptIndex] = destName;
    }

    if (target.type === 'pair' && target.pairId !== undefined && target.slot) {
      const dPair = nextPairs.find((p) => p.id === target.pairId);
      if (dPair) dPair[target.slot] = sourceName;
    } else if (target.type === 'exempt' && target.exemptIndex !== undefined) {
      nextExempts[target.exemptIndex] = sourceName;
    }

    setGeneratedPairs(nextPairs);
    setExemptPlayers(nextExempts);
    setPlayerToSwap(null);
  }

  async function executeGenerateTournament(chosenDuration: number, prebuiltPairs?: DoublePair[]) {
    const minRequired = matchType === 'singles' ? 2 : 4;
    if (selectedPlayers.length < minRequired) return;
    setIsGenerating(true);

    try {
      const { data: tourney, error: tErr } = await supabase
        .from('tournaments')
        .insert([{
          title,
          date: today,
          format: 'round_robin',
          match_type: matchType,
          scoring_mode: scoringMode,
          points_to_win: pointsToWin,
          duration_minutes: chosenDuration,
          courts_count: courtsCount,
          status: 'in_progress'
        }])
        .select()
        .single();

      if (tErr) throw tErr;

      let generatedMatches: any[] = [];

      if (matchType === 'singles') {
        const pool = [...selectedPlayers];
        if (pool.length % 2 !== 0) pool.push('Exempt');

        const totalRounds = Math.min(pool.length - 1, 5);

        for (let r = 0; r < totalRounds; r++) {
          let courtIdx = 1;
          for (let i = 0; i < pool.length / 2; i++) {
            const p1 = pool[i];
            const p2 = pool[pool.length - 1 - i];

            if (p1 !== 'Exempt' && p2 !== 'Exempt') {
              const isFirstRoundActive = r === 0 && courtIdx <= courtsCount;
              generatedMatches.push({
                tournament_id: tourney.id,
                court_number: isFirstRoundActive ? courtIdx : null,
                round_number: r + 1,
                player1_name: p1,
                player2_name: p2,
                score1: 0,
                score2: 0,
                status: isFirstRoundActive ? 'playing' : 'pending'
              });
              courtIdx++;
            }
          }
          pool.splice(1, 0, pool.pop()!);
        }
      } else {
        const pairsToUse = prebuiltPairs && prebuiltPairs.length > 0 
          ? [...prebuiltPairs] 
          : [...generatedPairs];

        let courtIdx = 1;
        const totalMatches = Math.floor(pairsToUse.length / 2);

        for (let i = 0; i < totalMatches; i++) {
          const team1 = `${pairsToUse[i * 2].p1} & ${pairsToUse[i * 2].p2}`;
          const team2 = `${pairsToUse[i * 2 + 1].p1} & ${pairsToUse[i * 2 + 1].p2}`;

          const isActive = courtIdx <= courtsCount;
          generatedMatches.push({
            tournament_id: tourney.id,
            court_number: isActive ? courtIdx : null,
            round_number: 1,
            player1_name: team1,
            player2_name: team2,
            score1: 0,
            score2: 0,
            status: isActive ? 'playing' : 'pending'
          });
          courtIdx++;
        }
      }

      const { data: mData, error: mErr } = await supabase
        .from('matches')
        .insert(generatedMatches)
        .select();

      if (mErr) throw mErr;

      setIsPairingStep(false);
      setActiveTournament(tourney);
      setMatches(mData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  async function updateScore(matchId: string, p1Delta: number, p2Delta: number) {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const newS1 = Math.max(0, target.score1 + p1Delta);
    const newS2 = Math.max(0, target.score2 + p2Delta);

    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, score1: newS1, score2: newS2 } : m));

    await supabase
      .from('matches')
      .update({ score1: newS1, score2: newS2 })
      .eq('id', matchId);
  }

  async function finishMatch(matchId: string) {
    setMatches((prev) => prev.map((m) => m.id === matchId ? { ...m, status: 'finished' } : m));

    await supabase
      .from('matches')
      .update({ status: 'finished' })
      .eq('id', matchId);

    const finishedMatch = matches.find(m => m.id === matchId);
    if (finishedMatch?.court_number) {
      const nextPending = matches.find(m => m.status === 'pending');
      if (nextPending) {
        setMatches((prev) => prev.map((m) => m.id === nextPending.id ? { ...m, status: 'playing', court_number: finishedMatch.court_number } : m));
        await supabase
          .from('matches')
          .update({ status: 'playing', court_number: finishedMatch.court_number })
          .eq('id', nextPending.id);
      }
    }
  }

  async function handleCloseTournament() {
    if (!activeTournament) return;
    await supabase.from('tournaments').update({ status: 'completed' }).eq('id', activeTournament.id);
    setActiveTournament(null);
    setMatches([]);
    setIsPairingStep(false);
    loadTournamentData();
  }

  const playersPerCourt = matchType === 'singles' ? 2 : 4;
  const totalCapacityOnCourts = courtsCount * playersPerCourt;
  const activePlayersCount = Math.min(selectedPlayers.length, totalCapacityOnCourts);
  const waitingPlayersCount = Math.max(0, selectedPlayers.length - totalCapacityOnCourts);
  const currentCourts = Array.from({ length: activeTournament?.courts_count || 4 }, (_, i) => i + 1);

  return (
    <div className="h-full w-full flex flex-col min-h-0 overflow-hidden font-sans select-none relative">
      
      {/* Header contrasté */}
      <header className="w-full px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => {
              if (isPairingStep) {
                setIsPairingStep(false);
                setPlayerToSwap(null);
              } else {
                onBack();
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center space-x-2 active:scale-95 shadow-xs ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4 text-blue-500 stroke-[2.8]" />
            <span className="text-xs sm:text-sm font-black">
              {isPairingStep ? 'Modifier les réglages' : 'Retour'}
            </span>
          </button>

          <div>
            <h2 className={`text-sm sm:text-base font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {isPairingStep ? (title || 'Tournoi du créneau') : 'Tournois & Matchs en Direct'}
            </h2>
            <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 uppercase tracking-wider">
              {activeTournament 
                ? `${activeTournament.title} • ${activeTournament.match_type === 'doubles' ? 'Doubles' : 'Simples'}` 
                : isPairingStep 
                ? 'Annonce & ajustement des paires'
                : 'Configuration du créneau'}
            </p>
          </div>
        </div>

        {activeTournament && (
          <button
            onClick={handleCloseTournament}
            className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black bg-rose-500/10 border border-rose-500/40 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
          >
            Clôturer le tournoi
          </button>
        )}
      </header>

      {loading ? (
        <div className="flex-1 w-full flex items-center justify-center space-x-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-sm font-bold">Chargement des terrains...</span>
        </div>
      ) : isPairingStep ? (

        /* ÉCRAN INTERMÉDIAIRE : ANNONCE & ÉCHANGE MANUEL DES PAIRES */
        <main className="flex-1 w-full px-6 py-2 min-h-0 overflow-hidden flex flex-col justify-between">
          <div className={`w-full flex-1 rounded-2xl p-4 border flex flex-col justify-between min-h-0 overflow-hidden shadow-lg ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Header de l'étape de composition */}
            <div className="flex items-center justify-between shrink-0 pb-2.5 border-b border-slate-800/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Users className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black leading-tight">Composition des Paires</h3>
                  <p className="text-[11px] text-slate-400">Touchez deux joueurs pour les permuter entre leurs équipes</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {playerToSwap && (
                  <button
                    type="button"
                    onClick={() => setPlayerToSwap(null)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Annuler l'échange
                  </button>
                )}

                <button
                  type="button"
                  onClick={generatePairsList}
                  className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-blue-600 hover:bg-slate-200'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Tout remélanger</span>
                </button>
              </div>
            </div>

            {/* Bandeau d'état d'échange actif */}
            {playerToSwap && (
              <div className="my-1 px-3 py-1.5 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2 truncate">
                  <ArrowLeftRight className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">
                    Joueur sélectionné : <strong className="text-white underline">{playerToSwap.name}</strong> — Touchez le second joueur à échanger.
                  </span>
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-md">
                  En attente
                </span>
              </div>
            )}

            {/* Grille des paires en plein écran sans scroll */}
            <div className="flex-1 py-2 min-h-0 overflow-hidden flex flex-col justify-between">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 flex-1 min-h-0 overflow-y-auto no-scrollbar content-start">
                {generatedPairs.map((pair) => {
                  const isP1Selected = playerToSwap?.type === 'pair' && playerToSwap?.pairId === pair.id && playerToSwap?.slot === 'p1';
                  const isP2Selected = playerToSwap?.type === 'pair' && playerToSwap?.pairId === pair.id && playerToSwap?.slot === 'p2';

                  return (
                    <div
                      key={pair.id}
                      className={`p-3 rounded-2xl border flex flex-col justify-between transition-all ${
                        isDarkMode 
                          ? 'bg-slate-800/60 border-slate-700/80' 
                          : 'bg-slate-50 border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* En-tête de carte avec étiquette "Équipe X" haute lisibilité */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide bg-blue-600 text-white shadow-xs ring-1 ring-white/10">
                          Équipe {pair.id}
                        </span>
                        {(isP1Selected || isP2Selected) && (
                          <span className="text-[10px] font-black text-amber-400 uppercase flex items-center space-x-1">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                            <span>À échanger</span>
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {/* Bouton tactile Joueur 1 */}
                        <button
                          type="button"
                          onClick={() => handleSelectPlayerForSwap({ type: 'pair', pairId: pair.id, slot: 'p1', name: pair.p1 })}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-black truncate transition-all cursor-pointer active:scale-95 ${
                            isP1Selected
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-300'
                              : isDarkMode 
                              ? 'bg-slate-900/60 border-slate-700/70 hover:border-blue-500/60 text-slate-200' 
                              : 'bg-white border-slate-300 hover:border-blue-400 text-slate-800'
                          }`}
                        >
                          {pair.p1}
                        </button>

                        <div className="h-[1px] w-full bg-slate-700/30" />

                        {/* Bouton tactile Joueur 2 */}
                        <button
                          type="button"
                          onClick={() => handleSelectPlayerForSwap({ type: 'pair', pairId: pair.id, slot: 'p2', name: pair.p2 })}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-black truncate transition-all cursor-pointer active:scale-95 ${
                            isP2Selected
                              ? 'bg-blue-600 text-white border-blue-400 shadow-md ring-2 ring-blue-300'
                              : isDarkMode 
                              ? 'bg-slate-900/60 border-slate-700/70 hover:border-blue-500/60 text-slate-200' 
                              : 'bg-white border-slate-300 hover:border-blue-400 text-slate-800'
                          }`}
                        >
                          {pair.p2}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Joueurs exempts éventuels */}
              {exemptPlayers.length > 0 && (
                <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-2 truncate">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>En réserve ronde 1 :</span>
                    {exemptPlayers.map((exName, idx) => {
                      const isExSelected = playerToSwap?.type === 'exempt' && playerToSwap?.exemptIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectPlayerForSwap({ type: 'exempt', exemptIndex: idx, name: exName })}
                          className={`px-2 py-0.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                            isExSelected
                              ? 'bg-amber-500 text-slate-950 border-white ring-2 ring-amber-300'
                              : 'bg-amber-500/20 border-amber-500/40 text-amber-200 hover:bg-amber-500/30'
                          }`}
                        >
                          {exName}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold shrink-0">Touchez pour l'intégrer dans une paire</span>
                </div>
              )}
            </div>

            {/* Bouton Suivant pour générer les terrains */}
            <button
              disabled={isGenerating}
              onClick={() => executeGenerateTournament(tempDuration)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-600/30 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>VALIDER LES PAIRES & PASSER AUX TERRAINS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        </main>

      ) : !activeTournament ? (
        
        /* ASSISTANT DE CRÉATION STANDARD */
        <main className="flex-1 w-full px-6 py-2 min-h-0 overflow-hidden flex flex-col justify-between">
          <div className={`w-full flex-1 rounded-2xl p-4 border flex flex-col justify-between min-h-0 overflow-hidden shadow-lg ${
            isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* En-tête de la carte */}
            <div className="flex items-center justify-between shrink-0 pb-2 border-b border-slate-800/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Trophy className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black leading-tight">Configuration Express du Tournoi</h3>
                  <p className="text-[11px] text-slate-400">Attribution automatique selon le format et les présents</p>
                </div>
              </div>

              {/* Badge d'information joueurs simultanés en haut à droite */}
              <div className={`px-3 py-1.5 rounded-xl border flex items-center space-x-2 text-xs font-bold shrink-0 ${
                waitingPlayersCount > 0 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' 
                  : 'bg-blue-500/10 border-blue-500/40 text-blue-300'
              }`}>
                {waitingPlayersCount > 0 ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Users className="w-4 h-4 text-blue-400 shrink-0" />
                )}
                <span>
                  <strong>{activePlayersCount}</strong> joueurs en jeu ({courtsCount} ter.)
                </span>
                {waitingPlayersCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-black text-[11px]">
                    +{waitingPlayersCount} en réserve
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-black text-[11px]">
                    Complet
                  </span>
                )}
              </div>
            </div>

            {/* Corps en 2 colonnes */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 py-2 min-h-0 overflow-hidden">
              
              {/* Colonne gauche : Paramètres */}
              <div className="flex flex-col justify-around min-h-0 space-y-1.5">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">Nom du tournoi</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl border text-xs sm:text-sm mt-0.5 font-bold outline-hidden ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* 1. Discipline */}
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">Discipline</label>
                  <div className="grid grid-cols-2 gap-2 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setMatchType('singles')}
                      className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                        matchType === 'singles'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-white/20'
                          : isDarkMode ? 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <User className="w-4 h-4 stroke-[2.5]" />
                      <span>Simple (1 vs 1)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMatchType('doubles')}
                      className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                        matchType === 'doubles'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-white/20'
                          : isDarkMode ? 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-4 h-4 stroke-[2.5]" />
                      <span>Double (2 vs 2)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Terrains (1 à 7) */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">Terrains utilisés (Max 7)</label>
                    <span className="text-[11px] font-black text-blue-400">Recommandé : {courtsCount}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCourtsCount(num)}
                        className={`py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all cursor-pointer ${
                          courtsCount === num
                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-white/20'
                            : isDarkMode ? 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Format de match */}
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">Format de match</label>
                  <div className="grid grid-cols-2 gap-2 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setScoringMode('time')}
                      className={`py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                        scoringMode === 'time'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-white/20'
                          : isDarkMode ? 'bg-slate-800/80 border border-slate-700 text-slate-300' : 'bg-slate-100 border border-slate-300 text-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>En temps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setScoringMode('points')}
                      className={`py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                        scoringMode === 'points'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25 ring-1 ring-white/20'
                          : isDarkMode ? 'bg-slate-800/80 border border-slate-700 text-slate-300' : 'bg-slate-100 border border-slate-300 text-slate-700'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Classique</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Colonne droite : Sélection des participants */}
              <div className="flex flex-col min-h-0 border-l border-slate-800/40 pl-4">
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
                    Participants ({selectedPlayers.length} / {presentPlayers.length})
                  </span>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setSelectedPlayers([...presentPlayers])}
                      className="text-xs font-black text-blue-400 hover:text-blue-300 cursor-pointer"
                    >
                      Tous
                    </button>
                    <button 
                      onClick={() => setSelectedPlayers([])}
                      className="text-xs font-black text-slate-400 hover:text-slate-300 cursor-pointer"
                    >
                      Aucun
                    </button>
                  </div>
                </div>

                <div className="flex-1 border rounded-xl p-2 overflow-y-auto no-scrollbar flex flex-wrap gap-1.5 content-start border-slate-800">
                  {presentPlayers.map((name) => {
                    const isSel = selectedPlayers.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setSelectedPlayers(prev => isSel ? prev.filter(n => n !== name) : [...prev, name]);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                          isSel
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs ring-1 ring-white/20'
                            : isDarkMode ? 'bg-slate-800/50 border border-slate-700 text-slate-400' : 'bg-slate-100 border border-slate-300 text-slate-600'
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Bouton de validation */}
            <button
              disabled={selectedPlayers.length < (matchType === 'singles' ? 2 : 4) || isGenerating}
              onClick={handleLaunchClick}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-600/30 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>
                {matchType === 'doubles'
                  ? `COMPOSER LES PAIRES (${selectedPlayers.length} PARTICIPANTS)`
                  : `LANCER LE TOURNOI (${selectedPlayers.length} PARTICIPANTS)`}
              </span>
            </button>

          </div>
        </main>

      ) : (

        /* VUE EN DIRECT PAR TERRAIN SANS SCROLL */
        <main className="flex-1 w-full px-6 py-2 min-h-0 overflow-hidden flex flex-col justify-between">
          
          {/* TERRAINS EN DIRECT */}
          <div className="flex-[3] w-full min-h-0 flex flex-col pb-1.5">
            <div className="flex items-center space-x-2 mb-1.5 shrink-0">
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs sm:text-sm font-black uppercase text-slate-400 tracking-wider">
                Terrains actifs ({currentCourts.length}) • {activeTournament.match_type === 'doubles' ? 'Matchs en Double' : 'Matchs en Simple'}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 flex-1 min-h-0">
              {currentCourts.map((cNum) => {
                const liveMatch = matches.find((m) => m.court_number === cNum && m.status === 'playing');

                return (
                  <div
                    key={cNum}
                    className={`p-3 rounded-2xl border flex flex-col justify-between min-h-0 transition-all ${
                      liveMatch
                        ? isDarkMode ? 'bg-slate-900 border-blue-500/80 shadow-md shadow-blue-950/40' : 'bg-white border-blue-400 shadow-sm'
                        : isDarkMode ? 'bg-slate-900/40 border-slate-800/80 opacity-50' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between shrink-0">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide bg-blue-600 text-white shadow-xs ring-1 ring-white/10">
                        Terrain {cNum}
                      </span>
                      {liveMatch && (
                        <span className="text-[11px] font-bold text-slate-400">
                          Ronde {liveMatch.round_number}
                        </span>
                      )}
                    </div>

                    {liveMatch ? (
                      <div className="flex-1 flex flex-col justify-center space-y-1.5 min-h-0">
                        {/* Côté 1 */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black truncate max-w-[130px]" title={liveMatch.player1_name}>
                            {liveMatch.player1_name}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button onClick={() => updateScore(liveMatch.id, -1, 0)} className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-90">-</button>
                            <span className="text-base sm:text-lg font-black w-6 text-center">{liveMatch.score1}</span>
                            <button onClick={() => updateScore(liveMatch.id, 1, 0)} className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-90">+</button>
                          </div>
                        </div>

                        {/* Côté 2 */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-black truncate max-w-[130px]" title={liveMatch.player2_name}>
                            {liveMatch.player2_name}
                          </span>
                          <div className="flex items-center space-x-1">
                            <button onClick={() => updateScore(liveMatch.id, 0, -1)} className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-90">-</button>
                            <span className="text-base sm:text-lg font-black w-6 text-center">{liveMatch.score2}</span>
                            <button onClick={() => updateScore(liveMatch.id, 0, 1)} className="w-7 h-7 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center cursor-pointer active:scale-90">+</button>
                          </div>
                        </div>

                        <button
                          onClick={() => finishMatch(liveMatch.id)}
                          className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs active:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>VALIDER LE MATCH</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs sm:text-sm text-slate-500 font-bold">
                        Disponible
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* FILE D'ATTENTE */}
          <div className="flex-[2] w-full min-h-0 flex flex-col pt-2 border-t border-slate-800/40">
            <div className="flex items-center justify-between mb-1.5 shrink-0">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs sm:text-sm font-black uppercase text-slate-400 tracking-wider">
                  Prochaines rotations ({matches.filter(m => m.status === 'pending').length})
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {matches.filter(m => m.status === 'finished').length} match{matches.filter(m => m.status === 'finished').length > 1 ? 's' : ''} terminés
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {matches.filter((m) => m.status === 'pending').map((m) => (
                <div
                  key={m.id}
                  className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs ${
                    isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="min-w-0 pr-2 truncate">
                    <span className="text-[10px] font-black text-blue-400 block">Ronde {m.round_number}</span>
                    <p className="font-bold truncate text-xs">{m.player1_name} <span className="text-slate-400 font-normal">vs</span> {m.player2_name}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md shrink-0">En attente</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      )}

      {/* POP-UP MODAL TACTILE : CHOIX DE LA DURÉE DU MATCH */}
      {showTimeModal && (
        <div className="absolute inset-0 z-50 backdrop-blur-md bg-black/60 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl flex flex-col justify-between transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-black">Durée des matchs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                aria-label="Fermer"
                className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' 
                    : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                }`}
              >
                <X className="w-5 h-5 stroke-[2.8]" />
              </button>
            </div>

            {/* Stepper tactile géant */}
            <div className="py-6 flex items-center justify-center space-x-6">
              <button
                type="button"
                onClick={() => setDurationMinutes((prev) => Math.max(1, prev - 1))}
                className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-2xl flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer"
              >
                <Minus className="w-6 h-6 stroke-[3]" />
              </button>

              <div className="text-center min-w-[120px]">
                <span className="text-5xl font-black tracking-tight text-blue-500">
                  {durationMinutes}
                </span>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Minutes
                </span>
              </div>

              <button
                type="button"
                onClick={() => setDurationMinutes((prev) => Math.min(30, prev + 1))}
                className="w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-600/30 active:scale-90 transition-all cursor-pointer"
              >
                <Plus className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Presets rapides */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[5, 7, 8, 10, 12, 15, 20, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDurationMinutes(preset)}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    durationMinutes === preset
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400'
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {preset} min
                </button>
              ))}
            </div>

            {/* Bouton de confirmation */}
            <button
              onClick={() => processNextStep(durationMinutes)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white text-sm font-black shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {matchType === 'doubles'
                  ? 'CONFIRMER ET COMPOSER LES PAIRES'
                  : 'CONFIRMER ET LANCER LE TOURNOI'}
              </span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}