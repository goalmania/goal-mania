import pkg from '../lib/utils/generateGraphic.ts';
const { generateGraphic } = pkg;
import fs from 'fs';

const TEST_TITLE = "CI TENGO A PRECISARE CHE LA SQUADRA NON SI CHIAMERÀ TERNANA BANDECCHI";
const TEST_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/800px-A_small_cup_of_coffee.JPG";

console.log("Generating graphic...");
try {
  const buf = await generateGraphic(TEST_TITLE, TEST_IMAGE);
  fs.writeFileSync('/tmp/test-graphic-output.png', buf);
  console.log("OK - size:", buf.length, "bytes");
} catch(e) {
  console.error("ERROR:", e.message);
  process.exit(1);
}
