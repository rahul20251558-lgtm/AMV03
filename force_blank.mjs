export function forceBlankProtocol(obj) {
    if (Array.isArray(obj)) {
        return obj.map(forceBlankProtocol);
    }
    if (obj !== null && typeof obj === 'object') {
        const copy = {};
        for (const [key, val] of Object.entries(obj)) {
            if (['peakArea', 'retentionTime', 'tailingFactor', 'theoreticalPlates', 'resolution', 
                'mean', 'sd', 'rsd', 'meanArea', 'rsdArea', 'meanTailing', 'rsdTailing', 'meanPlates', 'rsdPlates', 
                'slope', 'yIntercept', 'correlationCoefficient', 'r', 'rSquared', 'residualSd', 'lod', 'loq', 'sn', 
                'recovery', 'recoveryRatio', 'assay', 'content', 'dissolved', 'degradation', 'amountRecovered', 
                'amountFound', 'concentration', 'cfu', 'inoculum', 'meanRecovery', 'rsdRecovery', 'meanResult', 
                'rsdResult', 'result', 'resultRemark', 'difference', 'diff', 'weightMg', 'net', 'rec', 'ratio'
                ].includes(key)) {
                copy[key] = "—";
            } else if (key === 'remark' || key === 'resultStatus') {
                copy[key] = "To be verified";
            } else {
                copy[key] = forceBlankProtocol(val);
            }
        }
        return copy;
    }
    return obj;
}
