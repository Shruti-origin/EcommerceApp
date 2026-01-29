import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react-native';
import { authService } from '../services/api';
import { guestCartUtils } from '../utils/cartUtils';

const SignInNative = ({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) => {
  const { t } = useTranslation();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    if (!emailOrPhone || !password) return setError(t('signIn.enterBothFields'));
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
      // Optionally store password so profile settings can show it during development (not recommended for production).
      try { await AsyncStorage.setItem('userPassword', password); } catch (e) {}

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

      Alert.alert(t('common.success'), t('signIn.success'));
      navigate?.('Home');
    } catch (err: any) {
      console.error('SignIn failed', err);
      setError(err.message || t('signIn.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative leaves */}
      <Image source={require('../../assets/bg-home.png')} style={styles.leafTop} />
      <Image source={require('../../assets/bg-home.png')} style={styles.leafBottom} />

      {/* Skip top-right */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigate?.('Hello')}>
          <Text style={styles.skipText}>Skips</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formWrap}>
        <Text style={styles.titleBig}>Login</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.pillInput}
          placeholder={t('signIn.emailOrPhone')}
          placeholderTextColor="#9CA3AF"
          value={emailOrPhone}
          onChangeText={setEmailOrPhone}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.pillInput, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
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

        <TouchableOpacity style={[styles.doneButton, loading && styles.buttonDisabled]} onPress={handleSignIn} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.doneText}>Next</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.forgetRow} onPress={() => navigate?.('ForgetPassword')}>
          <Text style={styles.forgetText}>Forget Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  leafTop: { position: 'absolute', top: -200, left: -170, width: 400, height: 400, opacity: 0.35, transform: [{ rotate: '-120deg' }] },
  leafBottom: { position: 'absolute', bottom: -200, right: -130, width: 480, height: 480, opacity: 0.35, transform: [{ rotate: '85deg' }] },
  topBar: { position: 'absolute', top: 18, right: 18 },
  skipText: { color: '#000000' ,marginTop:15, marginRight:10},
  formWrap: { width: '92%', maxWidth: 520, paddingHorizontal: 18, paddingTop: 30, alignItems: 'stretch' },
  titleBig: { fontSize: 44, fontWeight: '700', textAlign: 'left', marginBottom: 20, color: '#111827' },
  pillInput: { backgroundColor: '#F3F4F6', borderRadius: 28, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, color: '#000' },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: 'absolute', right: 12, top: 12 },
  doneButton: { backgroundColor: '#E84F30', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginTop: 6 },
  doneText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  forgetRow: { alignItems: 'center', marginTop: 14 },
  forgetText: { color: '#6B7280' },
  error: { color: '#ef4444', marginBottom: 8, textAlign: 'center' },
});

export default SignInNative;
