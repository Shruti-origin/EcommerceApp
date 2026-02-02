import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ActivityIndicator, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight } from 'lucide-react-native';

export default function Otp({ navigation, route }: any) {
  // accept navigation and route via props to avoid requiring @react-navigation/native types
  const name = route?.params?.name || 'Rama'; // fallback to Rama like the mock

  // OTP & verification state (6-digit OTP)
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputs = [
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
  ];
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendCounter, setResendCounter] = useState(30);

  // Extract confirmation and payload from route params
  const confirmation: any = route?.params?.confirmation;
  const payload: any = route?.params?.payload;
  const phoneParam: string = route?.params?.phone || '';
  const useMockOtp: boolean = route?.params?.useMockOtp || false;

  // Start resend countdown
  React.useEffect(() => {
    setResendCounter(30);
    const timer = setInterval(() => {
      setResendCounter((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (cleaned && index < inputs.length - 1) {
      inputs[index + 1].current?.focus();
    }

    // If user clears, move back
    if (!cleaned && index > 0) {
      inputs[index - 1].current?.focus();
    }

    // If all digits filled, submit automatically
    const allFilled = next.every((d) => d !== '');
    if (allFilled) {
      submitOtp(next.join(''));
    }
  };

  const submitOtp = async (code: string) => {
    setError('');
    setVerifying(true);
    try {
      // Development mock mode: skip Firebase verification
      if (useMockOtp) {
        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
          setError('Please enter a valid 6-digit OTP');
          setVerifying(false);
          return;
        }
        console.log('✅ Mock OTP accepted (dev mode):', code);
        // Skip to backend registration directly
      } else {
        // Real Firebase verification
        let firebaseUser: any = null;
        if (confirmation && typeof confirmation.confirm === 'function') {
          firebaseUser = await confirmation.confirm(code);
        } else {
        // Fallback: try using PhoneAuthProvider credential (support modular and legacy shapes)
        const _authModuleName = '@react-native-firebase/auth';
        let authPkg: any = null;
        try {
          authPkg = require(_authModuleName);
        } catch (e) {
          authPkg = null;
        }
        const verificationId = route?.params?.verificationId;
        if (!authPkg) throw new Error('Firebase auth module not available. Please install @react-native-firebase/auth to use this verification flow.');
        if (!verificationId) throw new Error('No verification data available. Please resend OTP.');

        const createCredential = (verificationId: string, code: string) => {
          // Prefer top-level PhoneAuthProvider (modular), else legacy under default
          if (authPkg.PhoneAuthProvider && typeof authPkg.PhoneAuthProvider.credential === 'function') {
            return authPkg.PhoneAuthProvider.credential(verificationId, code);
          }
          const authDefault = (typeof authPkg.default === 'function') ? authPkg.default() : authPkg.default || authPkg;
          if (authDefault && authDefault.PhoneAuthProvider && typeof authDefault.PhoneAuthProvider.credential === 'function') {
            return authDefault.PhoneAuthProvider.credential(verificationId, code);
          }
          throw new Error('PhoneAuthProvider not available in this auth module.');
        };

        const signInWithCredential = async (credential: any) => {
          // Try top-level helper first
          if (typeof authPkg.signInWithCredential === 'function') {
            try { return await authPkg.signInWithCredential(credential); } catch (e) {
              // maybe accepts (authInstance, credential)
              try {
                const authInstance = typeof authPkg.getAuth === 'function' ? authPkg.getAuth() : (typeof authPkg.default === 'function' ? authPkg.default() : null);
                if (authInstance) return await authPkg.signInWithCredential(authInstance, credential);
              } catch (e2) { /* fall through */ }
            }
          }
          // Legacy instance method
          const authInstanceLegacy = (typeof authPkg.default === 'function') ? authPkg.default() : authPkg.default || authPkg;
          if (authInstanceLegacy && typeof authInstanceLegacy.signInWithCredential === 'function') {
            return await authInstanceLegacy.signInWithCredential(credential);
          }
          throw new Error('Unsupported signInWithCredential API.');
        };

        const credential = createCredential(verificationId, code);
        const res = await signInWithCredential(credential);
        firebaseUser = res;
        }

        console.log('✅ OTP verified in Firebase', firebaseUser);
      }

      // Now create account in backend using the payload passed from signup screen
      if (payload) {
        try {
          const registerResp = await (await import('../services/api')).authService.register(payload);
          console.log('✅ Backend registration success', registerResp);

          // Try to login and persist token like before
          try {
            const loginRes = await (await import('../services/api')).authService.login(payload.email, payload.password);
            const token = loginRes.token || loginRes.accessToken || loginRes.access_token;
            const user = loginRes.user || loginRes;

            if (token && user) {
              await AsyncStorage.setItem('token', token);
              await AsyncStorage.setItem('authToken', token);
              await AsyncStorage.setItem('user', JSON.stringify(user));
              try { await AsyncStorage.setItem('userPassword', payload.password); } catch (e) {}

              if ((globalThis as any)?.dispatchEvent) {
                try {
                  const CE = (globalThis as any).CustomEvent;
                  if (CE) {
                    (globalThis as any).dispatchEvent(new CE('loginSuccess', { detail: { token, user } }));
                  } else {
                    (globalThis as any).dispatchEvent({ type: 'loginSuccess', detail: { token, user } });
                  }
                } catch (e) { /* ignore */ }
              }

              navigation?.navigate?.('Home');
              return;
            }
          } catch (loginErr) {
            console.warn('Registered but auto-login failed', loginErr);
            navigation?.navigate?.('SignIn');
            return;
          }
        } catch (regErr: any) {
          console.error('Backend registration failed after OTP', regErr);
          setError(regErr?.message || 'Registration failed. Please try again later.');
        }
      } else {
        // No payload — just navigate home or do what fits your flow
        navigation?.navigate?.('Home');
      }
    } catch (err: any) {
      console.warn('OTP verification failed', err);
      const msg = err?.message || 'OTP verification failed. Please try again.';
      // Map some common firebase errors
      if (err?.code === 'auth/invalid-verification-code' || err?.code === 'auth/invalid-code') setError('Invalid OTP. Please try again.');
      else if (err?.code === 'auth/code-expired') setError('OTP expired. Please resend.');
      else setError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    setError('');
    try {
      setResendCounter(30);
      
      if (useMockOtp) {
        // Mock mode: just reset timer
        console.log('ℹ️ Mock OTP mode: timer reset (any 6-digit code works)');
        return;
      }

      const _authModuleName = '@react-native-firebase/auth';
      let authLib: any = null;
      try {
        authLib = require(_authModuleName)?.default;
      } catch (e) {
        authLib = null;
      }
      if (!authLib) throw new Error('Firebase auth module not available. Install and configure @react-native-firebase/auth');
      const newConfirm = await authLib().signInWithPhoneNumber(phoneParam);
      // Replace confirmation object in route params so submit uses the new one.
      // Note: navigation params are mutable via navigation.setParams
      navigation?.setParams?.({ confirmation: newConfirm });
      console.log('OTP resent', newConfirm);
    } catch (e: any) {
      console.warn('Failed to resend OTP', e);
      setError(e?.message || 'Failed to resend OTP');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.skip} onPress={() => navigation.goBack?.()}> 
          <Text style={styles.skipText}>Skips</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.hello}>Hello, <Text style={styles.name}>{name}</Text></Text>
        </View>

        <Text style={styles.subtitle}>Enter OTP</Text>

        {/* Show phone being verified */}
        <Text style={styles.phoneText}>OTP sent to {phoneParam}</Text>
        {route?.params?.billingFallback && (
          <View style={styles.billingBox}>
            <Text style={styles.billingText}>{route?.params?.billingMessage || 'SMS sending is disabled for this Firebase project. Using mock OTP mode.'}</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://firebase.google.com/docs/auth/android/phone-auth')}>
              <Text style={styles.billingLink}>Open Firebase Phone Auth docs</Text>
            </TouchableOpacity>
          </View>
        )}
        {useMockOtp && <Text style={styles.devModeText}>🔧 Dev Mode: Any 6-digit code works</Text>}

        <View style={styles.otpRow}>
          {digits.map((d, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputs[i].current = ref; }}
              value={d}
              onChangeText={(val) => onChange(i, val)}
              keyboardType="numeric"
              maxLength={1}
              style={styles.otpBox}
              textContentType="oneTimeCode"
              autoFocus={i === 0}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={[styles.verifyButton, verifying && styles.buttonDisabled]} onPress={() => submitOtp(digits.join(''))} disabled={verifying}>
          {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyText}>Verify</Text>}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {resendCounter > 0 ? (
            <Text style={styles.smallText}>Resend in {resendCounter}s</Text>
          ) : (
            <TouchableOpacity onPress={resendOtp}>
              <Text style={[styles.smallText, { color: '#E26B68' }]}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.smallText}>Not you?</Text>
          <TouchableOpacity style={styles.arrowBtn} onPress={() => navigation.navigate('SignIn')}>
            <ChevronRight color="#fff" size={18} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
  },
  skip: {
    position: 'absolute',
    right: 20,
    top: 36,
  },
  skipText: {
    color: '#111',
    fontSize: 14,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  hello: {
    fontSize: 42,
    fontWeight: '300',
    color: '#111',
  },
  name: {
    color: '#E26B68',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 18,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  otpBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    textAlign: 'center',
    fontSize: 24,
    color: '#111',
    borderWidth: 0,
    marginHorizontal: 6,
  },
  phoneText: { color: '#6B7280', marginBottom: 12 },
  devModeText: { color: '#F59E0B', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  billingBox: { backgroundColor: '#fff7ed', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#fde3cf', marginBottom: 8, alignItems: 'center' },
  billingText: { color: '#92400e', fontSize: 13, textAlign: 'center', marginBottom: 6 },
  billingLink: { color: '#1e40af', fontWeight: '700' },
  verifyButton: { backgroundColor: '#E26B68', paddingVertical: 12, paddingHorizontal: 36, borderRadius: 30, alignItems: 'center', marginTop: 8 },
  verifyText: { color: '#fff', fontWeight: '700' },
  resendRow: { marginTop: 10, alignItems: 'center' },
  errorText: { color: '#ef4444', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  footerRow: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  smallText: {
    color: '#6B7280',
    marginRight: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
