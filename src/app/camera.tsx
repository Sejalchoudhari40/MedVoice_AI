import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { analyzeMedicinePhoto } from "../../services/mockMedicineAI";

type AppLanguage = "en" | "hi";

export default function CameraScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    language?: string;
  }>();

  const language: AppLanguage =
    params.language === "hi" ? "hi" : "en";

  const [permission, requestPermission] =
    useCameraPermissions();

  const [photoUri, setPhotoUri] =
    useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  /* ---------------- VOICE GUIDANCE ---------------- */

  useEffect(() => {
    Speech.stop();

    const message =
      language === "hi"
        ? "कैमरा तैयार है। दवा की strip को कैमरे के सामने रखें और नीचे दिए गए फोटो बटन पर डबल टैप करें।"
        : "Camera is ready. Place the medicine strip in front of the camera and double tap the capture button.";

    Speech.speak(message, {
      language: language === "hi" ? "hi-IN" : "en-US",
      rate: 0.9,
    });

    return () => {
      Speech.stop();
    };
  }, [language]);

  /* ---------------- PERMISSION CHECK ---------------- */

  if (!permission) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.loadingTitle}>
          {language === "hi"
            ? "कैमरा तैयार हो रहा है..."
            : "Preparing camera..."}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerScreen}>
        <View style={styles.permissionIcon}>
          <Text style={styles.permissionEmoji}>📷</Text>
        </View>

        <Text style={styles.permissionTitle}>
          {language === "hi"
            ? "Camera Permission चाहिए"
            : "Camera Permission Required"}
        </Text>

        <Text style={styles.permissionText}>
          {language === "hi"
            ? "MedVoice को दवा scan करने के लिए camera access चाहिए।"
            : "MedVoice needs camera access to scan your medicine."}
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={requestPermission}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            language === "hi"
              ? "कैमरा permission दें"
              : "Grant camera permission"
          }
          accessibilityHint={
            language === "hi"
              ? "Camera access allow करने के लिए double tap करें"
              : "Double tap to allow camera access"
          }
        >
          <Text style={styles.primaryButtonText}>
            {language === "hi"
              ? "Permission दें"
              : "Grant Permission"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            Speech.stop();
            router.back();
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            language === "hi"
              ? "वापस जाएं"
              : "Go Back"
          }
          accessibilityHint={
            language === "hi"
              ? "Home screen पर वापस जाने के लिए double tap करें"
              : "Double tap to return to the home screen"
          }
        >
          <Text style={styles.secondaryButtonText}>
            {language === "hi"
              ? "← वापस जाएं"
              : "← Go Back"}
          </Text>
        </Pressable>
      </View>
    );
  }

  /* ---------------- CAPTURE ---------------- */

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    setErrorMessage(null);

    try {
      Vibration.vibrate(100);
      Speech.stop();

      Speech.speak(
        language === "hi"
          ? "फोटो लिया जा रहा है।"
          : "Taking medicine photo.",
        {
          language:
            language === "hi" ? "hi-IN" : "en-US",
          rate: 0.9,
        }
      );

      const photo =
        await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });

      if (photo?.uri) {
        setPhotoUri(photo.uri);

        Speech.speak(
          language === "hi"
            ? "फोटो लिया गया है। अब फोटो इस्तेमाल करने या दोबारा लेने का विकल्प चुनें।"
            : "Photo captured. You can use the photo or retake it.",
          {
            language:
              language === "hi" ? "hi-IN" : "en-US",
            rate: 0.9,
          }
        );
      } else {
        setErrorMessage(
          language === "hi"
            ? "फोटो नहीं लिया जा सका। कृपया दोबारा कोशिश करें।"
            : "Could not capture the photo. Please try again."
        );
      }
    } catch (error) {
      console.log("Capture error:", error);

      setErrorMessage(
        language === "hi"
          ? "फोटो नहीं लिया जा सका। कृपया दोबारा कोशिश करें।"
          : "Could not capture the photo. Please try again."
      );
    }
  };

  /* ---------------- RETAKE ---------------- */

  const handleRetake = () => {
    Speech.stop();
    Vibration.vibrate(70);

    setPhotoUri(null);
    setErrorMessage(null);

    Speech.speak(
      language === "hi"
        ? "ठीक है। दवा की साफ फोटो दोबारा लें।"
        : "Okay. Please take a clear photo again.",
      {
        language:
          language === "hi" ? "hi-IN" : "en-US",
        rate: 0.9,
      }
    );
  };

  /* ---------------- OCR / ANALYSIS ---------------- */

  const handleUsePhoto = async () => {
    if (!photoUri) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    Vibration.vibrate(100);
    Speech.stop();

    Speech.speak(
      language === "hi"
        ? "दवा की जानकारी पढ़ी जा रही है। कृपया प्रतीक्षा करें।"
        : "Reading the medicine information. Please wait.",
      {
        language:
          language === "hi" ? "hi-IN" : "en-US",
        rate: 0.9,
      }
    );

    try {
      const result =
        await analyzeMedicinePhoto(photoUri);

      Vibration.vibrate(150);

      router.push({
        pathname: "/result",
        params: {
          medicineName: result.medicineName,
          expiryDate: result.expiryDate,
          status: result.status,
          confidence:
            result.confidence.toString(),
          language,
        },
      });
    } catch (error) {
      console.log("OCR error:", error);

      setErrorMessage(
        language === "hi"
          ? "दवा की जानकारी पढ़ी नहीं जा सकी। कृपया दवा की साफ और नज़दीक से फोटो लें।"
          : "The medicine information could not be read. Please take a clear, close-up photo."
      );

      Speech.speak(
        language === "hi"
          ? "दवा की जानकारी पढ़ी नहीं जा सकी। कृपया साफ फोटो दोबारा लें।"
          : "The medicine information could not be read. Please take a clear photo again.",
        {
          language:
            language === "hi" ? "hi-IN" : "en-US",
          rate: 0.9,
        }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ---------------- PHOTO PREVIEW ---------------- */

  if (photoUri) {
    return (
      <View style={styles.previewScreen}>
        <View style={styles.topBar}>
          <Text
            style={styles.topTitle}
            accessibilityRole="header"
          >
            {language === "hi"
              ? "फोटो की जांच करें"
              : "Review Photo"}
          </Text>
        </View>

        <Image
          source={{ uri: photoUri }}
          style={styles.preview}
          accessible={true}
          accessibilityLabel={
            language === "hi"
              ? "दवा की ली गई फोटो"
              : "Captured medicine photo"
          }
        />

        {errorMessage && (
          <Text
            style={styles.errorText}
            accessible={true}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
          >
            {errorMessage}
          </Text>
        )}

        {isAnalyzing ? (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisIcon}>
              🤖
            </Text>

            <Text style={styles.analysisTitle}>
              {language === "hi"
                ? "दवा पढ़ी जा रही है..."
                : "Reading medicine..."}
            </Text>

            <Text style={styles.analysisText}>
              {language === "hi"
                ? "कृपया कुछ क्षण प्रतीक्षा करें"
                : "Please wait a moment"}
            </Text>
          </View>
        ) : (
          <View style={styles.bottomActions}>
            <Pressable
              style={styles.primaryButton}
              onPress={handleUsePhoto}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                language === "hi"
                  ? "फोटो इस्तेमाल करें"
                  : "Use Photo"
              }
              accessibilityHint={
                language === "hi"
                  ? "दवा की जानकारी पढ़ने के लिए double tap करें"
                  : "Double tap to read the medicine information"
              }
            >
              <Text style={styles.primaryButtonText}>
                ✓{" "}
                {language === "hi"
                  ? "फोटो इस्तेमाल करें"
                  : "Use Photo"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={handleRetake}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={
                language === "hi"
                  ? "फोटो दोबारा लें"
                  : "Retake Photo"
              }
              accessibilityHint={
                language === "hi"
                  ? "दूसरी फोटो लेने के लिए double tap करें"
                  : "Double tap to take the photo again"
              }
            >
              <Text style={styles.secondaryButtonText}>
                ↻{" "}
                {language === "hi"
                  ? "फोटो दोबारा लें"
                  : "Retake Photo"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  /* ---------------- CAMERA SCREEN ---------------- */

  return (
    <View style={styles.cameraScreen}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
      />

      <View
        pointerEvents="none"
        style={styles.overlay}
      />

      {/* Header */}
      <View style={styles.cameraHeader}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerIcon}>
            💊
          </Text>

          <Text style={styles.headerTitle}>
            {language === "hi"
              ? "दवा स्कैन करें"
              : "Scan Medicine"}
          </Text>
        </View>
      </View>

      {/* Scan Frame */}
      <View
        style={styles.scanFrame}
        accessible={true}
        accessibilityLabel={
          language === "hi"
            ? "दवा को scan frame के अंदर रखें"
            : "Place medicine inside the scanning frame"
        }
      >
        <View
          style={[styles.corner, styles.topLeft]}
        />

        <View
          style={[styles.corner, styles.topRight]}
        />

        <View
          style={[
            styles.corner,
            styles.bottomLeft,
          ]}
        />

        <View
          style={[
            styles.corner,
            styles.bottomRight,
          ]}
        />

        <Text style={styles.frameText}>
          {language === "hi"
            ? "दवा की strip यहाँ रखें"
            : "Place medicine here"}
        </Text>
      </View>

      {/* Bottom Controls */}
      <View style={styles.cameraBottom}>
        <Text style={styles.cameraInstruction}>
          {language === "hi"
            ? "दवा का नाम और expiry साफ दिखाई देनी चाहिए"
            : "Make sure the medicine name and expiry are clear"}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.captureButton,
            pressed && styles.capturePressed,
          ]}
          onPress={handleCapture}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            language === "hi"
              ? "दवा की फोटो लें"
              : "Capture medicine photo"
          }
          accessibilityHint={
            language === "hi"
              ? "दवा की फोटो लेने के लिए double tap करें"
              : "Double tap to take a photo"
          }
        >
          <View style={styles.captureInner}>
            <Text style={styles.captureIcon}>
              📷
            </Text>
          </View>
        </Pressable>

        <Text style={styles.captureLabel}>
          {language === "hi"
            ? "फोटो लेने के लिए Double Tap"
            : "Double tap to capture"}
        </Text>
      </View>
    </View>
  );
}

/* ==================== STYLES ==================== */

const styles = StyleSheet.create({
  cameraScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  cameraHeader: {
    position: "absolute",
    top: 55,
    left: 20,
    right: 20,
    alignItems: "center",
  },

  headerBadge: {
    backgroundColor: "rgba(0,0,0,0.68)",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  scanFrame: {
    position: "absolute",
    top: "25%",
    left: "10%",
    width: "80%",
    height: "35%",
    alignItems: "center",
    justifyContent: "center",
  },

  corner: {
    position: "absolute",
    width: 38,
    height: 38,
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },

  frameText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.58)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
  },

  cameraBottom: {
    position: "absolute",
    bottom: 35,
    left: 20,
    right: 20,
    alignItems: "center",
  },

  cameraInstruction: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.62)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 18,
  },

  captureButton: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#0B5FFF",
  },

  capturePressed: {
    transform: [{ scale: 0.92 }],
  },

  captureInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#0B5FFF",
    alignItems: "center",
    justifyContent: "center",
  },

  captureIcon: {
    fontSize: 30,
  },

  captureLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 9,
  },

  previewScreen: {
    flex: 1,
    backgroundColor: "#F5F9FF",
    padding: 20,
    justifyContent: "center",
  },

  topBar: {
    alignItems: "center",
    marginBottom: 18,
  },

  topTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#102A43",
  },

  preview: {
    width: "100%",
    height: "50%",
    borderRadius: 20,
    backgroundColor: "#D9E7F5",
    marginBottom: 18,
  },

  bottomActions: {
    width: "100%",
  },

  primaryButton: {
    width: "100%",
    minHeight: 70,
    borderRadius: 18,
    backgroundColor: "#0B5FFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  secondaryButton: {
    width: "100%",
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D9E7F5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 20,
  },

  secondaryButtonText: {
    color: "#243B53",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  analysisCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D9E7F5",
  },

  analysisIcon: {
    fontSize: 38,
    marginBottom: 10,
  },

  analysisTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#102A43",
  },

  analysisText: {
    fontSize: 15,
    color: "#627D98",
    marginTop: 6,
  },

  errorText: {
    color: "#B00020",
    backgroundColor: "#FFE8EC",
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 15,
  },

  centerScreen: {
    flex: 1,
    backgroundColor: "#F5F9FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#102A43",
    textAlign: "center",
  },

  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  permissionEmoji: {
    fontSize: 40,
  },

  permissionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#102A43",
    textAlign: "center",
    marginBottom: 10,
  },

  permissionText: {
    fontSize: 16,
    lineHeight: 23,
    color: "#627D98",
    textAlign: "center",
    marginBottom: 25,
  },
});