import React, { useState } from 'react';
import { 
  WorkReport, 
  DieselTransaction, 
  Equipment, 
  Company, 
  Driver, 
  Project,
  ProjectInfo 
} from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  formatCurrency, 
  formatHoursDigital,
  getContractTypeName 
} from '../utils/exportUtils';
import { 
  signInWithGoogle, 
  exportReportToGoogleDoc, 
  getAccessToken 
} from '../utils/googleDocs';
import { 
  Clock, 
  DollarSign, 
  Fuel, 
  Truck, 
  TrendingUp, 
  Building2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  ChevronLeft,
  FileCheck2,
  HardHat,
  Receipt,
  FolderKanban,
  BarChart3,
  CalendarDays,
  Coins,
  Flame,
  Trophy,
  Gauge,
  PiggyBank,
  Scale,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Wrench,
  FileText,
  ExternalLink,
  Loader2,
  Share2,
  Layers,
  ListPlus,
  Tag,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid,
  Legend,
  ComposedChart,
  Line
} from 'recharts';

import { Loader966Icon } from './Loader966Icon';
import { WeatherWidget } from './WeatherWidget';

interface DashboardProps {
  reports: WorkReport[];
  dieselTransactions: DieselTransaction[];
  equipment: Equipment[];
  companies: Company[];
  drivers: Driver[];
  projectInfo: ProjectInfo;
  allProjects?: Project[];
  allDieselTransactions?: DieselTransaction[];
  allReports?: WorkReport[];
  onNavigateTab: (tab: string) => void;
  onOpenNewReport: () => void;
  onOpenShareApp?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  reports,
  dieselTransactions,
  equipment,
  companies,
  drivers,
  projectInfo,
  allProjects = [],
  allDieselTransactions = [],
  allReports = [],
  onNavigateTab,
  onOpenNewReport,
  onOpenShareApp
}) => {
  const { t } = useLanguage();
  const currencySymbol = projectInfo.currency || 'ر.ي';
  const formatCurr = (amount: number) => formatCurrency(amount, currencySymbol);

  // Key Metrics Calculations
  const totalWorkHours = reports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
  const totalGrossRevenue = reports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);
  const totalAdvances = reports.reduce((acc, r) => acc + (r.driverAdvance || 0), 0);
  const totalNetDue = reports.reduce((acc, r) => acc + (r.netCompanyDue || 0), 0);

  // Diesel Inventory Balance Calculation
  const totalDieselReceived = dieselTransactions
    .filter(t => t.type === 'receive')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);
  const totalDieselConsumed = dieselTransactions
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);
  const currentDieselBalance = totalDieselReceived - totalDieselConsumed;

  // Diesel Inventory Low Threshold State (Default 500 Liters)
  const [dieselAlertThreshold, setDieselAlertThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('eq_diesel_alert_threshold');
    return saved ? parseInt(saved, 10) : 500;
  });
  const [showThresholdSettings, setShowThresholdSettings] = useState<boolean>(false);

  const handleUpdateThreshold = (val: number) => {
    setDieselAlertThreshold(val);
    localStorage.setItem('eq_diesel_alert_threshold', val.toString());
  };

  const isDieselLow = currentDieselBalance <= dieselAlertThreshold;

  // Operational Costs Sums
  const totalDieselCosts = reports.reduce((acc, r) => acc + (r.costs?.dieselTotalCost || 0), 0);
  const totalOilCosts = reports.reduce((acc, r) => acc + (r.costs?.oilCost || 0), 0);
  const totalGreaseCosts = reports.reduce((acc, r) => acc + (r.costs?.greaseCost || 0), 0);
  const totalMaintenanceCosts = reports.reduce((acc, r) => acc + (r.costs?.maintenanceCost || 0) + (r.costs?.sparePartsCost || 0), 0);
  const grandTotalCosts = totalDieselCosts + totalOilCosts + totalGreaseCosts + totalMaintenanceCosts;

  // Pie Chart Data: Operational Cost Breakdown
  const costBreakdownData = [
    { name: 'الديزل', value: totalDieselCosts || 100, color: '#f59e0b' },
    { name: 'الزيوت', value: totalOilCosts || 20, color: '#06b6d4' },
    { name: 'التشحيم', value: totalGreaseCosts || 15, color: '#8b5cf6' },
    { name: 'الصيانة والقطع', value: totalMaintenanceCosts || 30, color: '#ef4444' }
  ];

  // Bar Chart Data: Hours worked per equipment
  const equipmentHoursData = equipment.map(eq => {
    const eqReports = reports.filter(r => r.equipmentName === eq.name);
    const hours = eqReports.reduce((acc, r) => acc + (r.totalNetHours || 0), 0);
    const revenue = eqReports.reduce((acc, r) => acc + (r.grossAmount || 0), 0);
    return {
      name: eq.name.length > 15 ? eq.name.slice(0, 15) + '...' : eq.name,
      fullName: eq.name,
      hours: hours,
      revenue: revenue
    };
  });

  // Calculate Monthly Diesel Consumption & Costs
  const getMonthlyDieselData = () => {
    const monthsMap: Record<string, { monthKey: string; monthLabel: string; liters: number; cost: number }> = {};

    const consumes = dieselTransactions.filter(t => t.type === 'consume');

    consumes.forEach(t => {
      if (!t.date) return;
      const yearMonth = t.date.substring(0, 7); // "YYYY-MM"
      const [year, month] = yearMonth.split('-');
      const monthNames: Record<string, string> = {
        '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
        '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
        '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
      };
      const monthLabel = `${monthNames[month] || month} ${year}`;

      if (!monthsMap[yearMonth]) {
        monthsMap[yearMonth] = {
          monthKey: yearMonth,
          monthLabel,
          liters: 0,
          cost: 0
        };
      }

      const liters = t.quantityLiters || 0;
      const cost = t.totalCost || (liters * (t.pricePerLiter || 2.3));

      monthsMap[yearMonth].liters += liters;
      monthsMap[yearMonth].cost += cost;
    });

    const sorted = Object.values(monthsMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    if (sorted.length === 0) {
      return [{ monthKey: '2026-07', monthLabel: 'يوليو 2026', liters: 0, cost: 0 }];
    }

    return sorted;
  };

  const monthlyDieselData = getMonthlyDieselData();

  // Calculate Daily Diesel Trend (Current Week vs Previous Week)
  const getWeeklyDieselTrendData = () => {
    // We'll consider "Current Week" as the last 7 days including today.
    // And "Previous Week" as the 7 days before that.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatDay = (date: Date) => {
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      return days[date.getDay()];
    };

    const result = [];
    const txSource = allDieselTransactions.length > 0 ? allDieselTransactions : dieselTransactions;

    // Loop from 6 days ago up to today
    for (let i = 6; i >= 0; i--) {
      const currentDayDate = new Date(today);
      currentDayDate.setDate(today.getDate() - i);
      const currentDayDateString = currentDayDate.toISOString().split('T')[0];

      const previousDayDate = new Date(today);
      previousDayDate.setDate(today.getDate() - i - 7);
      const previousDayDateString = previousDayDate.toISOString().split('T')[0];

      // Get consumption for current day
      const currentDayConsumes = txSource.filter(t => 
        t.type === 'consume' && t.date.startsWith(currentDayDateString)
      );
      const currentDayLiters = currentDayConsumes.reduce((acc, t) => acc + (t.quantityLiters || 0), 0);

      // Get consumption for previous week day
      const previousDayConsumes = txSource.filter(t => 
        t.type === 'consume' && t.date.startsWith(previousDayDateString)
      );
      const previousDayLiters = previousDayConsumes.reduce((acc, t) => acc + (t.quantityLiters || 0), 0);

      result.push({
        dayLabel: formatDay(currentDayDate),
        dateStr: currentDayDateString,
        currentWeek: currentDayLiters,
        lastWeek: previousDayLiters,
      });
    }

    return result;
  };

  const weeklyDieselTrendData = getWeeklyDieselTrendData();

  // Calculate Per-Project Diesel Consumption & Costs Comparison
  const getProjectsDieselComparisonData = () => {
    if (!allProjects || allProjects.length === 0) return [];

    const txSource = allDieselTransactions.length > 0 ? allDieselTransactions : dieselTransactions;

    return allProjects.map(proj => {
      const projConsumes = txSource.filter(t => 
        t.type === 'consume' && 
        (t.projectId === proj.id || (!t.projectId && proj.id === 'proj-1'))
      );

      const totalLiters = projConsumes.reduce((acc, t) => acc + (t.quantityLiters || 0), 0);
      const totalCost = projConsumes.reduce((acc, t) => acc + (t.totalCost || ((t.quantityLiters || 0) * (t.pricePerLiter || 2.3))), 0);

      return {
        projectId: proj.id,
        projectName: proj.name,
        shortName: proj.name.length > 16 ? proj.name.slice(0, 14) + '...' : proj.name,
        companyName: proj.companyName,
        liters: totalLiters,
        cost: totalCost,
        avgPricePerLiter: totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : '2.30'
      };
    });
  };

  const projectsDieselComparisonData = getProjectsDieselComparisonData();

  // Aggregate stats across all projects for overview
  const grandTotalAllProjectsDieselLiters = projectsDieselComparisonData.reduce((acc, p) => acc + p.liters, 0);
  const grandTotalAllProjectsDieselCost = projectsDieselComparisonData.reduce((acc, p) => acc + p.cost, 0);

  // Calculate Per-Equipment Diesel Consumption Breakdown
  const currentMonthKey = new Date().toISOString().substring(0, 7); // e.g., "2026-07"

  const equipmentDieselStatsMap = equipment.map(eq => {
    const eqConsumes = dieselTransactions.filter(t => 
      t.type === 'consume' && 
      (t.equipmentName === eq.name || (t.equipmentName && eq.name && (t.equipmentName.includes(eq.name) || eq.name.includes(t.equipmentName))))
    );

    const totalLiters = eqConsumes.reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
    const totalCost = eqConsumes.reduce((sum, t) => sum + (t.totalCost || ((t.quantityLiters || 0) * (t.pricePerLiter || 2.3))), 0);

    const currentMonthConsumes = eqConsumes.filter(t => t.date && t.date.startsWith(currentMonthKey));
    const currentMonthLiters = currentMonthConsumes.reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
    const currentMonthCost = currentMonthConsumes.reduce((sum, t) => sum + (t.totalCost || ((t.quantityLiters || 0) * (t.pricePerLiter || 2.3))), 0);

    return {
      id: eq.id,
      name: eq.name,
      type: eq.type,
      plateNumber: eq.plateNumber,
      totalLiters,
      totalCost,
      currentMonthLiters,
      currentMonthCost,
      fillCount: eqConsumes.length
    };
  });

  // Catch any transactions logged under names not present in equipment array
  const knownEqNames = new Set(equipment.map(e => e.name));
  dieselTransactions.filter(t => t.type === 'consume' && t.equipmentName && !knownEqNames.has(t.equipmentName)).forEach(t => {
    const existing = equipmentDieselStatsMap.find(s => s.name === t.equipmentName);
    if (!existing) {
      const liters = t.quantityLiters || 0;
      const cost = t.totalCost || (liters * (t.pricePerLiter || 2.3));
      const isCurrMonth = t.date && t.date.startsWith(currentMonthKey);
      equipmentDieselStatsMap.push({
        id: `custom-${t.equipmentName}`,
        name: t.equipmentName,
        type: 'معدة',
        plateNumber: '---',
        totalLiters: liters,
        totalCost: cost,
        currentMonthLiters: isCurrMonth ? liters : 0,
        currentMonthCost: isCurrMonth ? cost : 0,
        fillCount: 1
      });
    }
  });

  // Sort by current month liters descending (or total liters if 0)
  const sortedEquipmentByDiesel = [...equipmentDieselStatsMap].sort((a, b) => {
    if (b.currentMonthLiters !== a.currentMonthLiters) {
      return b.currentMonthLiters - a.currentMonthLiters;
    }
    return b.totalLiters - a.totalLiters;
  });

  // Highest consuming equipment in current month
  const topCurrentMonthEquipment = sortedEquipmentByDiesel.length > 0 && (sortedEquipmentByDiesel[0].currentMonthLiters > 0 || sortedEquipmentByDiesel[0].totalLiters > 0)
    ? sortedEquipmentByDiesel[0] 
    : null;

  const totalCurrentMonthProjectDieselLiters = equipmentDieselStatsMap.reduce((acc, eq) => acc + eq.currentMonthLiters, 0);

  // Budget vs Actual Operating Costs Calculations for Current Active Project
  const projectBudget = projectInfo.budget || 250000;
  
  // Actual operating expenses components
  const equipmentWorkCost = totalGrossRevenue; // إجمالي قيمة تشغيل وإيجار المعدات
  const fuelCost = totalDieselCosts; // إجمالي تكلفة الديزل
  const maintenanceAndLubesCost = totalOilCosts + totalGreaseCosts + totalMaintenanceCosts; // الصيانة والقطع والزيوت
  const totalActualOperatingCosts = equipmentWorkCost + fuelCost + maintenanceAndLubesCost;

  const remainingBudget = projectBudget - totalActualOperatingCosts;
  const rawBudgetPercentage = projectBudget > 0 ? Math.round((totalActualOperatingCosts / projectBudget) * 100) : 0;

  // Category percentages relative to project budget
  const equipmentWorkPct = projectBudget > 0 ? Math.round((equipmentWorkCost / projectBudget) * 100) : 0;
  const fuelPct = projectBudget > 0 ? Math.round((fuelCost / projectBudget) * 100) : 0;
  const maintenancePct = projectBudget > 0 ? Math.round((maintenanceAndLubesCost / projectBudget) * 100) : 0;
  const remainingPct = projectBudget > 0 && remainingBudget > 0 ? Math.round((remainingBudget / projectBudget) * 100) : 0;

  // Comparison data for all projects (Budget vs Actual)
  const allProjectsBudgetComparison = (allProjects.length > 0 ? allProjects : [{
    id: 'proj-1',
    name: projectInfo.name,
    budget: projectBudget,
    companyName: projectInfo.companyName,
    location: projectInfo.location,
    managerName: projectInfo.managerName,
    phone: projectInfo.phone
  }]).map(proj => {
    const projReports = allReports.filter(r => r.projectId === proj.id || (!r.projectId && proj.id === 'proj-1'));
    const projDiesel = allDieselTransactions.filter(t => t.type === 'consume' && (t.projectId === proj.id || (!t.projectId && proj.id === 'proj-1')));

    const projWorkCost = projReports.reduce((sum, r) => sum + (r.grossAmount || 0), 0);
    const projDieselCost = projDiesel.reduce((sum, t) => sum + (t.totalCost || ((t.quantityLiters || 0) * (t.pricePerLiter || 2.3))), 0);
    const projMaintCost = projReports.reduce((sum, r) => sum + (r.costs?.oilCost || 0) + (r.costs?.greaseCost || 0) + (r.costs?.maintenanceCost || 0) + (r.costs?.sparePartsCost || 0), 0);
    const projActualTotal = projWorkCost + projDieselCost + projMaintCost;

    const projBud = proj.budget || 250000;
    const projRem = projBud - projActualTotal;
    const projPct = projBud > 0 ? Math.round((projActualTotal / projBud) * 100) : 0;

    return {
      id: proj.id,
      name: proj.name,
      shortName: proj.name.length > 18 ? proj.name.substring(0, 16) + '...' : proj.name,
      budget: projBud,
      actualSpent: projActualTotal,
      remaining: projRem,
      consumptionPct: projPct
    };
  });

  // Calculate Costs and Operational Metrics Per Project Item (البنود)
  const currentProjectItems = projectInfo.projectItems || [];
  const projectItemsCostData = currentProjectItems.map(item => {
    // Reports linked to this project item
    const itemReports = reports.filter(r => r.workItem === item.name);
    
    const workHours = itemReports.reduce((sum, r) => sum + (r.totalNetHours || 0), 0);
    const grossRevenue = itemReports.reduce((sum, r) => sum + (r.grossAmount || 0), 0);
    
    const dieselLiters = itemReports.reduce((sum, r) => sum + (r.costs?.dieselLiters || 0), 0);
    const dieselCost = itemReports.reduce((sum, r) => sum + ((r.costs?.dieselLiters || 0) * (r.costs?.dieselCostPerLiter || projectInfo.defaultDieselPrice || 2.3)), 0);
    
    const maintenanceCost = itemReports.reduce((sum, r) => sum + 
      (r.costs?.oilCost || 0) + 
      (r.costs?.hydraulicOilCost || 0) + 
      (r.costs?.engineOilCost || 0) + 
      (r.costs?.greaseCost || 0) + 
      (r.costs?.sparePartsCost || 0) + 
      (r.costs?.maintenanceCost || 0), 0
    );
    
    const totalDirectCost = dieselCost + maintenanceCost;
    const netMargin = grossRevenue - totalDirectCost;
    const estimatedBudget = item.estimatedBudget || 0;
    const budgetPct = estimatedBudget > 0 ? Math.round((totalDirectCost / estimatedBudget) * 100) : 0;

    // Completed Quantity Accumulation & Unit Cost Metric
    const totalCompletedQuantity = itemReports.reduce((sum, r) => {
      if (r.completedQuantity && r.completedQuantity > 0) return sum + r.completedQuantity;
      if (r.contractType === 'meter' && r.quantityMeters > 0) return sum + r.quantityMeters;
      return sum;
    }, 0);

    const unitCost = totalCompletedQuantity > 0 ? (totalDirectCost / totalCompletedQuantity) : 0;
    const targetQuantity = item.targetQuantity || 0;
    const quantityPct = targetQuantity > 0 ? Math.min(100, Math.round((totalCompletedQuantity / targetQuantity) * 100)) : 0;

    return {
      id: item.id,
      name: item.name,
      code: item.code || '---',
      unit: item.unit || 'م3',
      estimatedBudget,
      targetQuantity,
      totalCompletedQuantity,
      quantityPct,
      unitCost,
      reportsCount: itemReports.length,
      workHours,
      grossRevenue,
      dieselLiters,
      dieselCost,
      maintenanceCost,
      totalDirectCost,
      netMargin,
      budgetPct
    };
  });

  // Aggregate totals across all project items
  const totalItemsEstimatedBudget = projectItemsCostData.reduce((acc, i) => acc + i.estimatedBudget, 0);
  const totalItemsDirectCost = projectItemsCostData.reduce((acc, i) => acc + i.totalDirectCost, 0);
  const totalItemsRevenue = projectItemsCostData.reduce((acc, i) => acc + i.grossRevenue, 0);

  // Calculate Daily vs Weekly Average Diesel Consumption Statistics
  const getDailyAndWeeklyDieselStats = () => {
    const todayStr = new Date().toISOString().substring(0, 10); // "YYYY-MM-DD"
    
    // Generate last 7 days YYYY-MM-DD strings
    const last7DaysDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7DaysDates.push(d.toISOString().substring(0, 10));
    }

    const consumeTransactions = dieselTransactions.filter(t => t.type === 'consume');

    // 1. Today's consumption
    const todayLiters = consumeTransactions
      .filter(t => t.date && t.date.substring(0, 10) === todayStr)
      .reduce((sum, t) => sum + (t.quantityLiters || 0), 0);

    // 2. Last 7 days consumption
    const weeklyLiters = consumeTransactions
      .filter(t => t.date && last7DaysDates.includes(t.date.substring(0, 10)))
      .reduce((sum, t) => sum + (t.quantityLiters || 0), 0);

    // 3. Weekly daily average (total liters in last 7 days / 7)
    const weeklyDailyAvg = Math.round(weeklyLiters / 7);

    // 4. Fallback overall daily average if no recorded transactions in last 7 days
    const uniqueDates = Array.from(
      new Set(consumeTransactions.map(t => t.date ? t.date.substring(0, 10) : ''))
    ).filter(Boolean);
    const totalAllLiters = consumeTransactions.reduce((sum, t) => sum + (t.quantityLiters || 0), 0);
    const overallDailyAvg = uniqueDates.length > 0 ? Math.round(totalAllLiters / uniqueDates.length) : 0;

    const effectiveAvg = weeklyDailyAvg > 0 ? weeklyDailyAvg : overallDailyAvg;

    // Percentage diff between today's consumption and average daily consumption
    let diffPercent = 0;
    let isHigher = false;
    let isLower = false;

    if (effectiveAvg > 0) {
      diffPercent = Math.round(((todayLiters - effectiveAvg) / effectiveAvg) * 100);
      if (diffPercent > 0) isHigher = true;
      if (diffPercent < 0) isLower = true;
    }

    return {
      todayLiters,
      weeklyLiters,
      weeklyDailyAvg,
      effectiveAvg,
      diffPercent,
      isHigher,
      isLower
    };
  };

  const dailyWeeklyStats = getDailyAndWeeklyDieselStats();

  // Periodic Maintenance Alerts Calculation
  const todayDateStr = new Date().toISOString().slice(0, 10);

  const maintenanceAlertsList = equipment.map(eq => {
    const eqReports = reports.filter(r => r.equipmentName === eq.name);
    const totalHours = eqReports.reduce((sum, r) => sum + (r.totalNetHours || 0), 0);

    const hasTargetHours = eq.maintenanceTargetHours !== undefined && eq.maintenanceTargetHours > 0;
    const isHoursDue = hasTargetHours && totalHours >= eq.maintenanceTargetHours!;
    const isHoursSoon = hasTargetHours && !isHoursDue && (eq.maintenanceTargetHours! - totalHours <= 20);

    let isDateDue = false;
    let isDateSoon = false;
    let daysDiff = 999;
    if (eq.maintenanceDueDate) {
      daysDiff = Math.ceil((new Date(eq.maintenanceDueDate).getTime() - new Date(todayDateStr).getTime()) / (1000 * 3600 * 24));
      if (daysDiff <= 0) isDateDue = true;
      else if (daysDiff <= 7) isDateSoon = true;
    }

    const isUrgent = isHoursDue || isDateDue || eq.status === 'maintenance';
    const isApproaching = !isUrgent && (isHoursSoon || isDateSoon);

    return {
      equipment: eq,
      totalHours,
      isUrgent,
      isApproaching,
      isHoursDue,
      isDateDue,
      daysDiff,
      reason: isHoursDue 
        ? `تجاوزت ساعات التشغيل المستهدفة (${totalHours} س / ${eq.maintenanceTargetHours} س)`
        : isDateDue 
        ? `حل موعد الصيانة المجدول (${eq.maintenanceDueDate})`
        : isHoursSoon 
        ? `متبقي ${eq.maintenanceTargetHours! - totalHours} ساعة عمل فقط على الصيانة`
        : isDateSoon 
        ? `متبقي ${daysDiff} أيام على موعد الصيانة المجدول (${eq.maintenanceDueDate})`
        : 'صيانة دورية'
    };
  }).filter(item => item.isUrgent || item.isApproaching);

  const urgentMaintenanceCount = maintenanceAlertsList.filter(item => item.isUrgent).length;
  const approachingMaintenanceCount = maintenanceAlertsList.filter(item => item.isApproaching).length;

  // Google Docs Dashboard Export States
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [createdDocUrl, setCreatedDocUrl] = useState<string | null>(null);

  const handleExportDashboardToGoogleDoc = async () => {
    try {
      setIsExportingDoc(true);
      let token = await getAccessToken();
      if (!token) {
        const authRes = await signInWithGoogle();
        token = authRes?.accessToken || null;
      }

      if (!token) {
        alert('يرجى تسجيل الدخول بحساب جوجل لإتمام التصدير');
        return;
      }

      let docText = `التقرير الشامل والملخص التنفيذي - ${projectInfo.name}\n`;
      docText += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}\n`;
      docText += `الموقع: ${projectInfo.location || 'غير محدد'} | مدير المشروع: ${projectInfo.managerName || 'غير محدد'}\n`;
      docText += `--------------------------------------------------\n\n`;

      docText += `1. المؤشرات المالية والميزانية:\n`;
      docText += ` - الميزانية المرصودة للمشروع: ${formatCurr(projectBudget)}\n`;
      docText += ` - التكاليف التشغيلية الفعلية: ${formatCurr(totalActualOperatingCosts)}\n`;
      docText += ` - المتبقي من الميزانية: ${formatCurr(remainingBudget)}\n`;
      docText += ` - نسبة استهلاك الميزانية: ${rawBudgetPercentage}%\n\n`;

      docText += `2. ملخص التشغيل والساعات:\n`;
      docText += ` - إجمالي تقارير العمل المسجلة: ${reports.length} تقرير\n`;
      docText += ` - إجمالي ساعات عمل المعدات: ${formatHoursDigital(totalWorkHours)}\n`;
      docText += ` - إجمالي مستحقات الشركات: ${formatCurr(totalGrossRevenue)}\n`;
      docText += ` - إجمالي سُلف السائقين: ${formatCurr(totalAdvances)}\n`;
      docText += ` - الصافي المتبقي للشركات: ${formatCurr(totalNetDue)}\n\n`;

      docText += `3. حالة مخزن الديزل والوقود:\n`;
      docText += ` - رصيد الديزل الحالي بالخزان: ${currentDieselBalance.toLocaleString('ar-EG')} لتر\n`;
      docText += ` - إجمالي المورد للمخزن: ${totalDieselReceived.toLocaleString('ar-EG')} لتر\n`;
      docText += ` - إجمالي المنصرف للمعدات: ${totalDieselConsumed.toLocaleString('ar-EG')} لتر\n\n`;

      docText += `4. حالة المعدات والصيانة الدورية:\n`;
      docText += ` - إجمالي المعدات: ${equipment.length} معدة\n`;
      docText += ` - المعدات المستحقة للصيانة فوراً: ${urgentMaintenanceCount} معدة\n`;
      docText += ` - المعدات القريبة من الصيانة: ${approachingMaintenanceCount} معدة\n\n`;

      if (maintenanceAlertsList.length > 0) {
        docText += `تفاصيل المعدات المحتاجة للصيانة:\n`;
        maintenanceAlertsList.forEach((item, i) => {
          docText += ` ${i + 1}. ${item.equipment.name} (${item.equipment.type}): ${item.reason}\n`;
        });
        docText += `\n`;
      }

      docText += `تم استخراج هذا التقرير تلقائياً عبر نظام إدارة المعدات ومشاريع المقاولات.`;

      const docTitle = `التقرير التنفيذي الشامل - ${projectInfo.name} - ${new Date().toISOString().slice(0, 10)}`;
      const result = await exportReportToGoogleDoc(docTitle, docText, token);
      setCreatedDocUrl(result.documentUrl);
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء التصدير لمستندات جوجل: ' + (err.message || err));
    } finally {
      setIsExportingDoc(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome & Overview Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 text-amber-400 shadow-inner">
              <Loader966Icon className="w-10 h-10 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>{projectInfo.location || 'نظام إدارة المشاريع'}</span>
                {projectInfo.code && (
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 font-mono text-[11px]">
                    {projectInfo.code}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>{t('dashboard.title', 'لوحة التحكم التشغيلية والمعدات')}</span>
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                متابعة دقيقة لساعات تشغيل المعدات، التكاليف التشغيلية، حركة مخزن الديزل، والسُلف المباشرة لجميع العقود
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenShareApp && (
              <button
                onClick={onOpenShareApp}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                title="مشاركة التطبيق بالكامل بكل بياناته وقاعدة بياناته المدمجة"
              >
                <Share2 className="w-4.5 h-4.5 text-slate-950" />
                <span>مشاركة التطبيق بالبيانات</span>
              </button>
            )}

            <button
              onClick={handleExportDashboardToGoogleDoc}
              disabled={isExportingDoc}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
              title="تصدير تقرير ملخص شامل للوحة التحكم إلى مستندات جوجل"
            >
              {isExportingDoc ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>{isExportingDoc ? 'جاري التصدير...' : 'تصدير لـ Google Docs'}</span>
            </button>

            <button
              onClick={onOpenNewReport}
              className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-5 py-3 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>تسجيل يوم عمل جديد</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports-list')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
            >
              <span>عرض السجلات</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weather Dashboard Widget with Google Search Grounding */}
      <WeatherWidget 
        projectLocation={projectInfo.location || 'الرياض'} 
        projectName={projectInfo.name} 
      />

      {/* Prominent Low Diesel Inventory Visual Alert Banner */}
      {isDieselLow && (
        <div className="rounded-2xl border border-rose-500/80 bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 text-white p-5 shadow-xl relative overflow-hidden space-y-3 animate-fade-in ring-1 ring-rose-500/40">
          <div className="absolute top-0 left-0 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3.5">
              <div className="p-3.5 rounded-2xl bg-rose-600 text-white shadow-lg animate-pulse flex-shrink-0 border border-rose-400">
                <Fuel className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <AlertTriangle className="w-3 h-3 text-amber-300" />
                    <span>تنبيه عاجل: انخفاض مخزون الديزل</span>
                  </span>
                  <span className="bg-rose-950/90 text-rose-200 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border border-rose-700">
                    الرصيد الحالي: {currentDieselBalance.toLocaleString('ar-SA')} لتر
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  رصيد الديزل بالخزان انخفض عن حد الأمان الأدنى ({dieselAlertThreshold.toLocaleString('ar-SA')} لتر)!
                </h3>
                <p className="text-xs text-rose-100 max-w-3xl leading-relaxed">
                  الرصيد المتبقي المتاح حالياً هو <strong className="text-amber-300 font-extrabold">{currentDieselBalance.toLocaleString('ar-SA')} لتر</strong> فقط. يُرجى تسجيل توريد شحنة ديزل جديدة فوراً لتجنب توقف عمل الشيول والحفارات والمعدات الثقيلة بموقع المشروع.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                onClick={() => onNavigateTab('diesel')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Fuel className="w-4 h-4 text-slate-950" />
                <span>تسجيل توريد شحنة ديزل 🚛</span>
              </button>

              <button
                onClick={() => setShowThresholdSettings(!showThresholdSettings)}
                className="bg-slate-800/90 hover:bg-slate-700 text-rose-200 border border-rose-700/70 font-bold px-3 py-2.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="تعديل حد التنبيه"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>حد التنبيه ({dieselAlertThreshold} لتر)</span>
              </button>
            </div>
          </div>

          {/* Quick Threshold Adjuster Controls */}
          {showThresholdSettings && (
            <div className="mt-3 pt-3 border-t border-rose-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200 relative z-10 bg-rose-950/70 p-3 rounded-xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-amber-300">حد تنبيه انخفاض الديزل:</span>
                <div className="flex items-center gap-1.5">
                  {[300, 500, 800, 1000, 1500].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => handleUpdateThreshold(limit)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        dieselAlertThreshold === limit
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700'
                      }`}
                    >
                      {limit} لتر
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-300">حد مخصص:</span>
                <input
                  type="number"
                  value={dieselAlertThreshold}
                  onChange={(e) => handleUpdateThreshold(Number(e.target.value) || 0)}
                  className="w-20 bg-slate-900 border border-rose-700 text-amber-300 font-bold px-2 py-1 rounded-lg text-xs text-center focus:outline-none"
                />
                <span className="text-xs">لتر</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Equipment Maintenance Alerts Banner / Widget */}
      {maintenanceAlertsList.length > 0 && (
        <div className={`rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
          urgentMaintenanceCount > 0 
            ? 'bg-rose-50/80 border-rose-300 text-rose-950' 
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/60 pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                urgentMaintenanceCount > 0 ? 'bg-rose-600 text-white animate-bounce' : 'bg-amber-500 text-slate-950'
              }`}>
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    تنبيهات جدول الصيانة الدورية للمعدات
                  </h3>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    urgentMaintenanceCount > 0 ? 'bg-rose-600 text-white' : 'bg-amber-200 text-amber-900'
                  }`}>
                    {urgentMaintenanceCount > 0 ? `${urgentMaintenanceCount} صيانة عاجلة` : `${approachingMaintenanceCount} اقتراب موعد`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  تم اكتشاف معدات تجاوزت ساعات التشغيل المحددة أو اقترب موعد صينتها المجدول
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('equipment-manager')}
              className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm"
            >
              <span>إدارة المعدات والجداول</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {maintenanceAlertsList.map(({ equipment: eq, totalHours, isUrgent, reason }) => (
              <div 
                key={eq.id} 
                className={`p-3.5 rounded-xl border bg-white shadow-2xs space-y-2 relative ${
                  isUrgent ? 'border-rose-300 ring-1 ring-rose-200' : 'border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{eq.name}</h4>
                    <span className="text-[11px] font-bold text-slate-500">{eq.type} | {eq.regNumber}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isUrgent ? 'مستحقة فوراً' : 'قريبة جداً'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between items-center text-slate-700 font-bold">
                    <span>سبب التنبيه:</span>
                    <span className="text-amber-800 font-mono font-extrabold">{reason}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>إجمالي الساعات المسجلة:</span>
                    <strong className="text-slate-900">{totalHours} ساعة</strong>
                  </div>
                  {eq.maintenanceNotes && (
                    <div className="text-[10px] text-slate-600 italic border-t pt-1 border-slate-200/60">
                      ملاحظة: {eq.maintenanceNotes}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigateTab('equipment-manager')}
                  className="w-full text-center py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 rounded-lg text-xs transition-colors cursor-pointer"
                >
                  الانتقال لتحديث الصيانة ⬅️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        
        {/* Total Hours Worked */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي ساعات العمل</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatHoursDigital(totalWorkHours)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>من واقع {reports.length} تقرير عمل</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> نشط
            </span>
          </div>
        </div>

        {/* Total Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي قيمة العمل</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
            {formatCurr(totalGrossRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>مجموع الاستحقاق العام</span>
            <span className="text-slate-700 font-bold">{companies.length} شركات</span>
          </div>
        </div>

        {/* Driver Advances & Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">السُلف اليومية للسائقين</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600 tracking-tight">
            {formatCurr(totalAdvances)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>تُقيد مباشرة على الشركة</span>
            <span className="text-slate-600 font-semibold">صافي: {formatCurr(totalNetDue)}</span>
          </div>
        </div>

        {/* Daily Diesel Consumption vs Weekly Avg Card */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>استهلاك الديزل اليومي</span>
            </span>
            <div className={`p-2.5 rounded-xl ${
              dailyWeeklyStats.isHigher 
                ? 'bg-amber-50 text-amber-600' 
                : dailyWeeklyStats.isLower 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-blue-50 text-blue-600'
            }`}>
              <Gauge className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-1">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {dailyWeeklyStats.todayLiters.toLocaleString('ar-SA')}{' '}
                <span className="text-xs font-semibold text-slate-500">لتر اليوم</span>
              </div>

              {dailyWeeklyStats.effectiveAvg > 0 && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full ${
                  dailyWeeklyStats.isHigher
                    ? 'bg-amber-100 text-amber-800'
                    : dailyWeeklyStats.isLower
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                }`}>
                  {dailyWeeklyStats.isHigher ? (
                    <>
                      <ArrowUpRight className="w-3 h-3 text-amber-600" />
                      +{dailyWeeklyStats.diffPercent}%
                    </>
                  ) : dailyWeeklyStats.isLower ? (
                    <>
                      <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                      {dailyWeeklyStats.diffPercent}%
                    </>
                  ) : (
                    'مطابق'
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="font-medium text-slate-500">المتوسط الأسبوعي:</span>
            <span className="font-extrabold text-slate-800">
              {dailyWeeklyStats.effectiveAvg.toLocaleString('ar-SA')} <span className="text-[10px] text-slate-500 font-normal">لتر/يوم</span>
            </span>
          </div>
        </div>

        {/* Diesel Inventory Balance */}
        <div className={`p-5 rounded-2xl border shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
          isDieselLow 
            ? 'bg-gradient-to-b from-rose-50 to-rose-100/90 border-rose-400 ring-2 ring-rose-300/80 text-rose-950' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">رصيد مخزن الديزل</span>
              {isDieselLow && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-300" />
                  <span>انخفاض حاد!</span>
                </span>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${
              isDieselLow ? 'bg-rose-600 text-white animate-bounce shadow-md' : 'bg-amber-50 text-amber-600'
            }`}>
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight flex items-baseline justify-between">
              <span className={isDieselLow ? 'text-rose-900 font-black' : 'text-slate-900'}>
                {currentDieselBalance.toLocaleString('ar-SA')} <span className="text-xs font-semibold text-slate-500">لتر</span>
              </span>
            </div>
            {isDieselLow && (
              <div className="mt-1 text-[11px] font-bold text-rose-700 bg-rose-200/80 px-2.5 py-1 rounded-lg flex items-center justify-between border border-rose-300">
                <span>أقل من حد الأمان:</span>
                <span className="font-mono">{dieselAlertThreshold.toLocaleString('ar-SA')} لتر</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/80">
            <span>وارد: {totalDieselReceived.toLocaleString('ar-SA')} لتر</span>
            <span>صادر: {totalDieselConsumed.toLocaleString('ar-SA')} لتر</span>
          </div>
          {isDieselLow && (
            <button
              onClick={() => onNavigateTab('diesel')}
              className="w-full mt-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>تسجيل توريد ديزل 🚛</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Budget vs Actual Operational Costs Comparison Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/60 shadow-2xs">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  مقارنة الميزانية المرصودة مع التكاليف التشغيلية الفعلية
                </h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                  ميزانية المردود
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة دقيقة للميزانية المعتمدة في إعدادات المشروع مقابل إجمالي التكاليف والمصاريف المباشرة حتى الآن
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigateTab('reports-list')}
              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>إعدادات المشروع</span>
            </button>
          </div>
        </div>

        {/* Top 4 Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Allocated Budget */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">الميزانية المرصودة للمشروع</span>
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-900">
              {formatCurr(projectBudget)}
            </div>
            <p className="text-[10px] text-amber-700 font-semibold">
              المبلغ المعتمد في إعدادات المشروع
            </p>
          </div>

          {/* Card 2: Actual Operating Costs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">التكاليف التشغيلية الفعلية</span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-black text-slate-900">
              {formatCurr(totalActualOperatingCosts)}
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">
              إجمالي عمل المعدات والوقود والصيانة
            </p>
          </div>

          {/* Card 3: Remaining Budget */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            remainingBudget >= 0 
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${remainingBudget >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                {remainingBudget >= 0 ? 'المتبقي من الميزانية' : 'عجز / تجاوز الميزانية'}
              </span>
              <PiggyBank className={`w-4 h-4 ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
            <div className={`text-xl font-black ${remainingBudget >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
              {formatCurr(Math.abs(remainingBudget))} {remainingBudget < 0 && <span className="text-xs text-rose-700">(تجاوز)</span>}
            </div>
            <p className={`text-[10px] font-semibold ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {remainingBudget >= 0 ? 'رصيد متاح لتغطية باقي التكاليف' : 'تم استهلاك أكثر من الميزانية المرصودة'}
            </p>
          </div>

          {/* Card 4: Budget Consumption Percentage & Status */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">نسبة استهلاك الميزانية</span>
              {rawBudgetPercentage <= 75 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : rawBudgetPercentage <= 90 ? (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">{rawBudgetPercentage}%</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                rawBudgetPercentage <= 75 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : rawBudgetPercentage <= 90 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                {rawBudgetPercentage <= 75 ? 'ضمن الحدود الآمنة' : rawBudgetPercentage <= 90 ? 'اقتراب من الحد' : 'تجاوز الميزانية!'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  rawBudgetPercentage <= 75 ? 'bg-emerald-400' : rawBudgetPercentage <= 90 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, rawBudgetPercentage)}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* Segmented Budget Utilization Visual Progress Bar & Categories */}
        <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">توزيع استهلاك الميزانية حسب فئات التكلفة</h4>
              <p className="text-xs text-slate-500">تفاصيل المبالغ الموزعة بين عمل المعدات والوقود والصيانة مقابل الميزانية الكلية</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              الميزانية: {formatCurr(projectBudget)}
            </span>
          </div>

          {/* Multi-segment Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-200 h-4 rounded-xl overflow-hidden flex shadow-inner p-0.5">
              <div 
                className="bg-indigo-600 h-full rounded-l transition-all duration-500 relative group cursor-pointer" 
                style={{ width: `${Math.min(100, equipmentWorkPct)}%` }}
                title={`عمل المعدات: ${equipmentWorkPct}%`}
              ></div>
              <div 
                className="bg-amber-500 h-full transition-all duration-500 relative group cursor-pointer" 
                style={{ width: `${Math.min(100 - equipmentWorkPct, fuelPct)}%` }}
                title={`الديزل: ${fuelPct}%`}
              ></div>
              <div 
                className="bg-rose-500 h-full transition-all duration-500 relative group cursor-pointer" 
                style={{ width: `${Math.min(100 - equipmentWorkPct - fuelPct, maintenancePct)}%` }}
                title={`الصيانة والقطع: ${maintenancePct}%`}
              ></div>
              {remainingBudget > 0 && (
                <div 
                  className="bg-emerald-500/30 h-full rounded-r transition-all duration-500 relative group cursor-pointer border-r border-emerald-400/40" 
                  style={{ width: `${Math.min(100, remainingPct)}%` }}
                  title={`المتبقي الشاغر: ${remainingPct}%`}
                ></div>
              )}
            </div>
          </div>

          {/* Cost Categories Legend Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600 flex-shrink-0"></span>
                <span className="font-bold text-slate-700">عمل المعدات</span>
              </div>
              <span className="font-extrabold text-indigo-700">{formatCurr(equipmentWorkCost)} ({equipmentWorkPct}%)</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0"></span>
                <span className="font-bold text-slate-700">وقود الديزل</span>
              </div>
              <span className="font-extrabold text-amber-700">{formatCurr(fuelCost)} ({fuelPct}%)</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0"></span>
                <span className="font-bold text-slate-700">الصيانة والقطع</span>
              </div>
              <span className="font-extrabold text-rose-700">{formatCurr(maintenanceAndLubesCost)} ({maintenancePct}%)</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
                <span className="font-bold text-slate-700">المتبقي الشاغر</span>
              </div>
              <span className={`font-extrabold ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurr(Math.max(0, remainingBudget))} ({Math.max(0, remainingPct)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Project Budget Comparison Bar Chart */}
        {allProjectsBudgetComparison.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">مقارنة الميزانيات والتكاليف الفعلية بكافة المشاريع</h4>
              <span className="text-[11px] text-slate-500 font-semibold">مقارنة شاملة لأسطول المشاريع</span>
            </div>

            <div className="h-64 w-full bg-slate-50/50 p-3 rounded-xl border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allProjectsBudgetComparison} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="shortName" tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000} ألف`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurr(value), 
                      name === 'budget' ? 'الميزانية المرصودة' : 'التكاليف الفعلية'
                    ]}
                    labelFormatter={(label, items) => {
                      const item = items[0]?.payload;
                      return item ? `${item.name}` : label;
                    }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend formatter={(val) => <span className="text-xs font-bold text-slate-700">{val === 'budget' ? 'الميزانية المرصودة' : 'التكاليف التشغيلية الفعلية'}</span>} />
                  <Bar dataKey="budget" name="budget" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={28} />
                  <Bar dataKey="actualSpent" name="actualSpent" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Detailed Cost Measurement & Profitability Analysis per Project Item (بنود العمل بالمشروع) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>تحليل وقياس تكاليف بنود المشروع</span>
                  <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold">
                    {projectItemsCostData.length} بنود مسجلة
                  </span>
                </h3>
                <p className="text-xs text-slate-500">قياس التكاليف التشغيلية المباشرة (الوقود والصيانة) ونسبة استهلاك الميزانية المحددة لكل بند عمل</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onNavigateTab('reports')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>تسجيل تقرير ببند عمل</span>
              </button>
            </div>
          </div>

          {projectItemsCostData.length > 0 ? (
            <div className="space-y-4">
              {/* Summary KPIs Row for Items */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 block">ميزانيات البنود المرصودة:</span>
                  <span className="text-sm font-black text-slate-900 block">{formatCurr(totalItemsEstimatedBudget)}</span>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-800 block">إجمالي إنجاز البنود:</span>
                  <span className="text-sm font-black text-amber-900 block">{formatCurr(totalItemsRevenue)}</span>
                </div>
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-1">
                  <span className="text-[11px] font-bold text-rose-800 block">التكلفة التشغيلية المباشرة:</span>
                  <span className="text-sm font-black text-rose-900 block">{formatCurr(totalItemsDirectCost)}</span>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-800 block">صافي أرباح/هامش البنود:</span>
                  <span className="text-sm font-black text-emerald-900 block">{formatCurr(totalItemsRevenue - totalItemsDirectCost)}</span>
                </div>
              </div>

              {/* Items Breakdown Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-200 font-extrabold">
                    <tr>
                      <th className="p-3">رمز البند واسمه</th>
                      <th className="p-3">الميزانية المرصودة</th>
                      <th className="p-3">ساعات العمل</th>
                      <th className="p-3">كمية الإنجاز المنفذة</th>
                      <th className="p-3">إجمالي الإنجاز</th>
                      <th className="p-3">التكلفة المباشرة</th>
                      <th className="p-3">تكلفة الوحدة المنجزة</th>
                      <th className="p-3">الصافي / الهامش</th>
                      <th className="p-3">استهلاك الميزانية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-bold text-slate-800 bg-white">
                    {projectItemsCostData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-black px-1.5 py-0.5 rounded">
                              {item.code}
                            </span>
                            <span className="font-extrabold text-slate-900">{item.name}</span>
                            <span className="text-[10px] text-slate-400">({item.unit})</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          {item.estimatedBudget > 0 ? formatCurr(item.estimatedBudget) : 'غير محدد'}
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-mono">
                            {formatHoursDigital(item.workHours)} ({item.reportsCount} تقرير)
                          </span>
                        </td>
                        <td className="p-3 font-extrabold text-blue-900">
                          {item.totalCompletedQuantity > 0 ? (
                            <span>{item.totalCompletedQuantity.toLocaleString('ar-SA')} {item.unit}</span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">---</span>
                          )}
                        </td>
                        <td className="p-3 font-extrabold text-amber-900">
                          {formatCurr(item.grossRevenue)}
                        </td>
                        <td className="p-3 font-black text-slate-900">
                          {formatCurr(item.totalDirectCost)}
                          <span className="block text-[10px] text-amber-700">ديزل: {formatCurr(item.dieselCost)}</span>
                        </td>
                        <td className="p-3">
                          {item.unitCost > 0 ? (
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black text-[11px] block">
                              {item.unitCost.toFixed(2)} {projectInfo.currency}/{item.unit}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">---</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-black ${
                            item.netMargin >= 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {formatCurr(item.netMargin)}
                          </span>
                        </td>
                        <td className="p-3 min-w-[130px]">
                          {item.estimatedBudget > 0 ? (
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span>{item.budgetPct}%</span>
                                <span className={item.budgetPct > 90 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                                  {item.budgetPct > 100 ? 'تجاوز!' : 'من الميزانية'}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    item.budgetPct <= 75 ? 'bg-emerald-500' : item.budgetPct <= 90 ? 'bg-amber-500' : 'bg-rose-600'
                                  }`} 
                                  style={{ width: `${Math.min(100, item.budgetPct)}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">---</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-center space-y-2">
              <p className="text-xs font-bold text-amber-900">
                لم يتم تسجيل بنود عمل مخصصة لهذا المشروع بعد. يمكنك إدخال بنود وتوزيع تكاليف العمل والوقود عليها عند تسجيل أو تعديل بيانات المشروع.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Equipment Hours Bar Chart (2 columns) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">ساعات إنجاز المعدات</h3>
              <p className="text-xs text-slate-500">مقارنة ساعات التشغيل الفعلية لكل معدة</p>
            </div>
            <button
              onClick={() => onNavigateTab('equipment-manager')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <span>تفاصيل المعدات</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentHoursData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  formatter={(value: any) => [`${value} ساعة`, 'إجمالي الساعات']}
                  labelFormatter={(label, items) => items[0]?.payload?.fullName || label}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="hours" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-1">توزيع التكاليف التشغيلية</h3>
            <p className="text-xs text-slate-500">مجموع التكاليف: {formatCurr(grandTotalCosts)}</p>
          </div>

          <div className="h-56 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${val} ${currencySymbol}`, 'التكلفة']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400">التشغيل</span>
              <span className="text-sm font-extrabold text-slate-800">{(grandTotalCosts || 0).toLocaleString('ar-SA')} {currencySymbol}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {costBreakdownData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 font-medium">{item.name}:</span>
                <span className="font-bold text-slate-900">{item.value.toLocaleString('ar-SA')} {currencySymbol}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Diesel Monthly Consumption & Cost Analytics Section (Recharts) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>متابعة إجمالي استهلاك الديزل والتكاليف الشهرية</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                  {projectInfo.name || 'المشروع النشط'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                رسوم بيانية تفاعلية لقياس كمية استهلاك الوقود وتكاليفه التشغيلية شهر بشهر ومقارنتها عبر المشاريع
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('diesel-warehouse')}
            className="text-xs font-bold text-slate-700 hover:text-amber-600 bg-slate-100 hover:bg-amber-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>سجل حركة الديزل</span>
          </button>
        </div>

        {/* Quick KPI Strip for Monthly & Daily Fuel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/90 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-900 block flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-600" />
                <span>الاستهلاك اليومي مقارنة بالأسبوعي</span>
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-lg font-black text-amber-950">{dailyWeeklyStats.todayLiters.toLocaleString('ar-SA')} <span className="text-xs font-semibold text-slate-600">لتر</span></span>
                {dailyWeeklyStats.effectiveAvg > 0 && (
                  <span className={`text-[10px] font-extrabold ${dailyWeeklyStats.isHigher ? 'text-amber-700' : dailyWeeklyStats.isLower ? 'text-emerald-700' : 'text-slate-600'}`}>
                    ({dailyWeeklyStats.isHigher ? `+${dailyWeeklyStats.diffPercent}%` : `${dailyWeeklyStats.diffPercent}%`})
                  </span>
                )}
              </div>
              <span className="text-[10px] text-amber-800/80 font-bold block mt-0.5">
                المتوسط: {dailyWeeklyStats.effectiveAvg.toLocaleString('ar-SA')} لتر/يوم
              </span>
            </div>
            <Gauge className="w-5 h-5 text-amber-600" />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">إجمالي الاستهلاك (المشروع الحالي)</span>
              <span className="text-lg font-black text-slate-900">{totalDieselConsumed.toLocaleString('ar-SA')} <span className="text-xs font-semibold text-slate-500">لتر</span></span>
            </div>
            <Fuel className="w-5 h-5 text-amber-500" />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">تكلفة الديزل الإجمالية (المشروع)</span>
              <span className="text-lg font-black text-rose-600">{formatCurr(totalDieselCosts || (totalDieselConsumed * 2.3))}</span>
            </div>
            <Coins className="w-5 h-5 text-rose-500" />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">إجمالي كافة المشاريع ({allProjects.length || 1})</span>
              <span className="text-lg font-black text-amber-700">{grandTotalAllProjectsDieselLiters.toLocaleString('ar-SA')} <span className="text-xs font-semibold text-slate-500">لتر</span> ({formatCurr(grandTotalAllProjectsDieselCost)})</span>
            </div>
            <FolderKanban className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Recharts Main Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          
          {/* Chart 1: Monthly Diesel Consumption & Cost Composed Chart */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-amber-500" />
                  <span>الاستهلاك والتكلفة الشهرية للمشروع</span>
                </h4>
                <p className="text-[11px] text-slate-500">توزيع كميات الديزل باللتر مقابل التكلفة بالسعر المحلي</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyDieselData} margin={{ top: 15, right: 10, left: 10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="monthLabel" stroke="#64748b" fontSize={11} />
                  <YAxis yAxisId="left" orientation="right" stroke="#d97706" fontSize={10} label={{ value: 'لتر', angle: -90, position: 'insideRight', offset: 0, fill: '#d97706', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="left" stroke="#dc2626" fontSize={10} label={{ value: currencySymbol, angle: 90, position: 'insideLeft', offset: 0, fill: '#dc2626', fontSize: 10 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                            <p className="font-bold text-amber-400">{data.monthLabel}</p>
                            <p className="flex justify-between gap-4">
                              <span className="text-slate-300">كمية الديزل:</span>
                              <strong className="text-amber-300">{data.liters.toLocaleString('ar-SA')} لتر</strong>
                            </p>
                            <p className="flex justify-between gap-4">
                              <span className="text-slate-300">التكلفة الإجمالية:</span>
                              <strong className="text-rose-400">{data.cost.toLocaleString('ar-SA')} {currencySymbol}</strong>
                            </p>
                            {data.liters > 0 && (
                              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                                متوسط سعر اللتر: {(data.cost / data.liters).toFixed(2)} {currencySymbol}/لتر
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-xs font-bold text-slate-700">{value === 'liters' ? 'الكمية (لتر)' : `التكلفة (${currencySymbol})`}</span>}
                  />
                  <Bar yAxisId="left" dataKey="liters" name="liters" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={28} />
                  <Line yAxisId="right" type="monotone" dataKey="cost" name="cost" stroke="#dc2626" strokeWidth={3} dot={{ r: 5, fill: '#dc2626' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Per-Project Diesel Consumption & Cost Comparison Chart */}
          <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <FolderKanban className="w-4 h-4 text-amber-500" />
                  <span>مقارنة استهلاك وتكلفة الديزل بين المشاريع</span>
                </h4>
                <p className="text-[11px] text-slate-500">مقارنة إجمالي المصاريف التشغيلية لكل مشروع مسجل</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectsDieselComparisonData} margin={{ top: 15, right: 10, left: 10, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="shortName" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans border border-slate-700 max-w-xs">
                            <p className="font-extrabold text-amber-400">{data.projectName}</p>
                            <p className="text-[10px] text-slate-400">{data.companyName}</p>
                            <div className="pt-1 border-t border-slate-800 space-y-1">
                              <p className="flex justify-between gap-3">
                                <span>الديزل المستهلك:</span>
                                <strong className="text-amber-300">{data.liters.toLocaleString('ar-SA')} لتر</strong>
                              </p>
                              <p className="flex justify-between gap-3">
                                <span>التكلفة التشغيلية:</span>
                                <strong className="text-rose-400">{data.cost.toLocaleString('ar-SA')} {currencySymbol}</strong>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    formatter={(value) => <span className="text-xs font-bold text-slate-700">{value === 'liters' ? 'كمية الديزل (لتر)' : `التكلفة الإجمالية (${currencySymbol})`}</span>}
                  />
                  <Bar dataKey="liters" name="liters" fill="#0284c7" radius={[6, 6, 0, 0]} barSize={22} />
                  <Bar dataKey="cost" name="cost" fill="#e11d48" radius={[6, 6, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Chart 3: Daily Diesel Trend (Current Week vs Last Week) */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/90 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>تطور استهلاك الديزل اليومي</span>
              </h4>
              <p className="text-[11px] text-slate-500">مقارنة الاستهلاك اليومي (لتر) خلال الأسبوع الحالي مقابل الأسبوع الماضي</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyDieselTrendData} margin={{ top: 15, right: 10, left: 10, bottom: 15 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={10} label={{ value: 'لتر', angle: -90, position: 'insideRight', offset: 0, fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                          <p className="font-bold text-emerald-400">{data.dayLabel} ({data.dateStr})</p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-300">الأسبوع الحالي:</span>
                            <strong className="text-emerald-300">{data.currentWeek.toLocaleString('ar-SA')} لتر</strong>
                          </p>
                          <p className="flex justify-between gap-4">
                            <span className="text-slate-400">الأسبوع الماضي:</span>
                            <strong className="text-slate-300">{data.lastWeek.toLocaleString('ar-SA')} لتر</strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  formatter={(value) => <span className="text-xs font-bold text-slate-700">{value === 'currentWeek' ? 'الأسبوع الحالي' : 'الأسبوع الماضي'}</span>}
                />
                <Area type="monotone" dataKey="lastWeek" name="lastWeek" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorLast)" />
                <Area type="monotone" dataKey="currentWeek" name="currentWeek" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Diesel Consumption Summary & Top Consumer Highlight */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Gauge className="w-5 h-5 text-amber-500" />
                <span>ملخص استهلاك الديزل لكل معدة</span>
              </h4>
              <p className="text-xs text-slate-500">تفاصيل كمية وتكلفة استهلاك وقود الديزل لكل معدة في المشروع</p>
            </div>
            
            <button 
              onClick={() => onNavigateTab('equipment-manager')}
              className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>إدارة المعدات</span>
            </button>
          </div>

          {/* Top Consumer Equipment Badge Card */}
          {topCurrentMonthEquipment ? (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 p-4 sm:p-5 rounded-xl border border-amber-500/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-md flex-shrink-0">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-200" />
                      <span>المعدة الأكثر استهلاكاً للشهر الحالي</span>
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{topCurrentMonthEquipment.type}</span>
                  </div>
                  <h5 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
                    <span>{topCurrentMonthEquipment.name}</span>
                    {topCurrentMonthEquipment.plateNumber && topCurrentMonthEquipment.plateNumber !== '---' && (
                      <span className="text-xs font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                        {topCurrentMonthEquipment.plateNumber}
                      </span>
                    )}
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    استهلكت خلال هذا الشهر <strong className="text-amber-700">{topCurrentMonthEquipment.currentMonthLiters.toLocaleString('ar-SA')} لتر</strong> من أصل {totalCurrentMonthProjectDieselLiters.toLocaleString('ar-SA')} لتر للمشروع 
                    {totalCurrentMonthProjectDieselLiters > 0 && (
                      <span className="text-amber-800 font-extrabold mr-1">
                        ({Math.round((topCurrentMonthEquipment.currentMonthLiters / totalCurrentMonthProjectDieselLiters) * 100)}% من إجمالي الشهر)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">استهلاك الشهر</span>
                  <span className="text-base font-black text-amber-600">{topCurrentMonthEquipment.currentMonthLiters.toLocaleString('ar-SA')} <span className="text-xs">لتر</span></span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block">التكلفة الشهرية</span>
                  <span className="text-base font-black text-rose-600">{formatCurr(topCurrentMonthEquipment.currentMonthCost)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              لا توجد عمليات صرف ديزل مسجلة هذا الشهر حتى الآن
            </div>
          )}

          {/* Individual Equipment Fuel Breakdown Table/List */}
          {sortedEquipmentByDiesel.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3">المعدة</th>
                    <th className="p-3">نوع المعدة</th>
                    <th className="p-3 text-center">استهلاك الشهر الحالي (لتر)</th>
                    <th className="p-3 text-center">تكلفة الشهر الحالي</th>
                    <th className="p-3 text-center">إجمالي الاستهلاك التاريخي</th>
                    <th className="p-3 text-center">نسبة الاستهلاك</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedEquipmentByDiesel.map((eq, idx) => {
                    const maxLiters = sortedEquipmentByDiesel[0]?.currentMonthLiters || sortedEquipmentByDiesel[0]?.totalLiters || 1;
                    const refLiters = eq.currentMonthLiters > 0 ? eq.currentMonthLiters : eq.totalLiters;
                    const percent = Math.min(100, Math.round((refLiters / maxLiters) * 100));
                    const isTop = idx === 0 && (eq.currentMonthLiters > 0 || eq.totalLiters > 0);

                    return (
                      <tr key={eq.id} className={`hover:bg-slate-50/80 transition-colors ${isTop ? 'bg-amber-50/40 font-semibold' : ''}`}>
                        <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2">
                          <Truck className={`w-4 h-4 ${isTop ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{eq.name}</span>
                          {isTop && (
                            <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black">الأعلى</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{eq.type || 'معدة'}</td>
                        <td className="p-3 text-center font-bold text-amber-700">
                          {eq.currentMonthLiters > 0 ? `${eq.currentMonthLiters.toLocaleString('ar-SA')} لتر` : <span className="text-slate-400 font-normal">0 لتر</span>}
                        </td>
                        <td className="p-3 text-center font-bold text-rose-600">
                          {eq.currentMonthCost > 0 ? formatCurr(eq.currentMonthCost) : <span className="text-slate-400 font-normal">0 {currencySymbol}</span>}
                        </td>
                        <td className="p-3 text-center text-slate-800 font-bold">
                          {eq.totalLiters.toLocaleString('ar-SA')} <span className="text-[10px] text-slate-500 font-normal">لتر ({formatCurr(eq.totalCost)})</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center gap-2 justify-center max-w-[120px] mx-auto">
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-amber-500' : 'bg-sky-500'}`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold min-w-[28px] text-left">{percent}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Recent Work Reports Ledger Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">أحدث سجلات يومية العمل</h3>
            <p className="text-xs text-slate-500">آخر العمليات التي تم تسجيها بالنظام</p>
          </div>
          <button
            onClick={() => onNavigateTab('reports-list')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            عرض كافة السجلات ({reports.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">رقم التقرير</th>
                <th className="p-3.5">التاريخ</th>
                <th className="p-3.5">المعدة</th>
                <th className="p-3.5">الشركة المؤجرة</th>
                <th className="p-3.5">السائق</th>
                <th className="p-3.5 text-center">نوع العقد</th>
                <th className="p-3.5 text-center">الساعات</th>
                <th className="p-3.5 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reports.slice(0, 5).map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-amber-600">{report.reportNumber}</td>
                  <td className="p-3.5">{report.date}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{report.equipmentName}</td>
                  <td className="p-3.5">{report.companyName}</td>
                  <td className="p-3.5">{report.driverName}</td>
                  <td className="p-3.5 text-center">
                    <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                      {getContractTypeName(report.contractType)}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-blue-600">{formatHoursDigital(report.totalNetHours)}</td>
                  <td className="p-3.5 text-left font-extrabold text-emerald-700">
                    {formatCurr(report.grossAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Docs Success Modal */}
      {createdDocUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-center shadow-2xl border border-blue-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-lg">تم إنشاء التقرير التنفيذي في Google Docs!</h3>
              <p className="text-xs text-slate-600">
                تم حفظ التقرير الشامل للوحة التحكم في مستند جديد بحساب جوجل الخاص بك. يمكنك فتح المستند وقراءته أو تعديله فوراً.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={createdDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>فتح التقرير في Google Docs</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setCreatedDocUrl(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
