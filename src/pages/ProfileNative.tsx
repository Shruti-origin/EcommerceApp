import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Edit,
  ChevronRight,
  CreditCard,
  Lock,
  Clock,
  Activity,
  Heart,
  Bell,
  HelpCircle,
  Info,
  LogOut,
  Star,
  Share2,
} from 'lucide-react-native';

// Profile screen with dark & light mode support
export default function ProfileNative({ navigate, goBack }: { navigate?: (name: string, params?: any) => void; goBack?: () => void }) {
  // Use system color scheme as default, and allow toggling using state
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  // Safe area insets for proper padding on devices with notches
  const insets = useSafeAreaInsets();

  // Color palette that changes based on current theme
  const colors = {
    background: theme === 'dark' ? '#0F172A' : '#FFFFFF',
    card: theme === 'dark' ? '#0B1220' : '#F8FAFC',
    text: theme === 'dark' ? '#E6EEF8' : '#0F172A',
    subText: theme === 'dark' ? '#9FB0C8' : '#6B7280',
    border: theme === 'dark' ? '#142434' : '#E5E7EB',
    icon: theme === 'dark' ? '#9FB0C8' : '#374151',
    danger: '#EF4444',
  };

  // Styles generated per-theme so colors update automatically
  const styles = getStyles(colors, insets.top, insets.bottom);

  // Dummy menu items for each section (no backend integration)
  // Each item can optionally include `subItems` – tapping will expand to show them
  const accountItems = [
    {
      key: 'personal',
      label: 'Personal Info',
      Icon: User,
      subItems: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' },
      ],
    },
    {
      key: 'security',
      label: 'Security',
      Icon: Lock,
      subItems: [
        { key: 'password', label: 'Change Password' },
        { key: '2fa', label: 'Two-factor Authentication' },
      ],
    },
    {
      key: 'payments',
      label: 'Payment Methods',
      Icon: CreditCard,
      subItems: [
        { key: 'cards', label: 'Saved Cards' },
        { key: 'add', label: 'Add Payment Method' },
      ],
    },
  ];

  const activityItems = [
    {
      key: 'orders',
      label: 'Orders',
      Icon: Clock,
      subItems: [
        { key: 'recent', label: 'Recent Orders' },
        { key: 'track', label: 'Track Order' },
      ],
    },
    { key: 'wishlist', label: 'Wishlist', Icon: Heart, subItems: [{ key: 'items', label: 'Saved Items' }] },
  ];

  const settingsItems = [
    // The first item is a switch to toggle dark mode
    { key: 'darkmode', label: 'Dark Mode', Icon: Activity, isSwitch: true },
    {
      key: 'notifications',
      label: 'Notifications',
      Icon: Bell,
      subItems: [
        { key: 'email_notif', label: 'Email' },
        { key: 'push_notif', label: 'Push' },
      ],
    },
  ];

  const supportItems = [
    {key: 'help', label: 'Help Center', Icon: HelpCircle},
    {key: 'contact', label: 'Contact Us', Icon: Info},
  ];

  const aboutItems = [
    {key: 'about', label: 'About App', Icon: Info},
    {key: 'version', label: 'Version 1.0.0', Icon: Info},
  ];

  // Local user state populated from AsyncStorage (set at sign in / sign up)
  const [user, setUser] = useState<{ name?: string; email?: string; address?: string } | null>(null);

  // Load user data from AsyncStorage on mount and update on login/logout events
  React.useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      try {
        const u = await AsyncStorage.getItem('user');
        if (mounted && u) setUser(JSON.parse(u));
      } catch (e) {
        console.warn('Failed to load user from storage', e);
      }
    };

    loadUser();

    const onLogin = (ev: any) => {
      const detail = (ev && ev.detail) || ev;
      const u = detail?.user;
      if (u) setUser(u);
    };

    const onLogout = () => setUser(null);

    try {
      (globalThis as any).addEventListener('loginSuccess', onLogin);
      (globalThis as any).addEventListener('logout', onLogout);
    } catch (e) {}

    return () => {
      mounted = false;
      try {
        (globalThis as any).removeEventListener('loginSuccess', onLogin);
        (globalThis as any).removeEventListener('logout', onLogout);
      } catch (e) {}
    };
  }, []);

  // Handler for menu taps (shows a small Alert as placeholder behavior)
  const handlePress = (label: string, value?: string) => {
    Alert.alert(label, value ? `${label}: ${value}` : `You tapped "${label}" (no backend attached)`);
  };

  // Logout confirmation
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          // Placeholder: replace this with real logout logic when available
          Alert.alert('Logged out', 'You have been logged out.');
        },
      },
    ]);
  };

  return (
    <View style={[styles.container]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Top profile header */}
        <View style={styles.topSection}>
          <Image
            source={{uri: 'https://i.pravatar.cc/150?img=12'}}
            style={styles.avatar}
            accessibilityLabel="Profile picture"
          />

          <View style={styles.profileInfo}>
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.email}>john.doe@example.com</Text>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.8}
              onPress={() => handlePress('Edit Profile')}>
              <Edit color={colors.icon} size={16} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>



        {/* My Payments */}
        <View style={[styles.listSection, {borderColor: colors.border, backgroundColor: colors.card}]}>
          <Text style={[styles.listTitle, {color: colors.text}]}>My Payments</Text>
          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Bank & UPI Details')}>
            <CreditCard color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Bank & UPI Details</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>
          <View style={[styles.separator, {backgroundColor: colors.border}]} />
          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Payment & Refund')}>
            <Info color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Payment & Refund</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>
        </View>

        {/* My Activity */}
        <View style={[styles.listSection, {borderColor: colors.border, backgroundColor: colors.card}]}> 
          <Text style={[styles.listTitle, {color: colors.text}]}>My Activity</Text>

          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Change Language')}>
            <Activity color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Change Language</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>

          <View style={[styles.separator, {backgroundColor: colors.border}]} />

          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Wishlisted Products')}>
            <Heart color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Wishlisted Products</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>

          <View style={[styles.separator, {backgroundColor: colors.border}]} />

          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Shared Products')}>
            <Share2 color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Shared Products</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>

          <View style={[styles.separator, {backgroundColor: colors.border}]} />

          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Followed Shops')}>
            <Activity color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Followed Shops</Text>
            <View style={styles.rowRightGroup}>
              <View style={styles.newBadge}><Text style={styles.newBadgeText}>New</Text></View>
              <ChevronRight color={colors.icon} size={18} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Others */}
        <View style={[styles.listSection, {borderColor: colors.border, backgroundColor: colors.card}]}> 
          <Text style={[styles.listTitle, {color: colors.text}]}>Others</Text>





          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Settings')}>
            <Activity color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Settings</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>

          <View style={[styles.separator, {backgroundColor: colors.border}]} />

          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Rate Meesho')}>
            <Star color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Rate TulsiBaug</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>

          <View style={[styles.separator, {backgroundColor: colors.border}]} />

          <TouchableOpacity style={styles.listRow} onPress={() => handlePress('Legal and Policies')}>
            <Info color={colors.icon} size={18} />
            <Text style={[styles.listText, {color: colors.text}]}>Legal and Policies</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>

          <View style={[styles.separator, {backgroundColor: colors.border}]} />

          <TouchableOpacity style={styles.listRow} onPress={handleLogout}>
            <LogOut color={colors.danger} size={18} />
            <Text style={[styles.listText, {color: colors.danger}]}>Logout</Text>
            <ChevronRight color={colors.icon} size={18} />
          </TouchableOpacity>
        </View>

        {/* Promo Footer */}
        <View style={styles.promoWrap}>
          <Image source={{uri: 'https://via.placeholder.com/800x200.png?text=Made+with+love+for+Bharat'}} style={styles.promoImage} resizeMode="cover" />
          <Text style={styles.versionText}>App Version: 26.5 (788)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Reusable Section component that lists items with icons and optional sub-items
function Section({
  title,
  items,
  onPress,
  colors,
  renderSwitch,
  user,
}: {
  title: string;
  items: Array<{key: string; label: string; Icon: any; isSwitch?: boolean; subItems?: Array<{key:string; label:string}>}>;
  // onPress now can accept a value param for sub-items
  onPress: (label: string, value?: string) => void;
  colors: any;
  renderSwitch?: (value: boolean, onValueChange: (v: boolean) => void) => React.ReactNode;
  user?: { name?: string; email?: string; address?: string } | null;
}) {
  // Local state to track which items are expanded in this section
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[sectionStyles.container, {borderColor: colors.border, backgroundColor: colors.card}]}> 
      <Text style={[sectionStyles.title, {color: colors.text}]}>{title}</Text>
      {items.map((item) => {
        const Icon = item.Icon;
        const isOpen = !!openKeys[item.key];
        return (
          <View key={item.key}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={sectionStyles.row}
              onPress={() => {
                // If this item has sub-items, toggle expand; otherwise treat as a normal press
                if (item.subItems) {
                  toggleExpand(item.key);
                } else if (!item.isSwitch) {
                  onPress(item.label);
                }
              }}>
              <View style={sectionStyles.rowLeft}>
                <View style={[sectionStyles.iconBox, {backgroundColor: 'transparent'}]}>
                  <Icon color={colors.icon} size={18} />
                </View>
                <Text style={[sectionStyles.rowText, {color: colors.text}]}>{item.label}</Text>
              </View>

              {/* If this row has a switch, render it via provided renderSwitch */}
              {item.isSwitch ? (
                renderSwitch ? (
                  <View style={sectionStyles.rowRight}>{renderSwitch(false, () => {})}</View>
                ) : null
              ) : item.subItems ? (
                // Show a chevron and rotate it when open
                <ChevronRight
                  color={colors.icon}
                  size={18}
                  style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
                />
              ) : (
                <ChevronRight color={colors.icon} size={18} />
              )}
            </TouchableOpacity>

            {/* Render sub-items when expanded */}
            {item.subItems && isOpen && (
              <View style={{backgroundColor: colors.card}}>
                        {item.subItems.map((sub) => {
                  // Determine dynamic value for known personal fields
                  // `user` is provided to Section via props
                  let value: string | undefined;
                  if (sub.key === 'name') value = (user?.name as string) ?? '—';
                  else if (sub.key === 'email') value = (user?.email as string) ?? '—';
                  else if (sub.key === 'address') value = (user?.address as string) ?? '—';

                  return (
                    <TouchableOpacity
                      key={sub.key}
                      activeOpacity={0.7}
                      style={[sectionStyles.subRow, {borderTopColor: colors.border}]}
                      onPress={() => onPress(sub.label, value)}>
                      <Text style={[sectionStyles.subText, {color: colors.subText}]}>{sub.label}</Text>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[sectionStyles.subValue, {color: colors.text, marginRight: 8}]}>{value}</Text>
                        <ChevronRight color={colors.icon} size={16} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Styles not dependent on theme
const sectionStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    marginLeft: 12,
    fontSize: 16,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowRight: {
    minWidth: 64,
    alignItems: 'flex-end',
  },
  // Styles for expanded sub-items
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  subText: {
    fontSize: 15,
    marginLeft: 4,
  },
  subValue: {
    fontSize: 15,
    maxWidth: 180,
    overflow: 'hidden',
  },
});

// Returns a StyleSheet based on colors and insets
function getStyles(colors: any, insetTop: number, insetBottom: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingTop: insetTop + 12,
      paddingBottom: insetBottom + 24,
    },
    topSection: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: colors.border,
    },
    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    email: {
      marginTop: 4,
      color: colors.subText,
      fontSize: 14,
    },
    editButton: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.card,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
    },
    editButtonText: {
      marginLeft: 8,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    quickRow: {
      flexDirection: 'row',
      marginTop: 16,
      paddingHorizontal: 16,
      gap: 12,
    },
    cardButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
    },
    cardButtonText: {
      marginLeft: 10,
      fontWeight: '600',
      fontSize: 14,
    },
    listSection: {
      marginTop: 18,
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    listTitle: {
      fontSize: 13,
      fontWeight: '700',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 14,
      justifyContent: 'space-between',
    },
    listText: {
      marginLeft: 12,
      fontSize: 15,
      flex: 1,
    },
    separator: {
      height: 1,
      width: '100%',
    },
    rowRightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    newBadge: {
      backgroundColor: '#EFF6FF',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 6,
    },
    newBadgeText: {
      color: '#2563EB',
      fontWeight: '700',
      fontSize: 12,
    },
    pill: {
      backgroundColor: '#F0FDF4',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 6,
    },
    pillText: {
      color: '#10B981',
      fontWeight: '700',
      fontSize: 12,
    },
    promoWrap: {
      marginTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 12,
      alignItems: 'center',
    },
    promoImage: {
      width: '100%',
      height: 160,
      borderRadius: 12,
      marginBottom: 0,
    },
    versionText: {
      fontSize: 12,
      color: colors.subText,
    },
    footer: {
      marginTop: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: 'transparent',
    },
    logoutText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}

// Small export for tests or storybook if needed
export {Section};
