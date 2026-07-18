import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Colors, Gradients, Shadow } from '../theme';
import { FormInput, PrimaryButton } from '../components/UI';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const SAVED_EMAIL_KEY = 'fibcast.creds.email';
const SAVED_PASS_KEY  = 'fibcast.creds.password';

const HIGHLIGHTS = [
  { symbol: '◉', label: 'Live customer sync' },
  { symbol: '₹', label: 'Collections tracking' },
  { symbol: '↗', label: 'Business insights' },
];

function FeatureChip({ symbol, label }) {
  return (
    <View style={s.chip}>
      <Text style={s.chipSymbol}>{symbol}</Text>
      <Text style={s.chipLabel}>{label}</Text>
    </View>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [show,         setShow]         = useState(false);
  const [saveLogin,    setSaveLogin]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error,        setError]        = useState('');
  const [notice,       setNotice]       = useState('');

  // Restore saved credentials (filled, not auto-submitted)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const em = await SecureStore.getItemAsync(SAVED_EMAIL_KEY);
        const pw = await SecureStore.getItemAsync(SAVED_PASS_KEY);
        if (active && em && pw) {
          setEmail(em);
          setPassword(pw);
          setSaveLogin(true);
        }
      } catch {
        // Secure store unavailable — login still works without prefill.
      }
    })();
    return () => { active = false; };
  }, []);

  async function clearSavedCreds() {
    try {
      await SecureStore.deleteItemAsync(SAVED_EMAIL_KEY);
      await SecureStore.deleteItemAsync(SAVED_PASS_KEY);
    } catch { /* non-fatal */ }
  }

  async function toggleSaveLogin() {
    const next = !saveLogin;
    setSaveLogin(next);
    if (!next) await clearSavedCreds(); // unticking guarantees nothing stays stored
  }

  async function persistCredsAfterLogin() {
    if (!saveLogin) return;
    try {
      await SecureStore.setItemAsync(SAVED_EMAIL_KEY, email.trim());
      await SecureStore.setItemAsync(SAVED_PASS_KEY, password);
    } catch {
      // Non-fatal — session still signed in; prefill just won't happen next time.
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true); setError(''); setNotice('');
    try {
      await login(email.trim(), password);
      await persistCredsAfterLogin();
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setError('Enter your email address first, then tap Forgot password.');
      setNotice('');
      return;
    }
    setResetLoading(true); setError(''); setNotice('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(`Reset link sent to ${email.trim()}. Check your inbox and spam folder.`);
    } catch {
      setError('Could not send a reset link. Check the email and try again.');
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <View style={s.safe}>
      {/* Ambient fiber glow backdrop */}
      <LinearGradient
        colors={['rgba(37,99,235,0.22)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 0.7 }}
        style={s.glowTop}
      />
      <LinearGradient
        colors={['transparent', 'rgba(6,182,212,0.12)']}
        start={{ x: 1, y: 0.4 }}
        end={{ x: 0.2, y: 1 }}
        style={s.glowBottom}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Brand mark — real app icon, no emoji */}
            <View style={s.logoWrap}>
              <View style={[s.logoFrame, Shadow.glow('rgba(37,99,235,0.55)')]}>
                <Image source={require('../../assets/icon.png')} style={s.logoIcon} />
              </View>
              <Text style={s.logoText}>
                Fib<Text style={{ color: Colors.cyanSoft }}>cast</Text>
              </Text>
              <Text style={s.logoSub}>Your ISP business, in command</Text>
            </View>

            {/* Product highlights */}
            <View style={s.chipRow}>
              {HIGHLIGHTS.map(h => <FeatureChip key={h.label} {...h} />)}
            </View>

            {/* Sign-in card */}
            <View style={s.card}>
              <LinearGradient
                colors={Gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.cardTop}
              />
              <Text style={s.cardTitle}>Welcome back</Text>
              <Text style={s.cardSub}>Sign in to your dealer workspace</Text>

              <FormInput
                label="Email"
                required
                value={email}
                onChangeText={t => { setEmail(t); setError(''); setNotice(''); }}
                placeholder="admin@fibcast.in"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View>
                <FormInput
                  label="Password"
                  required
                  value={password}
                  onChangeText={t => { setPassword(t); setError(''); }}
                  placeholder="Enter password"
                  secureTextEntry={!show}
                />
                <TouchableOpacity
                  onPress={() => setShow(!show)}
                  style={s.showHideBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={s.showHideText}>{show ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              {/* Remember me + forgot password */}
              <View style={s.utilityRow}>
                <TouchableOpacity style={s.rememberWrap} onPress={toggleSaveLogin} activeOpacity={0.7}>
                  <View style={[s.checkbox, saveLogin && s.checkboxOn]}>
                    {saveLogin && <Text style={s.checkMark}>✓</Text>}
                  </View>
                  <Text style={s.rememberText}>Save login</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  disabled={resetLoading}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[s.forgotText, resetLoading && { opacity: 0.6 }]}>
                    {resetLoading ? 'Sending…' : 'Forgot password?'}
                  </Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <View style={s.errorDot} />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              ) : null}

              {notice ? (
                <View style={s.noticeBox}>
                  <View style={s.noticeDot} />
                  <Text style={s.noticeText}>{notice}</Text>
                </View>
              ) : null}

              <PrimaryButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                style={{ marginTop: 6 }}
              />
            </View>

            <Text style={s.version}>Fibcast v1.0.0 · ISP Dealer Management Platform</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  glowTop:     { position: 'absolute', top: 0, left: 0, right: 0, height: 420 },
  glowBottom:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 380 },
  scroll:      { flexGrow: 1, justifyContent: 'center', padding: 24 },

  logoWrap:    { alignItems: 'center', marginBottom: 20 },
  logoFrame:   { borderRadius: 26, overflow: 'hidden', marginBottom: 16 },
  logoIcon:    { width: 84, height: 84, borderRadius: 26 },
  logoText:    { fontSize: 34, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  logoSub:     { fontSize: 13, color: Colors.muted, marginTop: 6, fontWeight: '500' },

  chipRow:     { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 26, flexWrap: 'wrap' },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(14,23,41,0.75)', borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipSymbol:  { color: Colors.cyanSoft, fontSize: 11, fontWeight: '800' },
  chipLabel:   { color: Colors.off, fontSize: 11, fontWeight: '600' },

  card:        { backgroundColor: 'rgba(14,23,41,0.92)', borderRadius: 24, borderWidth: 1, borderColor: Colors.border, padding: 26, overflow: 'hidden', marginBottom: 22, ...Shadow.card },
  cardTop:     { position: 'absolute', top: 0, left: 0, right: 0, height: 2.5 },
  cardTitle:   { fontSize: 21, fontWeight: '900', color: Colors.white, marginBottom: 4, letterSpacing: -0.4 },
  cardSub:     { fontSize: 13, color: Colors.muted, marginBottom: 22 },

  showHideBtn:   { position: 'absolute', right: 16, top: 36 },
  showHideText:  { color: Colors.cyanSoft, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },

  utilityRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  rememberWrap:  { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 2 },
  checkbox:      { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.faint, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  checkboxOn:    { backgroundColor: Colors.blue, borderColor: Colors.blue },
  checkMark:     { color: '#fff', fontSize: 12, fontWeight: '900', marginTop: -1 },
  rememberText:  { color: Colors.off, fontSize: 13, fontWeight: '600' },
  forgotText:    { color: Colors.cyanSoft, fontSize: 13, fontWeight: '800' },

  errorBox:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.10)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.28)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 14 },
  errorDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.redSoft, flexShrink: 0 },
  errorText:   { color: '#FDA4AF', fontSize: 13, fontWeight: '600', flex: 1 },

  noticeBox:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16,185,129,0.10)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.28)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 14 },
  noticeDot:   { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.green, flexShrink: 0 },
  noticeText:  { color: '#6EE7B7', fontSize: 13, fontWeight: '600', flex: 1 },

  version:     { textAlign: 'center', color: Colors.faint, fontSize: 11.5, fontWeight: '600' },
});
