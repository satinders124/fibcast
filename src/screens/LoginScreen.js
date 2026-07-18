import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Shadow } from '../theme';
import { FormInput, PrimaryButton } from '../components/UI';
import { useAuth } from '../context/AuthContext';

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
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true); setError('');
    try {
      await login(email.trim(), password);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
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

            {/* Brand mark */}
            <View style={s.logoWrap}>
              <LinearGradient
                colors={Gradients.brand}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[s.logoIcon, Shadow.glow(Colors.blue)]}
              >
                <Text style={s.logoEmoji}>📡</Text>
              </LinearGradient>
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
                onChangeText={t => { setEmail(t); setError(''); }}
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
                <TouchableOpacity onPress={() => setShow(!show)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ fontSize: 16 }}>{show ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={s.errorBox}>
                  <View style={s.errorDot} />
                  <Text style={s.errorText}>{error}</Text>
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

  logoWrap:    { alignItems: 'center', marginBottom: 22 },
  logoIcon:    { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoEmoji:   { fontSize: 34 },
  logoText:    { fontSize: 34, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  logoSub:     { fontSize: 13, color: Colors.muted, marginTop: 6, fontWeight: '500' },

  chipRow:     { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 30, flexWrap: 'wrap' },
  chip:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(14,23,41,0.75)', borderWidth: 1, borderColor: Colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipSymbol:  { color: Colors.cyanSoft, fontSize: 11, fontWeight: '800' },
  chipLabel:   { color: Colors.off, fontSize: 11, fontWeight: '600' },

  card:        { backgroundColor: 'rgba(14,23,41,0.92)', borderRadius: 24, borderWidth: 1, borderColor: Colors.border, padding: 26, overflow: 'hidden', marginBottom: 22, ...Shadow.card },
  cardTop:     { position: 'absolute', top: 0, left: 0, right: 0, height: 2.5 },
  cardTitle:   { fontSize: 21, fontWeight: '900', color: Colors.white, marginBottom: 4, letterSpacing: -0.4 },
  cardSub:     { fontSize: 13, color: Colors.muted, marginBottom: 24 },
  eyeBtn:      { position: 'absolute', right: 14, top: 32 },

  errorBox:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,0.10)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.28)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 14 },
  errorDot:    { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.redSoft, flexShrink: 0 },
  errorText:   { color: '#FDA4AF', fontSize: 13, fontWeight: '600', flex: 1 },

  version:     { textAlign: 'center', color: Colors.faint, fontSize: 11.5, fontWeight: '600' },
});
