import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { EmptyState } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

export default function BillScreen() {
  const { customers, updateCustomer } = useCustomers();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  async function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }

  function openBSNLPortal() {
    Linking.openURL('https://portal.bsnl.in/myportal/cfa.do');
  }

  function openWhatsApp(mobile, name) {
    const msg = encodeURIComponent(`Hello ${name}, your BSNL broadband bill is due this month. Please pay at the earliest to avoid disconnection. Thank you.`);
    Linking.openURL(`whatsapp://send?phone=91${mobile}&text=${msg}`);
  }

  const filtered = useMemo(() => {
    if (filter === 'Paid')   return customers.filter(c => c.billPaid === 'Paid');
    if (filter === 'Unpaid') return customers.filter(c => c.billPaid === 'Unpaid' || !c.billPaid);
    return customers;
  }, [customers, filter]);

  function renderItem({ item: c }) {
    const isPaid = c.billPaid === 'Paid';
    return (
      <View style={s.billCard}>
        <View style={s.billTop}>
          <View style={[s.billAvatar, { backgroundColor: isPaid ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }]}>
            <Text style={{ fontSize: 20 }}>{isPaid ? '✅' : '❌'}</Text>
          </View>
          <View style={s.billInfo}>
            <Text style={s.billName} numberOfLines={1}>{c.fullName}</Text>
            <Text style={s.billMeta}>{c.userID} · {c.planSpeed}</Text>
            <Text style={s.billPhone}>{c.telephone || c.mobile}</Text>
          </View>
          <View style={[s.statusPill, isPaid ? s.statusPillPaid : s.statusPillUnpaid]}>
            <Text style={[s.statusPillText, { color: isPaid ? Colors.green : Colors.red }]}>
              {isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
        </View>

        {/* Toggle */}
        <TouchableOpacity
          style={[s.billToggle, isPaid ? s.billTogglePaid : s.billToggleUnpaid]}
          onPress={() => updateCustomer(c.id, { billPaid: isPaid ? 'Unpaid' : 'Paid' })}
          activeOpacity={0.7}
        >
          <Text style={[s.billToggleText, { color: isPaid ? Colors.green : Colors.red }]}>
            {isPaid ? '✓ Paid — Tap to mark Unpaid' : '✗ Unpaid — Tap to mark Paid'}
          </Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={s.billActions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={openBSNLPortal}
            activeOpacity={0.7}
          >
            <Text style={s.actionIcon}>🌐</Text>
            <Text style={s.actionText}>Check on BSNL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, s.actionBtnGreen]}
            onPress={() => openWhatsApp(c.mobile, c.fullName)}
            activeOpacity={0.7}
          >
            <Text style={s.actionIcon}>💬</Text>
            <Text style={[s.actionText, { color: '#25D366' }]}>Remind on WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const paidCount   = customers.filter(c => c.billPaid === 'Paid').length;
  const unpaidCount = customers.filter(c => c.billPaid === 'Unpaid' || !c.billPaid).length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Bill Status</Text>
        <Text style={s.sub}>Track and manage BSNL bill payments.</Text>
      </View>

      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { borderTopColor: Colors.green }]}>
          <Text style={s.summaryValue}>{paidCount}</Text>
          <Text style={s.summaryLabel}>Paid</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: Colors.red }]}>
          <Text style={[s.summaryValue, { color: Colors.red }]}>{unpaidCount}</Text>
          <Text style={s.summaryLabel}>Unpaid</Text>
        </View>
        <View style={[s.summaryCard, { borderTopColor: Colors.blue }]}>
          <Text style={s.summaryValue}>{customers.length}</Text>
          <Text style={s.summaryLabel}>Total</Text>
        </View>
      </View>

      {/* BBPS banner */}
      <View style={s.banner}>
        <View style={s.bannerTop} />
        <Text style={s.bannerTitle}>🚀 BBPS Auto Check — Coming Soon</Text>
        <Text style={s.bannerSub}>Bill status will be checked automatically via Razorpay BBPS.</Text>
      </View>

      {/* Filter pills */}
      <View style={s.pillRow}>
        {['All', 'Paid', 'Unpaid'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[s.pill, filter === f && s.pillActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.pillText, filter === f && s.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.cyan}
            colors={[Colors.cyan]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="💰"
            title="No customers found"
            subtitle="Add customers to track bill status."
          />
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: Colors.bg },
  header:           { paddingHorizontal: 18, paddingTop: 18, marginBottom: 14 },
  title:            { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: -0.8 },
  sub:              { fontSize: 13, color: Colors.muted, marginTop: 4 },
  summaryRow:       { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginBottom: 14 },
  summaryCard:      { flex: 1, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 2.5, padding: 14, alignItems: 'center' },
  summaryValue:     { fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  summaryLabel:     { fontSize: 10.5, color: Colors.muted, marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  banner:           { marginHorizontal: 18, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(6,182,212,0.24)', marginBottom: 14, overflow: 'hidden', padding: 16 },
  bannerTop:        { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.cyan },
  bannerTitle:      { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  bannerSub:        { fontSize: 12, color: Colors.muted, lineHeight: 18 },
  pillRow:          { flexDirection: 'row', paddingHorizontal: 18, gap: 8, marginBottom: 14 },
  pill:             { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, borderWidth: 1, borderColor: Colors.border },
  pillActive:       { backgroundColor: Colors.blue, borderColor: Colors.blue },
  pillText:         { fontSize: 12, fontWeight: '600', color: Colors.muted },
  pillTextActive:   { color: '#fff' },
  list:             { paddingHorizontal: 18, gap: 12, paddingBottom: 30 },
  billCard:         { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  billTop:          { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  billAvatar:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  billInfo:         { flex: 1, minWidth: 0 },
  billName:         { fontSize: 15, fontWeight: '700', color: Colors.white },
  billMeta:         { fontSize: 12, color: Colors.cyan, marginTop: 2 },
  billPhone:        { fontSize: 12, color: Colors.muted, marginTop: 2 },
  statusPill:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },
  statusPillPaid:   { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' },
  statusPillUnpaid: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)' },
  statusPillText:   { fontSize: 11, fontWeight: '700' },
  billToggle:       { borderRadius: 10, padding: 12, marginBottom: 12, alignItems: 'center' },
  billTogglePaid:   { backgroundColor: 'rgba(16,185,129,0.08)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)' },
  billToggleUnpaid: { backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  billToggleText:   { fontSize: 13, fontWeight: '700' },
  billActions:      { flexDirection: 'row', gap: 10 },
  actionBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(37,99,235,0.1)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.2)', borderRadius: 10, padding: 10 },
  actionBtnGreen:   { backgroundColor: 'rgba(37,211,102,0.08)', borderColor: 'rgba(37,211,102,0.2)' },
  actionIcon:       { fontSize: 14 },
  actionText:       { fontSize: 12, fontWeight: '600', color: Colors.cyan },
});