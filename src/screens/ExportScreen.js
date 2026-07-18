import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { Card, PrimaryButton } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

function ExportOption({ icon, title, subtitle, onPress, accent }) {
  return (
    <TouchableOpacity style={[s.optionCard, { borderLeftColor: accent || Colors.blue }]} onPress={onPress} activeOpacity={0.7}>
      <Text style={s.optionIcon}>{icon}</Text>
      <View style={s.optionInfo}>
        <Text style={s.optionTitle}>{title}</Text>
        <Text style={s.optionSub}>{subtitle}</Text>
      </View>
      <Text style={s.optionArrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function ExportScreen() {
  const { customers } = useCustomers();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  function exportAsText() {
    const lines = customers.map((c, i) =>
      `${i + 1}. ${c.fullName}\n   Father: ${c.fatherName}\n   Mobile: ${c.mobile}\n   Tel: ${c.telephone || '—'}\n   User ID: ${c.userID}\n   VLAN: ${c.vlanID}\n   Plan: ${c.planSpeed}\n   Status: ${c.status}\n   Address: ${c.address}\n   Notes: ${c.notes || '—'}\n`
    ).join('\n');

    const content = `FIBCAST — Customer List\nExported: ${new Date().toLocaleDateString()}\nTotal: ${customers.length} customers\n\n${lines}`;

    Share.share({ message: content, title: 'Fibcast Customer List' });
  }

  function exportAsCSV() {
    const headers = 'Full Name,Father Name,Mobile,Telephone,User ID,VLAN ID,Plan Speed,Status,Address,Notes,Join Date';
    const rows = customers.map(c =>
      `"${c.fullName}","${c.fatherName}","${c.mobile}","${c.telephone || ''}","${c.userID}","${c.vlanID}","${c.planSpeed}","${c.status}","${c.address}","${c.notes || ''}","${c.joinDate || ''}"`
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    Share.share({ message: csv, title: 'Fibcast Customers CSV' });
  }

  function exportActiveOnly() {
    const active = customers.filter(c => c.status === 'Active');
    const lines = active.map((c, i) =>
      `${i + 1}. ${c.fullName} | ${c.userID} | VLAN ${c.vlanID} | ${c.mobile} | ${c.planSpeed}`
    ).join('\n');

    const content = `FIBCAST — Active Customers\nExported: ${new Date().toLocaleDateString()}\nTotal Active: ${active.length}\n\n${lines}`;
    Share.share({ message: content, title: 'Active Customers' });
  }

  function exportUnpaidReminders() {
    const lines = customers
      .filter(c => c.status === 'Active')
      .map((c, i) =>
        `${i + 1}. ${c.fullName} | ${c.mobile} | ${c.planSpeed}`
      ).join('\n');

    const content = `FIBCAST — Bill Reminder List\nMonth: ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n${lines}`;
    Share.share({ message: content, title: 'Bill Reminder List' });
  }

  const stats = {
    total:    customers.length,
    active:   customers.filter(c => c.status === 'Active').length,
    inactive: customers.filter(c => c.status === 'Inactive').length,
    pending:  customers.filter(c => c.status === 'Pending').length,
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
      >
        <View style={s.header}>
          <Text style={s.title}>Export</Text>
          <Text style={s.sub}>Share your customer data in different formats.</Text>
        </View>

        {/* Summary */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>CURRENT DATA</Text>
          <Card style={{ padding: 16 }}>
            <View style={s.summaryRow}>
              <View style={s.summaryItem}>
                <Text style={s.summaryValue}>{stats.total}</Text>
                <Text style={s.summaryLabel}>Total</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={[s.summaryValue, { color: Colors.green }]}>{stats.active}</Text>
                <Text style={s.summaryLabel}>Active</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={[s.summaryValue, { color: Colors.red }]}>{stats.inactive}</Text>
                <Text style={s.summaryLabel}>Inactive</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={[s.summaryValue, { color: Colors.yellow }]}>{stats.pending}</Text>
                <Text style={s.summaryLabel}>Pending</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Export options */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>EXPORT OPTIONS</Text>
          <View style={s.optionsList}>
            <ExportOption
              icon="📋"
              title="Full Customer List"
              subtitle={`All ${stats.total} customers with complete details`}
              onPress={exportAsText}
              accent={Colors.blue}
            />
            <ExportOption
              icon="📊"
              title="Export as CSV"
              subtitle="Spreadsheet format — open in Excel or Google Sheets"
              onPress={exportAsCSV}
              accent={Colors.cyan}
            />
            <ExportOption
              icon="✅"
              title="Active Customers Only"
              subtitle={`${stats.active} active connections`}
              onPress={exportActiveOnly}
              accent={Colors.green}
            />
            <ExportOption
              icon="💰"
              title="Bill Reminder List"
              subtitle="List of active customers for bill collection"
              onPress={exportUnpaidReminders}
              accent={Colors.yellow}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  header:         { paddingHorizontal: 18, paddingTop: 16, marginBottom: 8 },
  title:          { fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  sub:            { fontSize: 13, color: Colors.muted, marginTop: 4 },
  section:        { paddingHorizontal: 18, marginTop: 20 },
  sectionLabel:   { fontSize: 10, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem:    { alignItems: 'center' },
  summaryValue:   { fontSize: 24, fontWeight: '900', color: Colors.white },
  summaryLabel:   { fontSize: 11, color: Colors.muted, marginTop: 4 },
  optionsList:    { gap: 10 },
  optionCard:     { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  optionIcon:     { fontSize: 24 },
  optionInfo:     { flex: 1 },
  optionTitle:    { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 3 },
  optionSub:      { fontSize: 12, color: Colors.muted, lineHeight: 17 },
  optionArrow:    { fontSize: 18, color: Colors.muted },
});