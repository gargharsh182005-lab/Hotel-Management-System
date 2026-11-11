import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";

const MAX_ROOM_IMAGES = 4;
const MAX_ROOM_IMAGE_BYTES = 1024 * 1024;
const ROOM_IMAGE_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

const validateRoomImages = images => {
  if (!Array.isArray(images) || images.length > MAX_ROOM_IMAGES) {
    return "A room can have at most 4 images";
  }

  for (const image of images) {
    const match = typeof image === "string" && image.match(ROOM_IMAGE_DATA_URL);
    if (!match || Buffer.from(match[1], "base64").length > MAX_ROOM_IMAGE_BYTES) {
      return "Room images must be JPEG, PNG, or WebP files no larger than 1 MB";
    }
  }

  return null;
};

// Create room
export const createRoom = async (req, res) => {
  try {
    const {
      hotel,
      roomType,
      description,
      capacity,
      basePrice,
      totalRooms,
      amenities,
      images = []
    } = req.body;

    const imageError = validateRoomImages(images);
    if (imageError) {
      return res.status(400).json({ message: imageError });
    }

    const existingHotel = await Hotel.findById(hotel);

    if (!existingHotel || !existingHotel.isActive) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const room = await Room.create({
      hotel,
      roomType,
      description,
      capacity,
      basePrice,
      totalRooms,
      amenities,
      images
    });

    res.status(201).json({
      message: "Room created successfully",
      room
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get rooms of a hotel
export const getRoomsByHotel = async (req, res) => {
  try {
    const rooms = await Room.find({
      hotel: req.params.hotelId,
      isActive: true
    }).populate("hotel", "name city");

    res.status(200).json({
      count: rooms.length,
      rooms
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    if (req.body.images !== undefined) {
      const imageError = validateRoomImages(req.body.images);
      if (imageError) {
        return res.status(400).json({ message: imageError });
      }
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room updated successfully",
      room
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete room (soft delete)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      message: "Room deactivated successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};