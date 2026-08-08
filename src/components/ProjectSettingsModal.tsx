import React, { useState } from 'react';
import { ProjectInfo, SUPPORTED_CURRENCIES } from '../types';
import { Settings, X, Coins, Globe, Fuel } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

import { Moon, Sun } from 'lucide-react';

interface ProjectSettingsModalProps {
  projectInfo: ProjectInfo;
  onSave: (info: ProjectInfo) => void;
  onClose: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  projectInfo,
  onSave,
  onClose,
  isDarkMode,
  setIsDarkMode
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [name, setName] = useState(projectInfo.name);
  const [companyName, setCompanyName] = useState(projectInfo.companyName);
  const [managerName, setManagerName] = useState(projectInfo.managerName);
  const [location, setLocation] = useState(projectInfo.location);
  const [phone, setPhone] = useState(projectInfo.phone);
  const [budget, setBudget] = useState<number | string>(projectInfo.budget || 250000);
  const [currency, setCurrency] = useState(projectInfo.currency || 'ر.ي');
  const [defaultDieselPrice, setDefaultDieselPrice] = useState<number | string>(projectInfo.defaultDieselPrice || 2.3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
      name, 
      companyName, 
      managerName, 
      location, 
      phone,
      budget: Number(budget) || 0,
      currency,
      defaultDieselPrice: Number(defaultDieselPrice) || 2.3,
      projectItems: projectInfo.projectItems
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>{t('nav.settings', 'الإعدادات')}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* App Settings Section */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>{t('settings.language', 'لغة واجهة المستخدم')}</span>
                </span>
                <span className="text-[10px] font-extrabold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {language === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}
                </span>
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLanguage('ar')}
                  className={`p-3 rounded-2xl border text-right font-black transition-all cursor-pointer flex items-center gap-3 ${
                    language === 'ar'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/30 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">🇸🇦</span>
                  <div>
                    <div className="text-xs font-black">العربية</div>
                    <div className="text-[10px] font-medium text-slate-500">اللغة الرسمية (RTL)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`p-3 rounded-2xl border text-left font-black transition-all cursor-pointer flex items-center gap-3 ${
                    language === 'en'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/30 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xl">🇺🇸</span>
                  <div>
                    <div className="text-xs font-black">English</div>
                    <div className="text-[10px] font-medium text-slate-500">Full English Interface (LTR)</div>
                  </div>
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
                  className={`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${!isDarkMode ? 'bg-amber-50 border-amber-500 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <Sun className="w-4 h-4" />
                  الوضع المضيء
                </button>
                <button
                  type="button"
                  onClick={() => setIsDarkMode(true)}
                  className={`flex-1 p-2 rounded-xl border font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${isDarkMode ? 'bg-indigo-50 border-indigo-500 text-indigo-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <Moon className="w-4 h-4" />
                  الوضع الليلي
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">إعدادات المشروع</h4>
            <div className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المشروع الرئيسي:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-slate-900 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">الميزانية المرصودة للمشروع:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-2.5 font-extrabold text-amber-900 text-sm ltr:pl-16 rtl:pr-16"
                      placeholder="250000"
                      min="0"
                      required
                    />
                    <span className="absolute ltr:left-3 rtl:right-3 top-2.5 text-xs font-black text-amber-800">{currency}</span>
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>عملة المشروع:</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-extrabold text-slate-900 text-xs cursor-pointer focus:ring-2 focus:ring-amber-400"
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.symbol}>
                        {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default Diesel Price Input */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1">
                <label className="font-extrabold text-slate-900 block flex items-center gap-1.5 text-xs">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  <span>سعر لتر الديزل الافتراضي للمشروع:</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={defaultDieselPrice}
                    onChange={(e) => setDefaultDieselPrice(e.target.value)}
                    placeholder="2.3"
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 font-black text-slate-900 text-sm pl-20"
                    required
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-600">
                    {currency}/لتر
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  ⚡ محدد عند تسجيل المشروع لسرعة وتلقائية تعبئة التقارير اليومية وسندات الوقود.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم الشركة المنفذة / المقاول الرئيسي:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم المهندس / المشرف العام:</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">هاتف التواصل:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">موقع / مدينة المشروع:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-xl font-bold cursor-pointer"
            >
              {t('common.cancel', 'إلغاء')}
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2 rounded-xl cursor-pointer"
            >
              {t('common.save', 'حفظ التغييرات')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
