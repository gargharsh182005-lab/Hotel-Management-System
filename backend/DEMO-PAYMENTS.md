# Demo payment options

The booking page offers three demonstration choices:

- **Pay at hotel** confirms the booking and leaves it unpaid.
- **Simulated UPI** and **Simulated Card** confirm the booking and mark it paid for demonstration purposes only.

Simulated methods do not connect to a payment provider, collect money, or represent a real transaction. The customer bookings page labels the methods as simulated.

Only the authenticated owner of a pending, unpaid booking can select a payment option. A simulated payment can be cancelled in the demo; its record is marked refunded for application-state demonstration only. Pay-at-hotel bookings remain unpaid until a real property collection process is added.

Unpaid pending bookings hold rooms for 15 minutes. If no booking option is selected in that time, the reservation expires and those rooms are released. Room pricing is quoted for the selected dates and honored at booking for 10 minutes; guests must refresh an expired quote before reserving.
