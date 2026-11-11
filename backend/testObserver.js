
import BookingNotifier from "./src/patterns/BookingNotifier.js";
import ConsoleNotificationObserver from "./src/patterns/ConsoleNotificationObserver.js";

const notifier = new BookingNotifier();

const consoleObserver = new ConsoleNotificationObserver();

// Subscribe observer
notifier.subscribe(consoleObserver);

// Sample booking
const booking = {
  _id: "BOOK123",
  user: "Harsh",
  status: "confirmed"
};

// Notify observers
notifier.notify("BOOKING_CONFIRMED", booking);

// Unsubscribe observer
notifier.unsubscribe(consoleObserver);

console.log("Observer test completed!");
