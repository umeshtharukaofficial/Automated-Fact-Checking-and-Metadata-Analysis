# Automated Fact-Checking and Metadata Analysis

![Extension Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Manifest](https://img.shields.io/badge/Manifest-V3-blue) ![JavaScript](https://img.shields.io/badge/Language-Vanilla%20JS-yellow)

A powerful, browser-based digital forensics and intelligence tool designed for journalists, data scientists, and researchers. This Chrome Extension bridges the gap between simple reverse image searching and deep, contextual fact-checking.

## 🚀 Features

### 1. Zero-Footprint EXIF Analysis
*   Extracts hidden metadata (GPS coordinates, original timestamps, camera models) directly within the browser using `ArrayBuffer` conversion.
*   **Privacy-First:** Images are never uploaded to a third-party server for metadata extraction; parsing happens entirely locally.
*   **Forensic Flagging:** Automatically highlights key manipulation indicators, such as post-processing software tags (e.g., Adobe Photoshop).

### 2. Multi-Engine Reverse Image Search
*   Bypasses the limitations of single-engine searches by generating direct query URLs for:
    *   **Google Lens:** Broad object and text recognition.
    *   **Yandex:** Superior facial recognition and uncropped original discovery.
    *   **TinEye:** Chronological sorting to find the absolute oldest upload date.
    *   **Bing Visual Search:** Redundant fallback for Microsoft-indexed ecosystems.

### 3. Context Aggregation & Fact-Checking Engine
*   Integrated intelligence querying system.
*   Takes extracted claims or visual context and queries open intelligence databases (currently configured for the Wikipedia API) to cross-reference known internet hoaxes, historical events, and verifiable facts.
*   *Extensible Architecture:* Easily hot-swappable to the **Google Fact Check Tools API** or an LLM endpoint (Gemini/OpenAI) using standard REST architecture.

## ⚙️ Architecture Pipeline

1.  **Context Menu Hook:** User right-clicks an image -> triggers `background.js` (Service Worker).
2.  **Blob Fetching:** Service worker fetches the image blob via cross-origin requests (`host_permissions: *://*/*`).
3.  **Buffer Conversion:** Blob is converted to an `ArrayBuffer` for deep binary analysis.
4.  **Dashboard Instantiation:** Data is passed to `results.html` (Presentation Layer).
5.  **Parallel Processing:**
    *   `exif.js` parses the binary buffer for forensic tags.
    *   URL generator constructs multi-engine reverse search queries.
    *   API handler stands by for context verification.

## 📥 Installation (Developer Mode)

1. Clone or download this repository to your local machine.
2. Open Google Chrome (or any Chromium-based browser like Brave/Edge).
3. Navigate to `chrome://extensions/`.
4. Enable **Developer mode** in the top right corner.
5. Click **Load unpacked** in the top left corner.
6. Select the folder containing this repository.
7. The extension is now active! Right-click any image online to begin analysis.

## 🧠 Future Roadmap for Data Science Integration

*   **Optical Character Recognition (OCR):** Integrate a WebAssembly build of Tesseract.js to automatically extract text from meme templates and screenshot claims.
*   **Error Level Analysis (ELA):** Implement canvas-based pixel compression analysis to visually highlight areas of an image that have been "photoshopped" or spliced.
*   **Automated Claim Verification:** Replace the open context API with an LLM prompt chain that automatically ingests the EXIF data, OCR text, and Reverse Search chronological history to output a definitive "True/False/Misleading" verdict.

---
*Built as a Data Science Portfolio Project focusing on Open-Source Intelligence (OSINT) and automated verification pipelines.*
