import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { FormInput, PrimaryButton, Toast } from '../components/UI';
import { useBusiness } from '../context/BusinessContext';

export default function EditProfileScreen() {
  const { profile, loading, updateProfile } = useBusiness();
  const [form,   setForm]   = useState(profile);
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState({ visible: false, message: '', type: 'success' });

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

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loader}><ActivityIndicator color={Colors.cyan} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Personal */}
        <Text style={s.groupLabel}>PERSONAL DETAILS</Text>
        <FormInput label="Owner Name" value={form.ownerName} onChangeText={t => set('ownerName', t)} placeholder="Rajdeep Singh" />
        <FormInput label="Phone"      value={form.phone}     onChangeText={t => set('phone', t)}     placeholder="9876543210" keyboardType="phone-pad" />

        {/* Business */}
        <Text style={s.groupLabel}>BUSINESS DETAILS</Text>
        <FormInput label="Business Name" value={form.businessName} onChangeText={t => set('businessName', t)} placeholder="True Master Fiber" />
        <FormInput label="Dealer Code"   value={form.dealerCode}   onChangeText={t => set('dealerCode', t)}   placeholder="BSNL Dealer Code" />
        <FormInput label="Service Area"  value={form.area}         onChangeText={t => set('area', t)}         placeholder="e.g. Gurdaspur, Pathankot" />
        <FormInput label="City"          value={form.city}         onChangeText={t => set('city', t)}         placeholder="Ludhiana" />
        <FormInput label="Address"       value={form.address}      onChangeText={t => set('address', t)}      placeholder="Office address" multiline />

        <PrimaryButton title="Save Profile" onPress={save} loading={saving} style={{ marginTop: 20 }} />

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
  safe:       { flex: 1, backgroundColor: Colors.bg },
  scroll:     { padding: 20 },
  loader:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  groupLabel: { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 18, marginBottom: 10 },
});
