export type ContractType = 'daily' | 'salary' | 'hourly' | 'meter' | 'monthly' | '';

export interface WorkPeriod {
  id: string;
  periodName: 'الفترة الأولى' | 'الفترة الثانية' | 'الفترة الثالثة';
  startTime: string;
  endTime: string;
  durationHours: number;
  breakMinutes: number;
  netHours: number;
  workLocation?: string;
  workItem?: string;
  notes?: string;
}

export interface ProjectItem {
  id: string;
  name: string; // اسم بند العمل (مثال: أعمال الحفريات، أعمال الردم، صب الخرسانات)
  code?: string; // رمز/رقم البند (اختياري)
  estimatedBudget?: number; // الميزانية التقديرية للبند (اختياري)
  unit?: string; // وحدة القياس (م3، م2، م.ط، كجم، مقطوعية، إلخ - اختياري)
  targetQuantity?: number; // الكمية المستهدفة (اختياري)
  unitPrice?: number; // فئة البند / السعر المعتمد للوحدة (اختياري)
  notes?: string;
}

export interface OperationalCosts {
  dieselLiters: number;
  dieselCostPerLiter: number;
  dieselTotalCost: number;
  dieselOnLessor?: boolean; // هل تكلفة الديزل مقيّدة على الشركة المؤجرة؟ (اختياري)
  dieselNotes?: string;
  dieselAttachment?: string; // Base64 image string of receipt/voucher

  oilCost: number;
  hydraulicOilCost?: number; // زيت الهيدروليك (دائماً على الشركة المؤجرة)
  hydraulicOilNotes?: string;
  hydraulicOilAttachment?: string;

  engineOilCost?: number; // زيت المكينة
  engineOilOnLessor?: boolean; // هل زيت المكينة مقيّد على الشركة المؤجرة؟ (اختياري)
  engineOilNotes?: string;
  engineOilAttachment?: string;

  greaseCost: number;
  greaseNotes?: string;
  greaseAttachment?: string;

  sparePartsCost: number;
  sparePartsNotes?: string;
  sparePartsAttachment?: string;

  maintenanceCost: number;
  maintenanceNotes?: string;
  maintenanceAttachment?: string;

  driverAdvanceNotes?: string;
  driverAdvanceAttachment?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  managerName: string;
  companyName: string;
  phone: string;
  code?: string;
  budget?: number; // الميزانية المرصودة للمشروع
  currency?: string; // عملة المشروع (ر.ي, ر.س, $, الخ)
  defaultDieselPrice?: number; // سعر لتر الديزل الافتراضي للمشروع
  projectItems?: ProjectItem[]; // بنود وتقسيمات تكاليف المشروع الاختيارية
  status?: 'active' | 'completed' | 'archived';
  createdAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO date string e.g. 2026-08-10T15:30:00.000Z
  action: 'create' | 'update' | 'signature' | 'status';
  user: string; // اسم المستخدم الذي قام بالعملية
  details: string; // تفاصيل العملية أو التغيير
}

export interface WorkReport {
  id: string;
  projectId?: string;
  reportNumber: string;
  date: string;
  contractType: ContractType;
  companyName: string;
  equipmentName: string;
  equipmentRegNumber: string;
  driverName: string;
  driverPhone: string;
  driverSalaryType: string;
  
  // Hours & Metrics
  periods: WorkPeriod[];
  totalNetHours: number;
  ratePerUnit: number; // Daily rate, Hourly rate, Meter rate, etc.
  
  // Meter / Counter readings
  meterStart: number;
  meterEnd: number;
  quantityMeters: number; // For meter-based contract
  
  // Financials
  grossAmount: number;
  costs: OperationalCosts;
  driverAdvance: number; // السلفة اليومية المقيدة على الشركة
  netCompanyDue: number; // الصافي المستحق من الشركة
  
  sitePhotos?: string[]; // Base64 image strings or URLs
  driverSignature?: string; // Base64 image string
  supervisorSignature?: string; // Base64 image string
  supervisorName?: string; // اسم المشرف / المهندس
  workLocation?: string;
  workItem?: string;
  completedQuantity?: number; // كمية الإنجاز المنفذة للبند
  itemUnit?: string; // وحدة قياس كمية الإنجاز
  notes?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  auditLogs?: AuditLogEntry[];
}

export interface DieselTransaction {
  id: string;
  projectId?: string;
  voucherNumber?: string; // رقم سند الصرف اليدوي أو رقم سند الاستلام
  invoiceNumber?: string; // رقم الفاتورة / رقم الصرف المخزني للمورد
  deliveryDriverName?: string; // اسم سائق الناقلة التي أوصلت الشحنة للمشروع
  date: string;
  type: 'receive' | 'consume'; // استلام من المورد / صرف لمعدة
  quantityLiters: number;
  pricePerLiter: number;
  totalCost: number;
  equipmentName?: string;
  driverName?: string;
  supplierOrSource?: string;
  workLocation?: string;
  workItem?: string;
  notes?: string;
  createdAt: string;
  isLessorExpense?: boolean; // هل الشحنة / الصرف مقيّد على الشركة المؤجرة؟ (اختياري)
}

export interface CompanyPayment {
  id: string;
  projectId?: string;
  companyName: string;
  date: string;
  amount: number;
  paymentMethod: 'حوالة بنكية' | 'نقدي' | 'شيك' | 'سند صرف';
  referenceNumber?: string; // رقم الحوالة / السند / الشيك
  workLocation?: string;
  workItem?: string;
  notes?: string;
  createdAt: string;
}

export interface Equipment {
  id: string;
  projectId?: string;
  name: string;
  type: string; // حفار، بوكلين، قلاب، شاول، رافعة
  regNumber: string;
  companyName: string;
  status: 'active' | 'maintenance' | 'idle';
  imageUrl?: string; // صورة المعدة
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  meterRate?: number;
  driverName: string;
  createdAt: string;
  defaultContractType?: ContractType;
  // Periodic Maintenance fields
  maintenanceDueDate?: string; // YYYY-MM-DD
  maintenanceTargetHours?: number; // target cumulative hours for next maintenance
  maintenanceIntervalHours?: number; // maintenance interval in hours (e.g. 250h)
  maintenanceNotes?: string; // notes or tasks for maintenance
  lastMaintenanceDate?: string; // YYYY-MM-DD
  lastMaintenanceHours?: number; // hours reading at last maintenance
}

export interface Company {
  id: string;
  projectId?: string;
  name: string;
  contactPerson: string;
  phone: string;
  address?: string;
  totalWorkAmount: number;
  totalAdvances: number;
  totalPaid: number;
  remainingBalance: number;
}

export interface Driver {
  id: string;
  projectId?: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
  salaryType: 'يومية' | 'شهري' | 'بالساعة';
  defaultRate: number;
  assignedEquipment?: string;
}

export interface ProjectInfo {
  name: string;
  location: string;
  managerName: string;
  companyName: string;
  phone: string;
  budget?: number;
  currency?: string;
  defaultDieselPrice?: number;
  projectItems?: ProjectItem[];
}

export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'YER', symbol: 'ر.ي', name: 'الريال اليمني (ر.ي)' },
  { code: 'SAR', symbol: 'ر.س', name: 'الريال السعودي (ر.س)' },
  { code: 'USD', symbol: '$', name: 'الدولار الأمريكي ($)' },
  { code: 'AED', symbol: 'د.إ', name: 'الدرهم الإماراتي (د.إ)' },
  { code: 'OMR', symbol: 'ر.ع', name: 'الريال العماني (ر.ع)' },
  { code: 'KWD', symbol: 'د.ك', name: 'الدينار الكويتي (د.ك)' },
  { code: 'EGP', symbol: 'ج.م', name: 'الجنيه المصري (ج.م)' },
  { code: 'QAR', symbol: 'ر.ق', name: 'الريال القطري (ر.ق)' },
  { code: 'BHD', symbol: 'د.ب', name: 'الدينار البحريني (د.ب)' },
  { code: 'EUR', symbol: '€', name: 'اليورو (€)' },
];
