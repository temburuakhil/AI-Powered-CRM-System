# E-Governance Management Platform 📊

![Status](https://img.shields.io/badge/Status-Live-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)

## 📖 About The Project

A comprehensive real-time government services management platform featuring AI-powered multi-channel outreach capabilities, live data synchronization, and intelligent document assistance. Built to streamline management of schemes, scholarships, training programs, and citizen registrations.

### 🎯 Key Features

- **Real-time Data Sync** - Live Google Sheets synchronization with 5-second refresh intervals
- **AI-Powered Chatbot** - DocuRAG chatbot using FAISS vector store and Sentence Transformers for semantic document search
- **Multi-Channel Outreach** - Automated campaigns via SMS, WhatsApp, Email, and Voice using n8n workflows
- **Voice Campaigns** - Retell AI integration for intelligent phone-based outreach with real-time transcription
- **Smart Workflow** - Kanban board for application tracking and status management
- **Calendar Integration** - Google Calendar sync for scheduling and tracking
- **Content Generation** - Gemini AI for automated email and message content creation
- **Modern UI** - Beautiful, responsive design with dark mode support

## 🚀 Tech Stack

**Frontend:**
- React 18.3 + TypeScript + Vite
- Tailwind CSS 3.4 + shadcn/ui (Radix UI)
- Lucide Icons, PapaParse

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- Passport.js for authentication

**AI/ML:**
- Flask + Python
- FAISS vector store
- Sentence Transformers (all-MiniLM-L6-v2)
- Gemini AI API
- Retell AI SDK

**Automation:**
- n8n workflow automation
- Google Sheets API
- Nodemailer (SMTP)

## 🔐 Sample Login Credentials

### Admin Portal
- **Email:** `admin@gmail.com`
- **Password:** `admin123`

### Manager Portal
- **Email:** `manager@gmail.com`
- **Password:** `manager123`

### Agent Dashboard
- **Email:** `agent@gmail.com`
- **Password:** `agent123`

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/temburuakhil/BPUT-Hackathon.git
cd BPUT-Hackathon

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install Python dependencies for DocuRAG
cd docurag
pip install -r requirements.txt
cd ..

# Start frontend (http://localhost:8081)
npm run dev

# Start backend (http://localhost:3001)
cd backend
node server.js

# Start DocuRAG chatbot (http://localhost:5000)
cd docurag
python app.py
```

## ✨ Features Overview

### 📊 Dashboard Management
- Real-time data visualization with sortable, searchable tables
- Instant filtering and sorting across all records
- Export and import capabilities via Google Sheets

### 🤖 AI Document Assistant (DocuRAG)
- Upload and process PDF, DOC, DOCX, TXT, JSON, CSV files (40MB max)
- Semantic search using FAISS vector store
- Context-aware Q&A with chat history
- Adjustable response detail levels

### 📢 Multi-Channel Campaigns
- **Email Campaigns** - SMTP-based bulk emails with AI-generated content
- **SMS Campaigns** - n8n webhook automation for SMS delivery
- **WhatsApp Campaigns** - Automated WhatsApp messaging
- **Voice Campaigns** - Retell AI for intelligent phone outreach with transcription

### 📅 Calendar Integration
- Google Calendar sync for appointments
- Automated scheduling for training sessions
- Real-time availability tracking

### 🎯 Workflow Management
- Kanban board for application tracking
- Status updates across registration pipeline
- Approval/rejection workflows with automated notifications

## 📄 License

This project is licensed under the MIT License.
