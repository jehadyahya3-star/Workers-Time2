import React, { useState, useEffect, useMemo } from 'react';
import { 
  WorkReport, 
  DieselTransaction, 
  Equipment, 
  Company, 
  Driver, 
  Project,
  ProjectInfo,
  CompanyPayment 
} from './types';
import { 
  INITIAL_PROJECTS,
  INITIAL_PROJECT_INFO, 
  INITIAL_COMPANIES, 
  INITIAL_EQUIPMENT, 
  INITIAL_DRIVERS, 
  INITIAL_DIESEL_TRANSACTIONS, 
  INITIAL_WORK_REPORTS,
  INITIAL_COMPANY_PAYMENTS 
} from './data/initialData';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { WorkReportForm } from './components/WorkReportForm';
import { WorkReportsList } from './components/WorkReportsList';
import { DieselWarehouse } from './components/DieselWarehouse';
import { FuelConsumptionAnalysis } from './components/FuelConsumptionAnalysis';
import { EquipmentManager } from './components/EquipmentManager';
import { CompaniesAndAccounts } from './components/CompaniesAndAccounts';
import { DriversManager } from './components/DriversManager';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { DataBackupModal } from './components/DataBackupModal';
import { ShareAppModal } from './components/ShareAppModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import { UserManagerModal } from './components/UserManagerModal';
import { LoginScreen } from './components/LoginScreen';
import { 
  getUserStorageKey, 
  getRegisteredUsers, 
  getUserByUsernameOrEmail, 
  UserAccount, 
  saveAllUsers 
} from './utils/auth';
import { 
  saveStoreToIDB, 
  loadAllFromIndexedDB, 
  saveSettingToIDB 
} from './utils/indexedDB';
import { 
  saveCollectionToFirestore, 
  loadAllFromFirestore, 
  saveSettingToFirestore,
  subscribeToUserFirestoreUpdates,
  saveSystemUsersToFirestore,
  subscribeToSystemUsersFirestore
} from './utils/firebase';

const loadStateForUser = (user: string | null) => {
  if (!user) {
    return {
      projects: INITIAL_PROJECTS,
      activeProjectId: INITIAL_PROJECTS[0]?.id || 'proj-1',
      reports: INITIAL_WORK_REPORTS,
      dieselTransactions: INITIAL_DIESEL_TRANSACTIONS,
      equipmentList: INITIAL_EQUIPMENT,
      companiesList: INITIAL_COMPANIES,
      driversList: INITIAL_DRIVERS,
      companyPayments: INITIAL_COMPANY_PAYMENTS
    };
  }

  const lowerUser = (user || '').toLowerCase();
  const isDefaultAdmin = user === 'جهاد' || lowerUser === 'jehadyahya3@gmail.com' || lowerUser.includes('jehad');

  const userProjKey = getUserStorageKey(user, 'projects');
  const userReportsKey = getUserStorageKey(user, 'reports');
  const userDieselKey = getUserStorageKey(user, 'diesel');
  const userEquipKey = getUserStorageKey(user, 'equipment');
  const userCompKey = getUserStorageKey(user, 'companies');
  const userDriversKey = getUserStorageKey(user, 'drivers');
  const userPayKey = getUserStorageKey(user, 'company_payments');
  const userActiveProjKey = getUserStorageKey(user, 'active_project_id');

  const savedProjectsStr = localStorage.getItem(userProjKey);
  let userProjects: Project[] = [];

  if (savedProjectsStr) {
    try { 
      const parsed = JSON.parse(savedProjectsStr); 
      if (Array.isArray(parsed) && parsed.length > 0) userProjects = parsed;
    } catch (e) {}
  } 

  if (userProjects.length === 0) {
    if (isDefaultAdmin) {
      const legacyProjectsStr = localStorage.getItem('eq_projects');
      if (legacyProjectsStr) {
        try { userProjects = JSON.parse(legacyProjectsStr); } catch (e) {}
      }
      if (userProjects.length === 0) userProjects = INITIAL_PROJECTS;
    } else {
      // New user initial starter project
      userProjects = [{
        id: `proj-user-${Date.now()}`,
        name: `مشروع المقاولات والتطوير الرئيسي`,
        location: 'الموقع الرئيسي',
        managerName: user,
        companyName: 'شركة المقاولات العامة',
        phone: '',
        code: 'PRJ-MAIN-01',
        budget: 500000,
        currency: 'ر.ي',
        status: 'active',
        createdAt: new Date().toISOString()
      }];
    }
  }

  let userActiveProjId = localStorage.getItem(userActiveProjKey) ||
    (isDefaultAdmin ? localStorage.getItem('eq_active_project_id') : null) ||
    userProjects[0]?.id ||
    'proj-1';

  let userReports: WorkReport[] = [];
  const savedReportsStr = localStorage.getItem(userReportsKey);
  if (savedReportsStr) {
    try { userReports = JSON.parse(savedReportsStr); } catch (e) {}
  } else if (isDefaultAdmin) {
    const legacy = localStorage.getItem('eq_reports');
    userReports = legacy ? JSON.parse(legacy) : INITIAL_WORK_REPORTS;
  }

  let userDiesel: DieselTransaction[] = [];
  const savedDieselStr = localStorage.getItem(userDieselKey);
  if (savedDieselStr) {
    try { userDiesel = JSON.parse(savedDieselStr); } catch (e) {}
  } else if (isDefaultAdmin) {
    const legacy = localStorage.getItem('eq_diesel');
    userDiesel = legacy ? JSON.parse(legacy) : INITIAL_DIESEL_TRANSACTIONS;
  }

  let userEquip: Equipment[] = [];
  const savedEquipStr = localStorage.getItem(userEquipKey);
  if (savedEquipStr) {
    try { userEquip = JSON.parse(savedEquipStr); } catch (e) {}
  } else if (isDefaultAdmin) {
    const legacy = localStorage.getItem('eq_equipment');
    userEquip = legacy ? JSON.parse(legacy) : INITIAL_EQUIPMENT;
  }

  let userComp: Company[] = [];
  const savedCompStr = localStorage.getItem(userCompKey);
  if (savedCompStr) {
    try { userComp = JSON.parse(savedCompStr); } catch (e) {}
  } else if (isDefaultAdmin) {
    const legacy = localStorage.getItem('eq_companies');
    userComp = legacy ? JSON.parse(legacy) : INITIAL_COMPANIES;
  }

  let userDrivers: Driver[] = [];
  const savedDriversStr = localStorage.getItem(userDriversKey);
  if (savedDriversStr) {
    try { userDrivers = JSON.parse(savedDriversStr); } catch (e) {}
  } else if (isDefaultAdmin) {
    const legacy = localStorage.getItem('eq_drivers');
    userDrivers = legacy ? JSON.parse(legacy) : INITIAL_DRIVERS;
  }

  let userPayments: CompanyPayment[] = [];
  const savedPayStr = localStorage.getItem(userPayKey);
  if (savedPayStr) {
    try { userPayments = JSON.parse(savedPayStr); } catch (e) {}
  } else if (isDefaultAdmin) {
    const legacy = localStorage.getItem('eq_company_payments');
    userPayments = legacy ? JSON.parse(legacy) : INITIAL_COMPANY_PAYMENTS;
  }

  return {
    projects: userProjects,
    activeProjectId: userActiveProjId,
    reports: userReports,
    dieselTransactions: userDiesel,
    equipmentList: userEquip,
    companiesList: userComp,
    driversList: userDrivers,
    companyPayments: userPayments
  };
};

export default function App() {
  // User Session Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('eq_user_session');
  });

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem('eq_user_session', username);
    setCurrentUser(username);
    showToast(`مرحباً بك يا ${username}! تم تسجيل الدخول بنجاح`);
  };

  const handleLogout = () => {
    if (window.confirm('هل أنت تأكد من تسجيل الخروج من النظام؟')) {
      localStorage.removeItem('eq_user_session');
      setCurrentUser(null);
    }
  };

  // Navigation active tab
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('eq_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('eq_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const initialUserState = loadStateForUser(currentUser);

  // Multi-Project States
  const [projects, setProjects] = useState<Project[]>(initialUserState.projects);
  const [activeProjectId, setActiveProjectId] = useState<string>(initialUserState.activeProjectId);
  const [reports, setReports] = useState<WorkReport[]>(initialUserState.reports);
  const [dieselTransactions, setDieselTransactions] = useState<DieselTransaction[]>(initialUserState.dieselTransactions);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>(initialUserState.equipmentList);
  const [companiesList, setCompaniesList] = useState<Company[]>(initialUserState.companiesList);
  const [driversList, setDriversList] = useState<Driver[]>(initialUserState.driversList);
  const [companyPayments, setCompanyPayments] = useState<CompanyPayment[]>(initialUserState.companyPayments);

  // Re-hydrate state when currentUser changes
  useEffect(() => {
    if (!currentUser) return;
    const data = loadStateForUser(currentUser);
    setProjects(data.projects);
    setActiveProjectId(data.activeProjectId);
    setReports(data.reports);
    setDieselTransactions(data.dieselTransactions);
    setEquipmentList(data.equipmentList);
    setCompaniesList(data.companiesList);
    setDriversList(data.driversList);
    setCompanyPayments(data.companyPayments);
  }, [currentUser]);

  // System Users State & Modals
  const [allUsers, setAllUsers] = useState<UserAccount[]>(getRegisteredUsers);
  const [showUserManagerModal, setShowUserManagerModal] = useState<boolean>(false);

  // Sync Users from Firestore in real-time
  useEffect(() => {
    const unsub = subscribeToSystemUsersFirestore((remoteUsers) => {
      if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        setAllUsers(remoteUsers as UserAccount[]);
        saveAllUsers(remoteUsers as UserAccount[]);
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const handleRefreshUsers = () => {
    const updated = getRegisteredUsers();
    setAllUsers(updated);
    saveSystemUsersToFirestore(updated);
  };

  // User Account Profile & Permission Computation
  const currentUserAccount = getUserByUsernameOrEmail(currentUser || '');

  const isAdminUser = !currentUser || 
    !currentUserAccount || 
    currentUserAccount.role === 'admin' || 
    currentUserAccount.isAllProjectsAllowed || 
    currentUser === 'جهاد' || 
    currentUser === 'Eng. Jehad Meftah' || 
    (currentUser || '').toLowerCase().includes('jehad');

  // Filter projects based on logged-in user permissions
  const visibleProjects = useMemo(() => {
    if (isAdminUser) return projects;
    const assignedIds = currentUserAccount?.assignedProjectIds || [];
    const filtered = projects.filter(p => assignedIds.includes(p.id));
    return filtered.length > 0 ? filtered : projects;
  }, [projects, isAdminUser, currentUserAccount]);

  // Ensure activeProjectId is locked within visible projects
  useEffect(() => {
    if (visibleProjects.length > 0) {
      if (!visibleProjects.some(p => p.id === activeProjectId)) {
        setActiveProjectId(visibleProjects[0].id);
      }
    }
  }, [visibleProjects, activeProjectId]);

  const currentProject = visibleProjects.find(p => p.id === activeProjectId) || visibleProjects[0] || projects[0] || INITIAL_PROJECTS[0];

  const projectInfo: ProjectInfo = {
    name: currentProject.name,
    location: currentProject.location,
    managerName: currentProject.managerName,
    companyName: currentProject.companyName,
    phone: currentProject.phone,
    budget: currentProject.budget || 250000,
    currency: currentProject.currency || 'ر.ي'
  };

  // Edit State
  const [editingReport, setEditingReport] = useState<WorkReport | null>(null);

  // Modals
  const [showProjectsManagerModal, setShowProjectsManagerModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAndroidExportModal, setShowAndroidExportModal] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        showToast('تم تثبيت التطبيق بنجاح على الشاشة الرئيسية لجوالك! 📲');
      }
      setDeferredPrompt(null);
    } else {
      setShowAndroidExportModal(true);
    }
  };

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Hydrate data from Firestore Cloud (or IndexedDB) on initial boot
  useEffect(() => {
    const hydrateData = async () => {
      try {
        const cloudData = await loadAllFromFirestore();
        if (cloudData) {
          if (cloudData.projects && cloudData.projects.length > 0) setProjects(cloudData.projects);
          if (cloudData.reports && cloudData.reports.length > 0) setReports(cloudData.reports);
          if (cloudData.diesel && cloudData.diesel.length > 0) setDieselTransactions(cloudData.diesel);
          if (cloudData.equipment && cloudData.equipment.length > 0) setEquipmentList(cloudData.equipment);
          if (cloudData.companies && cloudData.companies.length > 0) setCompaniesList(cloudData.companies);
          if (cloudData.drivers && cloudData.drivers.length > 0) setDriversList(cloudData.drivers);
          if (cloudData.activeProjectId) setActiveProjectId(cloudData.activeProjectId);
          console.log('☁️ Loaded latest data from Firebase Firestore Cloud');
        } else {
          const idbData = await loadAllFromIndexedDB();
          if (idbData) {
            if (idbData.projects && idbData.projects.length > 0 && !localStorage.getItem('eq_projects')) {
              setProjects(idbData.projects);
            }
            if (idbData.reports && idbData.reports.length > 0 && !localStorage.getItem('eq_reports')) {
              setReports(idbData.reports);
            }
            if (idbData.diesel && idbData.diesel.length > 0 && !localStorage.getItem('eq_diesel')) {
              setDieselTransactions(idbData.diesel);
            }
            if (idbData.equipment && idbData.equipment.length > 0 && !localStorage.getItem('eq_equipment')) {
              setEquipmentList(idbData.equipment);
            }
            if (idbData.companies && idbData.companies.length > 0 && !localStorage.getItem('eq_companies')) {
              setCompaniesList(idbData.companies);
            }
            if (idbData.drivers && idbData.drivers.length > 0 && !localStorage.getItem('eq_drivers')) {
              setDriversList(idbData.drivers);
            }
            if (idbData.activeProjectId && !localStorage.getItem('eq_active_project_id')) {
              setActiveProjectId(idbData.activeProjectId);
            }
          }
        }
      } catch (e) {
        console.warn('Hydration notice:', e);
      }
    };

    hydrateData();
  }, []);

  // Triple-Layer Sync (localStorage + IndexedDB + Firebase Firestore Cloud) isolated per user
  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'projects');
    localStorage.setItem(key, JSON.stringify(projects));
    saveStoreToIDB(key, projects);
    saveCollectionToFirestore(key, projects);
  }, [projects, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'active_project_id');
    localStorage.setItem(key, activeProjectId);
    saveSettingToIDB(key, activeProjectId);
    saveSettingToFirestore(key, activeProjectId);
  }, [activeProjectId, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'reports');
    localStorage.setItem(key, JSON.stringify(reports));
    saveStoreToIDB(key, reports);
    saveCollectionToFirestore(key, reports);
  }, [reports, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'diesel');
    localStorage.setItem(key, JSON.stringify(dieselTransactions));
    saveStoreToIDB(key, dieselTransactions);
    saveCollectionToFirestore(key, dieselTransactions);
  }, [dieselTransactions, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'equipment');
    localStorage.setItem(key, JSON.stringify(equipmentList));
    saveStoreToIDB(key, equipmentList);
    saveCollectionToFirestore(key, equipmentList);
  }, [equipmentList, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'companies');
    localStorage.setItem(key, JSON.stringify(companiesList));
    saveStoreToIDB(key, companiesList);
    saveCollectionToFirestore(key, companiesList);
  }, [companiesList, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'drivers');
    localStorage.setItem(key, JSON.stringify(driversList));
    saveStoreToIDB(key, driversList);
    saveCollectionToFirestore(key, driversList);
  }, [driversList, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const key = getUserStorageKey(currentUser, 'company_payments');
    localStorage.setItem(key, JSON.stringify(companyPayments));
    saveStoreToIDB(key, companyPayments);
    saveCollectionToFirestore(key, companyPayments);
  }, [companyPayments, currentUser]);

  // Real-time multi-device cloud synchronization listener for the logged-in user
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserFirestoreUpdates(currentUser, (storeName, items) => {
      if (!items || !Array.isArray(items) || items.length === 0) return;
      if (storeName === 'projects') setProjects(items);
      else if (storeName === 'reports') setReports(items);
      else if (storeName === 'diesel') setDieselTransactions(items);
      else if (storeName === 'equipment') setEquipmentList(items);
      else if (storeName === 'companies') setCompaniesList(items);
      else if (storeName === 'drivers') setDriversList(items);
      else if (storeName === 'company_payments') setCompanyPayments(items);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Active Project Isolated Data Subsets
  const activeReports = reports.filter(r => r.projectId === activeProjectId || (!r.projectId && activeProjectId === 'proj-1'));
  const activeDiesel = dieselTransactions.filter(d => d.projectId === activeProjectId || (!d.projectId && activeProjectId === 'proj-1'));
  const activeEquipment = equipmentList.filter(e => e.projectId === activeProjectId || (!e.projectId && activeProjectId === 'proj-1'));
  const activeCompanies = companiesList.filter(c => c.projectId === activeProjectId || (!c.projectId && activeProjectId === 'proj-1'));
  const activeDrivers = driversList.filter(dr => dr.projectId === activeProjectId || (!dr.projectId && activeProjectId === 'proj-1'));
  const activeCompanyPayments = companyPayments.filter(cp => cp.projectId === activeProjectId || (!cp.projectId && activeProjectId === 'proj-1'));

  // Project Switch & CRUD Handlers
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const target = projects.find(p => p.id === projectId);
    if (target) {
      showToast(`🔄 تم الانتقال للعمل على: ${target.name}`);
    }
  };

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    showToast(`✅ تم إضافة مشروع جديد: ${newProject.name}`);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    showToast('✅ تم تعديل تفاصيل المشروع');
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) {
      alert('لا يمكن حذف المشروع الوحيد في النظام');
      return;
    }
    if (window.confirm('هل أنت تأكد من حذف هذا المشروع وببياناته؟')) {
      const remaining = projects.filter(p => p.id !== projectId);
      setProjects(remaining);
      if (activeProjectId === projectId) {
        setActiveProjectId(remaining[0].id);
      }
      showToast('🗑️ تم حذف المشروع');
    }
  };

  // Handler: Save/Update Work Report
  const handleSaveReport = (report: WorkReport) => {
    const reportWithProject = {
      ...report,
      projectId: report.projectId || activeProjectId
    };

    const existingIdx = reports.findIndex(r => r.id === report.id);
    if (existingIdx >= 0) {
      const updated = [...reports];
      updated[existingIdx] = reportWithProject;
      setReports(updated);
      showToast('✅ تم تعديل التقرير بنجاح');
    } else {
      setReports([reportWithProject, ...reports]);
      showToast('✅ تم تسجيل يوم العمل بنجاح');
    }

    // Auto record diesel usage in diesel warehouse if diesel liters specified
    if (report.costs?.dieselLiters && report.costs.dieselLiters > 0) {
      const newDieselTx: DieselTransaction = {
        id: `ds-auto-${Date.now()}`,
        projectId: activeProjectId,
        date: report.date,
        type: 'consume',
        quantityLiters: report.costs.dieselLiters,
        pricePerLiter: report.costs.dieselCostPerLiter || 2.3,
        totalCost: report.costs.dieselTotalCost || (report.costs.dieselLiters * 2.3),
        equipmentName: report.equipmentName,
        driverName: report.driverName,
        notes: `تعبئة تلقائية من التقرير رقم ${report.reportNumber}`,
        createdAt: new Date().toISOString()
      };
      setDieselTransactions(prev => [newDieselTx, ...prev]);
    }

    setEditingReport(null);
    setActiveTab('reports-list');
  };

  // Handler: Delete Work Report
  const handleDeleteReport = (reportId: string) => {
    if (window.confirm('هل أنت أصل من حذف هذا التقرير؟')) {
      setReports(prev => prev.filter(r => r.id !== reportId));
      showToast('🗑️ تم حذف التقرير');
    }
  };

  // Handler: Edit Report
  const handleEditReport = (report: WorkReport) => {
    setEditingReport(report);
    setActiveTab('new-report');
  };

  // Handler: Copy Report
  const handleCopyReport = (report: WorkReport) => {
    const copiedReport: WorkReport = {
      ...report,
      id: '', // Empty ID will force a new ID generation in WorkReportForm
      reportNumber: '', // Will generate a new report number
      date: new Date().toISOString().split('T')[0], // Reset to today's date
      createdAt: '', // Will generate new timestamp
      driverSignature: undefined // Clear signature
    };
    setEditingReport(copiedReport);
    setActiveTab('new-report');
    showToast('📑 تم نسخ البيانات، يمكنك تعديل التاريخ وحفظ التقرير الجديد');
  };

  // Diesel Handlers
  const handleAddDieselTransaction = (tx: DieselTransaction) => {
    const txWithProject = {
      ...tx,
      projectId: tx.projectId || activeProjectId
    };
    setDieselTransactions([txWithProject, ...dieselTransactions]);
    showToast('✅ تم تسجيل حركة الديزل');
  };

  const handleDeleteDieselTransaction = (id: string) => {
    setDieselTransactions(prev => prev.filter(t => t.id !== id));
    showToast('🗑️ تم حذف حركة الديزل');
  };

  // Equipment Handlers
  const handleAddEquipment = (eq: Equipment) => {
    const eqWithProject = {
      ...eq,
      projectId: eq.projectId || activeProjectId
    };
    setEquipmentList([...equipmentList, eqWithProject]);
    showToast('✅ تم إضافة المعدة للمشروع');
  };

  const handleUpdateEquipment = (eq: Equipment) => {
    setEquipmentList(prev => prev.map(item => item.id === eq.id ? eq : item));
    showToast('✅ تم تعديل بيانات المعدة');
  };

  const handleDeleteEquipment = (id: string) => {
    setEquipmentList(prev => prev.filter(e => e.id !== id));
    showToast('🗑️ تم حذف المعدة');
  };

  // Driver Handlers
  const handleUpdateDriver = (updatedDriver: Driver) => {
    setDriversList(prev => prev.map(d => d.id === updatedDriver.id ? updatedDriver : d));
    showToast('✅ تم تعديل بيانات السائق');
  };

  const handleDeleteDriver = (id: string) => {
    if (window.confirm('هل أنت تأكد من حذف هذا السائق؟')) {
      setDriversList(prev => prev.filter(d => d.id !== id));
      showToast('🗑️ تم حذف السائق');
    }
  };

  // Export JSON Backup
  const handleExportDataBackup = () => {
    const data = {
      projects,
      activeProjectId,
      reports,
      dieselTransactions,
      equipmentList,
      companiesList,
      driversList,
      backupDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `نسخة_احتياطية_مشاريع_المعدات_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    showToast('📥 تم تحميل ملف النسخة الاحتياطية');
  };

  // Import JSON Backup
  const handleImportDataBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.activeProjectId) setActiveProjectId(parsed.activeProjectId);
        if (parsed.reports) setReports(parsed.reports);
        if (parsed.dieselTransactions) setDieselTransactions(parsed.dieselTransactions);
        if (parsed.equipmentList) setEquipmentList(parsed.equipmentList);
        if (parsed.companiesList) setCompaniesList(parsed.companiesList);
        if (parsed.driversList) setDriversList(parsed.driversList);
        showToast('✅ تم استعادة كافة المشاريع والبيانات بنجاح');
        setShowBackupModal(false);
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف JSON');
      }
    };
    reader.readAsText(file);
  };

  // Reset to initial
  const handleResetData = () => {
    if (window.confirm('هل أنت متاكد من إعادة البيانات إلى الوضع الافتراضي؟')) {
      setProjects(INITIAL_PROJECTS);
      setActiveProjectId(INITIAL_PROJECTS[0].id);
      setReports(INITIAL_WORK_REPORTS);
      setDieselTransactions(INITIAL_DIESEL_TRANSACTIONS);
      setEquipmentList(INITIAL_EQUIPMENT);
      setCompaniesList(INITIAL_COMPANIES);
      setDriversList(INITIAL_DRIVERS);
      localStorage.clear();
      showToast('🔄 تم إعادة ضبط البيانات بنجاح');
      setShowBackupModal(false);
    }
  };

  // Calculate diesel alert for sidebar badge
  const totalReceivedDiesel = activeDiesel
    .filter(t => t.type === 'receive')
    .reduce((acc, t) => acc + t.quantityLiters, 0);
  const totalConsumedDiesel = activeDiesel
    .filter(t => t.type === 'consume')
    .reduce((acc, t) => acc + t.quantityLiters, 0);
  const isDieselLow = (totalReceivedDiesel - totalConsumedDiesel) < 1000;

  // If not logged in, show Login Screen strictly
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Cairo',sans-serif] text-slate-800">
      
      {/* Navbar Header */}
      <Navbar
        currentProject={currentProject}
        totalProjectsCount={visibleProjects.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewReport={() => {
          setEditingReport(null);
          setActiveTab('new-report');
        }}
        onOpenProjectsManager={() => setShowProjectsManagerModal(true)}
        onOpenProjectSettings={() => setShowProjectModal(true)}
        onOpenBackupModal={() => setShowBackupModal(true)}
        onOpenAndroidExport={() => setShowAndroidExportModal(true)}
        onOpenShareApp={() => setShowShareModal(true)}
        onOpenUserManager={isAdminUser ? () => setShowUserManagerModal(true) : undefined}
        totalReportsCount={activeReports.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'new-report') setEditingReport(null);
            setActiveTab(tab);
          }}
          reportsCount={activeReports.length}
          lowStockAlert={isDieselLow}
        />

        {/* Dynamic Page Content Stage */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="mb-4 bg-slate-900 text-amber-400 font-extrabold px-4 py-3 rounded-xl shadow-lg border border-slate-700 text-xs sm:text-sm flex items-center justify-between animate-bounce">
              <span>{toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              reports={activeReports}
              dieselTransactions={activeDiesel}
              equipment={activeEquipment}
              companies={activeCompanies}
              drivers={activeDrivers}
              projectInfo={projectInfo}
              allProjects={projects}
              allDieselTransactions={dieselTransactions}
              allReports={reports}
              onNavigateTab={setActiveTab}
              onOpenNewReport={() => {
                setEditingReport(null);
                setActiveTab('new-report');
              }}
              onOpenShareApp={() => setShowShareModal(true)}
            />
          )}

          {activeTab === 'new-report' && (
            <WorkReportForm
              equipmentList={activeEquipment}
              companiesList={activeCompanies}
              driversList={activeDrivers}
              projectItems={currentProject?.projectItems}
              defaultDieselPrice={currentProject?.defaultDieselPrice || 2.3}
              currencySymbol={projectInfo.currency}
              onSaveReport={handleSaveReport}
              onCancel={() => setActiveTab('reports-list')}
              existingReport={editingReport}
            />
          )}

          {activeTab === 'reports-list' && (
            <WorkReportsList
              reports={activeReports}
              projectInfo={projectInfo}
              onEditReport={handleEditReport}
              onCopyReport={handleCopyReport}
              onDeleteReport={handleDeleteReport}
              onOpenNewReport={() => {
                setEditingReport(null);
                setActiveTab('new-report');
              }}
            />
          )}

          {activeTab === 'diesel-warehouse' && (
            <DieselWarehouse
              transactions={activeDiesel}
              equipmentList={activeEquipment}
              driversList={activeDrivers}
              projectInfo={projectInfo}
              onAddTransaction={handleAddDieselTransaction}
              onDeleteTransaction={handleDeleteDieselTransaction}
            />
          )}

          {activeTab === 'fuel-analysis' && (
            <FuelConsumptionAnalysis
              dieselTransactions={activeDiesel}
              reports={activeReports}
              equipmentList={activeEquipment}
              projectInfo={projectInfo}
            />
          )}

          {activeTab === 'equipment-manager' && (
            <EquipmentManager
              equipmentList={activeEquipment}
              driversList={activeDrivers}
              reports={activeReports}
              onAddEquipment={handleAddEquipment}
              onUpdateEquipment={handleUpdateEquipment}
              onDeleteEquipment={handleDeleteEquipment}
            />
          )}

          {activeTab === 'companies-accounts' && (
            <CompaniesAndAccounts
              companies={activeCompanies}
              reports={activeReports}
              dieselTransactions={activeDiesel}
              companyPayments={activeCompanyPayments}
              equipmentList={activeEquipment}
              projectInfo={projectInfo}
              onAddCompany={(c) => {
                const cWithProject = { ...c, projectId: activeProjectId };
                setCompaniesList([...companiesList, cWithProject]);
                showToast('✅ تم إضافة الشركة لهذا المشروع');
              }}
              onAddCompanyPayment={(pay) => {
                const payWithProject = { ...pay, projectId: activeProjectId };
                setCompanyPayments([...companyPayments, payWithProject]);
                showToast('✅ تم تسجيل الدفعة/التحويل المالي للشركة المؤجرة بنجاح');
              }}
              onDeleteCompanyPayment={(payId) => {
                setCompanyPayments(companyPayments.filter(p => p.id !== payId));
                showToast('🗑️ تم حذف الدفعة المالية');
              }}
            />
          )}

          {activeTab === 'drivers-manager' && (
            <DriversManager
              drivers={activeDrivers}
              equipmentList={activeEquipment}
              reports={activeReports}
              onAddDriver={(d) => {
                const dWithProject = { ...d, projectId: activeProjectId };
                setDriversList([...driversList, dWithProject]);
                showToast('✅ تم إضافة السائق لهذا المشروع');
              }}
              onUpdateDriver={handleUpdateDriver}
              onDeleteDriver={handleDeleteDriver}
              onUpdateEquipment={handleUpdateEquipment}
            />
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-4 px-6 border-t border-slate-800 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-right">
          <div>
            <span className="font-bold text-slate-300">{currentProject.name}</span>
            <span className="mx-2 text-slate-700">|</span>
            <span className="text-slate-400">{currentProject.companyName} ({currentProject.location})</span>
          </div>
          <div className="bg-slate-900 border border-amber-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-amber-400 font-extrabold text-xs shadow-2xs">
            <span>تصميم وإعداد المهندس جهاد مفتاح</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200">للتواصل :</span>
            <a href="tel:00967770999936" className="text-amber-400 font-mono underline font-extrabold dir-ltr">
              00967770999936
            </a>
          </div>
        </div>
      </footer>

      {/* Projects Switcher / Manager Modal */}
      {showProjectsManagerModal && (
        <ProjectManagerModal
          projects={visibleProjects}
          activeProjectId={activeProjectId}
          equipmentList={equipmentList}
          reportsList={reports}
          onSelectProject={handleSelectProject}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onOpenUserManager={isAdminUser ? () => setShowUserManagerModal(true) : undefined}
          onClose={() => setShowProjectsManagerModal(false)}
        />
      )}

      {/* User Manager & Permissions Modal */}
      <UserManagerModal
        isOpen={showUserManagerModal}
        onClose={() => setShowUserManagerModal(false)}
        allProjects={projects}
        allUsers={allUsers}
        onRefreshUsers={handleRefreshUsers}
        currentUser={currentUser || undefined}
      />

      {/* Project Settings Modal */}
      {showProjectModal && (
        <ProjectSettingsModal
          projectInfo={projectInfo}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onSave={(updated) => {
            const updatedProject: Project = {
              ...currentProject,
              name: updated.name,
              companyName: updated.companyName,
              managerName: updated.managerName,
              location: updated.location,
              phone: updated.phone,
              budget: updated.budget || currentProject.budget || 250000,
              currency: updated.currency || currentProject.currency || 'ر.ي'
            };
            handleUpdateProject(updatedProject);
          }}
          onClose={() => setShowProjectModal(false)}
        />
      )}

      {/* Data Backup & Restore Modal */}
      {showBackupModal && (
        <DataBackupModal
          onExportData={handleExportDataBackup}
          onImportData={handleImportDataBackup}
          onResetData={handleResetData}
          onClose={() => setShowBackupModal(false)}
        />
      )}

      {/* Share Application & Embedded Database Modal */}
      <ShareAppModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        reports={reports}
        dieselTransactions={dieselTransactions}
        equipmentList={equipmentList}
        companiesList={companiesList}
        driversList={driversList}
        onOpenAndroidExport={() => setShowAndroidExportModal(true)}
      />

      {/* Android Export Modal */}
      <AndroidExportModal
        isOpen={showAndroidExportModal}
        onClose={() => setShowAndroidExportModal(false)}
        deferredPrompt={deferredPrompt}
        onInstallPWA={handleInstallPWA}
      />

    </div>
  );
}

