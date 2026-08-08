import React, { useState } from 'react';
import { Project, ProjectItem, Equipment, WorkReport, SUPPORTED_CURRENCIES } from '../types';
import { Loader966Icon } from './Loader966Icon';
import { 
  FolderKanban, 
  Plus, 
  CheckCircle2, 
  Building2, 
  HardHat, 
  MapPin, 
  Phone, 
  X, 
  Edit3, 
  Trash2, 
  ArrowRightLeft,
  Briefcase,
  Coins,
  Fuel,
  Users,
  Layers,
  ListPlus,
  Tag
} from 'lucide-react';

interface ProjectManagerModalProps {
  projects: Project[];
  activeProjectId: string;
  equipmentList: Equipment[];
  reportsList: WorkReport[];
  onSelectProject: (projectId: string) => void;
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenUserManager?: () => void;
  onClose: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  projects,
  activeProjectId,
  equipmentList,
  reportsList,
  onSelectProject,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onOpenUserManager,
  onClose
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [managerName, setManagerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [budget, setBudget] = useState<number | string>(250000);
  const [currency, setCurrency] = useState('ر.ي');
  const [defaultDieselPrice, setDefaultDieselPrice] = useState<number | string>(2.3);

  // Project Items (بنود المشروع)
  const [projectItems, setProjectItems] = useState<ProjectItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemBudget, setNewItemBudget] = useState<number | string>('');
  const [newItemUnit, setNewItemUnit] = useState('م3');

  const handleOpenAdd = () => {
    setEditingProject(null);
    setName('');
    setLocation('صنعاء - حي الحصبة');
    setManagerName('');
    setCompanyName('شركة المقاولات العامة');
    setPhone('0500000000');
    setCode(`PRJ-${Math.floor(10 + Math.random() * 90)}`);
    setBudget(250000);
    setCurrency('ر.ي');
    setDefaultDieselPrice(2.3);
    setProjectItems([
      { id: `item-1-${Date.now()}`, name: 'أعمال الحفريات والترحيل', code: 'ITEM-01', estimatedBudget: 80000, unit: 'م3' },
      { id: `item-2-${Date.now()}`, name: 'أعمال التسوية والردميات', code: 'ITEM-02', estimatedBudget: 60000, unit: 'م3' },
      { id: `item-3-${Date.now()}`, name: 'طبقة الأساس (البيس كورس)', code: 'ITEM-03', estimatedBudget: 70000, unit: 'م2' }
    ]);
    setShowAddForm(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setLocation(project.location);
    setManagerName(project.managerName);
    setCompanyName(project.companyName);
    setPhone(project.phone);
    setCode(project.code || '');
    setBudget(project.budget || 250000);
    setCurrency(project.currency || 'ر.ي');
    setDefaultDieselPrice(project.defaultDieselPrice || 2.3);
    setProjectItems(project.projectItems || []);
    setShowAddForm(true);
  };

  const handleAddProjectItem = () => {
    if (!newItemName.trim()) return;
    const item: ProjectItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      name: newItemName.trim(),
      code: newItemCode.trim() || `ITEM-0${projectItems.length + 1}`,
      estimatedBudget: Number(newItemBudget) || 0,
      unit: newItemUnit || 'م3'
    };
    setProjectItems(prev => [...prev, item]);
    setNewItemName('');
    setNewItemCode('');
    setNewItemBudget('');
  };

  const handleRemoveProjectItem = (id: string) => {
    setProjectItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAddPresetItem = (presetName: string, defaultBudgetVal: number, unitVal: string) => {
    if (projectItems.some(i => i.name === presetName)) return;
    const item: ProjectItem = {
      id: `item-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      name: presetName,
      code: `ITEM-0${projectItems.length + 1}`,
      estimatedBudget: defaultBudgetVal,
      unit: unitVal
    };
    setProjectItems(prev => [...prev, item]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData: Project = {
      id: editingProject?.id || `proj-${Date.now()}`,
      name,
      location,
      managerName,
      companyName,
      phone,
      code: code || `PRJ-${Math.floor(100 + Math.random() * 900)}`,
      budget: Number(budget) || 0,
      currency: currency || 'ر.ي',
      defaultDieselPrice: Number(defaultDieselPrice) || 2.3,
      projectItems,
      status: 'active',
      createdAt: editingProject?.createdAt || new Date().toISOString()
    };

    if (editingProject) {
      onUpdateProject(projectData);
    } else {
      onAddProject(projectData);
      // Auto-switch to newly created project
      onSelectProject(projectData.id);
    }

    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 flex-shrink-0">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Loader966Icon className="w-7 h-7 text-amber-500" />
              <span>إدارة والتنقل بين المشاريع التشغيلية</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              اختر المشروع النشط للعمل عليه، أو قم بإضافة مشروع إنشائي جديد للأسطول
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          
          {!showAddForm ? (
            <>
              {/* Action Top Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-600">
                  المشاريع المصرحة لك: <strong className="text-slate-900">{projects.length}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {onOpenUserManager && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenUserManager();
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>إدارة المستخدمين والصلاحيات</span>
                    </button>
                  )}

                  <button
                    onClick={handleOpenAdd}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>إضافة مشروع جديد</span>
                  </button>
                </div>
              </div>

              {/* Projects Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj) => {
                  const isActive = proj.id === activeProjectId;
                  const projEqCount = equipmentList.filter(e => e.projectId === proj.id || (!e.projectId && proj.id === 'proj-1')).length;
                  const projRepCount = reportsList.filter(r => r.projectId === proj.id || (!r.projectId && proj.id === 'proj-1')).length;

                  return (
                    <div 
                      key={proj.id} 
                      className={`p-4 rounded-2xl border transition-all space-y-3 relative flex flex-col justify-between ${
                        isActive 
                          ? 'border-amber-500 bg-amber-50/40 shadow-md ring-2 ring-amber-400/50' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>المشروع الحالي النشط</span>
                        </div>
                      )}

                      <div className="space-y-1.5 pr-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                            {proj.code || 'PRJ'}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
                            {proj.name}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 pt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{proj.companyName}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span>{proj.location}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <HardHat className="w-3 h-3 text-slate-400" />
                            <span>{proj.managerName}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stats Strip */}
                      <div className="bg-slate-100 rounded-xl p-2.5 grid grid-cols-3 text-center text-xs font-bold text-slate-700 gap-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-normal">الميزانية المرصودة</span>
                          <span className="text-emerald-700 font-black">{(proj.budget || 0).toLocaleString('ar-SA')} {proj.currency || 'ر.ي'}</span>
                        </div>
                        <div className="border-r border-slate-200 pr-2">
                          <span className="text-[10px] text-slate-400 block font-normal">سعر الديزل المعتمد</span>
                          <span className="text-amber-800 font-black">{proj.defaultDieselPrice || 2.3} {proj.currency || 'ر.ي'}/لتر</span>
                        </div>
                        <div className="border-r border-slate-200 pr-2">
                          <span className="text-[10px] text-slate-400 block font-normal">المعدات / اليوميات</span>
                          <span className="text-slate-900">{projEqCount} م | {projRepCount} ت</span>
                        </div>
                      </div>

                      {/* Buttons Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(proj)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60"
                            title="تعديل تفاصيل المشروع"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {projects.length > 1 && (
                            <button
                              onClick={() => onDeleteProject(proj.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="حذف المشروع"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {isActive ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> جاري العمل عليه
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectProject(proj.id);
                              onClose();
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                            <span>الدخول للمشروع</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add / Edit Project Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-500" />
                  <span>{editingProject ? 'تعديل بيانات المشروع' : 'إضافة مشروع تشغيلي جديد'}</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  إلغاء
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">اسم المشروع الكامل:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: مشروع سكة الحديد - القطاع الشرقي"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">الميزانية المرصودة للمشروع:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="250000"
                      min="0"
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-2 font-extrabold text-amber-900 pl-16"
                      required
                    />
                    <span className="absolute left-3 top-2 text-xs font-black text-amber-800">{currency}</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>عملة المشروع:</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-extrabold text-slate-900 text-xs cursor-pointer focus:ring-2 focus:ring-amber-400"
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr.code} value={curr.symbol}>
                        {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Default Diesel Price Input per User Request */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1">
                <label className="font-extrabold text-slate-900 block flex items-center gap-1.5 text-xs">
                  <Fuel className="w-4 h-4 text-amber-600" />
                  <span>سعر لتر الديزل الافتراضي للمشروع:</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={defaultDieselPrice}
                    onChange={(e) => setDefaultDieselPrice(e.target.value)}
                    placeholder="2.3"
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 font-black text-slate-900 text-sm pl-20"
                    required
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-600">
                    {currency}/لتر
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium">
                  ⚡ يتم تحديد هذا السعر عند تسجيل المشروع للسرعة في الإدخال اليومي، ويتم تعبئته تلقائياً عند تسجيل أي يوم عمل أو صرف دايزل.
                </p>
              </div>

              {/* Project Items (بنود وتقسيمات تكاليف المشروع - اختياري) */}
              <div className="bg-slate-100/80 border border-slate-300 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <label className="font-black text-slate-900 block flex items-center gap-1.5 text-xs">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span>بنود وتقسيمات تكاليف المشروع (متطلب اختياري قياسي):</span>
                  </label>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                    عدد البنود: {projectItems.length}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  💡 تتيح لك بنود المشروع توزيع وتصنيف تكاليف المعدات والوقود والصيانة لكل بند عمل مستهدف لقياس تكلفة كل بند بدقة.
                </p>

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 block">إضافة سريعة من البنود الشائعة للمقاولات:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddPresetItem('أعمال الحفريات والترحيل', 80000, 'م3')}
                      className="bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 hover:border-amber-400 text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>أعمال الحفريات والترحيل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetItem('أعمال التسوية والردميات', 60000, 'م3')}
                      className="bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 hover:border-amber-400 text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>أعمال التسوية والردم</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetItem('طبقة الأساس (البيس كورس)', 70000, 'م2')}
                      className="bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 hover:border-amber-400 text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>البيس كورس</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetItem('صب الخرسانات والإنشاءات', 50000, 'م3')}
                      className="bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 hover:border-amber-400 text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>صب الخرسانات</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetItem('أعمال السفلتة والرصف', 90000, 'م2')}
                      className="bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-300 hover:border-amber-400 text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-500" />
                      <span>أعمال السفلتة</span>
                    </button>
                  </div>
                </div>

                {/* Add Custom Item Input Row */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">اسم بند المشروع:</label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="مثال: حفر وتدشين القواعد"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">الميزانية التقديرية للبند:</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={newItemBudget}
                        onChange={(e) => setNewItemBudget(e.target.value)}
                        placeholder="50000"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 text-xs pl-10"
                      />
                      <span className="absolute left-2 top-1.5 text-[10px] font-bold text-slate-500">{currency}</span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">الوحدة:</label>
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-900 text-xs"
                    >
                      <option value="م3">م3 (متر مكعب)</option>
                      <option value="م2">م2 (متر مربع)</option>
                      <option value="م.ط">م.ط (متر طولي)</option>
                      <option value="ساعة">ساعة تشغيلية</option>
                      <option value="يوم">يوم عمل</option>
                      <option value="مقطوعية">مقطوعية</option>
                      <option value="طن">طن</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddProjectItem}
                      disabled={!newItemName.trim()}
                      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold p-1.5 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة البند</span>
                    </button>
                  </div>
                </div>

                {/* Added Project Items List Table */}
                {projectItems.length > 0 && (
                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1 border-t border-slate-200 pt-2">
                    {projectItems.map((item, idx) => (
                      <div key={item.id} className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-900 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded">
                            {item.code || `0${idx + 1}`}
                          </span>
                          <span>{item.name}</span>
                          {item.unit && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              ({item.unit})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-amber-900 font-extrabold text-[11px]">
                            الميزانية: {(item.estimatedBudget || 0).toLocaleString('ar-SA')} {currency}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProjectItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                            title="حذف هذا البند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">كود/رمز المشروع:</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="PRJ-101"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">الشركة المنفذة / المالك:</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="اسم الشركة"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">المهندس / المشرف المسؤول:</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="اسم المهندس المشرف"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">رقم جوال التواصل:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XXXXXXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">موقع المشروع / المدينة:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="مثال: الدمام - المدينة الصناعية الثانية"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold hover:bg-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2 rounded-xl shadow-md cursor-pointer"
                >
                  {editingProject ? 'حفظ التغييرات' : 'حفظ واختيار هذا المشروع'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
