import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const VendorShopSectionNative: React.FC<{ vendorId?: string | null; vendorName?: string; navigate?: (name: string, params?: any) => void; goBack?: () => void }> = ({ vendorId, vendorName, navigate, goBack }) => {
  return (
    <View style={styles.container}>
      <View style={styles.message}>
        <Text style={styles.heading}>{vendorName || 'Vendor'}</Text>
        <Text style={styles.subtitle}>This vendor products view has been removed.</Text>
        <TouchableOpacity onPress={() => goBack?.()} style={styles.backBtn}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  message: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#6B7280', marginBottom: 16, textAlign: 'center' },
  backBtn: { backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  backText: { color: '#fff', fontWeight: '700' }
});

export default VendorShopSectionNative;
