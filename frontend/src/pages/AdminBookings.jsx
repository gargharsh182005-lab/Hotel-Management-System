import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  RefreshCw,
  Search,
  Users
} from "lucide-react";
import API from "../api";

const PAGE_SIZE = 25;

const formatDate = value => new Date(value).toLocaleString(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

export default function AdminBookings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [message, setMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBookings = useCallback(async (isRefresh = false, silent = false) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || user?.role !== "admin") {
      if (token && user?.role !== "admin") {
        setMessage("Administrator access is required to view bookings.");
        setLoading(false);
        return;
      }

      navigate("/login", {
        replace: true,
        state: { from: `${location.pathname}${location.search}` }
      });
      setLoading(false);
      return;
    }

    setMessage("");
    if (isRefresh) {
      setRefreshing(true);
    } else if (!silent) {
      setLoading(true);
    }

    try {
      const response = await API.get("/api/bookings/admin", {
        headers: { Authorization: "Bearer " + token },
        params: { page, limit: PAGE_SIZE, status, search }
      });
      setBookings(response.data.bookings || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 0);
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
      if (error.response?.status === 403) {
        setMessage("Administrator access is required to view bookings.");
      } else {
        setMessage(error.response?.data?.message || "Unable to load bookings. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, location.pathname, location.search, page, status, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
      fetchBookings(false, true);
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [fetchBookings]);

  const applySearch = event => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const newestBookingDate = now - 24 * 60 * 60 * 1000;
  const newBookings = bookings.filter(booking =>
    new Date(booking.createdAt).getTime() >= newestBookingDate
  ).length;
  const pendingBookings = bookings.filter(booking => booking.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-white/10 bg-indigo-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/admin" className="text-lg font-bold tracking-tight">StaySmart <span className="text-indigo-200">Admin</span></Link>
          <Link to="/admin" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Reservations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Booking activity</h1>
            <p className="mt-2 text-sm text-slate-500">Track new reservations, guest details, stay dates, and payment status. Updates every 30 seconds.</p>
          </div>
          <button
            type="button"
            onClick={() => fetchBookings(true)}
            disabled={loading || refreshing}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-50"
          >
            <RefreshCw className={refreshing ? "animate-spin" : ""} size={17} /> Refresh
          </button>
        </header>

        {message && (
          <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {message}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="mb-4 grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><CalendarDays size={20} /></span>
            <p className="text-sm text-slate-500">Matching bookings</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="mb-4 grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Clock3 size={20} /></span>
            <p className="text-sm text-slate-500">New in the last 24 hours · current page</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{newBookings}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="mb-4 grid size-10 place-items-center rounded-xl bg-orange-50 text-orange-700"><Users size={20} /></span>
            <p className="text-sm text-slate-500">Pending · current page</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{pendingBookings}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Reservations</h2>
              <p className="mt-1 text-sm text-slate-500">Newest bookings appear first.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <form onSubmit={applySearch} className="flex gap-2">
                <label className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="search"
                    value={searchInput}
                    onChange={event => setSearchInput(event.target.value)}
                    placeholder="Booking reference"
                    aria-label="Search booking reference"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:w-56"
                  />
                </label>
                <button type="submit" className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-800">Search</button>
              </form>
              <select
                value={status}
                onChange={event => {
                  setPage(1);
                  setStatus(event.target.value);
                }}
                aria-label="Filter bookings by status"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">All statuses</option>
                {["pending", "confirmed", "cancelled", "completed", "expired"].map(value => (
                  <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5" aria-label="Loading bookings">
              {[0, 1, 2].map(item => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <CalendarDays className="mx-auto mb-3 text-slate-400" size={30} />
              <h3 className="font-semibold text-slate-800">No bookings found</h3>
              <p className="mt-1 text-sm text-slate-500">New customer reservations will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map(booking => {
                const isNew = new Date(booking.createdAt).getTime() >= newestBookingDate;
                return (
                  <article key={booking._id} className="grid gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-center sm:px-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900">{booking.hotel?.name || "Hotel"}</h3>
                        {isNew && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">New</span>}
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          booking.status === "confirmed" ? "bg-emerald-50 text-emerald-800" :
                          booking.status === "cancelled" ? "bg-red-50 text-red-700" :
                          booking.status === "completed" ? "bg-slate-100 text-slate-700" :
                          booking.status === "expired" ? "bg-slate-100 text-slate-600" :
                          "bg-orange-50 text-orange-800"
                        }`}>{booking.status}</span>
                      </div>
                      <p className="mt-1 truncate text-sm text-slate-600">{booking.user?.name || "Guest"} · {booking.user?.email || "No email"}</p>
                      <p className="mt-1 text-xs text-slate-400">{booking.bookingReference} · {booking.hotel?.city || "—"}</p>
                    </div>
                    <div className="text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">{booking.room?.roomType || "Room"} · {booking.guests} guest{booking.guests === 1 ? "" : "s"}</p>
                      <p className="mt-1">{new Date(booking.checkIn).toLocaleDateString()} – {new Date(booking.checkOut).toLocaleDateString()}</p>
                      <p className="mt-1 text-xs text-slate-400">Booked {formatDate(booking.createdAt)}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="inline-flex items-center gap-1 font-bold text-slate-900 sm:justify-end">
                        <CircleDollarSign size={15} /> ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {booking.paymentIsSimulated ? `${booking.paymentMethod} (simulated)` : booking.paymentMethod || booking.paymentStatus}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 sm:px-6">
              <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Previous</button>
                <button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
