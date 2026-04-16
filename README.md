# KOT-X - Frontend

A modern, feature-rich Restaurant Management System frontend built with React and Vite. This application provides an intuitive interface for managing restaurant operations including table management, menu items, order processing, billing, and kitchen dashboard.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [File Structure](#file-structure)
- [Features](#features)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Component Documentation](#component-documentation)
- [API Integration](#api-integration)
- [Styling](#styling)
- [State Management](#state-management)
- [Contributing](#contributing)

## 🎯 Project Overview

KOT-X (Kitchen Order Ticket - X) is a comprehensive frontend solution for restaurant management that enables:
- **Real-time table management** with status tracking (Available/Occupied/Reserved)
- **Dynamic menu management** with CRUD operations
- **Order processing** from table to kitchen
- **Billing system** with order summaries
- **Kitchen dashboard** for order tracking
- **Toast notifications** for user feedback

## 🛠️ Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI Framework |
| **Vite** | 5.x | Build Tool & Dev Server |
| **React Router DOM** | 6.x | Navigation & Routing |
| **Axios** | 1.x | HTTP Client for API calls |

### Styling & Icons
| Tool | Purpose |
|------|---------|
| **CSS3** | Custom component styling |
| **Lucide React** | Modern icon library |

### Development Tools
| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting & formatting |
| **Vite** | Fast refresh & build optimization |

## 📁 File Structure

```
KOT-X [Frontned]
│
├── 📁 public/ # Static assets
│ ├── favicon.svg # Browser tab icon
│ └── icons.svg # SVG sprite icons
│
├── 📁 src/ # Source code
│ ├── 📁 assets/ # Static resources
│ │ ├── 📁 css/ # Global styles
│ │ │ ├── AdminDashboard.css
│ │ │ ├── Billing.css
│ │ │ ├── CreateItemModal.css
│ │ │ ├── Menu.css
│ │ │ ├── MenuManagement.css
│ │ │ ├── TableManagement.css
│ │ │ └── kitchen-dashboard.css
│ │ ├── 📁 icons/ # Custom icon assets
│ │ ├── 📁 js/ # Utility JavaScript files
│ │ └── 📁 logos/ # Brand assets
│ │
│ ├── 📁 component/ # Reusable components
│ │ ├── 📁 CreateItemModal/ # Add new menu items
│ │ │ ├── CreateItemModal.css
│ │ │ └── CreateItemModal.jsx
│ │ ├── 📁 DeleteItemModal/ # Delete confirmation
│ │ │ ├── DeleteItemModal.css
│ │ │ └── DeleteItemModal.jsx
│ │ ├── 📁 OrderSummary/ # Order review component
│ │ │ ├── OrderSummary.css
│ │ │ └── OrderSummarys.jsx
│ │ ├── 📁 Sidebar/ # Navigation sidebar
│ │ │ ├── Sidebar.css
│ │ │ └── Sidebars.jsx
│ │ ├── 📁 ToastNotification/# Toast notifications
│ │ │ ├── ToastNotification.css
│ │ │ └── ToastNotification.jsx
│ │ └── 📁 UpdateItemModal/ # Edit menu items
│ │ ├── UpdateItemModal.css
│ │ └── UpdateItemModal.jsx
│ │
│ ├── 📁 context/ # React Context providers
│ │ ├── AutoFetchContext.jsx # Auto-refetch logic
│ │ ├── MenuContext.jsx # Menu state management
│ │ ├── OrderItemContext.jsx # Order state management
│ │ └── TablesContext.jsx # Tables state management
│ │
│ ├── 📁 pages/ # Main application pages
│ │ ├── AdminDashboard.jsx # Admin analytics dashboard
│ │ ├── Billing.jsx # Billing & checkout page
│ │ ├── MenuManagement.jsx # Menu CRUD operations
│ │ ├── Table.jsx # Table management
│ │ ├── home.jsx # Landing/Welcome page
│ │ └── menu.jsx # Customer menu view
│ │
│ ├── App.css # Global app styles
│ ├── App.jsx # Main app component & routing
│ ├── index.css # CSS reset & base styles
│ └── main.jsx # Application entry point
│
├── .gitignore # Git ignore rules
├── eslint.config.js # ESLint configuration
├── index.html # HTML template
├── package-lock.json # Dependency lock file
├── package.json # Project dependencies
├── vite.config.js # Vite configuration
└── README.md # Project documentation
```

## ✨ Features

### 🍽️ Table Management
- View tables in **grid** or **list** layout
- Real-time status updates (Available/Occupied/Reserved)
- Add, edit, and delete tables
- Search and filter tables by status
- Visual status indicators with color coding

### 📝 Menu Management
- Complete CRUD operations for menu items
- Categorized items (Beverages, Appetizers, Main Course, Desserts, Sides)
- Image upload support
- Availability toggling
- Search and filter functionality

### 🛒 Order Processing
- Add items to order from menu
- Real-time order summary
- Quantity management
- Special instructions for kitchen
- Order status tracking

### 💰 Billing System
- Calculate total with tax
- Generate bills by table number
- Payment processing interface
- Order history

### 👨‍🍳 Kitchen Dashboard
- Real-time order notifications
- Order preparation status
- Ready for serving updates
- Order completion tracking

### 🔔 Notifications
- Toast notifications for all actions
- Success/Error/Info variants
- Auto-dismiss with configurable duration

## 🚀 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn** (v1.22+)

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd KOT-X\ [Frontned]
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```
VITE_BACKEND=https://aagamanmainali35-kot-x.onrender.com
```

4. **Start development server**
```bash
npm run dev
# or
yarn dev
```

5. **Build for production**
```bash
npm run build
# or
yarn build
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|--------|
| VITE_BACKEND | Backend API URL | https://aagamanmainali35-kot-x.onrender.com |


## 📜 Available Scripts

| Command | Description |
|--------|------------|
| npm run dev | Starts development server at http://localhost:5173 |
| npm run build | Creates production build in dist/ folder |
| npm run preview | Previews production build locally |
| npm run lint | Runs ESLint for code quality checks |

## 🧩 Component Documentation

### Core Components

**Sidebar (component/Sidebar/)**  
Main navigation component with collapsible menu items and active route highlighting.

**Props:**
- activeView (string)
- setActiveView (function)

**ToastNotification (component/ToastNotification/)**  
Global notification system with auto-dismiss functionality.

**Features:**
- Success, Error, Info, Warning variants
- Custom duration per toast
- Stackable notifications

**CreateItemModal / UpdateItemModal**  
Modal forms for menu item management with validation and image upload.

**OrderSummary (component/OrderSummary/)**  
Displays current order with item quantities, prices, and total calculation.

### Context Providers

| Context | Purpose |
|--------|--------|
| MenuContext | Manages menu items state, CRUD operations |
| TablesContext | Handles table data and status updates |
| OrderItemContext | Manages active orders and cart state |
| AutoFetchContext | Controls automatic data refresh intervals |

## 🔌 API Integration

The frontend communicates with a Django backend using REST APIs:

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|--------|
| /api/Tables/ | GET/POST/PUT/DELETE | Table management |
| /api/menu/ | GET/POST/PUT/DELETE | Menu operations |
| /api/orders/ | GET/POST | Order processing |
| /api/billing/ | POST | Bill generation |

### Axios Configuration

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND,

});
```

## 🎨 Styling

- Component-specific CSS files
- Global styles in App.css and index.css
- Responsive design (mobile-first)
- CSS variables for theming

## 📊 State Management

React Context API is used:

```javascript
const TablesContext = {
  tables: [],
  loading: false,
  fetchTables: () => {},
  addTable: () => {},
  updateTable: () => {},
  removeTable: () => {}
}
```

## 🤝 Contributing

1. Fork the repository  
2. Create feature branch  
3. Commit changes  
4. Push to branch  
5. Open Pull Request  

## 📱 Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Edge (Latest)
- Safari (Latest)

## 📄 License

This project is proprietary and confidential.

## 📞 Support

- Create an issue
- Contact dev team
- Check backend API docs

---

Built with ❤️ using React & Vite
