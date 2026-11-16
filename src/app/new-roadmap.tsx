import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { useThemeStore } from '../store/useThemeStore';

export default function NewRoadmapScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [btnTranslateY] = useState(() => new Animated.Value(0));
  const { addRoadmap } = useRoadmapStore();
  const { colors } = useThemeStore();

  const handlePressIn = () => {
    Animated.spring(btnTranslateY, {
      toValue: 3,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(btnTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const created = addRoadmap(title.trim());
    if (created) {
      router.replace(`/roadmap/${created.id}/edit` as any);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingView, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderBottomColor: colors.border3d,
              },
            ]}
          >
            <Text style={styles.icon}>🎯</Text>
            <Text style={[styles.heading, { color: colors.text }]}>{"What's your next goal?"}</Text>
            <Text style={[styles.subheading, { color: colors.textMuted }]}>
              {"Give your roadmap an inspiring name. You'll add milestones and steps on the next screen."}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Master React Native, Marathon Prep..."
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={handleCreate}
              returnKeyType="done"
              autoFocus
            />

            <Animated.View style={{ transform: [{ translateY: btnTranslateY }] }}>
              <TouchableOpacity
                style={[
                  styles.createBtn,
                  {
                    backgroundColor: colors.success,
                    borderBottomColor: colors.success3d,
                  },
                  !title.trim() && styles.createBtnDisabled,
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handleCreate}
                disabled={!title.trim()}
                activeOpacity={0.9}
              >
                <Text style={styles.createBtnText}>Create & Add Milestones →</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 60,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 52,
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  createBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
