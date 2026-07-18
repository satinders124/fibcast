import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as XLSX from 'xlsx';
import { Colors } from '../theme';
import { Card, PrimaryButton, GhostButton, Toast } from '../components/UI';
import { useCustomers } from '../context/CustomerContext';

// ── Parse plan
function parsePlan(raw) {
  if (!raw) return 'Unknown';
  const upper = raw.toUpperCase();
  if (upper.includes('299'))  return '₹299';
  if (upper.includes('399'))  return '₹399';
  if (upper.includes('449'))  return '₹449';
  if (upper.includes('495'))  return '₹495';
  if (upper.includes('499'))  return '₹499';
  if (upper.includes('549'))  return '₹549';
  if (upper.includes('595'))  return '₹595';
  if (upper.includes('599'))  return '₹599';
  if (upper.includes('699'))  return '₹699';
  if (upper.includes('695'))  return '₹695';
  if (upper.includes('777'))  return '₹777';
  if (upper.includes('799'))  return '₹799';
  if (upper.includes('999'))  return '₹999';
  if (upper.includes('1099')) return '₹1099';
  if (upper.includes('GOVT')) return 'Govt Plan';
  return raw.slice(0, 20);
}

// ── Title case helper
function toTitle(str) {
  return str.trim().split(' ').map(w =>
    w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
  ).join(' ');
}

// ── Parse full name (before SO/WO/DO)
function parseName(raw) {
  if (!raw) return '';
  const namePart = raw.split(',,')[0].trim();
  const match = namePart.match(/^(.+?)\s+(SO|WO|DO)\s+.+$/i);
  if (match) return toTitle(match[1]);
  return toTitle(namePart);
}

// ── Parse father/husband name (after SO/WO/DO)
function parseFatherName(raw) {
  if (!raw) return '';
  const namePart = raw.split(',,')[0].trim();
  const match = namePart.match(/^(.+?)\s+(SO|WO|DO)\s+(.+)$/i);
  if (match) return toTitle(match[3]);
  return '';
}

// ── Parse address (after ,,)
function parseAddress(raw) {
  if (!raw) return '';
  const parts = raw.split(',,');
  if (parts.length > 1) {
    return parts[1].trim()
      .replace(/,\s*\d{6}\s*$/, '')
      .replace(/,PB,/gi, ', ')
      .replace(/,/g, ', ')
      .trim();
  }
  return '';
}

// ── Parse status
function parseStatus(raw) {
  if (!raw) return 'Inactive';
  const s = raw.toUpperCase();
  if (s === 'ACTIVE') return 'Active';
  if (s === 'SUSPENDED' || s === 'INACTIVE') return 'Inactive';
  return 'Pending';
}

export default function ImportScreen({ navigation }) {
  const { addCustomer, customers } = useCustomers();
  const [preview,   setPreview]   = useState([]);
  const [fileName,  setFileName]  = useState('');
  const [importing, setImporting] = useState(false);
  const [imported,  setImported]  = useState(0);
  const [toast,     setToast]     = useState({ visible: false, message: '', type: 'success' });
  const [step,      setStep]      = useState('pick');

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const file   = result.assets[0];
      setFileName(file.name);

      const base64   = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook  = XLSX.read(base64, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const sheet     = workbook.Sheets[sheetName];
      const rows      = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rows.length < 2) {
        setToast({ visible: true, message: 'No data found in file.', type: 'error' });
        return;
      }

      // Find header row
      let headerRow = 0;
      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const row = rows[i].map(c => String(c).toUpperCase());
        if (row.includes('BB_USER_ID') || row.includes('CUSTOMER_NAME')) {
          headerRow = i;
          break;
        }
      }

      const headers = rows[headerRow].map(c => String(c).toUpperCase().trim());
      const idx = {
        name:    headers.indexOf('CUSTOMER_NAME'),
        phone:   headers.indexOf('PHONE_NO'),
        mobile:  headers.indexOf('MOBILE_NO'),
        userID:  headers.indexOf('BB_USER_ID'),
        plan:    headers.indexOf('BB_PLAN'),
        status:  headers.indexOf('WKG_STATUS'),
        date:    headers.indexOf('LL_INSTALL_DATE'),
        billing: headers.indexOf('BILLINGACCOUNT_NO'),
      };

      const parsed = [];
      for (let i = headerRow + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 3) continue;

        const rawName = idx.name >= 0 ? String(row[idx.name] || '') : '';
        const userID  = idx.userID >= 0 ? String(row[idx.userID] || '') : '';
        if (!rawName && !userID) continue;

        parsed.push({
          fullName:   parseName(rawName),
          fatherName: parseFatherName(rawName),
          address:    parseAddress(rawName),
          telephone:  idx.phone >= 0   ? String(row[idx.phone]   || '') : '',
          mobile:     idx.mobile >= 0  ? String(row[idx.mobile]  || '') : '',
          userID:     userID,
          vlanID:     idx.billing >= 0 ? String(row[idx.billing] || '') : '',
          planSpeed:  parsePlan(idx.plan >= 0 ? String(row[idx.plan] || '') : ''),
          status:     parseStatus(idx.status >= 0 ? String(row[idx.status] || '') : ''),
          joinDate:   idx.date >= 0    ? String(row[idx.date]    || '') : '',
          billPaid:   'Unpaid',
          notes:      'Imported from BSNL FMS',
        });
      }

      if (parsed.length === 0) {
        setToast({ visible: true, message: 'No valid BSNL data found.', type: 'error' });
        return;
      }

      setPreview(parsed);
      setStep('preview');
    } catch (e) {
      console.log('File pick error:', e);
      setToast({ visible: true, message: 'Failed to read file. Try again.', type: 'error' });
    }
  }

  async function importAll() {
    setImporting(true);
    let count = 0;
    const existingIDs = new Set(customers.map(c => c.userID));
    const toImport    = preview.filter(c => !existingIDs.has(c.userID));
    const dupes       = preview.length - toImport.length;

    for (const customer of toImport) {
      try { await addCustomer(customer); count++; }
      catch (e) { console.log('Import error:', e); }
    }

    setImported(count);
    setImporting(false);
    setStep('done');
    setToast({
      visible: true,
      message: dupes > 0 ? `${count} imported, ${dupes} skipped (duplicates)` : `${count} customers imported!`,
      type: 'success',
    });
  }

  function reset() {
    setPreview([]); setFileName(''); setImported(0); setStep('pick');
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.title}>Import from BSNL</Text>
          <Text style={s.sub}>Upload your BSNL FMS Excel export to bulk import customers.</Text>
        </View>

        {/* PICK */}
        {step === 'pick' && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>HOW TO EXPORT FROM BSNL FMS</Text>
            <Card style={{ padding: 16, marginBottom: 20 }}>
              {[
                '1. Log in to BSNL FMS portal',
                '2. Go to Customer Accounts section',
                '3. Export / Download as Excel or CSV',
                '4. Come back here and upload the file',
              ].map((st, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepDot} />
                  <Text style={s.stepText}>{st}</Text>
                </View>
              ))}
            </Card>

            <Text style={s.sectionLabel}>WHAT GETS IMPORTED</Text>
            <Card style={{ marginBottom: 20 }}>
              {[
                ['Customer Name',    'Full Name'],
                ['SO/WO/DO Name',    'Father / Husband Name'],
                ['Phone No.',        'Telephone'],
                ['Mobile No.',       'Mobile'],
                ['BB User ID',       'User ID'],
                ['Billing Acct No.', 'VLAN ID'],
                ['BB Plan',          'Plan (₹ price)'],
                ['Working Status',   'Status'],
                ['Install Date',     'Join Date'],
                ['Address',          'Address (extracted)'],
              ].map(([from, to]) => (
                <View key={from} style={s.mapRow}>
                  <Text style={s.mapFrom}>{from}</Text>
                  <Text style={s.mapArrow}>→</Text>
                  <Text style={s.mapTo}>{to}</Text>
                </View>
              ))}
            </Card>

            <TouchableOpacity style={s.uploadBtn} onPress={pickFile} activeOpacity={0.8}>
              <Text style={s.uploadIcon}>📂</Text>
              <Text style={s.uploadTitle}>Choose Excel / CSV File</Text>
              <Text style={s.uploadSub}>Export from BSNL FMS and upload here</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* PREVIEW */}
        {step === 'preview' && (
          <View style={s.section}>
            <View style={s.previewHeader}>
              <View style={s.previewBadge}>
                <Text style={s.previewBadgeText}>📄 {fileName}</Text>
              </View>
              <Text style={s.previewCount}>{preview.length} customers found</Text>
            </View>

            <Card style={{ padding: 16, marginBottom: 16 }}>
              <View style={s.summaryRow}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryValue}>{preview.length}</Text>
                  <Text style={s.summaryLabel}>Total</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={[s.summaryValue, { color: Colors.green }]}>
                    {preview.filter(c => c.status === 'Active').length}
                  </Text>
                  <Text style={s.summaryLabel}>Active</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={[s.summaryValue, { color: Colors.red }]}>
                    {preview.filter(c => c.status === 'Inactive').length}
                  </Text>
                  <Text style={s.summaryLabel}>Inactive</Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={[s.summaryValue, { color: Colors.cyan }]}>
                    {customers.filter(c => preview.some(p => p.userID === c.userID)).length}
                  </Text>
                  <Text style={s.summaryLabel}>Dupes</Text>
                </View>
              </View>
            </Card>

            <Text style={s.sectionLabel}>PREVIEW (first 10)</Text>
            <Card style={{ marginBottom: 20 }}>
              {preview.slice(0, 10).map((c, i) => (
                <View key={i} style={[s.previewRow, i < 9 && s.previewRowBorder]}>
                  <View style={s.previewAvatar}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>
                      {c.fullName.split(' ').slice(0,2).map(w => w[0] || '').join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={s.previewInfo}>
                    <Text style={s.previewName} numberOfLines={1}>{c.fullName}</Text>
                    <Text style={s.previewMeta} numberOfLines={1}>
                      {c.fatherName ? `S/O W/O: ${c.fatherName} · ` : ''}{c.userID} · {c.planSpeed}
                    </Text>
                  </View>
                  <View style={[s.statusDot, { backgroundColor: c.status === 'Active' ? Colors.green : Colors.red }]} />
                </View>
              ))}
              {preview.length > 10 && (
                <View style={s.moreRow}>
                  <Text style={s.moreText}>+ {preview.length - 10} more customers</Text>
                </View>
              )}
            </Card>

            <View style={s.actions}>
              <GhostButton title="← Back" onPress={reset} style={{ flex: 1 }} />
              {importing ? (
                <View style={[s.importingBtn, { flex: 2 }]}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={s.importingText}>Importing…</Text>
                </View>
              ) : (
                <PrimaryButton
                  title={`Import ${preview.length} Customers`}
                  onPress={importAll}
                  style={{ flex: 2 }}
                />
              )}
            </View>
          </View>
        )}

        {/* DONE */}
        {step === 'done' && (
          <View style={s.section}>
            <View style={s.doneCard}>
              <Text style={s.doneIcon}>✅</Text>
              <Text style={s.doneTitle}>{imported} Customers Imported!</Text>
              <Text style={s.doneSub}>
                All customers from your BSNL FMS export have been added to Fibcast.
              </Text>
              <PrimaryButton title="View Customers →" onPress={() => navigation.navigate('Customers')} style={{ marginTop: 20 }} />
              <GhostButton title="Import Another File" onPress={reset} style={{ marginTop: 12 }} />
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
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
  safe:             { flex: 1, backgroundColor: Colors.bg },
  header:           { paddingHorizontal: 18, paddingTop: 18, marginBottom: 8 },
  title:            { fontSize: 26, fontWeight: '900', color: Colors.white, letterSpacing: -0.8 },
  sub:              { fontSize: 13, color: Colors.muted, marginTop: 4, lineHeight: 18 },
  section:          { paddingHorizontal: 18, marginTop: 18 },
  sectionLabel:     { fontSize: 10.5, fontWeight: '800', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 },
  stepRow:          { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  stepDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cyan, marginTop: 5, flexShrink: 0 },
  stepText:         { fontSize: 13, color: Colors.off, lineHeight: 18, flex: 1 },
  mapRow:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8 },
  mapFrom:          { fontSize: 12, color: Colors.muted, flex: 1 },
  mapArrow:         { fontSize: 12, color: Colors.muted },
  mapTo:            { fontSize: 12, color: Colors.cyan, flex: 1.2, textAlign: 'right' },
  uploadBtn:        { backgroundColor: Colors.cardAlt, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.borderH, borderStyle: 'dashed', padding: 34, alignItems: 'center', gap: 8 },
  uploadIcon:       { fontSize: 40 },
  uploadTitle:      { fontSize: 16, fontWeight: '800', color: Colors.white },
  uploadSub:        { fontSize: 12, color: Colors.muted, textAlign: 'center' },
  previewHeader:    { marginBottom: 14 },
  previewBadge:     { backgroundColor: 'rgba(6,182,212,0.1)', borderWidth: 1, borderColor: 'rgba(6,182,212,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 6 },
  previewBadgeText: { fontSize: 12, color: Colors.cyan, fontWeight: '600' },
  previewCount:     { fontSize: 20, fontWeight: '900', color: Colors.white },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem:      { alignItems: 'center' },
  summaryValue:     { fontSize: 24, fontWeight: '900', color: Colors.white },
  summaryLabel:     { fontSize: 11, color: Colors.muted, marginTop: 4 },
  previewRow:       { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  previewRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  previewAvatar:    { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  previewInfo:      { flex: 1, minWidth: 0 },
  previewName:      { fontSize: 13, fontWeight: '600', color: Colors.white },
  previewMeta:      { fontSize: 11, color: Colors.muted, marginTop: 2 },
  statusDot:        { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  moreRow:          { padding: 12, alignItems: 'center' },
  moreText:         { fontSize: 12, color: Colors.muted },
  actions:          { flexDirection: 'row', gap: 12, marginBottom: 16 },
  importingBtn:     { backgroundColor: Colors.blue, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  importingText:    { color: '#fff', fontWeight: '800', fontSize: 15 },
  doneCard:         { backgroundColor: Colors.card, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, padding: 34, alignItems: 'center' },
  doneIcon:         { fontSize: 52, marginBottom: 16 },
  doneTitle:        { fontSize: 22, fontWeight: '900', color: Colors.white, marginBottom: 8 },
  doneSub:          { fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 20 },
});