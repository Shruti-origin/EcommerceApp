import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PaymentMethodCard from './PaymentMethodCard';
import AddCardModal from './AddCardModal';

export default function PaymentMethod({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [addVisible, setAddVisible] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => goBack?.()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('paymentMethod.settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{t('paymentMethod.paymentMethod')}</Text>

        <View style={styles.cardWrap}>
          <PaymentMethodCard
            cardNumber="**** **** **** 3456"
            name="RAMA JAIN"
            expiry="12/26"
            onAdd={() => setAddVisible(true)}
            onSave={() => Alert.alert(t('paymentMethod.saved'), t('paymentMethod.paymentMethodSaved'))}
          />
        </View>

        <AddCardModal visible={addVisible} onClose={() => setAddVisible(false)} onSave={() => { setAddVisible(false); Alert.alert(t('paymentMethod.saved'), t('paymentMethod.cardAdded')); }} />

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.save} onPress={() => Alert.alert(t('paymentMethod.saved'), t('paymentMethod.paymentMethodSaved'))} activeOpacity={0.8}>
          <Text style={styles.saveText}>{t('paymentMethod.saveChanges')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, marginBottom: 8 },
  backBtn: { marginRight: 8, padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '400' },
  content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  cardWrap: { marginTop: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 20, alignItems: 'center' },
  save: { backgroundColor: '#E26B68', paddingVertical: 14, borderRadius: 50, width: '86%', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
