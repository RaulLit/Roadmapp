import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useRoadmapStore } from '../../../store/useRoadmapStore';
import { useThemeStore } from '../../../store/useThemeStore';

export default function EditRoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, isDark } = useThemeStore();

  const {
    currentRoadmap,
    isLoading,
    loadRoadmap,
    renameRoadmap,
    addMilestone,
    removeMilestone,
    addTask,
    removeTask,
  } = useRoadmapStore();

  const [prevTitle, setPrevTitle] = useState(currentRoadmap?.title);
  const [roadmapTitle, setRoadmapTitle] = useState(currentRoadmap?.title || '');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  if (currentRoadmap && currentRoadmap.title !== prevTitle) {
    setPrevTitle(currentRoadmap.title);
    setRoadmapTitle(currentRoadmap.title);
  }

  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const milestoneLayouts = useRef<Record<string, number>>({});

  useEffect(() => {
    if (id) {
      loadRoadmap(id);
    }
  }, [id, loadRoadmap]);

  useEffect(() => {
    navigation.setOptions({
      title: currentRoadmap ? `Edit: ${currentRoadmap.title}` : 'Edit Roadmap',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.doneHeaderBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={styles.doneHeaderBtnText}>Done</Text>
        </TouchableOpacity>
      ),
    });
  }, [colors.primary, currentRoadmap, navigation, router]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSaveRoadmapTitle = () => {
    if (!roadmapTitle.trim() || !id) return;
    if (roadmapTitle.trim() !== currentRoadmap?.title) {
      renameRoadmap(id, roadmapTitle.trim());
    }
  };

  const handleAddMilestone = () => {
    if (!milestoneTitle.trim() || !id) return;
    addMilestone(id, milestoneTitle.trim());
    setMilestoneTitle('');
  };

  const handleDeleteMilestone = (milestoneId: string, title: string) => {
    if (!id) return;
    Alert.alert(
      'Delete Milestone',
      `Are you sure you want to delete "${title}" and all its tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeMilestone(id, milestoneId),
        },
      ]
    );
  };

  const handleAddTask = (milestoneId: string) => {
    const text = taskInputs[milestoneId];
    if (!text || !text.trim() || !id) return;
    addTask(id, milestoneId, text.trim());
    setTaskInputs((prev) => ({ ...prev, [milestoneId]: '' }));
  };

  const handleDeleteTask = (taskId: string) => {
    if (!id) return;
    removeTask(id, taskId);
  };

  const handleTaskInputFocus = (milestoneId: string) => {
    const y = milestoneLayouts.current[milestoneId];
    if (typeof y === 'number') {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 20),
          animated: true,
        });
      }, 100);
    }
  };

  if (isLoading && !currentRoadmap) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!currentRoadmap) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Roadmap not found.</Text>
      </View>
    );
  }

  const isTitleModified =
    roadmapTitle.trim() !== '' && roadmapTitle.trim() !== currentRoadmap.title;

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardAvoidingView, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 80 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        {/* Rename Roadmap Card */}
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
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Roadmap Name</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Roadmap title..."
              placeholderTextColor="#94a3b8"
              value={roadmapTitle}
              onChangeText={setRoadmapTitle}
              onBlur={handleSaveRoadmapTitle}
              onSubmitEditing={handleSaveRoadmapTitle}
              returnKeyType="done"
            />
            {isTitleModified && (
              <TouchableOpacity
                style={styles.saveTitleBtn}
                onPress={handleSaveRoadmapTitle}
                activeOpacity={0.8}
              >
                <Text style={styles.saveTitleBtnText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Add Milestone Card */}
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
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Add New Milestone</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Phase 1: Core Fundamentals"
              placeholderTextColor="#94a3b8"
              value={milestoneTitle}
              onChangeText={setMilestoneTitle}
              onSubmitEditing={handleAddMilestone}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { backgroundColor: colors.primary, borderBottomColor: colors.primary3d },
                !milestoneTitle.trim() && styles.btnDisabled,
              ]}
              onPress={handleAddMilestone}
              disabled={!milestoneTitle.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>+ Milestone</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Existing Milestones List */}
        <Text style={[styles.milestonesHeader, { color: colors.text }]}>Milestones & Tasks</Text>

        {currentRoadmap.milestones.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderBottomColor: colors.border3d,
              },
            ]}
          >
            <Text style={[styles.emptyCardTitle, { color: colors.text }]}>No milestones yet</Text>
            <Text style={[styles.emptyCardSubtitle, { color: colors.textMuted }]}>
              Add your first milestone above to start building your roadmap.
            </Text>
          </View>
        ) : (
          currentRoadmap.milestones.map((milestone, mIndex) => {
            const taskInputVal = taskInputs[milestone.id] || '';

            return (
              <View
                key={milestone.id}
                style={[
                  styles.milestoneBlock,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderBottomColor: colors.border3d,
                  },
                ]}
                onLayout={(event) => {
                  milestoneLayouts.current[milestone.id] = event.nativeEvent.layout.y;
                }}
              >
                {/* Milestone Header */}
                <View
                  style={[
                    styles.milestoneHeader,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.milestoneBadgeTitle}>
                    <Text
                      style={[
                        styles.badgeIndex,
                        {
                          backgroundColor: isDark ? '#0c2847' : '#dbeafe',
                          color: isDark ? '#38bdf8' : '#2563eb',
                        },
                      ]}
                    >
                      #{mIndex + 1}
                    </Text>
                    <Text style={[styles.milestoneName, { color: colors.text }]}>
                      {milestone.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteMilestoneBtn}
                    onPress={() => handleDeleteMilestone(milestone.id, milestone.title)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteMilestoneText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                {/* Tasks List */}
                <View style={styles.tasksContainer}>
                  {milestone.tasks.map((task, tIndex) => (
                    <View
                      key={task.id}
                      style={[
                        styles.taskItem,
                        { borderBottomColor: isDark ? '#1e293b' : '#f1f5f9' },
                      ]}
                    >
                      <Text style={[styles.taskIndex, { color: colors.textMuted }]}>
                        {tIndex + 1}.
                      </Text>
                      <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>
                      <TouchableOpacity
                        style={styles.deleteTaskBtn}
                        onPress={() => handleDeleteTask(task.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.deleteTaskText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add Task Input Row */}
                  <View style={styles.addTaskRow}>
                    <TextInput
                      style={[
                        styles.taskInput,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Add task to milestone..."
                      placeholderTextColor="#94a3b8"
                      value={taskInputVal}
                      onChangeText={(val) =>
                        setTaskInputs((prev) => ({ ...prev, [milestone.id]: val }))
                      }
                      onFocus={() => handleTaskInputFocus(milestone.id)}
                      onSubmitEditing={() => handleAddTask(milestone.id)}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[
                        styles.addTaskBtn,
                        {
                          backgroundColor: colors.primary,
                          borderBottomColor: colors.primary3d,
                        },
                        !taskInputVal.trim() && styles.btnDisabled,
                      ]}
                      onPress={() => handleAddTask(milestone.id)}
                      disabled={!taskInputVal.trim()}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addTaskBtnText}>+ Task</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  doneHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  doneHeaderBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  saveTitleBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#10b981',
    borderRadius: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveTitleBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  primaryBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderBottomWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  milestonesHeader: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 4,
    gap: 4,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyCardSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  milestoneBlock: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderBottomWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  milestoneBadgeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  badgeIndex: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  deleteMilestoneBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteMilestoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  tasksContainer: {
    padding: 12,
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  taskIndex: {
    fontSize: 13,
    fontWeight: '700',
    width: 20,
  },
  taskTitle: {
    fontSize: 14,
    flex: 1,
  },
  deleteTaskBtn: {
    padding: 6,
  },
  deleteTaskText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  taskInput: {
    flex: 1,
    height: 38,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  addTaskBtn: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderBottomWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
