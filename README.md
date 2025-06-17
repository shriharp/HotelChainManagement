# 🏨 Hotel Management System

A full-stack Hotel Management System built with a **React** frontend, **Node.js/Express** backend, and **PostgreSQL** database. It supports multiple user roles (Guest, Staff, Admin) and allows for dynamic room booking and management features.

---

## 🚀 Features

### 1. User Authentication
- Secure login for Guests, Staff, and Admins.
- Backend validates credentials using **JWT** and **bcrypt**.
- Token-based session handling.

### 2. Role-Based Dashboards
- 🎫 **Guest Dashboard** (`GuestDashboard.js`)
- 🧹 **Staff Dashboard** (`StaffDashboard.js`)
- 🛠 **Admin Dashboard** (`AdminDashboard.js`)

Each user is routed to their appropriate dashboard upon login.

### 3. Guest Booking Flow
- View current booking status.
- If no active booking:
  - Choose a city (`SelectCity.js`)
  - View available rooms (`BookRoom.js`)
  - Book a room.
- View restaurant options (currently routed via `SelectCity`).

### 4. RESTful Backend API
- Handles:
  - User login/registration
  - Booking status
  - Room listings
  - Room bookings
- Communicates with **PostgreSQL** for persistent storage.

---

## 🛠 Tech Stack

| Frontend        | Backend               | Database     | Testing                  |
|-----------------|-----------------------|--------------|--------------------------|
| React           | Node.js, Express      | PostgreSQL   | Jest, React Testing Library |
| React Router    | JWT (Auth), bcrypt    |              |                          |
| Axios (API)     |                       |              |                          |

---

## 🔁 Flow Summary

```mermaid
graph TD
  A[User visits site] --> B[Login page]
  B --> C[Backend verifies via JWT]
  C --> D{Role}
  D -->|Guest| E[Guest Dashboard]
  D -->|Staff| F[Staff Dashboard]
  D -->|Admin| G[Admin Dashboard]
  E --> H{Has Booking?}
  H -->|Yes| I[Show booking details]
  H -->|No| J[Select City]
  J --> K[Available Rooms]
  K --> L[Book Room]
  E --> M[View Restaurants]
