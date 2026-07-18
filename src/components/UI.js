import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, Animated, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Status, avatarColors, Shadow, Radius } from '../theme';

export function Avatar({ name = '', size = 40 }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const color    = avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length];
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: Math.max(10, size * 0.28), backgroundColor: color }]}>
      <Text style={[s.avatarText, { fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export function Badge({ status }) {
  const st = Status[status] || Status.Pending;
  return (
    <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
      <View style={[s.badgeDot, { backgroundColor: st.text }]} />
      <Text style={[s.badgeText, { color: st.text }]}>{status}</Text>
    </View>
  );
}

export function PrimaryButton({ title, onPress, style, small, loading = false, disabled = false }) {
  const inactive = loading || disabled;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={inactive}
      style={[small && s.primaryBtnSm, inactive && { opacity: 0.72 }, style]}
    >
      <LinearGradient
        colors={Gradients.brand}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.primaryBtn, small && s.primaryBtnSmInner]}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text style={[s.primaryBtnText, small && { fontSize: 13 }]}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function GhostButton({ title, onPress, style, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[s.ghostBtn, danger && s.ghostBtnDanger, style]}
    >
      <Text style={[s.ghostBtnText, danger && { color: Colors.redSoft }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function FormInput({ label, required, error, multiline, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.fieldWrap}>
      {label ? (
        <Text style={s.fieldLabel}>
          {label}{required && <Text style={{ color: Colors.red }}> *</Text>}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={Colors.faint}
        style={[
          s.input,
          multiline && { height: 92, textAlignVertical: 'top', paddingTop: 14 },
          focused && !error && { borderColor: Colors.borderH },
          error && { borderColor: 'rgba(239,68,68,0.55)' },
        ]}
        multiline={multiline}
        onFocus={e => { setFocused(true);  props.onFocus?.(e); }}
        onBlur={e  => { setFocused(false); props.onBlur?.(e);  }}
        {...props}
      />
      {error ? (
        <View style={s.fieldErrorRow}>
          <View style={s.fieldErrorDot} />
          <Text style={s.fieldError}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function Card({ children, style, accent }) {
  return (
    <View style={[s.card, style]}>
      {accent && <LinearGradient colors={[accent, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.cardAccent} />}
      {children}
    </View>
  );
}

export function SectionLabel({ text }) {
  return <Text style={s.sectionLabel}>{text}</Text>;
}

export function Divider() {
  return <View style={s.divider} />;
}

export function Toast({ message, type = 'success', visible, onHide }) {
  const anim      = useRef(new Animated.Value(0)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide; // latest-callback ref — effect restarts only when visibility flips

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.spring(anim,  { toValue: 1, useNativeDriver: true, damping: 16, stiffness: 220 }),
        Animated.delay(2400),
        Animated.timing(anim,  { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => onHideRef.current?.());
    }
  }, [visible, anim]);

  if (!visible) return null;

  const err = type === 'error';
  return (
    <Animated.View style={[
      s.toast,
      {
        borderColor: err ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.35)',
        transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [18, 0] }) }],
        opacity: anim,
      },
    ]}>
      <View style={[s.toastIcon, { backgroundColor: err ? 'rgba(239,68,68,0.16)' : 'rgba(16,185,129,0.16)' }]}>
        <Text style={{ fontSize: 13, color: err ? Colors.redSoft : Colors.green }}>{err ? '✕' : '✓'}</Text>
      </View>
      <Text style={s.toastText}>{message}</Text>
    </Animated.View>
  );
}

export function EmptyState({ icon = '📡', title, subtitle, onAction, actionLabel }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIconWrap}>
        <Text style={s.emptyIcon}>{icon}</Text>
      </View>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={s.emptySub}>{subtitle}</Text> : null}
      {onAction && (
        <PrimaryButton title={actionLabel} onPress={onAction} style={{ marginTop: 26, minWidth: 190 }} />
      )}
    </View>
  );
}

export function StatCard({ icon, label, value, accent, style }) {
  return (
    <View style={[s.statCard, style]}>
      <LinearGradient
        colors={[accent || Colors.blue, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.statAccent}
      />
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export function ListRow({ left, title, subtitle, right, onPress, last }) {
  const Inner = (
    <View style={[s.listRow, !last && s.listRowBorder]}>
      {left && <View style={s.listLeft}>{left}</View>}
      <View style={s.listCenter}>
        <Text style={s.listTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={s.listSub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right && <View style={s.listRight}>{right}</View>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Inner}
      </TouchableOpacity>
    );
  }
  return Inner;
}

const s = StyleSheet.create({
  // Avatar — soft rounded square with subtle lift
  avatar:          { alignItems: 'center', justifyContent: 'center', ...Shadow.soft },
  avatarText:      { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },

  // Badge — status pill
  badge:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3.5, borderRadius: Radius.pill, borderWidth: 1 },
  badgeDot:        { width: 5, height: 5, borderRadius: 3 },
  badgeText:       { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  // Buttons
  primaryBtn:      { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center', minHeight: 52, overflow: 'hidden', ...Shadow.glow() },
  primaryBtnSm:    { },
  primaryBtnSmInner: { paddingVertical: 10, paddingHorizontal: 18, minHeight: 40 },
  primaryBtnText:  { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 },
  ghostBtn:        { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.glass },
  ghostBtnDanger:  { borderColor: 'rgba(239,68,68,0.32)', backgroundColor: 'rgba(239,68,68,0.08)' },
  ghostBtnText:    { color: Colors.off, fontWeight: '700', fontSize: 14 },

  // Form
  fieldWrap:       { marginBottom: 16 },
  fieldLabel:      { fontSize: 10.5, fontWeight: '800', color: Colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input:           { backgroundColor: 'rgba(14,23,41,0.85)', borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.white, minHeight: 52 },
  fieldErrorRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7 },
  fieldErrorDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.redSoft },
  fieldError:      { color: Colors.redSoft, fontSize: 12, fontWeight: '600' },

  // Card — layered surface
  card:            { backgroundColor: Colors.card, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', ...Shadow.card },
  cardAccent:      { height: 2, width: '100%' },

  sectionLabel:    { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  divider:         { height: 1, backgroundColor: Colors.border },

  // Toast — floating status bar
  toast:           { position: 'absolute', bottom: 26, left: 16, right: 16, backgroundColor: '#0B1322', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 9999, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.55, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 14 },
  toastIcon:       { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  toastText:       { color: Colors.white, fontWeight: '700', fontSize: 13.5, flex: 1 },

  // Empty state — icon capsule on soft glow
  empty:           { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIconWrap:   { width: 84, height: 84, borderRadius: 26, backgroundColor: 'rgba(37,99,235,0.10)', borderWidth: 1, borderColor: 'rgba(37,99,235,0.22)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  emptyIcon:       { fontSize: 34 },
  emptyTitle:      { fontSize: 18, fontWeight: '800', color: Colors.white, marginBottom: 8, textAlign: 'center', letterSpacing: -0.3 },
  emptySub:        { fontSize: 13.5, color: Colors.muted, textAlign: 'center', lineHeight: 20 },

  // Stat card
  statCard:        { flex: 1, backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 16, overflow: 'hidden' },
  statAccent:      { position: 'absolute', top: 0, left: 0, right: 0, height: 2.5 },
  statIcon:        { fontSize: 19, marginBottom: 10 },
  statValue:       { fontSize: 26, fontWeight: '900', color: Colors.white, lineHeight: 30, letterSpacing: -0.6 },
  statLabel:       { fontSize: 10.5, color: Colors.muted, marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7 },

  // List row
  listRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  listRowBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.border },
  listLeft:        { flexShrink: 0 },
  listCenter:      { flex: 1, minWidth: 0 },
  listTitle:       { fontSize: 14, fontWeight: '700', color: Colors.white },
  listSub:         { fontSize: 12, color: Colors.muted, marginTop: 2 },
  listRight:       { flexShrink: 0, alignItems: 'flex-end' },
});
