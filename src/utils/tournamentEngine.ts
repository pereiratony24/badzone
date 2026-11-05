export interface TournamentStructure {
  mode: 'direct_elimination' | 'pools_elimination';
  poolsCount: number;
  poolSizes: number[];
  qualifiersPerPool: number;
  totalQualified: number;
  bracketStage: '8th' | 'quarter' | 'semi' | 'final';
  bracketStageLabel: string;
  totalMatchesEst: number;
}

export function determineTournamentStructure(totalEntities: number): TournamentStructure {
  // En dessous de 6 participants, élimination directe
  if (totalEntities < 6) {
    let stage: '8th' | 'quarter' | 'semi' | 'final' = 'final';
    let label = 'Finale directe';

    if (totalEntities > 4) {
      stage = 'quarter';
      label = 'Quarts de finale';
    } else if (totalEntities > 2) {
      stage = 'semi';
      label = 'Demi-finales';
    }

    return {
      mode: 'direct_elimination',
      poolsCount: 0,
      poolSizes: [],
      qualifiersPerPool: 0,
      totalQualified: totalEntities,
      bracketStage: stage,
      bracketStageLabel: label,
      totalMatchesEst: Math.max(1, totalEntities - 1),
    };
  }

  // Recherche du nombre optimal de poules (tailles cibles entre 3 et 5)
  let bestPoolsCount = Math.max(2, Math.round(totalEntities / 4));
  let minDiff = 999;

  // On teste le nombre de poules de 2 jusqu'à 16 (pour ne pas dépasser un tableau de 16 sortants avec 1 sortant)
  for (let p = 2; p <= Math.min(16, Math.floor(totalEntities / 3)); p++) {
    const minSize = Math.floor(totalEntities / p);
    const maxSize = Math.ceil(totalEntities / p);
    const remainder = totalEntities % p;

    // Privilégier les répartitions équitables (remainder === 0) et de taille 3 ou 4
    if (minSize >= 3 && maxSize <= 5) {
      const score = (remainder === 0 ? 0 : 5) + Math.abs(minSize - 4);
      if (score < minDiff) {
        minDiff = score;
        bestPoolsCount = p;
      }
    }
  }

  const poolsCount = bestPoolsCount;
  const poolSizes: number[] = Array(poolsCount).fill(Math.floor(totalEntities / poolsCount));
  const remainder = totalEntities % poolsCount;
  for (let i = 0; i < remainder; i++) {
    poolSizes[i]++;
  }

  // Nombre de sortants par poule (1 ou 2) avec plafond max à 16 sortants (8èmes de finale)
  let qualifiersPerPool = 2;
  if (poolsCount * qualifiersPerPool > 16 || poolsCount >= 8) {
    qualifiersPerPool = 1;
  }
  const totalQualified = poolsCount * qualifiersPerPool;

  let stage: '8th' | 'quarter' | 'semi' | 'final' = 'semi';
  let label = 'Demi-finales';

  if (totalQualified > 8) {
    stage = '8th';
    label = 'Huitièmes de finale';
  } else if (totalQualified > 4) {
    stage = 'quarter';
    label = 'Quarts de finale';
  } else if (totalQualified <= 2) {
    stage = 'final';
    label = 'Finale';
  }

  let poolMatches = 0;
  poolSizes.forEach((size) => {
    poolMatches += (size * (size - 1)) / 2;
  });
  const bracketMatches = Math.max(1, totalQualified - 1);

  return {
    mode: 'pools_elimination',
    poolsCount,
    poolSizes,
    qualifiersPerPool,
    totalQualified,
    bracketStage: stage,
    bracketStageLabel: label,
    totalMatchesEst: poolMatches + bracketMatches,
  };
}