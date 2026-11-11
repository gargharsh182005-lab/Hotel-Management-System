import Hotel from "../models/Hotel.js";

// Create hotel
export const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      message: "Hotel created successfully",
      hotel
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all active hotels
export const getHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true });

    res.status(200).json({
      count: hotels.length,
      hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get hotel by ID
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({ hotel });
  } catch (error) {
    res.status(400).json({ message: "Invalid hotel ID" });
  }
};

// Update hotel
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({
      message: "Hotel updated successfully",
      hotel
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete hotel (soft delete)
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.status(200).json({
      message: "Hotel deactivated successfully"
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};