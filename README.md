
# Chiru (Web App)

Welcome to Chiru, your personal dashboard for tracking subjects, habits, and goals. This is a modern web application that runs entirely in your browser.

![Chiru App Screenshot](https://storage.googleapis.com/agent-tools-dev/screenshots/zenith-tracker.png)

## Features

-   **Multi-Mode Tracking:** Manage complex **Subjects** with topics and sub-topics, build streaks with the **Habit** tracker, and monitor progress on **Video** courses.
-   **Browser-Based Storage:** All your data is saved to your browser's `localStorage`. It's fast, secure, works entirely offline, and persists between sessions on the same browser.
-   **AI-Powered Insights:** Leverage the power of the Gemini API to get personalized recommendations and rewrite your notes with an AI assistant.
-   **Rich Note-Taking:** A dedicated, distraction-free editor for each topic, with the ability to view all notes for a subject in one place.
-   **Data Export:** Export your subject notes to PDF, Markdown, or Plain Text for offline use or sharing.
-   **Customizable UI:** A clean, modern interface with collapsible cards and a dark mode default for comfortable viewing.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [Node.js and npm](https://nodejs.org/en) (LTS version is recommended)

## How to Run the Application

Follow these steps to get Zenith up and running locally.

### 1. Installation

First, you need to install the necessary dependencies for the project. Open your terminal or command prompt, navigate to the project's root directory (where `package.json` is located), and run the following command:

```bash
npm install
```
This command reads the `package.json` file and downloads the local web server.

### 2. Starting the App

Once the installation is complete, you can start the application by running:

```bash
npm start
```
This will automatically open the Chiru in your default web browser at **`http://localhost:9000`**.

## Configuring AI Features

The AI Assistant and Note Rewriter features require a Google Gemini API key.

1.  **Get an API Key:**
    -   Visit [Google AI Studio](https://aistudio.google.com/).
    -   Sign in with your Google account.
    -   Click on **"Get API key"** and create a new key.
    -   Copy the generated key to your clipboard.

2.  **Add the Key to the App:**
    -   Open the Chiru application in your browser.
    -   Navigate to the **Settings** page.
    -   Select the **"API Key"** section.
    -   Paste your Gemini API key into the input field and click **"Save Key"**.

The AI features will now be enabled. Your key is stored locally in your browser's `localStorage` and is never shared.
