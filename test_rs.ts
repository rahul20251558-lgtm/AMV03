import { buildFullRSAMVData } from './src/services/rsPharmaDatabase';

const rs1 = buildFullRSAMVData('Tibolone Tablets BP 2.5 mg');
console.log(rs1.linearityAndRange.linearityLevels);

const rs2 = buildFullRSAMVData('Paracetamol Tablets BP 500 mg');
console.log(rs2.linearityAndRange.linearityLevels);
