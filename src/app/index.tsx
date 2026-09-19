import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  const handleScanPress = () => {
    router.push("/camera");
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

      <Text style={styles.subtitle}>
        Medicine expiry assistant
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.scanButton,
          pressed && styles.scanButtonPressed,
        ]}
        onPress={handleScanPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Scan Medicine"
        accessibilityHint="Double tap to start scanning a medicine strip"
      >
        <Text style={styles.scanButtonText}>Scan Medicine</Text>
      </Pressable>

      <Text style={styles.helpText}>
        Point your camera at the medicine strip to check its expiry date.
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
    marginBottom: 48,
    textAlign: "center",
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
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  helpText: {
    fontSize: 14,
    color: "#555555",
    marginTop: 40,
    textAlign: "center",
  },
});