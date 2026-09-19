# 💊 MedVoice AI

### Accessibility-First Medicine Scanning & Expiry Assistant

MedVoice AI is an accessibility-focused mobile application designed to help
blind, low-vision, and elderly users read medicine packaging information more
easily.

The app uses the device camera and on-device ML Kit OCR to extract visible
medicine text, identify the medicine name and expiry information, and present
the result through both visual and voice feedback.

---

## 🎯 Problem

Medicine packaging often contains small and difficult-to-read text.

For blind and low-vision users, independently checking:

- Medicine name
- Expiry date
- Whether the medicine appears expired

can be difficult.

MedVoice aims to make this basic information easier to access through a
voice-first and accessibility-friendly experience.

---

## ✨ Key Features

### 🔊 Voice-First Experience
- Voice welcome when the application opens
- Spoken instructions during scanning
- Automatic spoken scan results
- Hindi and English voice support

### 🌐 Hindi & English
Users can select:

- 🇬🇧 English
- 🇮🇳 हिन्दी

The selected language is used for voice guidance and results.

### 📷 Medicine Camera Scanner
- Opens the device camera
- Large accessibility-friendly capture control
- Scan-frame guidance
- Clear photo capture
- Retake option

### 🤖 ML Kit OCR
MedVoice uses ML Kit text recognition to read visible text from the captured
medicine package.

The application processes the detected text to identify relevant medicine
information.

### 📅 Expiry Detection
The application attempts to identify an expiry date from the visible package
text and determines whether the medicine appears:

- ✅ Not Expired
- ⚠️ Expired
- ❓ Could Not Be Verified

### ♿ Accessibility
Designed with accessibility as a core requirement:

- TalkBack-friendly controls
- Accessibility labels
- Accessibility hints
- Large touch targets
- High-contrast interface
- Voice instructions
- Spoken results
- Simple navigation

### 📳 Feedback
Vibration feedback is provided during important interactions such as:

- Capture
- Analysis
- Result presentation

---

## 🧠 How It Works

```text
┌─────────────────────┐
│    Open MedVoice    │
└──────────┬──────────┘
           ↓
     🔊 Voice Welcome
           ↓
   🇬🇧 English / 🇮🇳 Hindi
           ↓
     📷 Scan Medicine
           ↓
     Camera Guidance
           ↓
      📸 Capture Photo
           ↓
       🤖 ML Kit OCR
           ↓
   ┌─────────────────┐
   │ Medicine Name   │
   │ Expiry Date     │
   │ Status          │
   └─────────────────┘
           ↓
     🔊 Voice Result
           ↓
       📳 Feedback
## Team / Hackathon

Built in 24 hours for [Hack Devengers 2.0].