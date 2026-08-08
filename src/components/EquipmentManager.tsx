import React, { useState } from 'react';
import { ContractType, Driver, Equipment, WorkReport } from '../types';
import { formatCurrency, formatHoursDigital } from '../utils/exportUtils';
import { HardHat, Plus, Edit3, Trash2, CheckCircle2, Clock, Wrench, X, User } from 'lucide-react';

interface EquipmentManagerProps {
  equipmentList: Equipment[];
  driversList?: Driver[];
  reports: WorkReport[];
  onAddEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
}

export const EquipmentManager: React.FC<EquipmentManagerProps> = ({
  equipmentList,
  driversList = [],
  reports,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [type, setType] = useState('بوكلين (حفار)');
  const [regNumber, setRegNumber] = useState('');
  const [companyName, setCompanyName] = useState('شركة أعمار الخليج للمقاولات');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'idle'>('active');
  const [hourlyRate, setHourlyRate] = useState<number>(180);
  const [dailyRate, setDailyRate] = useState<number>(1400);
  const [monthlyRate, setMonthlyRate] = useState<number>(35000);
  const [driverName, setDriverName] = useState('محمد علي عبد الله');
  const [defaultContractType, setDefaultContractType] = useState<ContractType | ''>('');
  
  // Maintenance Form States
  const [maintenanceDueDate, setMaintenanceDueDate] = useState<string>('');
  const [maintenanceTargetHours, setMaintenanceTargetHours] = useState<number | ''>(250);
  const [maintenanceIntervalHours, setMaintenanceIntervalHours] = useState<number | ''>(250);
  const [maintenanceNotes, setMaintenanceNotes] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingEquipment(null);
    setName('');
    setType('بوكلين (حفار)');
    setRegNumber('');
    setHourlyRate(180);
    setDailyRate(1400);
    setMonthlyRate(35000);
    setDefaultContractType('');
    setDriverName(driversList[0]?.name || '');
    setMaintenanceDueDate('');
    setMaintenanceTargetHours(250);
    setMaintenanceIntervalHours(250);
    setMaintenanceNotes('صيانة دورية - تغيير الزيت والفلاتر وفحص عام');
    setShowModal(true);
  };

  const handleOpenEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setName(eq.name);
    setType(eq.type);
    setRegNumber(eq.regNumber);
    setCompanyName(eq.companyName);
    setStatus(eq.status);
    setHourlyRate(eq.hourlyRate);
    setDailyRate(eq.dailyRate);
    setMonthlyRate(eq.monthlyRate);
    setDriverName(eq.driverName);
    setDefaultContractType(eq.defaultContractType || '');
    setMaintenanceDueDate(eq.maintenanceDueDate || '');
    setMaintenanceTargetHours(eq.maintenanceTargetHours ?? 250);
    setMaintenanceIntervalHours(eq.maintenanceIntervalHours ?? 250);
    setMaintenanceNotes(eq.maintenanceNotes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eqData: Equipment = {
      id: editingEquipment?.id || `eq-${Date.now()}`,
      name,
      type,
      regNumber,
      companyName,
      status,
      hourlyRate,
      dailyRate,
      monthlyRate,
      driverName,
      defaultContractType,
      createdAt: editingEquipment?.createdAt || new Date().toISOString(),
      maintenanceDueDate: maintenanceDueDate || undefined,
      maintenanceTargetHours: maintenanceTargetHours !== '' ? Number(maintenanceTargetHours) : undefined,
      maintenanceIntervalHours: maintenanceIntervalHours !== '' ? Number(maintenanceIntervalHours) : undefined,
      maintenanceNotes: maintenanceNotes || undefined,
      lastMaintenanceDate: editingEquipment?.lastMaintenanceDate,
      lastMaintenanceHours: editingEquipment?.lastMaintenanceHours
    };

    if (editingEquipment) {
      onUpdateEquipment(eqData);
    } else {
      onAddEquipment(eqData);
    }

    setShowModal(false);
  };

  // Helper to mark maintenance as completed today
  const handleCompleteMaintenance = (eq: Equipment, currentHours: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const interval = eq.maintenanceIntervalHours || 250;
    const newTargetHours = currentHours + interval;
    
    // Calculate new target date (+30 days default if date was set)
    let newDueDate = undefined;
    if (eq.maintenanceDueDate) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      newDueDate = d.toISOString().slice(0, 10);
    }

    const updated: Equipment = {
      ...eq,
      status: 'active',
      lastMaintenanceDate: today,
      lastMaintenanceHours: currentHours,
      maintenanceTargetHours: newTargetHours,
      maintenanceDueDate: newDueDate || eq.maintenanceDueDate
    };

    onUpdateEquipment(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <HardHat className="w-6 h-6 text-amber-500" />
            <span>إدارة أسطول المعدات والعقود</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سجل الآليات الثقيلة، فئات الأسعار (بالساعة/باليوم/بالشهر) والشركة المؤجرة
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معدة جديدة</span>
        </button>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipmentList.map((eq) => {
          // Compute stats for this equipment from reports
          const eqReports = reports.filter(r => r.equipmentName === eq.name);
          const totalHours = eqReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
          const totalGross = eqReports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);

          // Maintenance Status Calculation
          const todayStr = new Date().toISOString().slice(0, 10);
          const hasTargetHours = eq.maintenanceTargetHours !== undefined && eq.maintenanceTargetHours > 0;
          const isHoursDue = hasTargetHours && totalHours >= eq.maintenanceTargetHours!;
          const isHoursSoon = hasTargetHours && !isHoursDue && (eq.maintenanceTargetHours! - totalHours <= 20);

          const hasDueDate = Boolean(eq.maintenanceDueDate);
          let isDateDue = false;
          let isDateSoon = false;
          if (hasDueDate && eq.maintenanceDueDate) {
            const diffDays = Math.ceil((new Date(eq.maintenanceDueDate).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
            if (diffDays <= 0) isDateDue = true;
            else if (diffDays <= 7) isDateSoon = true;
          }

          const isDue = isHoursDue || isDateDue || eq.status === 'maintenance';
          const isSoon = !isDue && (isHoursSoon || isDateSoon);

          return (
            <div key={eq.id} className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden ${
              isDue ? 'border-rose-300 ring-1 ring-rose-300' : isSoon ? 'border-amber-300' : 'border-slate-200'
            }`}>
              
              <div className="flex items-start justify-between border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{eq.name}</h3>
                  <span className="text-xs font-semibold text-slate-500">{eq.type} | {eq.regNumber}</span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    eq.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : eq.status === 'maintenance'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {eq.status === 'active' ? 'جاهزة / نشطة' : eq.status === 'maintenance' ? 'قيد الصيانة' : 'خارج الخدمة'}
                  </span>

                  {isDue ? (
                    <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      <span>صيانة مستحقة!</span>
                    </span>
                  ) : isSoon ? (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>اقتراب موعد الصيانة</span>
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Maintenance Schedule Details Box */}
              <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                isDue 
                  ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                  : isSoon 
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                  : 'bg-slate-50 border-slate-100 text-slate-700'
              }`}>
                <div className="flex items-center justify-between font-extrabold border-b pb-1">
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-600" />
                    <span>جدول الصيانة الدوري:</span>
                  </span>
                  {hasTargetHours && (
                    <span className="font-mono">
                      {totalHours} / {eq.maintenanceTargetHours} ساعة
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">موعد الصيانة القادم:</span>
                    <strong className="font-mono">{eq.maintenanceDueDate || 'غير محدد'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">المستهدف بالساعات:</span>
                    <strong>{eq.maintenanceTargetHours ? `${eq.maintenanceTargetHours} ساعة` : 'غير محدد'}</strong>
                  </div>
                </div>

                {eq.maintenanceNotes && (
                  <p className="text-[10px] italic text-slate-600 bg-white/60 p-1.5 rounded-lg border border-slate-200/50">
                    "{eq.maintenanceNotes}"
                  </p>
                )}

                {(isDue || isSoon) && (
                  <button
                    onClick={() => handleCompleteMaintenance(eq, totalHours)}
                    className="w-full mt-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم إجراء الصيانة (إعادة ضبط العداد)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="bg-amber-50/60 p-1.5 rounded-lg border border-amber-200/60">
                  <span className="text-[10px] text-amber-800 font-extrabold block">سعر التشغيل بالساعة</span>
                  <span className="font-black text-amber-900 text-sm">{eq.hourlyRate} ر.س</span>
                </div>
                <div className="p-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">سعر اليومية</span>
                  <span className="font-extrabold text-slate-800">{eq.dailyRate} ر.س</span>
                </div>
                <div className="p-1.5">
                  <span className="text-[10px] text-slate-400 font-bold block">العقد الشهري</span>
                  <span className="font-extrabold text-slate-800">{eq.monthlyRate} ر.س</span>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-3 rounded-xl flex justify-between items-center text-xs">
                <span>ساعات الإنجاز: <strong className="text-amber-400">{formatHoursDigital(totalHours)}</strong></span>
                <span>المستحق: <strong className="text-emerald-400">{formatCurrency(totalGross)}</strong></span>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t text-slate-600">
                <div className="flex flex-col gap-0.5">
                  <span>الشركة: <strong className="text-slate-800">{eq.companyName}</strong></span>
                  <span className="flex items-center gap-1 text-[11px] text-amber-800 font-extrabold">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>السائق المعين: <strong>{eq.driverName || 'غير محدد'}</strong></span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(eq)}
                    className="p-1.5 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="تعديل المعدة والسائق المعين"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEquipment(eq.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="حذف المعدة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Equipment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingEquipment ? 'تعديل بيانات المعدة' : 'إضافة معدة جديدة'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المعدة:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 font-bold"
                  placeholder="مثال: بوكلين كوماتسو PC300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">نوع المعدة:</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رقم اللوحة / التسجيل:</label>
                <input
                  type="text"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2 font-bold"
                  required
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div>
                  <label className="font-extrabold text-amber-800 block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>سعر التشغيل بالساعة (ر.س/ساعة):</span>
                  </label>
                  <input
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-2 font-black text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="مثال: 180"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">يُستخدم هذا السعر لحساب التكلفة الإجمالية تلقائياً بناءً على ساعات العمل اليومية</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">سعر اليومية (ر.س):</label>
                    <input
                      type="number"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">العقد الشهري (ر.س):</label>
                    <input
                      type="number"
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع العقد الافتراضي (اختياري):</label>
                  <select
                    value={defaultContractType}
                    onChange={(e) => setDefaultContractType(e.target.value as ContractType | '')}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold mb-2"
                  >
                    <option value="">بدون نوع عقد افتراضي</option>
                    <option value="hourly">بالساعة (Hourly)</option>
                    <option value="daily">يومية (Daily)</option>
                    <option value="salary">راتب (Salary)</option>
                    <option value="monthly">شهري (Monthly)</option>
                    <option value="meter">بالمتر (Meter/Counter)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">حالة المعدة الحالية:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'maintenance' | 'idle')}
                    className="w-full bg-slate-50 border rounded-xl p-2 font-bold"
                  >
                    <option value="active">جاهزة / نشطة (Active)</option>
                    <option value="maintenance">تحت الصيانة (In Maintenance)</option>
                    <option value="idle">خارج الخدمة / متوقفة (Idle)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span>السائق المعين / المشغل لهذه الآلية:</span>
                  </label>
                  {driversList.length > 0 ? (
                    <select
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-slate-50 border rounded-xl p-2 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- بدون سائق معين --</option>
                      {driversList.map((dr) => (
                        <option key={dr.id} value={dr.name}>
                          {dr.name} ({dr.salaryType})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="أدخل اسم السائق..."
                      className="w-full bg-slate-50 border rounded-xl p-2 font-bold text-slate-900"
                    />
                  )}
                </div>
              </div>

              {/* Maintenance Schedule Section */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2">
                <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>تحديد موعد وضوابط الصيانة الدورية</span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">تاريخ الصيانة القادم:</label>
                    <input
                      type="date"
                      value={maintenanceDueDate}
                      onChange={(e) => setMaintenanceDueDate(e.target.value)}
                      className="w-full bg-white border rounded-lg p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">مستهدف ساعات الصيانة (س):</label>
                    <input
                      type="number"
                      value={maintenanceTargetHours}
                      onChange={(e) => setMaintenanceTargetHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="مثال: 250"
                      className="w-full bg-white border rounded-lg p-2 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">تكرار دورة الصيانة (كل كم ساعة عمل):</label>
                  <input
                    type="number"
                    value={maintenanceIntervalHours}
                    onChange={(e) => setMaintenanceIntervalHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="مثال: 250 ساعة"
                    className="w-full bg-white border rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ملاحظات وقائمة مهام الصيانة الدورية:</label>
                  <input
                    type="text"
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    placeholder="مثال: تغيير زيت المحرك، تغيير فلاتر الديزل، فحص الهيدروليك"
                    className="w-full bg-white border rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
