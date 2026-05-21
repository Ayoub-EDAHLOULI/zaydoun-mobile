# 📱 Zaydoun.AI - Mobile App

Welcome to the mobile client for **Zaydoun.AI**. This is an Expo React Native application designed to be a voice-first pocket companion. It connects directly to the Zaydoun Express/pgvector backend, allowing users to have context-aware, page-by-page intellectual debates about their uploaded books using natural voice interaction.

## 🚀 Tech Stack

* **Framework:** [Expo](https://expo.dev/) & React Native
* **Routing:** Expo Router
* **Networking:** Axios (with custom interceptors for JWT Auth)
* **Audio Processing:** `expo-av` (Microphone recording & TTS playback)
* **File Management:** `expo-file-system` (Handling .m4a and .mp3 buffers)
* **Local Storage:** `expo-secure-store` (Safely storing JWT refresh tokens)
* **Icons:** Lucide React Native

## 🧠 Core Architecture (The Walkie-Talkie Flow)

This app acts as the "Mouth and Ears" of the Zaydoun RAG system:
1. **Record:** Uses `expo-av` to record the user's voice as an `.m4a` file.
2. **Transmit:** Sends the audio file via `FormData` to the Express backend.
3. **Receive:** The backend processes Whisper STT -> pgvector Search -> GPT-4o-mini -> TTS, and returns an audio URL.
4. **Playback:** The app instantly streams the AI's response aloud.

## 🛠️ Getting Started

First, install the dependencies:

```bash
npm install
```

Set up your local environment variables:
Create a .env file in the root directory and point it to your local backend. (Note: When testing on a physical device, use your computer's local IP address, not localhost).

```Code snippet
EXPO_PUBLIC_API_URL=[http://192.168.](http://192.168.)x.x:5000/api
```

Run the development server:

```Bash
npx expo start
```

Press a to open on an Android Emulator.

Press i to open on an iOS Simulator.

Scan the QR code with the Expo Go app on your physical device to test the microphone.
