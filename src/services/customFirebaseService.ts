import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDocs, getDoc, deleteDoc, collection, Firestore } from "firebase/firestore";

export interface CustomFirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const LOCAL_STORAGE_KEY = "fiber_custom_firebase_config_v3";
const CUSTOM_APP_NAME = "custom_user_firebase_app";

let customApp: FirebaseApp | null = null;
let customDb: Firestore | null = null;

export function getCustomFirebaseConfig(): CustomFirebaseConfig | null {
  try {
    const configStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    return configStr ? JSON.parse(configStr) : null;
  } catch {
    return null;
  }
}

export function saveCustomFirebaseConfig(config: CustomFirebaseConfig): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function initCustomFirebase(): void {
  const config = getCustomFirebaseConfig();
  if (config) {
    try {
      getCustomDb(config);
    } catch (err) {
      console.error("Failed to pre-initialize custom database:", err);
    }
  }
}

export function getCustomDb(config?: CustomFirebaseConfig): Firestore {
  if (customDb && !config) {
    return customDb;
  }

  const activeConfig = config || getCustomFirebaseConfig();
  if (!activeConfig) {
    throw new Error("No custom Firebase configuration provided or found in storage.");
  }

  const apps = getApps();
  const existingApp = apps.find(app => app.name === CUSTOM_APP_NAME);

  if (existingApp) {
    customApp = existingApp;
  } else {
    customApp = initializeApp(activeConfig, CUSTOM_APP_NAME);
  }

  customDb = getFirestore(customApp);
  return customDb;
}

export async function testFirestoreConnection(config: CustomFirebaseConfig): Promise<boolean> {
  const tempAppName = "temp_test_firebase_app_" + Date.now();
  const tempApp = initializeApp(config, tempAppName);
  const tempDb = getFirestore(tempApp);

  const testDocRef = doc(tempDb, "_connection_test_", "handshake_" + Date.now());
  
  // 5-second timeout to prevent indefinite hanging (Firestore SDK default behavior on incorrect endpoint/creds)
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Connection timed out after 5 seconds. Please verify that: 1) You turned on 'Firestore Database' in your Firebase console. 2) You initialized it in 'Test Mode' or configured rules to allow writes. 3) Your API Key and Project ID are 100% correct.")), 5000)
  );

  const writePromise = setDoc(testDocRef, {
    testedAt: new Date().toISOString(),
    status: "ok"
  });

  await Promise.race([writePromise, timeoutPromise]);

  try {
    const deletePromise = deleteDoc(testDocRef);
    await Promise.race([deletePromise, timeoutPromise]);
  } catch (e) {
    console.warn("Cleanup of custom connection test doc failed:", e);
  }

  return true;
}

export async function saveProjectToCustomFirestore(projectId: string, payload: any): Promise<void> {
  const db = getCustomDb();
  const docRef = doc(db, "projects", projectId);
  await setDoc(docRef, payload);
}

export async function fetchProjectsFromCustomFirestore(): Promise<any[]> {
  const db = getCustomDb();
  const querySnapshot = await getDocs(collection(db, "projects"));
  const projects: any[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    projects.push({
      id: doc.id,
      name: data.name || "Untitled Project",
      updatedAt: data.updatedAt || new Date().toISOString()
    });
  });
  return projects;
}

export async function fetchProjectDocFromCustomFirestore(id: string): Promise<any> {
  const db = getCustomDb();
  const docRef = doc(db, "projects", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function deleteProjectFromCustomFirestore(id: string): Promise<void> {
  const db = getCustomDb();
  const docRef = doc(db, "projects", id);
  await deleteDoc(docRef);
}
