import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Shadow } from '../theme';
import { FormInput, PrimaryButton, Toast } from '../components/UI';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { profile, loading, updateProfile } = useBusiness();
  const { user, logout } = useAuth();
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  useEffect(() => { setForm(profile); }, [profile]);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function save() {
    setSaving(true);
    try {
      await updateProfile(form);
      setToast({ visible: true, message: 'Profile saved!', type: 'success' });
    } catch {
      setToast({ visible: true, message: 'Failed to save. Try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  }

 async function onRefresh() {
  setRefreshing(true);
  setForm(profile);
  setTimeout(() => setRefreshing(false), 800);
}

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loader}><ActivityIndicator color={Colors.cyan} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
      >
        {/* Avatar */}
        <View style={s.avatarWrap}>
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.avatar, Shadow.glow(Colors.blue)]}
          >
            <Text style={s.avatarText}>
              {form.ownerName ? form.ownerName[0].toUpperCase() : '👤'}
            </Text>
          </LinearGradient>
          <Text style={s.avatarName}>{form.ownerName || 'Your Name'}</Text>
          <Text style={s.avatarEmail}>{user?.email}</Text>
        </View>

        {/* Personal */}
        <Text style={s.groupLabel}>PERSONAL DETAILS</Text>
        <FormInput label="Owner Name"  value={form.ownerName}    onChangeText={t => set('ownerName', t)}    placeholder="Rajdeep Singh" />
        <FormInput label="Phone"       value={form.phone}        onChangeText={t => set('phone', t)}        placeholder="9876543210" keyboardType="phone-pad" />

        {/* Business */}
        <Text style={s.groupLabel}>BUSINESS DETAILS</Text>
        <FormInput label="Business Name"  value={form.businessName} onChangeText={t => set('businessName', t)} placeholder="True Master Fiber" />
        <FormInput label="Dealer Code"    value={form.dealerCode}   onChangeText={t => set('dealerCode', t)}   placeholder="BSNL Dealer Code" />
        <FormInput label="Service Area"   value={form.area}         onChangeText={t => set('area', t)}         placeholder="e.g. Gurdaspur, Pathankot" />
        <FormInput label="City"           value={form.city}         onChangeText={t => set('city', t)}         placeholder="Ludhiana" />
        <FormInput label="Address"        value={form.address}      onChangeText={t => set('address', t)}      placeholder="Office address" multiline />

        {/* Save */}
        <PrimaryButton title="Save Profile" onPress={save} loading={saving} style={{ marginTop: 20 }} />

        {/* Sign out */}
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={() => setToast(t => ({ ...t, visible: false }))}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  scroll:      { padding: 20 },
  loader:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarWrap:  { alignItems: 'center', marginBottom: 28, paddingTop: 12 },
  avatar:      { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText:  { fontSize: 34, fontWeight: '900', color: '#fff' },
  avatarName:  { fontSize: 21, fontWeight: '900', color: Colors.white, letterSpacing: -0.6 },
  avatarEmail: { fontSize: 13, color: Colors.muted, marginTop: 4 },
  groupLabel:  { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 18, marginBottom: 10 },
  logoutBtn:   { marginTop: 24, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.30)', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)' },
  logoutText:  { color: Colors.redSoft, fontWeight: '800', fontSize: 14 },
});