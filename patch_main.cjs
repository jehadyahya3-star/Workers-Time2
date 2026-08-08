const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const targetImport = `import { LanguageProvider } from './i18n/LanguageContext';`;

const replaceImport = `import { LanguageProvider } from './i18n/LanguageContext';
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}`;

code = code.replace(targetImport, replaceImport);

fs.writeFileSync('src/main.tsx', code);
console.log("Success patch main.tsx");
