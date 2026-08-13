import React, { useState, useMemo } from 'react';
import { 
  DieselTransaction, 
  WorkReport, 
  Equipment, 
  ProjectInfo 
} from '../types';
import { 
  Fuel, 
  Calendar, 
  Filter, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  RefreshCw, 
  Download, 
  Printer, 
  Search, 
  Flame, 
  HardHat, 
  ArrowUpRight, 
  Coins, 
  Droplet, 
  Layers, 
  LineChart as LineChartIcon,
  HelpCircle,
  Clock,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { formatCurrency } from '../utils/exportUtils';
import { useLanguage } from '../i18n/LanguageContext';

interface FuelConsumptionAnalysisProps {
  dieselTransactions: DieselTransaction[];
  reports: WorkReport[];
  equipmentList: Equipment[];
  projectInfo: ProjectInfo;
}

// Color palette for equipment lines & bars
const COLORS = [
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#eab308', // Yellow
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

interface CombinedFuelRecord {
  id: string;
  date: string;
  equipmentName: string;
  quantityLiters: number;
  totalCost: number;
  pricePerLiter: number;
  driverName?: string;
  source: string;
  notes?: string;
}

export const FuelConsumptionAnalysis: React.FC<FuelConsumptionAnalysisProps> = ({
  dieselTransactions,
  reports,
  equipmentList,
  projectInfo
}) => {
  const { t } = useLanguage();

  // Filters state
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [groupBy, setGroupBy] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [viewMetric, setViewMetric] = useState<'liters' | 'cost'>('liters');
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Unify fuel consumption data from diesel transactions + reports (avoiding duplicates)
  const unifiedRecords = useMemo<CombinedFuelRecord[]>(() => {
    const records: CombinedFuelRecord[] = [];
    const recordKeys = new Set<string>();

    // Process consume diesel transactions
    dieselTransactions
      .filter(t => t.type === 'consume' && t.quantityLiters > 0)
      .forEach(t => {
        const key = `${t.date}_${t.equipmentName || 'غير محدد'}_${t.quantityLiters}`;
        recordKeys.add(key);
        records.push({
          id: t.id,
          date: t.date,
          equipmentName: t.equipmentName?.trim() || 'معدة غير مسماة',
          quantityLiters: Number(t.quantityLiters) || 0,
          totalCost: Number(t.totalCost) || (Number(t.quantityLiters) * (t.pricePerLiter || 2.3)),
          pricePerLiter: t.pricePerLiter || 2.3,
          driverName: t.driverName,
          source: 'سجل صرف ديزل',
          notes: t.notes
        });
      });

    // Process work reports with diesel costs (only if not already recorded in dieselTransactions)
    reports
      .filter(r => r.costs?.dieselLiters && r.costs.dieselLiters > 0)
      .forEach(r => {
        const key = `${r.date}_${r.equipmentName || 'غير محدد'}_${r.costs.dieselLiters}`;
        if (!recordKeys.has(key)) {
          recordKeys.add(key);
          const liters = Number(r.costs.dieselLiters) || 0;
          const costPerLiter = r.costs.dieselCostPerLiter || 2.3;
          records.push({
            id: `rpt-${r.id}`,
            date: r.date,
            equipmentName: r.equipmentName?.trim() || 'معدة غير مسماة',
            quantityLiters: liters,
            totalCost: r.costs.dieselTotalCost || (liters * costPerLiter),
            pricePerLiter: costPerLiter,
            driverName: r.driverName,
            source: `تقرير عمل #${r.reportNumber}`,
            notes: r.notes
          });
        }
      });

    // Sort chronologically ascending
    return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dieselTransactions, reports]);

  // Unique equipment names from records and equipment list
  const allEquipmentNames = useMemo(() => {
    const names = new Set<string>();
    equipmentList.forEach(e => {
      if (e.name) names.add(e.name.trim());
    });
    unifiedRecords.forEach(r => {
      if (r.equipmentName) names.add(r.equipmentName.trim());
    });
    return Array.from(names);
  }, [equipmentList, unifiedRecords]);

  // Quick Date Range Preset Handlers
  const handlePresetDate = (preset: 'all' | 'month' | '30days' | '7days' | 'year') => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === '7days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 7);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === '30days') {
      const past = new Date(today);
      past.setDate(today.getDate() - 30);
      setStartDate(formatDate(past));
      setEndDate(formatDate(today));
    } else if (preset === 'month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(today));
    } else if (preset === 'year') {
      const firstDay = new Date(today.getFullYear(), 0, 1);
      setStartDate(formatDate(firstDay));
      setEndDate(formatDate(today));
    }
  };

  // 2. Filter records based on selected controls
  const filteredRecords = useMemo(() => {
    return unifiedRecords.filter(r => {
      // Equipment Filter
      if (selectedEquipment !== 'all' && r.equipmentName !== selectedEquipment) {
        return false;
      }
      // Date Range Filter
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;

      // Text Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesEq = r.equipmentName.toLowerCase().includes(q);
        const matchesDriver = r.driverName?.toLowerCase().includes(q);
        const matchesNotes = r.notes?.toLowerCase().includes(q);
        const matchesDate = r.date.includes(q);
        if (!matchesEq && !matchesDriver && !matchesNotes && !matchesDate) {
          return false;
        }
      }

      return true;
    });
  }, [unifiedRecords, selectedEquipment, startDate, endDate, searchQuery]);

  // 3. Aggregate Summary Statistics
  const summaryStats = useMemo(() => {
    const totalLiters = filteredRecords.reduce((acc, r) => acc + r.quantityLiters, 0);
    const totalCost = filteredRecords.reduce((acc, r) => acc + r.totalCost, 0);
    const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    const totalEntries = filteredRecords.length;

    // Calculate unique days in period
    const uniqueDaysSet = new Set(filteredRecords.map(r => r.date));
    const totalDaysCount = uniqueDaysSet.size || 1;
    const avgDailyLiters = totalLiters / totalDaysCount;
    const avgDailyCost = totalCost / totalDaysCount;

    // Most consuming equipment
    const equipmentTotals: Record<string, { liters: number; cost: number }> = {};
    filteredRecords.forEach(r => {
      if (!equipmentTotals[r.equipmentName]) {
        equipmentTotals[r.equipmentName] = { liters: 0, cost: 0 };
      }
      equipmentTotals[r.equipmentName].liters += r.quantityLiters;
      equipmentTotals[r.equipmentName].cost += r.totalCost;
    });

    let topEquipment = 'لا يوجد';
    let topEquipmentLiters = 0;
    (Object.entries(equipmentTotals) as [string, { liters: number; cost: number }][]).forEach(([eqName, data]) => {
      if (data.liters > topEquipmentLiters) {
        topEquipmentLiters = data.liters;
        topEquipment = eqName;
      }
    });

    // Highest single consumption record
    let highestSingleDayRecord = filteredRecords[0] || null;
    filteredRecords.forEach(r => {
      if (!highestSingleDayRecord || r.quantityLiters > highestSingleDayRecord.quantityLiters) {
        highestSingleDayRecord = r;
      }
    });

    return {
      totalLiters,
      totalCost,
      avgPricePerLiter,
      totalEntries,
      totalDaysCount,
      avgDailyLiters,
      avgDailyCost,
      topEquipment,
      topEquipmentLiters,
      highestSingleDayRecord,
      equipmentTotals
    };
  }, [filteredRecords]);

  // 4. Transform data for Recharts Evolution Time-Series Chart
  const timeSeriesChartData = useMemo(() => {
    if (filteredRecords.length === 0) return [];

    // Grouping by Date bucket according to `groupBy`
    const groupKeyFn = (dateStr: string) => {
      if (groupBy === 'monthly') {
        return dateStr.slice(0, 7); // YYYY-MM
      } else if (groupBy === 'weekly') {
        const d = new Date(dateStr);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
      }
      return dateStr; // YYYY-MM-DD
    };

    const buckets: { [bucketKey: string]: { [key: string]: any } } = {};

    filteredRecords.forEach(r => {
      const bucketKey = groupKeyFn(r.date);
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {
          dateKey: bucketKey,
          displayDate: bucketKey,
          totalLiters: 0,
          totalCost: 0
        };
      }
      
      const val = viewMetric === 'liters' ? r.quantityLiters : r.totalCost;
      buckets[bucketKey].totalLiters += r.quantityLiters;
      buckets[bucketKey].totalCost += r.totalCost;

      // Add breakdown by equipment if 'all' equipment is selected
      const eqKey = r.equipmentName;
      if (!buckets[bucketKey][eqKey]) {
        buckets[bucketKey][eqKey] = 0;
      }
      buckets[bucketKey][eqKey] += val;
    });

    // Convert map to array sorted by dateKey
    const result = Object.values(buckets).sort((a, b) => a.dateKey.localeCompare(b.dateKey));

    // Format display date nicely
    return result.map(item => ({
      ...item,
      displayDate: item.dateKey.length === 7 
        ? `${item.dateKey}` 
        : item.dateKey.slice(5) // MM-DD
    }));
  }, [filteredRecords, groupBy, viewMetric]);

  // 5. Equipment Breakdown Data for Bar Chart & Pie Chart
  const equipmentBreakdownData = useMemo(() => {
    const list = (Object.entries(summaryStats.equipmentTotals) as [string, { liters: number; cost: number }][]).map(([name, data]) => ({
      name,
      liters: Math.round(data.liters * 10) / 10,
      cost: Math.round(data.cost),
      value: viewMetric === 'liters' ? Math.round(data.liters) : Math.round(data.cost)
    }));

    return list.sort((a, b) => b.value - a.value);
  }, [summaryStats.equipmentTotals, viewMetric]);

  // 6. Detailed Interactive Equipment Comparison Data for Recharts
  const [comparisonMetric, setComparisonMetric] = useState<'liters' | 'liters_vs_refuels' | 'avg_refuel' | 'cost'>('liters_vs_refuels');

  const equipmentComparisonList = useMemo(() => {
    const map: Record<string, {
      name: string;
      totalLiters: number;
      totalCost: number;
      refuelCount: number;
      avgLitersPerRefuel: number;
      sharePercent: number;
    }> = {};

    filteredRecords.forEach(r => {
      const eqName = r.equipmentName || 'غير محدد';
      if (!map[eqName]) {
        map[eqName] = {
          name: eqName,
          totalLiters: 0,
          totalCost: 0,
          refuelCount: 0,
          avgLitersPerRefuel: 0,
          sharePercent: 0
        };
      }
      map[eqName].totalLiters += r.quantityLiters;
      map[eqName].totalCost += r.totalCost;
      map[eqName].refuelCount += 1;
    });

    const totalLitersAll = summaryStats.totalLiters || 1;

    return Object.values(map)
      .map(item => ({
        ...item,
        totalLiters: Math.round(item.totalLiters * 10) / 10,
        totalCost: Math.round(item.totalCost),
        avgLitersPerRefuel: item.refuelCount > 0 ? Math.round((item.totalLiters / item.refuelCount) * 10) / 10 : 0,
        sharePercent: Math.round((item.totalLiters / totalLitersAll) * 1000) / 10
      }))
      .sort((a, b) => b.totalLiters - a.totalLiters);
  }, [filteredRecords, summaryStats.totalLiters]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('لا يوجد بيانات للتصدير');
      return;
    }

    const headers = ['التاريخ', 'اسم المعدة', 'الكمية (لتر)', 'سعر اللتر', 'الإجمالي', 'السائق', 'المصدر / نوع السجل', 'ملاحظات'];
    const rows = filteredRecords.map(r => [
      r.date,
      `"${r.equipmentName}"`,
      r.quantityLiters,
      r.pricePerLiter,
      r.totalCost,
      `"${r.driverName || '-'}"`,
      `"${r.source}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `تقرير_استهلاك_الديزل_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl border border-slate-700 shadow-xl text-xs backdrop-blur-md">
          <p className="font-extrabold text-amber-400 border-b border-slate-800 pb-1.5 mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>التاريخ / الفترة: {label}</span>
          </p>
          <div className="space-y-1.5">
            {payload.map((pld: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 font-bold" style={{ color: pld.color || '#f59e0b' }}>
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: pld.color || '#f59e0b' }}></span>
                  <span>{pld.name || pld.dataKey}:</span>
                </span>
                <span className="font-mono font-black text-slate-100">
                  {pld.value.toLocaleString()} {viewMetric === 'liters' ? 'لتر' : (projectInfo.currency || 'ر.ي')}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 p-2.5 rounded-xl shadow-lg border border-amber-300/40">
              <Fuel className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>تحليل وتتبع استهلاك الوقود (الديزل)</span>
                <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-0.5 rounded-full font-extrabold border border-amber-500/30">
                  Recharts Analytics
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                متابعة حركة استهلاك الديزل لكل معدة عبر الزمن وتحديد معدلات الكفاءة والتكاليف التشغيلية
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="تصدير جدول البيانات إلى Excel / CSV"
          >
            <Download className="w-4 h-4" />
            <span>تصدير CSV</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm no-print"
            title="طباعة التقرير"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>طباعة</span>
          </button>
        </div>
      </div>

      {/* Control & Filter Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500" />
            <span>أدوات تصفية وفلترة البيانات</span>
          </h2>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <span>إجمالي السجلات:</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-mono font-black">
              {filteredRecords.length}
            </span>
          </div>
        </div>

        {/* Primary Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Equipment Selector */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <HardHat className="w-3.5 h-3.5 text-amber-500" />
              <span>المعدة المراد تحليلها:</span>
            </label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">⚡ كافة المعدات ({allEquipmentNames.length})</option>
              {allEquipmentNames.map(eq => (
                <option key={eq} value={eq}>🏗️ {eq}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>من تاريخ:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>إلى تاريخ:</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Grouping Option (Daily / Weekly / Monthly) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>تجميع الرسم البياني:</span>
            </label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setGroupBy('daily')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  groupBy === 'daily'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                يومي
              </button>
              <button
                onClick={() => setGroupBy('weekly')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  groupBy === 'weekly'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                أسبوعي
              </button>
              <button
                onClick={() => setGroupBy('monthly')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  groupBy === 'monthly'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                شهري
              </button>
            </div>
          </div>

        </div>

        {/* Quick Date Presets Buttons & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">فترات سريعة:</span>
            <button
              onClick={() => handlePresetDate('7days')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => handlePresetDate('30days')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              آخر 30 يوم
            </button>
            <button
              onClick={() => handlePresetDate('month')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              هذا الشهر
            </button>
            <button
              onClick={() => handlePresetDate('year')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              هذا العام
            </button>
            <button
              onClick={() => handlePresetDate('all')}
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-extrabold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              كافة الفترات
            </button>
          </div>

          {(startDate || endDate || selectedEquipment !== 'all') && (
            <button
              onClick={() => {
                setSelectedEquipment('all');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Liters Card */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 p-4 rounded-2xl shadow-lg border border-amber-400/40 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-900/80">
              إجمالي الوقود المستهلك
            </span>
            <div className="bg-slate-950/20 p-2 rounded-xl text-slate-950">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">
              {summaryStats.totalLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-extrabold">لتر ديزل</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-950/90 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>خلال {summaryStats.totalDaysCount} يوم عمل تشغيلي</span>
          </div>
        </div>

        {/* Total Cost Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
              إجمالي تكلفة الوقود
            </span>
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
              {formatCurrency(summaryStats.totalCost, projectInfo.currency)}
            </span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>متوسط سعر اللتر:</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold">
              {summaryStats.avgPricePerLiter.toFixed(2)} {projectInfo.currency || 'ر.ي'}
            </span>
          </div>
        </div>

        {/* Daily Consumption Average Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
              معدل الاستهلاك اليومي
            </span>
            <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
              {Math.round(summaryStats.avgDailyLiters)}
            </span>
            <span className="text-xs font-extrabold text-slate-500">لتر / يوم</span>
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-500 flex items-center justify-between">
            <span>التكلفة اليومية:</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-extrabold">
              {formatCurrency(summaryStats.avgDailyCost, projectInfo.currency)}
            </span>
          </div>
        </div>

        {/* Top Consuming Equipment Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 dark:text-slate-400">
              المعدة الأكثر استهلاكاً
            </span>
            <div className="bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 truncate" title={summaryStats.topEquipment}>
              {summaryStats.topEquipment}
            </h3>
            <div className="flex items-baseline gap-1 text-rose-600 dark:text-rose-400 font-mono font-black text-sm mt-0.5">
              <span>{summaryStats.topEquipmentLiters.toLocaleString()}</span>
              <span className="text-xs font-bold">لتر</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-400 truncate">
            {summaryStats.totalLiters > 0 
              ? `تشكّل ${Math.round((summaryStats.topEquipmentLiters / summaryStats.totalLiters) * 100)}% من إجمالي الديزل`
              : 'لا توجد بيانات'
            }
          </div>
        </div>

      </div>

      {/* Main Recharts Chart: Time Series Consumption Evolution */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-amber-500" />
              <span>منحنى تطور استهلاك الديزل عبر الزمن</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedEquipment === 'all' 
                ? 'مخطط زمني تفاعلي يوضح تتبع الكميات لكل معدة والتطور الإجمالي' 
                : `تتبع استهلاك معدة: ${selectedEquipment}`}
            </p>
          </div>

          {/* Chart Controls (Metric & Chart Type) */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Metric Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setViewMetric('liters')}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  viewMetric === 'liters'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                💧 الكمية (لتر)
              </button>
              <button
                onClick={() => setViewMetric('cost')}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  viewMetric === 'cost'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                💰 التكلفة ({projectInfo.currency || 'ر.ي'})
              </button>
            </div>

            {/* Chart Style Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                  chartType === 'area'
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="مخطط مساحي مظلل"
              >
                مساحي
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                  chartType === 'line'
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="مخطط خطي"
              >
                خطي
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 font-bold rounded-lg transition-all ${
                  chartType === 'bar'
                    ? 'bg-slate-900 text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
                title="مخطط أعمدة"
              >
                أعمدة
              </button>
            </div>

          </div>
        </div>

        {/* Recharts Stage */}
        <div className="h-80 w-full dir-ltr pt-2">
          {timeSeriesChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={timeSeriesChartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="totalColorGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05}/>
                    </linearGradient>
                    {allEquipmentNames.map((eq, idx) => (
                      <linearGradient key={eq} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.7}/>
                        <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.05}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickMargin={8}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 'bold' }}
                  />

                  {selectedEquipment === 'all' ? (
                    <>
                      <Area
                        type="monotone"
                        dataKey={viewMetric === 'liters' ? 'totalLiters' : 'totalCost'}
                        name="إجمالي الاستهلاك الكلي"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#totalColorGrad)"
                      />
                      {allEquipmentNames.map((eq, idx) => (
                        <Area
                          key={eq}
                          type="monotone"
                          dataKey={eq}
                          name={eq}
                          stroke={COLORS[idx % COLORS.length]}
                          strokeWidth={2}
                          fillOpacity={0.2}
                          fill={`url(#grad-${idx})`}
                        />
                      ))}
                    </>
                  ) : (
                    <Area
                      type="monotone"
                      dataKey={selectedEquipment}
                      name={selectedEquipment}
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#totalColorGrad)"
                    />
                  )}
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={timeSeriesChartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickMargin={8} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 'bold' }} />

                  {selectedEquipment === 'all' ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey={viewMetric === 'liters' ? 'totalLiters' : 'totalCost'}
                        name="إجمالي الاستهلاك الكلي"
                        stroke="#f59e0b"
                        strokeWidth={3.5}
                        dot={{ r: 4, fill: '#f59e0b' }}
                      />
                      {allEquipmentNames.map((eq, idx) => (
                        <Line
                          key={eq}
                          type="monotone"
                          dataKey={eq}
                          name={eq}
                          stroke={COLORS[idx % COLORS.length]}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      ))}
                    </>
                  ) : (
                    <Line
                      type="monotone"
                      dataKey={selectedEquipment}
                      name={selectedEquipment}
                      stroke="#f59e0b"
                      strokeWidth={3.5}
                      dot={{ r: 5, fill: '#f59e0b' }}
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={timeSeriesChartData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickMargin={8} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: 'bold' }} />

                  {selectedEquipment === 'all' ? (
                    allEquipmentNames.map((eq, idx) => (
                      <Bar
                        key={eq}
                        dataKey={eq}
                        name={eq}
                        fill={COLORS[idx % COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))
                  ) : (
                    <Bar
                      dataKey={selectedEquipment}
                      name={selectedEquipment}
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Fuel className="w-12 h-12 stroke-1 text-slate-500 opacity-40" />
              <p className="text-sm font-bold">لا توجد سجلات استهلاك ديزل تطابق معايير البحث المحددة</p>
            </div>
          )}
        </div>

      </div>

      {/* Dedicated Interactive Equipment Comparison Section (Recharts) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              <span>مقارنة استهلاك الوقود بين المعدات خلال الفترة الحالية</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              رسم بياني تفاعلي يُمكّنك من مقارنة كميات الديزل، التكاليف المالية، وعدد مرات التعبئة مباشرة بين كافة معدات المشروع
            </p>
          </div>

          {/* Comparison Metric Mode Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setComparisonMetric('liters_vs_refuels')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                comparisonMetric === 'liters_vs_refuels'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              الكمية vs مرات التعبئة
            </button>
            <button
              onClick={() => setComparisonMetric('avg_refuel')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                comparisonMetric === 'avg_refuel'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              متوسط التعبئة الواحدة
            </button>
            <button
              onClick={() => setComparisonMetric('cost')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                comparisonMetric === 'cost'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              التكلفة الإجمالية
            </button>
          </div>
        </div>

        {/* Equipment Comparison Recharts Stage */}
        <div className="h-80 w-full dir-ltr pt-2">
          {equipmentComparisonList.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentComparisonList} margin={{ top: 20, right: 25, left: 10, bottom: 30 }}>
                <defs>
                  <linearGradient id="amberBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="blueBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="emeraldBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="purpleBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickMargin={10} 
                  interval={0}
                  tickFormatter={(val) => val.length > 12 ? `${val.slice(0, 10)}..` : val}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                />
                {comparisonMetric === 'liters_vs_refuels' && (
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#3b82f6" 
                    fontSize={11} 
                  />
                )}
                <Tooltip 
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      const itemData = equipmentComparisonList.find(e => e.name === label);
                      return (
                        <div className="bg-slate-950 text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-1.5 dir-rtl text-right">
                          <p className="font-black text-amber-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                            <HardHat className="w-4 h-4 text-amber-400" />
                            <span>المعدة: {label}</span>
                          </p>
                          <div className="flex justify-between items-center gap-4 text-slate-200">
                            <span>إجمالي الوقود:</span>
                            <strong className="text-amber-400 font-mono">{itemData?.totalLiters.toLocaleString()} لتر</strong>
                          </div>
                          <div className="flex justify-between items-center gap-4 text-slate-200">
                            <span>إجمالي التكلفة:</span>
                            <strong className="text-emerald-400 font-mono">{formatCurrency(itemData?.totalCost || 0, projectInfo.currency)}</strong>
                          </div>
                          <div className="flex justify-between items-center gap-4 text-slate-200">
                            <span>عدد مرات التعبئة:</span>
                            <strong className="text-blue-400 font-mono">{itemData?.refuelCount} مرة</strong>
                          </div>
                          <div className="flex justify-between items-center gap-4 text-slate-200">
                            <span>متوسط التعبئة الواحدة:</span>
                            <strong className="text-purple-400 font-mono">{itemData?.avgLitersPerRefuel} لتر / تعبئة</strong>
                          </div>
                          <div className="flex justify-between items-center gap-4 text-slate-300 border-t border-slate-800 pt-1 text-[11px]">
                            <span>نسبة الاستهلاك الإجمالي:</span>
                            <span className="text-amber-300 font-bold">{itemData?.sharePercent}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontWeight: 'bold' }} />

                {comparisonMetric === 'liters_vs_refuels' && (
                  <>
                    <Bar 
                      yAxisId="left" 
                      dataKey="totalLiters" 
                      name="إجمالي الوقود (لتر)" 
                      fill="url(#amberBarGrad)" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={45} 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="refuelCount" 
                      name="عدد مرات التعبئة (مرة)" 
                      fill="url(#blueBarGrad)" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={45} 
                    />
                  </>
                )}

                {comparisonMetric === 'avg_refuel' && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="avgLitersPerRefuel" 
                    name="متوسط كمية التعبئة الواحدة (لتر)" 
                    fill="url(#purpleBarGrad)" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={55} 
                  />
                )}

                {comparisonMetric === 'cost' && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="totalCost" 
                    name={`التكلفة الإجمالية للوقود (${projectInfo.currency || 'ر.ي'})`} 
                    fill="url(#emeraldBarGrad)" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={55} 
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
              لا توجد بيانات مقارنة للعرض
            </div>
          )}
        </div>

        {/* Equipment Comparative Quick Summary Badges */}
        {equipmentComparisonList.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-center gap-3">
              <div className="bg-amber-500 text-slate-950 p-2 rounded-lg font-black">
                #1
              </div>
              <div className="truncate">
                <span className="block text-[11px] text-amber-800 dark:text-amber-400 font-bold">المعدة الأعلى استهلاكاً:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-extrabold text-sm truncate block">
                  {equipmentComparisonList[0]?.name}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  {equipmentComparisonList[0]?.totalLiters.toLocaleString()} لتر ({equipmentComparisonList[0]?.sharePercent}%)
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 flex items-center gap-3">
              <div className="bg-blue-500 text-white p-2 rounded-lg font-black">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="block text-[11px] text-blue-800 dark:text-blue-400 font-bold">الأكثر تكراراً للتعبئة:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-extrabold text-sm truncate block">
                  {[...equipmentComparisonList].sort((a, b) => b.refuelCount - a.refuelCount)[0]?.name}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  {[...equipmentComparisonList].sort((a, b) => b.refuelCount - a.refuelCount)[0]?.refuelCount} عمليات تعبئة
                </span>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-200 dark:border-purple-900/50 flex items-center gap-3">
              <div className="bg-purple-500 text-white p-2 rounded-lg font-black">
                <Droplet className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="block text-[11px] text-purple-800 dark:text-purple-400 font-bold">الأعلى في شحنة التعبئة:</span>
                <strong className="text-slate-900 dark:text-slate-100 font-extrabold text-sm truncate block">
                  {[...equipmentComparisonList].sort((a, b) => b.avgLitersPerRefuel - a.avgLitersPerRefuel)[0]?.name}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">
                  بمتوسط {[...equipmentComparisonList].sort((a, b) => b.avgLitersPerRefuel - a.avgLitersPerRefuel)[0]?.avgLitersPerRefuel} لتر / شحنة
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Charts: Equipment Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Equipment Ranking by Consumption */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span>ترتيب المعدات الأكثر استهلاكاً للوقود</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {viewMetric === 'liters' ? 'باللتر' : projectInfo.currency || 'ر.ي'}
            </span>
          </div>

          <div className="h-64 w-full dir-ltr pt-2">
            {equipmentBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equipmentBreakdownData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name={viewMetric === 'liters' ? 'الكمية (لتر)' : 'التكلفة'} radius={[0, 6, 6, 0]}>
                    {equipmentBreakdownData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                لا توجد بيانات للعرض
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart: Share Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-amber-500" />
              <span>نسب الاستهلاك والتوزيع بين المعدات</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">% المئوية</span>
          </div>

          <div className="h-64 w-full dir-ltr pt-2">
            {equipmentBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name.slice(0, 10)} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {equipmentBreakdownData.map((_, index) => (
                      <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                لا توجد بيانات للعرض
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Detailed Transactions Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-amber-500" />
              <span>جدول تفاصيل حركة الديزل والمعدات</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              بيانات الديزل المصروف تفصيلياً مع تكلفة اللتر وإشارات السائقين
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute rtl:right-3 ltr:left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالمعدة، السائق، الملاحظات..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl rtl:pr-9 ltr:pl-9 py-2 text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-extrabold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">#</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">اسم المعدة</th>
                <th className="p-3.5">الكمية (لتر)</th>
                <th className="p-3.5">سعر اللتر</th>
                <th className="p-3.5">إجمالي التكلفة</th>
                <th className="p-3.5">السائق</th>
                <th className="p-3.5">مصدر السجل</th>
                <th className="p-3.5">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, idx) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {r.date}
                    </td>
                    <td className="p-3.5 font-black text-slate-900 dark:text-slate-100">
                      <span className="bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-md border border-amber-500/20">
                        {r.equipmentName}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                      {r.quantityLiters.toLocaleString()} <span className="text-[10px]">لتر</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-600 dark:text-slate-300">
                      {r.pricePerLiter.toFixed(2)}
                    </td>
                    <td className="p-3.5 font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(r.totalCost, projectInfo.currency)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                      {r.driverName || '—'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-500 text-[11px]">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {r.source}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate" title={r.notes}>
                      {r.notes || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                    لا توجد بيانات استهلاك مطابقة لشروط الفلترة الحالية
                  </td>
                </tr>
              )}
            </tbody>
            {filteredRecords.length > 0 && (
              <tfoot className="bg-slate-900 text-white font-black text-xs">
                <tr>
                  <td colSpan={3} className="p-3.5">المجموع الكلي ({filteredRecords.length} سجل)</td>
                  <td className="p-3.5 font-mono text-amber-400 text-sm">
                    {summaryStats.totalLiters.toLocaleString()} لتر
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">
                    {summaryStats.avgPricePerLiter.toFixed(2)}
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400 text-sm">
                    {formatCurrency(summaryStats.totalCost, projectInfo.currency)}
                  </td>
                  <td colSpan={3} className="p-3.5 text-slate-400 text-[11px]">
                    المتوسط اليومي: {Math.round(summaryStats.avgDailyLiters)} لتر / يوم
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

      </div>

    </div>
  );
};
