import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff } from 'lucide-react-native';
import { authService } from '../services/api';
import { guestCartUtils } from '../utils/cartUtils';

const SignInNative = ({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    if (!emailOrPhone || !password) return setError('Please enter both fields');
    setLoading(true);

    try {
      const isEmail = emailOrPhone.includes('@');
      const credentials: any = {
        password,
      };
      if (isEmail) credentials.email = emailOrPhone;
      else credentials.phone = emailOrPhone;

      const res = await authService.login(credentials.email || credentials.phone, credentials.password);
      // authService.login returns response from apiClient which may contain token and user
      const token = res.token || res.accessToken || res.access_token;
      const user = res.user || res;

      if (!token || !user) throw new Error('Invalid login response');

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Optionally sync guest cart to user cart
      try {
        await guestCartUtils?.syncWithUserAccount?.(token);
      } catch (e) {
        console.warn('Cart sync failed after login', e);
      }

      // Dispatch event for other parts of the app (if available)
      if ((globalThis as any)?.dispatchEvent) {
        try {
          const CE = (globalThis as any).CustomEvent;
          if (CE) {
            (globalThis as any).dispatchEvent(new CE('loginSuccess', { detail: { token, user } }));
          } else {
            (globalThis as any).dispatchEvent({ type: 'loginSuccess', detail: { token, user } });
          }
        } catch (e) {}
      }

      Alert.alert('Success', 'Signed in successfully');
      navigate?.('Home');
    } catch (err: any) {
      console.error('SignIn failed', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email or phone"
          placeholderTextColor="#000"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#000"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="password"
            importantForAutofill="yes"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setSecure(s => !s)}
            activeOpacity={0.7}
            accessibilityLabel={secure ? 'Show password' : 'Hide password'}
          >
            {secure ? <Eye size={18} color="#64748B" /> : <EyeOff size={18} color="#64748B" />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue</Text>}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text>New here?</Text>
          <TouchableOpacity onPress={() => navigate?.('SignUp')}>
            <Text style={styles.link}> Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  card: { width: '92%', maxWidth: 520, backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 6 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, color: '#000' },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 40 },
  eyeButton: { position: 'absolute', right: 10, top: 12 },
  button: { backgroundColor: '#e0555a', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  link: { color: '#3b82f6', fontWeight: '700' },
  error: { color: '#ef4444', marginBottom: 8, textAlign: 'center' },
});

export default SignInNative;
