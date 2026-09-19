export type MedicineStatus = "NOT_EXPIRED" | "EXPIRED" | "UNKNOWN";

export interface MedicineAnalysisResult {
  medicineName: string;
  expiryDate: string;
  status: MedicineStatus;
  confidence: number;
}

// Simple fixed mock result for the MVP.
// This isolated function is the ONLY place a real vision API call
// would be plugged in later — the rest of the app never needs to change.
export async function analyzeMedicinePhoto(
  photoUri: string
): Promise<MedicineAnalysisResult> {
  // Simulate network/AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (!photoUri) {
    throw new Error("No photo provided for analysis");
  }

  // Mock result — always returns the same demo data for the MVP
  const mockResult: MedicineAnalysisResult = {
    medicineName: "Crocin",
    expiryDate: "12/2027",
    status: "NOT_EXPIRED",
    confidence: 0.94,
  };

  return mockResult;
}