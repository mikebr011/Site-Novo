/**
 * Firebase Client SDK Initialization and Firestore Integration
 * Configured for project gen-lang-client-0314814703
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  Unsubscribe,
  getDocs,
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';
import { DonationPledge, ContactMessage, ChildRegistration, RaffleDraw } from '../types';

export const ADMIN_UID = 'gvCU8Aw3PVhqFFkM97BRA676qtL2';
export const ADMIN_EMAIL = 'projetompga@gmail.com';

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(
  app,
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId
);

// Initialize Analytics conditionally for browser environment
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('Analytics initialization skipped:', err);
    });
}

// Error Handling Specification as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on startup as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or internet connection.');
    }
    return false;
  }
}

// Auto-run connection test
if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}

/**
 * Real-time subscription to Campaign Pledges with fallback
 */
export function subscribeToPledges(
  onData: (pledges: DonationPledge[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const pledgesCollection = 'pledges';
  try {
    const q = query(collection(db, pledgesCollection), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: DonationPledge[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as DonationPledge);
        });
        onData(items);
      },
      (error) => {
        console.warn('Firestore snapshot error (using local cache):', error.message);
        if (onError) onError(error);
        try {
          handleFirestoreError(error, OperationType.GET, pledgesCollection);
        } catch {
          // Gracefully suppress unhandled throw so app continues with localStorage
        }
      }
    );
  } catch (err) {
    console.warn('Could not initialize Firestore listener:', err);
    return () => {};
  }
}

/**
 * Save pledge to Firestore with full error handling
 */
export async function savePledgeToFirebase(pledge: DonationPledge): Promise<boolean> {
  const path = `pledges/${pledge.id}`;
  try {
    await setDoc(doc(db, 'pledges', pledge.id), pledge);
    return true;
  } catch (error) {
    console.error('Failed to save pledge to Firebase:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Fallback
    }
    return false;
  }
}

/**
 * ============================================================
 * FALE CONOSCO: "Seu Nome e Número de Telefone / WhatsApp"
 * ============================================================
 */

/**
 * Save "Fale Conosco" contact message directly into Firestore collection `contacts`
 */
export async function saveContactToFirebase(contact: ContactMessage): Promise<boolean> {
  const path = `contacts/${contact.id}`;
  const payload = {
    id: contact.id,
    name: contact.name,
    phone: contact.phone,
    status: contact.status || 'novo',
    notes: contact.notes || 'Enviado pelo formulário Fale Conosco.',
    createdAt: contact.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'contacts', contact.id), payload);
    return true;
  } catch (error) {
    console.error('Failed to save contact to Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Return false on failure
    }
    return false;
  }
}

/**
 * Subscribe to contacts in real time (for Admin view)
 */
export function subscribeToContacts(
  onData: (contacts: ContactMessage[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const contactsCollection = 'contacts';
  try {
    const q = query(collection(db, contactsCollection), orderBy('createdAt', 'desc'), limit(200));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ContactMessage[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ContactMessage);
        });
        onData(items);
      },
      (error) => {
        console.warn('Firestore contacts snapshot error:', error.message);
        if (onError) onError(error);
        try {
          handleFirestoreError(error, OperationType.LIST, contactsCollection);
        } catch {
          // Gracefully suppress unhandled error to maintain app responsiveness
        }
      }
    );
  } catch (err) {
    console.warn('Could not initialize contacts Firestore listener:', err);
    return () => {};
  }
}

/**
 * Update contact status (e.g. 'contatado' or 'arquivado')
 */
export async function updateContactStatusInFirebase(
  id: string,
  status: 'novo' | 'contatado' | 'arquivado'
): Promise<boolean> {
  const path = `contacts/${id}`;
  try {
    await updateDoc(doc(db, 'contacts', id), { status });
    return true;
  } catch (error) {
    console.error('Failed to update contact status in Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } catch {
      // Fallback
    }
    return false;
  }
}

/**
 * Delete a contact record from Firestore
 */
export async function deleteContactFromFirebase(id: string): Promise<boolean> {
  const path = `contacts/${id}`;
  try {
    await deleteDoc(doc(db, 'contacts', id));
    return true;
  } catch (error) {
    console.error('Failed to delete contact from Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch {
      // Fallback
    }
    return false;
  }
}

/**
 * ============================================================
 * ADMIN AUTHENTICATION HELPERS
 * ID: [gvCU8Aw3PVhqFFkM97BRA676qtL2]
 * Email: projetompga@gmail.com
 * Senha: adm123mpga
 * ============================================================
 */

export interface AdminAuthState {
  isAdmin: boolean;
  uid: string;
  email: string;
  name: string;
}

const LOCAL_ADMIN_KEY = 'mpga_admin_session';

export function getStoredAdminSession(): AdminAuthState | null {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.isAdmin) return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function setStoredAdminSession(session: AdminAuthState | null) {
  try {
    if (session) {
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_ADMIN_KEY);
    }
  } catch {
    // Ignore write errors
  }
}

/**
 * Login function supporting Firebase Auth with fallback to configured admin credentials
 */
export async function loginAdmin(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: AdminAuthState; error?: string }> {
  const cleanEmail = emailInput.trim();
  const cleanPassword = passwordInput.trim();

  const allowedAdminEmails = [
    ADMIN_EMAIL.toLowerCase(),
    'michaelorocha2@gmail.com',
    'michaelorocha1@gmail.com',
  ];

  const isExactAdminCredentials =
    allowedAdminEmails.includes(cleanEmail.toLowerCase()) && cleanPassword === 'adm123mpga';

  if (!isExactAdminCredentials) {
    return {
      success: false,
      error: 'Credenciais inválidas. Verifique o e-mail e a senha informados.',
    };
  }

  // 1. Try Firebase Auth signIn
  try {
    let userCredential;
    try {
      userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    } catch (signInErr: any) {
      // If user not found, try creating the account in Firebase Auth
      if (
        signInErr.code === 'auth/user-not-found' ||
        signInErr.code === 'auth/invalid-credential'
      ) {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        } catch {
          // If creation fails due to provider disabled or restrictions, continue to verified local session
        }
      }
    }

    const session: AdminAuthState = {
      isAdmin: true,
      uid: userCredential?.user?.uid || ADMIN_UID,
      email: cleanEmail,
      name: 'Administrador Oficial MPGA',
    };

    setStoredAdminSession(session);
    return { success: true, user: session };
  } catch (err: any) {
    // If Firebase Auth throws an unhandled error, but credentials are exact, grant authorized session
    const session: AdminAuthState = {
      isAdmin: true,
      uid: ADMIN_UID,
      email: cleanEmail,
      name: 'Administrador Oficial MPGA',
    };
    setStoredAdminSession(session);
    return { success: true, user: session };
  }
}

/**
 * Logout admin
 */
export async function logoutAdmin(): Promise<void> {
  setStoredAdminSession(null);
  try {
    await signOut(auth);
  } catch {
    // Suppress signout errors
  }
}

/**
 * Fetch latest contacts directly on demand (for manual refresh)
 */
export async function getLatestContacts(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    const items: ContactMessage[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as ContactMessage));
    return items;
  } catch (err) {
    console.warn('Error fetching latest contacts:', err);
    return [];
  }
}

/**
 * Fetch latest pledges directly on demand (for manual refresh)
 */
export async function getLatestPledges(): Promise<DonationPledge[]> {
  try {
    const q = query(collection(db, 'pledges'), orderBy('createdAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    const items: DonationPledge[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as DonationPledge));
    return items;
  } catch (err) {
    console.warn('Error fetching latest pledges:', err);
    return [];
  }
}

/**
 * ============================================================
 * CADASTROS PARA A FESTA BENEFICENTE (Coleção 'registrations')
 * ============================================================
 */

export async function saveRegistrationToFirebase(reg: ChildRegistration): Promise<boolean> {
  const path = `registrations/${reg.id}`;
  try {
    await setDoc(doc(db, 'registrations', reg.id), {
      ...reg,
      status: reg.status || 'ativo',
      createdAt: reg.createdAt || new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to save registration to Firestore:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // Fallback
    }
    return false;
  }
}

export function subscribeToRegistrations(
  onData: (regs: ChildRegistration[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const collectionName = 'registrations';
  try {
    const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'), limit(500));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ChildRegistration[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ChildRegistration);
        });
        onData(items);
      },
      (error) => {
        console.warn('Firestore registrations snapshot error:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not initialize registrations listener:', err);
    return () => {};
  }
}

export async function getLatestRegistrations(): Promise<ChildRegistration[]> {
  try {
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'), limit(500));
    const snapshot = await getDocs(q);
    const items: ChildRegistration[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as ChildRegistration));
    return items;
  } catch (err) {
    console.warn('Error fetching latest registrations:', err);
    return [];
  }
}

export async function deleteRegistrationFromFirebase(id: string): Promise<boolean> {
  const path = `registrations/${id}`;
  try {
    await deleteDoc(doc(db, 'registrations', id));
    return true;
  } catch (error) {
    console.error('Failed to delete registration from Firestore:', error);
    return false;
  }
}

/**
 * ============================================================
 * SISTEMA DE SORTEIO DE CREDENCIAIS (Coleção 'raffles')
 * ============================================================
 */

export async function saveRaffleDrawToFirebase(draw: RaffleDraw): Promise<boolean> {
  const path = `raffles/${draw.id}`;
  try {
    await setDoc(doc(db, 'raffles', draw.id), draw);
    // Também salvar como atual para recuperação rápida
    await setDoc(doc(db, 'raffles', 'current_draw'), draw);
    return true;
  } catch (error) {
    console.error('Failed to save raffle draw to Firestore:', error);
    return false;
  }
}

export function subscribeToCurrentRaffleDraw(
  onData: (draw: RaffleDraw | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  try {
    return onSnapshot(
      doc(db, 'raffles', 'current_draw'),
      (docSnap) => {
        if (docSnap.exists()) {
          onData(docSnap.data() as RaffleDraw);
        } else {
          onData(null);
        }
      },
      (error) => {
        console.warn('Firestore current raffle draw snapshot error:', error.message);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Could not initialize raffle draw listener:', err);
    return () => {};
  }
}

export async function getLatestRaffleDraw(): Promise<RaffleDraw | null> {
  try {
    const docSnap = await doc(db, 'raffles', 'current_draw');
    const getDocResult = await getDocs(query(collection(db, 'raffles'), limit(1)));
    if (!getDocResult.empty) {
      return getDocResult.docs[0].data() as RaffleDraw;
    }
    return null;
  } catch (err) {
    console.warn('Error fetching latest raffle draw:', err);
    return null;
  }
}

