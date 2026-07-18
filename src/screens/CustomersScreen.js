import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme';
import { Avatar, Badge, Card, EmptyState } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

const STATUS_FILTERS = ['All', 'Active', 'Inactive', 'Pending'];

export default function CustomersScreen({ navigation }) {
  const { customers, loading } = useCustomers();
  const [search,  setSearch]  = useState('');
  const [statusF, setStatusF] = useState('All');

  const filtered = useMemo(() => {
    let list = [...customers];
    const q  = search.trim().toLowerCase();
    if (q) {
      list = list.filter(c =>
        c.fullName?.toLowerCase().includes(q)  ||
        c.userID?.toLowerCase().includes(q)    ||
        c.vlanID?.toLowerCase().includes(q)    ||
        c.mobile?.includes(q)                  ||
        c.telephone?.includes(q)               ||
        c.address?.toLowerCase().includes(q)
      );
    }
    if (statusF !== 'All') list = list.filter(c => c.status === statusF);
    return list;
  }, [customers, search, statusF]);

  function renderItem({ item: c, index }) {
    return (
      <TouchableOpacity
        style={[s.row, index < filtered.length - 1 && s.rowBorder]}
        onPress={() => navigation.navigate('CustomerDetail', { customer: c })}
        activeOpacity={0.7}
      >
        <Avatar name={c.fullName} size={44} />
        <View style={s.rowInfo}>
          <Text style={s.rowName} numberOfLines={1}>{c.fullName}</Text>
          <Text style={s.rowMeta} numberOfLines={1}>{c.userID} · VLAN {c.vlanID} · {c.mobile}</Text>
        </View>
        <View style={s.rowRight}>
          <Badge status={c.status} />
          <Text style={s.rowPlan}>{c.planSpeed}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loader}><ActivityIndicator color={Colors.cyan} size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      <View style={s.header}>
        <View>
          <Text style={s.title}>Customers</Text>
          <Text style={s.count}>{filtered.length} of {customers.length}</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('AddCustomer')} activeOpacity={0.8}>
          <Text style={s.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, User ID, VLAN, mobile…"
          placeholderTextColor={Colors.muted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: Colors.muted, fontSize: 18, paddingHorizontal: 8 }}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={s.pillRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setStatusF(f)}
            style={[s.pill, statusF === f && s.pillActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.pillText, statusF === f && s.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={search ? '🔍' : '📡'}
            title={search ? 'No results found' : 'No customers yet'}
            subtitle={search ? 'Try a different search term' : 'Add your first BSNL customer'}
            onAction={!search ? () => navigation.navigate('AddCustomer') : undefined}
            actionLabel="+ Add Customer"
          />
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  loader:         { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12 },
  title:          { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: -0.5 },
  count:          { fontSize: 12, color: Colors.muted, marginTop: 2 },
  addBtn:         { backgroundColor: Colors.blue, borderRadius: 50, paddingHorizontal: 18, paddingVertical: 9 },
  addBtnText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
  searchWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginHorizontal: 18, marginBottom: 12, paddingHorizontal: 12 },
  searchIcon:     { fontSize: 15, marginRight: 6 },
  searchInput:    { flex: 1, color: Colors.white, fontSize: 14, paddingVertical: 11 },
  pillRow:        { flexDirection: 'row', paddingHorizontal: 18, gap: 8, marginBottom: 14 },
  pill:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, borderWidth: 1, borderColor: Colors.border },
  pillActive:     { backgroundColor: Colors.blue, borderColor: Colors.blue },
  pillText:       { fontSize: 12, fontWeight: '600', color: Colors.muted },
  pillTextActive: { color: '#fff' },
  list:           { paddingHorizontal: 18, paddingBottom: 30 },
  row:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12, backgroundColor: Colors.card },
  rowBorder:      { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowInfo:        { flex: 1, minWidth: 0 },
  rowName:        { fontSize: 14, fontWeight: '600', color: Colors.white },
  rowMeta:        { fontSize: 11, color: Colors.muted, marginTop: 2 },
  rowRight:       { alignItems: 'flex-end', gap: 4 },
  rowPlan:        { fontSize: 11, color: Colors.muted },
});