import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { rewardsApi } from '../../api/rewards';
import { Reward, MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Loading } from '../../components/common/Loading';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, fontSizes, radius, shadow } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Rewards'>;
  route: RouteProp<MainStackParamList, 'Rewards'>;
};

export const RewardsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { childId } = route.params;
  const queryClient = useQueryClient();
  const [celebrating, setCelebrating] = useState(false);

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['token-balance', childId],
    queryFn: () => rewardsApi.getBalance(childId),
  });

  const { data: rewards = [], isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards', childId],
    queryFn: () => rewardsApi.list(childId),
  });

  const redeemMutation = useMutation({
    mutationFn: (reward: Reward) =>
      rewardsApi.addTransaction({
        child_id: childId,
        reward_id: reward.id,
        token_delta: -reward.token_cost,
        reason: `Redeemed: ${reward.title}`,
        source: 'redemption',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-balance', childId] });
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 3000);
    },
    onError: () => Alert.alert('Oops', 'Could not redeem this reward.'),
  });

  const earnMutation = useMutation({
    mutationFn: (amount: number) =>
      rewardsApi.addTransaction({
        child_id: childId,
        token_delta: amount,
        reason: 'Manual token award',
        source: 'manual',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-balance', childId] });
      Alert.alert('Tokens Added!', 'Keep up the amazing work!');
    },
  });

  const handleRedeem = (reward: Reward) => {
    const balance_val = balance?.current_balance ?? 0;
    if (balance_val < reward.token_cost) {
      Alert.alert(
        'Not Enough Tokens',
        `You need ${reward.token_cost} tokens but only have ${balance_val}. Keep earning!`,
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert(
      `Redeem "${reward.title}"?`,
      `This will use ${reward.token_cost} tokens.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Redeem!', onPress: () => redeemMutation.mutate(reward) },
      ]
    );
  };

  if (balanceLoading || rewardsLoading) return <Loading fullScreen />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Tokens & Rewards" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Token balance card */}
        <Card style={styles.balanceCard} elevated>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceTitleRow}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <Text style={styles.balanceTitle}>Token Balance</Text>
            </View>
            <TouchableOpacity
              style={styles.addTokenBtn}
              onPress={() => earnMutation.mutate(1)}
            >
              <Ionicons name="add" size={18} color={colors.white} />
              <Text style={styles.addTokenText}>+1 Token</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceNumber}>{balance?.current_balance ?? 0}</Text>
              <Text style={styles.balanceLabel}>Current Tokens</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceStat}>
              <Text style={styles.streakNumber}>{balance?.current_streak ?? 0}</Text>
              <Text style={styles.balanceLabel}>Day Streak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceStat}>
              <Text style={styles.totalNumber}>{balance?.total_earned ?? 0}</Text>
              <Text style={styles.balanceLabel}>Total Earned</Text>
            </View>
          </View>

          {/* Quick earn buttons */}
          <View style={styles.earnRow}>
            <Text style={styles.earnLabel}>Quick Award:</Text>
            {[1, 3, 5, 10].map((n) => (
              <TouchableOpacity
                key={n}
                style={styles.earnBtn}
                onPress={() => earnMutation.mutate(n)}
              >
                <Text style={styles.earnBtnText}>+{n}</Text>
                <Ionicons name="star" size={11} color={colors.white} />
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Celebration banner */}
        {celebrating && (
          <Card style={styles.celebrationCard}>
            <Ionicons name="checkmark-circle" size={36} color={colors.accent} style={{ marginBottom: 6 }} />
          <Text style={styles.celebrationText}>Amazing! Reward redeemed!</Text>
            <Text style={styles.celebrationSub}>Great job! You earned it!</Text>
          </Card>
        )}

        {/* Rewards list */}
        <Text style={styles.sectionTitle}>Available Rewards</Text>

        {rewards.length === 0 ? (
          <EmptyState
            icon="gift-outline"
            title="No rewards set up yet"
            message="Add rewards that will motivate your child"
            actionLabel="Add Reward"
            onAction={() => {}}
          />
        ) : (
          <View style={styles.rewardsGrid}>
            {rewards.map((reward) => {
              const canAfford = (balance?.current_balance ?? 0) >= reward.token_cost;
              return (
                <TouchableOpacity
                  key={reward.id}
                  style={[
                    styles.rewardCard,
                    !canAfford && styles.rewardCardLocked,
                  ]}
                  onPress={() => handleRedeem(reward)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${reward.title}. Costs ${reward.token_cost} tokens.`}
                >
                  <View style={[styles.rewardIconCircle, { backgroundColor: getRewardIcon(reward.reward_type).color + '22' }]}>
                    <Ionicons name={getRewardIcon(reward.reward_type).icon as any} size={28} color={getRewardIcon(reward.reward_type).color} />
                  </View>
                  <Text style={styles.rewardTitle} numberOfLines={2}>{reward.title}</Text>
                  <View style={styles.rewardCost}>
                    <Ionicons name="star" size={11} color={canAfford ? colors.accent : colors.textTertiary} />
                    <Text style={[styles.rewardCostText, !canAfford && styles.rewardCostInsufficient]}>
                      {reward.token_cost}
                    </Text>
                  </View>
                  {!canAfford && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={16} color={colors.textTertiary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Record */}
        <Card style={styles.recordCard}>
          <Text style={styles.recordTitle}>Longest Streak</Text>
          <View style={styles.recordRow}>
            <Text style={styles.recordNumber}>{balance?.longest_streak ?? 0} days</Text>
            <Ionicons name="flame" size={20} color="#F7A44A" />
          </View>
          <Text style={styles.recordSub}>Total redeemed: {balance?.total_redeemed ?? 0} tokens</Text>
        </Card>
      </ScrollView>
    </View>
  );
};

function getRewardIcon(type: string): { icon: string; color: string } {
  const map: Record<string, { icon: string; color: string }> = {
    activity:    { icon: 'game-controller-outline', color: '#A78BFA' },
    item:        { icon: 'gift-outline',            color: '#F7A44A' },
    privilege:   { icon: 'ribbon-outline',          color: '#FFD700' },
    praise:      { icon: 'heart-outline',           color: '#FF8B94' },
    screen_time: { icon: 'phone-portrait-outline',  color: '#5B8DEF' },
    custom:      { icon: 'star-outline',            color: '#4ECDC4' },
  };
  return map[type] ?? { icon: 'trophy-outline', color: '#6EC6A1' };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },

  balanceCard: { marginBottom: spacing.xl, backgroundColor: colors.primary + 'F0' },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  balanceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  balanceTitle: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.white },
  addTokenBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: radius.full,
  },
  addTokenText: { color: colors.white, fontWeight: '700', fontSize: fontSizes.sm },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.lg },
  balanceStat: { alignItems: 'center' },
  balanceNumber: { fontSize: fontSizes['3xl'], fontWeight: '900', color: colors.white },
  streakNumber: { fontSize: fontSizes['3xl'], fontWeight: '900', color: '#FFD700' },
  totalNumber: { fontSize: fontSizes['3xl'], fontWeight: '900', color: colors.secondaryLight },
  balanceLabel: { fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  earnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  earnLabel: { fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  earnBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: radius.full,
  },
  earnBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSizes.sm },

  celebrationCard: {
    marginBottom: spacing.xl, backgroundColor: colors.accentLight,
    alignItems: 'center', borderColor: colors.accent,
  },
  celebrationText: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.accent },
  celebrationSub: { fontSize: fontSizes.md, color: colors.textSecondary, marginTop: spacing.xs },

  sectionTitle: { fontSize: fontSizes.md, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },

  rewardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.xl },
  rewardCard: {
    width: '47%', backgroundColor: colors.surface,
    borderRadius: radius.xl, padding: spacing.lg, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, ...shadow.sm,
    position: 'relative',
  },
  rewardCardLocked: { opacity: 0.6 },
  rewardIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rewardTitle: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  rewardCost: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.accentLight, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: radius.full,
  },
  rewardCostText: { fontSize: fontSizes.sm, fontWeight: '700', color: colors.accent },
  rewardCostInsufficient: { color: colors.textTertiary },
  lockOverlay: { position: 'absolute', top: spacing.sm, right: spacing.sm },

  recordCard: { marginTop: spacing.md },
  recordTitle: { fontSize: fontSizes.sm, color: colors.textTertiary, fontWeight: '600' },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginVertical: spacing.xs },
  recordNumber: { fontSize: fontSizes.xl, fontWeight: '800', color: colors.primary },
  recordSub: { fontSize: fontSizes.sm, color: colors.textTertiary },
});
