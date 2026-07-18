import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc, onSnapshot, setDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const BusinessContext = createContext({});

const EMPTY_PROFILE = {
  ownerName:    '',
  businessName: '',
  phone:        '',
  email:        '',
  address:      '',
  dealerCode:   '',
  area:         '',
  city:         '',
};

export function BusinessProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset profile when user changes
    setProfile(EMPTY_PROFILE);
    setLoading(true);

    if (!user) { setLoading(false); return; }

    const ref   = doc(db, 'business', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile({ ...EMPTY_PROFILE, ...snap.data() });
      } else {
        // New user — set empty profile
        setProfile(EMPTY_PROFILE);
      }
      setLoading(false);
    }, (err) => {
      console.log('Business error:', err);
      setLoading(false);
    });

    return unsub;
  }, [user?.uid]); // Watch user.uid specifically

  async function updateProfile(data) {
    if (!user) return;
    const ref   = doc(db, 'business', user.uid);
    const clean = {};
    Object.keys(data).forEach(k => { clean[k] = data[k] ?? ''; });
    return setDoc(ref, { ...clean, updatedAt: serverTimestamp() }, { merge: true });
  }

  return (
    <BusinessContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => useContext(BusinessContext);