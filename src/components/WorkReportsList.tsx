import React, { useState } from 'react';
import { WorkReport, ProjectInfo } from '../types';
import { 
  formatCurrency, 
  formatHoursDigital,
  getContractTypeName, 
  exportReportsToExcel, 
  exportReportsToPDF, 
  exportSingleReportToPDF,
  printElement 
} from '../utils/exportUtils';
import { 
  signInWithGoogle, 
  exportReportToGoogleDoc, 
  getAccessToken 
} from '../utils/googleDocs';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  FileDown,
  Printer, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Truck, 
  User, 
  PenTool, 
  FileSpreadsheet, 
  FileCheck,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Loader2,
  Copy,
  Paperclip,
  Camera,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export type ReportSortField = 
  | 'reportNumber' 
  | 'date' 
  | 'equipmentName' 
  | 'companyName' 
  | 'driverName' 
  | 'workLocation' 
  | 'workItem' 
  | 'contractType' 
  | 'totalNetHours' 
  | 'driverAdvance' 
  | 'netCompanyDue';

interface WorkReportsListProps {
  reports: WorkReport[];
  projectInfo: ProjectInfo;
  onEditReport: (report: WorkReport) => void;
  onCopyReport: (report: WorkReport) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenNewReport: () => void;
}

export const WorkReportsList: React.FC<WorkReportsListProps> = ({
  reports,
  projectInfo,
  onEditReport,
  onCopyReport,
  onDeleteReport,
  onOpenNewReport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState('all');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('all');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [selectedContractFilter, setSelectedContractFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Sorting States
  const [sortField, setSortField] = useState<ReportSortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: ReportSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(
        field === 'date' || 
        field === 'reportNumber' || 
        field === 'totalNetHours' || 
        field === 'netCompanyDue' || 
        field === 'driverAdvance' 
          ? 'desc' 
          : 'asc'
      );
    }
  };

  const renderSortIcon = (field: ReportSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 inline-block mr-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-400 inline-block mr-1 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-400 inline-block mr-1 font-bold" />
    );
  };

  // Google Docs Export States
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [createdDocUrl, setCreatedDocUrl] = useState<string | null>(null);

  const handleExportToGoogleDoc = async () => {
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

      let docText = `تقرير سجلات وتقارير يومية العمل - ${projectInfo.name}\n`;
      docText += `تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}\n`;
      docText += `المشروع: ${projectInfo.name} | الموقع: ${projectInfo.location || 'غير محدد'}\n`;
      docText += `فلترة التقرير: ${getFilterSummaryText()}\n\n`;
      docText += `--------------------------------------------------\n`;
      docText += `ملخص الإحصائيات:\n`;
      docText += `عدد التقارير: ${filteredReports.length}\n`;
      docText += `إجمالي الساعات الصافية: ${filteredReports.reduce((s, r) => s + (r.totalNetHours || 0), 0)} ساعة\n`;
      docText += `إجمالي كمية الديزل: ${filteredReports.reduce((s, r) => s + (r.dieselLiters || 0), 0)} لتر\n`;
      docText += `إجمالي المستحقات المالية: ${filteredReports.reduce((s, r) => s + (r.grossAmount || 0), 0)} ${projectInfo.currency || 'ر.ي'}\n`;
      docText += `--------------------------------------------------\n\n`;

      docText += `تفاصيل السجلات:\n`;
      filteredReports.forEach((r, idx) => {
        docText += `${idx + 1}. تقرير رقم: ${r.reportNumber} | التاريخ: ${r.date}\n`;
        docText += `   المعدة: ${r.equipmentName} | السائق: ${r.driverName} | الشركة: ${r.companyName}\n`;
        docText += `   ساعات العمل الصافية: ${r.totalNetHours} س | الديزل: ${r.dieselLiters || 0} لتر\n`;
        docText += `   المبلغ الإجمالي: ${r.grossAmount || 0} ${projectInfo.currency || 'ر.ي'}\n`;
        if (r.workDescription) docText += `   بيان العمل: ${r.workDescription}\n`;
        docText += `\n`;
      });

      const docTitle = `تقرير يومية العمل - ${projectInfo.name} - ${new Date().toISOString().slice(0, 10)}`;
      const result = await exportReportToGoogleDoc(docTitle, docText, token);
      
      setCreatedDocUrl(result.documentUrl);
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء التصدير لمستندات جوجل: ' + (err.message || err));
    } finally {
      setIsExportingDoc(false);
    }
  };

  // Extract unique filter lists
  const companies = Array.from(new Set(reports.map(r => r.companyName))).filter(Boolean);
  const equipmentNames = Array.from(new Set(reports.map(r => r.equipmentName))).filter(Boolean);
  const driverNames = Array.from(new Set(reports.map(r => r.driverName))).filter(Boolean);

  // Filter reports
  const filteredReports = reports.filter(r => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      !query ||
      (r.reportNumber && r.reportNumber.toLowerCase().includes(query)) ||
      (r.driverName && r.driverName.toLowerCase().includes(query)) ||
      (r.equipmentName && r.equipmentName.toLowerCase().includes(query)) ||
      (r.equipmentRegNumber && r.equipmentRegNumber.toLowerCase().includes(query)) ||
      (r.companyName && r.companyName.toLowerCase().includes(query)) ||
      (r.workLocation && r.workLocation.toLowerCase().includes(query)) ||
      (r.workItem && r.workItem.toLowerCase().includes(query)) ||
      (r.date && r.date.includes(query));

    const matchesSingleDate = !selectedDate || r.date === selectedDate;
    const matchesStartDate = !startDate || r.date >= startDate;
    const matchesEndDate = !endDate || r.date <= endDate;
    const matchesDriver = selectedDriverFilter === 'all' || r.driverName === selectedDriverFilter;
    const matchesEquipment = selectedEquipmentFilter === 'all' || r.equipmentName === selectedEquipmentFilter;
    const matchesCompany = selectedCompanyFilter === 'all' || r.companyName === selectedCompanyFilter;
    const matchesContract = selectedContractFilter === 'all' || r.contractType === selectedContractFilter;

    return matchesSearch && matchesSingleDate && matchesStartDate && matchesEndDate && matchesDriver && matchesEquipment && matchesCompany && matchesContract;
  });

  // Sort filtered reports
  const sortedAndFilteredReports = [...filteredReports].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (valA === undefined || valA === null) valA = '';
    if (valB === undefined || valB === null) valB = '';

    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }

    const strA = String(valA).toLowerCase();
    const strB = String(valB).toLowerCase();

    if (sortOrder === 'asc') {
      return strA.localeCompare(strB, 'ar', { numeric: true });
    } else {
      return strB.localeCompare(strA, 'ar', { numeric: true });
    }
  });

  // Construct active filter summary text for PDF export
  const getFilterSummaryText = () => {
    const parts: string[] = [];
    if (searchTerm) parts.push(`البحث: "${searchTerm}"`);
    if (selectedDate) parts.push(`التاريخ: ${selectedDate}`);
    if (startDate) parts.push(`من: ${startDate}`);
    if (endDate) parts.push(`إلى: ${endDate}`);
    if (selectedEquipmentFilter !== 'all') parts.push(`المعدة: ${selectedEquipmentFilter}`);
    if (selectedDriverFilter !== 'all') parts.push(`السائق: ${selectedDriverFilter}`);
    if (selectedCompanyFilter !== 'all') parts.push(`الشركة: ${selectedCompanyFilter}`);
    if (selectedContractFilter !== 'all') parts.push(`نوع العقد: ${getContractTypeName(selectedContractFilter)}`);
    return parts.length > 0 ? parts.join(' | ') : 'كافة تقارير المشروع الكلية';
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    selectedDate !== '' || 
    startDate !== '' ||
    endDate !== '' ||
    selectedDriverFilter !== 'all' || 
    selectedEquipmentFilter !== 'all' || 
    selectedCompanyFilter !== 'all' || 
    selectedContractFilter !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setSelectedDriverFilter('all');
    setSelectedEquipmentFilter('all');
    setSelectedCompanyFilter('all');
    setSelectedContractFilter('all');
    setSortField('date');
    setSortOrder('desc');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-500" />
              <span>سجلات وتقارير يومية العمل</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              عرض كافـة السجلات، البحث بالشركة أو المعدة، التصدير لـ PDF و Excel وطباعة التقارير
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportReportsToExcel(filteredReports)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>تصدير Excel</span>
            </button>

            <button
              onClick={() => exportReportsToPDF(filteredReports, projectInfo, 'كشف تقارير يومية العمل المفلترة', getFilterSummaryText())}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-rose-600" />
              <span>تصدير PDF</span>
            </button>

            <button
              onClick={handleExportToGoogleDoc}
              disabled={isExportingDoc}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="إنشاء مستند تقرير مفصل في مستندات جوجل (Google Docs)"
            >
              {isExportingDoc ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 text-blue-600" />
              )}
              <span>{isExportingDoc ? 'جاري التصدير...' : 'مستندات جوجل (Docs)'}</span>
            </button>

            <button
              onClick={onOpenNewReport}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
            >
              + إضافة تقرير
            </button>
          </div>
        </div>

        {/* Advanced Search & Filter Bar */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          
          {/* Main Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4.5 h-4.5 text-slate-400 absolute right-3.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث شامل برقم التقرير، اسم السائق، اسم المعدة، الشركة..."
                className="w-full bg-white border border-slate-300 rounded-xl pr-10 pl-9 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs whitespace-nowrap
                ${showAdvancedSearch || hasActiveFilters 
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>بحث متقدم</span>
              {hasActiveFilters && !showAdvancedSearch && (
                <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full mr-1">نشط</span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center justify-center gap-1.5 text-amber-800 hover:text-amber-950 font-bold text-xs bg-white hover:bg-amber-100/80 px-3 py-2 rounded-xl border border-amber-300 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                title="إعادة ضبط الفلاتر"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">إعادة ضبط</span>
              </button>
            )}
          </div>

          {/* Filters Grid */}
          {(showAdvancedSearch || hasActiveFilters) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-slate-100 mt-2">
            
            {/* Filter by Single Date */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>تاريخ محدد:</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setStartDate(''); setEndDate(''); }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="absolute left-2 top-2 text-slate-400 hover:text-rose-600 text-xs"
                    title="مسح التاريخ"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Date Range - From */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>من تاريخ:</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setSelectedDate(''); }}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            {/* Date Range - To */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <span>إلى تاريخ:</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setSelectedDate(''); }}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            {/* Filter by Equipment */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <Truck className="w-3 h-3 text-amber-500" />
                <span>المعدة:</span>
              </label>
              <select
                value={selectedEquipmentFilter}
                onChange={(e) => setSelectedEquipmentFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="all">كافة المعدات ({equipmentNames.length})</option>
                {equipmentNames.map((eq, i) => (
                  <option key={i} value={eq}>{eq}</option>
                ))}
              </select>
            </div>

            {/* Filter by Driver */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-amber-500" />
                <span>السائق / المشغل:</span>
              </label>
              <select
                value={selectedDriverFilter}
                onChange={(e) => setSelectedDriverFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="all">كافة السائقين ({driverNames.length})</option>
                {driverNames.map((driver, i) => (
                  <option key={i} value={driver}>{driver}</option>
                ))}
              </select>
            </div>

            {/* Filter by Company */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-500" />
                <span>الشركة:</span>
              </label>
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="all">كافة الشركات ({companies.length})</option>
                {companies.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Filter by Contract Type */}
            <div>
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <PenTool className="w-3 h-3 text-amber-500" />
                <span>نوع العقد:</span>
              </label>
              <select
                value={selectedContractFilter}
                onChange={(e) => setSelectedContractFilter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="all">كافة العقود</option>
                <option value="daily">يومي</option>
                <option value="hourly">ساعة</option>
                <option value="meter">متر</option>
                <option value="monthly">شهري</option>
                <option value="salary">راتب</option>
              </select>
            </div>

            {/* Sort Control Dropdown */}
            <div className="sm:col-span-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3 text-amber-500" />
                <span>ترتيب وفرز القائمة:</span>
              </label>
              <div className="flex gap-1.5">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as ReportSortField)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                >
                  <option value="date">التاريخ</option>
                  <option value="reportNumber">رقم التقرير</option>
                  <option value="equipmentName">اسم المعدة</option>
                  <option value="companyName">الشركة المؤجرة</option>
                  <option value="driverName">السائق</option>
                  <option value="workLocation">موقع العمل</option>
                  <option value="workItem">بند العمل</option>
                  <option value="totalNetHours">إجمالي الساعات</option>
                  <option value="driverAdvance">السلفة</option>
                  <option value="netCompanyDue">الصافي</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 shadow-2xs flex items-center gap-1 whitespace-nowrap"
                  title="تغيير اتجاه الترتيب (تصاعدي / تنازلي)"
                >
                  {sortOrder === 'asc' ? 'تصاعدي ↑' : 'تنازلي ↓'}
                </button>
              </div>
            </div>

          </div>
          )}

          {/* Filter Live Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/80 text-xs">
            <div className="flex flex-wrap items-center gap-3 text-slate-700 font-bold">
              <span>عُثر على: <strong className="text-amber-600 font-black">{filteredReports.length}</strong> من أصل {reports.length} تقرير</span>
              <span className="text-slate-300">|</span>
              <span>الساعات: <strong className="text-slate-900">{formatHoursDigital(filteredReports.reduce((s, r) => s + (r.totalNetHours || 0), 0))}</strong></span>
              <span className="text-slate-300">|</span>
              <span>الديزل: <strong className="text-slate-900">{filteredReports.reduce((s, r) => s + (r.dieselLiters || 0), 0)} لتر</strong></span>
              <span className="text-slate-300">|</span>
              <span>المستحقات: <strong className="text-emerald-700 font-extrabold">{formatCurrency(filteredReports.reduce((s, r) => s + (r.grossAmount || 0), 0), projectInfo.currency || 'ر.ي')}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-900 text-white font-bold select-none">
              <tr>
                <th onClick={() => handleSort('reportNumber')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>رقم التقرير</span>
                    {renderSortIcon('reportNumber')}
                  </div>
                </th>
                <th onClick={() => handleSort('date')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>التاريخ</span>
                    {renderSortIcon('date')}
                  </div>
                </th>
                <th onClick={() => handleSort('equipmentName')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>اسم المعدة واللوحة</span>
                    {renderSortIcon('equipmentName')}
                  </div>
                </th>
                <th onClick={() => handleSort('companyName')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>الشركة المؤجرة</span>
                    {renderSortIcon('companyName')}
                  </div>
                </th>
                <th onClick={() => handleSort('driverName')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>السائق</span>
                    {renderSortIcon('driverName')}
                  </div>
                </th>
                <th onClick={() => handleSort('workLocation')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>موقع العمل</span>
                    {renderSortIcon('workLocation')}
                  </div>
                </th>
                <th onClick={() => handleSort('workItem')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>بند العمل</span>
                    {renderSortIcon('workItem')}
                  </div>
                </th>
                <th onClick={() => handleSort('contractType')} className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span>نوع العقد</span>
                    {renderSortIcon('contractType')}
                  </div>
                </th>
                <th onClick={() => handleSort('totalNetHours')} className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span>الساعات</span>
                    {renderSortIcon('totalNetHours')}
                  </div>
                </th>
                <th onClick={() => handleSort('driverAdvance')} className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span>السلفة</span>
                    {renderSortIcon('driverAdvance')}
                  </div>
                </th>
                <th onClick={() => handleSort('netCompanyDue')} className="p-3.5 text-left cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    <span>الصافي</span>
                    {renderSortIcon('netCompanyDue')}
                  </div>
                </th>
                <th className="p-3.5 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedAndFilteredReports.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-400 font-bold">
                    لا توجد تقارير مطابقة لمحددات البحث الحالية
                  </td>
                </tr>
              ) : (
                sortedAndFilteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-amber-600">{report.reportNumber}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{report.date}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{report.equipmentName}</div>
                      <div className="text-[10px] text-slate-400">{report.equipmentRegNumber}</div>
                    </td>
                    <td className="p-3.5 font-medium">{report.companyName}</td>
                    <td className="p-3.5 font-medium">{report.driverName}</td>
                    <td className="p-3.5 font-medium">{report.workLocation || '-'}</td>
                    <td className="p-3.5 font-medium">
                      <div>{report.workItem || '-'}</div>
                      {report.completedQuantity ? (
                        <div className="text-[10px] text-amber-600 font-extrabold">
                          إنجاز: {report.completedQuantity.toLocaleString('ar-SA')} {report.itemUnit || ''}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg text-xs">
                        {getContractTypeName(report.contractType)}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-blue-600">
                      {formatHoursDigital(report.totalNetHours)}
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-600">
                      {report.driverAdvance} ر.س
                    </td>
                    <td className="p-3.5 text-left font-extrabold text-emerald-700">
                      {formatCurrency(report.netCompanyDue)}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          title="معاينة وطباعة التقرير"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportSingleReportToPDF(report, projectInfo)}
                          title="تصدير تقرير PDF احترافي"
                          className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer font-bold flex items-center gap-1"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCopyReport(report)}
                          title="نسخ التقرير (عمل مكرر)"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditReport(report)}
                          title="تعديل البيانات"
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteReport(report.id)}
                          title="حذف التقرير"
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Report View / Print Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl my-8 relative">
            
            {/* Modal Top Actions Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 no-print">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-slate-900 text-lg">
                  تفاصيل كشف يومية العمل ({selectedReport.reportNumber})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportSingleReportToPDF(selectedReport, projectInfo)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                  title="تصدير PDF منسق واحترافي للطباعة"
                >
                  <FileDown className="w-4 h-4" />
                  <span>تصدير PDF احترافي</span>
                </button>

                <button
                  onClick={() => printElement('single-report-print')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة المستند</span>
                </button>

                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Container Document */}
            <div id="single-report-print" className="space-y-6 p-4 border border-slate-200 rounded-xl bg-white">
              
              {/* Report Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-slate-900">{projectInfo.name}</h1>
                  <p className="text-xs text-slate-600 mt-1">{projectInfo.companyName} | هاتف: {projectInfo.phone}</p>
                  <p className="text-xs text-slate-500">الموقع: {projectInfo.location}</p>
                </div>

                <div className="text-left">
                  <div className="bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-lg text-xs inline-block">
                    كشف يومية عمل
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-2">رقم: {selectedReport.reportNumber}</div>
                  <div className="text-xs text-slate-600">التاريخ: {selectedReport.date}</div>
                </div>
              </div>

              {/* Equipment & Driver Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-500 block">المعدة:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedReport.equipmentName}</span>
                  <span className="text-slate-600 block">رقم اللوحة: {selectedReport.equipmentRegNumber}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block">الشركة المؤجرة:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{selectedReport.companyName}</span>
                  <span className="text-slate-600 block">نوع العقد: {getContractTypeName(selectedReport.contractType)}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block">السائق المستلم:</span>
                  <span className="font-bold text-slate-800">{selectedReport.driverName} ({selectedReport.driverPhone})</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 block">قراءة العدادات:</span>
                  <span className="font-bold text-slate-800">من {selectedReport.meterStart} إلى {selectedReport.meterEnd}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">موقع العمل:</span>
                  <span className="font-bold text-slate-800">{selectedReport.workLocation || '-'}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 block">بند العمل بالمشروع:</span>
                  <span className="font-bold text-slate-800">{selectedReport.workItem || '-'}</span>
                  {selectedReport.completedQuantity ? (
                    <span className="block text-xs font-black text-amber-600">
                      كمية الإنجاز المنفذة: {selectedReport.completedQuantity.toLocaleString('ar-SA')} {selectedReport.itemUnit || ''}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Shift Periods Table */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 mb-2">فترات وساعات العمل بالوردية:</h4>
                <table className="w-full text-right text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 border">الفترة</th>
                      <th className="p-2 border">وقت البدء</th>
                      <th className="p-2 border">وقت الانتهاء</th>
                      <th className="p-2 border text-center">الخصم (د)</th>
                      <th className="p-2 border text-center">الصافي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.periods.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 border font-bold">{p.periodName}</td>
                        <td className="p-2 border">{p.startTime}</td>
                        <td className="p-2 border">{p.endTime}</td>
                        <td className="p-2 border text-center">{p.breakMinutes || 0} د</td>
                        <td className="p-2 border text-center font-bold text-blue-700">{p.netHours} ساعة</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Statement */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>ساعات التشغيل الفعالة:</span>
                  <span className="font-bold text-white">{formatHoursDigital(selectedReport.totalNetHours)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>سعر التشغيل بالساعة:</span>
                  <span className="font-bold text-white">{selectedReport.ratePerUnit} ر.س / ساعة</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2 font-bold">
                  <span>التكلفة الإجمالية للتقرير (ساعات التشغيل × السعر):</span>
                  <span className="font-black text-amber-400 text-sm">{selectedReport.grossAmount} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-rose-300 pt-1">
                  <span>تخصم السلفة اليومية المقيدة للسائق:</span>
                  <span className="font-bold text-rose-400">- {selectedReport.driverAdvance} ر.س</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-700 pt-2 text-sm font-black">
                  <span>الصافي المتبقي للشركة:</span>
                  <span className="text-emerald-400 text-base">{selectedReport.netCompanyDue} ر.س</span>
                </div>
              </div>

              {/* Cost Notes & Vouchers/Attachments Section */}
              {selectedReport.costs && (
                selectedReport.costs.dieselNotes || selectedReport.costs.dieselAttachment ||
                selectedReport.costs.hydraulicOilNotes || selectedReport.costs.hydraulicOilAttachment ||
                selectedReport.costs.engineOilNotes || selectedReport.costs.engineOilAttachment ||
                selectedReport.costs.greaseNotes || selectedReport.costs.greaseAttachment ||
                selectedReport.costs.sparePartsNotes || selectedReport.costs.sparePartsAttachment ||
                selectedReport.costs.maintenanceNotes || selectedReport.costs.maintenanceAttachment ||
                selectedReport.costs.driverAdvanceNotes || selectedReport.costs.driverAdvanceAttachment
              ) && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-xs">
                  <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
                    <Paperclip className="w-4 h-4 text-amber-500" />
                    <span>الملاحظات ومرفقات سندات الاستلام / المصروفات:</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Diesel */}
                    {(selectedReport.costs.dieselNotes || selectedReport.costs.dieselAttachment) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-extrabold text-amber-800 block">الديزل:</span>
                        {selectedReport.costs.dieselNotes && <p className="text-slate-700 font-medium">{selectedReport.costs.dieselNotes}</p>}
                        {selectedReport.costs.dieselAttachment && (
                          <img
                            src={selectedReport.costs.dieselAttachment}
                            alt="سند الديزل"
                            onClick={() => setViewingImage(selectedReport.costs.dieselAttachment || null)}
                            className="h-20 w-auto object-cover rounded border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}
                      </div>
                    )}

                    {/* Hydraulic Oil */}
                    {(selectedReport.costs.hydraulicOilNotes || selectedReport.costs.hydraulicOilAttachment) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-extrabold text-sky-800 block">زيت الهيدروليك:</span>
                        {selectedReport.costs.hydraulicOilNotes && <p className="text-slate-700 font-medium">{selectedReport.costs.hydraulicOilNotes}</p>}
                        {selectedReport.costs.hydraulicOilAttachment && (
                          <img
                            src={selectedReport.costs.hydraulicOilAttachment}
                            alt="سند زيت الهيدروليك"
                            onClick={() => setViewingImage(selectedReport.costs.hydraulicOilAttachment || null)}
                            className="h-20 w-auto object-cover rounded border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}
                      </div>
                    )}

                    {/* Engine Oil */}
                    {(selectedReport.costs.engineOilNotes || selectedReport.costs.engineOilAttachment) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-extrabold text-emerald-800 block">زيت المكينة:</span>
                        {selectedReport.costs.engineOilNotes && <p className="text-slate-700 font-medium">{selectedReport.costs.engineOilNotes}</p>}
                        {selectedReport.costs.engineOilAttachment && (
                          <img
                            src={selectedReport.costs.engineOilAttachment}
                            alt="سند زيت المكينة"
                            onClick={() => setViewingImage(selectedReport.costs.engineOilAttachment || null)}
                            className="h-20 w-auto object-cover rounded border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}
                      </div>
                    )}

                    {/* Grease */}
                    {(selectedReport.costs.greaseNotes || selectedReport.costs.greaseAttachment) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-extrabold text-slate-800 block">التشحيم:</span>
                        {selectedReport.costs.greaseNotes && <p className="text-slate-700 font-medium">{selectedReport.costs.greaseNotes}</p>}
                        {selectedReport.costs.greaseAttachment && (
                          <img
                            src={selectedReport.costs.greaseAttachment}
                            alt="سند التشحيم"
                            onClick={() => setViewingImage(selectedReport.costs.greaseAttachment || null)}
                            className="h-20 w-auto object-cover rounded border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}
                      </div>
                    )}

                    {/* Spare Parts */}
                    {(selectedReport.costs.sparePartsNotes || selectedReport.costs.sparePartsAttachment) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-extrabold text-slate-800 block">قطع الغيار والصيانة:</span>
                        {selectedReport.costs.sparePartsNotes && <p className="text-slate-700 font-medium">{selectedReport.costs.sparePartsNotes}</p>}
                        {selectedReport.costs.sparePartsAttachment && (
                          <img
                            src={selectedReport.costs.sparePartsAttachment}
                            alt="سند قطع الغيار والصيانة"
                            onClick={() => setViewingImage(selectedReport.costs.sparePartsAttachment || null)}
                            className="h-20 w-auto object-cover rounded border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}
                      </div>
                    )}

                    {/* Driver Advance */}
                    {(selectedReport.costs.driverAdvanceNotes || selectedReport.costs.driverAdvanceAttachment) && (
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-extrabold text-amber-800 block">سلفة السائق:</span>
                        {selectedReport.costs.driverAdvanceNotes && <p className="text-slate-700 font-medium">{selectedReport.costs.driverAdvanceNotes}</p>}
                        {selectedReport.costs.driverAdvanceAttachment && (
                          <img
                            src={selectedReport.costs.driverAdvanceAttachment}
                            alt="سند سلفة السائق"
                            onClick={() => setViewingImage(selectedReport.costs.driverAdvanceAttachment || null)}
                            className="h-20 w-auto object-cover rounded border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Site Photos Section */}
              {selectedReport.sitePhotos && selectedReport.sitePhotos.length > 0 && (
                <div className="border border-amber-200 rounded-xl p-3 bg-amber-50/50 space-y-2 text-xs">
                  <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>الصور الميدانية الموثقة من موقع العمل ({selectedReport.sitePhotos.length}):</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {selectedReport.sitePhotos.map((photo, idx) => (
                      <div
                        key={idx}
                        onClick={() => setViewingImage(photo)}
                        className="relative group rounded-lg overflow-hidden border border-amber-200 aspect-video bg-slate-900 cursor-pointer shadow-xs hover:shadow-md transition-all"
                      >
                        <img
                          src={photo}
                          alt={`توثيق ميداني ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-1 rounded-md">تكبير الصورة 🔍</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Digital Signatures View (Driver & Supervisor) */}
              {(selectedReport.driverSignature || selectedReport.supervisorSignature) && (
                <div className="pt-3 border-t border-slate-200">
                  <h4 className="font-extrabold text-slate-800 text-xs mb-2">التوقيعات الإلكترونية المعتمدة للتقرير:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Driver Signature Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-700 text-[11px] block">توقيع السائق / المشغل:</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{selectedReport.driverName || '-'}</span>
                      </div>
                      {selectedReport.driverSignature ? (
                        <img
                          src={selectedReport.driverSignature}
                          alt="توقيع السائق"
                          className="h-10 max-w-[120px] object-contain border rounded-lg bg-white p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">غير موقع</span>
                      )}
                    </div>

                    {/* Supervisor Signature Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-700 text-[11px] block">توقيع المشرف الميداني:</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{selectedReport.supervisorName || projectInfo.managerName || '-'}</span>
                      </div>
                      {selectedReport.supervisorSignature ? (
                        <img
                          src={selectedReport.supervisorSignature}
                          alt="توقيع المشرف"
                          className="h-10 max-w-[120px] object-contain border rounded-lg bg-white p-0.5"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">غير موقع</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Google Docs Success Modal */}
      {createdDocUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-center shadow-2xl border border-blue-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-lg">تم إنشاء مستند جوجل بنجاح!</h3>
              <p className="text-xs text-slate-600">
                تم حفظ التقرير في حساب جوجل دوكس الخاص بك. يمكنك فتحه والتعديل عليه أو مشاركته مع فريق العمل.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={createdDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                <span>فتح المستند في Google Docs</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={() => setCreatedDocUrl(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Attachment Lightbox Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-slate-950/90 z-[60] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setViewingImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-10 left-0 text-white bg-slate-800 hover:bg-slate-700 rounded-full p-2 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={viewingImage}
              alt="معاينة المرفق"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-700"
            />
          </div>
        </div>
      )}

    </div>
  );
};
