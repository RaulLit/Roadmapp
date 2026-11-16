import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Milestone, Task } from '../db/types';

interface MilestonePopoverProps {
  visible: boolean;
  milestone: (Milestone & { tasks: Task[] }) | null;
  tilePos: { pageX: number; pageY: number; width: number; height: number } | null;
  onClose: () => void;
  onToggleTask: (taskId: string, currentStatus: boolean) => void;
}

export function MilestonePopover({
  visible,
  milestone,
  tilePos,
  onClose,
  onToggleTask,
}: MilestonePopoverProps) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  if (!visible || !milestone || !tilePos) {
    return null;
  }

  const totalTasks = milestone.tasks.length;
  const completedTasks = milestone.tasks.filter((t) => t.is_completed).length;
  const nextTask = milestone.tasks.find((t) => !t.is_completed);
  const isAllComplete = totalTasks > 0 && completedTasks === totalTasks;

  // Determine if popover should sit below or above the tile
  const tileCenterY = tilePos.pageY + tilePos.height / 2;
  const isUpperHalf = tileCenterY < screenHeight * 0.52;

  // Compute popover vertical position with safe boundaries
  const popoverWidth = Math.min(screenWidth - 40, 360);
  const popoverLeft = (screenWidth - popoverWidth) / 2;

  const arrowLeft = Math.max(
    16,
    Math.min(tilePos.pageX + tilePos.height / 2 - popoverLeft - 8, popoverWidth - 24)
  );

  let popoverTop: number;
  if (isUpperHalf) {
    popoverTop = Math.min(tilePos.pageY + tilePos.height + 12, screenHeight - 340);
  } else {
    popoverTop = Math.max(tilePos.pageY - 280, 80);
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(100)}
              style={[
                styles.popoverCard,
                {
                  top: popoverTop,
                  left: popoverLeft,
                  width: popoverWidth,
                },
              ]}
            >
              {/* Pointer beak pointing towards the tile */}
              <View
                style={[
                  isUpperHalf ? styles.arrowUp : styles.arrowDown,
                  { left: arrowLeft },
                ]}
              />

              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.headerTitleGroup}>
                  <Text style={styles.milestoneTag}>
                    Milestone #{milestone.order_index + 1}
                  </Text>
                  <Text style={styles.milestoneTitle} numberOfLines={2}>
                    {milestone.title}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Progress Summary Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedTasks} of {totalTasks} completed
                </Text>
              </View>

              {/* Next Task Highlight Box */}
              {isAllComplete ? (
                <View style={styles.completedBox}>
                  <Text style={styles.completedIcon}>🎉</Text>
                  <Text style={styles.completedTitle}>Milestone Completed!</Text>
                  <Text style={styles.completedSubtitle}>
                    All tasks in this milestone are finished. Great job!
                  </Text>
                </View>
              ) : nextTask ? (
                <View style={styles.nextTaskCard}>
                  <View style={styles.nextTaskBadgeRow}>
                    <Text style={styles.nextTaskBadge}>NEXT TASK</Text>
                  </View>
                  <Text style={styles.nextTaskTitle}>{nextTask.title}</Text>
                  <TouchableOpacity
                    style={styles.completeCtaButton}
                    activeOpacity={0.8}
                    onPress={() => onToggleTask(nextTask.id, nextTask.is_completed)}
                  >
                    <Text style={styles.completeCtaText}>✓ Complete Task</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyTasksBox}>
                  <Text style={styles.emptyTasksText}>No tasks added to this milestone yet.</Text>
                </View>
              )}

              {/* All Tasks Checklist */}
              {totalTasks > 0 && (
                <View style={styles.tasksListSection}>
                  <Text style={styles.tasksSectionTitle}>All Tasks</Text>
                  <ScrollView style={styles.taskListScroll} nestedScrollEnabled>
                    {milestone.tasks.map((task) => (
                      <TouchableOpacity
                        key={task.id}
                        style={styles.taskRow}
                        activeOpacity={0.7}
                        onPress={() => onToggleTask(task.id, task.is_completed)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            task.is_completed && styles.checkboxChecked,
                          ]}
                        >
                          {task.is_completed && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                        <Text
                          style={[
                            styles.taskRowTitle,
                            task.is_completed && styles.taskRowTitleDone,
                          ]}
                          numberOfLines={2}
                        >
                          {task.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  popoverCard: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 100,
  },
  arrowUp: {
    position: 'absolute',
    top: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 9,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  arrowDown: {
    position: 'absolute',
    bottom: -9,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: 9,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerTitleGroup: {
    flex: 1,
    marginRight: 8,
  },
  milestoneTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  milestoneTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94a3b8',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  nextTaskCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  nextTaskBadgeRow: {
    marginBottom: 4,
  },
  nextTaskBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284c7',
    letterSpacing: 0.5,
  },
  nextTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  completeCtaButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#059669',
  },
  completeCtaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  completedBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
    gap: 2,
  },
  completedIcon: {
    fontSize: 24,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#166534',
  },
  completedSubtitle: {
    fontSize: 12,
    color: '#15803d',
    textAlign: 'center',
  },
  emptyTasksBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyTasksText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
  tasksListSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  tasksSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  taskListScroll: {
    maxHeight: 120,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  taskRowTitle: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  taskRowTitleDone: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
});
