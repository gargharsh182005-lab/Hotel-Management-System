
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Hotel,
  MapPin,
  ShieldCheck,
  XCircle
} from "lucide-react";
import API from "../api";

export default function MyBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [processingBookingId, setProcessingBookingId] = useState("");

  const fetchBookings = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: `${location.pathname}${location.search}` }
      });
      setLoading(false);
      return;
    }

    try {
      const response = await API.get("/api/bookings/my-bookings", { headers: { Authorization: "Bearer " + token } });
      setBookings(response.data.bookings);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", {
          replace: true,
          state: {
            from: `${location.pathname}${location.search}`,
            message: "Your session expired. Please sign in again."
          }
        });
      } else {
        setMessage(error.response?.data?.message || "Unable to load bookings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, location.pathname, location.search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const choosePayment = async (booking, paymentMethod) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: `${location.pathname}${location.search}` }
      });
      return;
    }

    setProcessingBookingId(booking._id);
    setMessage("");

    try {
      const response = await API.post(
        "/api/payments/process",
        { bookingId: booking._id, paymentMethod },
        { headers: { Authorization: "Bearer " + token } }
      );
      setBookings(current => current.map(item =>
        item._id === booking._id ? response.data.booking : item
      ));
      setMessage(response.data.message);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", {
          replace: true,
          state: {
            from: `${location.pathname}${location.search}`,
            message: "Your session expired. Please sign in again."
          }
        });
        return;
      }
      setMessage(error.response?.data?.message || "Unable to update this booking. Please try again.");
    } finally {
      setProcessingBookingId("");
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", {
        replace: true,
        state: { from: `${location.pathname}${location.search}` }
      });
      return;
    }

    try {
      const response = await API.patch(
        `/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: "Bearer " + token } }
      );

      setBookings(current => current.map(booking =>
        booking._id === bookingId ? response.data.booking : booking
      ));
      setMessage(response.data.message || "Booking cancelled successfully.");
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", {
          replace: true,
          state: {
            from: `${location.pathname}${location.search}`,
            message: "Your session expired. Please sign in again."
          }
        });
        return;
      }

      setMessage(error.response?.data?.message || "Cancellation failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="size-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-700" />
          Loading your reservations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-indigo-700">
            StaySmart<span className="text-orange-500">.</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-700">
            <ArrowLeft size={16} /> Explore stays
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
        <header className="mb-8 rounded-3xl bg-indigo-950 px-6 py-8 text-white sm:px-9 sm:py-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-200">Your StaySmart account</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Your reservations</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100">
            Find your upcoming escapes, payment details, and everything you need for check-in.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs text-indigo-100">
            <ShieldCheck size={15} /> Your booking details are private to you
          </div>
        </header>

        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          <strong>Demo payment options:</strong> simulated UPI and card do not charge money. Pay at hotel remains unpaid until collected by the property.
        </div>

        {message && (
          <div role="status" aria-live="polite" className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
            <p>{message}</p>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:py-20">
            <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Hotel size={30} />
            </span>
            <h2 className="text-2xl font-bold text-slate-950">Your next getaway starts here</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don’t have any reservations yet. Find a place you love and we’ll keep the details right here.
            </p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-800">
              Discover stays <ArrowLeft className="rotate-180" size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <article key={booking._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:px-7 sm:py-6">
                  <div className="flex items-start gap-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                      <Hotel size={22} />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{booking.hotel?.name || "Hotel reservation"}</h2>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin size={14} /> {booking.hotel?.city || "Destination"}
                      </p>
                      <p className="mt-2 text-xs font-medium text-slate-400">
                        Confirmation <span className="font-bold tracking-wide text-slate-600">{booking.bookingReference}</span>
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex h-fit items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    booking.status === "confirmed"
                      ? "bg-emerald-50 text-emerald-800"
                      : booking.status === "cancelled"
                      ? "bg-red-50 text-red-700"
                      : booking.status === "expired"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-orange-50 text-orange-800"
                  }`}>
                    {booking.status === "confirmed" && <CheckCircle2 size={14} />}
                    {booking.status}
                  </span>
                </div>

                {booking.status === "pending" && booking.expiresAt && (
                  <p className="border-b border-orange-100 bg-orange-50 px-5 py-3 text-sm text-orange-900 sm:px-7">
                    This unpaid room hold expires at {new Date(booking.expiresAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}. Choose a booking option before then to keep your reservation.
                  </p>
                )}
                {booking.status === "expired" && (
                  <p className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm text-slate-600 sm:px-7">
                    This unpaid room hold expired and was released. Availability may have changed; please start a new booking.
                  </p>
                )}

                <div className="grid gap-3 p-5 sm:grid-cols-3 sm:px-7">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <CalendarDays size={15} /> Check-in
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{new Date(booking.checkIn).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <CalendarDays size={15} /> Check-out
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{new Date(booking.checkOut).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <BedDouble size={15} /> Room
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{booking.room?.roomType || "Room"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 px-5 py-5 sm:px-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total amount</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">
                      ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Payment <span className="font-semibold capitalize text-slate-700">
                        {booking.paymentIsSimulated && booking.paymentStatus === "refunded"
                          ? "refunded (simulated)"
                          : booking.paymentStatus}
                      </span>
                    </p>
                    {booking.paymentMethod && (
                      <p className="mt-1 text-xs text-slate-500">
                        Method <span className="font-semibold text-slate-700">{booking.paymentMethod}</span>
                        {booking.paymentIsSimulated && <span className="ml-1 font-bold text-orange-700">(simulated)</span>}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {booking.status === "pending" && booking.paymentStatus === "unpaid" && (
                      <>
                        <button
                          type="button"
                          onClick={() => choosePayment(booking, "Pay at Hotel")}
                          disabled={Boolean(processingBookingId)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Banknote size={17} /> Pay at hotel
                        </button>
                        <button
                          type="button"
                          onClick={() => choosePayment(booking, "Simulated UPI")}
                          disabled={Boolean(processingBookingId)}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CreditCard size={17} />
                          {processingBookingId === booking._id ? "Processing..." : "Simulated UPI"}
                        </button>
                        <button
                          type="button"
                          onClick={() => choosePayment(booking, "Simulated Card")}
                          disabled={Boolean(processingBookingId)}
                          className="inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CreditCard size={17} />
                          {processingBookingId === booking._id ? "Processing..." : "Simulated Card"}
                        </button>
                      </>
                    )}
                    {["pending", "confirmed"].includes(booking.status) &&
                      new Date(booking.checkIn) > new Date() && (
                        <button
                          onClick={() => cancelBooking(booking._id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                        >
                          <XCircle size={17} /> Cancel
                        </button>
                      )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
