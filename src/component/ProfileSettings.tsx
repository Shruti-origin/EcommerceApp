import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSettings({ goBack, navigate }: { goBack?: () => void; navigate?: (name: string, params?: any) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await AsyncStorage.getItem('user');
        if (u) {
          const user = JSON.parse(u);
          const fullName = (user.firstName || user.first_name || user.name || '') + (user.lastName || user.last_name ? ` ${user.lastName || user.last_name}` : '');
          setName(fullName.trim() || '');
          setEmail(user.email || '');
        }
        // Try to load a stored password (if the app stored one)
        const pw = await AsyncStorage.getItem('userPassword');
        if (pw) setPassword(pw);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update stored user object (only name and email) so other parts of the app see updates
      const uRaw = await AsyncStorage.getItem('user');
      const user = uRaw ? JSON.parse(uRaw) : {};
      // Split name into first/last for storage if possible
      const parts = (name || '').trim().split(/\s+/);
      if (parts.length > 1) {
        user.firstName = parts.slice(0, -1).join(' ');
        user.lastName = parts.slice(-1).join(' ');
      } else {
        user.firstName = name;
      }
      user.email = email;

      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Passwords are sensitive. We store it only temporarily if user entered it (optional and not recommended for production).
      if (password) {
        await AsyncStorage.setItem('userPassword', password);
      }

      // Dispatch an event so other components (Header, Profile) can refresh
      if ((globalThis as any)?.dispatchEvent) {
        try {
          const CE = (globalThis as any).CustomEvent;
          if (CE) (globalThis as any).dispatchEvent(new CE('loginSuccess', { detail: { user } }));
        } catch (e) {}
      }

      Alert.alert('Saved', 'Profile information updated');
      if (goBack) goBack();
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => goBack?.()} activeOpacity={0.7}>
          <ChevronLeft size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.sub}>Your Profile</Text>

      <View style={styles.form}>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Name" />
        <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="Email" keyboardType="email-address" />
        <View style={styles.passwordContainer}>
          <TextInput 
            value={password} 
            onChangeText={setPassword} 
            style={[styles.input, styles.passwordInput]} 
            placeholder="Password" 
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeButton} 
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={20} color="#6b7280" />
            ) : (
              <Eye size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSave}>
        <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { padding: 6, marginRight: 8 },
  headerTitle: { fontSize: 16, color: '#111', fontWeight: '600' },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#6b7280', marginBottom: 16 },
  form: { marginTop: 8 },
  input: {
    backgroundColor: '#FEECEE',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 15,
    color: '#111',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
  },
  saveBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    marginHorizontal: 10,
  },
  saveText: { color: '#fff', fontWeight: '600' },
});