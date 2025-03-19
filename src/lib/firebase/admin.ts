import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { appConfig } from "@/config";

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert({
        projectId: appConfig.FIREBASE.ADMIN.PROJECT_ID,
        clientEmail: appConfig.FIREBASE.ADMIN.CLIENT_EMAIL,
        privateKey: appConfig.FIREBASE.ADMIN.PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  : getApps()[0];

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

export { adminDb, adminAuth };
