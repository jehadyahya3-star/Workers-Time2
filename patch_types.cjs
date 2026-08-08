const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const target1 = `export type ContractType = 'daily' | 'salary' | 'hourly' | 'meter' | 'monthly';`;
const replace1 = `export type ContractType = 'daily' | 'salary' | 'hourly' | 'meter' | 'monthly' | '';`;

const target2 = `  driverName: string;
  createdAt: string;`;
const replace2 = `  driverName: string;
  createdAt: string;
  defaultContractType?: ContractType;`;

code = code.replace(target1, replace1);
code = code.replace(target2, replace2);
fs.writeFileSync('src/types.ts', code);
console.log("Success patch types");
