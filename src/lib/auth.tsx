'use client';

import {
  GoogleAuthProvider,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { REAUTH_EVENT } from './data';
import { firebase } from './firebase';
import type { Role } from './types';

type Session =
  | { status: 'loading' }
  | { status: 'unconfigured'; error: string }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: User; role: Role; merchantId: string | null };

type AuthContextValue = {
  session: Session;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  /** Signs out and returns to sign-in; `reason` shows a notice there. */
  signOut: (reason?: 'session-ended') => Promise<void>;
  /** Forces a fresh ID token so newly granted claims take effect. */
  refreshClaims: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Role changes revoke refresh tokens server-side; these codes mean "sign in again". */
export function isSessionEnded(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return (
    code === 'auth/user-token-expired' ||
    code === 'auth/invalid-user-token' ||
    code === 'auth/user-disabled' ||
    code === 'auth/user-not-found' ||
    code === 'functions/unauthenticated'
  );
}

async function readSession(user: User, forceRefresh = false): Promise<Session> {
  const token = await user.getIdTokenResult(forceRefresh);
  const claimRole = token.claims.role;
  const role: Role = claimRole === 'admin' || claimRole === 'merchant' ? claimRole : 'customer';
  const merchantId = typeof token.claims.merchantId === 'string' ? token.claims.merchantId : null;
  // A merchant claim without a merchantId cannot scope any query: treat as no access.
  if (role === 'merchant' && !merchantId) return { status: 'signed-in', user, role: 'customer', merchantId: null };
  return { status: 'signed-in', user, role, merchantId };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({ status: 'loading' });

  useEffect(() => {
    let services;
    try {
      services = firebase();
    } catch (error) {
      queueMicrotask(() =>
        setSession({ status: 'unconfigured', error: error instanceof Error ? error.message : String(error) })
      );
      return;
    }
    // onIdTokenChanged also fires after getIdToken(true), so claim changes propagate.
    return onIdTokenChanged(services.auth, async (user) => {
      if (!user) {
        setSession({ status: 'signed-out' });
        return;
      }
      try {
        setSession(await readSession(user));
      } catch {
        setSession({ status: 'signed-out' });
      }
    });
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebase().auth, email.trim(), password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(firebase().auth, provider);
  }, []);

  const sendReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(firebase().auth, email.trim());
  }, []);

  const signOut = useCallback(async (reason?: 'session-ended') => {
    const { auth, db } = firebase();
    await firebaseSignOut(auth);
    // Drop any cached documents from the previous account, then reload so no
    // in-memory listeners or data survive into the next session.
    try {
      await terminate(db);
      await clearIndexedDbPersistence(db);
    } catch {
      // Memory cache only; nothing persisted.
    }
    window.location.replace(reason ? `/sign-in?reason=${reason}` : '/sign-in');
  }, []);

  // Any callable answering REAUTH_REQUIRED ends the session everywhere in the app.
  useEffect(() => {
    const onReauth = () => {
      void signOut('session-ended');
    };
    window.addEventListener(REAUTH_EVENT, onReauth);
    return () => window.removeEventListener(REAUTH_EVENT, onReauth);
  }, [signOut]);

  const refreshClaims = useCallback(async () => {
    const user = firebase().auth.currentUser;
    if (!user) return;
    await user.getIdToken(true);
    setSession(await readSession(user));
  }, []);

  const value = useMemo(
    () => ({ session, signInWithEmail, signInWithGoogle, sendReset, signOut, refreshClaims }),
    [session, signInWithEmail, signInWithGoogle, sendReset, signOut, refreshClaims]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** For pages inside a role gate: the session is guaranteed signed in. */
export function useSignedIn() {
  const { session } = useAuth();
  if (session.status !== 'signed-in') throw new Error('useSignedIn used outside a role gate');
  return session;
}

/** Merchant pages: merchantId comes only from verified token claims. */
export function useMerchantId(): string {
  const session = useSignedIn();
  if (!session.merchantId) throw new Error('No merchantId claim');
  return session.merchantId;
}
