import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function MessagesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi Admin! I need help with my gadget rental.",
      sender: "student",
      time: "9:05 AM",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages([
      ...messages,
      { id: Date.now(), text: input, sender: "student", time: now },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "The admin will be with you in a minute, hang on...",
          sender: "system",
          time: now,
        },
      ]);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ marginLeft: 15 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Quick Slot Support
          </Text>
          <Text style={{ color: "#4ADE80", fontSize: 12 }}>● Online</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={{
              alignSelf: msg.sender === "student" ? "flex-end" : "flex-start",
              marginBottom: 20,
              maxWidth: "80%",
            }}
          >
            <View
              style={[
                styles.bubble,
                {
                  backgroundColor:
                    msg.sender === "student" ? colors.primary : colors.surface,
                },
                msg.sender === "system" && styles.systemBubble,
              ]}
            >
              <Text
                style={{
                  color: msg.sender === "student" ? "#FFF" : colors.text,
                  fontStyle: msg.sender === "system" ? "italic" : "normal",
                  opacity: msg.sender === "system" ? 0.6 : 1,
                }}
              >
                {msg.text}
              </Text>
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 10,
                marginTop: 4,
                textAlign: msg.sender === "student" ? "right" : "left",
              }}
            >
              {msg.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Type message..."
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[styles.sendButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerTitle: { fontWeight: "bold", fontSize: 18 },
  bubble: { padding: 14, borderRadius: 18 },
  systemBubble: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(150,150,150,0.2)",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    paddingBottom: Platform.OS === "ios" ? 35 : 15,
    alignItems: "center",
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
  },
  sendButton: {
    marginLeft: 10,
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
