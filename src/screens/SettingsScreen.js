import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Colors } from '../theme';
import { Card, FormInput, PrimaryButton, Toast } from '../components/UI';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useSettings, ordinal, DEFAULT_SETTINGS } from '../lib/settings';

function BillingDayRow({ value, onChange }) {
  const dec = () => onChange(Math.max(1, value - 1));
  const inc = () => onChange(Math.min(28, value + 1));
  return (
    <View style={s.dayRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.prefTitle}>Billing cycle day</Text>
        <Text style={s.prefSub}>Bills are considered due by this date each month</Text>
      </View>
      <View style={s.stepper}>
        <TouchableOpacity style={s.stepBtn} onPress={dec} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={s.stepValue}>{ordinal(value)}</Text>
        <TouchableOpacity style={s.stepBtn} onPress={inc} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { user }                      = useAuth();
  const { role }                      = useRole();
  const { settings, saveSettings }    = useSettings();

  const [template,     setTemplate]     = useState(settings.reminderTemplate);
  const [savingTpl,    setSavingTpl]    = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [toast,        setToast]        = useState({ visible: false, message: '', type: 'success' });

  // Keep the editor in sync if settings hydrate after mount
  React.useEffect(() => { setTemplate(settings.reminderTemplate); }, [settings.reminderTemplate]);

  async function saveTemplate() {
    const clean = template.trim();
    if (!clean) {
      setToast({ visible: true, message: 'Reminder message cannot be empty.', type: 'error' });
      return;
    }
    setSavingTpl(true);
    await saveSettings({ reminderTemplate: clean });
    setSavingTpl(false);
    setToast({ visible: true, message: 'Reminder message saved.', type: 'success' });
  }

  async function resetTemplate() {
    setTemplate(DEFAULT_SETTINGS.reminderTemplate);
    await saveSettings({ reminderTemplate: DEFAULT_SETTINGS.reminderTemplate });
    setToast({ visible: true, message: 'Reminder message restored to default.', type: 'success' });
  }

  async function changeBillingDay(day) {
    await saveSettings({ billingDay: day });
  }

  async function handleResetPassword() {
    if (!user?.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setToast({ visible: true, message: `Password reset link sent to ${user.email}.`, type: 'success' });
    } catch {
      setToast({ visible: true, message: 'Could not send reset email. Try again.', type: 'error' });
    } finally {
      setResetLoading(false);
    }
  }

  const isOwner = role === 'owner';

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Account */}
        <Text style={s.sectionLabel}>ACCOUNT</Text>
        <Card>
          <View style={s.acctRow}>
            <Text style={s.acctLabel}>Signed in as</Text>
            <Text style={s.acctValue} numberOfLines={1}>{user?.email || '—'}</Text>
          </View>
          <View style={[s.acctRow, { borderBottomWidth: 0 }]}>
            <Text style={s.acctLabel}>Role</Text>
            <View style={[s.rolePill, isOwner ? s.roleOwner : s.roleStaff]}>
              <Text style={[s.roleText, isOwner ? { color: Colors.cyanSoft } : { color: Colors.off }]}>
                {isOwner ? '👑 Owner' : '👤 Staff'}
              </Text>
            </View>
          </View>
        </Card>
        <TouchableOpacity style={s.linkBtn} onPress={handleResetPassword} disabled={resetLoading} activeOpacity={0.75}>
          <Text style={s.linkBtnText}>{resetLoading ? 'Sending reset email…' : '🔑  Send password reset email'}</Text>
        </TouchableOpacity>

        {/* Collections preferences */}
        <Text style={s.sectionLabel}>COLLECTIONS</Text>
        <Card>
          <BillingDayRow value={settings.billingDay} onChange={changeBillingDay} />
        </Card>

        {/* Reminder template */}
        <Text style={s.sectionLabel}>WHATSAPP REMINDER</Text>
        <Card style={{ padding: 16 }}>
          <Text style={s.prefTitle}>Reminder message</Text>
          <Text style={s.prefSub}>Sent from Bills when you tap “Remind on WhatsApp”. Use {'{name}'} where the customer’s name should appear.</Text>
          <View style={{ marginTop: 12 }}>
            <FormInput
              value={template}
              onChangeText={setTemplate}
              placeholder="Type your reminder message…"
              multiline
            />
          </View>
          <PrimaryButton title="Save message" onPress={saveTemplate} loading={savingTpl} small />
          <TouchableOpacity onPress={resetTemplate} style={s.restoreBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.restoreText}>Restore default message</Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Text style={s.sectionLabel}>ABOUT</Text>
        <Card>
          <View style={s.acctRow}>
            <Text style={s.acctLabel}>App</Text>
            <Text style={s.acctValue}>Fibcast — ISP Dealer Platform</Text>
          </View>
          <View style={[s.acctRow, { borderBottomWidth: 0 }]}>
            <Text style={s.acctLabel}>Version</Text>
            <Text style={s.acctValue}>1.0.0</Text>
          </View>
        </Card>

        <View style={{ height: 32 }} />
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
  safe:         { flex: 1, backgroundColor: Colors.bg },
  scroll:       { paddingHorizontal: 18, paddingTop: 8 },
  sectionLabel: { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 22, marginBottom: 10 },

  acctRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  acctLabel:    { fontSize: 12, color: Colors.muted, fontWeight: '700' },
  acctValue:    { fontSize: 13, color: Colors.white, fontWeight: '600', flex: 1, textAlign: 'right' },
  rolePill:     { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 4, borderWidth: 1 },
  roleOwner:    { backgroundColor: 'rgba(6,182,212,0.10)', borderColor: 'rgba(6,182,212,0.28)' },
  roleStaff:    { backgroundColor: Colors.glass, borderColor: Colors.border },
  roleText:     { fontSize: 11.5, fontWeight: '800' },

  linkBtn:      { marginTop: 12, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  linkBtnText:  { color: Colors.cyanSoft, fontSize: 13.5, fontWeight: '800' },

  prefTitle:    { color: Colors.white, fontSize: 14, fontWeight: '800' },
  prefSub:      { color: Colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  dayRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  stepper:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.cardAlt, borderRadius: 999, borderWidth: 1, borderColor: Colors.border, padding: 4 },
  stepBtn:      { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.glass, alignItems: 'center', justifyContent: 'center' },
  stepBtnText:  { color: Colors.cyanSoft, fontSize: 18, fontWeight: '800', marginTop: -2 },
  stepValue:    { color: Colors.white, fontSize: 14, fontWeight: '900', minWidth: 44, textAlign: 'center' },

  restoreBtn:   { alignItems: 'center', paddingVertical: 14 },
  restoreText:  { color: Colors.muted, fontSize: 12, fontWeight: '700' },
});
