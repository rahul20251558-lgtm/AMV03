const fs = require('fs');
const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const cacheKey = `${productName.trim().toLowerCase()}_${documentNo || ''}_${batchNo || ''}_${companyName || ''}`;",
  "const cacheKey = `${productName.trim().toLowerCase()}_${documentNo || ''}_${batchNo || ''}_${companyName || ''}` + (fpsFileData ? '_fps' : '');"
);

code = code.replace(
  "const cacheKey = `rs_${productName.trim().toLowerCase()}_${protocolNo || ''}_${batchNo || ''}`;",
  "const cacheKey = `rs_${productName.trim().toLowerCase()}_${protocolNo || ''}_${batchNo || ''}` + (fpsFileData ? '_fps' : '');"
);

code = code.replace(
  "const cacheKey = `diss_${productName.trim().toLowerCase()}_${protocolNo || ''}_${batchNo || ''}`;",
  "const cacheKey = `diss_${productName.trim().toLowerCase()}_${protocolNo || ''}_${batchNo || ''}` + (fpsFileData ? '_fps' : '');"
);

fs.writeFileSync(file, code);
