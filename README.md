# MedVoice AI

An accessible, voice-first Android app that helps blind and low-vision users check medicine expiry dates by scanning the medicine strip with their phone camera.

## Problem

Blind and low-vision individuals cannot visually read expiry dates printed on medicine strips, creating a real safety gap in medication management.

## Solution

MedVoice AI lets a user scan a medicine strip and hear the medicine name and expiry status spoken aloud — no reading required, fully TalkBack accessible.

## Core Flow

1. Open app → large "Scan Medicine" button (TalkBack accessible)
2. Camera opens → capture photo of medicine strip
3. Photo is analyzed (currently via a mock AI service for this MVP)
4. Result is spoken aloud automatically: medicine name, expiry, and status
5. User can listen again or scan another medicine

## Tech Stack

- React Native + Expo
- TypeScript
- Expo Router
- expo-camera
- expo-speech
- No backend, no database, no authentication (MVP scope)

## Accessibility

- Full Android TalkBack support on every screen
- Large touch targets (64–120dp)
- High-contrast text
- No information conveyed by color alone
- Automatic voice announcements — no reading required
- See `TESTING.md` (or the accessibility checklist in project notes) for the full manual TalkBack test plan

## Running the App

\`\`\`bash
npm install
npx expo start
\`\`\`

Scan the QR code with the Expo Go app on an Android device.

## Known Limitations

- Uses a **mock AI service** (`services/mockMedicineAI.ts`) — always returns a fixed demo result ("Crocin", not expired). No real computer vision or OCR is performed yet.
- No persistence — nothing is saved between sessions.
- English-only voice output.
- Tested primarily on Android; iOS behavior with VoiceOver is untested.

## Future Real-AI Integration Point

The mock service lives in `services/mockMedicineAI.ts` and exposes a single function:

\`\`\`ts
analyzeMedicinePhoto(photoUri: string): Promise<MedicineAnalysisResult>
\`\`\`

To integrate a real vision/OCR API, replace the internals of this function with an actual API call (e.g. a cloud OCR service or a custom-trained model), while keeping the same input/output shape. No other file needs to change.

## Team / Hackathon

Built in 24 hours for [hackathon name].