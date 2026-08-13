import React, { useState, useMemo } from 'react';
import { ContractType, Driver, Equipment, WorkReport } from '../types';
import { formatCurrency, formatHoursDigital } from '../utils/exportUtils';
import { 
  HardHat, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  X, 
  User, 
  Search, 
  Gauge, 
  Building2, 
  Camera, 
  Activity, 
  DollarSign, 
  Filter,
  AlertTriangle,
  Info,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface EquipmentManagerProps {
  equipmentList: Equipment[];
  driversList?: Driver[];
  reports: WorkReport[];
  onAddEquipment: (equipment: Equipment) => void;
  onUpdateEquipment: (equipment: Equipment) => void;
  onDeleteEquipment: (id: string) => void;
}

// Default high-quality heavy machinery images mapped by equipment type
const getEquipmentDefaultImage = (type: string, name: string): string => {
  const t = (type + ' ' + name).toLowerCase();
  if (t.includes('بوكلين') || t.includes('حفار') || t.includes('excavator')) {
    return 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('شيول') || t.includes('شاول') || t.includes('loader')) {
    return 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b2?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('بلدوزر') || t.includes('dozer')) {
    return 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('قلاب') || t.includes('dumper') || t.includes('truck')) {
    return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('رافعة') || t.includes('كرين') || t.includes('crane')) {
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('رصاصة') || t.includes('دكاكة') || t.includes('roller')) {
    return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80';
  }
  if (t.includes('جريدر') || t.includes('grader')) {
    return 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80';
  }
  return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80';
};

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

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'idle'>('all');

  // Form States
  const [name, setName] = useState('');
  const [type, setType] = useState('بوكلين (حفار)');
  const [regNumber, setRegNumber] = useState('');
  const [companyName, setCompanyName] = useState('شركة أعمار الخليج للمقاولات');
  const [status, setStatus] = useState<'active' | 'maintenance' | 'idle'>('active');
  const [imageUrl, setImageUrl] = useState('');
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
    setImageUrl('');
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
    setImageUrl(eq.imageUrl || '');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      imageUrl: imageUrl || undefined,
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

  const handleCompleteMaintenance = (eq: Equipment, currentHours: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const interval = eq.maintenanceIntervalHours || 250;
    const newTargetHours = currentHours + interval;
    
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

  // Fleet Stats Overview
  const fleetStats = useMemo(() => {
    const totalCount = equipmentList.length;
    const activeCount = equipmentList.filter(e => e.status === 'active').length;
    const maintenanceCount = equipmentList.filter(e => e.status === 'maintenance').length;
    const idleCount = equipmentList.filter(e => e.status === 'idle').length;

    let totalFleetHours = 0;
    let totalFleetGross = 0;

    equipmentList.forEach(eq => {
      const eqReports = reports.filter(r => r.equipmentName === eq.name);
      totalFleetHours += eqReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
      totalFleetGross += eqReports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);
    });

    return { totalCount, activeCount, maintenanceCount, idleCount, totalFleetHours, totalFleetGross };
  }, [equipmentList, reports]);

  // Filtered equipment list
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter(eq => {
      const matchesSearch = 
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.driverName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || eq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [equipmentList, searchQuery, statusFilter]);

  // Chart Data for Equipment Hours
  const equipmentChartData = useMemo(() => {
    return equipmentList.map(eq => {
      const eqReports = reports.filter(r => r.equipmentName === eq.name);
      const totalHours = eqReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
      const totalGross = eqReports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);
      return {
        name: eq.name,
        shortName: eq.name.length > 16 ? eq.name.substring(0, 14) + '...' : eq.name,
        type: eq.type,
        hours: Math.round(totalHours * 100) / 100,
        grossAmount: totalGross,
        status: eq.status
      };
    }).sort((a, b) => b.hours - a.hours);
  }, [equipmentList, reports]);

  return (
    <div className="space-y-6 font-['Cairo',sans-serif] dir-rtl" dir="rtl">
      
      {/* Top Header & Fleet Stats Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  أسطول المعدات والآليات الثقيلة
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5">
                  عرض تفاعلي لبطاقات أداء وساعات عمل المعدات وجداول الصيانة
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة معدة جديدة</span>
          </button>
        </div>

        {/* Fleet KPI Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">إجمالي المعدات</span>
              <span className="text-lg font-black text-white">{fleetStats.totalCount} معدة</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">جاهزة / نشطة</span>
              <span className="text-lg font-black text-emerald-400">{fleetStats.activeCount}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">تحت الصيانة</span>
              <span className="text-lg font-black text-rose-400">{fleetStats.maintenanceCount}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">إجمالي ساعات التشغيل</span>
              <span className="text-lg font-black text-amber-300">{formatHoursDigital(fleetStats.totalFleetHours)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Operational Hours Bar Chart */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-inner">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                إجمالي ساعات العمل لكل معدة
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                مقارنة ساعات التشغيل الفعلية المستخرجة من تقارير العمل لكل معدة في الأسطول
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60 self-start sm:self-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>أعلى تشغيل</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span>معدات أخرى</span>
            </span>
          </div>
        </div>

        {equipmentChartData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-bold">
            لا توجد معدات مسجلة لعرض المخطط البياني
          </div>
        ) : (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={equipmentChartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="shortName" 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  unit=" س"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs text-white space-y-1.5 font-['Cairo',sans-serif]" dir="rtl">
                          <div className="font-black text-amber-400">{data.name}</div>
                          <div className="text-slate-300">النوع: <span className="font-bold text-white">{data.type}</span></div>
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                            <span className="text-slate-400">ساعات العمل:</span>
                            <span className="font-black text-amber-300">{formatHoursDigital(data.hours)} ({data.hours} س)</span>
                          </div>
                          {data.grossAmount > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">الإيراد المالي:</span>
                              <span className="font-black text-emerald-400">{formatCurrency(data.grossAmount)}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }} 
                  cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }} 
                />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {equipmentChartData.map((_entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#f59e0b' : index === 1 ? '#fbbf24' : '#64748b'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم المعدة، الرقم، السائق..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' 
                ? 'bg-slate-900 text-amber-400 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({fleetStats.totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'active' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>نشطة ({fleetStats.activeCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'maintenance' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span>صيانة ({fleetStats.maintenanceCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('idle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'idle' 
                ? 'bg-slate-700 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>متوقفة ({fleetStats.idleCount})</span>
          </button>
        </div>

      </div>

      {/* Equipment Interactive Cards Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <HardHat className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">لا توجد معدات مطابقة للبحث</h3>
          <p className="text-xs text-slate-500">قم بتغيير كلمات البحث أو أضف معدة جديدة إلى الأسطول</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => {
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

            // Image URL
            const displayImg = eq.imageUrl || getEquipmentDefaultImage(eq.type, eq.name);

            // Progress towards maintenance
            const target = eq.maintenanceTargetHours || 250;
            const maintenanceProgressPct = Math.min(100, Math.round((totalHours / target) * 100));

            return (
              <div 
                key={eq.id} 
                className={`group bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between relative ${
                  isDue 
                    ? 'border-rose-300 ring-2 ring-rose-300/50' 
                    : isSoon 
                    ? 'border-amber-300 ring-2 ring-amber-300/40' 
                    : 'border-slate-200/90 hover:border-amber-400'
                }`}
              >
                
                {/* Header Image Box */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={displayImg}
                    alt={eq.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between pointer-events-none">
                    {/* Status Badge */}
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full backdrop-blur-md shadow-md flex items-center gap-1.5 ${
                      eq.status === 'active'
                        ? 'bg-emerald-500/90 text-white'
                        : eq.status === 'maintenance'
                        ? 'bg-rose-600/90 text-white animate-pulse'
                        : 'bg-slate-800/90 text-slate-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        eq.status === 'active' ? 'bg-emerald-200' : eq.status === 'maintenance' ? 'bg-rose-200' : 'bg-slate-400'
                      }`} />
                      <span>
                        {eq.status === 'active' ? 'جاهزة / نشطة' : eq.status === 'maintenance' ? 'تحت الصيانة' : 'خارج الخدمة'}
                      </span>
                    </span>

                    {/* Action buttons floating */}
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-amber-500 text-white hover:text-slate-950 backdrop-blur-md transition-colors cursor-pointer"
                        title="تعديل المعدة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEquipment(eq.id)}
                        className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors cursor-pointer"
                        title="حذف المعدة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Details */}
                  <div className="absolute bottom-3 right-3 left-3 text-white">
                    <span className="text-[10px] font-extrabold text-amber-400 tracking-wider bg-slate-900/80 px-2 py-0.5 rounded-md backdrop-blur-xs inline-block mb-1">
                      {eq.type}
                    </span>
                    <h3 className="text-base font-black text-white leading-tight drop-shadow-sm">
                      {eq.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-300 font-bold mt-0.5">
                      <span>لوحة: <strong className="text-white font-mono">{eq.regNumber}</strong></span>
                      <span>•</span>
                      <span className="truncate">{eq.companyName}</span>
                    </div>
                  </div>
                </div>

                {/* Main Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  
                  {/* Hours & Financial Highlight Box */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-900 text-white p-3.5 rounded-2xl shadow-inner">
                    <div className="border-l border-slate-800 pl-2">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-0.5">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>ساعات العمل الإجمالية</span>
                      </span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        {formatHoursDigital(totalHours)}
                      </span>
                    </div>

                    <div className="pr-2">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-0.5">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span>المستحق المالي</span>
                      </span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {formatCurrency(totalGross)}
                      </span>
                    </div>
                  </div>

                  {/* Maintenance Progress & Status */}
                  <div className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-colors ${
                    isDue 
                      ? 'bg-rose-50 border-rose-200' 
                      : isSoon 
                      ? 'bg-amber-50 border-amber-200' 
                      : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Wrench className={`w-3.5 h-3.5 ${isDue ? 'text-rose-600' : isSoon ? 'text-amber-600' : 'text-slate-500'}`} />
                        <span>مشرع الصيانة الدوري:</span>
                      </span>

                      {isDue ? (
                        <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-md animate-pulse">
                          صيانة مستحقة!
                        </span>
                      ) : isSoon ? (
                        <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md">
                          اقتراب الموعد
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-500">
                          حالة ممتازة
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {hasTargetHours && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-600">
                          <span>العداد: {totalHours} ساعة</span>
                          <span>المستهدف: {eq.maintenanceTargetHours} ساعة</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                              isDue ? 'bg-rose-600' : isSoon ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${maintenanceProgressPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {eq.maintenanceNotes && (
                      <p className="text-[10px] text-slate-600 italic bg-white/80 p-2 rounded-xl border border-slate-200/60">
                        "{eq.maintenanceNotes}"
                      </p>
                    )}

                    {(isDue || isSoon) && (
                      <button
                        onClick={() => handleCompleteMaintenance(eq, totalHours)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تمت الصيانة (تصفير العداد لـ +{eq.maintenanceIntervalHours || 250}س)</span>
                      </button>
                    )}
                  </div>

                  {/* Operating Rates Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                    <div className="bg-amber-50 p-1.5 rounded-xl border border-amber-200/60">
                      <span className="text-[9px] text-amber-800 font-extrabold block">الساعة</span>
                      <span className="font-black text-amber-900 text-xs">{eq.hourlyRate} ر.س</span>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-400 font-bold block">اليومية</span>
                      <span className="font-extrabold text-slate-800 text-xs">{eq.dailyRate} ر.س</span>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-400 font-bold block">الشهري</span>
                      <span className="font-extrabold text-slate-800 text-xs">{eq.monthlyRate} ر.س</span>
                    </div>
                  </div>

                  {/* Driver Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block">السائق المعين</span>
                        <strong className="text-slate-900 text-xs">{eq.driverName || 'غير محدد'}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEdit(eq)}
                      className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>تعديل</span>
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Equipment Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {editingEquipment ? 'تعديل بيانات المعدة' : 'إضافة معدة جديدة لأسطول العمل'}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">أدخل بيانات الآلية الثقيلة وأدوار الصيانة والسائق</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Image Upload Preview */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">صورة المعدة (اختياري):</label>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-2.5">
                  <div className="w-16 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300">
                    {imageUrl || (type && name) ? (
                      <img 
                        src={imageUrl || getEquipmentDefaultImage(type, name)} 
                        alt="معاينة" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>رفع صورة من الجهاز</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">إذا لم ترفع صورة، سيتم تحديد صورة عالية الجودة تلقائياً بحسب نوع المعدة</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">اسم المعدة:</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    placeholder="مثال: بوكلين كوماتسو PC300"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">نوع المعدة:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    required
                  >
                    <option value="بوكلين (حفار)">بوكلين (حفار / Excavator)</option>
                    <option value="شيول (شاول)">شيول (شاول / Loader)</option>
                    <option value="بلدوزر">بلدوزر (Bulldozer)</option>
                    <option value="جريدر">جريدر (Grader)</option>
                    <option value="قلاب">قلاب (Dump Truck)</option>
                    <option value="رافعة (كرين)">رافعة (كرين / Crane)</option>
                    <option value="رصاصة (دكاكة)">رصاصة (دكّاكة / Roller)</option>
                    <option value="معدة أخرى">معدة أخرى</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم اللوحة / التسجيل:</label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    placeholder="مثال: 8392 - أ ب ج"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">الشركة المالكة / المؤجرة:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Operating Rates */}
              <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2">
                <label className="font-extrabold text-amber-900 block mb-1 flex items-center gap-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>سعر التشغيل بالساعة (ر.س/ساعة):</span>
                </label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-amber-300 rounded-xl p-2.5 font-black text-amber-900 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  placeholder="مثال: 180"
                  required
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">سعر اليومية (ر.س):</label>
                    <input
                      type="number"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">العقد الشهري (ر.س):</label>
                    <input
                      type="number"
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">حالة المعدة الحالية:</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'maintenance' | 'idle')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  >
                    <option value="active">جاهزة / نشطة (Active)</option>
                    <option value="maintenance">تحت الصيانة (In Maintenance)</option>
                    <option value="idle">خارج الخدمة / متوقفة (Idle)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span>السائق المعين:</span>
                  </label>
                  {driversList.length > 0 ? (
                    <select
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    />
                  )}
                </div>
              </div>

              {/* Maintenance Schedule Section */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>تحديد ضوابط ومواعيد الصيانة الدورية</span>
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">تاريخ الصيانة القادم:</label>
                    <input
                      type="date"
                      value={maintenanceDueDate}
                      onChange={(e) => setMaintenanceDueDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">تكرار الساعات (س):</label>
                    <input
                      type="number"
                      value={maintenanceIntervalHours}
                      onChange={(e) => setMaintenanceIntervalHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="مثال: 250"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ملاحظات وقائمة مهام الصيانة:</label>
                  <input
                    type="text"
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    placeholder="مثال: تغيير زيت المحرك، تغيير فلاتر الديزل..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                >
                  حفظ البيانات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
