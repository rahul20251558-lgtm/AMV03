import { buildFullDissolutionAMVData } from './src/services/dissolutionPharmaDatabase';
import { runPreOutputAuditGate } from './src/services/complianceAuditGate';

const data = buildFullDissolutionAMVData('Tibolone Tablets BP 2.5 mg', {
  protocolNo: 'WC/QC/AMV/0316',
  batchNo: 'TB2501',
  companyName: 'WESTCOAST PHARMACEUTICAL WORKS LTD.',
});

const res = runPreOutputAuditGate(data, 'dissolution');
console.log(JSON.stringify(res, null, 2));
