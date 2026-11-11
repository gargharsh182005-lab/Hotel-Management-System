
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Hotel,
  MapPin,
  ShieldCheck,
  Star,
  Users
} from "lucide-react";
import API from "../api";

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const hotelResponse = await API.get(`/api/hotels/${id}`);
        const roomResponse = await API.get(`/api/rooms/hotel/${id}`);

        setHotel(hotelResponse.data.hotel);
        setRooms(roomResponse.data.rooms);
      } catch (error) {
        setMessage("Unable to load hotel details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!quote?.expiresAt) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setQuote(null);
      setMessage("Your price quote expired. Check availability again to refresh the total.");
    }, Math.max(0, new Date(quote.expiresAt).getTime() - Date.now()));

    return () => window.clearTimeout(timeoutId);
  }, [quote]);

  const checkAvailability = async () => {
    setMessage("");
    setQuote(null);

    if (!selectedRoom || !checkIn || !checkOut) {
      setMessage("Please select a room and both dates.");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setMessage("Check-out must be after check-in.");
      return;
    }

    try {
      const response = await API.post("/api/bookings/availability", {
        roomId: selectedRoom,
        checkIn,
        checkOut,
        roomsBooked: 1,
        guests: Number(guests)
      });

      setQuote(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Availability check failed.");
    }
  };

  const bookRoom = async () => {
    if (!quote?.priceQuote) {
      setMessage("Check availability first so we can confirm the exact price for your dates.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await API.post(
        "/api/bookings",
        {
          roomId: selectedRoom,
          checkIn,
          checkOut,
          guests: Number(guests),
          roomsBooked: 1,
          priceQuote: quote.priceQuote
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate("/my-bookings", {
        state: { booking: response.data.booking }
      });
    } catch (error) {
      if (error.response?.status === 409) {
        setQuote(null);
      }
      setMessage(error.response?.data?.message || "Booking failed.");
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <span className="size-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-700" />
          Finding your stay...
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <Hotel className="mx-auto mb-4 text-indigo-600" size={38} />
          <h1 className="text-2xl font-bold text-slate-950">We couldn’t find this stay</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{message || "This hotel may no longer be available."}</p>
          <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800">
            <ArrowLeft size={17} /> Back to stays
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-indigo-700">
            StaySmart<span className="text-orange-500">.</span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-indigo-700">
            <ArrowLeft size={16} /> Explore stays
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="relative mb-8 min-h-[360px] overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-800 to-indigo-950 shadow-xl sm:min-h-[470px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <Hotel size={76} className="text-white/70" />
            {hotel.imageUrl && (
              <img
                src={hotel.imageUrl}
                alt={`${hotel.name} hotel`}
                fetchPriority="high"
                onError={event => {
                  event.currentTarget.hidden = true;
                }}
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/5" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-sm font-semibold backdrop-blur">
                <Star size={15} className="text-orange-300" fill="currentColor" /> {hotel.rating || "New"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-sm backdrop-blur">
                <BadgeCheck size={15} /> Guest favorite
              </span>
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">{hotel.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-white/85 sm:text-base">
              <MapPin size={18} /> {hotel.address}, {hotel.city}, {hotel.country}
            </p>
          </div>
        </section>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Welcome to {hotel.city}</p>
              <h2 className="text-2xl font-bold text-slate-950">A stay made for slowing down</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{hotel.description}</p>
              {hotel.amenities?.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-slate-800">Thoughtful touches</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {hotel.amenities.map(item => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
                        <BadgeCheck size={15} /> {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Find your room</p>
                  <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Rooms & suites</h2>
                </div>
                <span className="text-sm text-slate-500">{rooms.length} available options</span>
              </div>
              {rooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                  <Hotel className="mx-auto mb-3 text-indigo-500" size={30} />
                  <h3 className="font-bold text-slate-900">Rooms coming soon</h3>
                  <p className="mt-1 text-sm text-slate-500">This property has not added room options yet.</p>
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  {rooms.map(room => (
                    <article key={room._id} className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
                      selectedRoom === room._id ? "border-indigo-500 ring-4 ring-indigo-100" : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
                    }`}>
                      {room.images?.length > 0 && (
                        <div className="mb-5 grid grid-cols-2 gap-2">
                          {room.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${room.roomType} room photo ${index + 1}`}
                              className="h-32 w-full rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-800">{room.roomType}</span>
                          <h3 className="mt-3 text-xl font-bold text-slate-950">{room.roomType} room</h3>
                        </div>
                        <p className="text-right">
                          <span className="block text-sm font-semibold text-indigo-800">Exact price for your dates</span>
                          <span className="text-xs text-slate-500">shown after date selection</span>
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">{room.description}</p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                        <Users size={16} className="text-indigo-600" /> Up to {room.capacity} guests
                      </div>
                      {room.amenities?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {room.amenities.map(amenity => (
                            <span key={amenity} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600">{amenity}</span>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRoom(room._id);
                          setQuote(null);
                        }}
                        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          selectedRoom === room._id ? "bg-indigo-100 text-indigo-800" : "bg-indigo-700 text-white hover:bg-indigo-800"
                        }`}
                      >
                        {selectedRoom === room._id ? "Selected for your stay" : "Choose this room"}
                        {selectedRoom !== room._id && <ArrowRight size={16} />}
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
              <div className="bg-indigo-950 px-6 py-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Plan your visit</p>
                <h2 className="mt-1 text-xl font-bold">Check availability</h2>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label htmlFor="check-in" className="mb-2 block text-sm font-semibold text-slate-700">Check-in</label>
                  <input
                    id="check-in"
                    type="date"
                    value={checkIn}
                    onChange={e => {
                      setCheckIn(e.target.value);
                      setQuote(null);
                      setMessage("");
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label htmlFor="check-out" className="mb-2 block text-sm font-semibold text-slate-700">Check-out</label>
                  <input
                    id="check-out"
                    type="date"
                    value={checkOut}
                    onChange={e => {
                      setCheckOut(e.target.value);
                      setQuote(null);
                      setMessage("");
                    }}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
                <div>
                  <label htmlFor="guest-count" className="mb-2 block text-sm font-semibold text-slate-700">Guests</label>
                  <span className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-slate-400 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100">
                    <Users size={17} />
                    <input
                      id="guest-count"
                      type="number"
                      min="1"
                      value={guests}
                      onChange={e => {
                        setGuests(e.target.value);
                        setQuote(null);
                        setMessage("");
                      }}
                      className="w-full bg-transparent text-sm text-slate-800 outline-none"
                    />
                  </span>
                </div>
                {!selectedRoom && <p className="text-xs leading-5 text-slate-500">Choose a room to check dates and pricing.</p>}
                <button
                  type="button"
                  onClick={checkAvailability}
                  disabled={!selectedRoom}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CalendarDays size={17} /> Show my exact total
                </button>

                {message && <p role="status" aria-live="polite" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}

                {quote && (
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                    <h3 className="font-bold text-slate-900">Your price summary</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      Final total for your selected dates. This quoted amount is held for 10 minutes.
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <p className="flex justify-between"><span>Available rooms</span><span className="font-semibold">{quote.availableRooms}</span></p>
                      <p className="flex justify-between"><span>Number of nights</span><span className="font-semibold">{quote.nights}</span></p>
                      <p className="flex justify-between"><span>Rooms</span><span className="font-semibold">{quote.roomsBooked}</span></p>
                    </div>
                    <div className="mt-3 border-t border-indigo-100 pt-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Exact nightly prices</p>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        {quote.dailyPrices.map(night => (
                          <p key={night.date} className="flex justify-between gap-3">
                            <span>{new Date(night.date).toLocaleDateString()}</span>
                            <span className="font-semibold">₹{Number(night.finalPrice).toLocaleString("en-IN")}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 flex items-end justify-between border-t border-indigo-100 pt-4">
                      <span className="text-sm font-medium text-slate-600">Total to pay</span>
                      <span className="text-2xl font-bold text-indigo-800">₹{Number(quote.totalAmount).toLocaleString("en-IN")}</span>
                    </p>
                    <button
                      type="button"
                      onClick={bookRoom}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-900"
                    >
                      Continue with this total <ArrowRight size={16} />
                    </button>
                  </div>
                )}
                <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <ShieldCheck size={15} className="text-emerald-700" /> Secure booking · No hidden fees
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
