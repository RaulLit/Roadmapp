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
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useRoadmapStore } from '../../../store/useRoadmapStore';

export default function EditRoadmapScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const scrollViewRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const {
    currentRoadmap,
    isLoading,
    loadRoadmap,
    addMilestone,
    removeMilestone,
    addTask,
    removeTask,
  } = useRoadmapStore();

  useEffect(() => {
    if (id) {
      loadRoadmap(id);
    }
  }, [id, loadRoadmap]);

  useEffect(() => {
    navigation.setOptions({
      title: currentRoadmap ? `Edit: ${currentRoadmap.title}` : 'Edit Roadmap',
      headerRight: () => (
        <TouchableOpacity onPress={() => router.back()} style={styles.doneHeaderBtn}>
          <Text style={styles.doneHeaderBtnText}>Done</Text>
        </TouchableOpacity>
      ),
    });
  }, [currentRoadmap, navigation, router]);

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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
      >
        {/* Add Milestone Card */}
        <View style={styles.addCard}>
          <Text style={styles.sectionTitle}>Add New Milestone</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Phase 1: Core Fundamentals"
              placeholderTextColor="#94a3b8"
              value={milestoneTitle}
              onChangeText={setMilestoneTitle}
              onSubmitEditing={handleAddMilestone}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.primaryBtn, !milestoneTitle.trim() && styles.btnDisabled]}
              onPress={handleAddMilestone}
              disabled={!milestoneTitle.trim()}
            >
              <Text style={styles.primaryBtnText}>+ Milestone</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Existing Milestones List */}
        <Text style={styles.milestonesHeader}>Milestones & Tasks</Text>

        {currentRoadmap.milestones.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardTitle}>No milestones yet</Text>
            <Text style={styles.emptyCardSubtitle}>
              Add your first milestone above to start building your roadmap.
            </Text>
          </View>
        ) : (
          currentRoadmap.milestones.map((milestone, mIndex) => {
            const taskInputVal = taskInputs[milestone.id] || '';

            return (
              <View key={milestone.id} style={styles.milestoneBlock}>
                {/* Milestone Header */}
                <View style={styles.milestoneHeader}>
                  <View style={styles.milestoneBadgeTitle}>
                    <Text style={styles.badgeIndex}>#{mIndex + 1}</Text>
                    <Text style={styles.milestoneName}>{milestone.title}</Text>
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
                    <View key={task.id} style={styles.taskItem}>
                      <Text style={styles.taskIndex}>{tIndex + 1}.</Text>
                      <Text style={styles.taskTitle}>{task.title}</Text>
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
                      style={styles.taskInput}
                      placeholder="Add task to milestone..."
                      placeholderTextColor="#94a3b8"
                      value={taskInputVal}
                      onChangeText={(val) =>
                        setTaskInputs((prev) => ({ ...prev, [milestone.id]: val }))
                      }
                      onSubmitEditing={() => handleAddTask(milestone.id)}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[styles.addTaskBtn, !taskInputVal.trim() && styles.btnDisabled]}
                      onPress={() => handleAddTask(milestone.id)}
                      disabled={!taskInputVal.trim()}
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
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 60,
    gap: 16,
  },
  doneHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2563eb',
    borderRadius: 6,
    marginRight: 8,
  },
  doneHeaderBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  addCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
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
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  primaryBtn: {
    height: 42,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#93c5fd',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  milestonesHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  emptyCardSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  milestoneBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  deleteMilestoneBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteMilestoneText: {
    fontSize: 13,
    fontWeight: '600',
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
    borderBottomColor: '#f1f5f9',
  },
  taskIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    width: 20,
  },
  taskTitle: {
    fontSize: 14,
    color: '#334155',
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
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  addTaskBtn: {
    height: 38,
    paddingHorizontal: 14,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTaskBtnText: {
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
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});
