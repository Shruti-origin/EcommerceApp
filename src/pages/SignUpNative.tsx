import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import { guestCartUtils } from '../utils/cartUtils';

const SignUpNative = ({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async () => {
    setError('');
    setSuccess('');

    // Validate phone contains exactly 10 digits
    if (!/^[0-9]{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email,
        phone,
        password,
        role: 'customer'
      };

      const res = await authService.register(payload);

      // Try auto-login
      try {
        const loginRes = await authService.login(email, password);
        const token = loginRes.token || loginRes.accessToken || loginRes.access_token;
        const user = loginRes.user || loginRes;

        if (token && user) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('authToken', token);
          await AsyncStorage.setItem('user', JSON.stringify(user));

          try { await guestCartUtils?.syncWithUserAccount?.(token); } catch (e) { console.warn('Cart sync failed', e); }
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

          setSuccess('Account created and signed in');
          navigate?.('Home');
          return;
        }
      } catch (loginErr) {
        setSuccess('Account created successfully. Please sign in.');
        navigate?.('SignIn');
        return;
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TextInput style={styles.input} placeholder="First name" value={firstName} onChangeText={setFirstName} />
        <TextInput style={styles.input} placeholder="Last name" value={lastName} onChangeText={setLastName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone (10 digits)" value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={10} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
        </TouchableOpacity>

        <View style={styles.row}>
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigate?.('SignIn')}>
            <Text style={styles.link}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  card: { width: '92%', maxWidth: 700, backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 6 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  button: { backgroundColor: '#e0555a', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  link: { color: '#3b82f6', fontWeight: '700' },
  error: { color: '#ef4444', marginBottom: 8, textAlign: 'center' },
  success: { color: '#10b981', marginBottom: 8, textAlign: 'center' }
});

export default SignUpNative;