import React, { useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  findNodeHandle,
  AccessibilityInfo,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { MedicineStatus } from "../../services/mockMedicineAI";

function buildSpokenMessage(
  medicineName: string,
  expiryDate: string,
  status: MedicineStatus
): string {
  if (status === "EXPIRED") {
    return "Warning. This medicine appears to be expired. Please verify with a pharmacist.";
  }
  if (status === "UNKNOWN") {
    return "Expiry date could not be verified. Please retake the photo.";
  }
  return `Medicine name ${medicineName}. Expiry ${expiryDate}. This medicine appears to be not expired.`;
}

function formatStatusText(status: MedicineStatus): string {
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
  }>();

  const medicineName = params.medicineName || "Unknown";
  const expiryDate = params.expiryDate || "Unknown";
  const status = (params.status as MedicineStatus) || "UNKNOWN";
  const confidence = params.confidence ? parseFloat(params.confidence) : 0;

  const speakResult = useCallback(() => {
    const message = buildSpokenMessage(medicineName, expiryDate, status);
    try {
      Speech.stop();
      Speech.speak(message, {
        language: "en",
        onError: () => {
          console.log("Speech error occurred");
        },
      });
    } catch (error) {
      console.log("Speech error:", error);
    }
  }, [medicineName, expiryDate, status]);

  useEffect(() => {
    speakResult();

    // Move TalkBack focus to the heading when this screen appears,
    // so the user starts navigating from the top instead of wherever
    // focus was left on the previous screen.
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
  }, [speakResult]);

  const handleScanAnother = () => {
    Speech.stop();
    router.push("/camera");
  };

  return (
    <View style={styles.container}>
      <Text
        ref={headingRef}
        style={styles.heading}
        accessible={true}
        accessibilityRole="header"
      >
        Scan Result
      </Text>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>Medicine:</Text>
        <Text style={styles.value}>{medicineName}</Text>
      </View>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>Expiry:</Text>
        <Text style={styles.value}>{expiryDate}</Text>
      </View>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{formatStatusText(status)}</Text>
      </View>

      <View style={styles.resultBlock}>
        <Text style={styles.label}>Confidence:</Text>
        <Text style={styles.value}>{Math.round(confidence * 100)}%</Text>
      </View>

      <Pressable
        style={styles.actionButton}
        onPress={speakResult}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Listen Again"
        accessibilityHint="Double tap to hear the result again"
      >
        <Text style={styles.actionButtonText}>Listen Again</Text>
      </Pressable>

      <Pressable
        style={styles.actionButton}
        onPress={handleScanAnother}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Scan Another Medicine"
        accessibilityHint="Double tap to scan a different medicine"
      >
        <Text style={styles.actionButtonText}>Scan Another Medicine</Text>
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
  },
});