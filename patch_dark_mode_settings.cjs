const fs = require('fs');
let code = fs.readFileSync('src/components/ProjectSettingsModal.tsx', 'utf8');

const targetProps = `interface ProjectSettingsModalProps {
  projectInfo: ProjectInfo;
  onSave: (info: ProjectInfo) => void;
  onClose: () => void;
}`;

const replaceProps = `import { Moon, Sun } from 'lucide-react';

interface ProjectSettingsModalProps {
  projectInfo: ProjectInfo;
  onSave: (info: ProjectInfo) => void;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}`;

const targetFn = `export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  projectInfo,
  onSave,
  onClose
}) => {`;

const replaceFn = `export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  projectInfo,
  onSave,
  onClose,
  isDarkMode,
  setIsDarkMode
}) => {`;

const targetLanguageSection = `          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>{t('settings.language', 'لغة واجهة المستخدم')}</span>
            </h4>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={\`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer \${language === 'ar' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}\`}
              >
                {t('settings.arabic', 'العربية (Arabic)')}
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={\`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer \${language === 'en' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}\`}
              >
                {t('settings.english', 'الإنجليزية (English)')}
              </button>
            </div>
          </div>`;

const replaceLanguageSection = `          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>{t('settings.language', 'لغة واجهة المستخدم')}</span>
              </h4>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={\`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer \${language === 'ar' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}\`}
                >
                  {t('settings.arabic', 'العربية (Arabic)')}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={\`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer \${language === 'en' ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}\`}
                >
                  {t('settings.english', 'الإنجليزية (English)')}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                {isDarkMode ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>المظهر (Theme)</span>
              </h4>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDarkMode(false)}
                  className={\`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 \${!isDarkMode ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}\`}
                >
                  <Sun className="w-4 h-4" />
                  الوضع المضيء
                </button>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(true)}
                  className={\`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 \${isDarkMode ? 'bg-indigo-50 border-indigo-500 text-indigo-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}\`}
                >
                  <Moon className="w-4 h-4" />
                  الوضع الليلي
                </button>
              </div>
            </div>
          </div>`;

code = code.replace(targetProps, replaceProps);
code = code.replace(targetFn, replaceFn);
code = code.replace(targetLanguageSection, replaceLanguageSection);

fs.writeFileSync('src/components/ProjectSettingsModal.tsx', code);
console.log("Success patch dark mode settings");
