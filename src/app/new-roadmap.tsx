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

export default function NewRoadmapScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [btnTranslateY] = useState(() => new Animated.Value(0));
  const { addRoadmap } = useRoadmapStore();

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
      // Immediately navigate to the editor to add milestones and tasks
      router.replace(`/roadmap/${created.id}/edit` as any);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
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
          <View style={styles.card}>
            <Text style={styles.icon}>🎯</Text>
            <Text style={styles.heading}>{"What's your next goal?"}</Text>
            <Text style={styles.subheading}>
              {"Give your roadmap an inspiring name. You'll add milestones and steps on the next screen."}
            </Text>

            <TextInput
              style={styles.input}
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
                style={[styles.createBtn, !title.trim() && styles.createBtnDisabled]}
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
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomWidth: 5,
    borderBottomColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
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
    color: '#0f172a',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    marginBottom: 8,
  },
  createBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 4,
    borderBottomColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: {
    backgroundColor: '#a7f3d0',
    borderBottomColor: '#6ee7b7',
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
