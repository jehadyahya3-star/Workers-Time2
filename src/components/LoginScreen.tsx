import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Wrench, 
  Building2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Mail, 
  UserPlus, 
  LogIn, 
  Globe,
  Send,
  RefreshCw
} from 'lucide-react';
import { authenticateUserAccount, registerUserAccount } from '../utils/auth';
import { getFirebaseAuth, getGoogleProvider } from '../utils/firebase';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification 
} from 'firebase/auth';

interface LoginScreenProps {
  onLoginSuccess: (userEmailOrUsername: string, displayName?: string) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setUnverifiedEmail(null);
    setIsGoogleLoading(true);

    try {
      const firebaseAuth = getFirebaseAuth();
      const provider = getGoogleProvider();
      if (!firebaseAuth || !provider) {
        throw new Error('Firebase Auth or Google Provider not available');
      }
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      
      if (!user) {
        setError('تعذر الحصول على معلومات حساب جوجل. يرجى المحاولة مرة أخرى.');
        setIsGoogleLoading(false);
        return;
      }

      // Check if user email belongs to main admin account or new user
      const userEmail = (user.email || '').toLowerCase();
      const displayName = user.displayName || user.email || 'مستخدم جوجل';

      if (userEmail === 'jehadyahya3@gmail.com') {
        setSuccessMsg('🎉 تم الدخول بحساب المسؤول الرئيسي بنجاح! جاري تحميل البيانات وربط المزامنة...');
        setTimeout(() => {
          onLoginSuccess('Eng. Jehad Meftah', 'المهندس جهاد مفتاح');
        }, 500);
      } else {
        // Register/authenticate Google account automatically
        registerUserAccount(userEmail, userEmail.split('@')[0], displayName, 'google-oauth-secure');
        setSuccessMsg('🎉 تم الدخول بحساب جوجل وتأكيد البريد بنجاح!');
        setTimeout(() => {
          onLoginSuccess(userEmail, displayName);
        }, 500);
      }
    } catch (err: any) {
      const errCode = err?.code || '';
      const errStr = String(err?.message || err || '');
      const isPopupClosed = errCode === 'auth/popup-closed-by-user' || errStr.includes('popup-closed-by-user');
      const isPopupBlocked = errCode === 'auth/popup-blocked' || errStr.includes('popup-blocked');

      if (isPopupClosed) {
        setError('تم إغلاق نافذة الدخول بحساب Google قبل إكمال العملية. يمكنك إعادة المحاولة أو تسجيل الدخول باسم المستخدم وكلمة المرور.');
      } else if (isPopupBlocked) {
        setError('تم حجب نافذة الدخول المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة للطرف الثالث وإعادة المحاولة.');
      } else {
        // Fallback message without hanging
        setError('تعذر الاتصال بخدمة Google حالياً. يمكنك استخدام الدخول باسم المستخدم والكلمة مباشرة.');
      }
      setIsGoogleLoading(false);
    }
  };

  // Login Handler (Username/Email & Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setUnverifiedEmail(null);
    setIsLoading(true);

    // 1. Try Firebase Auth first
    try {
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth) {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, loginInput.trim(), loginPassword.trim());
        const fbUser = userCredential.user;

        if (fbUser) {
          // Enforce Email Verification Check for non-admin email users
          if (!fbUser.emailVerified && fbUser.email !== 'jehadyahya3@gmail.com') {
            setUnverifiedEmail(fbUser.email);
            setError('لم يتم تأكيد بريدك الإلكتروني بعد! يتوجب عليك الضغط على رابط التأكيد المرفق ببريدك للتمكن من القبول والدخول.');
            setIsLoading(false);
            return;
          }

          const emailOrName = fbUser.email || loginInput;
          setSuccessMsg('🎉 تم تسجيل الدخول بنجاح!');
          setTimeout(() => {
            onLoginSuccess(emailOrName, fbUser.displayName || emailOrName);
          }, 400);
          return;
        }
      }
    } catch (fbErr: any) {
      // If Firebase Auth returns error, fallback to local authenticated user account logic
    }

    // 2. Local Account Authentication Fallback
    setTimeout(() => {
      const authResult = authenticateUserAccount(loginInput, loginPassword);
      if (authResult.success && authResult.user) {
        onLoginSuccess(authResult.user.username || authResult.user.email, authResult.user.name);
      } else {
        setError(authResult.message || 'خطأ في بيانات الدخول، يرجى التأكد من اسم المستخدم وكلمة المرور');
        setIsLoading(false);
      }
    }, 300);
  };

  // Register Handler (with Email Verification Link)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setUnverifiedEmail(null);

    if (regPassword !== regConfirmPassword) {
      setError('كلمتا المرور غير متطابقتين!');
      return;
    }

    if (regPassword.length < 6) {
      setError('كلمة المرور يجب أن تتكون من 6 خانات على الأقل لضمان أمان الحساب');
      return;
    }

    setIsLoading(true);

    // Try creating Firebase user and sending email verification link
    try {
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth) {
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, regEmail.trim(), regPassword.trim());
        if (userCred.user) {
          await sendEmailVerification(userCred.user);
          registerUserAccount(regEmail, regUsername, regName, regPassword);
          
          setSuccessMsg(`📧 تم إنشاء الحساب بنجاح! تم إرسال رسالة رابط تأكيد إلى البريد (${regEmail}). يتوجب عليك تأكيد البريد أولاً لاكتمال القبول ودخول النظام.`);
          setIsLoading(false);
          setMode('login');
          return;
        }
      }
    } catch (fbErr: any) {
      console.warn('Firebase registration fallback to local store:', fbErr?.message);
    }

    // Local Registration Fallback
    setTimeout(() => {
      const regResult = registerUserAccount(regEmail, regUsername, regName, regPassword);
      if (regResult.success && regResult.user) {
        setSuccessMsg('🎉 تم تسجيل الحساب بنجاح! يرجى الدخول للحساب لمتابعة العمل.');
        setMode('login');
      } else {
        setError(regResult.message || 'خطأ أثناء إنشاء الحساب');
      }
      setIsLoading(false);
    }, 400);
  };

  // Resend Verification Email Link Handler
  const handleResendVerification = async () => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth || !firebaseAuth.currentUser) {
      setError('يرجى محاولة تسجيل الدخول بالبريد وكلمة المرور لإعادة إرسال التأكيد.');
      return;
    }
    try {
      await sendEmailVerification(firebaseAuth.currentUser);
      setSuccessMsg('✉️ تم إعادة إرسال رابط التأكيد بنجاح إلى بريدك الإلكتروني. تفقد صندوق الوارد والبريد غير المرغوب فيه.');
      setError(null);
    } catch (e: any) {
      setError('تعذر إرسال البريد حالياً. يرجى الانتظار دقيقة والمحاولة مجدداً.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between items-center p-4 sm:p-6 font-['Cairo',sans-serif] text-slate-100 relative overflow-hidden dir-rtl" dir="rtl">
      
      {/* Background Accent Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Brand */}
      <div className="w-full max-w-md pt-6 text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 mb-3 border border-amber-300/40">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
          نظام إدارة المعدات ومشاريع المقاولات
        </h1>
        <p className="text-xs text-amber-400 font-bold mt-1 flex items-center justify-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>منصة سحابية متكاملة لجميع المستخدمين والمشاريع حول العالم</span>
        </p>
      </div>

      {/* Main Form Box */}
      <div className="w-full max-w-md my-auto z-10 my-6">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          
          {/* Direct Google Sign-In Primary Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-500/60 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-xs sm:text-sm cursor-pointer disabled:opacity-50 group"
            >
              {isGoogleLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></span>
                  <span>جاري الاتصال بحساب Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="group-hover:text-amber-400 transition-colors">
                    التسجيل / الدخول السريع بحساب Google
                  </span>
                </>
              )}
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-800"></div>
              <span className="px-3 text-[11px] font-bold text-slate-500">أو عبر اسم المستخدم والبريد</span>
              <div className="flex-1 border-t border-slate-800"></div>
            </div>
          </div>

          {/* Tabs: Sign In vs Register */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
                setUnverifiedEmail(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
                setUnverifiedEmail(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>حساب جديد</span>
            </button>
          </div>

          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-white">
                {mode === 'login' ? 'تسجيل الدخول لحسابك' : 'إنشاء حساب جديد وتأكيد البريد'}
              </h2>
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>تأكيد أمان البريد</span>
            </span>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs font-bold flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              {unverifiedEmail && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="mt-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all self-start cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-rose-300" />
                  <span>إعادة إرسال رابط التأكيد إلى البريد</span>
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>اسم المستخدم أو البريد الإلكتروني (User Name / Email):</span>
                </label>
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>كلمة المرور:</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الخاصة بالحساب"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري التحقق والدخول...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>دخول النظام</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>الاسم الكامل أو اسم المنشأة / المقاول:</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="مثال: شركة المقاولات العامة / المهندس أحمد"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>البريد الإلكتروني الحقيقي (سيصلك رابط تأكيد):</span>
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right dir-ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>اسم المستخدم للدخول (User Name الفريد):</span>
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="اختر اسم مستخدم للدخول به مستقبلاً (مثال: engineer966)"
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>كلمة المرور:</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="6 خانات على الأقل"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>تأكيد كلمة المرور:</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور"
                    required
                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all text-right"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    <span>جاري إرسال رابط التأكيد...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>تسجيل الحساب وإرسال رابط التأكيد</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </div>

      {/* Developer Credit Footer Card */}
      <div className="w-full max-w-md z-10 pb-4">
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 text-center shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-sm mb-1">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>تصميم وإعداد المهندس جهاد مفتاح</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-300 dir-ltr mt-1">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>للتواصل : </span>
            <a 
              href="tel:00967770999936" 
              className="text-amber-400 hover:underline font-mono font-bold tracking-wider"
            >
              00967770999936
            </a>
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            جميع الحقوق محفوظة لنظام إدارة المشاريع والأعمال الميدانية © {new Date().getFullYear()}
          </div>
        </div>
      </div>

    </div>
  );
};
