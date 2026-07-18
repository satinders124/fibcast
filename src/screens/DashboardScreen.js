import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { Avatar, Badge, Card, PrimaryButton, EmptyState } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

function StatCard({ icon, label, value, accent }) {
  return (
    <View style={[s.statCard, { borderTopColor: accent || Colors.blue }]}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const { customers, loading } = useCustomers();
  const { user, logout } = useAuth();
  const { profile } = useBusiness();
  const [refreshing, setRefreshing] = useState(false);

  const total    = customers.length;
const active   = customers.filter(c => c.status === 'Active').length;
const paid     = customers.filter(c => c.billPaid === 'Paid').length;
const unpaid   = customers.filter(c => c.billPaid === 'Unpaid' || !c.billPaid).length;

  const thisMonth = new Date().toISOString().slice(0, 7);
  const addedThisMonth = customers.filter(c => c.joinDate?.startsWith(thisMonth)).length;
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

  const recent = [...customers]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 6);

  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  async function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  function callCustomer(mobile) {
    Linking.openURL(`tel:${mobile}`);
  }

  function whatsappCustomer(mobile, name) {
    const msg = encodeURIComponent(`Hello ${name}, regarding your BSNL broadband connection.`);
    Linking.openURL(`whatsapp://send?phone=91${mobile}&text=${msg}`);
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loader}>
          <ActivityIndicator color={Colors.cyan} size="large" />
          <Text style={s.loaderText}>Loading Fibcast…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.cyan}
            colors={[Colors.cyan]}
          />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>
              {profile.businessName || 'Dashboard'} 👋
            </Text>
            <Text style={s.greetingSub}>{month}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
  <TouchableOpacity
    onPress={() => navigation.navigate('Business')}
    activeOpacity={0.7}
  >
    <View style={s.profileAvatar}>
      <Text style={{ fontSize: 15 }}>
        {profile.ownerName ? profile.ownerName[0].toUpperCase() : '👤'}
      </Text>
    </View>
  </TouchableOpacity>
  <TouchableOpacity
    onPress={() => {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: logout },
        ]
      );
    }}
    activeOpacity={0.7}
    style={s.logoutBtn}
  >
    <Text style={s.logoutText}>Out</Text>
  </TouchableOpacity>
</View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
  <StatCard icon="👥" label="Total"   value={total}   accent={Colors.blue}  />
  <StatCard icon="✅" label="Active"  value={active}  accent={Colors.green} />
  <StatCard icon="💰" label="Paid"    value={paid}    accent={Colors.cyan}  />
  <StatCard icon="🔴" label="Unpaid"  value={unpaid}  accent={Colors.red}   />
</View>

        {/* Active rate bar */}
        <View style={s.rateCard}>
          <View style={s.rateCardTop} />
          <View style={s.rateRow}>
            <View>
              <Text style={s.rateTitle}>Active Rate</Text>
              <Text style={s.rateSub}>{active} active of {total} total</Text>
            </View>
            <Text style={s.rateValue}>{activeRate}%</Text>
          </View>
          <View style={s.rateBarWrap}>
            <View style={[s.rateBar, { width: `${activeRate}%` }]} />
          </View>
        </View>

        {/* This month */}
        <View style={s.monthRow}>
          <View style={s.monthCard}>
            <Text style={s.monthIcon}>🆕</Text>
            <Text style={s.monthValue}>{addedThisMonth}</Text>
            <Text style={s.monthLabel}>Added this month</Text>
          </View>
          <View style={s.monthCard}>
            <Text style={s.monthIcon}>📶</Text>
            <Text style={s.monthValue}>{active}</Text>
            <Text style={s.monthLabel}>Live connections</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={s.sectionHead}>Quick Actions</Text>
        <View style={s.quickActions}>
          <TouchableOpacity
            style={s.quickBtn}
            onPress={() => navigation.navigate('AddCustomer')}
            activeOpacity={0.7}
          >
            <Text style={s.quickBtnIcon}>➕</Text>
            <Text style={s.quickBtnText}>Add Customer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.quickBtn}
            onPress={() => navigation.navigate('Search')}
            activeOpacity={0.7}
          >
            <Text style={s.quickBtnIcon}>🔍</Text>
            <Text style={s.quickBtnText}>Quick Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.quickBtn}
            onPress={() => navigation.navigate('Bills')}
            activeOpacity={0.7}
          >
            <Text style={s.quickBtnIcon}>💰</Text>
            <Text style={s.quickBtnText}>Bill Status</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.quickBtn}
            onPress={() => navigation.navigate('Business', { screen: 'Reports' })}
            activeOpacity={0.7}
          >
            <Text style={s.quickBtnIcon}>📊</Text>
            <Text style={s.quickBtnText}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Pending customers alert */}
        {unpaid > 0 && (
  <View style={s.alertCard}>
    <View style={s.alertTop} />
    <Text style={s.alertTitle}>🔴 {unpaid} Unpaid Bill{unpaid > 1 ? 's' : ''} This Month</Text>
    <Text style={s.alertSub}>These customers have not paid their BSNL bill yet.</Text>
    <TouchableOpacity
      onPress={() => navigation.navigate('Bills')}
      activeOpacity={0.7}
    >
      <Text style={s.alertLink}>View unpaid customers →</Text>
    </TouchableOpacity>
  </View>
)}

        {/* Recent customers */}
        <Text style={s.sectionHead}>Recent Customers</Text>
        <Card>
          {recent.length === 0 ? (
            <EmptyState
              icon="📡"
              title="No customers yet"
              subtitle="Add your first BSNL customer to get started."
              onAction={() => navigation.navigate('AddCustomer')}
              actionLabel="+ Add Customer"
            />
          ) : (
            recent.map((c, i) => (
              <View
                key={c.id}
                style={[s.customerRow, i < recent.length - 1 && s.customerRowBorder]}
              >
                <TouchableOpacity
                  style={s.customerMain}
                  onPress={() => navigation.navigate('CustomerDetail', { customer: c })}
                  activeOpacity={0.7}
                >
                  <Avatar name={c.fullName} size={42} />
                  <View style={s.customerInfo}>
                    <Text style={s.customerName} numberOfLines={1}>{c.fullName}</Text>
                    <Text style={s.customerMeta}>{c.userID} · {c.planSpeed}</Text>
                    <Text style={s.customerPhone}>{c.mobile}</Text>
                  </View>
                  <View style={s.customerRight}>
                    <Badge status={c.status} />
                  </View>
                </TouchableOpacity>

                {/* Call + WhatsApp buttons */}
                <View style={s.contactBtns}>
                  <TouchableOpacity
                    style={s.contactBtn}
                    onPress={() => callCustomer(c.mobile)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14 }}>📞</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.contactBtn, s.contactBtnWA]}
                    onPress={() => whatsappCustomer(c.mobile, c.fullName)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14 }}>💬</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>

        {customers.length > 6 && (
          <TouchableOpacity
            style={s.viewAllBtn}
            onPress={() => navigation.navigate('Customers')}
            activeOpacity={0.7}
          >
            <Text style={s.viewAllText}>View All {customers.length} Customers →</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: Colors.bg },
  scroll:             { flex: 1, paddingHorizontal: 18 },
  loader:             { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText:         { color: Colors.muted, fontSize: 14 },

header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginBottom: 20, paddingRight: 4 },  greeting:           { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  greetingSub:        { fontSize: 12, color: Colors.muted, marginTop: 2 },
  profileBtn:         { padding: 2 },
  profileAvatar:      { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.cyan },

  statsRow:           { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:           { flex: 1, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 2, padding: 12, alignItems: 'center' },
  statIcon:           { fontSize: 18, marginBottom: 6 },
  statValue:          { fontSize: 20, fontWeight: '900', color: Colors.white, lineHeight: 22 },
  statLabel:          { fontSize: 9, color: Colors.muted, marginTop: 3, fontWeight: '600' },

  rateCard:           { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 14, overflow: 'hidden' },
  rateCardTop:        { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.cyan },
  rateRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rateTitle:          { fontSize: 14, fontWeight: '700', color: Colors.white },
  rateSub:            { fontSize: 11, color: Colors.muted, marginTop: 2 },
  rateValue:          { fontSize: 28, fontWeight: '900', color: Colors.cyan },
  rateBarWrap:        { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  rateBar:            { height: '100%', backgroundColor: Colors.cyan, borderRadius: 3 },

  monthRow:           { flexDirection: 'row', gap: 12, marginBottom: 20 },
  monthCard:          { flex: 1, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, alignItems: 'center' },
  monthIcon:          { fontSize: 22, marginBottom: 6 },
  monthValue:         { fontSize: 24, fontWeight: '900', color: Colors.white },
  monthLabel:         { fontSize: 10, color: Colors.muted, marginTop: 4, textAlign: 'center', fontWeight: '600' },

  sectionHead:        { fontSize: 13, fontWeight: '700', color: Colors.white, marginBottom: 10 },

  quickActions:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  quickBtn:           { width: '47%', backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, alignItems: 'center', gap: 8 },
  quickBtnIcon:       { fontSize: 24 },
  quickBtnText:       { fontSize: 12, fontWeight: '700', color: Colors.white },

  alertCard:          { backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)', padding: 16, marginBottom: 20, overflow: 'hidden' },
  alertTop:           { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.yellow },
  alertTitle:         { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  alertSub:           { fontSize: 12, color: Colors.muted, lineHeight: 18, marginBottom: 10 },
  alertLink:          { fontSize: 13, color: Colors.yellow, fontWeight: '700' },

  customerRow:        { paddingVertical: 12, paddingHorizontal: 14, gap: 8 },
  customerRowBorder:  { borderBottomWidth: 1, borderBottomColor: Colors.border },
  customerMain:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerInfo:       { flex: 1, minWidth: 0 },
  customerName:       { fontSize: 14, fontWeight: '600', color: Colors.white },
  customerMeta:       { fontSize: 11, color: Colors.cyan, marginTop: 1 },
  customerPhone:      { fontSize: 11, color: Colors.muted, marginTop: 1 },
  customerRight:      { alignItems: 'flex-end' },

  contactBtns:        { flexDirection: 'row', gap: 8, paddingLeft: 54 },
  contactBtn:         { backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  contactBtnWA:       { backgroundColor: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.2)' },

  viewAllBtn:         { marginTop: 14, padding: 14, borderRadius: 50, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  viewAllText:        { color: Colors.cyan, fontWeight: '700', fontSize: 14 },
  logoutBtn:  { backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
logoutText: { color: Colors.red, fontSize: 11, fontWeight: '700' },
});