export type KitType = "completo" | "maglia_pantaloncino" | "solo_maglia";

export const KIT_TYPE_LABELS: Record<KitType, string> = {
  completo: "Kit Completo (maglia + pantaloncino + calzettoni)",
  maglia_pantaloncino: "Maglia + Pantaloncino",
  solo_maglia: "Solo Maglia",
};

export const STANDARD_TEAM_SIZES = [5, 7, 8, 10, 12] as const;

const UNIT_PRICES = {
  maglia: 30,
  maglia_retro: 35,
  pantaloncino: 10,
  calzettoni: 5,
};

const RETRO_JERSEY_SURCHARGE = UNIT_PRICES.maglia_retro - UNIT_PRICES.maglia;

// Prezzi promozionali fissi per il kit completo alle taglie squadra standard
const FIXED_COMPLETO_PRICES: Record<number, number> = {
  5: 200,
  7: 300,
  8: 340,
  10: 400,
  12: 540,
};

export function calculateKitPrice(
  players: number,
  kitType: KitType,
  isRetro: boolean
): number {
  if (!Number.isFinite(players) || players <= 0) return 0;

  const jerseyPrice = isRetro ? UNIT_PRICES.maglia_retro : UNIT_PRICES.maglia;

  if (kitType === "solo_maglia") {
    return jerseyPrice * players;
  }

  if (kitType === "maglia_pantaloncino") {
    return (jerseyPrice + UNIT_PRICES.pantaloncino) * players;
  }

  // kit completo — usa il prezzo promozionale fisso alle taglie standard
  const fixed = FIXED_COMPLETO_PRICES[players];
  if (fixed !== undefined) {
    return isRetro ? fixed + RETRO_JERSEY_SURCHARGE * players : fixed;
  }
  return (jerseyPrice + UNIT_PRICES.pantaloncino + UNIT_PRICES.calzettoni) * players;
}
