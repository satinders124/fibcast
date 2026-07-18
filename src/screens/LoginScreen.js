import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { FormInput, PrimaryButton } from '../components/UI';
import { useAuth } from '../context/AuthContext';

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
    } catch (e) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          <View style={s.logoWrap}>
            <View style={s.logoIcon}>
              <Text style={{ fontSize: 32 }}>📡</Text>
            </View>
            <Text style={s.logoText}>
              Fib<Text style={{ color: Colors.cyan }}>cast</Text>
            </Text>
            <Text style={s.logoSub}>ISP Dealer Management Platform</Text>
          </View>

          <View style={s.card}>
            <View style={s.cardTop} />
            <Text style={s.cardTitle}>Sign In</Text>
            <Text style={s.cardSub}>Enter your credentials to continue</Text>

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
              <TouchableOpacity onPress={() => setShow(!show)} style={s.eyeBtn}>
                <Text style={{ fontSize: 16 }}>{show ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            {loading ? (
              <ActivityIndicator color={Colors.cyan} size="large" style={{ marginTop: 10 }} />
            ) : (
              <PrimaryButton title="Sign In →" onPress={handleLogin} style={{ marginTop: 8 }} />
            )}
          </View>

          <Text style={s.version}>Fibcast v1.0.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap:  { alignItems: 'center', marginBottom: 36 },
  logoIcon:  { width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: Colors.blue, shadowOpacity: 0.4, shadowRadius: 20, elevation: 8 },
  logoText:  { fontSize: 30, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  logoSub:   { fontSize: 13, color: Colors.muted, marginTop: 4 },
  card:      { backgroundColor: Colors.card, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, padding: 26, overflow: 'hidden', marginBottom: 20 },
  cardTop:   { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: Colors.blue },
  cardTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: Colors.muted, marginBottom: 24 },
  eyeBtn:    { position: 'absolute', right: 14, top: 30 },
  errorBox:  { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { color: '#FCA5A5', fontSize: 13 },
  version:   { textAlign: 'center', color: Colors.muted, fontSize: 12 },
});