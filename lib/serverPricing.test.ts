// Esegui: TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node"}' npx ts-node --transpile-only lib/serverPricing.test.ts
import assert from "node:assert/strict";

// Copia minima della funzione pura per testarla senza database (stessa logica di unitPriceFor)
import { unitPriceFor, baseProductId } from "./serverPricing.pure";

assert.equal(unitPriceFor(35, undefined, {}), 35, "maglia semplice = prezzo di listino");
assert.equal(unitPriceFor(35, { isPlayerEdition: true }, {}), 40, "edizione giocatore +5");
assert.equal(unitPriceFor(35, { hasLongSleeve: true, includeShorts: true }, {}), 56, "maniche lunghe +10, pantaloncini +11");
assert.equal(unitPriceFor(35, { selectedPatches: ["serie-a", "coppa-italia"] }, { "serie-a": 3 }), 41, "due patch: 3 dal DB + 3 predefinito");
assert.equal(unitPriceFor(40, { selectedPatches: [{ category: "serie-a" }], includeSocks: true }, { "serie-a": 3 }), 60, "patch come oggetto + calzettoni +17");
assert.equal(baseProductId("68a8c9ce122861dc6a5e3a4f_ak123"), "68a8c9ce122861dc6a5e3a4f", "id composto -> id prodotto");
assert.equal(baseProductId("68a8c9ce122861dc6a5e3a4f"), "68a8c9ce122861dc6a5e3a4f", "id semplice invariato");
console.log("serverPricing: ok");
