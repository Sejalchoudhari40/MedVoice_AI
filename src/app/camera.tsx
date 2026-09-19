import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { analyzeMedicinePhoto } from "../../services/mockMedicineAI";

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Permission still loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Checking camera permission.</Text>
      </View>
    );
  }

  // Permission not granted yet
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text
          style={styles.message}
          accessible={true}
          accessibilityRole="text"
        >
          Camera permission required. MedVoice AI needs camera access to scan
          medicine strips.
        </Text>

        <Pressable
          style={styles.actionButton}
          onPress={requestPermission}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Grant camera permission"
          accessibilityHint="Double tap to allow camera access"
        >
          <Text style={styles.actionButtonText}>Grant Permission</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Double tap to return to the home screen"
        >
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
      }
    } catch (error) {
      console.log("Capture error:", error);
    }
  };

  const handleRetake = () => {
    setPhotoUri(null);
  };

  const handleUsePhoto = async () => {
    if (!photoUri) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeMedicinePhoto(photoUri);
      // Module 5 will navigate to a real result screen with this data.
      // For now we log it so we can confirm the mock service works.
      console.log("Mock AI result:", result);
    } catch (error) {
      console.log("Mock AI error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Preview screen after capture
  if (photoUri) {
    return (
      <View style={styles.container}>
        <Text
          style={styles.message}
          accessible={true}
          accessibilityRole="text"
        >
          Photo captured.
        </Text>

        <Image source={{ uri: photoUri }} style={styles.preview} />

        {isAnalyzing ? (
          <Text
            style={styles.message}
            accessible={true}
            accessibilityRole="text"
            accessibilityLiveRegion="polite"
          >
            Analyzing medicine.
          </Text>
        ) : (
          <>
            <Pressable
              style={styles.actionButton}
              onPress={handleUsePhoto}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Use Photo"
              accessibilityHint="Double tap to analyze this photo"
            >
              <Text style={styles.actionButtonText}>Use Photo</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={handleRetake}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Retake Photo"
              accessibilityHint="Double tap to take the photo again"
            >
              <Text style={styles.secondaryButtonText}>Retake Photo</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  // Live camera view
  return (
    <View style={styles.container}>
      <Text
        style={styles.statusText}
        accessible={true}
        accessibilityRole="text"
      >
        Camera ready.
      </Text>

      <CameraView ref={cameraRef} style={styles.camera} facing="back" />

      <Pressable
        style={styles.captureButton}
        onPress={handleCapture}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Capture medicine photo"
        accessibilityHint="Double tap to take a photo of the medicine strip"
      >
        <Text style={styles.captureButtonText}>Capture Medicine</Text>
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
    fontSize: 18,
    color: "#000000",
    textAlign: "center",
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 12,
  },
  camera: {
    width: "100%",
    height: "60%",
    borderRadius: 12,
    marginBottom: 20,
  },
  preview: {
    width: "100%",
    height: "50%",
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
  },
});