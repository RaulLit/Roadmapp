import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRoadmapStore } from '../store/useRoadmapStore';
import { Roadmap } from '../db/types';

export default function RoadmapsScreen() {
  const router = useRouter();
  const { roadmaps, isLoading, loadRoadmaps, removeRoadmap } = useRoadmapStore();
  const [fabTranslateY] = useState(() => new Animated.Value(0));

  useEffect(() => {
    loadRoadmaps();
  }, [loadRoadmaps]);

  const handleFabPressIn = () => {
    Animated.spring(fabTranslateY, {
      toValue: 3,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 25,
      bounciness: 6,
    }).start();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Roadmap',
      `Delete "${name}"? All associated milestones and tasks will be permanently removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeRoadmap(id) },
      ]
    );
  };

  // Group roadmaps into sections
  const inProgressRoadmaps = roadmaps.filter((r) => {
    const completed = r.completed_tasks_count || 0;
    const total = r.tasks_count || 0;
    return completed > 0 && completed < total;
  });

  const completedRoadmaps = roadmaps.filter((r) => {
    const completed = r.completed_tasks_count || 0;
    const total = r.tasks_count || 0;
    return total > 0 && completed === total;
  });

  const upNextRoadmaps = roadmaps.filter((r) => {
    // Newly created or 0 tasks completed
    return !inProgressRoadmaps.includes(r) && !completedRoadmaps.includes(r);
  });

  const renderCard = (item: Roadmap, category: 'in-progress' | 'up-next' | 'completed') => {
    const totalTasks = item.tasks_count || 0;
    const completedTasks = item.completed_tasks_count || 0;
    const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let badgeText = '🚀 UP NEXT';
    let badgeBg = '#e0f2fe';
    let badgeColor = '#0369a1';
    let bottomBorderColor = '#cbd5e1';

    if (category === 'in-progress') {
      badgeText = '⚡ IN PROGRESS';
      badgeBg = '#dcfce7';
      badgeColor = '#15803d';
      bottomBorderColor = '#86efac';
    } else if (category === 'completed') {
      badgeText = '🏆 COMPLETED';
      badgeBg = '#fef3c7';
      badgeColor = '#b45309';
      bottomBorderColor = '#fde047';
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, { borderBottomColor: bottomBorderColor }]}
        activeOpacity={0.85}
        onPress={() => router.push(`/roadmap/${item.id}` as any)}
      >
        {/* Top Meta Row */}
        <View style={styles.cardHeaderRow}>
          <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, item.title)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Roadmap Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Chunky 3D Progress Bar */}
        {totalTasks > 0 ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${percent}%`,
                    backgroundColor: category === 'completed' ? '#eab308' : '#10b981',
                  },
                ]}
              />
            </View>
            <View style={styles.progressMeta}>
              <Text style={styles.progressPercent}>{percent}%</Text>
              <Text style={styles.progressTasks}>
                {completedTasks}/{totalTasks} tasks done
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.draftText}>
            {item.milestones_count || 0} milestones • Ready to structure
          </Text>
        )}

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.milestoneBadge}>
            📍 {item.milestones_count || 0} {item.milestones_count === 1 ? 'milestone' : 'milestones'}
          </Text>
          <Text style={styles.continueText}>Continue Path →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      {isLoading && roadmaps.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      ) : roadmaps.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Your Journey Starts Here</Text>
          <Text style={styles.emptySubtitle}>
            Create custom roadmaps with milestones and tasks. Watch your progress come to life in an interactive path!
          </Text>
          <TouchableOpacity
            style={styles.createFirstBtn}
            onPress={() => router.push('/new-roadmap' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.createFirstBtnText}>+ Create Your First Roadmap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: In Progress */}
          {inProgressRoadmaps.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>In Progress</Text>
                <View style={[styles.sectionCountPill, { backgroundColor: '#dcfce7' }]}>
                  <Text style={[styles.sectionCountText, { color: '#15803d' }]}>
                    {inProgressRoadmaps.length}
                  </Text>
                </View>
              </View>
              <View style={styles.sectionCards}>
                {inProgressRoadmaps.map((r) => renderCard(r, 'in-progress'))}
              </View>
            </View>
          )}

          {/* Section 2: Up Next */}
          {upNextRoadmaps.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Up Next</Text>
                <View style={[styles.sectionCountPill, { backgroundColor: '#e0f2fe' }]}>
                  <Text style={[styles.sectionCountText, { color: '#0369a1' }]}>
                    {upNextRoadmaps.length}
                  </Text>
                </View>
              </View>
              <View style={styles.sectionCards}>
                {upNextRoadmaps.map((r) => renderCard(r, 'up-next'))}
              </View>
            </View>
          )}

          {/* Section 3: Completed */}
          {completedRoadmaps.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Completed</Text>
                <View style={[styles.sectionCountPill, { backgroundColor: '#fef3c7' }]}>
                  <Text style={[styles.sectionCountText, { color: '#b45309' }]}>
                    {completedRoadmaps.length}
                  </Text>
                </View>
              </View>
              <View style={styles.sectionCards}>
                {completedRoadmaps.map((r) => renderCard(r, 'completed'))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Action Button (FAB) */}
      <Animated.View style={[styles.fabContainer, { transform: [{ translateY: fabTranslateY }] }]}>
        <TouchableOpacity
          style={styles.fab}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          onPress={() => router.push('/new-roadmap' as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding so bottom items aren't blocked by FAB
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  sectionCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCards: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderBottomWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  progressContainer: {
    gap: 5,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
  },
  progressTasks: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  draftText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f1f5f9',
  },
  milestoneBadge: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  continueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563eb',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 99,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#1d4ed8',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 34,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 36,
    gap: 14,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 8,
  },
  createFirstBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderBottomWidth: 4,
    borderBottomColor: '#1d4ed8',
  },
  createFirstBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
