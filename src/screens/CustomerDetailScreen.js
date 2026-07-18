import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Clipboard, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Shadow } from '../theme';
import { Avatar, Badge, Card, GhostButton, Toast } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';
import { useSettings, renderTemplate } from '../lib/settings';

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
        <TouchableOpacity onPress={doCopy} style={[s.copyBtn, copied && s.copyBtnDone]} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
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

function QuickAction({ icon, label, onPress, primary, disabled }) {
  const inner = (
    <>
      <View style={[s.qaIcon, primary && s.qaIconPrimary]}>
        <Text style={s.qaIconText}>{icon}</Text>
      </View>
      <Text style={[s.qaLabel, primary && s.qaLabelPrimary]}>{label}</Text>
    </>
  );
  return (
    <TouchableOpacity
      style={[s.qa, primary && s.qaPrimary, disabled && { opacity: 0.45 }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      {inner}
    </TouchableOpacity>
  );
}

export default function CustomerDetailScreen({ route, navigation }) {
  const { customer } = route.params;
  const { deleteCustomer, updateCustomer, customers } = useCustomers();
  const { settings } = useSettings();
  const [toast,      setToast]      = useState({ visible: false, message: '', type: 'success' });
  const [billSaving, setBillSaving] = useState(false);

  const fresh  = customers.find(c => c.id === customer.id) || customer;
  const isPaid = fresh.billPaid === 'Paid';

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

  async function toggleBillStatus() {
    if (billSaving) return;
    setBillSaving(true);
    try {
      await updateCustomer(fresh.id, { billPaid: isPaid ? 'Unpaid' : 'Paid' });
      setToast({ visible: true, message: isPaid ? 'Marked as Unpaid.' : 'Marked as Paid. Nice!', type: 'success' });
    } catch {
      setToast({ visible: true, message: 'Failed to update. Try again.', type: 'error' });
    } finally {
      setBillSaving(false);
    }
  }

  const call = () => fresh.mobile && Linking.openURL(`tel:${fresh.mobile}`);

  const NETWORK_KEYS = ['ponPort', 'ontId', 'ontSerial', 'lanIp', 'adminUser', 'adminPass', 'wifiSsid', 'wifiPass', 'pppoeUser'];
  const hasNetwork   = NETWORK_KEYS.some(k => fresh.network?.[k]);

  // Open the ONT's local admin page — only reachable from the customer's own
  // network, and we deliberately refuse anything outside private IP space.
  function openModemAdmin() {
    const ip         = (fresh.network?.lanIp || '').trim();
    const parts      = ip.split('.');
    const validQuad  = parts.length === 4 && parts.every(o => /^\d{1,3}$/.test(o) && Number(o) <= 255);
    const isPrivate  =
      /^10\./.test(ip) ||
      /^192\.168\./.test(ip) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

    if (!(validQuad && isPrivate)) {
      setToast({ visible: true, message: 'Modem LAN IP is missing or not a private address. Edit the customer to fix it.', type: 'error' });
      return;
    }
    Linking.openURL(`http://${ip}`).catch(() => {
      setToast({ visible: true, message: "Couldn't open the modem page — connect to the customer's WiFi first.", type: 'error' });
    });
  }

  function remindOnWhatsApp() {
    if (!fresh.mobile) return;
    const msg = encodeURIComponent(renderTemplate(settings.reminderTemplate, { name: fresh.fullName }));
    Linking.openURL(`whatsapp://send?phone=91${fresh.mobile}&text=${msg}`);
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={s.hero}>
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.heroRing, Shadow.glow('rgba(37,99,235,0.55)')]}
          >
            <Avatar name={fresh.fullName} size={68} />
          </LinearGradient>
          <Text style={s.heroName}>{fresh.fullName}</Text>
          <View style={s.heroChips}>
            <Badge status={fresh.status} />
            <View style={s.heroChip}>
              <Text style={s.heroChipText}>{fresh.planSpeed || 'No plan'}</Text>
            </View>
          </View>
          <Text style={s.heroPlan}>Customer since {fresh.joinDate || '—'}</Text>
        </View>

        {/* Quick actions */}
        <View style={s.qaRow}>
          <QuickAction icon="📞" label="Call"     primary onPress={call}             disabled={!fresh.mobile} />
          <QuickAction icon="💬" label="Remind"   onPress={remindOnWhatsApp}         disabled={!fresh.mobile} />
          <QuickAction icon="✏️" label="Edit"     onPress={() => navigation.navigate('AddCustomer', { customer: fresh })} />
        </View>

        {/* Collections */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>COLLECTIONS</Text>
          <Card style={{ padding: 16 }}>
            <View style={s.collectRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.collectLabel}>This month’s bill</Text>
                <View style={s.collectBadgeWrap}>
                  <Badge status={isPaid ? 'Paid' : 'Unpaid'} />
                </View>
              </View>
              <TouchableOpacity
                style={[s.collectToggle, isPaid ? s.collectTogglePaid : s.collectToggleUnpaid]}
                onPress={toggleBillStatus}
                disabled={billSaving}
                activeOpacity={0.75}
              >
                <Text style={[s.collectToggleText, { color: isPaid ? Colors.green : Colors.redSoft }]}>
                  {billSaving ? 'Saving…' : isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* IDs */}
        <View style={s.idRow}>
          {[['User ID', fresh.userID], ['VLAN ID', fresh.vlanID]].map(([label, val]) => (
            <View key={label} style={s.idCard}>
              <Text style={s.idCardLabel}>{label}</Text>
              <Text style={s.idCardValue}>{val || '—'}</Text>
              {val ? (
                <TouchableOpacity onPress={() => Clipboard.setString(val)} style={s.idCopy} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={s.idCopyText}>Copy</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>

        {/* Modem & network */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>MODEM & NETWORK</Text>
          {hasNetwork ? (
            <Card>
              <View style={s.netStatusRow}>
                <View style={s.netStatusDot} />
                <Text style={s.netStatusText}>OLT link not connected yet — live status arrives with the network connector.</Text>
              </View>
              {fresh.network?.lanIp ? (
                <TouchableOpacity style={s.netOpenBtn} onPress={openModemAdmin} activeOpacity={0.8}>
                  <Text style={s.netOpenBtnText}>Open Modem Admin ({fresh.network.lanIp})</Text>
                </TouchableOpacity>
              ) : null}
              <DetailRow label="PON Port"            value={fresh.network?.ponPort} />
              <DetailRow label="ONT ID"              value={fresh.network?.ontId} />
              <CopyRow   label="ONT Serial / MAC"    value={fresh.network?.ontSerial} />
              <CopyRow   label="Admin Username"      value={fresh.network?.adminUser} />
              <CopyRow   label="Admin Password"      value={fresh.network?.adminPass} />
              <CopyRow   label="WiFi Name (SSID)"    value={fresh.network?.wifiSsid} />
              <CopyRow   label="WiFi Password"       value={fresh.network?.wifiPass} />
              <CopyRow   label="PPPoE Username"      value={fresh.network?.pppoeUser} />
            </Card>
          ) : (
            <Card>
              <TouchableOpacity
                style={s.netEmpty}
                onPress={() => navigation.navigate('AddCustomer', { customer: fresh })}
                activeOpacity={0.75}
              >
                <Text style={s.netEmptyTitle}>No modem details yet</Text>
                <Text style={s.netEmptySub}>Record PON port, ONT serial, WiFi and admin credentials here — field staff will thank you on every visit.</Text>
                <Text style={s.netEmptyCta}>Add modem details  ›</Text>
              </TouchableOpacity>
            </Card>
          )}
        </View>

        {/* Contact */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>CONTACT DETAILS</Text>
          <Card>
            <CopyRow label="Mobile"    value={fresh.mobile} />
            <CopyRow label="Telephone" value={fresh.telephone} />
          </Card>
        </View>

        {/* Connection */}
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

        {/* Danger */}
        <View style={s.actions}>
          <GhostButton
            title={`🗑️  Delete ${fresh.fullName?.split(' ')[0] || 'customer'}`}
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
  safe:             { flex: 1, backgroundColor: Colors.bg },

  hero:             { alignItems: 'center', paddingVertical: 26, paddingHorizontal: 20 },
  heroRing:         { borderRadius: 28, padding: 3, marginBottom: 14 },
  heroName:         { fontSize: 23, fontWeight: '900', color: Colors.white, letterSpacing: -0.6, textAlign: 'center' },
  heroChips:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  heroChip:         { backgroundColor: 'rgba(37,99,235,0.12)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.28)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  heroChipText:     { color: Colors.cyanSoft, fontSize: 11, fontWeight: '800' },
  heroPlan:         { fontSize: 12, color: Colors.muted, marginTop: 9, fontWeight: '600' },

  qaRow:            { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginBottom: 4 },
  qa:               { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 8 },
  qaPrimary:        { backgroundColor: 'rgba(37,99,235,0.12)', borderColor: 'rgba(37,99,235,0.40)' },
  qaIcon:           { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(6,182,212,0.09)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.18)', alignItems: 'center', justifyContent: 'center' },
  qaIconPrimary:    { backgroundColor: '#fff', borderColor: '#fff' },
  qaIconText:       { fontSize: 17 },
  qaLabel:          { color: Colors.off, fontSize: 12, fontWeight: '800' },
  qaLabelPrimary:   { color: Colors.white },

  section:          { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle:     { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },

  collectRow:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  collectLabel:     { fontSize: 13.5, color: Colors.white, fontWeight: '800', marginBottom: 8 },
  collectBadgeWrap: { alignSelf: 'flex-start' },
  collectToggle:    { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, borderWidth: 1 },
  collectTogglePaid:  { backgroundColor: 'rgba(16,185,129,0.10)', borderColor: 'rgba(16,185,129,0.30)' },
  collectToggleUnpaid:{ backgroundColor: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.32)' },
  collectToggleText:  { fontSize: 12.5, fontWeight: '800' },

  idRow:            { flexDirection: 'row', gap: 12, paddingHorizontal: 18, marginTop: 16 },
  idCard:           { flex: 1, backgroundColor: 'rgba(37,99,235,0.12)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.28)', borderRadius: 18, padding: 16, alignItems: 'center' },
  idCardLabel:      { fontSize: 10, color: Colors.cyanSoft, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  idCardValue:      { fontSize: 22, fontWeight: '900', color: Colors.white, marginBottom: 10, letterSpacing: -0.4 },
  idCopy:           { backgroundColor: 'rgba(6,182,212,0.1)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  idCopyText:       { color: Colors.cyanSoft, fontSize: 11, fontWeight: '800' },

  netStatusRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 },
  netStatusDot:     { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.yellow, marginTop: 4, flexShrink: 0 },
  netStatusText:    { color: Colors.muted, fontSize: 11.5, lineHeight: 16, flex: 1 },
  netOpenBtn:       { marginHorizontal: 14, marginTop: 10, marginBottom: 4, backgroundColor: 'rgba(6,182,212,0.10)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.28)', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  netOpenBtnText:   { color: Colors.cyanSoft, fontSize: 13, fontWeight: '800' },
  netEmpty:         { padding: 18 },
  netEmptyTitle:    { color: Colors.white, fontSize: 14.5, fontWeight: '800', marginBottom: 5 },
  netEmptySub:      { color: Colors.muted, fontSize: 12.5, lineHeight: 18 },
  netEmptyCta:      { color: Colors.cyanSoft, fontSize: 13, fontWeight: '800', marginTop: 12 },

  detailRow:        { paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel:      { fontSize: 10, color: Colors.muted, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  detailValueRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  detailValue:      { fontSize: 14, color: Colors.off, lineHeight: 20, flex: 1 },
  copyBtn:          { backgroundColor: 'rgba(6,182,212,0.08)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  copyBtnDone:      { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' },
  copyBtnText:      { color: Colors.cyanSoft, fontSize: 11, fontWeight: '800' },

  actions:          { flexDirection: 'row', gap: 12, paddingHorizontal: 18, marginTop: 26 },
});
