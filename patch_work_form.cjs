const fs = require('fs');
let code = fs.readFileSync('src/components/WorkReportForm.tsx', 'utf8');

const target1 = `  const [contractType, setContractType] = useState<ContractType>(
    existingReport?.contractType || 'daily'
  );`;
const replace1 = `  const [contractType, setContractType] = useState<ContractType>(
    existingReport?.contractType || ''
  );`;

const targetEffect1 = `  // Auto fill equipment & driver info on selection
  useEffect(() => {
    const eq = equipmentList.find(e => e.name === selectedEquipmentName);
    if (eq && eq.companyName) {
      setSelectedCompanyName(eq.companyName);
    }
  }, [selectedEquipmentName, equipmentList]);`;
const replaceEffect1 = `  // Auto fill equipment & driver info on selection
  useEffect(() => {
    const eq = equipmentList.find(e => e.name === selectedEquipmentName);
    if (eq) {
      if (eq.companyName) setSelectedCompanyName(eq.companyName);
      if (!existingReport && eq.defaultContractType) {
        setContractType(eq.defaultContractType);
      }
    }
  }, [selectedEquipmentName, equipmentList, existingReport]);`;

code = code.replace(target1, replace1);
code = code.replace(targetEffect1, replaceEffect1);
fs.writeFileSync('src/components/WorkReportForm.tsx', code);
console.log("Success patch work form 1");
