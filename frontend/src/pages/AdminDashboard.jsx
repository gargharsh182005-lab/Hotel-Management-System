
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Hotel,
  PlusCircle,
  Trash2,
  RefreshCw,
  BedDouble,
  CalendarDays,
  MessageSquareText,
  UserRound,
  Pencil,
  X
} from "lucide-react";
import API from "../api";

export default function AdminDashboard() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [creatingManager, setCreatingManager] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [savingManager, setSavingManager] = useState(false);
  const [managerEditError, setManagerEditError] = useState("");
  const [managerEditForm, setManagerEditForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [managerForm, setManagerForm] = useState({
    hotelId: "",
    name: "",
    email: "",
    password: ""
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "India",
    imageUrl: "",
    amenities: "",
    rating: 0
  });

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = currentUser?.role === "admin";
  const dashboardPath = isAdmin ? "/admin" : "/manager";

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // Fetch all active hotels
  const fetchHotels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/hotels/management", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHotels(response.data.hotels);
    } catch (error) {
      setMessage("Unable to load hotels.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // Create a new hotel
  const createHotel = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.post(
        "/api/hotels",
        {
          ...form,
          imageUrl: form.imageUrl.trim(),
          amenities: form.amenities
            .split(",")
            .map(item => item.trim())
            .filter(Boolean),
          rating: Number(form.rating)
        },
        config
      );

      setMessage("Hotel created successfully!");

      setForm({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "India",
        imageUrl: "",
        amenities: "",
        rating: 0
      });

      fetchHotels();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Hotel creation failed."
      );
    }
  };

  const createManager = async event => {
    event.preventDefault();
    setMessage("");
    setCreatingManager(true);

    try {
      const response = await API.post("/api/admin/managers", managerForm, config);
      setMessage(response.data.message || "Manager account created successfully.");
      setManagerForm({ hotelId: "", name: "", email: "", password: "" });
      await fetchHotels();
    } catch (error) {
      setMessage(error.response?.data?.message || "Manager creation failed.");
    } finally {
      setCreatingManager(false);
    }
  };

  const startEditingManager = (hotel) => {
    setEditingManager({ id: hotel.manager._id, hotelName: hotel.name });
    setManagerEditForm({
      name: hotel.manager.name,
      email: hotel.manager.email,
      password: ""
    });
    setManagerEditError("");
  };

  const updateManager = async event => {
    event.preventDefault();
    setManagerEditError("");
    setSavingManager(true);

    const updates = {
      name: managerEditForm.name,
      email: managerEditForm.email
    };
    if (managerEditForm.password) {
      updates.password = managerEditForm.password;
    }

    try {
      const response = await API.patch(
        `/api/admin/managers/${editingManager.id}`,
        updates,
        config
      );
      setEditingManager(null);
      setMessage(response.data.message || "Hotel manager updated successfully.");
      await fetchHotels();
    } catch (error) {
      setManagerEditError(error.response?.data?.message || "Manager update failed.");
    } finally {
      setSavingManager(false);
    }
  };

  // Deactivate a hotel
  const deleteHotel = async (id) => {
    if (!window.confirm("Deactivate this hotel?")) return;

    try {
      await API.delete(`/api/hotels/${id}`, config);
      setMessage("Hotel deactivated successfully.");
      fetchHotels();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Deletion failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-white/10 bg-indigo-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to={dashboardPath} className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-indigo-200">
              <Hotel size={21} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">StaySmart</span>
              <span className="block text-xs text-indigo-200">{isAdmin ? "Property admin" : "Hotel manager"}</span>
            </span>
          </Link>
          <Link to="/" className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white">
            View website
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              {isAdmin ? "Administration" : "Hotel operations"}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {isAdmin ? "Your properties" : "Your hotel"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isAdmin ? "Manage all properties and assign their hotel managers." : "Manage your assigned hotel's rooms and guest stays."}
            </p>
          </div>
          <Link
            to={`${dashboardPath}/bookings`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <CalendarDays size={18} /> Track bookings
          </Link>
          <Link
            to={`${dashboardPath}/rooms`}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800"
          >
            <BedDouble size={18} /> Manage rooms
          </Link>
        </div>

        {isAdmin && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <span className="mb-5 grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
              <Hotel size={22} />
            </span>
            <p className="text-sm font-medium text-slate-500">Active properties</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{hotels.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <span className="mb-5 grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <PlusCircle size={22} />
            </span>
            <p className="text-sm font-medium text-slate-500">Property tools</p>
            <p className="mt-1 text-xl font-bold text-slate-950">Hotel creation</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <span className="mb-5 grid size-11 place-items-center rounded-xl bg-orange-50 text-orange-700">
              <RefreshCw size={22} />
            </span>
            <p className="text-sm font-medium text-slate-500">Booking experience</p>
            <p className="mt-1 text-xl font-bold text-slate-950">Live availability</p>
          </div>
        </div>
        )}

        {message && (
          <p role="status" aria-live="polite" className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-800">
            {message}
          </p>
        )}

        {editingManager && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-manager-title"
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="edit-manager-title" className="text-lg font-bold text-slate-950">Edit hotel manager</h2>
                  <p className="mt-1 text-sm text-slate-500">{editingManager.hotelName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingManager(null)}
                  className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                  aria-label="Close edit manager form"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={updateManager} className="mt-5 space-y-4">
                <input
                  required
                  value={managerEditForm.name}
                  onChange={event => setManagerEditForm(current => ({ ...current, name: event.target.value }))}
                  placeholder="Manager name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
                <input
                  required
                  type="email"
                  value={managerEditForm.email}
                  onChange={event => setManagerEditForm(current => ({ ...current, email: event.target.value }))}
                  placeholder="Manager email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
                <input
                  type="password"
                  minLength={8}
                  value={managerEditForm.password}
                  onChange={event => setManagerEditForm(current => ({ ...current, password: event.target.value }))}
                  placeholder="New password (leave blank to keep current)"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
                {managerEditError && (
                  <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{managerEditError}</p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingManager(null)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingManager}
                    className="rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingManager ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {isAdmin && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Create a hotel manager</h2>
            <p className="mt-1 text-sm text-slate-500">Each hotel can have one manager. Share the password with the manager securely.</p>
            <form onSubmit={createManager} className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <select
                required
                value={managerForm.hotelId}
                onChange={event => setManagerForm(current => ({ ...current, hotelId: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm"
              >
                <option value="">Choose an unassigned hotel</option>
                {hotels.filter(hotel => !hotel.manager).map(hotel => (
                  <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                ))}
              </select>
              <input
                required
                value={managerForm.name}
                onChange={event => setManagerForm(current => ({ ...current, name: event.target.value }))}
                placeholder="Manager name"
                autoComplete="name"
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
              />
              <input
                required
                type="email"
                value={managerForm.email}
                onChange={event => setManagerForm(current => ({ ...current, email: event.target.value }))}
                placeholder="Manager email"
                autoComplete="email"
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
              />
              <input
                required
                type="password"
                minLength={8}
                value={managerForm.password}
                onChange={event => setManagerForm(current => ({ ...current, password: event.target.value }))}
                placeholder="Temporary password"
                autoComplete="new-password"
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
              />
              <button
                type="submit"
                disabled={creatingManager || !hotels.some(hotel => !hotel.manager)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserRound size={17} /> {creatingManager ? "Creating..." : "Create manager"}
              </button>
            </form>
          </section>
        )}

        <div className={`grid items-start gap-6 ${isAdmin ? "xl:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]" : ""}`}>
          {isAdmin && <form
            onSubmit={createHotel}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-6 py-5">
              <h2 className="text-lg font-bold text-slate-950">Add a property</h2>
              <p className="mt-1 text-sm text-slate-500">Share the details guests need to find their stay.</p>
            </div>
            <div className="space-y-4 p-6">
              {[
                ["name", "Hotel name"],
                ["description", "Description"],
                ["address", "Street address"],
                ["city", "City"],
                ["country", "Country"],
                ["imageUrl", "Hotel photo URL (optional)"],
                ["amenities", "Amenities (comma separated)"]
              ].map(([key, placeholder]) => (
                <input
                  key={key}
                  type={key === "imageUrl" ? "url" : "text"}
                  required={key !== "amenities" && key !== "imageUrl"}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              ))}
              {form.imageUrl && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={form.imageUrl}
                    alt="Hotel photo preview"
                    onError={event => {
                      event.currentTarget.hidden = true;
                    }}
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 p-3.5 text-sm font-bold text-white transition hover:bg-indigo-800"
              >
                <PlusCircle size={18} /> Add property
              </button>
            </div>
          </form>}

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Your properties</h2>
                <p className="mt-1 text-sm text-slate-500">{hotels.length} active listings</p>
              </div>
              <button
                type="button"
                onClick={fetchHotels}
                disabled={loading}
                className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
                title="Refresh hotels"
                aria-label="Refresh hotels"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} size={17} />
              </button>
            </div>

            <div className="space-y-3 p-5 sm:p-6">
              {loading ? (
                [0, 1, 2].map(item => (
                  <div key={item} className="animate-pulse rounded-xl border border-slate-100 p-4">
                    <div className="flex gap-4">
                      <div className="size-16 rounded-lg bg-slate-200" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-4 w-1/2 rounded bg-slate-200" />
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                      </div>
                    </div>
                  </div>
                ))
              ) : hotels.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
                  <Hotel className="mx-auto mb-3 text-indigo-500" size={28} />
                  <p className="font-semibold text-slate-800">No properties yet</p>
                  <p className="mt-1 text-sm text-slate-500">Add your first hotel using the form.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hotels.map(hotel => (
                    <div
                      key={hotel._id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-indigo-100 text-indigo-600">
                          <Hotel size={25} />
                          {hotel.imageUrl && (
                            <img
                              src={hotel.imageUrl}
                              alt={hotel.name}
                              loading="lazy"
                              onError={event => {
                                event.currentTarget.hidden = true;
                              }}
                              className="absolute inset-0 size-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-900">{hotel.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{hotel.city}, {hotel.country}</p>
                          {hotel.manager ? (
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                              <p>
                                Manager: <span className="font-semibold">{hotel.manager.name}</span> · {hotel.manager.email}
                              </p>
                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => startEditingManager(hotel)}
                                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 font-semibold text-indigo-700 transition hover:bg-indigo-50"
                                  aria-label={`Edit manager for ${hotel.name}`}
                                >
                                  <Pencil size={13} /> Edit
                                </button>
                              )}
                            </div>
                          ) : isAdmin ? (
                            <p className="mt-1 text-xs font-semibold text-amber-700">Manager not assigned</p>
                          ) : null}
                          <p className="mt-1 text-sm text-orange-700">
                            ★ {hotel.ratingCount ? hotel.rating.toFixed(1) : "New"}/5
                            <span className="ml-2 text-xs text-slate-500">
                              ({hotel.ratingCount || 0} {hotel.ratingCount === 1 ? "rating" : "ratings"})
                            </span>
                          </p>
                          <div className="mt-3 space-y-2">
                            {(hotel.recentReviews || []).length === 0 ? (
                              <p className="text-xs text-slate-500">No guest reviews yet.</p>
                            ) : hotel.recentReviews.map((review, index) => (
                              <div key={`${hotel._id}-review-${index}`} className="rounded-lg bg-slate-50 p-2.5">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                  <MessageSquareText size={13} />
                                  {review.userName || "Guest"} · {review.rating}/5
                                </p>
                                {review.comment && (
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{review.comment}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {isAdmin && <button
                        type="button"
                        onClick={() => deleteHotel(hotel._id)}
                        className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-700"
                        title="Deactivate hotel"
                        aria-label={`Deactivate ${hotel.name}`}
                      >
                        <Trash2 size={19} />
                      </button>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
