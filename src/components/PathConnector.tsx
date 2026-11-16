import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

interface PathConnectorProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function PathConnector({ fromX, fromY, toX, toY }: PathConnectorProps) {
  const minX = Math.min(fromX, toX) - 20;
  const minY = Math.min(fromY, toY);
  const width = Math.max(Math.abs(toX - fromX) + 40, 40);
  const height = Math.max(toY - fromY, 1);

  // Local coordinates inside the SVG viewBox
  const startX = fromX - minX;
  const startY = fromY - minY;
  const endX = toX - minX;
  const endY = toY - minY;

  // Cubic Bezier curve control points for smooth S-curve
  const cp1X = startX;
  const cp1Y = startY + (endY - startY) * 0.5;
  const cp2X = endX;
  const cp2Y = endY - (endY - startY) * 0.5;

  const d = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.connectorContainer,
        {
          left: minX,
          top: minY,
          width,
          height,
        },
      ]}
    >
      <Svg width={width} height={height}>
        <Path
          d={d}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={6}
          strokeDasharray="8, 8"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  connectorContainer: {
    position: 'absolute',
    zIndex: 0,
  },
});
