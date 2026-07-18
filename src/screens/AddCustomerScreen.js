import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients } from '../theme';
import { FormInput, PrimaryButton, GhostButton, Toast } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

const PLANS = ['₹299','₹399','₹449','₹495','₹499','₹549','₹595','₹599','₹699','₹777','₹799','₹999','₹1099','Govt Plan'];
const BILL_STATUS = ['Paid', 'Unpaid'];

function SelectPill({ label, options, value, onChange }) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.pillRow}>
        {options.map(o => (
          <TouchableOpacity key={o} onPress={() => onChange(o)} activeOpacity={0.7}>
            {value === o ? (
              <LinearGradient
                colors={Gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.pill, s.pillActive]}
              >
                <Text style={[s.pillText, s.pillTextActive]}>{o}</Text>
              </LinearGradient>
            ) : (
              <View style={s.pill}>
                <Text style={s.pillText}>{o}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function AddCustomerScreen({ route, navigation }) {
  const existing = route.params?.customer;
  const { addCustomer, updateCustomer } = useCustomers();

  const [form, setForm] = useState({
    fullName:   existing?.fullName   || '',
    fatherName: existing?.fatherName || '',
    address:    existing?.address    || '',
    mobile:     existing?.mobile     || '',
    telephone:  existing?.telephone  || '',
    userID:     existing?.userID     || '',
    vlanID:     existing?.vlanID     || '',
    planSpeed:  existing?.planSpeed  || '100 Mbps',
    status:     existing?.status     || 'Active',
    billPaid:   existing?.billPaid   || 'Unpaid',
    notes:      existing?.notes      || '',
    network: {
      ponPort:   existing?.network?.ponPort   || '',
      ontId:     existing?.network?.ontId     || '',
      ontSerial: existing?.network?.ontSerial || '',
      lanIp:     existing?.network?.lanIp     || '',
      adminUser: existing?.network?.adminUser || '',
      adminPass: existing?.network?.adminPass || '',
      wifiSsid:  existing?.network?.wifiSsid  || '',
      wifiPass:  existing?.network?.wifiPass  || '',
      pppoeUser: existing?.network?.pppoeUser || '',
    },
  });

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [toast,   setToast]   = useState({ visible: false, message: '', type: 'success' });

  function set(k, v) {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => ({ ...p, [k]: '' }));
  }

  function setNet(k, v) {
    setForm(p => ({ ...p, network: { ...p.network, [k]: v } }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim())   e.fullName   = 'Full name is required';
    if (!form.fatherName.trim()) e.fatherName = 'Father name is required';
    if (!form.address.trim())    e.address    = 'Address is required';
    if (!form.mobile.trim())     e.mobile     = 'Mobile number is required';
    if (!form.userID.trim())     e.userID     = 'User ID is required';
    if (!form.vlanID.trim())     e.vlanID     = 'VLAN ID is required';
    return e;
  }

  async function submit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      if (existing) {
        await updateCustomer(existing.id, form);
        setToast({ visible: true, message: 'Customer updated!', type: 'success' });
      } else {
        await addCustomer({ ...form, joinDate: new Date().toISOString().slice(0, 10) });
        setToast({ visible: true, message: 'Customer added!', type: 'success' });
      }
      setTimeout(() => navigation.goBack(), 1200);
    } catch {
      setToast({ visible: true, message: 'Something went wrong. Try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <Text style={s.heading}>{existing ? 'Edit Customer' : 'Add Customer'}</Text>
          <Text style={s.subheading}>BSNL broadband connection details</Text>

          <Text style={s.groupLabel}>PERSONAL DETAILS</Text>
          <FormInput label="Full Name"   required value={form.fullName}   onChangeText={t => set('fullName', t)}   placeholder="Rajdeep Singh"  error={errors.fullName} />
<FormInput label="Father / Husband Name (SO/WO/DO)" required value={form.fatherName} onChangeText={t => set('fatherName', t)} placeholder="e.g. Gurjeet Singh"  error={errors.fatherName} />          <FormInput label="Address"     required value={form.address}    onChangeText={t => set('address', t)}    placeholder="H.No, Street, Village/City, Punjab" multiline error={errors.address} />

          <Text style={s.groupLabel}>CONTACT</Text>
          <FormInput label="Mobile No."    required value={form.mobile}    onChangeText={t => set('mobile', t)}    placeholder="9876543210"       keyboardType="phone-pad" error={errors.mobile} />
          <FormInput label="Telephone No."          value={form.telephone} onChangeText={t => set('telephone', t)} placeholder="01874-299160"     keyboardType="phone-pad" />

          <Text style={s.groupLabel}>CONNECTION DETAILS</Text>
          <FormInput label="User ID" required value={form.userID} onChangeText={t => set('userID', t)} placeholder="TMF001" autoCapitalize="characters" error={errors.userID} />
          <FormInput label="VLAN ID" required value={form.vlanID} onChangeText={t => set('vlanID', t)} placeholder="101"    keyboardType="numeric"      error={errors.vlanID} />

          <SelectPill label="Plan Speed" options={PLANS}    value={form.planSpeed} onChange={v => set('planSpeed', v)} />
          <SelectPill label="Bill Status" options={BILL_STATUS} value={form.billPaid} onChange={v => set('billPaid', v)} />

          <Text style={s.groupLabel}>MODEM / NETWORK (OPTIONAL)</Text>
          <FormInput label="PON Port"        value={form.network.ponPort}   onChangeText={t => setNet('ponPort', t)}   placeholder="e.g. 3"              keyboardType="number-pad" />
          <FormInput label="ONT ID"          value={form.network.ontId}     onChangeText={t => setNet('ontId', t)}     placeholder="e.g. 12"             keyboardType="number-pad" />
          <FormInput label="ONT Serial / MAC" value={form.network.ontSerial} onChangeText={t => setNet('ontSerial', t)} placeholder="e.g. SYTC12345678"  autoCapitalize="characters" />
          <FormInput label="Modem LAN IP"    value={form.network.lanIp}     onChangeText={t => setNet('lanIp', t)}     placeholder="192.168.100.1"       keyboardType="numbers-and-punctuation" autoCapitalize="none" />
          <FormInput label="Admin Username"  value={form.network.adminUser} onChangeText={t => setNet('adminUser', t)} placeholder="telecomadmin"        autoCapitalize="none" />
          <FormInput label="Admin Password"  value={form.network.adminPass} onChangeText={t => setNet('adminPass', t)} placeholder="Modem admin password" autoCapitalize="none" />
          <FormInput label="WiFi Name (SSID)" value={form.network.wifiSsid} onChangeText={t => setNet('wifiSsid', t)}  placeholder="Customer WiFi name"  autoCapitalize="none" />
          <FormInput label="WiFi Password"   value={form.network.wifiPass}  onChangeText={t => setNet('wifiPass', t)}  placeholder="Customer WiFi key"   autoCapitalize="none" />
          <FormInput label="PPPoE Username"  value={form.network.pppoeUser} onChangeText={t => setNet('pppoeUser', t)} placeholder="user@bsnl.in"        autoCapitalize="none" />

          <Text style={s.groupLabel}>NOTES</Text>
          <FormInput label="" value={form.notes} onChangeText={t => set('notes', t)} placeholder="Any important notes about this customer…" multiline />

          <View style={s.actions}>
            <GhostButton title="Cancel" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
            <PrimaryButton
              title={existing ? 'Save Changes' : 'Add Customer'}
              onPress={submit}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
  scroll:         { padding: 20 },
  heading:        { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: -0.8, marginBottom: 4 },
  subheading:     { fontSize: 13, color: Colors.muted, marginBottom: 24 },
  groupLabel:     { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 18, marginBottom: 10 },
  fieldWrap:      { marginBottom: 14 },
  fieldLabel:     { fontSize: 10.5, fontWeight: '800', color: Colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  pillRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill:           { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 50, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.cardAlt },
  pillActive:     { borderColor: 'transparent' },
  pillText:       { fontSize: 12, fontWeight: '700', color: Colors.muted },
  pillTextActive: { color: '#fff' },
  actions:        { flexDirection: 'row', gap: 12, marginTop: 28 },
});