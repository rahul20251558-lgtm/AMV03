import { buildFullRSAMVData } from './src/services/rsPharmaDatabase';

const rs2 = buildFullRSAMVData('Paracetamol Tablets BP 500 mg');
console.log(rs2.linearityAndRange.linearityLevels);
