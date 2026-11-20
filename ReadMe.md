# SaveBite — Zero-Waste Food Redistribution Network

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2058-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-61dafb.svg)](https://reactnative.dev/)
[![Jest Tests](https://img.shields.io/badge/Tests-5%20Passed-brightgreen.svg)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**SaveBite** adalah aplikasi seluler *production-grade* berbasis React Native dan Expo yang dirancang untuk mendukung target **SDG 12: Responsible Consumption and Production**. Aplikasi ini menghubungkan penyedia surplus makanan (restoran, hotel, toko kelontong) dengan organisasi sosial dan penerima manfaat secara *real-time* berbasis lokasi (*Location-Based Services*).

---

## Tech Stack & Architecture

* **Framework**: React Native (Expo SDK 58)
* **State Management**: Zustand (Unidirectional Data Flow / UDF Pattern)
* **Reactive Stream / Search**: RxJS (`Subject`, `debounceTime`, `switchMap`)
* **Location & Maps**: `react-native-maps`, `expo-location` (Haversine Formula Math)
* **Secure Storage**: `expo-secure-store` (AES Encryption) & `expo-file-system/legacy` (Scoped Document Directory Vault)
* **Animation & UI Thread**: `react-native-reanimated` (Native Thread 60 FPS)
* **Automated Testing**: Jest & `@testing-library/react-native`
* **Build Engine**: Expo EAS Build (Android APK)
* **AI Vibe Coding Engine**: Antigravity IDE (Architect's Audit Protocol)

---

## Fitur Utama

1. **Precision LBS & Filter Spasial (0–5 KM)**
   * Menghitung jarak lurus titik donor ke penerima secara akurat menggunakan algoritma Haversine.
2. **Vault Verifikasi Penerima Aman (Encrypted Storage)**
   * Penyimpanan foto identitas (KTP) terenkripsi di *Scoped Storage* aplikasi dengan *session token* terenkripsi AES via `expo-secure-store`.
3. **Pencarian Reaktif Bebas Lag (RxJS Search Engine)**
   * *Debouncing* input pencarian (300ms) untuk mencegah *unnecessary re-renders* dan menghemat resource memori.
4. **Real-time Sync & Mode Offline Resilience**
   * *Fallback* otomatis saat jaringan terputus dengan indikator banner status offline dan penyelarasan ulang via WebSocket.
5. **Dashboard Dampak Lingkungan (Analytics)**
   * Visualisasi *real-time* total kilogram makanan yang diselamatkan dan potensi emisi $\text{CO}_2$ yang berhasil dicegah.

---

## Panduan Instalasi & Memulai Proyek

### 1. Prasyarat
* Node.js (v18+)
* Expo Go app di smartphone / Emulator Android Studio

### 2. Kloning Repositori & Install Dependensi
```bash
git clone https://github.com/elisabethell/zero-waste-mobile.git
cd savebite-app
npm install
```

### 3. Memulai Development Server
```bash
npx expo start -c
```
* Buka aplikasi **Expo Go** pada smartphone Android/iOS, lalu pindaahi (scan) QR Code yang muncul di terminal.

### 4. Menjalankan Testing (Automated Jest Tests)
```bash
npm test
```

---

## Hasil Testing & Quality Assurance

Proyek ini telah lulus *Automated Unit & Integration Testing* dengan cakupan:
* **Haversine Distance Unit Test**: Validasi kalkulasi jarak lokasi spasial di Kota Malang.
* **Zustand UDF Store Unit Test**: Validasi penambahan data surplus dan update akumulasi statistik dampak.
* **Analytics Integration Test**: Validasi rendering komponen UI dashboard zero-waste.

---

##  Prinsip AIK (Al-Islam dan Kemuhammadiyahan)

Dalam pengembangan aplikasi SaveBite, tim menerapkan tiga pilar nilai utama:
* **Ikhlas**: Merancang sistem bebas komersialisasi berlebih demi kemaslahatan sosial penanggulangan *food waste*.
* **Itqan (Profesionalisme)**: Memastikan kode bebas *memory leak*, responsif 60 FPS (<16ms per frame), serta lulus *Automated Test*.
* **Amanah**: Menjaga integritas data sensitif verifikasi penerima dengan enkripsi tingkat tinggi.