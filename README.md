# 🖥️ Safe Share - Frontend

> **The modern, lightning-fast React client for the Safe Share encrypted note platform.**

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF?logo=vite&logoColor=white)

This repository contains the frontend application for **Safe Share**, a secure web application that allows users to create, manage, and share encrypted notes with password protection and auto-expiring links.

---

## ✨ UI Features

- 🎨 **Minimalist Design**: A highly polished, professional blue-and-white UI built exclusively with **Tailwind CSS**.
- 📱 **Fully Responsive**: Flawless experience across mobile, tablet, and desktop viewports.
- 📂 **Active Links Dashboard**: Clean cards displaying all active share links, powered by real-time server polling.
- 👻 **Guest Mode**: Instantly create secure notes without an account via a dedicated Guest Dashboard.
- 📋 **Native Clipboard API**: One-click "Copy Link" buttons integrated directly into the note cards.
- ⏳ **Intelligent Expiration**: Human-readable countdowns and graceful "Link Unavailable" empty states when a link expires.

---

## 🛠️ Tech Stack

- **Framework**: React.js 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Routing**: React Router
- **HTTP Client**: Native Fetch API / Axios

---

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── assets/           # Static assets and global CSS
│   ├── pages/            # View components (if configured)
│   ├── api.ts            # API request configuration
│   ├── App.tsx           # Main application routing & views
│   ├── main.tsx          # React DOM entry point
│   └── index.css         # Tailwind directives
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

---

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1. Install Dependencies
Navigate to the `frontend` directory and install the necessary packages:
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root of the `frontend` folder to configure the backend API endpoint:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server
Start the Vite development server:
```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

---

## 🏗️ Building for Production

To create an optimized production build:
```bash
npm run build
```
This command compiles the TypeScript files and bundles the React application into the `dist` folder, ready to be deployed on platforms like **Vercel** or **Netlify**.
