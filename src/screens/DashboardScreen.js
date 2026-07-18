import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Shadow } from '../theme';
import { Avatar, Badge, Card, EmptyState } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useSettings, ordinal } from '../lib/settings';

function Metric({ label, value, detail, tone }) {
  return (
    <View style={styles.metric}>
      <LinearGradient
        colors={[tone, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.metricRule}
      />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail} numberOfLines={1}>{detail}</Text>
    </View>
  );
}

function Action({ label, hint, symbol, onPress, primary }) {
  return (
    <TouchableOpacity style={[styles.action, primary && styles.actionPrimary]} onPress={onPress} activeOpacity={0.8}>
      {primary ? (
        <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionSymbol}>
          <Text style={[styles.actionSymbolText, { color: '#fff' }]}>{symbol}</Text>
        </LinearGradient>
      ) : (
        <View style={styles.actionSymbol}>
          <Text style={styles.actionSymbolText}>{symbol}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.actionLabel}>{label}</Text>
        <Text style={styles.actionHint} numberOfLines={1}>{hint}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const { customers, loading } = useCustomers();
  const { logout } = useAuth();
  const { profile } = useBusiness();
  const { settings } = useSettings();
  const [refreshing, setRefreshing] = useState(false);

  const total      = customers.length;
  const active     = customers.filter(c => c.status === 'Active').length;
  const unpaid     = customers.filter(c => c.billPaid === 'Unpaid' || !c.billPaid).length;
  const activeRate = total ? Math.round((active / total) * 100) : 0;
  const recent     = useMemo(
    () => [...customers].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5),
    [customers]
  );
  const firstName = profile?.ownerName?.split(' ')[0] || 'there';
  const month     = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const refresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 900); };
  const call    = mobile => Linking.openURL(`tel:${mobile}`);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.cyan} size="large" />
          <Text style={styles.muted}>Preparing your workspace…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.cyan} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>Operations Overview</Text>
            <Text style={styles.title} numberOfLines={1}>Good morning, {firstName}</Text>
            <Text style={styles.subtitle}>{month} · Here’s your business pulse</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} activeOpacity={0.8}>
            <LinearGradient
              colors={Gradients.brand}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarButton}
            >
              <Text style={styles.avatarLetter}>{profile?.ownerName?.[0]?.toUpperCase() || 'U'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Command center hero */}
        <LinearGradient
          colors={Gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Today’s Command Center</Text>
            <Text style={styles.heroTitle}>
              {unpaid ? `${unpaid} payment${unpaid === 1 ? '' : 's'} need attention` : 'Your collections are clear'}
            </Text>
            <Text style={styles.heroText}>
              {unpaid
                ? `Follow up with customers before the ${ordinal(settings.billingDay)} billing date.`
                : 'Keep the momentum going. Your customer base is in good shape.'}
            </Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.navigate(unpaid ? 'Bills' : 'AddCustomer')}
              activeOpacity={0.85}
            >
              <Text style={styles.heroButtonText}>{unpaid ? 'Review collections' : 'Add a customer'}  ›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.heroOrbOuter}>
            <View style={styles.heroOrb}>
              <Text style={styles.heroOrbText}>{unpaid || '✓'}</Text>
              <Text style={styles.heroOrbLabel}>{unpaid ? 'DUE' : 'ON TRACK'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Key metrics */}
        <View style={styles.metrics}>
          <Metric label="Customers" value={total}               detail="All accounts"        tone={Colors.blue}   />
          <Metric label="Active"    value={`${activeRate}%`}    detail={`${active} live lines`} tone={Colors.green} />
          <Metric label="Unpaid"    value={unpaid}              detail="Needs follow-up"     tone={unpaid ? Colors.yellow : Colors.cyan} />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actions}>
          <Action label="Add customer"      hint="Create a new account"  symbol="+" primary onPress={() => navigation.navigate('AddCustomer')} />
          <Action label="Find a customer"   hint="Search your network"   symbol="⌕" onPress={() => navigation.navigate('Search')} />
          <Action label="View billing"      hint={unpaid ? `${unpaid} accounts need attention` : 'No outstanding alerts'} symbol="₹" onPress={() => navigation.navigate('Bills')} />
          <Action label="Business insights" hint="Review performance"    symbol="↗" onPress={() => navigation.navigate('Business', { screen: 'Reports' })} />
        </View>

        {/* Recent customers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent customers</Text>
          {total > 5 && (
            <TouchableOpacity onPress={() => navigation.navigate('Customers')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.link}>View all  ›</Text>
            </TouchableOpacity>
          )}
        </View>
        <Card style={{ marginBottom: 4 }}>
          {recent.length === 0 ? (
            <EmptyState
              icon="◎"
              title="Your customer workspace is ready"
              subtitle="Add your first customer to start tracking connections and collections."
              onAction={() => navigation.navigate('AddCustomer')}
              actionLabel="Add first customer"
            />
          ) : (
            recent.map((c, i) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.customer, i < recent.length - 1 && styles.customerBorder]}
                onPress={() => navigation.navigate('CustomerDetail', { customer: c })}
                activeOpacity={0.75}
              >
                <Avatar name={c.fullName} size={40} />
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName} numberOfLines={1}>{c.fullName}</Text>
                  <Text style={styles.customerMeta} numberOfLines={1}>{c.userID || 'No ID'} · {c.planSpeed || 'Plan not set'}</Text>
                </View>
                <View style={styles.customerRight}>
                  <Badge status={c.status} />
                  <TouchableOpacity onPress={() => call(c.mobile)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={styles.call}>Call</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card>

        <TouchableOpacity
          style={styles.signOut}
          onPress={() => Alert.alert('Sign out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: logout },
          ])}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scroll:        { flex: 1, paddingHorizontal: 18 },
  loader:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  muted:         { color: Colors.muted, fontSize: 14 },

  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, marginBottom: 24 },
  eyebrow:       { color: Colors.cyan, fontSize: 10.5, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 8 },
  title:         { color: Colors.white, fontSize: 26, fontWeight: '900', letterSpacing: -0.8 },
  subtitle:      { color: Colors.muted, fontSize: 12.5, marginTop: 5, fontWeight: '500' },
  avatarButton:  { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...Shadow.glow('rgba(37,99,235,0.9)') },
  avatarLetter:  { color: '#fff', fontWeight: '900', fontSize: 17 },

  hero:          { borderRadius: 24, padding: 22, minHeight: 196, flexDirection: 'row', overflow: 'hidden', marginBottom: 16, ...Shadow.glow('rgba(30,64,175,0.65)') },
  heroGlow:      { position: 'absolute', top: -70, right: -40, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.10)' },
  heroCopy:      { flex: 1, zIndex: 1 },
  heroEyebrow:   { color: 'rgba(255,255,255,0.72)', fontSize: 10.5, letterSpacing: 1.6, fontWeight: '800', textTransform: 'uppercase' },
  heroTitle:     { color: '#fff', fontSize: 22, lineHeight: 27, fontWeight: '900', marginTop: 10, maxWidth: 225, letterSpacing: -0.4 },
  heroText:      { color: 'rgba(255,255,255,0.78)', fontSize: 12.5, lineHeight: 18, marginTop: 7, maxWidth: 235 },
  heroButton:    { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, marginTop: 16 },
  heroButtonText:{ color: Colors.blue, fontSize: 12.5, fontWeight: '900' },
  heroOrbOuter:  { position: 'absolute', right: -24, top: 18, width: 148, height: 148, borderRadius: 74, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  heroOrb:       { width: 104, height: 104, borderRadius: 52, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroOrbText:   { color: '#fff', fontSize: 34, fontWeight: '900' },
  heroOrbLabel:  { color: 'rgba(255,255,255,0.75)', fontSize: 8.5, fontWeight: '800', letterSpacing: 1.2, marginTop: 2 },

  metrics:       { flexDirection: 'row', gap: 10, marginBottom: 28 },
  metric:        { flex: 1, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingVertical: 14, paddingHorizontal: 13, overflow: 'hidden' },
  metricRule:    { height: 3, position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.9 },
  metricLabel:   { color: Colors.muted, fontSize: 9.5, fontWeight: '800', letterSpacing: 0.9, textTransform: 'uppercase', marginTop: 4 },
  metricValue:   { color: Colors.white, fontSize: 22, fontWeight: '900', marginTop: 7, letterSpacing: -0.5 },
  metricDetail:  { color: Colors.muted, fontSize: 10.5, marginTop: 3, fontWeight: '500' },

  sectionTitle:  { color: Colors.white, fontSize: 15.5, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  actions:       { gap: 10, marginBottom: 28 },
  action:        { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 13 },
  actionPrimary: { backgroundColor: 'rgba(37,99,235,0.10)', borderColor: 'rgba(37,99,235,0.40)' },
  actionSymbol:  { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(6,182,212,0.09)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.18)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  actionSymbolText: { color: Colors.cyanSoft, fontSize: 19, fontWeight: '600' },
  actionLabel:   { color: Colors.white, fontSize: 13.5, fontWeight: '800' },
  actionHint:    { color: Colors.muted, fontSize: 11.5, marginTop: 2 },
  chevron:       { color: Colors.faint, fontSize: 22 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link:          { color: Colors.cyan, fontSize: 12, fontWeight: '800' },
  customer:      { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  customerBorder:{ borderBottomWidth: 1, borderBottomColor: Colors.border },
  customerInfo:  { flex: 1, minWidth: 0 },
  customerName:  { color: Colors.white, fontSize: 14, fontWeight: '700' },
  customerMeta:  { color: Colors.muted, fontSize: 11, marginTop: 4 },
  customerRight: { alignItems: 'flex-end', gap: 8 },
  call:          { color: Colors.cyan, fontSize: 11, fontWeight: '800' },

  signOut:       { alignItems: 'center', padding: 20 },
  signOutText:   { color: Colors.muted, fontSize: 12, fontWeight: '700' },
});
