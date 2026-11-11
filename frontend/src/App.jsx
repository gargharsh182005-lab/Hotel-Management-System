
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Hotel,
  Star,
  ArrowRight,
  LogOut,
  Sparkles
} from "lucide-react";
import API from "./api";

function App() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const navigate = useNavigate();
  const filteredHotels = hotels.filter(hotel => {
    const location = `${hotel.name} ${hotel.city} ${hotel.country}`.toLowerCase();
    return location.includes(searchQuery.trim().toLowerCase());
  });
  const destinations = Object.values(hotels.reduce((groups, hotel) => {
    const key = `${hotel.city}-${hotel.country}`;
    if (!groups[key]) {
      groups[key] = {
        city: hotel.city,
        country: hotel.country,
        imageUrl: hotel.imageUrl,
        hotelCount: 0
      };
    }
    groups[key].hotelCount += 1;
    return groups;
  }, {})).slice(0, 6);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await API.get("/api/hotels");
        setHotels(response.data.hotels);
      } catch (error) {
        console.error("Failed to load hotels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-slate-50/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight text-indigo-700">
            StaySmart<span className="text-orange-500">.</span>
          </Link>

          <div className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link to="/" className="transition hover:text-indigo-700">Home</Link>
            <a href="#hotels" className="transition hover:text-indigo-700">Stays</a>
            <a href="#about" className="transition hover:text-indigo-700">About</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <span className="hidden font-semibold text-slate-700 sm:inline">
                Hi, {user.name}
              </span>

              {user.role === "admin" && (
                <Link to="/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
                  Dashboard
                </Link>
              )}

              {user.role !== "admin" && (
                <Link to="/my-bookings" className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
                  My bookings
                </Link>
              )}

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:px-4"
              >
                <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 sm:px-4">
                Login
              </Link>

              <Link to="/signup" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:px-5">
                Sign Up
              </Link>
            </>
          )}
          </div>
        </div>
      </nav>

      <section
        className="relative isolate overflow-hidden bg-indigo-950 bg-cover bg-center px-5 py-20 text-white sm:px-8 sm:py-28"
        style={{
          backgroundImage: "linear-gradient(90deg, rgba(33,29,25,.90) 0%, rgba(48,35,29,.72) 48%, rgba(48,35,29,.18) 100%), url('https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2200&q=90')"
        }}
      >
        <div className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute -right-8 -top-16 size-64 rounded-full border border-white/15" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
              <Sparkles size={14} /> Thoughtful stays, beautifully found
            </p>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Make room for a <span className="text-orange-300">better getaway.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-indigo-100 sm:text-lg">
              Discover welcoming places, memorable details, and a stay that feels just right.
            </p>
          </div>

          <div className="mt-10 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl shadow-black/20 sm:flex-row sm:items-center">
            <label htmlFor="hotel-search" className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2 text-slate-500">
              <MapPin className="shrink-0 text-indigo-600" size={20} />
              <span className="min-w-0 flex-1">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Destination</span>
                <input
                  id="hotel-search"
                  type="search"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  placeholder="Search a hotel or destination"
                  className="w-full border-0 bg-transparent p-0 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0"
                />
              </span>
            </label>
            <button
              onClick={() => document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-4 font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-white"
            >
              <Search size={18} /> Find a stay
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-indigo-100">
            <span className="flex items-center gap-2"><Hotel size={17} /> {hotels.length} curated {hotels.length === 1 ? "property" : "properties"}</span>
            <span className="flex items-center gap-2"><Star size={16} className="text-orange-300" fill="currentColor" /> A more personal way to travel</span>
          </div>
        </div>
      </section>

      {!loading && destinations.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pt-12 sm:px-8 sm:pt-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Go somewhere lovely</p>
              <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Browse by destination</h2>
            </div>
            <a href="#hotels" className="hidden items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 sm:inline-flex">
              All stays <ArrowRight size={16} />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {destinations.map(destination => (
              <button
                key={`${destination.city}-${destination.country}`}
                type="button"
                onClick={() => {
                  setSearchQuery(destination.city);
                  document.getElementById("hotels")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group relative h-36 overflow-hidden rounded-2xl bg-indigo-900 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:h-44"
                aria-label={`Explore ${destination.city}, ${destination.country}`}
              >
                {destination.imageUrl && (
                  <img
                    src={destination.imageUrl}
                    alt=""
                    loading="lazy"
                    onError={event => {
                      event.currentTarget.hidden = true;
                    }}
                    className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-110"
                  />
                )}
                <span className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                  <span className="block font-semibold">{destination.city}</span>
                  <span className="mt-0.5 block text-xs text-white/80">
                    {destination.hotelCount} {destination.hotelCount === 1 ? "stay" : "stays"} · {destination.country}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section id="hotels" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-9 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">The StaySmart collection</p>
            <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">
              {searchQuery ? "Stays for your search" : "Places worth staying"}
            </h2>
          </div>
          <span className="text-sm text-slate-500">
            {searchQuery ? `${filteredHotels.length} matching ${filteredHotels.length === 1 ? "stay" : "stays"}` : "Handpicked for your next escape"}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading hotels">
            {[0, 1, 2].map(item => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="h-52 bg-slate-200" />
                <div className="space-y-3 p-6">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Hotel className="mx-auto mb-4 text-indigo-500" size={34} />
            <h3 className="text-xl font-bold text-slate-900">Your next stay is on its way</h3>
            <p className="mt-2 text-sm text-slate-500">There are no properties to explore just yet. Please check back soon.</p>
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Search className="mx-auto mb-4 text-indigo-500" size={32} />
            <h3 className="text-xl font-bold text-slate-900">No stays found</h3>
            <p className="mt-2 text-sm text-slate-500">Try another hotel name, city, or country.</p>
            <button onClick={() => setSearchQuery("")} className="mt-4 font-semibold text-indigo-700 hover:text-indigo-900">
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <article key={hotel._id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-200 via-indigo-400 to-indigo-700">
                  <span className="absolute inset-0 bg-gradient-to-t from-indigo-950/30 to-transparent" />
                  <Hotel size={54} strokeWidth={1.2} className="relative text-white drop-shadow-lg transition duration-300 group-hover:scale-110" />
                  {hotel.imageUrl && (
                    <img
                      src={hotel.imageUrl}
                      alt={`${hotel.name} hotel`}
                      loading="lazy"
                      onError={event => {
                        event.currentTarget.hidden = true;
                      }}
                      className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    A StaySmart stay
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-xl font-bold text-slate-900">{hotel.name}</h3>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-sm font-semibold text-orange-700">
                      <Star size={16} fill="currentColor" />
                      {hotel.rating || "New"}
                    </span>
                  </div>

                  <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={16} />
                    {hotel.city}, {hotel.country}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {hotel.description}
                  </p>

                  <Link
                    to={`/hotels/${hotel._id}`}
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-indigo-700 transition group-hover:gap-3 hover:text-indigo-900"
                  >
                    Discover this stay <ArrowRight size={17} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="about" className="bg-indigo-950 px-6 py-12 text-center text-white">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Stay a little better</p>
        <h2 className="mb-3 text-3xl font-bold">StaySmart</h2>
        <p className="text-sm text-indigo-100">Smarter bookings. Better stays. Thoughtful details.</p>
        <p className="mt-7 border-t border-white/10 pt-5 text-xs text-indigo-200">
          © 2026 StaySmart. All rights reserved.
        </p>
      </section>

    </div>
  );
}

export default App;
