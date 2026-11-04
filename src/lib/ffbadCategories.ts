/**
 * Règle officielle FFBaD :
 * La saison commence le 1er septembre de l'année N et termine le 31 août de l'année N+1.
 */
export function getSeasonStartYear(date: Date = new Date()): number {
  const month = date.getMonth(); // 0 = Janvier, 8 = Septembre
  const year = date.getFullYear();
  return month >= 8 ? year : year - 1;
}

export type FFBaDCategory = 
  | 'Minibad'
  | 'Poussin'
  | 'Benjamin'
  | 'Minime'
  | 'Cadet'
  | 'Junior'
  | 'Sénior'
  | 'Vétéran 1'
  | 'Vétéran 2'
  | 'Vétéran 3'
  | 'Vétéran 4'
  | 'Vétéran 5'
  | 'Vétéran 6'
  | 'Vétéran 7'
  | 'Vétéran 8'
  | 'Vétéran 9';

/**
 * Calcule la catégorie officielle FFBaD avec l'intitulé complet "Vétéran X"
 * selon l'annexe officielle FFBaD.
 */
export function getFFBaDCategory(birthYear: number, referenceDate: Date = new Date()): FFBaDCategory {
  const startYear = getSeasonStartYear(referenceDate);

  // Catégories Jeunes
  if (birthYear >= startYear - 7) return 'Minibad';
  if (birthYear >= startYear - 9) return 'Poussin';
  if (birthYear >= startYear - 11) return 'Benjamin';
  if (birthYear >= startYear - 13) return 'Minime';
  if (birthYear >= startYear - 15) return 'Cadet';
  if (birthYear >= startYear - 17) return 'Junior';

  // Catégories Vétérans (tranches de 5 ans selon l'annexe officielle)
  if (birthYear <= startYear - 75) return 'Vétéran 9';
  if (birthYear <= startYear - 70) return 'Vétéran 8';
  if (birthYear <= startYear - 65) return 'Vétéran 7';
  if (birthYear <= startYear - 60) return 'Vétéran 6';
  if (birthYear <= startYear - 55) return 'Vétéran 5';
  if (birthYear <= startYear - 50) return 'Vétéran 4';
  if (birthYear <= startYear - 45) return 'Vétéran 3';
  if (birthYear <= startYear - 40) return 'Vétéran 2';
  if (birthYear <= startYear - 35) return 'Vétéran 1';

  return 'Sénior';
}

export function getSeasonLabel(referenceDate: Date = new Date()): string {
  const s = getSeasonStartYear(referenceDate);
  return `${s}/${s + 1}`;
}