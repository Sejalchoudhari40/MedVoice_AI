import React, { useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  findNodeHandle,
  AccessibilityInfo,
  Vibration,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { MedicineStatus } from "../../services/mockMedicineAI";

type AppLanguage = "en" | "hi";

function buildSpokenMessage(
  medicineName: string,
  expiryDate: string,
  status: MedicineStatus,
  language: AppLanguage
): string {
  if (language === "hi") {
    if (status === "EXPIRED") {
      return `चेतावनी। ${medicineName} की expiry date ${expiryDate} है। यह दवा expired लग रही है। कृपया pharmacist से verify करें।`;
    }

    if (status === "UNKNOWN") {
      return "दवा की expiry date verify नहीं हो सकी। कृपया दवा की एक साफ फोटो दोबारा लें।";
    }

    return `दवा का नाम ${medicineName} है। इसकी expiry ${expiryDate} है। यह दवा expired नहीं लग रही है।`;
  }

  if (status === "EXPIRED") {
    return `Warning. ${medicineName} has an expiry date of ${expiryDate}. This medicine appears to be expired. Please verify with a pharmacist.`;
  }

  if (status === "UNKNOWN") {
    return "The medicine expiry date could not be verified. Please retake a clear photo.";
  }

  return `Medicine name ${medicineName}. Expiry ${expiryDate}. This medicine appears to be not expired.`;
}

function formatStatusText(
  status: MedicineStatus,
  language: AppLanguage
): string {
  if (language === "hi") {
    if (status === "EXPIRED") return "Expired / समाप्त";
    if (status === "UNKNOWN") return "Verify नहीं हो सका";
    return "Expired नहीं है";
  }

  if (status === "EXPIRED") return "Expired";
  if (status === "UNKNOWN") return "Could not be verified";
  return "Not expired";
}

export default function ResultScreen() {
  const router = useRouter();
  const headingRef = useRef<Text>(null);

  const params = useLocalSearchParams<{
    medicineName: string;
    expiryDate: string;
    status: MedicineStatus;
    confidence: string;
    language?: string;
  }>();

  const medicineName = params.medicineName || "Unknown";
  const expiryDate = params.expiryDate || "Unknown";
  const status = (params.status as MedicineStatus) || "UNKNOWN";
  const confidence = params.confidence
    ? parseFloat(params.confidence)
    : 0;

  const language: AppLanguage =
    params.language === "hi" ? "hi" : "en";

  const speakResult = useCallback(() => {
    const message = buildSpokenMessage(
      medicineName,
      expiryDate,
      status,
      language
    );

    try {
      Speech.stop();

      Speech.speak(message, {
        language: language === "hi" ? "hi-IN" : "en-US",
        rate: 0.9,
        pitch: 1.0,
        onError: () => {
          console.log("Speech error occurred");
        },
      });
    } catch (error) {
      console.log("Speech error:", error);
    }
  }, [medicineName, expiryDate, status, language]);

  useEffect(() => {
    // Basic vibration feedback
    if (status === "EXPIRED") {
      Vibration.vibrate([0, 300, 150, 300]);
    } else {
      Vibration.vibrate(100);
    }

    speakResult();

    const timer = setTimeout(() => {
      if (headingRef.current) {
        const node = findNodeHandle(headingRef.current);

        if (node) {
          AccessibilityInfo.setAccessibilityFocus(node);
        }
      }
    }, 300);

    return () => {
      Speech.stop();
      clearTimeout(timer);
    };
  }, [speakResult, status]);

  const handleScanAnother = () => {
    Speech.stop();
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
        ref={headingRef}
        style={styles.heading}
        accessible={true}
        accessibilityRole="header"
      >
        {language === "hi" ? "स्कैन का परिणाम" : "Scan Result"}
      </Text>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>
          {language === "hi" ? "दवा:" : "Medicine:"}
        </Text>

        <Text
          style={styles.value}
          accessibilityRole="text"
        >
          {medicineName}
        </Text>
      </View>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>
          {language === "hi" ? "Expiry:" : "Expiry:"}
        </Text>

        <Text
          style={styles.value}
          accessibilityRole="text"
        >
          {expiryDate}
        </Text>
      </View>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>
          {language === "hi" ? "स्थिति:" : "Status:"}
        </Text>

        <Text
          style={styles.value}
          accessibilityRole="text"
        >
          {formatStatusText(status, language)}
        </Text>
      </View>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>
          {language === "hi" ? "विश्वसनीयता:" : "Confidence:"}
        </Text>

        <Text
          style={styles.value}
          accessibilityRole="text"
        >
          {Math.round(confidence * 100)}%
        </Text>
      </View>

      <Pressable
        style={styles.actionButton}
        onPress={speakResult}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          language === "hi" ? "परिणाम सुनें" : "Listen Again"
        }
        accessibilityHint={
          language === "hi"
            ? "परिणाम दोबारा सुनने के लिए डबल टैप करें"
            : "Double tap to hear the result again"
        }
      >
        <Text style={styles.actionButtonText}>
          {language === "hi" ? "🔊 दोबारा सुनें" : "🔊 Listen Again"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={handleScanAnother}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          language === "hi"
            ? "दूसरी दवा स्कैन करें"
            : "Scan Another Medicine"
        }
        accessibilityHint={
          language === "hi"
            ? "दूसरी दवा स्कैन करने के लिए डबल टैप करें"
            : "Double tap to scan a different medicine"
        }
      >
        <Text style={styles.actionButtonText}>
          {language === "hi"
            ? "📷 दूसरी दवा स्कैन करें"
            : "📷 Scan Another Medicine"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
    justifyContent: "center",
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 32,
    textAlign: "center",
  },

  resultBlock: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 4,
  },

  value: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },

  actionButton: {
    backgroundColor: "#0B5FFF",
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});