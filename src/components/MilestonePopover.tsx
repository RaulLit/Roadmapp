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
import { useThemeStore } from '../store/useThemeStore';

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
  const { colors, isDark } = useThemeStore();

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
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Pointer beak pointing towards the tile */}
              <View
                style={[
                  isUpperHalf ? styles.arrowUp : styles.arrowDown,
                  {
                    left: arrowLeft,
                    borderBottomColor: isUpperHalf ? colors.surface : 'transparent',
                    borderTopColor: !isUpperHalf ? colors.surface : 'transparent',
                  },
                ]}
              />

              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.headerTitleGroup}>
                  <Text style={[styles.milestoneTag, { color: colors.primary }]}>
                    Milestone #{milestone.order_index + 1}
                  </Text>
                  <Text style={[styles.milestoneTitle, { color: colors.text }]} numberOfLines={2}>
                    {milestone.title}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Progress Summary Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated }]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%',
                        backgroundColor: colors.success,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: colors.textMuted }]}>
                  {completedTasks} of {totalTasks} completed
                </Text>
              </View>

              {/* Next Task Highlight Box */}
              {isAllComplete ? (
                <View
                  style={[
                    styles.completedBox,
                    {
                      backgroundColor: isDark ? '#063520' : '#f0fdf4',
                      borderColor: isDark ? '#054e2c' : '#bbf7d0',
                    },
                  ]}
                >
                  <Text style={styles.completedIcon}>🎉</Text>
                  <Text style={[styles.completedTitle, { color: isDark ? '#4ade80' : '#166534' }]}>
                    Milestone Completed!
                  </Text>
                  <Text style={[styles.completedSubtitle, { color: isDark ? '#86efac' : '#15803d' }]}>
                    All tasks in this milestone are finished. Great job!
                  </Text>
                </View>
              ) : nextTask ? (
                <View
                  style={[
                    styles.nextTaskCard,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.nextTaskBadgeRow}>
                    <Text style={[styles.nextTaskBadge, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                      NEXT TASK
                    </Text>
                  </View>
                  <Text style={[styles.nextTaskTitle, { color: colors.text }]}>{nextTask.title}</Text>
                  <TouchableOpacity
                    style={[
                      styles.completeCtaButton,
                      {
                        backgroundColor: colors.success,
                        borderBottomColor: colors.success3d,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => onToggleTask(nextTask.id, nextTask.is_completed)}
                  >
                    <Text style={styles.completeCtaText}>✓ Complete Task</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.emptyTasksBox, { backgroundColor: colors.surfaceElevated }]}>
                  <Text style={[styles.emptyTasksText, { color: colors.textMuted }]}>
                    No tasks added to this milestone yet.
                  </Text>
                </View>
              )}

              {/* All Tasks Checklist */}
              {totalTasks > 0 && (
                <View style={[styles.tasksListSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.tasksSectionTitle, { color: colors.textMuted }]}>
                    All Tasks
                  </Text>
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
                            {
                              borderColor: colors.border,
                              backgroundColor: task.is_completed ? colors.success : colors.surface,
                            },
                            task.is_completed && { borderColor: colors.success },
                          ]}
                        >
                          {task.is_completed && <Text style={styles.checkMark}>✓</Text>}
                        </View>
                        <Text
                          style={[
                            styles.taskRowTitle,
                            { color: colors.text },
                            task.is_completed && {
                              textDecorationLine: 'line-through',
                              color: colors.textMuted,
                            },
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  popoverCard: {
    position: 'absolute',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  milestoneTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '700',
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
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  nextTaskCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  nextTaskBadgeRow: {
    marginBottom: 4,
  },
  nextTaskBadge: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  nextTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  completeCtaButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
  },
  completeCtaText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  completedBox: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
    gap: 2,
  },
  completedIcon: {
    fontSize: 24,
  },
  completedTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  completedSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyTasksBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyTasksText: {
    fontSize: 13,
    textAlign: 'center',
  },
  tasksListSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  tasksSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  taskRowTitle: {
    fontSize: 13,
    flex: 1,
  },
});
