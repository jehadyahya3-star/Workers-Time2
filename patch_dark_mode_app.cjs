const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [activeTab, setActiveTab] = useState<string>('dashboard');`;

const replaceState = `  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eq_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('eq_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');`;

code = code.replace(targetState, replaceState);

const targetNav = `            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenSidebar={() => setSidebarOpen(true)}
              onOpenProjectSettings={() => setShowSettingsModal(true)}
            />`;

const replaceNav = `            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenSidebar={() => setSidebarOpen(true)}
              onOpenProjectSettings={() => setShowSettingsModal(true)}
            />`;
// wait, I need to pass it to ProjectSettingsModal

const targetSettingsModal = `          <ProjectSettingsModal
            projectInfo={projectInfo}
            onSave={handleSaveProjectSettings}
            onClose={() => setShowSettingsModal(false)}
          />`;

const replaceSettingsModal = `          <ProjectSettingsModal
            projectInfo={projectInfo}
            onSave={handleSaveProjectSettings}
            onClose={() => setShowSettingsModal(false)}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />`;

code = code.replace(targetSettingsModal, replaceSettingsModal);

fs.writeFileSync('src/App.tsx', code);
console.log("Success patch dark mode app");
