// IndexedDB Utility for persistent browser data storage
const DB_NAME = 'EquipmentFleetDB';
const DB_VERSION = 1;

export interface AppDataStore {
  projects?: any[];
  activeProjectId?: string;
  reports?: any[];
  diesel?: any[];
  equipment?: any[];
  companies?: any[];
  drivers?: any[];
  userSession?: string | null;
}

const STORES = ['projects', 'reports', 'diesel', 'equipment', 'companies', 'drivers', 'settings'];

export const initDB = (): Promise<IDBDatabase | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      resolve(null);
      return;
    }

    // If page is hidden or unloading, avoid opening IDB connection that could throw closing errors
    if (document.visibilityState === 'hidden') {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        try {
          const db = (event.target as IDBOpenDBRequest).result;
          STORES.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        } catch (e) {}
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          try { db.close(); } catch (e) {}
        };
        db.onclose = () => {};
        db.onerror = (e) => {
          try { e.preventDefault(); } catch (_) {}
        };
        resolve(db);
      };

      request.onerror = (e) => {
        try { e.preventDefault(); } catch (_) {}
        resolve(null);
      };

      request.onblocked = (e) => {
        try { e.preventDefault(); } catch (_) {}
        resolve(null);
      };
    } catch (err) {
      resolve(null);
    }
  });
};

const safeCloseDB = (db: IDBDatabase | null) => {
  if (db) {
    try {
      db.close();
    } catch (e) {}
  }
};

export const saveStoreToIDB = async (storeName: string, items: any[]): Promise<void> => {
  try {
    const db = await initDB();
    if (!db) return;

    if (!db.objectStoreNames.contains(storeName)) {
      safeCloseDB(db);
      return;
    }

    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Clear existing
    store.clear();

    // Put new items
    items.forEach((item) => {
      if (item) {
        store.put(item);
      }
    });

    return new Promise((resolve) => {
      tx.oncomplete = () => {
        safeCloseDB(db);
        resolve();
      };
      tx.onerror = (e) => {
        try { e.preventDefault(); } catch (_) {}
        safeCloseDB(db);
        resolve();
      };
      tx.onabort = (e) => {
        try { e.preventDefault(); } catch (_) {}
        safeCloseDB(db);
        resolve();
      };
    });
  } catch (err) {
    // Gracefully fallback on any transient database closing/hidden errors
  }
};

export const loadStoreFromIDB = async (storeName: string): Promise<any[]> => {
  try {
    const db = await initDB();
    if (!db) return [];

    if (!db.objectStoreNames.contains(storeName)) {
      safeCloseDB(db);
      return [];
    }

    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const res = request.result || [];
        safeCloseDB(db);
        resolve(res);
      };
      request.onerror = (e) => {
        try { e.preventDefault(); } catch (_) {}
        safeCloseDB(db);
        resolve([]);
      };
    });
  } catch (err) {
    return [];
  }
};

export const saveSettingToIDB = async (key: string, value: any): Promise<void> => {
  try {
    const db = await initDB();
    if (!db) return;

    if (!db.objectStoreNames.contains('settings')) {
      safeCloseDB(db);
      return;
    }

    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    store.put({ id: key, value });
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        safeCloseDB(db);
        resolve();
      };
      tx.onerror = (e) => {
        try { e.preventDefault(); } catch (_) {}
        safeCloseDB(db);
        resolve();
      };
    });
  } catch (err) {
    // Gracefully handle database closing
  }
};

export const loadSettingFromIDB = async (key: string): Promise<any | null> => {
  try {
    const db = await initDB();
    if (!db) return null;

    if (!db.objectStoreNames.contains('settings')) {
      safeCloseDB(db);
      return null;
    }

    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get(key);
    return new Promise((resolve) => {
      request.onsuccess = () => {
        const res = request.result ? request.result.value : null;
        safeCloseDB(db);
        resolve(res);
      };
      request.onerror = (e) => {
        try { e.preventDefault(); } catch (_) {}
        safeCloseDB(db);
        resolve(null);
      };
    });
  } catch (err) {
    return null;
  }
};

export const saveAllToIndexedDB = async (data: AppDataStore): Promise<void> => {
  try {
    if (data.projects) await saveStoreToIDB('projects', data.projects);
    if (data.reports) await saveStoreToIDB('reports', data.reports);
    if (data.diesel) await saveStoreToIDB('diesel', data.diesel);
    if (data.equipment) await saveStoreToIDB('equipment', data.equipment);
    if (data.companies) await saveStoreToIDB('companies', data.companies);
    if (data.drivers) await saveStoreToIDB('drivers', data.drivers);
    if (data.activeProjectId) await saveSettingToIDB('activeProjectId', data.activeProjectId);
    if (data.userSession !== undefined) await saveSettingToIDB('userSession', data.userSession);
  } catch (e) {}
};

export const loadAllFromIndexedDB = async (): Promise<AppDataStore> => {
  try {
    const [projects, reports, diesel, equipment, companies, drivers, activeProjectId, userSession] = await Promise.all([
      loadStoreFromIDB('projects'),
      loadStoreFromIDB('reports'),
      loadStoreFromIDB('diesel'),
      loadStoreFromIDB('equipment'),
      loadStoreFromIDB('companies'),
      loadStoreFromIDB('drivers'),
      loadSettingFromIDB('activeProjectId'),
      loadSettingFromIDB('userSession')
    ]);

    return {
      projects,
      reports,
      diesel,
      equipment,
      companies,
      drivers,
      activeProjectId,
      userSession
    };
  } catch (e) {
    return {};
  }
};

