const fs = require('fs');

let content = fs.readFileSync('src/services/pharmaMathEngine.ts', 'utf-8');

const newPRNG = `export function createSeededRandom(seedStr: string) {
  function hashStr(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function mulberry32(a: number) {
    return function() {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  return mulberry32(hashStr(seedStr));
}`;

content = content.replace(/export function createSeededRandom\(seedStr: string\) \{[\s\S]*?return function \(\) \{[\s\S]*?\};\n\}/, newPRNG);

// Remove the Math.imul part from the previous PRNG body, it might be matched differently. Let's just use regex carefully.
fs.writeFileSync('src/services/pharmaMathEngine.ts', content);
