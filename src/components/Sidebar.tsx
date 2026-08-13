import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Fuel, 
  HardHat, 
  Building2, 
  Users, 
  PlusCircle,
  TrendingUp,
  BarChart3,
  Receipt
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { Loader966Icon } from './Loader966Icon';
import { UserAccount } from '../utils/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  reportsCount: number;
  lowStockAlert: boolean;
  currentUserAccount?: UserAccount;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  reportsCount,
  lowStockAlert,
  currentUserAccount
}) => {
  const { t } = useLanguage();

  const isSubUser = currentUserAccount && !currentUserAccount.isPrimaryUser && currentUserAccount.role !== 'primary_admin' && currentUserAccount.role !== 'admin';
  const perms = currentUserAccount?.permissions;

  const rawMenuItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard', 'لوحة التحكم والإحصائيات'),
      icon: LayoutDashboard,
      badge: null,
      visible: true
    },
    {
      id: 'new-report',
      label: t('nav.newReport', 'تسجيل يوم عمل جديد'),
      icon: PlusCircle,
      badge: null,
      highlight: true,
      visible: !isSubUser || perms?.canAddReports !== false
    },
    {
      id: 'invoicing',
      label: t('nav.invoicing', 'إصدار الفواتير والمطالبات'),
      icon: Receipt,
      badge: 'متاح',
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      visible: !isSubUser || perms?.canIssueInvoicing !== false
    },
    {
      id: 'reports-list',
      label: t('nav.reports', 'سجلات وتقارير العمل'),
      icon: FileText,
      badge: reportsCount > 0 ? reportsCount : null,
      visible: true
    },
    {
      id: 'diesel-warehouse',
      label: t('nav.diesel', 'مخزن وتوريد الديزل'),
      icon: Fuel,
      badge: lowStockAlert ? 'تنبيه' : null,
      badgeColor: lowStockAlert ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-600',
      visible: !isSubUser || perms?.canManageDiesel !== false
    },
    {
      id: 'fuel-analysis',
      label: t('nav.fuelAnalysis', 'تحليل استهلاك الوقود'),
      icon: TrendingUp,
      badge: 'جديد',
      badgeColor: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      visible: !isSubUser || perms?.canManageDiesel !== false
    },
    {
      id: 'equipment-manager',
      label: t('nav.equipment', 'إدارة المعدات والعقود'),
      icon: HardHat,
      badge: null,
      visible: !isSubUser || perms?.canManageEquipment !== false
    },
    {
      id: 'companies-accounts',
      label: t('nav.companies', 'كشوفات الحسابات والشركات'),
      icon: Building2,
      badge: null,
      visible: !isSubUser || perms?.canManageCompanies !== false
    },
    {
      id: 'drivers-manager',
      label: t('nav.drivers', 'إدارة السائقين والسُلف'),
      icon: Users,
      badge: null,
      visible: !isSubUser || perms?.canManageDrivers !== false
    }
  ];

  const menuItems = rawMenuItems.filter(item => item.visible);

  return (
    <aside className="bg-white border-b lg:border-b-0 lg:ltr:border-r lg:rtl:border-l border-slate-200 lg:w-64 flex-shrink-0 no-print flex flex-col justify-between">
      <div className="p-3 sm:p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 hidden lg:block px-3">
          {t('nav.mainMenu', 'القائمة الرئيسية')}
        </p>
        
        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between whitespace-nowrap lg:whitespace-normal px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-amber-400 shadow-md shadow-slate-900/10'
                    : item.highlight
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive ? 'text-amber-400' : item.highlight ? 'text-amber-600' : 'text-slate-500'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full rtl:mr-2 ltr:ml-2 ${
                    item.badgeColor || (isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Developer Credit Info Card at bottom of Sidebar */}
      <div className="p-3.5 m-3 hidden lg:block bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-200 rounded-2xl border border-amber-500/40 text-xs shadow-lg">
        <div className="text-[11px] font-extrabold text-amber-400 mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Loader966Icon className="w-4 h-4 text-amber-400 shrink-0" />
            <span>نظام إدارة معدات 966</span>
          </div>
        </div>
        <p className="font-black text-white text-xs leading-snug">
          تصميم وإعداد: م. جهاد مفتاح
        </p>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-bold text-slate-300 dir-ltr flex items-center justify-between">
          <span className="text-slate-400">{t('app.contact', 'للتواصل:')}</span>
          <a 
            href="tel:00967770999936" 
            className="text-amber-400 hover:underline font-mono font-black"
          >
            00967770999936
          </a>
        </div>
      </div>
    </aside>
  );
};
