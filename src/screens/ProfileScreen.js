import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Gradients, Shadow } from '../theme';
import { Card } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useBusiness } from '../context/BusinessContext';

function MenuRow({ icon, title, subtitle, onPress, last }) {
  return (
    <TouchableOpacity
      style={[s.menuRow, !last && s.menuRowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={s.menuIconWrap}>
        <Text style={s.menuIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.menuTitle}>{title}</Text>
        <Text style={s.menuSub} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Text style={s.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { isOwner } = useRole();
  const { profile } = useBusiness();

  const displayName = (isOwner && profile?.ownerName) || user?.email?.split('@')[0] || 'User';
  const initial     = (profile?.ownerName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  function confirmSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Identity */}
        <View style={s.identity}>
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.avatar, Shadow.glow(Colors.blue)]}
          >
            <Text style={s.avatarText}>{initial}</Text>
          </LinearGradient>
          <Text style={s.name} numberOfLines={1}>{displayName}</Text>
          <Text style={s.email} numberOfLines={1}>{user?.email || ''}</Text>
          <View style={[s.rolePill, isOwner ? s.roleOwner : s.roleStaff]}>
            <Text style={[s.roleText, isOwner ? { color: Colors.cyanSoft } : { color: Colors.off }]}>
              {isOwner ? '👑 Owner' : '👤 Staff'}
            </Text>
          </View>
        </View>

        {/* Business snapshot — owner only */}
        {isOwner && (
          <>
            <Text style={s.sectionLabel}>BUSINESS</Text>
            <Card>
              <View style={s.bizRow}>
                <Text style={s.bizIcon}>🏢</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.bizName} numberOfLines={1}>{profile.businessName || 'Business name not set'}</Text>
                  <Text style={s.bizMeta} numberOfLines={1}>
                    {[profile.area, profile.city].filter(Boolean).join(' · ') || 'Service area not set'}
                  </Text>
                  {profile.dealerCode ? (
                    <Text style={s.bizDealer} numberOfLines={1}>Dealer code: {profile.dealerCode}</Text>
                  ) : null}
                </View>
              </View>
              <TouchableOpacity
                style={s.bizEdit}
                onPress={() => navigation.navigate('Business', { screen: 'EditProfile' })}
                activeOpacity={0.75}
              >
                <Text style={s.bizEditText}>✏️  Edit business profile</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Menu */}
        <Text style={s.sectionLabel}>PREFERENCES</Text>
        <Card>
          <MenuRow
            icon="⚙️"
            title="Settings"
            subtitle="Account, billing cycle, reminders"
            onPress={() => navigation.navigate('Settings')}
            last
          />
        </Card>

        {/* Sign out */}
        <TouchableOpacity style={s.signOut} onPress={confirmSignOut} activeOpacity={0.75}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Fibcast v1.0.0</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  scroll:      { paddingHorizontal: 18 },

  identity:    { alignItems: 'center', paddingTop: 14, paddingBottom: 6 },
  avatar:      { width: 96, height: 96, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText:  { fontSize: 38, fontWeight: '900', color: '#fff' },
  name:        { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: -0.6, textTransform: 'capitalize' },
  email:       { fontSize: 13, color: Colors.muted, marginTop: 4, fontWeight: '500' },
  rolePill:    { marginTop: 12, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1 },
  roleOwner:   { backgroundColor: 'rgba(6,182,212,0.10)', borderColor: 'rgba(6,182,212,0.28)' },
  roleStaff:   { backgroundColor: Colors.glass, borderColor: Colors.border },
  roleText:    { fontSize: 11.5, fontWeight: '800' },

  sectionLabel:{ fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 24, marginBottom: 10 },

  bizRow:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  bizIcon:     { fontSize: 26 },
  bizName:     { fontSize: 15, fontWeight: '800', color: Colors.white },
  bizMeta:     { fontSize: 12, color: Colors.muted, marginTop: 3 },
  bizDealer:   { fontSize: 11.5, color: Colors.cyanSoft, marginTop: 3, fontWeight: '700' },
  bizEdit:     { borderTopWidth: 1, borderTopColor: Colors.border, paddingVertical: 13, alignItems: 'center' },
  bizEditText: { color: Colors.cyanSoft, fontSize: 13, fontWeight: '800' },

  menuRow:     { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIconWrap:{ width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(6,182,212,0.09)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.18)', alignItems: 'center', justifyContent: 'center' },
  menuIcon:    { fontSize: 17 },
  menuTitle:   { color: Colors.white, fontSize: 14, fontWeight: '800' },
  menuSub:     { color: Colors.muted, fontSize: 11.5, marginTop: 2 },
  menuChevron: { color: Colors.faint, fontSize: 22 },

  signOut:     { marginTop: 26, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.30)', alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.08)' },
  signOutText: { color: Colors.redSoft, fontWeight: '800', fontSize: 14 },
  version:     { textAlign: 'center', color: Colors.faint, fontSize: 11, fontWeight: '600', marginTop: 22 },
});
