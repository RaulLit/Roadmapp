import { useEffect, useRef, useState } from 'react';
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
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useRoadmapStore } from '../../store/useRoadmapStore';

export default function RoadmapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const milestoneLayouts = useRef<Record<string, number>>({});

  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    currentRoadmap,
    isLoading,
    loadRoadmap,
    addMilestone,
    removeMilestone,
    addTask,
    toggleTask,
    removeTask,
  } = useRoadmapStore();

  useEffect(() => {
    if (id) {
      loadRoadmap(id);
    }
  }, [id, loadRoadmap]);

  useEffect(() => {
    if (currentRoadmap?.title) {
      navigation.setOptions({ title: currentRoadmap.title });
    }
  }, [currentRoadmap?.title, navigation]);

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

  const handleAddMilestone = () => {
    if (!milestoneTitle.trim() || !id) return;
    addMilestone(id, milestoneTitle.trim());
    setMilestoneTitle('');
  };

  const handleDeleteMilestone = (milestoneId: string, name: string) => {
    if (!id) return;
    Alert.alert(
      'Delete Milestone',
      `Delete "${name}" and all its tasks?`,
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
      // Delay slightly so layout and keyboard animation adjust first
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, y - 16),
          animated: true,
        });
      }, 100);
    }
  };

  if (isLoading && !currentRoadmap) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (!currentRoadmap) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Roadmap not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 80 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        {/* Add Milestone Section */}
        <View style={styles.addMilestoneCard}>
          <Text style={styles.sectionHeader}>Add Milestone</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Phase 1: Core Fundamentals"
              placeholderTextColor="#9ca3af"
              value={milestoneTitle}
              onChangeText={setMilestoneTitle}
              onSubmitEditing={handleAddMilestone}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.primaryButton, !milestoneTitle.trim() && styles.buttonDisabled]}
              onPress={handleAddMilestone}
              disabled={!milestoneTitle.trim()}
            >
              <Text style={styles.primaryButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tree Hierarchy Section */}
        <Text style={styles.treeSectionTitle}>Roadmap Tree</Text>

        {currentRoadmap.milestones.length === 0 ? (
          <View style={styles.emptyMilestonesBox}>
            <Text style={styles.emptyText}>No milestones yet.</Text>
            <Text style={styles.emptySubtext}>Add a milestone above to start your roadmap structure.</Text>
          </View>
        ) : (
          currentRoadmap.milestones.map((milestone, mIndex) => {
            const completedCount = milestone.tasks.filter((t) => t.is_completed).length;
            const currentTaskInput = taskInputs[milestone.id] || '';

            return (
              <View
                key={milestone.id}
                style={styles.milestoneBlock}
                onLayout={(event) => {
                  milestoneLayouts.current[milestone.id] = event.nativeEvent.layout.y;
                }}
              >
                {/* Milestone Header Node */}
                <View style={styles.milestoneNode}>
                  <View style={styles.milestoneLabelGroup}>
                    <Text style={styles.milestoneIndexBadge}>#{mIndex + 1}</Text>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  </View>
                  <View style={styles.milestoneActions}>
                    <Text style={styles.milestoneStats}>
                      {completedCount}/{milestone.tasks.length}
                    </Text>
                    <TouchableOpacity
                      style={styles.deleteMilestoneButton}
                      onPress={() => handleDeleteMilestone(milestone.id, milestone.title)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Nested Tasks Container */}
                <View style={styles.tasksContainer}>
                  {/* List Tasks in Tree */}
                  {milestone.tasks.length > 0 ? (
                    milestone.tasks.map((task) => (
                      <View key={task.id} style={styles.taskNode}>
                        <Text style={styles.treeBranchLine}>└──</Text>
                        <TouchableOpacity
                          style={[styles.checkbox, task.is_completed && styles.checkboxChecked]}
                          onPress={() => toggleTask(id!, task.id, task.is_completed)}
                          activeOpacity={0.7}
                        >
                          {task.is_completed && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                        <Text
                          style={[styles.taskTitle, task.is_completed && styles.taskTitleCompleted]}
                          numberOfLines={2}
                        >
                          {task.title}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteTaskButton}
                          onPress={() => handleDeleteTask(task.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.deleteTaskText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noTasksRow}>
                      <Text style={styles.treeBranchLine}>└──</Text>
                      <Text style={styles.noTasksText}>No tasks yet in this milestone</Text>
                    </View>
                  )}

                  {/* Add Task Input Row nested under milestone */}
                  <View style={styles.addTaskRow}>
                    <Text style={styles.treeBranchLine}>└──</Text>
                    <TextInput
                      style={styles.taskInput}
                      placeholder="Add task to milestone..."
                      placeholderTextColor="#9ca3af"
                      value={currentTaskInput}
                      onChangeText={(val) =>
                        setTaskInputs((prev) => ({ ...prev, [milestone.id]: val }))
                      }
                      onFocus={() => handleTaskInputFocus(milestone.id)}
                      onSubmitEditing={() => handleAddTask(milestone.id)}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[
                        styles.addTaskButton,
                        !currentTaskInput.trim() && styles.buttonDisabled,
                      ]}
                      onPress={() => handleAddTask(milestone.id)}
                      disabled={!currentTaskInput.trim()}
                    >
                      <Text style={styles.addTaskButtonText}>+ Task</Text>
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
    backgroundColor: '#f3f4f6',
  },
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  addMilestoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  primaryButton: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  treeSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
  emptyMilestonesBox: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  milestoneBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  milestoneNode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  milestoneLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  milestoneIndexBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  milestoneActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneStats: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  deleteMilestoneButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  tasksContainer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  taskNode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  treeBranchLine: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#9ca3af',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  deleteTaskButton: {
    padding: 4,
  },
  deleteTaskText: {
    fontSize: 13,
    color: '#ef4444',
  },
  noTasksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  noTasksText: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f3f4f6',
  },
  taskInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  addTaskButton: {
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
