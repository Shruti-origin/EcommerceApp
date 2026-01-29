import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react-native';

const ForgetPassword: React.FC<{ navigate?: (name: string, params?: any) => void; goBack?: () => void }> = ({ navigate }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [secureNew, setSecureNew] = useState(true);
  const [secureRepeat, setSecureRepeat] = useState(true);
  const [loading, setLoading] = useState(false);

  function handleClean() {
    setNewPassword('');
    setRepeatPassword('');
  }

  async function handleSave() {
    if (!newPassword || !repeatPassword) return Alert.alert('Error', 'Please fill both fields');
    if (newPassword !== repeatPassword) return Alert.alert('Error', 'Passwords do not match');
    if (newPassword.length < 6) return Alert.alert('Error', 'Password should be at least 6 characters');

    setLoading(true);
    // Placeholder: keep backend unchanged. If you have an API endpoint to set password, call it here.
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Password has been updated');
      navigate?.('SignIn');
    }, 800);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../../assets/bg-home.png')} style={styles.leafTop} />
      <Image source={require('../../assets/bg-home.png')} style={styles.leafBottom} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigate?.('Hello')}>
          <Text style={styles.skipText}>Skips</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formWrap}>
        <Text style={styles.titleBig}>Setup New Password</Text>
        <Text style={styles.subtitle}>Please, setup a new password for your account</Text>

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.pillInput, styles.passwordInput]}
            placeholder="New Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secureNew}
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
            importantForAutofill="no"
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setSecureNew(s => !s)}>
            {secureNew ? <Eye size={18} color="#64748B" /> : <EyeOff size={18} color="#64748B" />}
          </TouchableOpacity>
        </View>

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.pillInput, styles.passwordInput]}
            placeholder="Repeat Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secureRepeat}
            value={repeatPassword}
            onChangeText={setRepeatPassword}
            autoCapitalize="none"
            importantForAutofill="no"
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setSecureRepeat(s => !s)}>
            {secureRepeat ? <Eye size={18} color="#64748B" /> : <EyeOff size={18} color="#64748B" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.saveButton, (loading || !newPassword || !repeatPassword || newPassword !== repeatPassword) && styles.buttonDisabled]} onPress={handleSave} disabled={loading || !newPassword || !repeatPassword || newPassword !== repeatPassword}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cleanRow} onPress={handleClean}>
          <Text style={styles.cleanText}>Clean</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  leafTop: { position: 'absolute', top: -200, left: -170, width: 400, height: 400, opacity: 0.35, transform: [{ rotate: '-120deg' }] },
  leafBottom: { position: 'absolute', bottom: -180, right: -170, width: 400, height: 400, opacity: 0.35, transform: [{ rotate: '65deg' }] },
  topBar: { position: 'absolute', top: 18, right: 18 },
  skipText: { color: '#000000' ,marginTop:15, marginRight:10},
  formWrap: { width: '92%', maxWidth: 520, paddingHorizontal: 18, paddingTop: 30, alignItems: 'stretch' },
  titleBig: { fontSize: 28, fontWeight: '700', textAlign: 'left', marginBottom: 6, color: '#111827' },
  subtitle: { color: '#6B7280', marginBottom: 18, lineHeight: 18 },
  pillInput: { backgroundColor: '#F3F4F6', borderRadius: 28, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, color: '#000' },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: 'absolute', right: 12, top: 12 },
  saveButton: { backgroundColor: '#E84F30', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginTop: 6 },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  buttonDisabled: { backgroundColor: '#E84F30' },
  cleanRow: { alignItems: 'center', marginTop: 12 },
  cleanText: { color: '#6B7280' },
});

export default ForgetPassword;
