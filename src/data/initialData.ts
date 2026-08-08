import { WorkReport, DieselTransaction, Equipment, Company, Driver, Project, ProjectInfo, CompanyPayment } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "مشروع تطوير البنية التحتية - المجمع التجاري",
    location: "الرياض - حي النرجس",
    managerName: "م. أحمد الشمري",
    companyName: "شركة البناء المتطور للمقاولات",
    phone: "0501234567",
    code: "PRJ-RYD-01",
    budget: 250000,
    currency: "ر.ي",
    defaultDieselPrice: 2.3,
    status: "active",
    createdAt: "2026-01-01",
    projectItems: [
      { id: "item-101", name: "أعمال الحفريات والترحيل", code: "ITEM-01", estimatedBudget: 80000, unit: "م3", targetQuantity: 5000 },
      { id: "item-102", name: "أعمال التسوية والردميات", code: "ITEM-02", estimatedBudget: 60000, unit: "م3", targetQuantity: 3500 },
      { id: "item-103", name: "طبقة الأساس (البيس كورس)", code: "ITEM-03", estimatedBudget: 70000, unit: "م2", targetQuantity: 4000 },
      { id: "item-104", name: "صب الخرسانات والإنشاءات", code: "ITEM-04", estimatedBudget: 40000, unit: "م3", targetQuantity: 800 }
    ]
  },
  {
    id: "proj-2",
    name: "مشروع إنشاء الأبراج السكنية - المرحلة الأولى",
    location: "جدة - حي الشاطئ",
    managerName: "م. خالد الغامدي",
    companyName: "شركة المقاولون العرب للإنشاءات",
    phone: "0559988776",
    code: "PRJ-JED-02",
    budget: 450000,
    currency: "ر.س",
    defaultDieselPrice: 2.3,
    status: "active",
    createdAt: "2026-02-15",
    projectItems: [
      { id: "item-201", name: "حفر وتدشين القواعد الأساسية", code: "ITEM-A1", estimatedBudget: 150000, unit: "م3", targetQuantity: 10000 },
      { id: "item-202", name: "صب الهيكل الخرساني للأبراج", code: "ITEM-A2", estimatedBudget: 200000, unit: "م3", targetQuantity: 3000 },
      { id: "item-203", name: "أعمال الترديم والتشطيبات الخارجية", code: "ITEM-A3", estimatedBudget: 100000, unit: "م2", targetQuantity: 8000 }
    ]
  }
];

export const INITIAL_PROJECT_INFO: ProjectInfo = {
  name: INITIAL_PROJECTS[0].name,
  location: INITIAL_PROJECTS[0].location,
  managerName: INITIAL_PROJECTS[0].managerName,
  companyName: INITIAL_PROJECTS[0].companyName,
  phone: INITIAL_PROJECTS[0].phone,
  budget: INITIAL_PROJECTS[0].budget,
  currency: INITIAL_PROJECTS[0].currency || "ر.ي",
  defaultDieselPrice: INITIAL_PROJECTS[0].defaultDieselPrice || 2.3,
  projectItems: INITIAL_PROJECTS[0].projectItems || []
};

export const INITIAL_COMPANIES: Company[] = [
  {
    id: "c-1",
    projectId: "proj-1",
    name: "شركة أعمار الخليج للمقاولات",
    contactPerson: "سعود القحطاني",
    phone: "0551122334",
    address: "الرياض - طريق الملك فهد",
    totalWorkAmount: 48500,
    totalAdvances: 3500,
    totalPaid: 30000,
    remainingBalance: 15000
  },
  {
    id: "c-2",
    projectId: "proj-1",
    name: "مؤسسة الطرق الحديثة",
    contactPerson: "خالد المطيري",
    phone: "0569988776",
    address: "الرياض - حي الملز",
    totalWorkAmount: 32000,
    totalAdvances: 2200,
    totalPaid: 20000,
    remainingBalance: 9800
  },
  {
    id: "c-3",
    projectId: "proj-2",
    name: "شركة الرؤية للتطوير العقاري",
    contactPerson: "عمر الدوسري",
    phone: "0503344556",
    address: "جدة - طريق المدينة",
    totalWorkAmount: 64000,
    totalAdvances: 5000,
    totalPaid: 45000,
    remainingBalance: 14000
  }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: "eq-1",
    projectId: "proj-1",
    name: "بوكلين كوماتسو PC300",
    type: "بوكلين (حفار ثقيل)",
    regNumber: "أ ب ج 1234",
    companyName: "شركة أعمار الخليج للمقاولات",
    status: "active",
    hourlyRate: 180,
    dailyRate: 1400,
    monthlyRate: 35000,
    meterRate: 45,
    driverName: "محمد علي عبد الله",
    createdAt: "2026-01-10",
    maintenanceDueDate: "2026-07-28",
    maintenanceTargetHours: 10,
    maintenanceIntervalHours: 250,
    maintenanceNotes: "صيانة دورية - تغيير زيت الهيدروليك وفلاتر الوقود",
    lastMaintenanceDate: "2026-06-15",
    lastMaintenanceHours: 0
  },
  {
    id: "eq-2",
    projectId: "proj-1",
    name: "شيول كاترپيلار 966",
    type: "شيول (رافع أتربة)",
    regNumber: "د هـ و 5678",
    companyName: "مؤسسة الطرق الحديثة",
    status: "active",
    hourlyRate: 150,
    dailyRate: 1200,
    monthlyRate: 28000,
    meterRate: 35,
    driverName: "إبراهيم الخالد",
    createdAt: "2026-01-12",
    maintenanceDueDate: "2026-07-30",
    maintenanceTargetHours: 15,
    maintenanceIntervalHours: 200,
    maintenanceNotes: "فحص وتجريس التشحيم وفحص منظومة الفرامل والصليبات",
    lastMaintenanceDate: "2026-06-20",
    lastMaintenanceHours: 0
  },
  {
    id: "eq-3",
    projectId: "proj-1",
    name: "قلاب مرسيدس آكتروس 3240",
    type: "قلاب (شاحنة نقل)",
    regNumber: "س ص ع 9012",
    companyName: "شركة أعمار الخليج للمقاولات",
    status: "active",
    hourlyRate: 120,
    dailyRate: 950,
    monthlyRate: 22000,
    meterRate: 25,
    driverName: "عثمان طارق",
    createdAt: "2026-01-15",
    maintenanceDueDate: "2026-08-20",
    maintenanceTargetHours: 250,
    maintenanceIntervalHours: 300,
    maintenanceNotes: "صيانة شاملة وتغيير سيور وفلاتر الهواء والوقود",
    lastMaintenanceDate: "2026-05-10",
    lastMaintenanceHours: 0
  },
  {
    id: "eq-4",
    projectId: "proj-2",
    name: "جريدر كات 140K",
    type: "جريدر (تسوية طرق)",
    regNumber: "ر ز س 3456",
    companyName: "شركة الرؤية للتطوير العقاري",
    status: "active",
    hourlyRate: 200,
    dailyRate: 1600,
    monthlyRate: 38000,
    meterRate: 50,
    driverName: "عبد الرحمن العتيبي",
    createdAt: "2026-01-20",
    maintenanceDueDate: "2026-07-20",
    maintenanceTargetHours: 5,
    maintenanceIntervalHours: 150,
    maintenanceNotes: "معايرة السكينة وفحص زيوت الجير بوكس والدفرنس",
    lastMaintenanceDate: "2026-05-01",
    lastMaintenanceHours: 0
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: "dr-1",
    projectId: "proj-1",
    name: "محمد علي عبد الله",
    phone: "0541234567",
    licenseNumber: "LIC-882910",
    status: "active",
    salaryType: "يومية",
    defaultRate: 150,
    assignedEquipment: "بوكلين كوماتسو PC300"
  },
  {
    id: "dr-2",
    projectId: "proj-1",
    name: "إبراهيم الخالد",
    phone: "0547654321",
    licenseNumber: "LIC-993821",
    status: "active",
    salaryType: "يومية",
    defaultRate: 140,
    assignedEquipment: "شيول كاترپيلار 966"
  },
  {
    id: "dr-3",
    projectId: "proj-1",
    name: "عثمان طارق",
    phone: "0533322110",
    licenseNumber: "LIC-112233",
    status: "active",
    salaryType: "شهري",
    defaultRate: 4500,
    assignedEquipment: "قلاب مرسيدس آكتروس 3240"
  },
  {
    id: "dr-4",
    projectId: "proj-2",
    name: "عبد الرحمن العتيبي",
    phone: "0508877665",
    licenseNumber: "LIC-445566",
    status: "active",
    salaryType: "بالساعة",
    defaultRate: 25,
    assignedEquipment: "جريدر كات 140K"
  }
];

export const INITIAL_DIESEL_TRANSACTIONS: DieselTransaction[] = [
  {
    id: "ds-1",
    projectId: "proj-1",
    voucherNumber: "REC-901",
    invoiceNumber: "INV-5501",
    date: "2026-07-20",
    type: "receive",
    quantityLiters: 5000,
    pricePerLiter: 2.3,
    totalCost: 11500,
    equipmentName: "مخزن المشروع الرئيسي",
    driverName: "أمين المخزن (مدير المخزن)",
    deliveryDriverName: "سالم أحمد العتيبي (سائق ناقلة الوقود)",
    supplierOrSource: "محطة السهل العربي - توريد خزان رئيسي",
    notes: "استلام شحنة ديزل جديدة وتفريغها في الخزان الرئيسي للمشروع الأول",
    createdAt: "2026-07-20T08:00:00Z"
  },
  {
    id: "ds-2",
    projectId: "proj-1",
    voucherNumber: "PAY-104",
    date: "2026-07-21",
    type: "consume",
    quantityLiters: 180,
    pricePerLiter: 2.3,
    totalCost: 414,
    equipmentName: "بوكلين كوماتسو PC300",
    driverName: "محمد علي عبد الله",
    notes: "تعبئة بداية وردية العمل الأولى",
    createdAt: "2026-07-21T06:30:00Z"
  },
  {
    id: "ds-3",
    projectId: "proj-1",
    voucherNumber: "PAY-105",
    date: "2026-07-22",
    type: "consume",
    quantityLiters: 150,
    pricePerLiter: 2.3,
    totalCost: 345,
    equipmentName: "شيول كاترپيلار 966",
    driverName: "إبراهيم الخالد",
    notes: "صرف لزوم أعمال الحفر والتسوية",
    createdAt: "2026-07-22T07:00:00Z"
  },
  {
    id: "ds-4",
    projectId: "proj-2",
    voucherNumber: "REC-902",
    invoiceNumber: "INV-5508",
    date: "2026-07-23",
    type: "receive",
    quantityLiters: 4000,
    pricePerLiter: 2.3,
    totalCost: 9200,
    equipmentName: "مخزن المشروع الرئيسي",
    driverName: "أمين المخزن (مدير المخزن)",
    deliveryDriverName: "عبدالرحمن البقمي (سائق الوايت)",
    supplierOrSource: "محطة بترول الساحل - توريد جدة",
    notes: "تغذية خزان المشروع الثاني في الشاطئ",
    createdAt: "2026-07-23T10:15:00Z"
  },
  {
    id: "ds-5",
    projectId: "proj-2",
    voucherNumber: "PAY-201",
    date: "2026-07-24",
    type: "consume",
    quantityLiters: 200,
    pricePerLiter: 2.3,
    totalCost: 460,
    equipmentName: "جريدر كات 140K",
    driverName: "عبد الرحمن العتيبي",
    notes: "صرف لعمليات تمهيد الموقع العام بالأبراج",
    createdAt: "2026-07-24T06:00:00Z"
  }
];

export const INITIAL_WORK_REPORTS: WorkReport[] = [
  {
    id: "wr-1001",
    projectId: "proj-1",
    reportNumber: "REP-2026-001",
    date: "2026-07-21",
    contractType: "hourly",
    companyName: "شركة أعمار الخليج للمقاولات",
    equipmentName: "بوكلين كوماتسو PC300",
    equipmentRegNumber: "أ ب ج 1234",
    driverName: "محمد علي عبد الله",
    driverPhone: "0541234567",
    driverSalaryType: "يومية",
    periods: [
      {
        id: "p-1",
        periodName: "الفترة الأولى",
        startTime: "07:00",
        endTime: "12:00",
        durationHours: 5,
        breakMinutes: 0,
        netHours: 5,
        notes: "أعمال حفر الأساسات"
      },
      {
        id: "p-2",
        periodName: "الفترة الثانية",
        startTime: "13:00",
        endTime: "17:00",
        durationHours: 4,
        breakMinutes: 0,
        netHours: 4,
        notes: "تحميل الصخور والصبيات"
      }
    ],
    totalNetHours: 9,
    ratePerUnit: 180,
    meterStart: 4210,
    meterEnd: 4219,
    quantityMeters: 0,
    grossAmount: 1620,
    costs: {
      dieselLiters: 180,
      dieselCostPerLiter: 2.3,
      dieselTotalCost: 414,
      dieselOnLessor: true,
      oilCost: 150,
      hydraulicOilCost: 100,
      engineOilCost: 50,
      engineOilOnLessor: true,
      greaseCost: 30,
      sparePartsCost: 0,
      maintenanceCost: 0
    },
    driverAdvance: 200,
    netCompanyDue: 1420,
    notes: "تم إنجاز موقع البلوك الأول بنجاح وتوثيق الساعات بمعرفة المهندس المشرف",
    createdAt: "2026-07-21T17:30:00Z"
  },
  {
    id: "wr-1002",
    projectId: "proj-1",
    reportNumber: "REP-2026-002",
    date: "2026-07-22",
    contractType: "daily",
    companyName: "مؤسسة الطرق الحديثة",
    equipmentName: "شيول كاترپيلار 966",
    equipmentRegNumber: "د هـ و 5678",
    driverName: "إبراهيم الخالد",
    driverPhone: "0547654321",
    driverSalaryType: "يومية",
    periods: [
      {
        id: "p-1",
        periodName: "الفترة الأولى",
        startTime: "06:30",
        endTime: "14:30",
        durationHours: 8,
        breakMinutes: 30,
        netHours: 7.5,
        notes: "نقل الردميات والمواد الخام"
      }
    ],
    totalNetHours: 7.5,
    ratePerUnit: 1200,
    meterStart: 1850,
    meterEnd: 1858,
    quantityMeters: 0,
    grossAmount: 1200,
    costs: {
      dieselLiters: 150,
      dieselCostPerLiter: 2.3,
      dieselTotalCost: 345,
      dieselOnLessor: false,
      oilCost: 80,
      hydraulicOilCost: 80,
      engineOilCost: 0,
      engineOilOnLessor: false,
      greaseCost: 20,
      sparePartsCost: 0,
      maintenanceCost: 0
    },
    driverAdvance: 150,
    netCompanyDue: 1050,
    notes: "عملية التعبئة جرت بسلاسة عالية مع الالتزام بتدابير السلامة",
    createdAt: "2026-07-22T15:00:00Z"
  },
  {
    id: "wr-1003",
    projectId: "proj-2",
    reportNumber: "REP-2026-003",
    date: "2026-07-23",
    contractType: "meter",
    companyName: "شركة الرؤية للتطوير العقاري",
    equipmentName: "جريدر كات 140K",
    equipmentRegNumber: "ر ز س 3456",
    driverName: "عبد الرحمن العتيبي",
    driverPhone: "0508877665",
    driverSalaryType: "بالساعة",
    periods: [
      {
        id: "p-1",
        periodName: "الفترة الأولى",
        startTime: "07:00",
        endTime: "15:00",
        durationHours: 8,
        breakMinutes: 0,
        netHours: 8,
        notes: "فرش وتسوية طبقة البيس كورس بالموقع الساحلي"
      }
    ],
    totalNetHours: 8,
    ratePerUnit: 50,
    meterStart: 890,
    meterEnd: 898,
    quantityMeters: 180,
    grossAmount: 9000,
    costs: {
      dieselLiters: 200,
      dieselCostPerLiter: 2.3,
      dieselTotalCost: 460,
      dieselOnLessor: true,
      oilCost: 120,
      hydraulicOilCost: 120,
      engineOilCost: 0,
      engineOilOnLessor: false,
      greaseCost: 40,
      sparePartsCost: 0,
      maintenanceCost: 0
    },
    driverAdvance: 300,
    netCompanyDue: 8700,
    notes: "تسليم القطاع B بجدة للمختبر واجتياز اختبار الدك بنجاح",
    createdAt: "2026-07-23T16:00:00Z"
  }
];

export const INITIAL_COMPANY_PAYMENTS: CompanyPayment[] = [
  {
    id: "cp-1",
    projectId: "proj-1",
    companyName: "شركة أعمار الخليج للمقاولات",
    date: "2026-07-15",
    amount: 15000,
    paymentMethod: "حوالة بنكية",
    referenceNumber: "TR-982341",
    notes: "دفعة من أجور العقد تحت حساب تشغيل البوكلين",
    createdAt: "2026-07-15T10:00:00Z"
  },
  {
    id: "cp-2",
    projectId: "proj-1",
    companyName: "مؤسسة الطرق الحديثة",
    date: "2026-07-18",
    amount: 10000,
    paymentMethod: "سند صرف",
    referenceNumber: "VOUCH-7012",
    notes: "تسديد جزئي من مستحقات الشاول",
    createdAt: "2026-07-18T11:30:00Z"
  }
];
