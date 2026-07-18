import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey:            "AIzaSyCCnDgTP5Kvv_yosJZoIP1KMsRm8Gyk9N8",
  authDomain:        "fibcast-2f945.firebaseapp.com",
  projectId:         "fibcast-2f945",
  storageBucket:     "fibcast-2f945.firebasestorage.app",
  messagingSenderId: "1058784328202",
  appId:             "1:1058784328202:web:0572d622c9abd0f01d7df3",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

// ── Staff provisioning ─────────────────────────────────────────
// Secondary, in-memory-only app used EXCLUSIVELY to create staff
// auth accounts. createUserWithEmailAndPassword signs the caller
// into the auth instance it was called on — using a throwaway
// instance means the signed-in owner's session is never replaced.
const staffApp = initializeApp(firebaseConfig, 'fibcast-staff-provisioning');

export const staffAuth = initializeAuth(staffApp, {
  persistence: inMemoryPersistence,
});