import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Vibration,
} from "react-native";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";

type AppLanguage = "en" | "hi";

export default function HomeScreen() {
  const router = useRouter();
  const [language, setLanguage] = useState<AppLanguage>("en");

  useEffect(() => {
    Speech.stop();

    const message =
      language === "hi"
        ? "नमस्ते। MedVoice में आपका स्वागत है। दवा स्कैन करने के लिए नीचे दिए गए बटन पर डबल टैप करें।"
        : "Welcome to MedVoice. Choose your language, then double tap Scan Medicine to scan your medicine.";

    Speech.speak(message, {
      language: language === "hi" ? "hi-IN" : "en-US",
      rate: 0.9,
    });

    return () => {
      Speech.stop();
    };
  }, [language]);

  const selectLanguage = (value: AppLanguage) => {
    setLanguage(value);
    Vibration.vibrate(70);
  };

  const startScan = () => {
    Speech.stop();
    Vibration.vibrate(100);

    router.push({
      pathname: "/camera",
      params: { language },
    });
  };

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brandCircle}>
        <Text style={styles.brandIcon}>M</Text>
      </View>

      <Text
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        MedVoice
      </Text>

      <Text style={styles.tagline}>
        AI Medicine Accessibility Assistant
      </Text>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.wave}>👋</Text>

        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>
            {language === "hi"
              ? "मैं आपकी मदद के लिए तैयार हूँ"
              : "I'm ready to help"}
          </Text>

          <Text style={styles.welcomeText}>
            {language === "hi"
              ? "दवा की फोटो लेकर उसका नाम और expiry जानें।"
              : "Take a photo of your medicine to read its name and expiry."}
          </Text>
        </View>
      </View>

      {/* Language */}
      <Text style={styles.sectionTitle}>
        {language === "hi"
          ? "भाषा चुनें"
          : "Choose your language"}
      </Text>

      <View style={styles.languageRow}>
        <Pressable
          style={[
            styles.languageCard,
            language === "en" && styles.languageCardSelected,
          ]}
          onPress={() => selectLanguage("en")}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="English"
          accessibilityState={{
            selected: language === "en",
          }}
        >
          <Text style={styles.languageEmoji}>🇬🇧</Text>

          <Text
            style={[
              styles.languageText,
              language === "en" && styles.selectedText,
            ]}
          >
            English
          </Text>

          {language === "en" && (
            <Text style={styles.check}>✓</Text>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.languageCard,
            language === "hi" && styles.languageCardSelected,
          ]}
          onPress={() => selectLanguage("hi")}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Hindi"
          accessibilityState={{
            selected: language === "hi",
          }}
        >
          <Text style={styles.languageEmoji}>🇮🇳</Text>

          <Text
            style={[
              styles.languageText,
              language === "hi" && styles.selectedText,
            ]}
          >
            हिन्दी
          </Text>

          {language === "hi" && (
            <Text style={styles.check}>✓</Text>
          )}
        </Pressable>
      </View>

      {/* Main Scan Button */}
      <Pressable
        style={({ pressed }) => [
          styles.scanButton,
          pressed && styles.scanButtonPressed,
        ]}
        onPress={startScan}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          language === "hi"
            ? "दवा स्कैन करें"
            : "Scan Medicine"
        }
        accessibilityHint={
          language === "hi"
            ? "दवा स्कैन करने के लिए डबल टैप करें"
            : "Double tap to scan your medicine"
        }
      >
        <Text style={styles.scanIcon}>📷</Text>

        <View style={styles.scanContent}>
          <Text style={styles.scanTitle}>
            {language === "hi"
              ? "दवा स्कैन करें"
              : "Scan Medicine"}
          </Text>

          <Text style={styles.scanHint}>
            {language === "hi"
              ? "Double tap to start"
              : "Double tap to start"}
          </Text>
        </View>
      </Pressable>

      {/* Voice Status */}
      <View style={styles.voiceBar}>
        <Text style={styles.voiceIcon}>🔊</Text>

        <Text style={styles.voiceText}>
          {language === "hi"
            ? "Voice guidance चालू है"
            : "Voice guidance is on"}
        </Text>
      </View>

      <Text style={styles.footer}>
        Designed for blind & low-vision users
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
    paddingHorizontal: 22,
    paddingTop: 45,
    alignItems: "center",
  },

  brandCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#0B5FFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  brandIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#102A43",
  },

  tagline: {
    fontSize: 15,
    color: "#627D98",
    marginTop: 4,
    marginBottom: 25,
    textAlign: "center",
  },

  welcomeCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E7F5",
    marginBottom: 25,
  },

  wave: {
    fontSize: 34,
    marginRight: 15,
  },

  welcomeContent: {
    flex: 1,
  },

  welcomeTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#102A43",
    marginBottom: 5,
  },

  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#627D98",
  },

  sectionTitle: {
    width: "100%",
    fontSize: 16,
    fontWeight: "700",
    color: "#243B53",
    marginBottom: 10,
  },

  languageRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },

  languageCard: {
    flex: 1,
    minHeight: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#D9E7F5",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  languageCardSelected: {
    backgroundColor: "#E8F1FF",
    borderColor: "#0B5FFF",
  },

  languageEmoji: {
    fontSize: 23,
    marginBottom: 3,
  },

  languageText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#243B53",
  },

  selectedText: {
    color: "#0B5FFF",
  },

  check: {
    position: "absolute",
    right: 9,
    top: 7,
    color: "#0B5FFF",
    fontSize: 16,
    fontWeight: "800",
  },

  scanButton: {
    width: "100%",
    minHeight: 105,
    borderRadius: 22,
    backgroundColor: "#0B5FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    elevation: 5,
  },

  scanButtonPressed: {
    backgroundColor: "#0847CC",
    transform: [{ scale: 0.98 }],
  },

  scanIcon: {
    fontSize: 40,
    marginRight: 20,
  },

  scanContent: {
    flex: 1,
  },

  scanTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  scanHint: {
    color: "#DCE9FF",
    fontSize: 14,
    marginTop: 3,
  },

  voiceBar: {
    marginTop: 18,
    width: "100%",
    backgroundColor: "#E8F1FF",
    borderRadius: 14,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  voiceIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  voiceText: {
    color: "#174A8B",
    fontSize: 14,
    fontWeight: "600",
  },

  footer: {
    position: "absolute",
    bottom: 18,
    fontSize: 12,
    color: "#829AB1",
  },
});