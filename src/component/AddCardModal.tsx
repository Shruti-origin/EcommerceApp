import React, { useState } from 'react';
import { Modal, View, Text, Pressable, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (data?: any) => void;
};

export default function AddCardModal({ visible, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [valid, setValid] = useState('');
  const [cvv, setCvv] = useState('');

  function handleSave() {
    // basic close + callback — integrate real save logic as needed
    onSave?.({ name, number, valid, cvv });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayPressable} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom || 20 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('paymentMethod.addCard')}</Text>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.fieldRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('paymentMethod.cardHolder')}</Text>
              <TextInput value={name} onChangeText={setName} placeholder="Rama Jain" placeholderTextColor="#000000" style={styles.input} />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <Text style={styles.label}>{t('paymentMethod.cardNumber')}</Text>
            <TextInput value={number} onChangeText={setNumber} placeholder="**** **** **** 1579" placeholderTextColor="#000000" style={styles.input} keyboardType="numeric" />
          </View>

          <View style={[styles.row, { marginTop: 12 }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>{t('paymentMethod.valid')}</Text>
              <TextInput value={valid} onChangeText={setValid} placeholder="12 / 22" placeholderTextColor="#000000" style={styles.input} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t('paymentMethod.cvv')}</Text>
              <TextInput value={cvv} onChangeText={setCvv} placeholder="109" placeholderTextColor="#000000" style={styles.input} keyboardType="numeric" secureTextEntry />
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveText}>{t('paymentMethod.saveChanges')}</Text>
          </TouchableOpacity>
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  overlayPressable: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%', paddingTop: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  closeBtn: { padding: 6 },
  closeText: { fontSize: 20, color: '#6B7280' },
  body: { paddingHorizontal: 20, paddingBottom: 20 },
  label: { fontSize: 12, color: '#000000', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  row: { flexDirection: 'row' },
  fieldRow: { flexDirection: 'row' },
  saveBtn: { marginTop: 18, backgroundColor: '#E26B68', paddingVertical: 14, borderRadius: 50, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '700' },
});
