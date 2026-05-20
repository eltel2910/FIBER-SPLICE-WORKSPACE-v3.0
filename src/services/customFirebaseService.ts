import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  Firestore,
  query,
  orderBy
} from "firebase/firestore";

export interface CustomFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const LOCAL_STORAGE_KEY = "fiber_custom_firebase_config_v3";

export function getCustomFirebaseConfig(): CustomFirebaseConfig | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomFirebaseConfig(config: CustomFirebaseConfig) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
}

export function clearCustomFirebaseConfig() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

// Lazy initialization of custom firebase app & firestore
let customApp: FirebaseApp | null = null;
let customDb: Firestore | null = null;

export function initCustomFirebase(): { app: FirebaseApp; db: Firestore } | null {
  const config = getCustomFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const existingApps = getApps();
    const customAppName = "custom_user_firebase_app";
    
    // Find or create the custom app
    const appRef = existingApps.find(app => app.name === customAppName);
    if (appRef) {
      customApp = appRef;
    } else {
      customApp = initializeApp(config, customAppName);
    }
    
    customDb = getFirestore(customApp);
    return { app: customApp, db: customDb };
  } catch (err) {
    console.error("Failed to initialize custom user Firebase app:", err);
    return null;
  }
}

export function getCustomDb(): Firestore | null {
  if (!customDb) {
    const init = initCustomFirebase();
    if (init) {
      customDb = init.db;
    }
  }
  return customDb;
}

/**
 * Test connectivity with user's customized Firestore database
 */
export async function testFirestoreConnection(config: CustomFirebaseConfig): Promise<boolean> {
  try {
    const tempAppName = "temp_test_firebase_app_" + Date.now();
    const testApp = initializeApp(config, tempAppName);
    const testDb = getFirestore(testApp);
    const testDocRef = doc(testDb, "fiber_connection_test", "ping");
    
    // Attempt a light setDoc write test to confirm cloud read/write permissions are active
    await setDoc(testDocRef, {
      testedAt: new Date().toISOString(),
      status: "online"
    }, { merge: true });
    
    return true;
  } catch (err) {
    console.error("Failed connection test to customized cloud Firestore:", err);
    throw err;
  }
}

/**
 * Saves a fiber optic splice layout workspace to the user's custom Firestore
 */
export async function saveProjectToCustomFirestore(projectId: string, payload: any): Promise<void> {
  const db = getCustomDb();
  if (!db) {
    throw new Error("Custom Firestore is not configured or failed to load.");
  }

  try {
    const docRef = doc(db, "fiber_projects", projectId);
    await setDoc(docRef, {
      ...payload,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err: any) {
    console.error("Firestore save error:", err);
    throw new Error(err.message || "Failed to save design to customized Firestore. Ensure security rules allow read/write workflows.");
  }
}

/**
 * Retrieves a list of project metadata lists from custom Firestore
 */
export async function fetchProjectsFromCustomFirestore(): Promise<Array<{ id: string; name: string; updatedAt: string }>> {
  const db = getCustomDb();
  if (!db) {
    return [];
  }

  try {
    const collRef = collection(db, "fiber_projects");
    const querySnap = await getDocs(collRef);
    const results: Array<{ id: string; name: string; updatedAt: string }> = [];
    
    querySnap.forEach((doc) => {
      const data = doc.data();
      results.push({
        id: doc.id,
        name: data.name || "Untitled Project",
        updatedAt: data.updatedAt || new Date().toISOString()
      });
    });

    // Sort by latest updated date
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (err: any) {
    console.error("Firestore get collection metadata error:", err);
    throw new Error(err.message || "Failed to load project indexes from customized Firestore.");
  }
}

/**
 * Loads a full detailed project document by ID
 */
export async function fetchProjectDocFromCustomFirestore(projectId: string): Promise<any | null> {
  const db = getCustomDb();
  if (!db) {
    return null;
  }

  try {
    const docRef = doc(db, "fiber_projects", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err: any) {
    console.error("Firestore load document error:", err);
    throw new Error(err.message || "Failed to retrieve layout document data.");
  }
}

/**
 * Deletes a project document from custom Firestore
 */
export async function deleteProjectFromCustomFirestore(projectId: string): Promise<void> {
  const db = getCustomDb();
  if (!db) {
    return;
  }

  try {
    const docRef = doc(db, "fiber_projects", projectId);
    await deleteDoc(docRef);
  } catch (err: any) {
    console.error("Firestore delete document error:", err);
    throw new Error(err.message || "Failed to delete project from custom Firestore.");
  }
}
