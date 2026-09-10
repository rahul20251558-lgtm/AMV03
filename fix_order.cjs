const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// I will just wipe out the newly added useMemo block if it's duplicated
// and safely construct the order.

// Let's remove ALL instances of `const activeMethodDiffs` and `const activeRevisionReason` up to their ends
code = code.replace(/  const activeMethodDiffs = useMemo\(\(\) => \{[\s\S]*?\}, \[.*?\]\);\n/g, '');
code = code.replace(/  const activeRevisionReason = useMemo\(\(\) => \{[\s\S]*?\}, \[.*?\]\);\n/g, '');

const finalBlock = `
  const getCurrentDocData = () => {
    if (validationMethod === 'dissolution') return dissolutionData;
    if (validationMethod === 'related_substances') return rsData;
    return assayData;
  };

  const activeMethodDiffs = useMemo(() => {
    const data = getCurrentDocData();
    const currentParams = extractCoreMethodParameters(data, validationMethod);
    const baselineKey = getBaselineLookupKey(productName, validationMethod);
    const baselineParams = DEFAULT_METHOD_BASELINES[baselineKey];
    if (!baselineParams) return [];
    return compareCoreMethodParameters(currentParams, baselineParams);
  }, [dissolutionData, rsData, assayData, validationMethod, productName]);

  const activeRevisionReason = useMemo(() => {
    const data = getCurrentDocData();
    const revs = data.revisionHistory || [];
    return revs.length > 0 ? revs[revs.length - 1].reason || '' : '';
  }, [dissolutionData, rsData, assayData, validationMethod]);
`;

code = code.replace(/  const getCurrentDocData = \(\) => \{[\s\S]*?return assayData;\n  \};\n/g, finalBlock);

fs.writeFileSync('src/App.tsx', code);
