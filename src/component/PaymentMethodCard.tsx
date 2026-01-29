import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Settings } from 'lucide-react-native';

type Props = {
  cardNumber?: string;
  name?: string;
  expiry?: string;
  onAdd?: () => void;
  onSave?: () => void;
  hideSave?: boolean;
};

export default function PaymentMethodCard({ cardNumber = '**** **** ****', name = 'RAMA JAIN', expiry = '12/22', onAdd, onSave, hideSave = false }: Props) {
  const last4 = '1579';
  const visaSource = { uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Visa_2014_logo_detail.svg' };

  return (
    <View style={styles.wrapper}>
      <View style={styles.cardRow}>
        <View style={styles.cardVisual}>
          {/* logos top-left */}
          <View style={styles.logoRow}>
            <Image source={require('../../assets/Mastercard.png')} style={styles.logo} />
            <Image source={visaSource} style={[styles.logo, { marginLeft: 8, width: 39, height: 24 }]} />
          </View>

          {/* settings gear top-right */}
          <View style={styles.settingsBtn}>
            <Settings size={16} color="#2563EB" />
          </View>

          {/* masked number and last4 on one row */}
          <View style={styles.cardNumberRow}>
            <Text style={styles.masked}>****  ****  ****</Text>
            <Text style={styles.last4}>{last4}</Text>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.expiry}>{expiry}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.8}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 19, marginBottom: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardVisual: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  logoRow: { position: 'absolute', top: 18, left: 12, flexDirection: 'row', alignItems: 'center', zIndex: 2 },
  logo: { width: 44, height: 24, resizeMode: 'contain' },
  settingsBtn: { position: 'absolute', top: 10, right: 12, width: 38, height: 38, borderRadius: 25, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EEF2FF', zIndex: 2 },
  cardNumberRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 50 },
  masked: { color: '#0F172A', opacity: 0.65, letterSpacing: 6, fontSize: 14, fontWeight: '700' },
  last4: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, alignItems: 'center' },
  name: { color: '#334155', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  expiry: { color: '#334155', fontSize: 12 },
  addBtn: { width: 56, height: 152, backgroundColor: '#1366FF', borderRadius: 14, marginLeft: 12, alignItems: 'center', justifyContent: 'center' },
  plus: { color: '#fff', fontSize: 40, lineHeight: 44, fontWeight: '700' },
  saveBtn: { marginTop: 18, backgroundColor: '#E26B68', paddingVertical: 14, borderRadius: 50, alignItems: 'center', width: '86%', alignSelf: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});