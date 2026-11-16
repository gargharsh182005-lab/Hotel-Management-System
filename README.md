# StaySmart – Hotel Management System

A full-stack hotel management and booking system with a **Dynamic Pricing Engine** that adjusts room prices based on occupancy, weekends, and seasons.

## Features

- User registration and JWT-based authentication.
- Role-based access for customers, admins, and hotel managers.
- Hotel and room management.
- Room availability checking and booking.
- Hotel managers can manage their assigned hotel's rooms and bookings, and record guest check-in/check-out.
- Admins can manage all hotels, create one manager account per hotel, and edit assigned managers.
- Dynamic room pricing based on multiple factors.
- Booking history and cancellation before check-in.
- Pay at Hotel, simulated UPI, and simulated Card payments.
- Simulated refunds when cancelling bookings paid with simulated methods.
- Hotel ratings and reviews.

## Dynamic Pricing

Room prices are automatically adjusted using occupancy, weekend, and peak-season strategies:

| Strategy | Price Adjustment |
|---|---:|
| Occupancy above 80% | +20% |
| Occupancy above 60% | +10% |
| Weekend | +10% |
| Peak season | +25% |

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

## Hotel managers

Sign in as an administrator and create a manager account from the property dashboard. Assign the manager to an unassigned hotel and share the account credentials securely. Use the Edit button beside an assigned manager to update their name or email, or set a new password (leave the password blank to keep it unchanged). Managers sign in from the regular login page; their dashboard, room inventory, and booking actions are restricted to their assigned hotel. Admins retain access to all hotels and bookings.

## Payment Information

StaySmart supports Pay at Hotel, simulated UPI, and simulated Card payments. Simulated payments are for demonstration purposes only; no real transactions take place.

Guests can cancel a pending or confirmed booking before check-in. When cancelling a booking paid with simulated UPI or simulated Card, its payment record is marked as refunded for demonstration purposes only; no money is charged or returned. Pay-at-hotel bookings have no payment to refund.

## Author

**Harsh Garg**  
**Ridhvan Sharma**

B.Tech – Information Technology  
Indian Institute of Information Technology, Allahabad
