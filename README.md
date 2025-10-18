# OCAC Training Manager 📊# BPUT Hackathon Project



A modern, real-time training management dashboard built for OCAC (Odisha Computer Application Centre) with live data synchronization from Google Sheets.## Project Setup



![OCAC Training Manager](https://img.shields.io/badge/Status-Live-success)This project is built with:

![License](https://img.shields.io/badge/License-MIT-blue)

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)- Vite

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)- TypeScript

- React

## ✨ Features- shadcn-ui

- Tailwind CSS

- 🔄 **Real-time Synchronization** - Auto-refreshes data every 5 seconds

- 🔍 **Instant Search** - Search across all training records## Installation

- 📊 **Sortable Columns** - Click any column header to sort

- 🎨 **Modern UI** - Beautiful, Notion-inspired design with glass morphism```sh

- 🌓 **Dark Mode Support** - Seamless light and dark themes# Install dependencies

- ⚡ **Lightning Fast** - Built with Vite for optimal performancenpm install

- 📱 **Responsive Design** - Works perfectly on all devices

# Start the development server

## 🚀 Tech Stacknpm run dev

```

- **Frontend Framework:** React 18.3 with TypeScript

- **Build Tool:** Vite 5.4## Available Scripts

- **Styling:** Tailwind CSS 3.4 with custom design system

- **UI Components:** shadcn/ui (Radix UI primitives)- `npm run dev` - Start the development server

- **Data Source:** Google Sheets (real-time CSV sync)- `npm run build` - Build for production

- **CSV Parser:** PapaParse- `npm run preview` - Preview production build locally

- **Font:** Inter (Google Fonts)- `npm run lint` - Run ESLint

- **Icons:** Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/temburuakhil/BPUT-Hackathon.git

# Navigate to project directory
cd BPUT-Hackathon

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🎯 Configuration

### Google Sheets Setup

1. Open your Google Sheet
2. Go to **File → Share → Publish to web**
3. Select **Entire Document** and **Comma-separated values (.csv)**
4. Click **Publish** and copy the URL
5. Update the `SHEET_URL` constant in `src/pages/Index.tsx`

```typescript
const SHEET_URL = "YOUR_GOOGLE_SHEETS_URL_HERE";
```

## 🎨 Design System

The application features a custom design system inspired by modern SaaS applications:

- **Color Palette:** Blue to purple gradients with slate neutrals
- **Typography:** Inter font family with optimized OpenType features
- **Shadows:** Multi-layered shadows for depth
- **Animations:** Smooth transitions and micro-interactions
- **Spacing:** Consistent 8px grid system

## 📁 Project Structure

```
BPUT-Hackathon/
├── src/
│   ├── components/
│   │   ├── DataTable.tsx       # Main data table component
│   │   └── ui/                 # shadcn/ui components
│   ├── pages/
│   │   └── Index.tsx           # Main page with data sync
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── hooks/
│   │   └── use-toast.ts        # Toast notifications
│   ├── index.css               # Global styles & design system
│   └── main.tsx                # Application entry point
├── public/
│   ├── favicon.ico             # App favicon
│   └── robots.txt              # SEO configuration
└── index.html                  # HTML template
```

## 🔧 Key Features Implementation

### Real-time Data Sync
- Fetches data from Google Sheets every 5 seconds
- Automatic retry on connection failure
- Loading and error states with beautiful UI

### Search & Filter
- Instant client-side search across all columns
- Preserves sort state during search
- Highlights matching records

### Sortable Columns
- Click any column header to sort
- Toggle between ascending and descending
- Visual indicators for sort direction

## 🌟 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

## 👥 Team

Built for BPUT Hackathon by Team OCAC

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ for OCAC Training Management**
