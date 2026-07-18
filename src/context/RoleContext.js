import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  doc, onSnapshot, setDoc, collection,
  updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth, staffAuth } from '../lib/firebase';
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
        const data = snap.data();
        if (data.disabled) {
          // Access was revoked by the workspace owner — refuse the session.
          setRole(null);
          setLoading(false);
          Alert.alert(
            'Access removed',
            'Your access to this workspace has been removed. Please contact the business owner.'
          );
          signOut(auth).catch(() => {});
          return;
        }
        setRole(data.role || 'staff');
      } else {
        // First user on a fresh workspace = owner.
        // Safe because staff docs are soft-revoked (never deleted): a removed
        // staff member still has a doc — with disabled:true — and is stopped above.
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

  // Get all active staff (owner only)
  useEffect(() => {
    if (!user || role !== 'owner') return;

    const ref  = collection(db, 'users');
    const unsub = onSnapshot(ref, (snap) => {
      setStaff(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => !u.disabled && u.id !== user.uid)
      );
    });

    return unsub;
  }, [user, role]);

  async function addStaff(email, password, name) {
    // Create the account on the secondary in-memory auth instance so the
    // owner's session is never replaced by the new staff user.
    const cred = await createUserWithEmailAndPassword(staffAuth, email, password);
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        role:      'staff',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
      });
    } finally {
      // Always drop the throwaway staff session, success or failure.
      await signOut(staffAuth).catch(() => {});
    }
    return cred;
  }

  async function removeStaff(staffId) {
    // Soft-revoke instead of deleting the user doc. The doc stays behind as a
    // tombstone: if the revoked account signs in again, RoleProvider detects
    // disabled:true and refuses the session (instead of the blank-doc fallback
    // promoting them to owner of a fresh workspace).
    await updateDoc(doc(db, 'users', staffId), {
      disabled:  true,
      revokedAt: serverTimestamp(),
    });
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