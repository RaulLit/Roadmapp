import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useThemeStore, ThemePreference } from '../../store/useThemeStore';

interface ThemeOption {
  key: ThemePreference;
  title: string;
  icon: string;
  description: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    key: 'system',
    title: 'System Default',
    icon: '📱',
    description: 'Automatically match your device appearance settings.',
  },
  {
    key: 'light',
    title: 'Light Mode',
    icon: '☀️',
    description: 'Crisp, bright, and vibrant colors.',
  },
  {
    key: 'dark',
    title: 'Dark Mode',
    icon: '🌙',
    description: 'Deep midnight slate, comfortable in low light.',
  },
];

export default function SettingsScreen() {
  const { themePreference, setThemePreference, colors, isDark } = useThemeStore();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
          APPEARANCE & THEME
        </Text>

        <View style={styles.optionsList}>
          {THEME_OPTIONS.map((opt) => {
            const isSelected = themePreference === opt.key;

            return (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.85}
                onPress={() => setThemePreference(opt.key)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderBottomColor: isSelected ? colors.primary3d : colors.border3d,
                  },
                ]}
              >
                <View style={styles.optionHeaderRow}>
                  <View style={styles.optionTitleRow}>
                    <Text style={styles.optionIcon}>{opt.icon}</Text>
                    <Text style={[styles.optionTitle, { color: colors.text }]}>
                      {opt.title}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? colors.primary : colors.border,
                        backgroundColor: isSelected ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Text style={styles.radioCheck}>✓</Text>}
                  </View>
                </View>
                <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                  {opt.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* About & Database Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>
          DATA & PRIVACY
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderBottomColor: colors.border3d,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🔒</Text>
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                100% Offline & Private
              </Text>
              <Text style={[styles.infoSubtitle, { color: colors.textMuted }]}>
                Your roadmaps and progress are stored entirely on your device using SQLite. No internet or account required.
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Database</Text>
            <Text style={[styles.metaVal, { color: colors.text }]}>SQLite (WAL Mode)</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Current Theme</Text>
            <Text style={[styles.metaVal, { color: colors.primary }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'} ({themePreference})
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Version</Text>
            <Text style={[styles.metaVal, { color: colors.text }]}>1.0.0</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 18,
    gap: 24,
    paddingBottom: 40,
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderBottomWidth: 5,
    gap: 8,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionIcon: {
    fontSize: 22,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderBottomWidth: 5,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoTextGroup: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  infoSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
  },
});
