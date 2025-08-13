export const COUNTRIES = [
  { value: "italy", label: "🇮🇹 Italy" },
  { value: "england", label: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England" },
  { value: "spain", label: "🇪🇸 Spain" },
  { value: "germany", label: "🇩🇪 Germany" },
  { value: "france", label: "🇫🇷 France" },
  { value: "portugal", label: "🇵🇹 Portugal" },
  { value: "netherlands", label: "🇳🇱 Netherlands" },
  { value: "belgium", label: "🇧🇪 Belgium" },
  { value: "brazil", label: "🇧🇷 Brazil" },
  { value: "argentina", label: "🇦🇷 Argentina" },
  { value: "colombia", label: "🇨🇴 Colombia" },
  { value: "mexico", label: "🇲🇽 Mexico" },
  { value: "united-states", label: "🇺🇸 United States" },
  { value: "canada", label: "🇨🇦 Canada" },
  { value: "japan", label: "🇯🇵 Japan" },
  { value: "south-korea", label: "🇰🇷 South Korea" },
  { value: "australia", label: "🇦🇺 Australia" },
  { value: "turkey", label: "🇹🇷 Turkey" },
  { value: "russia", label: "🇷🇺 Russia" },
  { value: "poland", label: "🇵🇱 Poland" },
  { value: "sweden", label: "🇸🇪 Sweden" },
  { value: "norway", label: "🇳🇴 Norway" },
  { value: "denmark", label: "🇩🇰 Denmark" },
  { value: "switzerland", label: "🇨🇭 Switzerland" },
  { value: "austria", label: "🇦🇹 Austria" },
  { value: "greece", label: "🇬🇷 Greece" },
  { value: "croatia", label: "🇭🇷 Croatia" },
  { value: "serbia", label: "🇷🇸 Serbia" },
  { value: "ukraine", label: "🇺🇦 Ukraine" },
  { value: "czech-republic", label: "🇨🇿 Czech Republic" },
];

export const DEFAULT_COUNTRY = "italy";

export const getCountryLabel = (value: string): string => {
  const country = COUNTRIES.find(c => c.value === value);
  return country ? country.label : value;
}; 