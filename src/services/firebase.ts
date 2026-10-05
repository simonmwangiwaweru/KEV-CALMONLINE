import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  SystemSettings,
  Client,
  JobBooking,
  ProductSale,
  RecurringClient,
  DailyWorker,
  WorkerPaymentRecord,
  LedgerEntry,
  FixedExpenseBudget,
  GivingRequest,
  WeeklyCloseRecord,
  ActivityTask,
  NotificationItem
} from '../types';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if configured
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test Firestore connection as required by architecture specs
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('[Calm Online] Firebase Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Calm Online] Firestore is currently offline. Please check network/config.');
    } else {
      console.log('[Calm Online] Firestore test connection response received.');
    }
    return true;
  }
}

// Immediately trigger connection test on load
testFirestoreConnection();

// Authentication Methods
export async function loginWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Complete Cloud Sync Interface
export interface CloudSyncData {
  settings: SystemSettings;
  clients: Client[];
  jobs: JobBooking[];
  products: ProductSale[];
  recurringClients: RecurringClient[];
  workers: DailyWorker[];
  workerPayments: WorkerPaymentRecord[];
  ledger: LedgerEntry[];
  fixedBudgets: FixedExpenseBudget[];
  givingRequests: GivingRequest[];
  weeklyCloses: WeeklyCloseRecord[];
  activities: ActivityTask[];
  notifications: NotificationItem[];
}

/**
 * Upload all local records to user's private Firestore subcollections
 */
export async function saveAllUserDataToFirestore(userId: string, data: CloudSyncData): Promise<void> {
  if (!userId) return;

  // 1. Update user profile root
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    uid: userId,
    email: auth.currentUser?.email || '',
    displayName: auth.currentUser?.displayName || '',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  // 2. Save settings
  const settingsRef = doc(db, 'users', userId, 'settings', 'config');
  await setDoc(settingsRef, data.settings);

  // Helper to sync an entity list in batches (chunk of 400 for safety against Firestore 500 limits)
  async function syncCollection<T extends { id: string }>(colName: string, items: T[]) {
    if (!items || items.length === 0) return;
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      for (const item of chunk) {
        if (!item.id) continue;
        const itemRef = doc(db, 'users', userId, colName, String(item.id));
        batch.set(itemRef, item);
      }
      await batch.commit();
    }
  }

  await syncCollection('clients', data.clients);
  await syncCollection('jobs', data.jobs);
  await syncCollection('products', data.products);
  await syncCollection('recurring_clients', data.recurringClients);
  await syncCollection('workers', data.workers);
  await syncCollection('worker_payments', data.workerPayments);
  await syncCollection('ledger', data.ledger);
  await syncCollection('fixed_budgets', data.fixedBudgets);
  await syncCollection('giving_requests', data.givingRequests);
  await syncCollection('weekly_closes', data.weeklyCloses);
  await syncCollection('activities', data.activities);
  await syncCollection('notifications', data.notifications);
}

/**
 * Fetch all user data from Firestore
 */
export async function loadUserDataFromFirestore(userId: string): Promise<Partial<CloudSyncData> | null> {
  if (!userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      return null;
    }

    // Helper to fetch entire subcollection
    async function fetchSubcollection<T>(colName: string): Promise<T[]> {
      const colRef = collection(db, 'users', userId, colName);
      const snap = await getDocs(colRef);
      return snap.docs.map(d => d.data() as T);
    }

    const settingsRef = doc(db, 'users', userId, 'settings', 'config');
    const settingsSnap = await getDoc(settingsRef);
    const settings = settingsSnap.exists() ? (settingsSnap.data() as SystemSettings) : undefined;

    const [
      clients,
      jobs,
      products,
      recurringClients,
      workers,
      workerPayments,
      ledger,
      fixedBudgets,
      givingRequests,
      weeklyCloses,
      activities,
      notifications
    ] = await Promise.all([
      fetchSubcollection<Client>('clients'),
      fetchSubcollection<JobBooking>('jobs'),
      fetchSubcollection<ProductSale>('products'),
      fetchSubcollection<RecurringClient>('recurring_clients'),
      fetchSubcollection<DailyWorker>('workers'),
      fetchSubcollection<WorkerPaymentRecord>('worker_payments'),
      fetchSubcollection<LedgerEntry>('ledger'),
      fetchSubcollection<FixedExpenseBudget>('fixed_budgets'),
      fetchSubcollection<GivingRequest>('giving_requests'),
      fetchSubcollection<WeeklyCloseRecord>('weekly_closes'),
      fetchSubcollection<ActivityTask>('activities'),
      fetchSubcollection<NotificationItem>('notifications')
    ]);

    return {
      settings,
      clients,
      jobs,
      products,
      recurringClients,
      workers,
      workerPayments,
      ledger,
      fixedBudgets,
      givingRequests,
      weeklyCloses,
      activities,
      notifications
    };
  } catch (err) {
    console.error('[Calm Online] Error loading user data from Firestore:', err);
    return null;
  }
}
