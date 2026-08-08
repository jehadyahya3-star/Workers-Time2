import React from 'react';
import { 
  Truck, 
  PlusCircle, 
  Settings, 
  Database, 
  Calendar,
  HardHat,
  FolderKanban,
  ChevronDown,
  LogOut,
  UserCheck,
  Smartphone,
  Share2,
  Cloud,
  Users,
  Globe
} from 'lucide-react';
import { Project, ProjectInfo } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Loader966Icon } from './Loader966Icon';

interface NavbarProps {
  currentProject: Project;
  totalProjectsCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewReport: () => void;
  onOpenProjectsManager: () => void;
  onOpenProjectSettings: () => void;
  onOpenBackupModal: () => void;
  onOpenAndroidExport?: () => void;
  onOpenShareApp?: () => void;
  onOpenUserManager?: () => void;
  totalReportsCount: number;
  currentUser?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  totalProjectsCount,
  activeTab,
  setActiveTab,
  onOpenNewReport,
  onOpenProjectsManager,
  onOpenProjectSettings,
  onOpenBackupModal,
  onOpenAndroidExport,
  onOpenShareApp,
  onOpenUserManager,
  totalReportsCount,
  currentUser,
  onLogout
}) => {
  const { language, setLanguage, t } = useLanguage();

  const currentDate = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Project Switcher Info */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse ltr:space-x">
            <div className="bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-2 sm:p-2.5 rounded-xl shadow-lg border border-amber-300/40 flex items-center justify-center">
              <Loader966Icon className="h-7 w-7 sm:h-8 sm:w-8 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProjectsManager}
                  className="group text-right focus:outline-none flex items-center gap-2 hover:bg-slate-800/80 p-1.5 ltr:-ml-1.5 rtl:-mr-1.5 rounded-xl transition-colors cursor-pointer"
                  title="انقر للتنقل بين المشاريع أو إضافة مشروع جديد"
                >
                  <h1 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors tracking-tight leading-tight">
                    {currentProject.name || t('nav.projects', 'مشروع جديد')}
                  </h1>
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <FolderKanban className="w-3 h-3" />
                    <span>{totalProjectsCount > 1 ? `(${totalProjectsCount})` : ''}</span>
                    <ChevronDown className="w-3 h-3" />
                  </span>
                </button>
              </div>
              <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-2 font-medium">
                {currentProject.managerName && (
                  <span className="flex items-center gap-1 text-slate-200 font-bold bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                    <HardHat className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentProject.managerName}</span>
                  </span>
                )}
                {currentProject.location && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40">
                    <span>📍 {currentProject.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="hidden md:flex items-center space-x-2.5 rtl:space-x-reverse ltr:space-x">
            <button
              onClick={onOpenProjectsManager}
              className="bg-slate-800 hover:bg-slate-700/80 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <FolderKanban className="w-4 h-4 text-amber-400" />
              <span>{t('nav.projects', 'المشاريع')} ({totalProjectsCount})</span>
            </button>

            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-emerald-400 font-bold" title="بياناتك محفوظة ومزامنة في السحابة بأمان تلتزم بالحفظ حتى 5 سنوات وأكثر">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">حفظ سحابي نشط</span>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-200">{currentDate}</span>
            </div>

            <button
              onClick={onOpenNewReport}
              className="bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{t('nav.newReport', 'تسجيل يوم عمل')}</span>
            </button>

            {onOpenUserManager && (
              <button
                onClick={onOpenUserManager}
                title="إدارة المستخدمين وصلاحيات الوصول للمشاريع"
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Users className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline">المستخدمين والصلاحيات</span>
              </button>
            )}

            {onOpenShareApp && (
              <button
                onClick={onOpenShareApp}
                title="مشاركة التطبيق بالكامل وقواعد البيانات المدمجة"
                className="bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden lg:inline">مشاركة التطبيق</span>
              </button>
            )}

            <button
              onClick={onOpenBackupModal}
              title={t('nav.backup', 'النسخ الاحتياطي وإدارة البيانات')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {onOpenAndroidExport && (
              <button
                onClick={onOpenAndroidExport}
                title="تثبيت وتصدير تطبيق أندرويد (APK / PWA)"
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden lg:inline">تطبيق أندرويد 📲</span>
              </button>
            )}

            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer font-black text-xs flex items-center gap-1"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={onOpenProjectSettings}
              title={t('nav.settings', 'الإعدادات')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Current User Badge & Logout Button */}
            {currentUser && (
              <div className="flex items-center gap-1.5 rtl:border-r ltr:border-l border-slate-800 rtl:pr-2.5 ltr:pl-2.5">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{currentUser}</span>
                </span>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title={t('nav.logout', 'تسجيل الخروج')}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">{t('nav.logout', 'خروج')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="bg-amber-500/20 text-amber-400 font-extrabold px-2 py-1.5 rounded-xl text-xs border border-amber-500/40"
              title={language === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>
            {onOpenAndroidExport && (
              <button
                onClick={onOpenAndroidExport}
                className="bg-emerald-500/20 text-emerald-300 p-2 rounded-xl text-xs border border-emerald-500/40"
                title="تثبيت تطبيق أندرويد 📲"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
              </button>
            )}
            <button
              onClick={onOpenProjectsManager}
              className="bg-slate-800 text-amber-400 p-2 rounded-xl text-xs flex items-center gap-1 border border-slate-700"
              title="المشاريع"
            >
              <FolderKanban className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenNewReport}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('common.add', 'إضافة')}</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="تسجيل الخروج"
                className="bg-rose-500/20 text-rose-300 p-2 rounded-xl text-xs border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};


