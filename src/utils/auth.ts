// Multi-User Authentication & Account Management Helper

export interface UserPermissions {
  canAddReports?: boolean;
  canDeleteReports?: boolean;
  canManageEquipment?: boolean;
  canManageCompanies?: boolean;
  canManageDiesel?: boolean;
  canIssueInvoicing?: boolean;
  canManageDrivers?: boolean;
  canManageUsers?: boolean;
  canExportData?: boolean;
}

export const DEFAULT_FULL_PERMISSIONS: UserPermissions = {
  canAddReports: true,
  canDeleteReports: true,
  canManageEquipment: true,
  canManageCompanies: true,
  canManageDiesel: true,
  canIssueInvoicing: true,
  canManageDrivers: true,
  canManageUsers: true,
  canExportData: true,
};

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  name: string;
  passwordHash: string;
  role: 'primary_admin' | 'admin' | 'project_manager' | 'site_engineer' | 'accountant' | 'viewer';
  isPrimaryUser?: boolean; // هل المستخدم مستخدم رئيسي (مالك حساب/مشروع)؟
  createdByUserId?: string; // معرّف المستخدم الرئيسي الذي أنشأ هذا الحساب الفرعي
  assignedProjectIds: string[]; // قائمة معرّفات المشاريع المصرح له بالدخول إليها
  isAllProjectsAllowed?: boolean;
  permissions?: UserPermissions; // الصلاحيات التفصيلية الممنوحة للمستخدم
  createdAt: string;
  status?: 'active' | 'suspended';
  phone?: string;
}

const USERS_STORAGE_KEY = 'eq_registered_users';

// Pre-seeded default admin account for Eng. Jehad
export const DEFAULT_ADMIN: UserAccount = {
  id: 'admin-jehad',
  email: 'jehadyahya3@gmail.com',
  username: 'Eng. Jehad Meftah',
  name: 'المهندس جهاد مفتاح',
  passwordHash: '770999936**Jehad',
  role: 'primary_admin',
  isPrimaryUser: true,
  assignedProjectIds: [],
  isAllProjectsAllowed: true,
  permissions: DEFAULT_FULL_PERMISSIONS,
  createdAt: '2026-01-01T00:00:00.000Z',
  status: 'active'
};

export const getRegisteredUsers = (): UserAccount[] => {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (!saved) {
      const initial = [DEFAULT_ADMIN];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const users: UserAccount[] = JSON.parse(saved);
    // Ensure default admin account always exists with admin rights
    const adminIdx = users.findIndex(u => 
      u.username === 'Eng. Jehad Meftah' || 
      u.username === 'جهاد' || 
      u.email.toLowerCase() === 'jehadyahya3@gmail.com'
    );
    if (adminIdx === -1) {
      users.unshift(DEFAULT_ADMIN);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } else {
      // Ensure admin has full permissions
      users[adminIdx] = {
        ...users[adminIdx],
        role: 'primary_admin',
        isPrimaryUser: true,
        isAllProjectsAllowed: true,
        permissions: DEFAULT_FULL_PERMISSIONS
      };
    }
    return users;
  } catch (err) {
    console.error('Error reading registered users:', err);
    return [DEFAULT_ADMIN];
  }
};

export const saveAllUsers = (users: UserAccount[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users:', err);
  }
};

export const saveUserAccount = (user: UserAccount): void => {
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  saveAllUsers(users);
};

export const deleteUserAccount = (userId: string): boolean => {
  if (userId === 'admin-jehad') return false; // cannot delete root admin
  const users = getRegisteredUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveAllUsers(filtered);
  return true;
};

export const registerUserAccount = (
  email: string,
  username: string,
  name: string,
  password: string,
  role: 'primary_admin' | 'admin' | 'project_manager' | 'site_engineer' | 'accountant' | 'viewer' = 'primary_admin',
  assignedProjectIds: string[] = [],
  isAllProjectsAllowed: boolean = false,
  createdByUserId?: string,
  permissions?: UserPermissions
): { success: boolean; user?: UserAccount; message?: string } => {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();
  const cleanName = name.trim() || cleanUsername;

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: 'يرجى إدخال بريد إلكتروني صحيح' };
  }
  if (!cleanUsername || cleanUsername.length < 2) {
    return { success: false, message: 'اسم المستخدم يجب أن يتكون من حرفين على الأقل' };
  }
  if (!password || password.length < 4) {
    return { success: false, message: 'كلمة المرور يجب أن لا تقل عن 4 خانات' };
  }

  const users = getRegisteredUsers();

  // Check if email or username already exists
  const existingEmail = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingEmail) {
    return { success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل! يمكنك تسجيل الدخول به.' };
  }

  const existingUser = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
  if (existingUser) {
    return { success: false, message: 'اسم المستخدم هذا مستخدم بالفعل! اختر اسماً آخر.' };
  }

  // If created without createdByUserId, it's a new Primary User (Master Admin)
  const isPrimary = !createdByUserId || role === 'primary_admin';

  const newUser: UserAccount = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    username: cleanUsername,
    name: cleanName,
    passwordHash: password,
    role: isPrimary ? 'primary_admin' : role,
    isPrimaryUser: isPrimary,
    createdByUserId: createdByUserId,
    assignedProjectIds: assignedProjectIds || [],
    isAllProjectsAllowed: isPrimary ? true : isAllProjectsAllowed,
    permissions: isPrimary ? DEFAULT_FULL_PERMISSIONS : (permissions || {
      canAddReports: true,
      canDeleteReports: false,
      canManageEquipment: true,
      canManageCompanies: false,
      canManageDiesel: true,
      canIssueInvoicing: false,
      canManageDrivers: true,
      canManageUsers: false,
      canExportData: true
    }),
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  users.push(newUser);
  saveAllUsers(users);

  return { success: true, user: newUser };
};

export const authenticateUserAccount = (
  loginInput: string,
  passwordInput: string
): { success: boolean; user?: UserAccount; message?: string } => {
  const cleanInput = loginInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanInput || !cleanPass) {
    return { success: false, message: 'يرجى إدخال اسم المستخدم/البريد الإلكتروني وكلمة المرور' };
  }

  // Direct check for default hardcoded admin account credentials
  const isAdminUserMatch = 
    cleanInput === 'eng. jehad meftah' || 
    cleanInput === 'eng.jehad meftah' ||
    cleanInput === 'جهاد' || 
    cleanInput === 'جهاد مفتاح' ||
    cleanInput === 'المهندس جهاد' ||
    cleanInput === 'المهندس جهاد مفتاح' ||
    cleanInput === 'م. جهاد' ||
    cleanInput === 'jehadyahya3@gmail.com' ||
    cleanInput.includes('jehad');

  const isAdminPassMatch = 
    cleanPass === '770999936**Jehad' || 
    cleanPass === '770999936**jehad' || 
    cleanPass === '770999936';

  if (isAdminUserMatch && isAdminPassMatch) {
    return { success: true, user: DEFAULT_ADMIN };
  }

  const users = getRegisteredUsers();
  const matchedUser = users.find(
    u => u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput
  );

  if (!matchedUser) {
    return { success: false, message: 'الحساب غير موجود! يرجى التأكد من اسم المستخدم أو كلمة المرور.' };
  }

  if (matchedUser.status === 'suspended') {
    return { success: false, message: 'هذا الحساب معطل مؤقتاً! يرجى التواصل مع مسؤول النظام.' };
  }

  if (matchedUser.passwordHash !== cleanPass) {
    return { success: false, message: 'كلمة المرور غير صحيحة!' };
  }

  return { success: true, user: matchedUser };
};

export const getUserByUsernameOrEmail = (identifier: string): UserAccount | null => {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  if (
    clean === 'eng. jehad meftah' || 
    clean === 'eng.jehad meftah' ||
    clean === 'جهاد' || 
    clean === 'جهاد مفتاح' ||
    clean === 'المهندس جهاد' ||
    clean === 'المهندس جهاد مفتاح' ||
    clean === 'م. جهاد' ||
    clean === 'jehadyahya3@gmail.com' ||
    clean.includes('jehad')
  ) {
    return DEFAULT_ADMIN;
  }
  const users = getRegisteredUsers();
  return users.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean) || null;
};

// Compute safe storage key for per-account data isolation
export const getUserStorageKey = (userKey: string, dataTypeKey: string): string => {
  if (!userKey) {
    return `eq_user_default_${dataTypeKey}`;
  }
  const cleanKey = userKey.trim().toLowerCase();
  
  try {
    const users = getRegisteredUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanKey || u.username.toLowerCase() === cleanKey);
    
    let ownerKey = cleanKey;
    if (matchedUser && !matchedUser.isPrimaryUser && matchedUser.createdByUserId) {
      const parent = users.find(u => u.id === matchedUser.createdByUserId);
      if (parent) {
        ownerKey = (parent.username || parent.email || parent.id).toLowerCase().trim();
      }
    }

    const safeId = encodeURIComponent(ownerKey);
    return `eq_user_${safeId}_${dataTypeKey}`;
  } catch (err) {
    const safeId = encodeURIComponent(cleanKey);
    return `eq_user_${safeId}_${dataTypeKey}`;
  }
};

