import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react-native';
import { authService } from '../services/api';
import { guestCartUtils } from '../utils/cartUtils';

const SignUpNative: React.FC<{ navigate?: (name: string, params?: any) => void; goBack?: () => void }> = ({ navigate, goBack }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  // responsive multiplier based on a 375pt design width, clamped for extremes
  const rem = Math.max(0.8, Math.min(width / 375, 1.25));
  const titleFontSize = Math.round(44 * rem);
  const inputPadding = Math.round(12 * rem);
  const inputFontSize = Math.round(14 * rem);
  const buttonPadding = Math.round(14 * rem);
  const buttonFontSize = Math.round(16 * rem);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async () => {
    setError('');
    setSuccess('');

    // Validate required name fields
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    // Validate phone contains exactly 10 digits
    if (!/^[0-9]{10}$/.test(phone)) {
      setError(t('signUp.phoneValidation'));
      return;
    }

    setLoading(true);
    try {
      const payload: any = { firstName: firstName.trim(), lastName: lastName.trim(), email, phone, password, role: 'customer' };

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
          // Optionally store password so profile settings can show it during development (not recommended for production).
          try { await AsyncStorage.setItem('userPassword', password); } catch (e) {}

          if ((globalThis as any)?.dispatchEvent) {
            try {
              const CE = (globalThis as any).CustomEvent;
              if (CE) {
                (globalThis as any).dispatchEvent(new CE('loginSuccess', { detail: { token, user } }));
              } else {
                (globalThis as any).dispatchEvent({ type: 'loginSuccess', detail: { token, user } });
              }
            } catch (e) { /* ignore dispatch errors */ }
          }

          setSuccess(t('signUp.accountCreatedAndSignedIn'));
          navigate?.('Home');
          return;
        }
      } catch (loginErr) {
        setSuccess(t('signUp.accountCreated'));
        navigate?.('SignIn');
        return;
      }

    } catch (err: any) {
      setError(err.message || t('signUp.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={['top', 'left', 'right']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      {/* Leaves background */}
      <Image source={require('../../assets/bg-home.png')} style={styles.leafTop} />
      <Image source={require('../../assets/bg-home.png')} style={styles.leafBottom} />

      {/* Top bar with Skip */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigate?.('Hello')}>
          <Text style={styles.skipText}>Skips</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.formWrap, (passwordFocused || phoneFocused) && styles.formWrapShifted]}>
        <Text style={[styles.titleBig, { fontSize: titleFontSize, lineHeight: Math.round(titleFontSize * 1.05) }]}>Create{`\n`}Account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <TextInput style={[styles.pillInput, { paddingVertical: inputPadding, fontSize: inputFontSize }]} placeholder={t('signUp.firstName')} placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
        <TextInput style={[styles.pillInput, { paddingVertical: inputPadding, fontSize: inputFontSize }]} placeholder={t('signUp.lastName')} placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
        <TextInput style={[styles.pillInput, { paddingVertical: inputPadding, fontSize: inputFontSize }]} placeholder={t('signUp.email') || "Email"} placeholderTextColor="#9CA3AF" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        

        <View style={styles.passwordWrapper}>
          <TextInput
            style={[styles.pillInput, styles.passwordInput, { paddingVertical: inputPadding, fontSize: inputFontSize }]}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
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
        <View style={[styles.pillInput, styles.phoneRow, { paddingVertical: inputPadding }] }>
          <Text style={[styles.flag, { fontSize: inputFontSize }]}>🇮🇳</Text>
          <Text style={[styles.phoneDivider, { fontSize: inputFontSize }]}>|</Text>
          <TextInput style={[styles.phoneInput, { fontSize: inputFontSize }]} placeholder="Your number" placeholderTextColor="#9CA3AF" value={phone} onChangeText={(t) => setPhone(t.replace(/\D/g, ''))} keyboardType="number-pad" maxLength={10} onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)} />
        </View>

        <TouchableOpacity style={[styles.doneButton, { paddingVertical: buttonPadding }, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.doneText, { fontSize: buttonFontSize }]}>Done</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelRow} onPress={() => navigate?.('SignIn')}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  leafTop: { position: 'absolute', top: -200, left: -170, width: 400, height: 400, opacity: 0.35, transform: [{ rotate: '-120deg' }] },
  leafBottom: { position: 'absolute', bottom: -260, right: -150, width: 520, height: 480, opacity: 0.35, transform: [{ rotate: '85deg' }] },
  topBar: { position: 'absolute', top: 18, right: 18 },
  skipText: { color: '#000000' ,marginTop:15, marginRight:10},
  formWrap: { width: '92%', maxWidth: 520, paddingHorizontal: 20, paddingVertical: 12, alignItems: 'stretch' },
  formWrapShifted: { marginTop: 10 },
  titleBig: { fontSize: 44, fontWeight: '400', textAlign: 'left', marginBottom: 20, color: '#111827' },
  pillInput: { backgroundColor: '#F3F4F6', borderRadius: 28, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 12, color: '#000' },
  phoneRow: { flexDirection: 'row', alignItems: 'center' },
  flag: { marginRight: 8, fontSize: 18 },
  phoneDivider: { marginRight: 8, color: '#9CA3AF' },
  phoneInput: { flex: 1, color: '#000' },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeButton: { position: 'absolute', right: 12, top: 12 },
  doneButton: { backgroundColor: '#E84F30', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginTop: 6 },
  doneText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelRow: { alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#6B7280' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  error: { color: '#ef4444', marginBottom: 8, textAlign: 'center' },
  success: { color: '#10b981', marginBottom: 8, textAlign: 'center' }
});

export default SignUpNative;