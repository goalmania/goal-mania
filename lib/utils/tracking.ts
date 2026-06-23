export interface CourierInfo {
  name: string;
  url: string;
}

export function detectCourier(code: string): CourierInfo | null {
  const c = code.trim().toUpperCase();

  // UPS: inizia con 1Z
  if (/^1Z[A-Z0-9]{16}$/.test(c)) {
    return {
      name: "UPS",
      url: `https://www.ups.com/track?tracknum=${c}`,
    };
  }

  // FedEx: 12 o 15 cifre
  if (/^\d{12}$/.test(c) || /^\d{15}$/.test(c)) {
    return {
      name: "FedEx",
      url: `https://www.fedex.com/fedextrack/?trknbr=${c}`,
    };
  }

  // DHL: inizia con JD oppure 10 cifre
  if (/^JD[0-9]{18}$/.test(c) || /^\d{10}$/.test(c)) {
    return {
      name: "DHL",
      url: `https://www.dhl.com/it-it/home/tracking.html?tracking-id=${c}`,
    };
  }

  // Poste Italiane / EMS: formato RR/CP/RA/RB... + 8 cifre + IT
  if (/^[A-Z]{2}\d{8}IT$/.test(c)) {
    return {
      name: "Poste Italiane",
      url: `https://www.poste.it/cerca/index.html#/risultati-spedizioni/${c}`,
    };
  }

  // TNT / FedEx Express Italy: 9 cifre
  if (/^\d{9}$/.test(c)) {
    return {
      name: "TNT",
      url: `https://www.tnt.com/express/it_it/site/tracking.html?searchType=con&cons=${c}`,
    };
  }

  // GLS: 8-11 cifre
  if (/^\d{8,11}$/.test(c)) {
    return {
      name: "GLS",
      url: `https://gls-group.eu/IT/it/follow-your-parcel?match=${c}`,
    };
  }

  // BRT (Bartolini): 14 cifre
  if (/^\d{14}$/.test(c)) {
    return {
      name: "BRT",
      url: `https://vas.brt.it/vas/sped_det_show.hsm?referer=sped_numspe_par.hsm&nnumerospedizione=${c}`,
    };
  }

  // SDA: alfanumerico 12-13 caratteri
  if (/^[A-Z0-9]{12,13}$/.test(c)) {
    return {
      name: "SDA",
      url: `https://www.sda.it/wps/portal/SDA/strumenti-spedizione/tracking-spedizioni?id=${c}`,
    };
  }

  // Nexive / PosteDelivery: inizia con NX
  if (/^NX\d{12}$/.test(c)) {
    return {
      name: "Nexive",
      url: `https://www.nexive.it/tracking?codice=${c}`,
    };
  }

  return null;
}
