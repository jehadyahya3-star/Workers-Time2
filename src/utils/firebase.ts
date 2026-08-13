import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore,
  initializeFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  writeBatch,
  enableMultiTabIndexedDbPersistence,
  setLogLevel
} from 'firebase/firestore';

// Silence non-fatal connection timeout logs in offline mode or slow network
try {
  setLogLevel('error');
} catch (e) {
  // ignore
}
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppDataStore } from './indexedDB';
import { getUserStorageKey } from './auth';

// Initialize Firebase App lazily with fallback
export const getFirebaseApp = () => {
  try {
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (e) {
    console.warn('Firebase App initialization notice:', e);
    return null;
  }
};

export const app = getFirebaseApp();

let authInstance: any = null;
export const getFirebaseAuth = () => {
  if (!authInstance) {
    try {
      const activeApp = getFirebaseApp();
      if (activeApp) {
        authInstance = getAuth(activeApp);
      }
    } catch (e) {
      console.warn('Firebase Auth initialization notice:', e);
    }
  }
  return authInstance;
};

export const auth = getFirebaseAuth();

let googleProviderInstance: any = null;
export const getGoogleProvider = () => {
  if (!googleProviderInstance) {
    try {
      googleProviderInstance = new GoogleAuthProvider();
    } catch (e) {
      console.warn('GoogleAuthProvider initialization notice:', e);
    }
  }
  return googleProviderInstance;
};

export const googleProvider = getGoogleProvider();

export const db = (() => {
  try {
    const activeApp = getFirebaseApp();
    if (!activeApp) return null as any;
    return initializeFirestore(activeApp, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch (e) {
    try {
      const activeApp = getFirebaseApp();
      return activeApp ? getFirestore(activeApp) : (null as any);
    } catch (err) {
      console.warn('Firestore initialization notice:', err);
      return null as any;
    }
  }
})();

// Try enabling offline persistence safely
if (db) {
  try {
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      // Quietly ignore multi-tab, browser iframe restrictions, or database closing errors
      console.warn('Firestore persistence notice:', err?.message || err);
    });
  } catch (e) {
    console.warn('Persistence init notice:', e);
  }
}

// Timeout helper for Firestore operations to avoid hanging on slow network
const fetchWithTimeout = <T>(promise: Promise<T>, timeoutMs = 3000): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firestore operation timed out - offline fallback activated'));
    }, timeoutMs);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

// Sync single collection to Firestore
export const saveCollectionToFirestore = async (collectionName: string, items: any[]): Promise<void> => {
  if (!items || !Array.isArray(items)) return;
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      if (item && item.id) {
        const itemRef = doc(db, collectionName, String(item.id));
        batch.set(itemRef, item, { merge: true });
      }
    });
    await fetchWithTimeout(batch.commit(), 4000);
    console.log(`✅ Synced ${items.length} items to Firestore collection: ${collectionName}`);
  } catch (err) {
    console.warn(`⚠️ Offline/Sync notice for Firestore (${collectionName}):`, (err as any)?.message || err);
  }
};

// Sync setting (like activeProjectId)
export const saveSettingToFirestore = async (key: string, value: any): Promise<void> => {
  try {
    const docRef = doc(db, 'settings', key);
    await fetchWithTimeout(setDoc(docRef, { id: key, value }, { merge: true }), 3000);
  } catch (err) {
    console.warn(`⚠️ Offline/Sync notice for Firestore (${key}):`, (err as any)?.message || err);
  }
};

// Sync all app data to Firestore
export const saveAllToFirestore = async (data: AppDataStore): Promise<void> => {
  try {
    if (data.projects) await saveCollectionToFirestore('projects', data.projects);
    if (data.reports) await saveCollectionToFirestore('reports', data.reports);
    if (data.diesel) await saveCollectionToFirestore('diesel', data.diesel);
    if (data.equipment) await saveCollectionToFirestore('equipment', data.equipment);
    if (data.companies) await saveCollectionToFirestore('companies', data.companies);
    if (data.drivers) await saveCollectionToFirestore('drivers', data.drivers);
    if (data.activeProjectId) await saveSettingToFirestore('activeProjectId', data.activeProjectId);
  } catch (err) {
    console.warn('⚠️ Error saving all data to Firestore:', err);
  }
};

// Load all collections from Firestore
export const loadAllFromFirestore = async (): Promise<AppDataStore | null> => {
  try {
    const collectionsToFetch = ['projects', 'reports', 'diesel', 'equipment', 'companies', 'drivers'];
    const results: any = {};

    for (const colName of collectionsToFetch) {
      const snap = await fetchWithTimeout(getDocs(collection(db, colName)), 3000);
      results[colName] = snap.docs.map(doc => doc.data());
    }

    const settingsSnap = await fetchWithTimeout(getDocs(collection(db, 'settings')), 2000);
    let activeProjectId = null;
    settingsSnap.docs.forEach(doc => {
      if (doc.id === 'activeProjectId') {
        activeProjectId = doc.data().value;
      }
    });

    if (results.projects && results.projects.length > 0) {
      return {
        projects: results.projects,
        reports: results.reports || [],
        diesel: results.diesel || [],
        equipment: results.equipment || [],
        companies: results.companies || [],
        drivers: results.drivers || [],
        activeProjectId: activeProjectId || results.projects[0]?.id
      };
    }
    return null;
  } catch (err) {
    console.warn('ℹ️ Firestore offline or unreachable, using local storage cache.');
    return null;
  }
};

// Real-time listener for Firestore changes
export const subscribeToFirestoreUpdates = (onUpdate: (data: Partial<AppDataStore>) => void) => {
  const unsubscribers: (() => void)[] = [];

  const collections = ['projects', 'reports', 'diesel', 'equipment', 'companies', 'drivers'];

  collections.forEach((colName) => {
    const unsub = onSnapshot(
      collection(db, colName),
      (snapshot) => {
        const items = snapshot.docs.map(doc => doc.data());
        onUpdate({ [colName]: items });
      },
      (error) => {
        // Quietly log listener warnings on connection/offline issues
        console.warn(`Firestore listener status for ${colName}:`, error?.message || error);
      }
    );
    unsubscribers.push(unsub);
  });

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

// Real-time listener for system users collection
export const saveSystemUsersToFirestore = async (users: any[]): Promise<void> => {
  if (!users || !Array.isArray(users)) return;
  try {
    const batch = writeBatch(db);
    users.forEach((u) => {
      if (u && u.id) {
        const docRef = doc(db, 'system_users', String(u.id));
        batch.set(docRef, u, { merge: true });
      }
    });
    await fetchWithTimeout(batch.commit(), 3000);
    console.log(`✅ Synced ${users.length} system users to Firestore`);
  } catch (err) {
    console.warn('⚠️ Offline/Sync notice for system_users:', (err as any)?.message || err);
  }
};

export const subscribeToSystemUsersFirestore = (onUsersUpdate: (users: any[]) => void) => {
  try {
    const unsub = onSnapshot(
      collection(db, 'system_users'),
      (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        const users = snapshot.docs.map(doc => doc.data());
        if (users && users.length > 0) {
          onUsersUpdate(users);
        }
      },
      (error) => {
        console.warn('Firestore listener for system_users:', error?.message || error);
      }
    );
    return unsub;
  } catch (e) {
    console.warn('Failed to subscribe to system_users:', e);
    return () => {};
  }
};

// Real-time listener for per-user Firestore changes across multiple devices
export const subscribeToUserFirestoreUpdates = (
  user: string,
  onStoreUpdate: (storeName: string, items: any[]) => void
) => {
  if (!user) return () => {};
  const unsubscribers: (() => void)[] = [];
  const stores = ['projects', 'reports', 'diesel', 'equipment', 'companies', 'drivers', 'company_payments'];

  stores.forEach((storeName) => {
    const key = getUserStorageKey(user, storeName);
    try {
      const unsub = onSnapshot(
        collection(db, key),
        (snapshot) => {
          // Exclude local uncommitted writes to avoid flickering
          if (snapshot.metadata.hasPendingWrites) return;
          const items = snapshot.docs.map(doc => doc.data());
          if (items && Array.isArray(items) && items.length > 0) {
            onStoreUpdate(storeName, items);
          }
        },
        (error) => {
          console.warn(`Firestore listener for ${key}:`, error?.message || error);
        }
      );
      unsubscribers.push(unsub);
    } catch (e) {
      console.warn(`Failed to attach listener for ${key}:`, e);
    }
  });

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};
