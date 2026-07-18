import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { Avatar, Card, FormInput, PrimaryButton, GhostButton, Toast, EmptyState } from '../components/UI';
import { useRole } from '../context/RoleContext';

function StaffCard({ member, onRemove }) {
  return (
    <View style={s.staffCard}>
      <Avatar name={member.name || member.email} size={44} />
      <View style={s.staffInfo}>
        <Text style={s.staffName}>{member.name || 'Staff Member'}</Text>
        <Text style={s.staffEmail}>{member.email}</Text>
        <View style={s.staffRolePill}>
          <Text style={s.staffRoleText}>👤 Staff</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(member)}
        style={s.removeBtn}
        activeOpacity={0.7}
      >
        <Text style={s.removeBtnText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function StaffScreen() {
  const { staff, addStaff, removeStaff, isOwner } = useRole();
  const [showForm,   setShowForm]   = useState(false);
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [loading,    setLoading]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast,      setToast]      = useState({ visible: false, message: '', type: 'success' });

  async function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  async function handleAddStaff() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setToast({ visible: true, message: 'All fields are required.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setToast({ visible: true, message: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await addStaff(email.trim(), password, name.trim());
      setToast({ visible: true, message: `${name} added as staff!`, type: 'success' });
      setName(''); setEmail(''); setPassword('');
      setShowForm(false);
    } catch (e) {
      const msg = e.code === 'auth/email-already-in-use'
        ? 'This email is already registered.'
        : 'Failed to add staff. Try again.';
      setToast({ visible: true, message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function confirmRemove(member) {
    Alert.alert(
      'Remove Staff',
      `Are you sure you want to remove ${member.name || member.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try {
              await removeStaff(member.id);
              setToast({ visible: true, message: 'Staff member removed.', type: 'success' });
            } catch {
              setToast({ visible: true, message: 'Failed to remove. Try again.', type: 'error' });
            }
          },
        },
      ]
    );
  }

  if (!isOwner) {
    return (
      <SafeAreaView style={s.safe}>
        <EmptyState
          icon="🔒"
          title="Owner Access Only"
          subtitle="Only the account owner can manage staff members."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>Staff</Text>
            <Text style={s.sub}>{staff.length} staff member{staff.length !== 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => setShowForm(!showForm)}
            activeOpacity={0.7}
          >
            <Text style={s.addBtnText}>{showForm ? '✕ Cancel' : '+ Add Staff'}</Text>
          </TouchableOpacity>
        </View>

        {/* Add staff form */}
        {showForm && (
          <View style={s.formCard}>
            <View style={s.formCardTop} />
            <Text style={s.formTitle}>Add New Staff Member</Text>
            <Text style={s.formSub}>They will use these credentials to log in.</Text>

            <FormInput
              label="Full Name"
              required
              value={name}
              onChangeText={setName}
              placeholder="Rajdeep Singh"
            />
            <FormInput
              label="Email"
              required
              value={email}
              onChangeText={setEmail}
              placeholder="staff@fibcast.in"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              label="Password"
              required
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              secureTextEntry
            />

            <View style={s.formActions}>
              {loading ? (
                <ActivityIndicator color={Colors.cyan} size="large" />
              ) : (
                <>
                  <GhostButton title="Cancel" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
                  <PrimaryButton title="Add Staff" onPress={handleAddStaff} style={{ flex: 1 }} />
                </>
              )}
            </View>
          </View>
        )}

        {/* Role info */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACCESS LEVELS</Text>
          <Card>
            <View style={s.roleRow}>
              <Text style={s.roleIcon}>👑</Text>
              <View style={s.roleInfo}>
                <Text style={s.roleName}>Owner (You)</Text>
                <Text style={s.roleDesc}>Full access — add/delete customers, manage staff, view reports, export data</Text>
              </View>
            </View>
            <View style={[s.roleRow, { borderBottomWidth: 0 }]}>
              <Text style={s.roleIcon}>👤</Text>
              <View style={s.roleInfo}>
                <Text style={s.roleName}>Staff</Text>
                <Text style={s.roleDesc}>Can view and add customers, search, check bills — cannot delete or manage staff</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Staff list */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>YOUR TEAM ({staff.length})</Text>
          {staff.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No staff yet"
              subtitle="Add staff members so your team can manage customers."
              onAction={() => setShowForm(true)}
              actionLabel="+ Add First Staff"
            />
          ) : (
            <Card>
              {staff.map((member, i) => (
                <View key={member.id} style={i < staff.length - 1 ? s.staffRowBorder : null}>
                  <StaffCard member={member} onRemove={confirmRemove} />
                </View>
              ))}
            </Card>
          )}
        </View>

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
  safe:          { flex: 1, backgroundColor: Colors.bg },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12 },
  title:         { fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  sub:           { fontSize: 13, color: Colors.muted, marginTop: 2 },
  addBtn:        { backgroundColor: Colors.blue, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 9 },
  addBtnText:    { color: '#fff', fontWeight: '700', fontSize: 14 },
  formCard:      { marginHorizontal: 18, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 20, marginBottom: 16, overflow: 'hidden' },
  formCardTop:   { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.blue },
  formTitle:     { fontSize: 16, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  formSub:       { fontSize: 12, color: Colors.muted, marginBottom: 20 },
  formActions:   { flexDirection: 'row', gap: 12, marginTop: 8 },
  section:       { paddingHorizontal: 18, marginTop: 16 },
  sectionLabel:  { fontSize: 10, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  roleRow:       { flexDirection: 'row', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  roleIcon:      { fontSize: 22 },
  roleInfo:      { flex: 1 },
  roleName:      { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  roleDesc:      { fontSize: 12, color: Colors.muted, lineHeight: 18 },
  staffCard:     { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  staffRowBorder:{ borderBottomWidth: 1, borderBottomColor: Colors.border },
  staffInfo:     { flex: 1, minWidth: 0 },
  staffName:     { fontSize: 14, fontWeight: '700', color: Colors.white },
  staffEmail:    { fontSize: 12, color: Colors.muted, marginTop: 2 },
  staffRolePill: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)', borderRadius: 50, paddingHorizontal: 10, paddingVertical: 3 },
  staffRoleText: { fontSize: 11, color: Colors.cyan, fontWeight: '600' },
  removeBtn:     { backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  removeBtnText: { color: Colors.red, fontSize: 12, fontWeight: '700' },
});