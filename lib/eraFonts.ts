import { Shrikhand, Monoton, Rubik_Mono_One, Russo_One, Archivo_Black } from "next/font/google";

// Un carattere per epoca, usato solo su cifre e titoli dell'era.
// preload:false = il browser scarica un file solo quando il testo di quell'era e davvero in pagina.
// (next/font vuole gli argomenti scritti per esteso, niente spread)
const f70 = Shrikhand({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-70" });
const f80 = Monoton({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-80" });
const f90 = Rubik_Mono_One({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-90" });
const f00 = Russo_One({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-00" });
const f10 = Archivo_Black({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-10" });

// Classi da mettere su un contenitore: definiscono le variabili --f-XX per tutti i figli
export const eraFontClasses = [f70, f80, f90, f00, f10].map((f) => f.variable).join(" ");
