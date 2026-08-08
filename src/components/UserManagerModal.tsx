import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  X, 
  ShieldCheck, 
  KeyRound, 
  User, 
  Mail, 
  FolderKanban, 
  Check, 
  Copy, 
  Trash2, 
  Edit3, 
  Lock, 
  Phone, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Eye,
  Building2,
  HardHat
} from 'lucide-react';
import { Project } from '../types';
import { UserAccount, saveUserAccount, deleteUserAccount, registerUserAccount } from '../utils/auth';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProjects: Project[];
  allUsers: UserAccount[];
  onRefreshUsers: () => void;
  currentUser?: string;
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  allProjects,
  allUsers,
  onRefreshUsers,
  currentUser
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'project_manager' | 'site_engineer' | 'viewer'>('site_engineer');
  const [isAllProjectsAllowed, setIsAllProjectsAllowed] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    setPhone('');
    setRole('site_engineer');
    setIsAllProjectsAllowed(false);
    setSelectedProjectIds(allProjects.length > 0 ? [allProjects[0].id] : []);
    setShowAddForm(true);
    setFeedback(null);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setUsername(user.username);
    setPassword(user.passwordHash || '');
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setRole(user.role || 'site_engineer');
    setIsAllProjectsAllowed(user.isAllProjectsAllowed || user.role === 'admin');
    setSelectedProjectIds(user.assignedProjectIds || []);
    setShowAddForm(true);
    setFeedback(null);
  };

  const toggleProjectSelection = (projectId: string) => {
    if (selectedProjectIds.includes(projectId)) {
      setSelectedProjectIds(selectedProjectIds.filter(id => id !== projectId));
    } else {
      setSelectedProjectIds([...selectedProjectIds, projectId]);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!username.trim()) {
      setFeedback({ type: 'error', message: 'يرجى إدخال اسم المستخدم للدخول' });
      return;
    }
    if (!password.trim()) {
      setFeedback({ type: 'error', message: 'يرجى إدخال كلمة المرور' });
      return;
    }
    if (!isAllProjectsAllowed && selectedProjectIds.length === 0) {
      setFeedback({ type: 'error', message: 'يرجى تحديد مشروع واحد على الأقل لمنح الصلاحية للمستخدم' });
      return;
    }

    const cleanEmail = email.trim() || `${username.trim()}@company.com`;

    if (editingUser) {
      // Update existing
      const updatedUser: UserAccount = {
        ...editingUser,
        username: username.trim(),
        name: name.trim() || username.trim(),
        email: cleanEmail,
        passwordHash: password.trim(),
        phone: phone.trim(),
        role: role,
        isAllProjectsAllowed: isAllProjectsAllowed || role === 'admin',
        assignedProjectIds: isAllProjectsAllowed || role === 'admin' ? [] : selectedProjectIds
      };
      saveUserAccount(updatedUser);
      setFeedback({ type: 'success', message: 'تم تحديث بيانات المستخدم وصلاحيات المشاريع بنجاح!' });
    } else {
      // Register new
      const res = registerUserAccount(
        cleanEmail,
        username.trim(),
        name.trim() || username.trim(),
        password.trim(),
        role,
        isAllProjectsAllowed || role === 'admin' ? [] : selectedProjectIds,
        isAllProjectsAllowed || role === 'admin'
      );
      if (!res.success) {
        setFeedback({ type: 'error', message: res.message || 'خطأ أثناء إنشاء الحساب' });
        return;
      }
      setFeedback({ type: 'success', message: 'تم إضافة المستخدم الجديد ومنحه صلاحيات المشروع بنجاح!' });
    }

    onRefreshUsers();
    setTimeout(() => {
      setShowAddForm(false);
      setFeedback(null);
    }, 1200);
  };

  const handleDelete = (userId: string, userNameStr: string) => {
    if (userId === 'admin-jehad') {
      alert('لا يمكن حذف حساب المسؤول الرئيسي بالنظام.');
      return;
    }
    if (window.confirm(`هل أنت تأكد من حذف المستخدم (${userNameStr}) وإلغاء صلاحياته؟`)) {
      deleteUserAccount(userId);
      onRefreshUsers();
    }
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const appUrl = window.location.href;
    const permittedProjNames = user.isAllProjectsAllowed || user.role === 'admin'
      ? 'جميع المشاريع بالنظام'
      : allProjects
          .filter(p => (user.assignedProjectIds || []).includes(p.id))
          .map(p => p.name)
          .join('، ') || 'المشروع المحدد';

    const textToCopy = `مرحباً م. ${user.name}،
إليك بيانات دخولك الخاصة بنظام إدارة المعدات والمشاريع:

🔗 رابط النظام المباشر:
${appUrl}

👤 اسم المستخدم (Username):
${user.username}

🔑 كلمة المرور (Password):
${user.passwordHash}

🏗️ المشروع المخصص لك:
${permittedProjNames}

تمنياتنا لك بالتوفيق والنجاح.`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedUserId(user.id);
    setTimeout(() => setCopiedUserId(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-['Cairo',sans-serif] dir-rtl" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-2xl border border-amber-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>إدارة المستخدمين وصلاحيات الوصول للمشاريع</span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {allUsers.length} مستخدم
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد اسم المستخدم، كلمة السر، وتقييد الدخول لمشاريع محددة فقط
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Feedback message */}
          {feedback && (
            <div className={`p-4 rounded-2xl border text-xs font-extrabold flex items-center gap-2.5 ${
              feedback.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Top Control Bar */}
          {!showAddForm && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-xs text-slate-300 font-medium">
                ⚡ يمكنك إضافة مستخدمين، تحديد كلمة المرور، وتفعيل الصلاحية لمشاريع معينة ومنعهم من البقية.
              </div>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة مستخدم جديد وتحديد الصلاحيات</span>
              </button>
            </div>
          )}

          {/* ADD / EDIT FORM */}
          {showAddForm && (
            <form onSubmit={handleSaveUser} className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>{editingUser ? `تعديل صلاحيات المستخدم (${editingUser.name})` : 'إضافة حساب مستخدم جديد بالنظام'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>اسم المستخدم للدخول (Username):</span>
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: eng_ahmed"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>كلمة المرور (Password):</span>
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-amber-400" />
                    <span>الاسم الكامل / المسمى الوظيفي:</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: المهندس أحمد الشمري"
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>رقم الواتساب / الهاتف:</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0501234567"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>البريد الإلكتروني (اختياري):</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmed@company.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>مستوى الصلاحية (Role):</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e: any) => {
                      const newRole = e.target.value;
                      setRole(newRole);
                      if (newRole === 'admin') {
                        setIsAllProjectsAllowed(true);
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="site_engineer">مهندس موقع / سائق (يقوم بإدخال التقارير)</option>
                    <option value="project_manager">مدير مشروع (تحكم كامل بالمشروع المخصص)</option>
                    <option value="admin">مسؤول عام / مدقق (وصول لجميع المشاريع والنظام)</option>
                    <option value="viewer">مشاهد فقط (عرض بدون تعديل)</option>
                  </select>
                </div>
              </div>

              {/* PROJECT ASSIGNMENT SECTION */}
              <div className="border-t border-slate-800 pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <FolderKanban className="w-4 h-4 text-amber-400" />
                    <span>المشاريع المصرح للمستخدم بالدخول إليها والعمل عليها:</span>
                  </label>

                  {role !== 'admin' && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-amber-500/40">
                      <input
                        type="checkbox"
                        checked={isAllProjectsAllowed}
                        onChange={(e) => setIsAllProjectsAllowed(e.target.checked)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <span>السماح بجميع المشاريع بدون تقييد</span>
                    </label>
                  )}
                </div>

                {!isAllProjectsAllowed && role !== 'admin' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 max-h-48 overflow-y-auto">
                    {allProjects.map((p) => {
                      const isChecked = selectedProjectIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProjectSelection(p.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isChecked
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isChecked ? 'bg-amber-500 border-amber-400 text-slate-950' : 'border-slate-600'
                            }`}>
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-white">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.location || 'غير محدد'} | {p.code}</p>
                            </div>
                          </div>
                          {isChecked && (
                            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md">
                              مصرح به
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>تم تفعيل الوصول لجميع المشاريع في النظام لهذا الحساب.</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20"
                >
                  حفظ الحساب وتفعيل الصلاحيات
                </button>
              </div>
            </form>
          )}

          {/* USERS LIST TABLE */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              قائمة حسابات المستخدمين المسجلة بالنظام:
            </h3>

            <div className="space-y-2.5">
              {allUsers.map((u) => {
                const isAdmin = u.role === 'admin' || u.isAllProjectsAllowed;
                const isCurrent = u.username === currentUser || u.email === currentUser;

                const userProjects = allProjects.filter(p => (u.assignedProjectIds || []).includes(p.id));

                return (
                  <div
                    key={u.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* User Info */}
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-2xl border shrink-0 ${
                        isAdmin
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}>
                        {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white">{u.name}</h4>
                          {isCurrent && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              حسابك الحالي
                            </span>
                          )}
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                            u.role === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : u.role === 'project_manager'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {u.role === 'admin' ? 'مدير عام بالنظام' : u.role === 'project_manager' ? 'مدير مشروع' : 'مهندس موقع'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 text-amber-300">
                            <User className="w-3.5 h-3.5" />
                            <span>اسم المستخدم: <strong>{u.username}</strong></span>
                          </span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            <span>كلمة السر: <strong className="font-mono text-emerald-400">{u.passwordHash}</strong></span>
                          </span>
                        </div>

                        {/* Allowed Projects Scope */}
                        <div className="text-[11px] pt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500 font-bold">المشاريع المتاحة:</span>
                          {isAdmin ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold">
                              جميع المشاريع بالنظام
                            </span>
                          ) : userProjects.length > 0 ? (
                            userProjects.map(p => (
                              <span key={p.id} className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
                                🏗️ {p.name}
                              </span>
                            ))
                          ) : (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold">
                              لم يتم ربط أي مشروع بعد
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {/* Copy Credentials Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(u)}
                        className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                          copiedUserId === u.id
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30'
                        }`}
                        title="نسخ معلومات الدخول ورابط النظام لمشاركتها مع المهندس عبر واتساب"
                      >
                        {copiedUserId === u.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5" />
                            <span>مشاركة بيانات الدخول</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                        title="تعديل الحساب أو تغيير الصلاحيات والمشاريع"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {u.id !== 'admin-jehad' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.name)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 transition-colors cursor-pointer"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>💡 عند فتح المستخدم للنظام، لن يرى سوى المشروع المصرح له به فقط.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
