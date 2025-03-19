import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { appConfig } from "@/config";

const firebaseConfig = {
  apiKey: appConfig.FIREBASE.CLIENT.API_KEY,
  authDomain: appConfig.FIREBASE.CLIENT.AUTH_DOMAIN,
  projectId: appConfig.FIREBASE.CLIENT.PROJECT_ID,
  storageBucket: appConfig.FIREBASE.CLIENT.STORAGE_BUCKET,
  messagingSenderId: appConfig.FIREBASE.CLIENT.MESSAGING_SENDER_ID,
  appId: appConfig.FIREBASE.CLIENT.APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const clientDb = getFirestore(app);
const clientAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { clientDb, clientAuth, googleProvider };
