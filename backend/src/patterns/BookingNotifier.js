
class BookingNotifier {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(
      item => item !== observer
    );
  }

  notify(event, booking) {
    this.observers.forEach(observer => {
      observer.update(event, booking);
    });
  }
}

export default BookingNotifier;
