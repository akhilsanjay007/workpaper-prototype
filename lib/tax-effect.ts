export const CRYPTO_GAIN = 5325;
export const PARTNER_TAX_THRESHOLD = 1000;

export type CryptoTaxEffect = {
  newGain: number;
  federalTaxChange: number;
  californiaTaxChange: number;
  needsPartner: boolean;
};

export function cryptoTaxEffect(
  newBasis: number,
  federalPerDollar: number,
  californiaPerDollar: number,
): CryptoTaxEffect {
  const federalTaxChange = -newBasis * federalPerDollar;
  const californiaTaxChange = -newBasis * californiaPerDollar;
  return {
    newGain: CRYPTO_GAIN - newBasis,
    federalTaxChange,
    californiaTaxChange,
    needsPartner:
      Math.abs(federalTaxChange) > PARTNER_TAX_THRESHOLD ||
      Math.abs(californiaTaxChange) > PARTNER_TAX_THRESHOLD,
  };
}
