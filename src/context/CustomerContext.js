import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc,
  deleteDoc, doc, serverTimestamp, query,
  orderBy, where, getDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

const CustomerContext = createContext({});

export function CustomerProvider({ children }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [ownerUID,  setOwnerUID]  = useState(null);

  useEffect(() => {
    if (!user) { setCustomers([]); setLoading(false); return; }

    async function setup() {
      // Check if staff or owner
      let uid = user.uid;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Staff uses owner's UID
          if (data.role === 'staff' && data.createdBy) {
            uid = data.createdBy;
          }
        }
      } catch (e) {
        console.log('Role check error:', e);
      }

      setOwnerUID(uid);

      const q = query(
        collection(db, 'customers'),
        where('ownerUID', '==', uid),
        orderBy('createdAt', 'desc')
      );

      return onSnapshot(q, (snap) => {
        setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, (err) => {
        console.log('Customers error:', err);
        setLoading(false);
      });
    }

    let unsub;
    setup().then(fn => { unsub = fn; });
    return () => { if (unsub) unsub(); };
  }, [user]);

  async function addCustomer(data) {
    return addDoc(collection(db, 'customers'), {
      ...data,
      ownerUID:  ownerUID || user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async function updateCustomer(id, data) {
    return updateDoc(doc(db, 'customers', id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async function deleteCustomer(id) {
    return deleteDoc(doc(db, 'customers', id));
  }

  return (
    <CustomerContext.Provider value={{ customers, loading, addCustomer, updateCustomer, deleteCustomer }}>
      {children}
    </CustomerContext.Provider>
  );
}

export const useCustomers = () => useContext(CustomerContext);