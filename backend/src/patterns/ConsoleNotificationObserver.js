
import BookingObserver from "./BookingObserver.js";

class ConsoleNotificationObserver extends BookingObserver {
  update(event, booking) {
    console.log("===== BOOKING NOTIFICATION =====");

    console.log("Event:", event);
    console.log("Booking ID:", booking._id);
    console.log("Customer:", booking.user);
    console.log("Status:", booking.status);

    console.log("================================");
  }
}

export default ConsoleNotificationObserver;
