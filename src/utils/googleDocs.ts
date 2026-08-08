import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User 
} from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider } from './firebase';
import { WorkReport, ProjectInfo, Equipment } from '../types';

const getAuthInstance = () => {
  return getFirebaseAuth();
};

const getProviderInstance = () => {
  try {
    const provider = getGoogleProvider();
    if (provider) {
      provider.addScope('https://www.googleapis.com/auth/documents');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
    }
    return provider;
  } catch (e) {
    console.warn('GoogleDocs provider init notice:', e);
    return null;
  }
};

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  const auth = getAuthInstance();
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  const auth = getAuthInstance();
  const provider = getProviderInstance();
  if (!auth || !provider) {
    throw new Error('خدمة مصادقة جوجل غير متوفرة حالياً');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('لم يتم الحصول على رمز الوصول من حساب جوجل');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogle = async () => {
  const auth = getAuthInstance();
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Creates a new Google Document with a summary of work reports or dashboard status.
 */
export const exportReportToGoogleDoc = async (
  title: string,
  contentBody: string,
  accessToken?: string
): Promise<{ docId: string; documentUrl: string }> => {
  const token = accessToken || (await getAccessToken());
  if (!token) {
    throw new Error('يرجى تسجيل الدخول بحساب جوجل أولاً للتصدير إلى مستندات جوجل');
  }

  // 1. Create a blank document
  const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData.error?.message || 'فشل إنشاء مستند جوجل جديد');
  }

  const docData = await createRes.json();
  const documentId = docData.documentId;

  // 2. Insert text into the document
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: {
              index: 1
            },
            text: contentBody
          }
        }
      ]
    })
  });

  if (!updateRes.ok) {
    console.warn('Could not insert content body into Google Doc');
  }

  const documentUrl = `https://docs.google.com/document/d/${documentId}/edit`;
  return { docId: documentId, documentUrl };
};
