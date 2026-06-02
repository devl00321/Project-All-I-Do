<div align="center">
  <img src="web-app/src/assets/logo.jpg" alt="All-I-Do Logo" width="120" style="border-radius: 22%;" />
  
  # All-I-Do

  **A comprehensive platform connecting customers with service professionals.**
</div>

---

## 🚀 Overview

**Project-All-I-Do** is a modern, full-stack web application designed to streamline service bookings and management. It provides a seamless interface for **Customers** to find and book services, while offering **Dealers** a robust dashboard to manage their tasks, locations, and operations efficiently.

## 🛠️ Tech Stack

### Frontend (Web App)
- **Core:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend (Server)
- **Environment:** Node.js
- **Framework:** Express.js
- **Database ORM:** Sequelize (PostgreSQL)
- **Real-Time Communications:** Socket.io
- **Security & Config:** CORS, dotenv

---

## 📂 Project Structure

The repository is organized into a monorepo-style structure:

- 📁 `web-app/` - The React frontend application containing all customer and dealer interfaces.
- 📁 `backend/` - The Express backend API and WebSocket server handling business logic and database interactions.

---

## 🌟 Key Features

- **Customer Portal:** Browse services, make bookings, and track worker progress in real-time.
- **Dealer Dashboard:** Manage service requests, dispatch workers, and monitor workflow operations.
- **Real-Time Tracking:** Live location tracking and status updates powered by WebSockets.
- **Interactive Maps:** Beautiful, custom mock-maps for visualizing worker locations and service areas.
- **Modern UI/UX:** Responsive, intuitive, and visually stunning interface with micro-animations.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/devl00321/Project-All-I-Do.git
   cd Project-All-I-Do
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   # Create a .env file based on environment requirements and configure your database
   # npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd web-app
   npm install
   npm run dev
   ```
   *The frontend will typically run on `http://localhost:5173`.*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📄 License

This project is licensed under the ISC License.