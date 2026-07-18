import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Linking,
  ActivityIndicator, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { Card } from '../components/UI';
import { useBusiness } from '../context/BusinessContext';
import { useCustomers } from '../context/CustomerContext';

function InfoRow({ label, value }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function QuickLink({ icon, title, subtitle, onPress, accent }) {
  return (
    <TouchableOpacity
      style={[s.linkCard, { borderLeftColor: accent || Colors.blue }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={s.linkIcon}>{icon}</Text>
      <View style={s.linkInfo}>
        <Text style={s.linkTitle}>{title}</Text>
        <Text style={s.linkSub}>{subtitle}</Text>
      </View>
      <Text style={s.linkArrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function BusinessScreen({ navigation }) {
  const { profile }                    = useBusiness();
  const { customers, deleteCustomer }  = useCustomers();
  const [refreshing,      setRefreshing]      = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput,     setDeleteInput]     = useState('');
  const [deleting,        setDeleting]        = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  const stats = {
    total:    customers.length,
    active:   customers.filter(c => c.status === 'Active').length,
    inactive: customers.filter(c => c.status === 'Inactive').length,
    pending:  customers.filter(c => c.status === 'Pending').length,
  };

  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const addedThisMonth = customers.filter(c =>
    c.joinDate?.startsWith(new Date().toISOString().slice(0, 7))
  ).length;

  async function handleDeleteAll() {
    if (deleteInput !== 'DELETE') {
      Alert.alert('Wrong input', 'Please type DELETE in capitals to confirm.');
      return;
    }
    setDeleting(true);
    try {
      for (const c of customers) {
        await deleteCustomer(c.id);
      }
      setShowDeleteModal(false);
      setDeleteInput('');
      Alert.alert('✅ Done', 'All customer data has been deleted.');
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.businessIcon}>
            <Text style={{ fontSize: 32 }}>🏢</Text>
          </View>
          <Text style={s.businessName}>{profile.businessName || 'Your Business'}</Text>
          <Text style={s.businessArea}>{profile.area || 'Service Area'} · {profile.city || 'City'}</Text>
        </View>

        {/* Stats */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>THIS MONTH — {month}</Text>
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statValue}>{stats.total}</Text>
              <Text style={s.statLabel}>Total</Text>
            </View>
            <View style={[s.statCard, { borderTopColor: Colors.green }]}>
              <Text style={[s.statValue, { color: Colors.green }]}>{stats.active}</Text>
              <Text style={s.statLabel}>Active</Text>
            </View>
            <View style={[s.statCard, { borderTopColor: Colors.cyan }]}>
              <Text style={[s.statValue, { color: Colors.cyan }]}>{addedThisMonth}</Text>
              <Text style={s.statLabel}>New</Text>
            </View>
            <View style={[s.statCard, { borderTopColor: Colors.yellow }]}>
              <Text style={[s.statValue, { color: Colors.yellow }]}>{stats.pending}</Text>
              <Text style={s.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Business info */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>BUSINESS DETAILS</Text>
          <Card>
            <InfoRow label="Owner Name"   value={profile.ownerName} />
            <InfoRow label="Business"     value={profile.businessName} />
            <InfoRow label="Dealer Code"  value={profile.dealerCode} />
            <InfoRow label="Phone"        value={profile.phone} />
            <InfoRow label="Service Area" value={profile.area} />
            <InfoRow label="City"         value={profile.city} />
            <InfoRow label="Address"      value={profile.address} />
          </Card>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
          >
            <Text style={s.editBtnText}>✏️  Edit Business Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Quick links */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>QUICK LINKS</Text>
          <View style={s.linksList}>
            <QuickLink
              icon="👥"
              title="Manage Staff"
              subtitle="Add or remove staff logins"
              onPress={() => navigation.navigate('Staff')}
              accent={Colors.indigo}
            />
            <QuickLink
              icon="🌐"
              title="BSNL Portal"
              subtitle="Check connections and bill status"
              onPress={() => Linking.openURL('https://portal.bsnl.in')}
              accent={Colors.blue}
            />
            <QuickLink
              icon="📞"
              title="BSNL Helpline"
              subtitle="Call 1800-180-1503 for support"
              onPress={() => Linking.openURL('tel:18001801503')}
              accent={Colors.green}
            />
            <QuickLink
              icon="📊"
              title="View Reports"
              subtitle="Monthly summary and analytics"
              onPress={() => navigation.navigate('Reports')}
              accent={Colors.cyan}
            />
            <QuickLink
              icon="📤"
              title="Export Data"
              subtitle="Export your customer list"
              onPress={() => navigation.navigate('Export')}
              accent={Colors.yellow}
            />
            <QuickLink
              icon="📥"
              title="Import from BSNL FMS"
              subtitle="Bulk import customers from Excel export"
              onPress={() => navigation.navigate('Import')}
              accent={Colors.green}
            />
          </View>
        </View>

        {/* Danger zone */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DANGER ZONE</Text>
          <TouchableOpacity
            style={s.deleteAllBtn}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.7}
          >
            <Text style={s.deleteAllText}>🗑️  Delete All Customer Data</Text>
            <Text style={s.deleteAllSub}>{customers.length} customers will be deleted</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Delete All Modal */}
      {showDeleteModal && (
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.modalTop} />
            <Text style={s.modalIcon}>⚠️</Text>
            <Text style={s.modalTitle}>Delete All Customers?</Text>
            <Text style={s.modalSub}>
              This will permanently delete all {customers.length} customer records. This cannot be undone.
            </Text>
            <Text style={s.modalLabel}>Type DELETE to confirm:</Text>
            <TextInput
              style={s.modalInput}
              value={deleteInput}
              onChangeText={setDeleteInput}
              placeholder="DELETE"
              placeholderTextColor={Colors.muted}
              autoCapitalize="characters"
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.modalCancelBtn}
                onPress={() => { setShowDeleteModal(false); setDeleteInput(''); }}
                activeOpacity={0.7}
              >
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              {deleting ? (
                <View style={[s.modalDeleteBtn, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              ) : (
                <TouchableOpacity
                  style={[s.modalDeleteBtn, deleteInput !== 'DELETE' && s.modalDeleteBtnDisabled]}
                  onPress={handleDeleteAll}
                  activeOpacity={0.7}
                >
                  <Text style={s.modalDeleteText}>Delete All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:                  { flex: 1, backgroundColor: Colors.bg },
  header:                { alignItems: 'center', paddingTop: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.border, marginHorizontal: 18 },
  businessIcon:          { width: 80, height: 80, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  businessName:          { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: -0.5, textAlign: 'center' },
  businessArea:          { fontSize: 13, color: Colors.muted, marginTop: 4 },
  section:               { paddingHorizontal: 18, marginTop: 20 },
  sectionLabel:          { fontSize: 10, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  statsRow:              { flexDirection: 'row', gap: 10 },
  statCard:              { flex: 1, backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 2, borderTopColor: Colors.blue, padding: 12, alignItems: 'center' },
  statValue:             { fontSize: 22, fontWeight: '900', color: Colors.white },
  statLabel:             { fontSize: 10, color: Colors.muted, marginTop: 4, fontWeight: '600' },
  infoRow:               { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel:             { fontSize: 12, color: Colors.muted, fontWeight: '600' },
  infoValue:             { fontSize: 13, color: Colors.white, fontWeight: '500', flex: 1, textAlign: 'right' },
  editBtn:               { marginTop: 12, padding: 14, borderRadius: 50, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.card },
  editBtnText:           { color: Colors.cyan, fontWeight: '700', fontSize: 14 },
  linksList:             { gap: 10 },
  linkCard:              { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  linkIcon:              { fontSize: 24 },
  linkInfo:              { flex: 1 },
  linkTitle:             { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 3 },
  linkSub:               { fontSize: 12, color: Colors.muted },
  linkArrow:             { fontSize: 18, color: Colors.muted },
  deleteAllBtn:          { padding: 18, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.06)' },
  deleteAllText:         { color: Colors.red, fontWeight: '700', fontSize: 14, marginBottom: 4 },
  deleteAllSub:          { color: 'rgba(239,68,68,0.5)', fontSize: 12 },
  modalOverlay:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 999 },
  modalCard:             { backgroundColor: Colors.card, borderRadius: 20, padding: 28, width: '100%', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', overflow: 'hidden' },
  modalTop:              { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.red },
  modalIcon:             { fontSize: 44, textAlign: 'center', marginBottom: 12 },
  modalTitle:            { fontSize: 20, fontWeight: '900', color: Colors.white, textAlign: 'center', marginBottom: 8 },
  modalSub:              { fontSize: 13, color: Colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalLabel:            { fontSize: 11, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  modalInput:            { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1.5, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 18, color: Colors.white, fontWeight: '800', textAlign: 'center', letterSpacing: 4, marginBottom: 20 },
  modalActions:          { flexDirection: 'row', gap: 12 },
  modalCancelBtn:        { flex: 1, padding: 13, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  modalCancelText:       { color: Colors.off, fontWeight: '600', fontSize: 14 },
  modalDeleteBtn:        { flex: 1, padding: 13, borderRadius: 10, backgroundColor: Colors.red, alignItems: 'center' },
  modalDeleteBtnDisabled:{ opacity: 0.4 },
  modalDeleteText:       { color: '#fff', fontWeight: '700', fontSize: 14 },
});