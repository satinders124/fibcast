import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../theme';
import { Card } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

function ReportCard({ icon, label, value, accent }) {
  return (
    <View style={[s.reportCard, { borderTopColor: accent || Colors.blue }]}>
      <Text style={s.reportIcon}>{icon}</Text>
      <Text style={s.reportValue}>{value}</Text>
      <Text style={s.reportLabel}>{label}</Text>
    </View>
  );
}

function PlanRow({ plan, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <View style={s.planRow}>
      <View style={s.planInfo}>
        <Text style={s.planName}>{plan}</Text>
        <Text style={s.planCount}>{count} customers</Text>
      </View>
      <View style={s.planBarWrap}>
        <View style={[s.planBar, { width: `${pct}%` }]} />
      </View>
      <Text style={s.planPct}>{pct}%</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const { customers } = useCustomers();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  const stats = useMemo(() => {
    const total    = customers.length;
    const active   = customers.filter(c => c.status === 'Active').length;
    const inactive = customers.filter(c => c.status === 'Inactive').length;
    const pending  = customers.filter(c => c.status === 'Pending').length;

    // This month
    const thisMonth = new Date().toISOString().slice(0, 7);
    const addedThisMonth = customers.filter(c =>
      c.joinDate?.startsWith(thisMonth)
    ).length;

    // Plan breakdown
    const plans = {};
    customers.forEach(c => {
      const p = c.planSpeed || 'Unknown';
      plans[p] = (plans[p] || 0) + 1;
    });
    const planList = Object.entries(plans)
      .sort((a, b) => b[1] - a[1]);

    // Active rate
    const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

    return { total, active, inactive, pending, addedThisMonth, planList, activeRate };
  }, [customers]);

  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.cyan} />}
      >
        <View style={s.header}>
          <Text style={s.title}>Reports</Text>
          <Text style={s.sub}>{month}</Text>
        </View>

        {/* Overview */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>OVERVIEW</Text>
          <View style={s.reportGrid}>
            <ReportCard icon="👥" label="Total"          value={stats.total}          accent={Colors.blue}   />
            <ReportCard icon="✅" label="Active"         value={stats.active}         accent={Colors.green}  />
            <ReportCard icon="❌" label="Inactive"       value={stats.inactive}       accent={Colors.red}    />
            <ReportCard icon="⏳" label="Pending"        value={stats.pending}        accent={Colors.yellow} />
            <ReportCard icon="🆕" label="Added This Month" value={stats.addedThisMonth} accent={Colors.cyan} />
            <ReportCard icon="📈" label="Active Rate"   value={`${stats.activeRate}%`} accent={Colors.indigo} />
          </View>
        </View>

        {/* Active rate bar */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>ACTIVE RATE</Text>
          <Card style={{ padding: 20 }}>
            <View style={s.rateRow}>
              <Text style={s.rateLabel}>Active customers</Text>
              <Text style={s.rateValue}>{stats.activeRate}%</Text>
            </View>
            <View style={s.rateBarWrap}>
              <LinearGradient
                colors={Gradients.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.rateBar, { width: `${Math.max(stats.activeRate, 2)}%` }]}
              />
            </View>
            <View style={s.rateRow}>
              <Text style={s.rateSub}>{stats.active} active of {stats.total} total</Text>
              <Text style={s.rateSub}>{stats.inactive} inactive</Text>
            </View>
          </Card>
        </View>

        {/* Plan breakdown */}
        {stats.planList.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>PLAN BREAKDOWN</Text>
            <Card>
              {stats.planList.map(([plan, count]) => (
                <View key={plan} style={s.planRowWrap}>
                  <PlanRow plan={plan} count={count} total={stats.total} />
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Status breakdown */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>STATUS BREAKDOWN</Text>
          <Card>
            {[
              { label: 'Active',   value: stats.active,   color: Colors.green  },
              { label: 'Inactive', value: stats.inactive, color: Colors.red    },
              { label: 'Pending',  value: stats.pending,  color: Colors.yellow },
            ].map(item => (
              <View key={item.label} style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: item.color }]} />
                <Text style={s.statusLabel}>{item.label}</Text>
                <Text style={s.statusValue}>{item.value}</Text>
                <Text style={s.statusPct}>
                  {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                </Text>
              </View>
            ))}
          </Card>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  header:       { paddingHorizontal: 18, paddingTop: 18, marginBottom: 8 },
  title:        { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: -0.8 },
  sub:          { fontSize: 13, color: Colors.muted, marginTop: 4 },
  section:      { paddingHorizontal: 18, marginTop: 22 },
  sectionLabel: { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  reportGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  reportCard:   { width: '47%', backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, borderTopWidth: 2.5, padding: 16, alignItems: 'center' },
  reportIcon:   { fontSize: 22, marginBottom: 8 },
  reportValue:  { fontSize: 26, fontWeight: '900', color: Colors.white, lineHeight: 30, letterSpacing: -0.6 },
  reportLabel:  { fontSize: 10.5, color: Colors.muted, marginTop: 4, fontWeight: '700', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
  rateRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rateLabel:    { fontSize: 13, color: Colors.white, fontWeight: '700' },
  rateValue:    { fontSize: 19, fontWeight: '900', color: Colors.cyanSoft },
  rateBarWrap:  { height: 9, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 5, marginBottom: 10, overflow: 'hidden' },
  rateBar:      { height: '100%', borderRadius: 5 },
  rateSub:      { fontSize: 11, color: Colors.muted },
  planRowWrap:  { borderBottomWidth: 1, borderBottomColor: Colors.border },
  planRow:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  planInfo:     { width: 110 },
  planName:     { fontSize: 13, fontWeight: '700', color: Colors.white },
  planCount:    { fontSize: 11, color: Colors.muted, marginTop: 2 },
  planBarWrap:  { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  planBar:      { height: '100%', backgroundColor: Colors.blue, borderRadius: 3 },
  planPct:      { fontSize: 12, color: Colors.muted, width: 36, textAlign: 'right' },
  statusRow:    { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  statusLabel:  { flex: 1, fontSize: 14, color: Colors.white, fontWeight: '600' },
  statusValue:  { fontSize: 16, fontWeight: '900', color: Colors.white, marginRight: 8 },
  statusPct:    { fontSize: 12, color: Colors.muted, width: 36, textAlign: 'right' },
});