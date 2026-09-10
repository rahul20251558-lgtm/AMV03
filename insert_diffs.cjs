const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const useMemoCode = `
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

code = code.replace(
  "const getCurrentDocData = () => {", 
  useMemoCode + "\n  const getCurrentDocData = () => {"
);

fs.writeFileSync('src/App.tsx', code);
