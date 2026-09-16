const { validateMLT } = require('./dist/server.cjs');
const mockData = {
  reportDate: "20-Apr-2026",
  analysisEndDate: "17-Apr-2026",
  analysisStartDate: "10-Apr-2026",
  protocolDate: "01-Apr-2026",
  protocolNo: "P", reportNo: "R",
  sampleQty_g: 10,
  organisms: [],
  media: [],
  equipment: [],
  specifiedOrganismRows: []
};
console.log(validateMLT(mockData));
