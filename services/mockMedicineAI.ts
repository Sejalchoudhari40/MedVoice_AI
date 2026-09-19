import TextRecognition from "@react-native-ml-kit/text-recognition";

export type MedicineStatus = "NOT_EXPIRED" | "EXPIRED" | "UNKNOWN";

export interface MedicineAnalysisResult {
  medicineName: string;
  expiryDate: string;
  status: MedicineStatus;
  confidence: number;
}

function extractExpiryDate(text: string): string | null {
  const normalizedText = text
    .replace(/\s+/g, " ")
    .toUpperCase();

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const fullDate = normalizedText.match(
    /\b(0?[1-9]|[12]\d|3[01])[/.-](0?[1-9]|1[0-2])[/.-](20\d{2})\b/
  );

  if (fullDate) {
    return `${fullDate[1].padStart(2, "0")}/${fullDate[2].padStart(
      2,
      "0"
    )}/${fullDate[3]}`;
  }

  // MM/YYYY or MM-YYYY or MM.YYYY
  const monthYear = normalizedText.match(
    /\b(0?[1-9]|1[0-2])[/.-](20\d{2})\b/
  );

  if (monthYear) {
    return `${monthYear[1].padStart(2, "0")}/${monthYear[2]}`;
  }

  // MM/YY
  const shortMonthYear = normalizedText.match(
    /\b(0?[1-9]|1[0-2])[/.-](\d{2})\b/
  );

  if (shortMonthYear) {
    return `${shortMonthYear[1].padStart(2, "0")}/${shortMonthYear[2]}`;
  }

  return null;
}

function extractMedicineName(text: string): string {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const ignoredWords = [
    "EXP",
    "EXPIRY",
    "EXPIRY DATE",
    "MFG",
    "MFD",
    "MANUFACTURED",
    "BATCH",
    "LOT",
    "MRP",
    "COMPOSITION",
    "TABLETS",
    "TABLET",
    "CAPSULE",
    "CAPSULES",
    "MG",
    "ML",
    "USE BEFORE",
    "BEST BEFORE",
  ];

  for (const line of lines) {
    const upperLine = line.toUpperCase();

    if (upperLine.length < 3) continue;

    const looksLikeDate =
      /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/.test(upperLine) ||
      /\b\d{1,2}[/.-]\d{2,4}\b/.test(upperLine);

    if (looksLikeDate) continue;

    if (ignoredWords.some((word) => upperLine.includes(word))) {
      continue;
    }

    const cleaned = line.replace(/[^a-zA-Z0-9\s-]/g, "").trim();

    if (cleaned.length >= 3 && cleaned.length <= 60) {
      return cleaned;
    }
  }

  return "Medicine name not detected";
}

function calculateStatus(expiryDate: string): MedicineStatus {
  if (!expiryDate) {
    return "UNKNOWN";
  }

  const parts = expiryDate.split("/");

  let month: number;
  let year: number;

  if (parts.length === 2) {
    month = Number(parts[0]);
    year = Number(parts[1]);

    if (year < 100) {
      year += 2000;
    }
  } else if (parts.length === 3) {
    const day = Number(parts[0]);
    month = Number(parts[1]);
    year = Number(parts[2]);

    if (!day || !month || !year) {
      return "UNKNOWN";
    }
  } else {
    return "UNKNOWN";
  }

  if (!month || !year) {
    return "UNKNOWN";
  }

  // If expiry is MM/YYYY, treat expiry as the last day of that month.
  const expiry = new Date(year, month, 0, 23, 59, 59);
  const today = new Date();

  return expiry < today ? "EXPIRED" : "NOT_EXPIRED";
}

export async function analyzeMedicinePhoto(
  photoUri: string
): Promise<MedicineAnalysisResult> {
  if (!photoUri) {
    throw new Error("No photo provided for analysis");
  }

  try {
    // Real on-device ML Kit OCR
    const result = await TextRecognition.recognize(photoUri);

    const recognizedText = result.text || "";

    console.log("========== MEDVOICE OCR ==========");
    console.log(recognizedText);
    console.log("==================================");

    if (!recognizedText.trim()) {
      return {
        medicineName: "Medicine name not detected",
        expiryDate: "Not detected",
        status: "UNKNOWN",
        confidence: 0,
      };
    }

    const medicineName = extractMedicineName(recognizedText);
    const detectedExpiry = extractExpiryDate(recognizedText);

    const expiryDate = detectedExpiry || "Not detected";
    const status = detectedExpiry
      ? calculateStatus(detectedExpiry)
      : "UNKNOWN";

    return {
      medicineName,
      expiryDate,
      status,
      confidence: detectedExpiry ? 0.90 : 0.65,
    };
  } catch (error) {
    console.log("OCR analysis error:", error);

    throw new Error(
      "Could not read the medicine package. Please take a clearer photo."
    );
  }
}