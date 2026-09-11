/**
 * Post-Generation Text Sanitizer & Word-Break Validation Engine
 * 
 * Ensures all pharmaceutical AMV reports (Dissolution, Related Substances, Assay)
 * have pristine variable formatting, single canonical Reference Standard names,
 * and zero concatenated/jammed template variables (e.g., "Vildagliptintabletsmgwithuvdetection").
 */

/**
 * Recognized genuine IUPAC/chemical names and compendial filter terms with >= 20 characters.
 * These legitimate scientific terms should NOT be flagged as concatenation defects.
 */
export const KNOWN_LONG_CHEMICAL_NAMES = new Set([
  'polytetrafluoroethylene',
  'isobutylacetophenone',
  'chlorobenzhydrylpiperazine',
  'phenylmethylpiperazine',
  'hydroxypropylmethylcellulose',
  'carboxymethylcellulose',
  'microcrystallinecellulose',
  'dimethylpolysiloxane',
  'dichlorodiphenyltrichloroethane',
  'polyethyleneimine',
  'ethylenediaminetetraacetic',
  'dicyclohexylcarbodiimide',
]);

/**
 * Rule 1: REFERENCE STANDARD NAME — single clean variable
 * Extracts the single clean product/drug display name (e.g., "Vildagliptin", "Sodium Valproate", "Tibolone")
 * without dosage forms, strengths, units, pharmacopoeias, or method/detector suffixes.
 */
export function getCleanDrugDisplayName(productName: string, fallback?: string): string {
  if (!productName || !productName.trim()) {
    if (fallback && fallback.trim()) return getCleanDrugDisplayName(fallback);
    return 'Active';
  }

  let s = productName.trim();

  // 1. Strip test parameter prefixes
  s = s.replace(/^(?:Dissolution|Assay|Related Substances|Organic Impurities)\s+(?:of|in|for)\s+/i, '');

  // 2. Strip method / detector suffixes
  s = s.replace(/\s+(?:by\s+HPLC|by\s+GC|by\s+UV|with\s+UV|with\s+UV\/Vis|with\s+FID|with\s+PDA).*$/i, '');

  // 3. Strip pharmacopoeial monograph tokens
  s = s.replace(/\b(?:BP|USP|EP|IP|Ph\.?\s*Eur\.?|NF)\b/gi, ' ');

  // 4. Strip dosage forms
  s = s.replace(
    /\b(?:Tablets?|Capsules?|Injection|Oral Solution|Syrup|Suspension|Solution|Cream|Gel|Ointment|Infusion|Pellets|Powder)\b/gi,
    ' '
  );

  // 5. Strip strengths, numbers, and units (e.g. 50 mg, 5/20 mg, 2.5 mg)
  s = s.replace(/\b\d+(?:\.\d+)?(?:\s*\/\s*\d+(?:\.\d+)?)*\s*(?:mg|g|mcg|µg|ml|%|w\/v|w\/w)?\b/gi, ' ');

  // 6. Strip punctuation and delimiters
  s = s.replace(/[(),;:\/]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();

  // If input was entirely stripped or too short, try fallback or default
  if (!s || s.length < 2) {
    if (fallback && fallback.trim() && fallback !== productName) {
      return getCleanDrugDisplayName(fallback);
    }
    return 'Active';
  }

  // Format words: Capitalize each word nicely (e.g. "Sodium Valproate", "Rosuvastatin Calcium")
  return s
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Result of the Word-Break Validation scan.
 */
export interface WordBreakValidationResult {
  valid: boolean;
  suspiciousWords: string[];
  locations: string[];
}

/**
 * Rule 2 & 3: Word-Break Validation (Pre-Output Check)
 * Scans all text fields in a document object to detect unspaced concatenated strings.
 * Pattern: continuous 20+ letter alphabetical sequences not in the legitimate chemical whitelist.
 */
export function validateWordBreaks(docData: any): WordBreakValidationResult {
  const suspiciousWords: string[] = [];
  const locations: string[] = [];

  function walk(curr: any, path: string) {
    if (!curr) return;
    if (typeof curr === 'string') {
      const words = curr.match(/\b[a-zA-Z]{20,}\b/g);
      if (words) {
        for (const w of words) {
          const lower = w.toLowerCase();
          if (!KNOWN_LONG_CHEMICAL_NAMES.has(lower)) {
            suspiciousWords.push(w);
            locations.push(path);
          }
        }
      }
    } else if (Array.isArray(curr)) {
      curr.forEach((item, idx) => walk(item, `${path}[${idx}]`));
    } else if (typeof curr === 'object') {
      for (const [key, value] of Object.entries(curr)) {
        walk(value, path ? `${path}.${key}` : key);
      }
    }
  }

  walk(docData, '');

  return {
    valid: suspiciousWords.length === 0,
    suspiciousWords: Array.from(new Set(suspiciousWords)),
    locations: Array.from(new Set(locations)),
  };
}

/**
 * Common Post-Generation Text Sanitizer
 * Traverses document object tree and automatically repairs accidental variable concatenations
 * (e.g. "Vildagliptintabletsmgwithuvdetection" -> "Vildagliptin", or unspaced "wordTablets").
 */
export function postProcessSanitizeDocument<T>(
  docData: T,
  methodType?: 'assay' | 'related_substances' | 'dissolution'
): T {
  if (!docData) return docData;

  function sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') return str;

    let res = str;

    // 1. Repair specific concatenated tokens like "Vildagliptintabletsmgwithuvdetection"
    res = res.replace(/([A-Z][a-z]+)tablets(?:mg)?(?:withuvdetection)?/gi, '$1');
    res = res.replace(/withuvdetection/gi, 'with UV Detection');

    // 2. Repair jammed words where a word ends and common pharma words start without space
    // e.g. "VildagliptinTablets", "ParacetamolSolution"
    res = res.replace(/([a-z])(Tablets|Capsules|Injection|WorkingStandard|ReferenceStandard)/g, '$1 $2');

    // 3. Normalize multiple spaces
    res = res.replace(/ {2,}/g, ' ');

    return res;
  }

  function walkAndSanitize(curr: any): any {
    if (curr === null || curr === undefined) return curr;
    if (typeof curr === 'string') {
      return sanitizeString(curr);
    }
    if (Array.isArray(curr)) {
      return curr.map((item) => walkAndSanitize(item));
    }
    if (typeof curr === 'object') {
      const copy: Record<string, any> = {};
      for (const [k, v] of Object.entries(curr)) {
        copy[k] = walkAndSanitize(v);
      }
      return copy;
    }
    return curr;
  }

  return walkAndSanitize(docData) as T;
}
