const fs = require('fs');
let code = fs.readFileSync('src/components/EquipmentManager.tsx', 'utf8');

const targetOpenEdit = `    setDailyRate(eq.dailyRate);
    setMonthlyRate(eq.monthlyRate);
    setDriverName(eq.driverName);`;
const replaceOpenEdit = `    setDailyRate(eq.dailyRate);
    setMonthlyRate(eq.monthlyRate);
    setDriverName(eq.driverName);
    setDefaultContractType(eq.defaultContractType || '');`;

const targetSubmit = `      dailyRate,
      monthlyRate,
      driverName,
      createdAt: editingEquipment?.createdAt || new Date().toISOString(),`;
const replaceSubmit = `      dailyRate,
      monthlyRate,
      driverName,
      defaultContractType,
      createdAt: editingEquipment?.createdAt || new Date().toISOString(),`;

code = code.replace(targetOpenEdit, replaceOpenEdit);
code = code.replace(targetSubmit, replaceSubmit);
fs.writeFileSync('src/components/EquipmentManager.tsx', code);
console.log("Success patch eq part 2");
