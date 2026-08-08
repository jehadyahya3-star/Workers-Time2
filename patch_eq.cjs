const fs = require('fs');
let code = fs.readFileSync('src/components/EquipmentManager.tsx', 'utf8');

const targetImport = `import { Driver, Equipment, WorkReport } from '../types';`;
const replaceImport = `import { ContractType, Driver, Equipment, WorkReport } from '../types';`;

const targetStates = `  const [monthlyRate, setMonthlyRate] = useState<number>(35000);
  const [driverName, setDriverName] = useState('محمد علي عبد الله');`;
const replaceStates = `  const [monthlyRate, setMonthlyRate] = useState<number>(35000);
  const [driverName, setDriverName] = useState('محمد علي عبد الله');
  const [defaultContractType, setDefaultContractType] = useState<ContractType | ''>('');`;

const targetHandleAdd = `    setDailyRate(1400);
    setMonthlyRate(35000);`;
const replaceHandleAdd = `    setDailyRate(1400);
    setMonthlyRate(35000);
    setDefaultContractType('');`;

code = code.replace(targetImport, replaceImport);
code = code.replace(targetStates, replaceStates);
code = code.replace(targetHandleAdd, replaceHandleAdd);
fs.writeFileSync('src/components/EquipmentManager.tsx', code);
console.log("Success patch eq part 1");
