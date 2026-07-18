import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, Animated,
} from 'react-native';
import { Colors, Status, avatarColors } from '../theme';

export function Avatar({ name = '', size = 40 }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const color    = avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length];
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: 4, backgroundColor: color }]}>
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

export function PrimaryButton({ title, onPress, style, small }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[s.primaryBtn, small && s.primaryBtnSm, style]}
    >
      <Text style={[s.primaryBtnText, small && { fontSize: 13 }]}>{title}</Text>
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
      <Text style={[s.ghostBtnText, danger && { color: Colors.red }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function FormInput({ label, required, error, multiline, ...props }) {
  return (
    <View style={s.fieldWrap}>
      {label ? (
        <Text style={s.fieldLabel}>
          {label}{required && <Text style={{ color: Colors.red }}> *</Text>}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={Colors.muted}
        style={[
          s.input,
          multiline && { height: 88, textAlignVertical: 'top', paddingTop: 12 },
          error && { borderColor: Colors.red, borderWidth: 1.5 },
        ]}
        multiline={multiline}
        {...props}
      />
      {error ? <Text style={s.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style, accent }) {
  return (
    <View style={[s.card, style]}>
      {accent && <View style={[s.cardAccent, { backgroundColor: accent }]} />}
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
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2400),
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(onHide);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[
      s.toast,
      type === 'error' && s.toastError,
      {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [16, 0] }) }],
      }
    ]}>
      <View style={[s.toastDot, { backgroundColor: type === 'error' ? Colors.red : Colors.green }]} />
      <Text style={s.toastText}>{message}</Text>
    </Animated.View>
  );
}

export function EmptyState({ icon = '📡', title, subtitle, onAction, actionLabel }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>{icon}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle && <Text style={s.emptySub}>{subtitle}</Text>}
      {onAction && (
        <PrimaryButton title={actionLabel} onPress={onAction} style={{ marginTop: 24 }} />
      )}
    </View>
  );
}

export function StatCard({ icon, label, value, accent, style }) {
  return (
    <View style={[s.statCard, style]}>
      <View style={[s.statAccent, { backgroundColor: accent || Colors.blue }]} />
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
        {subtitle && <Text style={s.listSub} numberOfLines={1}>{subtitle}</Text>}
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
  // Avatar — square not circle, more corporate
  avatar:          { alignItems: 'center', justifyContent: 'center' },
  avatarText:      { color: '#fff', fontWeight: '800', letterSpacing: 0.5 },

  // Badge
  badge:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  badgeDot:        { width: 5, height: 5, borderRadius: 3 },
  badgeText:       { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  // Buttons
  primaryBtn:      { backgroundColor: Colors.blue, borderRadius: 6, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  primaryBtnSm:    { paddingVertical: 9, paddingHorizontal: 18 },
  primaryBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 },
  ghostBtn:        { borderRadius: 6, paddingVertical: 13, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  ghostBtnDanger:  { borderColor: 'rgba(255,59,48,0.3)', backgroundColor: 'rgba(255,59,48,0.06)' },
  ghostBtnText:    { color: Colors.off, fontWeight: '600', fontSize: 14 },

  // Form
  fieldWrap:       { marginBottom: 16 },
  fieldLabel:      { fontSize: 11, fontWeight: '700', color: Colors.muted, marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.8 },
  input:           { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: Colors.white },
  fieldError:      { color: Colors.red, fontSize: 11, marginTop: 5 },

  // Card — sharp corners, thin border
  card:            { backgroundColor: Colors.card, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  cardAccent:      { height: 2, width: '100%' },

  sectionLabel:    { fontSize: 11, fontWeight: '700', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  divider:         { height: 1, backgroundColor: Colors.border },

  // Toast — bottom bar style
  toast:           { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#1E1E1E', borderRadius: 8, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 9999, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  toastError:      { borderColor: 'rgba(255,59,48,0.3)' },
  toastDot:        { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  toastText:       { color: Colors.white, fontWeight: '600', fontSize: 14, flex: 1 },

  // Empty state
  empty:           { alignItems: 'center', justifyContent: 'center', paddingVertical: 64, paddingHorizontal: 32 },
  emptyIcon:       { fontSize: 48, marginBottom: 16 },
  emptyTitle:      { fontSize: 18, fontWeight: '700', color: Colors.white, marginBottom: 8, textAlign: 'center' },
  emptySub:        { fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 20 },

  // Stat card
  statCard:        { flex: 1, backgroundColor: Colors.card, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, padding: 14, overflow: 'hidden' },
  statAccent:      { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  statIcon:        { fontSize: 20, marginBottom: 10 },
  statValue:       { fontSize: 26, fontWeight: '800', color: Colors.white, lineHeight: 28, letterSpacing: -0.5 },
  statLabel:       { fontSize: 11, color: Colors.muted, marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  // List row
  listRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  listRowBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.border },
  listLeft:        { flexShrink: 0 },
  listCenter:      { flex: 1, minWidth: 0 },
  listTitle:       { fontSize: 14, fontWeight: '600', color: Colors.white },
  listSub:         { fontSize: 12, color: Colors.muted, marginTop: 2 },
  listRight:       { flexShrink: 0, alignItems: 'flex-end' },
});