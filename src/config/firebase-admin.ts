import { initializeApp, getApps, cert } from 'firebase-admin/app';

const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
};

export function customInitApp() {
  if (getApps().length <= 0) {
    initializeApp(firebaseAdminConfig);
  }
}
