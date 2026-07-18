import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { Avatar, Badge, Card, PrimaryButton, GhostButton, Toast } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  function doCopy() {
    Clipboard.setString(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <View style={s.detailValueRow}>
        <Text style={s.detailValue}>{value}</Text>
        <TouchableOpacity onPress={doCopy} style={[s.copyBtn, copied && s.copyBtnDone]}>
          <Text style={[s.copyBtnText, copied && { color: Colors.green }]}>
            {copied ? '✓ Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

export default function CustomerDetailScreen({ route, navigation }) {
  const { customer } = route.params;
  const { deleteCustomer, customers } = useCustomers();
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const fresh = customers.find(c => c.id === customer.id) || customer;

  function confirmDelete() {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${fresh.fullName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(fresh.id);
              navigation.goBack();
            } catch {
              setToast({ visible: true, message: 'Failed to delete. Try again.', type: 'error' });
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <Avatar name={fresh.fullName} size={64} />
          <Text style={s.heroName}>{fresh.fullName}</Text>
          <Badge status={fresh.status} />
          <Text style={s.heroPlan}>{fresh.planSpeed} · Joined {fresh.joinDate || '—'}</Text>
        </View>

        <View style={s.idRow}>
          {[['User ID', fresh.userID], ['VLAN ID', fresh.vlanID]].map(([label, val]) => (
            <View key={label} style={s.idCard}>
              <Text style={s.idCardLabel}>{label}</Text>
              <Text style={s.idCardValue}>{val}</Text>
              <TouchableOpacity onPress={() => Clipboard.setString(val)} style={s.idCopy}>
                <Text style={s.idCopyText}>Copy</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>CONTACT DETAILS</Text>
          <Card>
            <CopyRow label="Mobile"    value={fresh.mobile} />
            <CopyRow label="Telephone" value={fresh.telephone} />
          </Card>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>CONNECTION DETAILS</Text>
          <Card>
            <DetailRow label="Father / Husband Name (SO/WO/DO)" value={fresh.fatherName} />
            <DetailRow label="Plan Speed"  value={fresh.planSpeed} />
            <DetailRow label="Status"      value={fresh.status} />
            <CopyRow   label="Address"     value={fresh.address} />
            {fresh.notes ? <DetailRow label="Notes" value={fresh.notes} /> : null}
          </Card>
        </View>

        <View style={s.actions}>
          <PrimaryButton
            title="✏️  Edit Customer"
            onPress={() => navigation.navigate('AddCustomer', { customer: fresh })}
            style={{ flex: 1 }}
          />
          <GhostButton
            title="🗑️  Delete"
            onPress={confirmDelete}
            danger
            style={{ flex: 1 }}
          />
        </View>

        <View style={{ height: 30 }} />
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
  safe:           { flex: 1, backgroundColor: Colors.bg },
  hero:           { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, gap: 10 },
  heroName:       { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: -0.5, textAlign: 'center' },
  heroPlan:       { fontSize: 12, color: Colors.muted, marginTop: 2 },
  idRow:          { flexDirection: 'row', gap: 12, paddingHorizontal: 18, marginBottom: 6 },
  idCard:         { flex: 1, backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.25)', borderRadius: 14, padding: 16, alignItems: 'center' },
  idCardLabel:    { fontSize: 10, color: Colors.cyan, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  idCardValue:    { fontSize: 22, fontWeight: '900', color: Colors.white, marginBottom: 10 },
  idCopy:         { backgroundColor: 'rgba(6,182,212,0.1)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  idCopyText:     { color: Colors.cyan, fontSize: 11, fontWeight: '700' },
  section:        { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle:   { fontSize: 10, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  detailRow:      { paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel:    { fontSize: 10, color: Colors.muted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  detailValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  detailValue:    { fontSize: 14, color: Colors.off, lineHeight: 20, flex: 1 },
  copyBtn:        { backgroundColor: 'rgba(6,182,212,0.08)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  copyBtnDone:    { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' },
  copyBtnText:    { color: Colors.cyan, fontSize: 11, fontWeight: '700' },
  actions:        { flexDirection: 'row', gap: 12, paddingHorizontal: 18, marginTop: 24 },
});