const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetModal = `        <ProjectSettingsModal
          projectInfo={projectInfo}
          onSave={(updated) => {`;

const replaceModal = `        <ProjectSettingsModal
          projectInfo={projectInfo}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onSave={(updated) => {`;

code = code.replace(targetModal, replaceModal);
fs.writeFileSync('src/App.tsx', code);
console.log("Success patch modal props");
