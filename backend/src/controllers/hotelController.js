import Hotel from "../models/Hotel.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

const getHotelSummaries = filter => Hotel.aggregate([
  { $match: { isActive: true, ...filter } },
  {
    $lookup: {
      from: Review.collection.name,
      let: { hotelId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$hotel", "$$hotelId"] } } },
        { $sort: { createdAt: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: User.collection.name,
            localField: "user",
            foreignField: "_id",
            as: "reviewer"
          }
        },
        { $unwind: { path: "$reviewer", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            rating: 1,
            comment: 1,
            createdAt: 1,
            userName: "$reviewer.name"
          }
        }
      ],
      as: "recentReviews"
    }
  },
  {
    $lookup: {
      from: Review.collection.name,
      let: { hotelId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$hotel", "$$hotelId"] } } },
        {
          $group: {
            _id: null,
            ratingCount: { $sum: 1 },
            averageRating: { $avg: "$rating" }
          }
        }
      ],
      as: "reviewStats"
    }
  },
  {
    $addFields: {
      ratingCount: {
        $ifNull: [{ $arrayElemAt: ["$reviewStats.ratingCount", 0] }, 0]
      },
      rating: {
        $round: [
          { $ifNull: [{ $arrayElemAt: ["$reviewStats.averageRating", 0] }, 0] },
          1
        ]
      }
    }
  },
  { $project: { reviewStats: 0 } }
]);

const isManagerAssignedToHotel = (req, res) => {
  if (
    req.user.role === "manager" &&
    (!req.user.managedHotel || req.user.managedHotel.toString() !== req.params.id)
  ) {
    res.status(403).json({ message: "You can only manage your assigned hotel." });
    return false;
  }
  return true;
};

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
    const hotels = await getHotelSummaries({});

    res.status(200).json({
      count: hotels.length,
      hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getManagedHotels = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "manager") {
      if (!req.user.managedHotel) {
        return res.status(403).json({ message: "No hotel is assigned to this manager." });
      }
      filter._id = req.user.managedHotel;
    }

    const hotels = await getHotelSummaries(filter);
    const managers = await User.find({
      role: "manager",
      managedHotel: { $in: hotels.map(hotel => hotel._id) }
    }).select("name email managedHotel").lean();
    const managersByHotel = new Map(
      managers.map(manager => [manager.managedHotel.toString(), manager])
    );

    res.status(200).json({
      count: hotels.length,
      hotels: hotels.map(hotel => ({
        ...hotel,
        manager: managersByHotel.get(hotel._id.toString()) || null
      }))
    });
  } catch (error) {
    console.error("Managed hotel list error:", error);
    res.status(500).json({ message: "Unable to load managed hotels." });
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
    if (!isManagerAssignedToHotel(req, res)) {
      return;
    }

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
    if (!isManagerAssignedToHotel(req, res)) {
      return;
    }

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