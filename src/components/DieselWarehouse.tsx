import React, { useState } from 'react';
import { DieselTransaction, Equipment, Driver, ProjectInfo } from '../types';
import { exportDieselToExcel, exportDieselToPDF, formatCurrency } from '../utils/exportUtils';
import { 
  Fuel, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  Download,
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  X, 
  CheckCircle2, 
  Truck, 
  User,
  FileText,
  Calendar,
  Filter,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
  Sparkles,
  Plus,
  ChevronUp,
  Layers,
  Wrench
} from 'lucide-react';

export type DieselSortField = 
  | 'date' 
  | 'type' 
  | 'voucherNumber' 
  | 'equipmentName' 
  | 'driverName' 
  | 'supplierOrSource' 
  | 'quantityLiters' 
  | 'totalCost';

interface DieselWarehouseProps {
  transactions: DieselTransaction[];
  equipmentList: Equipment[];
  driversList: Driver[];
  projectInfo?: ProjectInfo;
  onAddTransaction: (transaction: DieselTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const DieselWarehouse: React.FC<DieselWarehouseProps> = ({
  transactions,
  equipmentList,
  driversList,
  projectInfo = { name: 'مشروع إدارة المعدات والمباني', companyName: '', managerName: '', location: '', phone: '', currency: 'ر.ي' },
  onAddTransaction,
  onDeleteTransaction
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'receive' | 'consume'>('consume');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'receive' | 'consume'>('all');

  // Advanced Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEquipmentFilter, setSelectedEquipmentFilter] = useState('all');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState('all');

  // Sorting States
  const [sortField, setSortField] = useState<DieselSortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: DieselSortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(
        field === 'date' || 
        field === 'quantityLiters' || 
        field === 'totalCost' 
          ? 'desc' 
          : 'asc'
      );
    }
  };

  const renderSortIcon = (field: DieselSortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 opacity-60 inline-block mr-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-amber-400 inline-block mr-1 font-bold" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-amber-400 inline-block mr-1 font-bold" />
    );
  };

  // Form States
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [deliveryDriverName, setDeliveryDriverName] = useState('');
  const [quantityLiters, setQuantityLiters] = useState<number>(150);
  const [pricePerLiter, setPricePerLiter] = useState<number>(2.3);
  const [equipmentName, setEquipmentName] = useState(equipmentList[0]?.name || '');
  const [driverName, setDriverName] = useState(driversList[0]?.name || '');
  const [storekeeperName, setStorekeeperName] = useState(projectInfo.managerName ? `أمين المخزن (${projectInfo.managerName})` : 'أمين المخزن - مدير الموقع');
  const [supplierOrSource, setSupplierOrSource] = useState('محطة التوريد المركزية');
  const [notes, setNotes] = useState('');

  // Stock Metrics Calculations
  const totalReceived = transactions
    .filter(t => t.type === 'receive')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);
  const totalConsumed = transactions
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);
  const currentBalance = totalReceived - totalConsumed;
  const isLowStock = currentBalance < 1000;

  // Filter lists derivation
  const uniqueEquipmentInTransactions = Array.from(new Set([
    ...equipmentList.map(e => e.name),
    ...transactions.map(t => t.equipmentName).filter(Boolean)
  ])).filter(name => name && name !== 'مخزن المشروع الرئيسي' && name !== 'مخزن المشروع');

  const uniqueDriversInTransactions = Array.from(new Set([
    ...driversList.map(d => d.name),
    ...transactions.map(t => t.driverName).filter(Boolean),
    ...transactions.map(t => t.deliveryDriverName).filter(Boolean)
  ])).filter(Boolean);

  // Date Range Presets
  const handleSetThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(today);
  };

  const handleSetLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  const handleResetAllFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setActiveTypeFilter('all');
    setSelectedEquipmentFilter('all');
    setSelectedDriverFilter('all');
  };

  const hasActiveFilters = 
    searchTerm !== '' || 
    startDate !== '' || 
    endDate !== '' || 
    activeTypeFilter !== 'all' || 
    selectedEquipmentFilter !== 'all' || 
    selectedDriverFilter !== 'all';

  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  const generateAutoVoucher = (type: 'receive' | 'consume' = modalType) => {
    const prefix = type === 'receive' ? 'REC' : 'FUEL';
    const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const code = `${prefix}-${dateCode}-${randomNum}`;
    setVoucherNumber(code);
  };

  const handleOpenQuickModal = (type: 'receive' | 'consume' = 'consume') => {
    setModalType(type);
    generateAutoVoucher(type);
    setInvoiceNumber('');
    setDeliveryDriverName('');
    if (type === 'receive') {
      setQuantityLiters(1000);
    } else {
      setQuantityLiters(150);
      if (equipmentList.length > 0) {
        setEquipmentName(equipmentList[0].name);
        if (equipmentList[0].driverName) {
          setDriverName(equipmentList[0].driverName);
        }
      }
    }
    setShowModal(true);
  };

  const handleSelectEquipmentQuick = (eq: Equipment) => {
    setEquipmentName(eq.name);
    if (eq.driverName) {
      setDriverName(eq.driverName);
    }
  };

  const handleAddNoteTag = (tag: string) => {
    if (!notes) {
      setNotes(tag);
    } else if (!notes.includes(tag)) {
      setNotes(`${notes} - ${tag}`);
    }
  };

  const handleOpenModal = (type: 'receive' | 'consume') => {
    setModalType(type);
    setVoucherNumber('');
    setInvoiceNumber('');
    setDeliveryDriverName('');
    if (type === 'receive') {
      setQuantityLiters(1000);
    } else {
      setQuantityLiters(150);
      if (equipmentList.length > 0) {
        setEquipmentName(equipmentList[0].name);
        if (equipmentList[0].driverName) {
          setDriverName(equipmentList[0].driverName);
        }
      }
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransaction: DieselTransaction = {
      id: `ds-${Date.now()}`,
      date,
      type: modalType,
      voucherNumber: voucherNumber.trim() || undefined,
      invoiceNumber: modalType === 'receive' ? (invoiceNumber.trim() || undefined) : undefined,
      deliveryDriverName: modalType === 'receive' ? (deliveryDriverName.trim() || undefined) : undefined,
      quantityLiters,
      pricePerLiter,
      totalCost: quantityLiters * pricePerLiter,
      equipmentName: modalType === 'consume' ? equipmentName : 'مخزن المشروع الرئيسي',
      driverName: modalType === 'consume' ? driverName : storekeeperName,
      supplierOrSource: modalType === 'receive' ? supplierOrSource : 'مخزن المشروع',
      notes,
      createdAt: new Date().toISOString()
    };

    onAddTransaction(newTransaction);
    setShowModal(false);
    setVoucherNumber('');
    setInvoiceNumber('');
    setDeliveryDriverName('');
    setNotes('');
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTypeFilter !== 'all' && t.type !== activeTypeFilter) {
      return false;
    }

    if (startDate && t.date < startDate) {
      return false;
    }

    if (endDate && t.date > endDate) {
      return false;
    }

    if (selectedEquipmentFilter !== 'all' && t.equipmentName !== selectedEquipmentFilter) {
      return false;
    }

    if (
      selectedDriverFilter !== 'all' && 
      t.driverName !== selectedDriverFilter && 
      t.deliveryDriverName !== selectedDriverFilter
    ) {
      return false;
    }

    if (!searchTerm) return true;

    const query = searchTerm.toLowerCase();
    return (
      (t.equipmentName && t.equipmentName.toLowerCase().includes(query)) ||
      (t.driverName && t.driverName.toLowerCase().includes(query)) ||
      (t.deliveryDriverName && t.deliveryDriverName.toLowerCase().includes(query)) ||
      (t.supplierOrSource && t.supplierOrSource.toLowerCase().includes(query)) ||
      (t.voucherNumber && t.voucherNumber.toLowerCase().includes(query)) ||
      (t.invoiceNumber && t.invoiceNumber.toLowerCase().includes(query)) ||
      t.date.includes(query)
    );
  });

  // Sort filtered transactions
  const sortedAndFilteredTransactions = [...filteredTransactions].sort((a, b) => {
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

  // Filtered totals
  const filteredReceived = filteredTransactions
    .filter(t => t.type === 'receive')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);

  const filteredConsumed = filteredTransactions
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + (t.quantityLiters || 0), 0);

  const filteredCost = filteredTransactions
    .reduce((acc, t) => acc + (t.totalCost || 0), 0);

  const dateFilterSummaryText = [
    startDate ? `من: ${startDate}` : null,
    endDate ? `إلى: ${endDate}` : null,
    selectedEquipmentFilter !== 'all' ? `المعدة: ${selectedEquipmentFilter}` : null,
    selectedDriverFilter !== 'all' ? `السائق: ${selectedDriverFilter}` : null,
    searchTerm ? `بحث: "${searchTerm}"` : null
  ].filter(Boolean).join(' | ');

  const currencySymbol = projectInfo?.currency || 'ر.ي';

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-950/80 font-bold text-xs">
            <Fuel className="w-5 h-5 stroke-[2.5]" />
            <span>نظام التحكم بالوقود والمخزون التشغيلي</span>
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight">
            مخزن الديزل ومتابعة التوريد والاستهلاك
          </h2>
          <p className="text-slate-900/80 text-xs font-semibold mt-1">
            تسجيل حركات الشحن الوارد وصرف الديزل اليومي مع أرقام السندات اليدوية لكل شحنة وتعبئة
          </p>
        </div>

        {/* Current Stock Level Badge */}
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg border border-slate-800 text-center min-w-56">
          <span className="text-xs text-slate-400 font-bold block">رصيد الديزل الحالي بالخزان:</span>
          <div className="text-3xl font-black text-amber-400 my-1">
            {currentBalance.toLocaleString('ar-SA')} <span className="text-xs font-normal text-slate-300">لتر</span>
          </div>
          {isLowStock && (
            <div className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>تنبيه: المخزون منخفض!</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons & Ledger Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenModal('receive')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل وارد (سند استلام شحنة ديزل)</span>
          </button>

          <button
            onClick={() => handleOpenModal('consume')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
          >
            <MinusCircle className="w-4 h-4" />
            <span>تسجيل صادر (سند صرف للمعدة)</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportDieselToExcel(filteredTransactions)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => exportDieselToPDF(
              filteredTransactions, 
              projectInfo, 
              activeTypeFilter === 'consume' 
                ? 'كشف سندات وتقارير صرف الديزل للمعدات' 
                : activeTypeFilter === 'receive' 
                  ? 'كشف سندات وشحنات استلام الديزل الوارد' 
                  : 'كشف وحركات مخزن وقود الديزل الإجمالي', 
              dateFilterSummaryText || undefined
            )}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>تصدير PDF</span>
          </button>
        </div>
      </div>

      {/* Advanced Search & Filter Bar for Diesel Warehouse */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-4">
        
        {/* Filter Title & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500 stroke-[2.5]" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              شريط البحث والتصفية المتقدم لحركة الديزل
            </h3>
            {hasActiveFilters && (
              <span className="bg-amber-500/20 text-amber-800 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                فلاتر نشطة
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetAllFilters}
              className="text-amber-800 hover:text-amber-950 font-extrabold flex items-center gap-1.5 text-xs bg-white hover:bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-300 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>إعادة ضبط كافة الفلاتر</span>
            </button>
          )}
        </div>

        {/* Search Input & Movement Type Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="relative md:col-span-7">
            <Search className="w-4.5 h-4.5 text-slate-400 absolute right-3.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالرقم اليدوي، الفاتورة، المعدة، السائق، أو المورد..."
              className="w-full bg-white border border-slate-300 rounded-xl pr-10 pl-9 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
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

          {/* Type Filter Buttons */}
          <div className="md:col-span-5 flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all text-center ${
                activeTypeFilter === 'all' 
                  ? 'bg-white text-slate-900 shadow-xs font-black' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTypeFilter('consume')}
              className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
                activeTypeFilter === 'consume' 
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>صرف ({transactions.filter(t => t.type === 'consume').length})</span>
            </button>
            <button
              onClick={() => setActiveTypeFilter('receive')}
              className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 ${
                activeTypeFilter === 'receive' 
                  ? 'bg-emerald-600 text-white shadow-xs font-black' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>وارد ({transactions.filter(t => t.type === 'receive').length})</span>
            </button>
          </div>
        </div>

        {/* Detailed Controls Grid: Date Range, Equipment, Driver & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Date From */}
          <div>
            <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>من تاريخ:</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>إلى تاريخ:</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          {/* Equipment Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3 text-amber-500" />
              <span>المعدة المستفيدة:</span>
            </label>
            <select
              value={selectedEquipmentFilter}
              onChange={(e) => setSelectedEquipmentFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            >
              <option value="all">كافة المعدات ({uniqueEquipmentInTransactions.length})</option>
              {uniqueEquipmentInTransactions.map((eq, i) => (
                <option key={i} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          {/* Driver Filter */}
          <div>
            <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-amber-500" />
              <span>السائق / المستلم:</span>
            </label>
            <select
              value={selectedDriverFilter}
              onChange={(e) => setSelectedDriverFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            >
              <option value="all">كافة السائقين ({uniqueDriversInTransactions.length})</option>
              {uniqueDriversInTransactions.map((dr, i) => (
                <option key={i} value={dr}>{dr}</option>
              ))}
            </select>
          </div>

          {/* Sort Control Dropdown */}
          <div>
            <label className="text-[10px] font-black text-slate-600 block mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-amber-500" />
              <span>ترتيب القائمة:</span>
            </label>
            <div className="flex gap-1.5">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as DieselSortField)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              >
                <option value="date">التاريخ</option>
                <option value="type">نوع الحركة</option>
                <option value="voucherNumber">رقم السند اليدوي</option>
                <option value="equipmentName">المعدة / الجهة</option>
                <option value="driverName">السائق / المستلم</option>
                <option value="supplierOrSource">المورد / المصدر</option>
                <option value="quantityLiters">الكمية (لتر)</option>
                <option value="totalCost">التكلفة الإجمالية</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 shadow-2xs flex items-center gap-1 whitespace-nowrap"
                title="تغيير اتجاه الترتيب (تصاعدي / تنازلي)"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

        </div>

        {/* Date Presets & Filter Summary Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2.5 border-t border-slate-200/80 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">اختصارات زمنية:</span>
            <button
              onClick={handleSetThisMonth}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-amber-100 transition-colors cursor-pointer text-[11px] font-bold shadow-2xs"
            >
              هذا الشهر
            </button>
            <button
              onClick={handleSetLastMonth}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-amber-100 transition-colors cursor-pointer text-[11px] font-bold shadow-2xs"
            >
              الشهر الماضي
            </button>
          </div>

          {/* Summary Stats Badge */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold bg-white px-3.5 py-1.5 border border-slate-200 rounded-xl shadow-2xs text-slate-700">
            <span className="text-slate-600">السجلات: <strong className="text-slate-900 font-black">{filteredTransactions.length}</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700">وارد: <strong>{filteredReceived.toLocaleString('ar-SA')} لتر</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700">صادر: <strong>{filteredConsumed.toLocaleString('ar-SA')} لتر</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-900">التكلفة: <strong>{formatCurrency(filteredCost, currencySymbol)}</strong></span>
          </div>

        </div>

      </div>

      {/* Transactions History Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs sm:text-sm">
            <thead className="bg-slate-900 text-white font-bold select-none">
              <tr>
                <th onClick={() => handleSort('date')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>التاريخ</span>
                    {renderSortIcon('date')}
                  </div>
                </th>
                <th onClick={() => handleSort('type')} className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span>نوع الحركة</span>
                    {renderSortIcon('type')}
                  </div>
                </th>
                <th onClick={() => handleSort('voucherNumber')} className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span>رقم السند اليدوي</span>
                    {renderSortIcon('voucherNumber')}
                  </div>
                </th>
                <th onClick={() => handleSort('equipmentName')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>الجهة / المعدة المستفيدة</span>
                    {renderSortIcon('equipmentName')}
                  </div>
                </th>
                <th onClick={() => handleSort('driverName')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>المستلم (أمين المخزن / السائق)</span>
                    {renderSortIcon('driverName')}
                  </div>
                </th>
                <th onClick={() => handleSort('supplierOrSource')} className="p-3.5 cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-1">
                    <span>المورد / المصدر</span>
                    {renderSortIcon('supplierOrSource')}
                  </div>
                </th>
                <th onClick={() => handleSort('quantityLiters')} className="p-3.5 text-center cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-center gap-1">
                    <span>الكمية (لتر)</span>
                    {renderSortIcon('quantityLiters')}
                  </div>
                </th>
                <th onClick={() => handleSort('totalCost')} className="p-3.5 text-left cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center justify-end gap-1">
                    <span>التكلفة الإجمالية ({currencySymbol})</span>
                    {renderSortIcon('totalCost')}
                  </div>
                </th>
                <th className="p-3.5 text-center">خيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedAndFilteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                    لا توجد حركات ديزل مطابقة للفلترة والحركة المحددة
                  </td>
                </tr>
              ) : (
                sortedAndFilteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900">{t.date}</td>
                    <td className="p-3.5 text-center">
                      {t.type === 'receive' ? (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1">
                          <ArrowDownRight className="w-3.5 h-3.5" /> وارد (استلام)
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-lg text-xs inline-flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> صادر (للمعدة)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {t.voucherNumber ? (
                          <span className="bg-slate-100 text-slate-900 border border-slate-300 px-2 py-0.5 rounded font-mono font-black text-xs inline-flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span>سند: {t.voucherNumber}</span>
                          </span>
                        ) : null}
                        {t.invoiceNumber ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold text-[11px] inline-flex items-center gap-1">
                            <span>فاتورة: {t.invoiceNumber}</span>
                          </span>
                        ) : null}
                        {!t.voucherNumber && !t.invoiceNumber && (
                          <span className="text-slate-300 font-normal">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">
                      {t.type === 'receive' ? (
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                          <span>{t.equipmentName || 'مخزن المشروع الرئيسي'}</span>
                        </span>
                      ) : (
                        <span className="text-slate-900 font-black">{t.equipmentName || '-'}</span>
                      )}
                    </td>
                    <td className="p-3.5 font-medium">
                      {t.type === 'receive' ? (
                        <div className="flex flex-col gap-0.5">
                          {t.driverName && (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                              <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>مستلم: {t.driverName}</span>
                            </span>
                          )}
                          {t.deliveryDriverName && (
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 text-xs">
                              <Truck className="w-3 h-3 text-blue-600 shrink-0" />
                              <span>سائق الناقلة: {t.deliveryDriverName}</span>
                            </span>
                          )}
                          {!t.driverName && !t.deliveryDriverName && (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      ) : (
                        t.driverName ? (
                          <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.driverName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-600">
                      {t.type === 'receive' ? (t.supplierOrSource || 'محطة التوريد') : 'مخزن المشروع'}
                    </td>
                    <td className="p-3.5 text-center font-black text-slate-900">
                      {t.quantityLiters.toLocaleString('ar-SA')} لتر
                    </td>
                    <td className="p-3.5 text-left font-extrabold text-slate-900">
                      {formatCurrency(t.totalCost, currencySymbol)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="حذف الحركة"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Button (FAB) for Mobile & Fast Fueling */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col items-end gap-3 no-print">
        {/* FAB Quick Action Menu */}
        {fabMenuOpen && (
          <div className="flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 min-w-60 dir-rtl text-right">
            <div className="text-[11px] font-black text-amber-400 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>عمليات الوقود السريعة</span>
              </span>
              <button 
                onClick={() => setFabMenuOpen(false)} 
                className="text-slate-400 hover:text-white p-0.5 rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                setFabMenuOpen(false);
                handleOpenQuickModal('consume');
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="bg-slate-950/20 p-1.5 rounded-lg">
                  <Fuel className="w-4 h-4 text-slate-950" />
                </div>
                <div className="text-right">
                  <span className="block leading-tight font-extrabold">تعبئة وقود سريعة</span>
                  <span className="text-[10px] text-slate-900/80 font-bold block">صرف ديزل فوري للمعدة</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              onClick={() => {
                setFabMenuOpen(false);
                handleOpenQuickModal('receive');
              }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/20 p-1.5 rounded-lg">
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-right">
                  <span className="block leading-tight text-white font-extrabold">سند شحنة واردة</span>
                  <span className="text-[10px] text-emerald-400/80 font-bold block">تفريغ بوزة / ناقلة في الخزان</span>
                </div>
              </div>
              <ArrowDownRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        )}

        {/* Main Floating Action Button (FAB) */}
        <button
          onClick={() => handleOpenQuickModal('consume')}
          onContextMenu={(e) => {
            e.preventDefault();
            setFabMenuOpen(prev => !prev);
          }}
          className="group relative bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 py-3.5 rounded-full shadow-2xl border-2 border-amber-200 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-amber-500/30"
          title="تعبئة ديزل سريعة (انقر للفتح، انقر بالزر الأيمن الخيارات)"
        >
          <div className="relative flex items-center justify-center">
            <Fuel className="w-6 h-6 stroke-[2.5] text-slate-950 group-hover:rotate-12 transition-transform" />
            <Zap className="w-3.5 h-3.5 text-slate-950 absolute -top-1 -right-1 fill-amber-300" />
          </div>
          <span className="text-xs font-black tracking-tight whitespace-nowrap hidden sm:inline-block">
            تعبئة وقود سريعة +
          </span>
          <span className="sm:hidden text-xs font-black tracking-tight">
            تعبئة +
          </span>
        </button>
      </div>

      {/* Transaction Modal (Quick Mobile-Optimized Refueling Modal) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto dir-rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="bg-amber-500/10 p-2 rounded-xl text-amber-600 border border-amber-500/20">
                  <Fuel className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight">
                    {modalType === 'receive' ? 'تسجيل شحنة ديزل واردة' : 'نموذج تعبئة وقود سريع للمعدة'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    {modalType === 'receive' ? 'تفريغ الوقود الوارد في خزان المحطة/المشروع' : 'صرف ديزل مباشر مع تعيين الكمية والمعدة برقم سند'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Mode Switcher Inside Modal */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-black">
              <button
                type="button"
                onClick={() => setModalType('consume')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalType === 'consume'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>صرف وتعبئة لمعدة</span>
              </button>

              <button
                type="button"
                onClick={() => setModalType('receive')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  modalType === 'receive'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>استلام شحنة واردة</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Quick Equipment Selector Chips (for Consume mode) */}
              {modalType === 'consume' && equipmentList.length > 0 && (
                <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/80">
                  <div className="flex items-center justify-between text-[11px] font-black text-amber-900">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                      <span>اختيار سريع للمعدة المستفيدة:</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-normal">انقر للاختيار والتعبئة</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
                    {equipmentList.map(eq => {
                      const isSelected = equipmentName === eq.name;
                      return (
                        <button
                          key={eq.id}
                          type="button"
                          onClick={() => handleSelectEquipmentQuick(eq)}
                          className={`px-3 py-2 rounded-xl border text-xs font-extrabold whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100/50'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0" />}
                          <span>{eq.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date & Voucher Number Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تاريخ الحركة:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <FileText className={`w-3.5 h-3.5 ${modalType === 'receive' ? 'text-emerald-600' : 'text-amber-600'}`} />
                      <span>رقم السند اليدوي:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => generateAutoVoucher(modalType)}
                      className="text-[10px] bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 font-extrabold px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-600" />
                      <span>توليد تلقائي</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    placeholder={modalType === 'receive' ? 'مثال: REC-901' : 'مثال: PAY-104'}
                    className={`w-full border rounded-xl p-2.5 font-bold text-slate-900 ${
                      modalType === 'receive' 
                        ? 'bg-emerald-50/50 border-emerald-300 focus:ring-2 focus:ring-emerald-400' 
                        : 'bg-amber-50/50 border-amber-300 focus:ring-2 focus:ring-amber-400'
                    }`}
                  />
                </div>
              </div>

              {/* Invoice Number if Receive */}
              {modalType === 'receive' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>رقم الفاتورة / أمر التوريد (إن وجد):</span>
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="مثال: INV-88214"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              )}

              {/* Quantity Liters with Quick Presets */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-slate-800 text-xs">
                    كمية الوقود (باللتر):
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    المجموع: <strong className="text-amber-600">{quantityLiters} لتر</strong>
                  </span>
                </div>

                {/* Quick Presets Buttons */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[50, 100, 150, 200, 250, 300].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantityLiters(preset)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        quantityLiters === preset
                          ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset === 300 ? '300L (فل)' : `${preset}L`}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[11px]">الكمية يدوياً (لتر):</label>
                    <input
                      type="number"
                      value={quantityLiters}
                      onChange={(e) => setQuantityLiters(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-black text-sm text-slate-900"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1 text-[11px]">سعر اللتر ({currencySymbol}):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pricePerLiter}
                      onChange={(e) => setPricePerLiter(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-black text-slate-900"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Receive specific inputs vs Consume inputs */}
              {modalType === 'receive' ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>الجهة المستلمة دائماً: <strong>مخزن المشروع الرئيسي</strong>.</span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">وارد من (الجهة الموردة / المحطة):</label>
                    <input
                      type="text"
                      value={supplierOrSource}
                      onChange={(e) => setSupplierOrSource(e.target.value)}
                      placeholder="مثال: شركة النفط - محطة السهل"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-blue-600" />
                        <span>سائق الناقلة:</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryDriverName}
                        onChange={(e) => setDeliveryDriverName(e.target.value)}
                        placeholder="مثال: سالم أحمد"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>مستلم الشحنة بالمشروع:</span>
                      </label>
                      <input
                        type="text"
                        value={storekeeperName}
                        onChange={(e) => setStorekeeperName(e.target.value)}
                        placeholder="مثال: علي السقاف"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-bold"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">المعدة المستفيدة:</label>
                      <select
                        value={equipmentName}
                        onChange={(e) => {
                          const name = e.target.value;
                          setEquipmentName(name);
                          const matched = equipmentList.find(eq => eq.name === name);
                          if (matched && matched.driverName) {
                            setDriverName(matched.driverName);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold cursor-pointer text-slate-900"
                      >
                        {equipmentList.map((eq) => (
                          <option key={eq.id} value={eq.name}>{eq.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">السائق / المشغل:</label>
                      <select
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold cursor-pointer text-slate-900"
                      >
                        {driversList.map((dr) => (
                          <option key={dr.id} value={dr.name}>{dr.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes & Quick Note Tag Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">ملاحظات الحركة:</label>
                  <div className="flex gap-1">
                    {['بداية الوردية', 'تعبئة فل', 'وردية طوارئ'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleAddNoteTag(tag)}
                        className="text-[10px] font-bold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                  placeholder="ملاحظات إضافية بخصوص التعبئة أو سند الصرف..."
                />
              </div>

              {/* Total Cost Display */}
              <div className="bg-slate-950 text-white p-3.5 rounded-2xl flex items-center justify-between font-black border border-slate-800 shadow-md">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-300">التكلفة الإجمالية للحركة:</span>
                </div>
                <span className="text-amber-400 text-base">
                  {(quantityLiters * pricePerLiter).toFixed(2)} {currencySymbol}
                </span>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>حفظ حركة التعبئة فوراً</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
