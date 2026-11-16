import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Milestone, Task } from '../db/types';
import { useThemeStore } from '../store/useThemeStore';

interface MilestoneTileProps {
  milestone: Milestone & { tasks: Task[] };
  index: number;
  onPress: (tilePos: { x: number; y: number; width: number; height: number; pageX: number; pageY: number }) => void;
  isCurrent?: boolean;
}

const TILE_SIZE = 92;
const CENTER = TILE_SIZE / 2;
const RADIUS = 40;
const STROKE_WIDTH = 5;

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const diff = endAngle - startAngle;
  const largeArcFlag = diff <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

export function MilestoneTile({ milestone, index, onPress, isCurrent }: MilestoneTileProps) {
  const { colors, isDark } = useThemeStore();
  const tileRef = useRef<React.ElementRef<typeof View>>(null);
  const [translateY] = useState(() => new Animated.Value(0));

  const handlePressIn = () => {
    Animated.spring(translateY, {
      toValue: 4,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    tileRef.current?.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        onPress({ x, y, width, height, pageX, pageY });
      }
    );
  };

  const totalTasks = milestone.tasks.length;
  const completedTasks = milestone.tasks.filter((t) => t.is_completed).length;
  const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks;

  const trackColor = isDark ? '#1e293b' : '#e2e8f0';
  const emptyDashedColor = isDark ? '#334155' : '#cbd5e1';

  // Render segmented progress ring
  const renderProgressRing = () => {
    if (totalTasks === 0) {
      return (
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={emptyDashedColor}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray="4, 4"
        />
      );
    }

    if (totalTasks <= 12) {
      const segmentAngle = 360 / totalTasks;
      const gapAngle = totalTasks === 1 ? 0 : Math.min(10, 360 / (totalTasks * 4));

      return milestone.tasks.map((task, i) => {
        const startAngle = i * segmentAngle + gapAngle / 2;
        const endAngle = (i + 1) * segmentAngle - gapAngle / 2;
        const pathData = describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle);
        const strokeColor = task.is_completed ? '#10b981' : trackColor;

        return (
          <Path
            key={task.id}
            d={pathData}
            fill="none"
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />
        );
      });
    }

    // When tasks > 12, render continuous progress ring
    const percent = completedTasks / totalTasks;
    const circumference = 2 * Math.PI * RADIUS;
    const strokeDashoffset = circumference * (1 - percent);

    return (
      <>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={trackColor}
          strokeWidth={STROKE_WIDTH}
        />
        {percent > 0 && (
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#10b981"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        )}
      </>
    );
  };

  // Center button color theme
  let buttonBg = colors.primary;
  let buttonBorder = colors.primary3d;
  let badgeText = `${index + 1}`;

  if (isAllCompleted) {
    buttonBg = colors.success;
    buttonBorder = colors.success3d;
    badgeText = '✓';
  } else if (isCurrent) {
    buttonBg = isDark ? '#3b82f6' : '#2563eb';
    buttonBorder = '#1d4ed8';
  }

  return (
    <View ref={tileRef} style={styles.tileWrapper} collapsable={false}>
      {/* SVG Circumference Progress Ring */}
      <Svg width={TILE_SIZE} height={TILE_SIZE} style={styles.svgOverlay}>
        {renderProgressRing()}
      </Svg>

      {/* 3D Tactile Center Button */}
      <Animated.View style={[styles.buttonBase, { borderColor: buttonBorder, transform: [{ translateY }] }]}>
        <Pressable
          style={[styles.buttonInner, { backgroundColor: buttonBg }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          hitSlop={8}
        >
          <Text style={[styles.badgeText, isAllCompleted && styles.completedBadgeText]}>
            {badgeText}
          </Text>
        </Pressable>
      </Animated.View>

      {/* Milestone Title Label below node */}
      <View style={styles.titleContainer}>
        <Text style={[styles.titleText, { color: colors.text }]} numberOfLines={1}>
          {milestone.title}
        </Text>
        <Text style={[styles.subtitleText, { color: colors.textMuted }]}>
          {completedTasks}/{totalTasks}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tileWrapper: {
    width: TILE_SIZE,
    height: TILE_SIZE + 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  buttonBase: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderBottomWidth: 5,
    marginTop: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  completedBadgeText: {
    fontSize: 24,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    width: 140,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
});
