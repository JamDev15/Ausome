import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stage } from './activityConfig';
import { spacing, fontSizes, radius } from '../../theme';

interface Props {
  stages: Stage[];
  activeStage: number;
  completedStages: number[];
  accentColor: string;
  onSelect: (id: number) => void;
}

export const StageBar: React.FC<Props> = ({ stages, activeStage, completedStages, accentColor, onSelect }) => {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {stages.map((s, i) => {
          const done = completedStages.includes(s.id);
          const active = activeStage === s.id;
          const locked = !done && s.id > 1 && !completedStages.includes(s.id - 1);

          return (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.chip,
                active && { backgroundColor: accentColor, borderColor: accentColor },
                done && !active && { borderColor: accentColor + '88' },
                locked && styles.chipLocked,
              ]}
              onPress={() => !locked && onSelect(s.id)}
              disabled={locked}
              activeOpacity={locked ? 1 : 0.78}
            >
              {done && !active && (
                <Ionicons name="checkmark-circle" size={13} color={accentColor} style={{ marginRight: 3 }} />
              )}
              {locked && (
                <Ionicons name="lock-closed" size={12} color="#C0C0C8" style={{ marginRight: 3 }} />
              )}
              <Text style={[
                styles.chipLabel,
                active && { color: '#fff' },
                done && !active && { color: accentColor },
                locked && styles.chipLabelLocked,
              ]}>
                {s.label}
              </Text>
              <Text style={[
                styles.chipDesc,
                active && { color: 'rgba(255,255,255,0.8)' },
                locked && styles.chipLabelLocked,
              ]}>
                {s.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {/* Overall progress bar */}
      <View style={styles.overallBar}>
        <View style={[styles.overallFill, {
          width: `${(completedStages.length / stages.length) * 100}%`,
          backgroundColor: accentColor,
        }]} />
      </View>
      <Text style={styles.progressText}>
        {completedStages.length}/{stages.length} stages complete
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F4', paddingBottom: spacing.sm },
  row: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: '#E2E8F4',
    backgroundColor: '#F6F9FF', gap: 2,
  },
  chipLocked: { backgroundColor: '#F0F2F5', borderColor: '#E2E8F4' },
  chipLabel: { fontSize: fontSizes.xs, fontWeight: '800', color: '#4A5578' },
  chipDesc: { fontSize: 9, fontWeight: '600', color: '#8894B0', marginLeft: 2 },
  chipLabelLocked: { color: '#C0C0C8' },
  overallBar: { height: 4, backgroundColor: '#E2E8F4', marginHorizontal: spacing.lg, marginTop: spacing.sm, borderRadius: 2, overflow: 'hidden' },
  overallFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 9.5, color: '#8894B0', fontWeight: '600', paddingHorizontal: spacing.lg, marginTop: 4 },
});
