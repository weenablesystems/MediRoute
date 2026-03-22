# ⚕️ MediRoute™ | Production Deployment Guide

MediRoute™ is a production-grade, market-ready pharmaceutical logistics platform built for the Paarl region, South Africa.

## 🚀 Quick Start

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file with the following:
    ```env
    GEMINI_API_KEY=your_gemini_key
    STRIPE_SECRET_KEY=your_stripe_secret
    VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
    APP_URL=https://your-domain.com
    ```

3.  **Build for Production:**
    ```bash
    npm run build
    ```

4.  **Start Production Server:**
    ```bash
    npm start
    ```

## 🌐 Deploying to Third-Party Domains

### 1. Hosting (Vercel / Netlify / Cloud Run)
-   **Vercel/Netlify:** Connect your GitHub repository. The build command is `npm run build` and the output directory is `dist`.
-   **Cloud Run (Recommended):** Use the provided `Dockerfile` (if available) or deploy the Node.js server. Ensure `PORT` is set to `3000` or handled by the platform.

### 2. Firebase Configuration
-   Go to [Firebase Console](https://console.firebase.google.com/).
-   Add your production domain to **Authentication > Settings > Authorized Domains**.
-   Ensure your `firestore.rules` are deployed.

### 3. Stripe Configuration
-   Update your **Stripe Dashboard** with your production success/cancel URLs.
-   Configure a Webhook endpoint pointing to `https://your-domain.com/api/webhook` (if implemented).

### 4. PWA Features
-   The app is pre-configured with a `manifest.json`.
-   To enable full offline support, register a service worker in `src/main.tsx`.

## 🛡️ Security & Compliance
-   **POPIA:** Digital consent is mandatory for every order.
-   **SAPC:** MediRoute is a logistics provider, not a pharmacy. Ensure all partner pharmacies are SAPC-registered.
-   **Firestore Rules:** Robust role-based access control (RBAC) is implemented.

---
Powered by **🌐 SA-iLabs™** and **Emma-i™**.
