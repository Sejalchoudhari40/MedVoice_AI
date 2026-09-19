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
    const welcome =
      language === "hi"
        ? "MedVoice में आपका स्वागत है। दवा स्कैन करने के लिए स्कैन मेडिसिन बटन दबाएं।"
        : "Welcome to MedVoice. Select your language, then press Scan Medicine to scan your medicine.";

    Speech.stop();

    Speech.speak(welcome, {
      language: language === "hi" ? "hi-IN" : "en-US",
      rate: 0.9,
    });

    return () => {
      Speech.stop();
    };
  }, [language]);

  const handleLanguageChange = (selectedLanguage: AppLanguage) => {
    setLanguage(selectedLanguage);
    Vibration.vibrate(70);
  };

  const handleScanPress = () => {
    Speech.stop();
    Vibration.vibrate(100);

    router.push({
      pathname: "/camera",
      params: {
        language,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text
        style={styles.title}
        accessible={true}
        accessibilityRole="header"
      >
        MedVoice AI
      </Text>

      <Text
        style={styles.subtitle}
        accessible={true}
        accessibilityRole="text"
      >
        {language === "hi"
          ? "दवा की expiry जांचने वाला सहायक"
          : "Medicine expiry assistant"}
      </Text>

      <Text style={styles.languageTitle}>
        {language === "hi" ? "भाषा चुनें" : "Choose Language"}
      </Text>

      <View style={styles.languageRow}>
        <Pressable
          style={[
            styles.languageButton,
            language === "en" && styles.selectedLanguage,
          ]}
          onPress={() => handleLanguageChange("en")}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="English"
          accessibilityState={{ selected: language === "en" }}
        >
          <Text
            style={[
              styles.languageButtonText,
              language === "en" && styles.selectedLanguageText,
            ]}
          >
            English
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.languageButton,
            language === "hi" && styles.selectedLanguage,
          ]}
          onPress={() => handleLanguageChange("hi")}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Hindi"
          accessibilityState={{ selected: language === "hi" }}
        >
          <Text
            style={[
              styles.languageButtonText,
              language === "hi" && styles.selectedLanguageText,
            ]}
          >
            हिन्दी
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.scanButton,
          pressed && styles.scanButtonPressed,
        ]}
        onPress={handleScanPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          language === "hi" ? "दवा स्कैन करें" : "Scan Medicine"
        }
        accessibilityHint={
          language === "hi"
            ? "दवा की फोटो लेने के लिए डबल टैप करें"
            : "Double tap to start scanning a medicine strip"
        }
      >
        <Text style={styles.scanButtonText}>
          {language === "hi" ? "📷 दवा स्कैन करें" : "📷 Scan Medicine"}
        </Text>
      </Pressable>

      <Text
        style={styles.helpText}
        accessible={true}
        accessibilityRole="text"
      >
        {language === "hi"
          ? "कैमरे को दवा की strip पर रखें और फोटो लें।"
          : "Point your camera at the medicine strip to check its expiry date."}
      </Text>

      <Text style={styles.voiceText}>
        🔊{" "}
        {language === "hi"
          ? "Voice guidance enabled"
          : "Voice guidance enabled"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 18,
    color: "#333333",
    marginBottom: 28,
    textAlign: "center",
  },

  languageTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },

  languageRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 28,
  },

  languageButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  selectedLanguage: {
    backgroundColor: "#0B5FFF",
    borderColor: "#0B5FFF",
  },

  languageButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
  },

  selectedLanguageText: {
    color: "#FFFFFF",
  },

  scanButton: {
    backgroundColor: "#0B5FFF",
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: "100%",
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },

  scanButtonPressed: {
    backgroundColor: "#0847CC",
  },

  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },

  helpText: {
    fontSize: 15,
    color: "#555555",
    marginTop: 28,
    textAlign: "center",
    lineHeight: 22,
  },

  voiceText: {
    fontSize: 14,
    color: "#333333",
    marginTop: 20,
    textAlign: "center",
  },
});