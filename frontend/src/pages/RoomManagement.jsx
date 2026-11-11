
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BedDouble,
  CheckCircle2,
  CircleDollarSign,
  ImagePlus,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users
} from "lucide-react";
import API from "../api";

export default function RoomManagement() {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);
  const [roomImages, setRoomImages] = useState([]);
  const [editingRoomId, setEditingRoomId] = useState("");
  const [deletingRoomId, setDeletingRoomId] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("All");
  const hotelRequestId = useRef(0);
  const roomRequestId = useRef(0);
  const maxRoomImages = 4;
  const maxRoomImageBytes = 1024 * 1024;

  const [form, setForm] = useState({
    hotel: "",
    roomType: "Standard",
    description: "",
    capacity: 2,
    basePrice: 2000,
    totalRooms: 5,
    amenities: ""
  });

  const token = localStorage.getItem("token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const filteredRooms = rooms.filter(room => {
    const query = roomSearch.trim().toLowerCase();
    const matchesQuery = !query || [
      room.roomType,
      room.description,
      ...(room.amenities || [])
    ].some(value => value.toLowerCase().includes(query));
    const matchesType = roomTypeFilter === "All" || room.roomType === roomTypeFilter;

    return matchesQuery && matchesType;
  });
  const totalRooms = rooms.reduce((total, room) => total + Number(room.totalRooms || 0), 0);
  const averagePrice = rooms.length
    ? Math.round(rooms.reduce((total, room) => total + Number(room.basePrice || 0), 0) / rooms.length)
    : 0;

  // Fetch hotels
  useEffect(() => {
    const requestId = ++hotelRequestId.current;

    const fetchHotels = async () => {
      try {
        const response = await API.get("/api/hotels");
        if (requestId === hotelRequestId.current) {
          setHotels(response.data.hotels || []);
        }
      } catch (error) {
        console.error("Hotel loading error:", error);
        if (requestId === hotelRequestId.current) {
          setMessage("Unable to load hotels.");
        }
      }
    };

    fetchHotels();

    return () => {
      hotelRequestId.current += 1;
      roomRequestId.current += 1;
    };
  }, []);

  // Fetch rooms belonging to selected hotel
  const fetchRooms = async (hotelId) => {
    const requestId = ++roomRequestId.current;

    if (!hotelId) {
      setRooms([]);
      setLoading(false);
      return;
    }

    setRooms([]);
    setLoading(true);

    try {
      const response = await API.get(
        `/api/rooms/hotel/${hotelId}`
      );

      if (requestId === roomRequestId.current) {
        setRooms(response.data.rooms || []);
      }
    } catch (error) {
      console.error("Room loading error:", error);
      if (requestId === roomRequestId.current) {
        setMessage(
          error.response?.data?.message || "Unable to load rooms."
        );
      }
    } finally {
      if (requestId === roomRequestId.current) {
        setLoading(false);
      }
    }
  };

  // Handle hotel selection
  const handleHotelChange = (hotelId) => {
    setEditingRoomId("");
    setRoomImages([]);
    setForm(prev => ({
      ...prev,
      hotel: hotelId,
      description: "",
      amenities: ""
    }));

    setMessage("");
    fetchRooms(hotelId);
  };

  const resetRoomForm = () => {
    setEditingRoomId("");
    setRoomImages([]);
    setForm(prev => ({
      ...prev,
      roomType: "Standard",
      description: "",
      capacity: 2,
      basePrice: 2000,
      totalRooms: 5,
      amenities: ""
    }));
  };

  const addRoomImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (roomImages.length + files.length > maxRoomImages) {
      setMessage(`You can add up to ${maxRoomImages} room photos.`);
      return;
    }

    const invalidFile = files.find(file =>
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > maxRoomImageBytes
    );
    if (invalidFile) {
      setMessage("Choose JPEG, PNG, or WebP images no larger than 1 MB each.");
      return;
    }

    try {
      setProcessingImages(true);
      const dataUrls = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`));
        reader.readAsDataURL(file);
      })));
      setRoomImages(current => [...current, ...dataUrls]);
      setMessage("");
    } catch (error) {
      console.error("Room image loading error:", error);
      setMessage(error.message || "Unable to read the selected room photos.");
    } finally {
      setProcessingImages(false);
    }
  };

  const editRoom = (room) => {
    setEditingRoomId(room._id);
    setRoomImages(room.images || []);
    setForm(prev => ({
      ...prev,
      hotel: form.hotel,
      roomType: room.roomType,
      description: room.description,
      capacity: room.capacity,
      basePrice: room.basePrice,
      totalRooms: room.totalRooms,
      amenities: (room.amenities || []).join(", ")
    }));
    setMessage("");
  };

  const saveRoom = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Please log in as an admin first.");
      return;
    }

    if (!form.hotel) {
      setMessage("Please select a hotel.");
      return;
    }

    const capacity = Number(form.capacity);
    const basePrice = Number(form.basePrice);
    const totalRooms = Number(form.totalRooms);
    const description = form.description.trim();

    if (!description) {
      setMessage("Please enter a room description.");
      return;
    }

    if (!Number.isInteger(capacity) || capacity < 1) {
      setMessage("Guest capacity must be a whole number greater than zero.");
      return;
    }

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      setMessage("Price per night must be zero or greater.");
      return;
    }

    if (!Number.isInteger(totalRooms) || totalRooms < 1) {
      setMessage("Total rooms must be a whole number greater than zero.");
      return;
    }

    try {
      setCreating(true);

      const roomData = {
        roomType: form.roomType,
        description,
        capacity,
        basePrice,
        totalRooms,
        amenities: form.amenities
          .split(",")
          .map(item => item.trim())
          .filter(Boolean),
        images: roomImages
      };

      const response = editingRoomId
        ? await API.put(`/api/rooms/${editingRoomId}`, roomData, config)
        : await API.post("/api/rooms", { ...roomData, hotel: form.hotel }, config);

      setMessage(
        response.data.message || (editingRoomId ? "Room updated successfully!" : "Room created successfully!")
      );

      resetRoomForm();

      await fetchRooms(form.hotel);

    } catch (error) {
      console.error(
        "Room creation error:",
        error.response?.data || error
      );

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";

      setMessage(
        `Room ${editingRoomId ? "update" : "creation"} failed: ${errorMessage} (Status: ${
          error.response?.status || "No response"
        })`
      );
    } finally {
      setCreating(false);
    }
  };

  const deactivateRoom = async (room) => {
    if (!window.confirm(`Deactivate the ${room.roomType} room type? It will no longer appear to guests.`)) {
      return;
    }

    try {
      setDeletingRoomId(room._id);
      setMessage("");
      const response = await API.delete(`/api/rooms/${room._id}`, config);
      setMessage(response.data.message || "Room deactivated successfully.");
      if (editingRoomId === room._id) {
        resetRoomForm();
      }
      await fetchRooms(form.hotel);
    } catch (error) {
      console.error("Room deactivation error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Unable to deactivate room.");
    } finally {
      setDeletingRoomId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="border-b border-white/10 bg-indigo-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-indigo-200">
              <BedDouble size={21} />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">StaySmart</span>
              <span className="block text-xs text-indigo-200">Property admin</span>
            </span>
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-100 transition hover:bg-white/10 hover:text-white"
          >
            Dashboard <ArrowUpRight size={16} />
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              Property operations
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Room management
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Create room types, set nightly rates, and keep your hotel inventory up to date.
            </p>
          </div>
          <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <BedDouble size={20} />
            </span>
            <span>
              <span className="block text-2xl font-bold leading-none text-slate-900">{totalRooms}</span>
              <span className="mt-1 block text-xs font-medium text-slate-500">Rooms in inventory</span>
            </span>
          </div>
        </header>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
              message.toLowerCase().includes("success")
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
            <p>{message}</p>
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form
            onSubmit={saveRoom}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                  <Plus size={21} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{editingRoomId ? "Edit room type" : "Add a room type"}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {editingRoomId ? "Update pricing, capacity, or room details." : "Set up the details guests will see."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-7">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="hotel-select">
                  Hotel
                </label>
                <select
                  id="hotel-select"
                  required
                  value={form.hotel}
                  onChange={e => handleHotelChange(e.target.value)}
                  disabled={creating || Boolean(editingRoomId)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50"
                >
                  <option value="">Choose a hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="room-type">
                  Room type
                </label>
                <select
                  id="room-type"
                  value={form.roomType}
                  onChange={e => setForm(prev => ({ ...prev, roomType: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                >
                  {["Standard", "Deluxe", "Suite", "Premium"].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="room-description">
                  Description
                </label>
                <textarea
                  id="room-description"
                  required
                  rows="3"
                  placeholder="Describe the room and what makes it special"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="room-capacity">
                  Guest capacity
                  <span className="relative mt-2 block">
                    <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="room-capacity"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.capacity}
                      onChange={e => setForm(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </span>
                </label>

                <label className="text-sm font-semibold text-slate-700" htmlFor="room-price">
                  Price per night
                  <span className="relative mt-2 block">
                    <CircleDollarSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="room-price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.basePrice}
                      onChange={e => setForm(prev => ({ ...prev, basePrice: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </span>
                </label>

                <label className="text-sm font-semibold text-slate-700 sm:col-span-2" htmlFor="room-total">
                  Number of rooms in this type
                  <span className="relative mt-2 block">
                    <Layers3 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="room-total"
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={form.totalRooms}
                      onChange={e => setForm(prev => ({ ...prev, totalRooms: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm font-normal text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    />
                  </span>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="room-amenities">
                  Amenities <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <input
                  id="room-amenities"
                  placeholder="Wi-Fi, breakfast, city view"
                  value={form.amenities}
                  onChange={e => setForm(prev => ({ ...prev, amenities: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
                <p className="mt-1.5 text-xs text-slate-400">Separate amenities with commas.</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="room-images">
                  Room photos <span className="font-normal text-slate-400">(optional, up to 4)</span>
                </label>
                <label
                  htmlFor="room-images"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-4 text-sm font-semibold text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <ImagePlus size={18} />
                  {processingImages ? "Preparing photos..." : "Choose photos"}
                </label>
                <input
                  id="room-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={creating || processingImages || roomImages.length >= maxRoomImages}
                  onChange={addRoomImages}
                  className="sr-only"
                />
                <p className="mt-1.5 text-xs text-slate-400">JPEG, PNG, or WebP; up to 1 MB per photo. {roomImages.length}/{maxRoomImages} selected.</p>
                {roomImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {roomImages.map((image, index) => (
                      <div key={`${index}-${image.slice(0, 40)}`} className="relative">
                        <img
                          src={image}
                          alt={`Room photo ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setRoomImages(current => current.filter((_, imageIndex) => imageIndex !== index))}
                          disabled={creating || processingImages}
                          aria-label={`Remove room photo ${index + 1}`}
                          className="absolute right-1 top-1 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={creating || processingImages}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    {editingRoomId ? "Saving changes..." : "Creating room..."}
                  </>
                ) : (
                  <>
                    {editingRoomId ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                    {editingRoomId ? "Save changes" : "Add room type"}
                  </>
                )}
              </button>
              {editingRoomId && (
                <button
                  type="button"
                  onClick={resetRoomForm}
                  disabled={creating || processingImages}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel editing
                </button>
              )}
            </div>
          </form>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <BedDouble size={21} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Room inventory</h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {form.hotel ? `${rooms.length} room type${rooms.length === 1 ? "" : "s"} found` : "Select a hotel to get started"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => fetchRooms(form.hotel)}
                disabled={!form.hotel || loading}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
                title="Refresh rooms"
                aria-label="Refresh rooms"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} size={17} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {form.hotel && !loading && rooms.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-indigo-50/70 p-4">
                      <p className="text-xs font-medium text-slate-500">Room types</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{rooms.length}</p>
                    </div>
                    <div className="rounded-xl bg-orange-50/70 p-4">
                      <p className="text-xs font-medium text-slate-500">Average nightly rate</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        ₹{averagePrice.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="relative min-w-0 flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                      <input
                        type="search"
                        value={roomSearch}
                        onChange={event => setRoomSearch(event.target.value)}
                        placeholder="Search rooms or amenities"
                        aria-label="Search room types and amenities"
                        className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </label>
                    <select
                      value={roomTypeFilter}
                      onChange={event => setRoomTypeFilter(event.target.value)}
                      aria-label="Filter rooms by type"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                    >
                      {["All", "Standard", "Deluxe", "Suite", "Premium"].map(type => (
                        <option key={type} value={type}>{type === "All" ? "All room types" : type}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {!form.hotel ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-white text-slate-400 shadow-sm">
                    <BedDouble size={25} />
                  </span>
                  <h3 className="font-semibold text-slate-800">Choose a property</h3>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                    Select a hotel in the form to browse its room inventory.
                  </p>
                </div>
              ) : loading ? (
                <div className="space-y-4" aria-label="Loading rooms">
                  {[0, 1, 2].map(item => (
                    <div key={item} className="animate-pulse rounded-xl border border-slate-100 p-5">
                      <div className="mb-3 h-4 w-1/3 rounded bg-slate-200" />
                      <div className="mb-5 h-3 w-2/3 rounded bg-slate-100" />
                      <div className="flex gap-3">
                        <div className="h-8 w-20 rounded-lg bg-slate-100" />
                        <div className="h-8 w-24 rounded-lg bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
                  <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-white text-indigo-500 shadow-sm">
                    <Sparkles size={24} />
                  </span>
                  <h3 className="font-semibold text-slate-800">A fresh start</h3>
                  <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                    This hotel has no room types yet. Add one with the form to build your inventory.
                  </p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
                  <Search className="mx-auto mb-3 text-slate-400" size={24} />
                  <h3 className="font-semibold text-slate-800">No matching room types</h3>
                  <p className="mt-1 text-sm text-slate-500">Try another search or choose a different room type.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setRoomSearch("");
                      setRoomTypeFilter("All");
                    }}
                    className="mt-3 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRooms.map(room => (
                    <article
                      key={room._id}
                      className="rounded-xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-md hover:shadow-slate-100"
                    >
                      {room.images?.length > 0 && (
                        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {room.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${room.roomType} room photo ${index + 1}`}
                              className="h-24 w-full rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <span className="mb-2 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-indigo-700">
                            {room.roomType}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900">{room.roomType} room</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{room.description}</p>
                        </div>
                        <p className="shrink-0 text-left sm:text-right">
                          <span className="block text-xl font-bold text-slate-900">
                            ₹{Number(room.basePrice).toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-slate-500">per night</span>
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                          <Users size={14} className="text-slate-400" />
                          {room.capacity} guests
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                          <Layers3 size={14} className="text-slate-400" />
                          {room.totalRooms} rooms
                        </span>
                      </div>

                      {room.amenities?.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {room.amenities.map(amenity => (
                            <span
                              key={amenity}
                              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                          type="button"
                          onClick={() => editRoom(room)}
                          disabled={creating || Boolean(deletingRoomId)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Pencil size={15} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deactivateRoom(room)}
                          disabled={creating || Boolean(deletingRoomId)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingRoomId === room._id ? (
                            <RefreshCw className="animate-spin" size={15} />
                          ) : (
                            <Trash2 size={15} />
                          )}
                          {deletingRoomId === room._id ? "Deactivating..." : "Deactivate"}
                        </button>
                      </div>
                    </article>
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
