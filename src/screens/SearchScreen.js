import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { Avatar, Badge } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

export default function SearchScreen({ navigation }) {
  const { customers } = useCustomers();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return customers.filter(c =>
      c.fullName?.toLowerCase().includes(q)  ||
      c.userID?.toLowerCase().includes(q)    ||
      c.vlanID?.toLowerCase().includes(q)    ||
      c.mobile?.includes(q)                  ||
      c.telephone?.includes(q)
    );
  }, [customers, query]);

  function renderItem({ item: c }) {
    return (
      <TouchableOpacity
        style={s.resultCard}
        onPress={() => navigation.navigate('Customers', {
          screen: 'CustomerDetail',
          params: { customer: c },
        })}
        activeOpacity={0.7}
      >
        <Avatar name={c.fullName} size={46} />
        <View style={s.resultInfo}>
          <Text style={s.resultName}>{c.fullName}</Text>
          <Text style={s.resultMeta} numberOfLines={1}>{c.address}</Text>
          <Text style={s.resultMeta}>{c.mobile}</Text>
        </View>
        <View style={s.resultRight}>
          <Text style={s.resultUID}>{c.userID}</Text>
          <Text style={s.resultVlan}>VLAN {c.vlanID}</Text>
          <Text style={s.resultPlan}>{c.planSpeed}</Text>
          <Badge status={c.status} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Text style={s.title}>Quick Search</Text>
      <Text style={s.sub}>Find any customer by User ID, VLAN, mobile or name.</Text>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          autoFocus
          style={s.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Type User ID, VLAN, mobile, name…"
          placeholderTextColor={Colors.muted}
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={{ color: Colors.muted, fontSize: 18, paddingHorizontal: 8 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {query && results.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>😕</Text>
          <Text style={s.emptyTitle}>No match found</Text>
          <Text style={s.emptySub}>Try a different User ID or name</Text>
        </View>
      ) : null}

      {!query ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>⚡</Text>
          <Text style={s.emptyTitle}>Instant lookup</Text>
          <Text style={s.emptySub}>Find any customer in under a second</Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  title:       { fontSize: 22, fontWeight: '900', color: Colors.white, paddingHorizontal: 18, paddingTop: 16, letterSpacing: -0.5 },
  sub:         { fontSize: 13, color: Colors.muted, paddingHorizontal: 18, marginTop: 4, marginBottom: 16 },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, marginHorizontal: 18, marginBottom: 16, paddingHorizontal: 14 },
  searchIcon:  { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, color: Colors.white, fontSize: 16, paddingVertical: 14 },
  list:        { paddingHorizontal: 18, gap: 10, paddingBottom: 30 },
  resultCard:  { backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  resultInfo:  { flex: 1, minWidth: 0 },
  resultName:  { fontSize: 15, fontWeight: '700', color: Colors.white, marginBottom: 3 },
  resultMeta:  { fontSize: 12, color: Colors.muted, marginTop: 1 },
  resultRight: { alignItems: 'flex-end', gap: 4 },
  resultUID:   { fontSize: 15, fontWeight: '900', color: Colors.cyan },
  resultVlan:  { fontSize: 11, color: Colors.muted },
  resultPlan:  { fontSize: 11, color: Colors.muted },
  empty:       { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIcon:   { fontSize: 52, marginBottom: 14 },
  emptyTitle:  { fontSize: 17, fontWeight: '700', color: Colors.white, marginBottom: 6 },
  emptySub:    { fontSize: 13, color: Colors.muted },
});