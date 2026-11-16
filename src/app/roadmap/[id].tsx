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
import { useThemeStore } from '../../store/useThemeStore';
import { MilestoneTile } from '../../components/MilestoneTile';
import { PathConnector } from '../../components/PathConnector';
import { MilestonePopover } from '../../components/MilestonePopover';

export default function RoadmapDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useThemeStore();

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
          style={[
            styles.editHeaderBtn,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.editHeaderBtnText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
      ),
    });
  }, [colors, currentRoadmap?.title, id, navigation, router]);

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
    <View style={[styles.screenWrapper, { backgroundColor: colors.background }]}>
      {milestones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Start Your Journey</Text>
          <Text style={[styles.emptyDescription, { color: colors.textMuted }]}>
            Build your custom milestones and tasks to explore your interactive Duolingo-style path.
          </Text>
          <TouchableOpacity
            style={[
              styles.buildBtn,
              { backgroundColor: colors.primary, borderBottomColor: colors.primary3d },
            ]}
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
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  editHeaderBtnText: {
    fontSize: 14,
    fontWeight: '700',
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
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 10,
  },
  buildBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderBottomWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
  },
});
