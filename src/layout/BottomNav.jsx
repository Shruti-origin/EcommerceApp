import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { Home, List, Video, Search, Settings } from 'lucide-react-native';

const TABS = [
  { key: 'Home', Icon: Home },
  { key: 'Categories', Icon: List },
  { key: 'Video', Icon: Video },
  { key: 'Search', Icon: Search },
  { key: 'Setting', Icon: Settings },
];

export default function BottomNav({ initial = 'Home', active: controlledActive, onChange }) {
  const [internalActive, setInternalActive] = useState(initial);
  const insets = useSafeAreaInsets();
  const active = controlledActive ?? internalActive;

  const handlePress = (key) => {
    if (onChange) return onChange(key);
    setInternalActive(key);
  };

  return (
    <View
      style={[
        styles.container,
        {paddingBottom: Math.max(insets.bottom, 8), height: 64 + Math.max(insets.bottom, 8)},
      ]}>
      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            style={styles.tab}
            onPress={() => handlePress(tab.key)}>
            {React.createElement(tab.Icon, { color: isActive ? '#111' : '#666', size: 22 })}
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.key}</Text>
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
    borderTopColor: '#E5E7EB',
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  labelActive: {
    color: '#111',
    fontWeight: Platform.OS === 'android' ? '700' : '600',
  },
});
