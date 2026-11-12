# StaySmart – Hotel Management System

A full-stack hotel management and booking system with a **Dynamic Pricing Engine** that automatically adjusts room prices based on occupancy, weekends, seasons, and demand.

## Features

- User registration and JWT-based authentication.
- Role-based access for customers, admins, and managers.
- Hotel and room management.
- Room availability checking and booking.
- Dynamic room pricing based on multiple factors.
- Booking history and cancellation.
- Pay at Hotel, simulated UPI, and simulated Card payments.
- Hotel ratings and reviews.

## Dynamic Pricing

Room prices are automatically adjusted using four pricing strategies:

| Strategy | Price Adjustment |
|---|---:|
| Occupancy above 80% | +20% |
| Occupancy above 60% | +10% |
| Weekend | +10% |
| Peak season | +25% |
| High demand | +15% |
| Medium demand | +5% |

Applicable adjustments are calculated sequentially on the base room price.

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **API Communication:** Axios

## OOP Concepts & Design Patterns

- **Encapsulation, Abstraction, Inheritance, Polymorphism**
- **Strategy Pattern:** Separate dynamic pricing algorithms.
- **Factory Pattern:** Creates pricing strategies.

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/gargharsh182005-lab/Hotel-Management-System.git
cd Hotel-Management-System
```

**2. Backend setup**

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend:

```bash
npm run dev
```

**3. Frontend setup**

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Payment Information

StaySmart supports Pay at Hotel, simulated UPI, and simulated Card payments. Simulated payments are for demonstration purposes only; no real transactions take place.

## Author

**Harsh Garg**  

B.Tech – Information Technology  
Indian Institute of Information Technology, Allahabad
