import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc, onSnapshot, setDoc, collection,
  deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { useAuth } from './AuthContext';

const RoleContext = createContext({});

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const [role,    setRole]    = useState(null);
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current user role
  useEffect(() => {
    if (!user) { setRole(null); setLoading(false); return; }

    const ref  = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setRole(snap.data().role || 'staff');
      } else {
        // First user = owner
        setDoc(ref, {
          email:     user.email,
          role:      'owner',
          createdAt: serverTimestamp(),
        });
        setRole('owner');
      }
      setLoading(false);
    }, () => setLoading(false));

    return unsub;
  }, [user]);

  // Get all staff (owner only)
  useEffect(() => {
    if (!user || role !== 'owner') return;

    const ref  = collection(db, 'users');
    const unsub = onSnapshot(ref, (snap) => {
      setStaff(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.id !== user.uid)
      );
    });

    return unsub;
  }, [user, role]);

  async function addStaff(email, password, name) {
    // Create Firebase auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Save to Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      email,
      name,
      role:      'staff',
      createdAt: serverTimestamp(),
      createdBy: user.uid,
    });
    return cred;
  }

  async function removeStaff(staffId) {
    await deleteDoc(doc(db, 'users', staffId));
  }

  const isOwner = role === 'owner';
  const isStaff = role === 'staff';

  return (
    <RoleContext.Provider value={{ role, staff, loading, isOwner, isStaff, addStaff, removeStaff }}>
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => useContext(RoleContext);