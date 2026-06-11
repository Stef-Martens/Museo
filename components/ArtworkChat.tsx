import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { askAboutArtwork } from "@/lib/artwork-chat";
import { colors } from "@/constants/theme";
import type { Artwork, ChatMessage } from "@/types";

const SUGGESTIONS = [
  "Who was the artist?",
  "What is happening in this scene?",
  "Why is this work important?",
  "What style or period is this?",
];

interface ArtworkChatProps {
  artwork: Artwork;
}

export default function ArtworkChat({ artwork }: ArtworkChatProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;

    setError(null);
    setInput("");
    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const reply = await askAboutArtwork(artwork, messages, question);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not get a reply";
      setError(msg);
      setMessages((prev) => prev.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.wrap}
    >
      <Text style={styles.sectionLabel}>ASK MUSEO</Text>
      <Text style={styles.hint}>
        Ask anything about {artwork.title} — history, meaning, style, or the
        artist.
      </Text>

      <View style={styles.card}>
        {messages.length === 0 && !loading && (
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                style={styles.suggestionChip}
                onPress={() => send(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {messages.length > 0 && (
          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            nestedScrollEnabled
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((m, i) => (
              <View
                key={`${m.role}-${i}`}
                style={[
                  styles.bubble,
                  m.role === "user" ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    m.role === "user" && styles.userBubbleText,
                  ]}
                >
                  {m.content}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.bubble, styles.assistantBubble]}>
                <ActivityIndicator color={colors.stone} size="small" />
              </View>
            )}
          </ScrollView>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question…"
            placeholderTextColor={colors.stone}
            value={input}
            onChangeText={setInput}
            editable={!loading}
            multiline
            maxLength={500}
            onSubmitEditing={() => send(input)}
            blurOnSubmit
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendBtnText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.stone,
    fontWeight: "500",
    marginTop: 8,
  },
  hint: { fontSize: 13, color: colors.stone, lineHeight: 19 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    overflow: "hidden",
  },
  suggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
  },
  suggestionChip: {
    backgroundColor: colors.accentMuted,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionText: { fontSize: 13, color: colors.ink },
  messages: { maxHeight: 280 },
  messagesContent: { padding: 12, gap: 10 },
  bubble: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: "92%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  bubbleText: { fontSize: 14, lineHeight: 21, color: colors.ink },
  userBubbleText: { color: "#fff" },
  error: {
    color: colors.accent,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sendBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtnDisabled: { opacity: 0.45 },
  sendBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
