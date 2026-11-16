import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useRoadmapStore } from '../../store/useRoadmapStore';
import { MilestoneTile } from '../../components/MilestoneTile';
import { PathConnector } from '../../components/PathConnector';
import { MilestonePopover } from '../../components/MilestonePopover';

export default function RoadmapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [selectedTilePos, setSelectedTilePos] = useState<{
    pageX: number;
    pageY: number;
    width: number;
    height: number;
  } | null>(null);

  const {
    currentRoadmap,
    isLoading,
    loadRoadmap,
    toggleTask,
  } = useRoadmapStore();

  useEffect(() => {
    if (id) {
      loadRoadmap(id);
    }
  }, [id, loadRoadmap]);

  useEffect(() => {
    navigation.setOptions({
      title: currentRoadmap?.title || 'Roadmap',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push(`/roadmap/${id}/edit` as any)}
          style={styles.editHeaderBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.editHeaderBtnText}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [currentRoadmap?.title, id, navigation, router]);

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

  const milestones = currentRoadmap.milestones;
  const selectedMilestone = milestones.find((m) => m.id === selectedMilestoneId) || null;

  // Compute winding path geometry
  const centerX = screenWidth / 2;
  const horizontalAmp = Math.min(screenWidth * 0.28, 85);
  const NODE_SPACING_Y = 145;
  const START_Y = 50;
  const TILE_RADIUS_OFFSET = 46; // Half of 92px tile size

  const nodePositions = milestones.map((_, i) => {
    const x = centerX + Math.sin(i * 1.15) * horizontalAmp;
    const y = START_Y + i * NODE_SPACING_Y;
    return { x, y };
  });

  const totalContentHeight = START_Y + milestones.length * NODE_SPACING_Y + 120;

  return (
    <View style={styles.screenWrapper}>
      {milestones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Start Your Journey</Text>
          <Text style={styles.emptyDescription}>
            Build your custom milestones and tasks to explore your interactive Duolingo-style path.
          </Text>
          <TouchableOpacity
            style={styles.buildBtn}
            activeOpacity={0.8}
            onPress={() => router.push(`/roadmap/${id}/edit` as any)}
          >
            <Text style={styles.buildBtnText}>+ Build Roadmap</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { height: Math.max(totalContentHeight, 600) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Sinuous Path Connectors linking consecutive milestone nodes */}
          {nodePositions.map((pos, i) => {
            if (i === nodePositions.length - 1) return null;
            const nextPos = nodePositions[i + 1];
            return (
              <PathConnector
                key={`connector-${i}`}
                fromX={pos.x}
                fromY={pos.y + 40}
                toX={nextPos.x}
                toY={nextPos.y + 40}
              />
            );
          })}

          {/* Circular Milestone Tiles with Segmented Circumference Progress */}
          {milestones.map((milestone, i) => {
            const pos = nodePositions[i];
            const isFirstIncomplete =
              milestones.findIndex((m) => m.tasks.some((t) => !t.is_completed)) === i;

            return (
              <View
                key={milestone.id}
                style={[
                  styles.tileAbsoluteContainer,
                  {
                    left: pos.x - TILE_RADIUS_OFFSET,
                    top: pos.y,
                  },
                ]}
              >
                <MilestoneTile
                  milestone={milestone}
                  index={i}
                  isCurrent={isFirstIncomplete}
                  onPress={(tilePos) => {
                    setSelectedMilestoneId(milestone.id);
                    setSelectedTilePos(tilePos);
                  }}
                />
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Anchored Popover Bubble Card */}
      <MilestonePopover
        visible={Boolean(selectedMilestoneId && selectedTilePos)}
        milestone={selectedMilestone}
        tilePos={selectedTilePos}
        onClose={() => {
          setSelectedMilestoneId(null);
          setSelectedTilePos(null);
        }}
        onToggleTask={(taskId, currentStatus) => {
          if (!id) return;
          toggleTask(id, taskId, currentStatus);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    position: 'relative',
    paddingVertical: 20,
  },
  editHeaderBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginRight: 6,
  },
  editHeaderBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  tileAbsoluteContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f8fafc',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },
  buildBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buildBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});
