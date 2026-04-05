# CodeFlow IDE | Advanced AI Code Studio

Welcome to your AI-powered architecture studio. This workspace is designed for modular code generation and deep architectural analysis.

## ⚖️ License
This software is licensed under the **Apache License 2.0**. You are free to use, modify, and distribute this software for personal or commercial purposes, provided that all copyright notices and license terms are maintained.

## Getting Started

To set up the development environment and restore the directories and dependencies ignored by version control (such as `node_modules`):

1. **Install Dependencies**:
   Run the following command in your terminal to install all required packages defined in `package.json`:
   ```bash
   npm install
   ```
   ```bash
   npm install next@latest react@latest react-dom@latest
   ```

   ```bash
   firebase install
   ```


2. **Configure Environment**:
   Ensure a `.env` file exists in the root directory with your `GEMINI_API_KEY`. This file is ignored by `.gitignore` for security reasons.
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Launch Development Server**:
   Start the local development server to begin building:
   ```bash
   npm run dev
   ```

## Project Architecture

- **Engine**: Powered by Gemini 2.5 Flash Lite via Genkit.
- **Firebase Core**: Using standard Client SDKs with `inMemoryPersistence` for high-security, volatile sessions.
- **Modular Build**: Use the AI Assistant to generate complex folder structures and logic.

## Security & Persistence
- **Auth**: Sessions are volatile (In-Memory). Refreshing the browser or closing the tab will sign you out.
- **Guest Wiping**: Guest accounts are automatically deleted and their Firestore data wiped upon logout.

## Copyright
Copyright © 2026 Frostvale Studio. Licensed under the Apache License, Version 2.0.

# test
