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

  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    const message =
      language === "hi"
        ? "कैमरा तैयार है। दवा की strip को कैमरे के सामने रखें और Capture Medicine बटन दबाएं।"
        : "Camera is ready. Place the medicine strip in front of the camera and press Capture Medicine.";

    Speech.stop();

    Speech.speak(message, {
      language: language === "hi" ? "hi-IN" : "en-US",
      rate: 0.9,
    });

    return () => {
      Speech.stop();
    };
  }, [language]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text
          style={styles.message}
          accessible={true}
          accessibilityRole="text"
        >
          {language === "hi"
            ? "कैमरा permission check हो रही है।"
            : "Checking camera permission."}
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text
          style={styles.message}
          accessible={true}
          accessibilityRole="text"
        >
          {language === "hi"
            ? "MedVoice को दवा scan करने के लिए camera access चाहिए।"
            : "MedVoice AI needs camera access to scan medicine strips."}
        </Text>

        <Pressable
          style={styles.actionButton}
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
              ? "कैमरा access allow करने के लिए double tap करें"
              : "Double tap to allow camera access"
          }
        >
          <Text style={styles.actionButtonText}>
            {language === "hi"
              ? "Camera Permission दें"
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
            language === "hi" ? "वापस जाएं" : "Go back"
          }
          accessibilityHint={
            language === "hi"
              ? "Home screen पर वापस जाने के लिए double tap करें"
              : "Double tap to return to the home screen"
          }
        >
          <Text style={styles.secondaryButtonText}>
            {language === "hi" ? "वापस जाएं" : "Go Back"}
          </Text>
        </Pressable>
      </View>
    );
  }

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
          language: language === "hi" ? "hi-IN" : "en-US",
          rate: 0.9,
        }
      );

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (photo?.uri) {
        setPhotoUri(photo.uri);

        Speech.speak(
          language === "hi"
            ? "फोटो लिया गया है। अब फोटो इस्तेमाल करने या दोबारा लेने का विकल्प चुनें।"
            : "Photo captured. You can use the photo or retake it.",
          {
            language: language === "hi" ? "hi-IN" : "en-US",
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

  const handleRetake = () => {
    Speech.stop();
    Vibration.vibrate(70);

    setPhotoUri(null);
    setErrorMessage(null);

    Speech.speak(
      language === "hi"
        ? "ठीक है। दोबारा फोटो लें।"
        : "Okay. Please take the photo again.",
      {
        language: language === "hi" ? "hi-IN" : "en-US",
        rate: 0.9,
      }
    );
  };

  const handleUsePhoto = async () => {
    if (!photoUri) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    Vibration.vibrate(100);

    Speech.stop();

    Speech.speak(
      language === "hi"
        ? "दवा की फोटो पढ़ी जा रही है। कृपया प्रतीक्षा करें।"
        : "Reading the medicine photo. Please wait.",
      {
        language: language === "hi" ? "hi-IN" : "en-US",
        rate: 0.9,
      }
    );

    try {
      const result = await analyzeMedicinePhoto(photoUri);

      Vibration.vibrate(150);

      router.push({
        pathname: "/result",
        params: {
          medicineName: result.medicineName,
          expiryDate: result.expiryDate,
          status: result.status,
          confidence: result.confidence.toString(),
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
          language: language === "hi" ? "hi-IN" : "en-US",
          rate: 0.9,
        }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Text
          style={styles.message}
          accessible={true}
          accessibilityRole="header"
        >
          {language === "hi" ? "फोटो तैयार है" : "Photo Captured"}
        </Text>

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

        {isAnalyzing ? (
          <View style={styles.analyzingContainer}>
            <Text
              style={styles.message}
              accessible={true}
              accessibilityRole="text"
              accessibilityLiveRegion="polite"
            >
              {language === "hi"
                ? "दवा की जानकारी पढ़ी जा रही है..."
                : "Reading medicine information..."}
            </Text>

            <Text style={styles.smallText}>
              {language === "hi"
                ? "कृपया प्रतीक्षा करें"
                : "Please wait"}
            </Text>
          </View>
        ) : (
          <>
            <Pressable
              style={styles.actionButton}
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
                  ? "फोटो को पढ़ने के लिए double tap करें"
                  : "Double tap to analyze this photo"
              }
            >
              <Text style={styles.actionButtonText}>
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
                {language === "hi"
                  ? "फोटो दोबारा लें"
                  : "Retake Photo"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={styles.statusText}
        accessible={true}
        accessibilityRole="header"
      >
        {language === "hi"
          ? "कैमरा तैयार है"
          : "Camera Ready"}
      </Text>

      <Text
        style={styles.instructionText}
        accessible={true}
        accessibilityRole="text"
      >
        {language === "hi"
          ? "दवा की strip को कैमरे के सामने रखें।"
          : "Place the medicine strip in front of the camera."}
      </Text>

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

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        accessible={true}
        accessibilityLabel={
          language === "hi"
            ? "दवा scan करने के लिए camera"
            : "Camera for scanning medicine"
        }
      />

      <Pressable
        style={styles.captureButton}
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
            : "Double tap to take a photo of the medicine strip"
        }
      >
        <Text style={styles.captureButtonText}>
          {language === "hi"
            ? "📷 दवा की फोटो लें"
            : "📷 Capture Medicine"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  message: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 24,
  },

  statusText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
  },

  instructionText: {
    fontSize: 18,
    color: "#333333",
    textAlign: "center",
    marginBottom: 16,
  },

  smallText: {
    fontSize: 16,
    color: "#555555",
    textAlign: "center",
    marginTop: 8,
  },

  analyzingContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  errorText: {
    fontSize: 16,
    color: "#B00020",
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },

  camera: {
    width: "100%",
    height: "55%",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },

  preview: {
    width: "100%",
    height: "48%",
    borderRadius: 12,
    marginBottom: 20,
  },

  captureButton: {
    backgroundColor: "#0B5FFF",
    paddingVertical: 28,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  captureButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  actionButton: {
    backgroundColor: "#0B5FFF",
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  secondaryButton: {
    backgroundColor: "#EEEEEE",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#000000",
  },

  secondaryButtonText: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
});