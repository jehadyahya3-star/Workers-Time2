import React, { useState } from 'react';
import { Driver, Equipment, WorkReport } from '../types';
import { formatCurrency, formatHoursDigital } from '../utils/exportUtils';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Phone, 
  Search, 
  Truck, 
  UserCheck, 
  X, 
  Link, 
  Unlink,
  CreditCard,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface DriversManagerProps {
  drivers: Driver[];
  equipmentList?: Equipment[];
  reports: WorkReport[];
  onAddDriver: (driver: Driver) => void;
  onUpdateDriver?: (driver: Driver) => void;
  onDeleteDriver?: (id: string) => void;
  onUpdateEquipment?: (equipment: Equipment) => void;
}

export const DriversManager: React.FC<DriversManagerProps> = ({
  drivers,
  equipmentList = [],
  reports,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  onUpdateEquipment
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [salaryType, setSalaryType] = useState<'يومية' | 'شهري' | 'بالساعة'>('يومية');
  const [defaultRate, setDefaultRate] = useState<number>(150);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [assignedEquipment, setAssignedEquipment] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setName('');
    setPhone('');
    setLicenseNumber('');
    setSalaryType('يومية');
    setDefaultRate(150);
    setStatus('active');
    setAssignedEquipment('');
    setShowModal(true);
  };

  const handleOpenEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setName(driver.name);
    setPhone(driver.phone || '');
    setLicenseNumber(driver.licenseNumber || '');
    setSalaryType(driver.salaryType || 'يومية');
    setDefaultRate(driver.defaultRate || 150);
    setStatus(driver.status || 'active');
    setAssignedEquipment(driver.assignedEquipment || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const driverData: Driver = {
      id: editingDriver?.id || `dr-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      licenseNumber: licenseNumber.trim(),
      salaryType,
      defaultRate,
      status,
      assignedEquipment: assignedEquipment || undefined
    };

    if (editingDriver && onUpdateDriver) {
      onUpdateDriver(driverData);
    } else {
      onAddDriver(driverData);
    }

    // Auto update linked equipment if onUpdateEquipment is provided
    if (onUpdateEquipment && equipmentList.length > 0) {
      // 1. If assignedEquipment is set, update that equipment's driverName
      if (assignedEquipment) {
        const targetEq = equipmentList.find(e => e.name === assignedEquipment);
        if (targetEq && targetEq.driverName !== name.trim()) {
          onUpdateEquipment({
            ...targetEq,
            driverName: name.trim()
          });
        }
      }

      // 2. If editing driver and assignedEquipment changed, clear old equipment's driverName if it was this driver
      if (editingDriver && editingDriver.assignedEquipment && editingDriver.assignedEquipment !== assignedEquipment) {
        const oldEq = equipmentList.find(e => e.name === editingDriver.assignedEquipment);
        if (oldEq && oldEq.driverName === editingDriver.name) {
          onUpdateEquipment({
            ...oldEq,
            driverName: ''
          });
        }
      }
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, driverName: string) => {
    if (onDeleteDriver) {
      onDeleteDriver(id);
    } else if (window.confirm(`هل أنت تأكد من حذف بيانات السائق ${driverName}؟`)) {
      // Fallback
    }
  };

  // Quick link driver to equipment from card
  const handleQuickLinkEquipment = (driver: Driver, eqName: string) => {
    const updated: Driver = {
      ...driver,
      assignedEquipment: eqName || undefined
    };

    if (onUpdateDriver) {
      onUpdateDriver(updated);
    }

    if (onUpdateEquipment && equipmentList.length > 0) {
      if (eqName) {
        const targetEq = equipmentList.find(e => e.name === eqName);
        if (targetEq) {
          onUpdateEquipment({ ...targetEq, driverName: driver.name });
        }
      }
      if (driver.assignedEquipment && driver.assignedEquipment !== eqName) {
        const oldEq = equipmentList.find(e => e.name === driver.assignedEquipment);
        if (oldEq && oldEq.driverName === driver.name) {
          onUpdateEquipment({ ...oldEq, driverName: '' });
        }
      }
    }
  };

  // Search Filter
  const filteredDrivers = drivers.filter(d => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.phone && d.phone.includes(q)) ||
      (d.licenseNumber && d.licenseNumber.toLowerCase().includes(q)) ||
      (d.assignedEquipment && d.assignedEquipment.toLowerCase().includes(q))
    );
  });

  // Calculate totals
  const totalActiveDrivers = drivers.filter(d => d.status === 'active').length;
  const totalAssignedDrivers = drivers.filter(d => Boolean(d.assignedEquipment)).length;
  const totalSystemAdvances = reports.reduce((acc, r) => acc + (r.driverAdvance || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            <span>إدارة السائقين والسُلف وربط المعدات</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إضافة وتحديث بيانات السائقين والمشغلين، ربط كل سائق بآليته المخصصة ومتابعة السُلف المنجزة
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>إضافة سائق جديد</span>
        </button>
      </div>

      {/* KPI Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي السائقين المسجلين:</span>
            <div className="flex items-baseline gap-2 mt-1">
              <strong className="text-xl font-black text-slate-900">{drivers.length}</strong>
              <span className="text-xs font-bold text-emerald-600">({totalActiveDrivers} نشط)</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">سائقون مربوطون بمعدات:</span>
            <div className="flex items-baseline gap-2 mt-1">
              <strong className="text-xl font-black text-slate-900">{totalAssignedDrivers}</strong>
              <span className="text-xs font-bold text-slate-400">من أصل {drivers.length}</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي السُلف المسحوبة:</span>
            <strong className="text-xl font-black text-amber-700 mt-1 block">{formatCurrency(totalSystemAdvances)}</strong>
          </div>
          <div className="w-10 h-10 bg-amber-100/80 text-amber-800 rounded-xl flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم السائق، الجوال، الرخصة، أو المعدة المربوطة..."
            className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Drivers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((d) => {
          const driverReports = reports.filter(r => r.driverName === d.name);
          const totalDriverHours = driverReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
          const totalAdvances = driverReports.reduce((acc, r) => acc + (r.driverAdvance || 0), 0);

          return (
            <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-all relative">
              
              {/* Card Header */}
              <div className="flex items-start justify-between border-b pb-3">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <UserCheck className="w-4.5 h-4.5 text-amber-500" />
                    <span>{d.name}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`font-bold px-2 py-0.5 rounded-full ${
                      d.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {d.status === 'active' ? 'نشط' : 'متوقف'}
                    </span>
                    <span className="bg-amber-100/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      عقد {d.salaryType} ({d.defaultRate} ر.س)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(d)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="تعديل بيانات السائق"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {onDeleteDriver && (
                    <button
                      onClick={() => handleDelete(d.id, d.name)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="حذف السائق"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Linked Equipment Box */}
              <div className={`p-3 rounded-xl border space-y-1.5 ${
                d.assignedEquipment 
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>المعدة المربوطة:</span>
                  </span>
                  {d.assignedEquipment ? (
                    <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md font-black flex items-center gap-1">
                      <Link className="w-3 h-3 text-amber-700" />
                      <span>مربوط بآلية</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                      غير مربوط
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <strong className="text-xs font-black text-slate-900 truncate">
                    {d.assignedEquipment || 'لم يتم اختيار معدة بعد'}
                  </strong>

                  {/* Quick Select Dropdown */}
                  {equipmentList.length > 0 && (
                    <select
                      value={d.assignedEquipment || ''}
                      onChange={(e) => handleQuickLinkEquipment(d, e.target.value)}
                      className="text-[11px] font-bold bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer text-slate-800 shrink-0"
                    >
                      <option value="">-- تغيير الربط --</option>
                      {equipmentList.map((eq) => (
                        <option key={eq.id} value={eq.name}>{eq.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    <span>رقم الجوال:</span>
                  </span>
                  <a href={`tel:${d.phone}`} className="font-extrabold text-slate-900 dir-ltr hover:underline">
                    {d.phone || 'غير مسجل'}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>رقم الرخصة/الهوية:</span>
                  </span>
                  <strong className="font-extrabold text-slate-800">{d.licenseNumber || 'غير مسجل'}</strong>
                </div>
              </div>

              {/* Work Statistics Ledger Box */}
              <div className="bg-slate-900 text-white p-3 rounded-xl text-xs space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">إجمالي ساعات العمل:</span>
                  <span className="font-black text-amber-400 text-sm">{formatHoursDigital(totalDriverHours)}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                  <span className="text-slate-400">إجمالي السُلف من اليوميات:</span>
                  <span className="font-black text-rose-400">{formatCurrency(totalAdvances)}</span>
                </div>
              </div>

            </div>
          );
        })}

        {filteredDrivers.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">لم يتم العثور على سائقين ينطبق عليهم شرط البحث</h3>
            <button
              onClick={handleOpenAdd}
              className="bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سائق جديد الآن</span>
            </button>
          </div>
        )}
      </div>

      {/* Driver Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-500" />
                <span>{editingDriver ? 'تعديل بيانات السائق' : 'إضافة سائق جديد وربطه بالمعدة'}</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="font-extrabold text-slate-800 block mb-1">اسم السائق الكامل:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="مثال: أحمد عبد الله صالح"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">رقم الجوال:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold dir-ltr text-right"
                    placeholder="0501234567"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">رقم الرخصة / الهوية:</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    placeholder="مثال: 1029384756"
                  />
                </div>
              </div>

              {/* Linked Equipment Selection Dropdown */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <label className="font-extrabold text-amber-950 flex items-center gap-1.5 block">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>ربط السائق بمعدة مخصصة (الآلية):</span>
                </label>
                <select
                  value={assignedEquipment}
                  onChange={(e) => setAssignedEquipment(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl p-2 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- بدون معدة (سائق عام / احتياط) --</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.name}>
                      {eq.name} ({eq.type} - اللوحة: {eq.regNumber})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-amber-900 leading-tight">
                  عند تحديد معدة، سينبثق اسم هذا السائق تلقائياً عند تسجيل تقارير العمل وحركة الديزل لهذه الآلية.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">نظام العقد / الراتب:</label>
                  <select
                    value={salaryType}
                    onChange={(e) => setSalaryType(e.target.value as 'يومية' | 'شهري' | 'بالساعة')}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                  >
                    <option value="يومية">أجر يومي (يومية)</option>
                    <option value="شهري">راتب شهري ثبات</option>
                    <option value="بالساعة">أجر بالساعة</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-slate-800 block mb-1">المبلغ / الراتب الافتراضي:</label>
                  <input
                    type="number"
                    value={defaultRate}
                    onChange={(e) => setDefaultRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                    placeholder="150"
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-slate-800 block mb-1">حالة السائق الحالية:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                >
                  <option value="active">نشط على رأس العمل (Active)</option>
                  <option value="inactive">متوقف / في إجازة (Inactive)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-2 rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  {editingDriver ? 'تحديث السائق' : 'حفظ وإضافة السائق'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

