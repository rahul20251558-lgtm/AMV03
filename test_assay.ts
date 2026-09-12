import { generateAMVDataForProduct } from './src/services/pharmaDatabase';
const data = generateAMVDataForProduct('Atorvastatin Tablets 20 mg', { documentNo: '123' }, { targetApi: undefined });
console.log("activeSubstance:", data.activeSubstance);
console.log("reference:", data.reference);
console.log("objective:", data.objective);
