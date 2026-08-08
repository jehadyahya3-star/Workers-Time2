const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportForm.tsx', 'utf8');

const targetSave = `      grossAmount,
      costs: {
        ...costs,
        dieselTotalCost: (costs.dieselLiters || 0) * (costs.dieselCostPerLiter || 2.3)
      },
      driverAdvance,`;
const replaceSave = `      grossAmount,
      costs: hasCosts ? {
        ...costs,
        dieselTotalCost: (costs.dieselLiters || 0) * (costs.dieselCostPerLiter || 2.3)
      } : {
        dieselLiters: 0,
        dieselCostPerLiter: 0,
        dieselTotalCost: 0,
        dieselOnLessor: false,
        oilCost: 0,
        hydraulicOilCost: 0,
        engineOilCost: 0,
        engineOilOnLessor: false,
        greaseCost: 0,
        sparePartsCost: 0,
        maintenanceCost: 0
      },
      driverAdvance,`;

code = code.replace(targetSave, replaceSave);
fs.writeFileSync('src/components/WorkReportForm.tsx', code);
console.log("Success patch save");
