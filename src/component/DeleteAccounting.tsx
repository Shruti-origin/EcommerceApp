import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react-native';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

export default function DeleteAccounting({ visible, onCancel, onDelete }: Props) {
  const { t } = useTranslation();
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.overlayPressable} onPress={onCancel} />
        <View style={styles.dialog}>
          <View style={styles.iconCircle}>
            <AlertCircle size={28} color="#E26B68" />
          </View>

          <Text style={styles.title}>{t('deleteAccount.title')}</Text>
          <Text style={styles.message}>{t('deleteAccount.message')}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>{t('deleteAccount.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
              <Text style={styles.deleteText}>{t('deleteAccount.delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 100)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  overlayPressable: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dialog: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 24, 
    width: '90%', 
    maxWidth: 340, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111', 
    textAlign: 'center', 
    marginBottom: 8,
    lineHeight: 24,
  },
  message: { 
    fontSize: 14, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 24,
  },
  buttonRow: { 
    flexDirection: 'row', 
    width: '100%', 
    gap: 12,
  },
  cancelBtn: { 
    flex: 1, 
    backgroundColor: '#1F2937', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center',
  },
  cancelText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 15,
  },
  deleteBtn: { 
    flex: 1, 
    backgroundColor: '#E26B68', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center',
  },
  deleteText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 15,
  },
});
