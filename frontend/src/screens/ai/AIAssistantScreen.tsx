import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { aiApi } from '../../api/ai';
import { MainStackParamList } from '../../types';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { colors, spacing, fontSizes, radius } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'AIAssistant'>;
  route: RouteProp<MainStackParamList, 'AIAssistant'>;
};

interface Message { role: 'user' | 'assistant'; content: string; }

type TopicKey = 'all' | 'behavior' | 'speech' | 'routine' | 'sensory' | 'social' | 'parent' | 'development' | 'eating';

const TOPICS: { key: TopicKey; label: string; icon: string; color: string }[] = [
  { key: 'all',         label: 'All',        icon: 'apps-outline',            color: colors.primary },
  { key: 'behavior',    label: 'Behavior',   icon: 'flash-outline',           color: '#F7A44A' },
  { key: 'speech',      label: 'Speech',     icon: 'mic-outline',             color: '#5B8DEF' },
  { key: 'routine',     label: 'Routine',    icon: 'calendar-outline',        color: '#6EC6A1' },
  { key: 'sensory',     label: 'Sensory',    icon: 'ear-outline',             color: '#C3AED6' },
  { key: 'social',      label: 'Social',     icon: 'people-outline',          color: '#FF8B94' },
  { key: 'parent',      label: 'Parent',     icon: 'heart-outline',           color: '#E06C75' },
  { key: 'development', label: 'Development',icon: 'trending-up-outline',     color: '#4ECDC4' },
  { key: 'eating',      label: 'Eating',     icon: 'restaurant-outline',      color: '#FFD700' },
];

const PROMPTS: { topic: TopicKey; text: string }[] = [
  // behavior
  { topic: 'behavior', text: 'My child is having frequent meltdowns. What should I do?' },
  { topic: 'behavior', text: 'How do I handle hitting and aggression safely?' },
  { topic: 'behavior', text: 'What are replacement behaviors for screaming?' },
  { topic: 'behavior', text: 'How do I find out what triggers my child\'s behavior?' },
  // speech
  { topic: 'speech',   text: 'My child is non-verbal. How can I help them communicate?' },
  { topic: 'speech',   text: 'What is AAC and how do I get started?' },
  { topic: 'speech',   text: 'How can I encourage my child\'s first words?' },
  { topic: 'speech',   text: 'My child uses echolalia — is that okay?' },
  // routine
  { topic: 'routine',  text: 'How do I build a morning routine that actually works?' },
  { topic: 'routine',  text: 'Tips for bedtime routines for children with autism' },
  { topic: 'routine',  text: 'How do I help my child with transitions between activities?' },
  { topic: 'routine',  text: 'My child refuses to follow the daily schedule' },
  // sensory
  { topic: 'sensory',  text: 'My child is very sensitive to loud sounds. What helps?' },
  { topic: 'sensory',  text: 'What is a sensory diet and how do I create one?' },
  { topic: 'sensory',  text: 'My child hates haircuts and doctor visits. Any advice?' },
  { topic: 'sensory',  text: 'How do weighted blankets help with sensory regulation?' },
  // social
  { topic: 'social',   text: 'How can I help my child make friends?' },
  { topic: 'social',   text: 'My child struggles in group settings at school' },
  { topic: 'social',   text: 'What are social stories and how do I use them?' },
  { topic: 'social',   text: 'How do I explain autism to my child\'s siblings?' },
  // parent
  { topic: 'parent',   text: 'I am feeling burned out as a caregiver. What do I do?' },
  { topic: 'parent',   text: 'How do I advocate for my child at school?' },
  { topic: 'parent',   text: 'How do I handle public meltdowns with strangers watching?' },
  { topic: 'parent',   text: 'How do I stay strong when things feel overwhelming?' },
  // development
  { topic: 'development', text: 'My child is not hitting developmental milestones. Is that okay?' },
  { topic: 'development', text: 'What does early intervention involve and why does it matter?' },
  { topic: 'development', text: 'How do I support late walkers or late talkers?' },
  { topic: 'development', text: 'How can I help my child build focus and attention span?' },
  // eating
  { topic: 'eating',   text: 'My child will only eat 5 foods. How do I expand their diet?' },
  { topic: 'eating',   text: 'What is food chaining for picky eaters?' },
  { topic: 'eating',   text: 'Mealtime is always a battle. How do I make it calmer?' },
  { topic: 'eating',   text: 'My child gags at certain food textures. What should I do?' },
];

export const AIAssistantScreen: React.FC<Props> = ({ navigation, route }) => {
  const childId = route.params?.childId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [activeTopic, setActiveTopic] = useState<TopicKey>('all');
  const listRef = useRef<FlatList>(null);

  const visiblePrompts = activeTopic === 'all'
    ? PROMPTS.slice(0, 8)
    : PROMPTS.filter(p => p.topic === activeTopic);

  const chatMutation = useMutation({
    mutationFn: (text: string) => aiApi.chat(text, childId, conversationId),
    onSuccess: (data) => {
      setConversationId(data.conversation_id);
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: () => Alert.alert('Error', 'Could not get a response. Please try again.'),
  });

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    chatMutation.mutate(trimmed);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScreenHeader title="Ausome AI" subtitle="Autism support assistant" onBack={() => navigation.goBack()} />

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="shield-checkmark-outline" size={15} color={colors.info} />
        <Text style={styles.disclaimerText}>
          Educational guidance only — not a replacement for licensed professional care.
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            {/* AI avatar */}
            <View style={styles.emptyAvatar}>
              <View style={styles.emptyAvatarInner}>
                <Ionicons name="sparkles" size={32} color={colors.white} />
              </View>
            </View>
            <Text style={styles.emptyChatTitle}>Hi, I'm Ausome</Text>
            <Text style={styles.emptyChatSub}>
              Your autism support companion — here to help with behavior, speech, routines, sensory needs, and so much more.
            </Text>

            {/* Topic chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicRow} style={styles.topicScroll}>
              {TOPICS.map(t => {
                const active = activeTopic === t.key;
                return (
                  <TouchableOpacity key={t.key}
                    style={[styles.topicChip, active && { backgroundColor: t.color, borderColor: t.color }]}
                    onPress={() => setActiveTopic(t.key)}>
                    <Ionicons name={t.icon as any} size={13}
                      color={active ? colors.white : colors.textTertiary} />
                    <Text style={[styles.topicChipLabel, active && styles.topicChipLabelActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quick prompts */}
            <View style={styles.quickPrompts}>
              {visiblePrompts.map((p) => (
                <TouchableOpacity key={p.text} style={styles.quickChip} onPress={() => sendMessage(p.text)}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.quickChipText}>{p.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.role === 'assistant' && (
              <View style={styles.aiBubbleIcon}>
                <Ionicons name="sparkles" size={16} color={colors.white} />
              </View>
            )}
            <View style={[
              styles.bubbleContent,
              item.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent,
            ]}>
              <Text style={[
                styles.bubbleText,
                item.role === 'user' ? styles.userBubbleText : styles.aiBubbleText,
              ]}>
                {item.content}
              </Text>
            </View>
          </View>
        )}
      />

      {chatMutation.isPending && (
        <View style={styles.typing}>
          <View style={styles.typingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.typingText}>Ausome is thinking...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything about autism support..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || chatMutation.isPending) && styles.sendBtnDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || chatMutation.isPending}
          accessibilityLabel="Send message"
        >
          <Ionicons name="send" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  disclaimer: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.infoLight, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  disclaimerText: { fontSize: fontSizes.xs, color: colors.info, flex: 1, lineHeight: 16 },

  messageList: { padding: spacing.lg, paddingBottom: spacing.xl, flexGrow: 1 },

  emptyChat: { alignItems: 'center', paddingTop: spacing['2xl'] },

  emptyAvatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyAvatarInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },

  emptyChatTitle: {
    fontSize: fontSizes['2xl'], fontWeight: '800',
    color: colors.textPrimary, marginBottom: spacing.sm,
  },
  emptyChatSub: {
    fontSize: fontSizes.md, color: colors.textTertiary,
    textAlign: 'center', lineHeight: 22,
    marginBottom: spacing.xl, paddingHorizontal: spacing.sm,
  },

  topicScroll: { marginBottom: spacing.lg },
  topicRow: { gap: spacing.sm, paddingHorizontal: spacing.xs },
  topicChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.full, backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  topicChipLabel: { fontSize: fontSizes.xs, fontWeight: '600', color: colors.textTertiary },
  topicChipLabelActive: { color: colors.white },

  quickPrompts: { gap: spacing.sm, width: '100%' },
  quickChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  quickChipText: { fontSize: fontSizes.sm, color: colors.textPrimary, fontWeight: '500', flex: 1 },

  bubble: { flexDirection: 'row', marginBottom: spacing.md },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start', alignItems: 'flex-start' },
  aiBubbleIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.sm, marginTop: 4,
  },
  bubbleContent: { maxWidth: '80%', borderRadius: radius.xl, padding: spacing.md },
  userBubbleContent: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
  aiBubbleContent: {
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: radius.sm,
  },
  bubbleText: { fontSize: fontSizes.md, lineHeight: 22 },
  userBubbleText: { color: colors.white },
  aiBubbleText: { color: colors.textPrimary },

  typing: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm,
  },
  typingDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textTertiary },
  typingText: { fontSize: fontSizes.sm, color: colors.textTertiary, fontStyle: 'italic' },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    padding: spacing.md, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, backgroundColor: colors.background,
    borderRadius: radius.xl, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, fontSize: fontSizes.md,
    color: colors.textPrimary, maxHeight: 120,
    borderWidth: 1.5, borderColor: colors.border,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
});
