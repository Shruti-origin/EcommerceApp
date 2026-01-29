import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Home, List, Video, ShoppingCart, User } from 'lucide-react-native';

export type TabKey = 'Home' | 'Categories' | 'Video' | 'Account' | 'Cart' | 'Search' | 'Setting' | 'Profile' | 'Deals';

type Tab = { key: TabKey; Icon: React.ComponentType<any> };

const TABS: Tab[] = [
  { key: 'Home', Icon: Home },
  { key: 'Categories', Icon: List },
  { key: 'Video', Icon: Video },
  { key: 'Account', Icon: User },
  { key: 'Cart', Icon: ShoppingCart },
];

interface BottomNavProps {
  initial?: TabKey;
  active?: TabKey;
  onChange?: (key: TabKey) => void;
}

export default function BottomNav({ initial = 'Home', active: controlledActive, onChange }: BottomNavProps) {
  const [internalActive, setInternalActive] = useState<TabKey>(initial);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const active = controlledActive ?? internalActive;

  const getTabLabel = (key: TabKey): string => {
    const labelMap: Record<TabKey, string> = {
      'Home': t('bottomNav.home'),
      'Categories': t('bottomNav.categories'),
      'Video': t('bottomNav.video'),
      'Account': t('bottomNav.account'),
      'Cart': t('bottomNav.cart'),
      'Search': t('bottomNav.home'),
      'Setting': t('bottomNav.account'),
      'Profile': t('bottomNav.account'),
      'Deals': t('bottomNav.home'),
    };
    return labelMap[key] || key;
  };

  const handlePress = (key: TabKey) => {
    if (onChange) {
      onChange(key);
      // also update internal state so the tab visually responds immediately
      setInternalActive(key);
      return;
    }
    setInternalActive(key);
  };

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: Math.max(insets.bottom, 12), height: 72 + Math.max(insets.bottom, 12)},
      ]}> 
      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            style={styles.tab}
            onPress={() => handlePress(tab.key)}>
            {React.createElement(tab.Icon, { color: isActive ? '#111' : '#666', size: 21 })}
            <Text style={[styles.label, isActive && styles.labelActive]}>{getTabLabel(tab.key)}</Text>
          </TouchableOpacity>
        );
      })} 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 10,
    paddingBottom: 12,
  },
  label: {
    marginTop: 6,
    fontSize: 13,
    color: '#666',
  },
  labelActive: {
    color: '#111',
    fontWeight: '700' as any,
  },
});