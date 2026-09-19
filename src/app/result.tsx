import React, { useCallback, useEffect, useRef } from "react";
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
      return `चेतावनी। ${medicineName} की expiry ${expiryDate} है। यह दवा expired दिखाई दे रही है। कृपया pharmacist से verify करें।`;
    }

    if (status === "UNKNOWN") {
      return "Expiry date verify नहीं हो सकी। कृपया दवा की साफ फोटो दोबारा लें।";
    }

    return `Medicine का नाम ${medicineName} है। Expiry ${expiryDate} है। यह medicine expired नहीं दिखाई दे रही है।`;
  }

  if (status === "EXPIRED") {
    return `Warning. ${medicineName} expires on ${expiryDate}. This medicine appears to be expired. Please verify with a pharmacist.`;
  }

  if (status === "UNKNOWN") {
    return "The expiry date could not be verified. Please retake a clear photo.";
  }

  return `Medicine name ${medicineName}. Expiry ${expiryDate}. This medicine appears to be not expired.`;
}

function formatStatusText(
  status: MedicineStatus,
  language: AppLanguage
): string {
  if (language === "hi") {
    if (status === "EXPIRED") return "Expired";
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
    medicineName?: string;
    expiryDate?: string;
    status?: MedicineStatus;
    confidence?: string;
    language?: string;
  }>();

  const medicineName =
    params.medicineName || "Unknown";

  const expiryDate =
    params.expiryDate || "Unknown";

  const status =
    (params.status as MedicineStatus) || "UNKNOWN";

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
        language:
          language === "hi" ? "hi-IN" : "en-US",
        rate: 0.9,
        onError: () => {
          console.log("Speech error occurred");
        },
      });
    } catch (error) {
      console.log("Speech error:", error);
    }
  }, [
    medicineName,
    expiryDate,
    status,
    language,
  ]);

  useEffect(() => {
    Vibration.vibrate(150);
    speakResult();

    const timer = setTimeout(() => {
      if (headingRef.current) {
        const node =
          findNodeHandle(headingRef.current);

        if (node) {
          AccessibilityInfo.setAccessibilityFocus(
            node
          );
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
    Vibration.vibrate(100);

    router.push({
      pathname: "/camera",
      params: { language },
    });
  };

  const isExpired = status === "EXPIRED";
  const isUnknown = status === "UNKNOWN";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.successCircle,
            isExpired && styles.expiredCircle,
            isUnknown && styles.unknownCircle,
          ]}
        >
          <Text style={styles.statusIcon}>
            {isExpired
              ? "!"
              : isUnknown
              ? "?"
              : "✓"}
          </Text>
        </View>

        <Text
          ref={headingRef}
          style={styles.heading}
          accessible={true}
          accessibilityRole="header"
        >
          {language === "hi"
            ? "Scan Result"
            : "Scan Result"}
        </Text>

        <Text style={styles.subtitle}>
          {language === "hi"
            ? "दवा की जानकारी पढ़ ली गई है"
            : "Medicine information detected"}
        </Text>
      </View>

      {/* Medicine Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>
          {language === "hi"
            ? "MEDICINE NAME"
            : "MEDICINE NAME"}
        </Text>

        <Text
          style={styles.medicineName}
          accessible={true}
          accessibilityRole="text"
        >
          {medicineName}
        </Text>
      </View>

      {/* Expiry Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardLabel}>
          {language === "hi"
            ? "EXPIRY DATE"
            : "EXPIRY DATE"}
        </Text>

        <Text
          style={styles.expiryDate}
          accessible={true}
          accessibilityRole="text"
        >
          {expiryDate}
        </Text>
      </View>

      {/* Status */}
      <View
        style={[
          styles.statusCard,
          isExpired && styles.statusExpired,
          isUnknown && styles.statusUnknown,
          !isExpired &&
            !isUnknown &&
            styles.statusSafe,
        ]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.statusCardIcon}>
          {isExpired
            ? "⚠️"
            : isUnknown
            ? "?"
            : "✓"}
        </Text>

        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>
            {language === "hi"
              ? "STATUS"
              : "STATUS"}
          </Text>

          <Text
            style={[
              styles.statusValue,
              isExpired &&
                styles.statusValueExpired,
              isUnknown &&
                styles.statusValueUnknown,
              !isExpired &&
                !isUnknown &&
                styles.statusValueSafe,
            ]}
          >
            {formatStatusText(
              status,
              language
            )}
          </Text>
        </View>
      </View>

      {/* Confidence */}
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>
          {language === "hi"
            ? "Reading confidence"
            : "Reading confidence"}
        </Text>

        <Text style={styles.confidenceValue}>
          {Math.round(confidence * 100)}%
        </Text>
      </View>

      {/* Listen */}
      <Pressable
        style={styles.listenButton}
        onPress={() => {
          Vibration.vibrate(70);
          speakResult();
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          language === "hi"
            ? "Result दोबारा सुनें"
            : "Listen to result again"
        }
        accessibilityHint={
          language === "hi"
            ? "Result सुनने के लिए double tap करें"
            : "Double tap to hear the result again"
        }
      >
        <Text style={styles.listenIcon}>🔊</Text>

        <Text style={styles.listenText}>
          {language === "hi"
            ? "Result सुनें"
            : "Listen Again"}
        </Text>
      </Pressable>

      {/* Scan Again */}
      <Pressable
        style={styles.scanAgainButton}
        onPress={handleScanAnother}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          language === "hi"
            ? "दूसरी दवा स्कैन करें"
            : "Scan another medicine"
        }
        accessibilityHint={
          language === "hi"
            ? "दूसरी दवा scan करने के लिए double tap करें"
            : "Double tap to scan another medicine"
        }
      >
        <Text style={styles.scanAgainIcon}>
          📷
        </Text>

        <Text style={styles.scanAgainText}>
          {language === "hi"
            ? "दूसरी दवा स्कैन करें"
            : "Scan Another Medicine"}
        </Text>
      </Pressable>

      <Text style={styles.footer}>
        MedVoice • Accessibility First
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9FF",
    paddingHorizontal: 20,
    paddingTop: 38,
  },

  header: {
    alignItems: "center",
    marginBottom: 22,
  },

  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DDF7E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  expiredCircle: {
    backgroundColor: "#FFE3E3",
  },

  unknownCircle: {
    backgroundColor: "#FFF1D6",
  },

  statusIcon: {
    fontSize: 32,
    fontWeight: "900",
    color: "#16864A",
  },

  heading: {
    fontSize: 30,
    fontWeight: "800",
    color: "#102A43",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#627D98",
    marginTop: 5,
    textAlign: "center",
  },

  infoCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D9E7F5",
  },

  cardLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#829AB1",
    marginBottom: 6,
  },

  medicineName: {
    fontSize: 25,
    fontWeight: "800",
    color: "#102A43",
  },

  expiryDate: {
    fontSize: 25,
    fontWeight: "800",
    color: "#102A43",
  },

  statusCard: {
    width: "100%",
    minHeight: 78,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
  },

  statusSafe: {
    backgroundColor: "#E8F8EF",
    borderColor: "#B7E5C9",
  },

  statusExpired: {
    backgroundColor: "#FFE8E8",
    borderColor: "#F2B8B8",
  },

  statusUnknown: {
    backgroundColor: "#FFF4DE",
    borderColor: "#F0D08A",
  },

  statusCardIcon: {
    fontSize: 26,
    marginRight: 14,
  },

  statusContent: {
    flex: 1,
  },

  statusLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#627D98",
    marginBottom: 3,
  },

  statusValue: {
    fontSize: 21,
    fontWeight: "800",
  },

  statusValueSafe: {
    color: "#16864A",
  },

  statusValueExpired: {
    color: "#C62828",
  },

  statusValueUnknown: {
    color: "#A56A00",
  },

  confidenceRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  confidenceLabel: {
    fontSize: 13,
    color: "#627D98",
  },

  confidenceValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#243B53",
  },

  listenButton: {
    width: "100%",
    minHeight: 62,
    borderRadius: 17,
    backgroundColor: "#0B5FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  listenIcon: {
    fontSize: 22,
    marginRight: 9,
  },

  listenText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  scanAgainButton: {
    width: "100%",
    minHeight: 62,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#0B5FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },

  scanAgainIcon: {
    fontSize: 21,
    marginRight: 9,
  },

  scanAgainText: {
    color: "#0B5FFF",
    fontSize: 17,
    fontWeight: "800",
  },

  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#829AB1",
    marginTop: 13,
  },
});