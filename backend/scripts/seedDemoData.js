import "dotenv/config";
import mongoose from "mongoose";
import Hotel from "../src/models/Hotel.js";
import Room from "../src/models/Room.js";

const demoHotels = [
  {
    name: "Amber Courtyard",
    city: "Jaipur",
    country: "India",
    address: "12 Amer Road, Jaipur, Rajasthan",
    description: "A peaceful heritage-inspired stay close to Jaipur's iconic pink city and hilltop forts.",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85",
    rating: 4.8,
    amenities: ["Pool", "Restaurant", "Free Wi-Fi", "Heritage architecture"],
    rooms: [
      { roomType: "Standard", description: "A comfortable room with warm details and a quiet courtyard outlook.", capacity: 2, basePrice: 4200, totalRooms: 8, amenities: ["Wi-Fi", "Air conditioning"] },
      { roomType: "Suite", description: "A spacious suite with a separate sitting area and handcrafted furnishings.", capacity: 3, basePrice: 7800, totalRooms: 3, amenities: ["Wi-Fi", "Air conditioning", "Lounge area"] }
    ]
  },
  {
    name: "Lakeview Haveli",
    city: "Udaipur",
    country: "India",
    address: "8 Chandpole, Udaipur, Rajasthan",
    description: "A light-filled lakeside retreat with relaxed rooms and views across the old city.",
    imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85",
    rating: 4.9,
    amenities: ["Lake views", "Rooftop dining", "Free Wi-Fi", "Breakfast"],
    rooms: [
      { roomType: "Deluxe", description: "An airy room with locally inspired decor and a cozy window seat.", capacity: 2, basePrice: 5600, totalRooms: 7, amenities: ["Wi-Fi", "Lake view"] },
      { roomType: "Premium", description: "A generous corner suite with a private balcony overlooking the water.", capacity: 3, basePrice: 9400, totalRooms: 2, amenities: ["Wi-Fi", "Balcony", "Lake view"] }
    ]
  },
  {
    name: "Coconut Grove Retreat",
    city: "Goa",
    country: "India",
    address: "4 Holiday Street, Candolim, Goa",
    description: "A laid-back coastal hideaway for slow mornings, garden walks, and sunset evenings.",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85",
    rating: 4.7,
    amenities: ["Outdoor pool", "Garden", "Restaurant", "Beach shuttle"],
    rooms: [
      { roomType: "Standard", description: "A breezy room with natural textures and a leafy garden outlook.", capacity: 2, basePrice: 3800, totalRooms: 10, amenities: ["Wi-Fi", "Air conditioning"] },
      { roomType: "Deluxe", description: "A relaxed poolside room with a private veranda for unwinding.", capacity: 3, basePrice: 6200, totalRooms: 4, amenities: ["Wi-Fi", "Veranda", "Pool access"] }
    ]
  },
  {
    name: "Cardamom Hills",
    city: "Munnar",
    country: "India",
    address: "23 Tea Valley Road, Munnar, Kerala",
    description: "A quiet hillside escape surrounded by tea gardens, misty mornings, and mountain air.",
    imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=85",
    rating: 4.8,
    amenities: ["Mountain views", "Tea garden", "Restaurant", "Nature walks"],
    rooms: [
      { roomType: "Standard", description: "A snug hillside room with a restful view across the tea fields.", capacity: 2, basePrice: 4600, totalRooms: 6, amenities: ["Wi-Fi", "Tea garden view"] },
      { roomType: "Suite", description: "A spacious suite with a private deck and sweeping valley views.", capacity: 3, basePrice: 8200, totalRooms: 3, amenities: ["Wi-Fi", "Private deck", "Valley view"] }
    ]
  },
  {
    name: "Pine & Peak",
    city: "Manali",
    country: "India",
    address: "17 Old Manali Road, Manali, Himachal Pradesh",
    description: "A welcoming mountain lodge with timber accents and a perfect base for alpine adventures.",
    imageUrl: "https://images.unsplash.com/photo-1518732714860-b62714ce0c59?auto=format&fit=crop&w=1200&q=85",
    rating: 4.6,
    amenities: ["Mountain views", "Fireplace", "Cafe", "Free Wi-Fi"],
    rooms: [
      { roomType: "Standard", description: "A warm, comfortable room for a restful night after exploring the hills.", capacity: 2, basePrice: 3400, totalRooms: 9, amenities: ["Wi-Fi", "Heating"] },
      { roomType: "Premium", description: "A roomy mountain-view suite with a fireplace and reading nook.", capacity: 3, basePrice: 6900, totalRooms: 3, amenities: ["Wi-Fi", "Fireplace", "Mountain view"] }
    ]
  },
  {
    name: "Ganga Courtyard",
    city: "Varanasi",
    country: "India",
    address: "6 Assi Ghat Road, Varanasi, Uttar Pradesh",
    description: "A calm city retreat with a leafy courtyard, close to the riverfront and historic lanes.",
    imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85",
    rating: 4.7,
    amenities: ["Courtyard", "Restaurant", "Guided walks", "Free Wi-Fi"],
    rooms: [
      { roomType: "Standard", description: "A serene room with simple comforts and courtyard-inspired details.", capacity: 2, basePrice: 3100, totalRooms: 8, amenities: ["Wi-Fi", "Air conditioning"] },
      { roomType: "Deluxe", description: "A larger room with a sitting area and a peaceful courtyard outlook.", capacity: 3, basePrice: 5200, totalRooms: 4, amenities: ["Wi-Fi", "Sitting area"] }
    ]
  },
  {
    name: "Dune House",
    city: "Jaisalmer",
    country: "India",
    address: "2 Fort Road, Jaisalmer, Rajasthan",
    description: "A golden sandstone stay inspired by desert architecture and the colors of the Thar.",
    imageUrl: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=1200&q=85",
    rating: 4.8,
    amenities: ["Rooftop terrace", "Desert excursions", "Restaurant", "Free Wi-Fi"],
    rooms: [
      { roomType: "Deluxe", description: "A cool, restful room with carved details and warm desert tones.", capacity: 2, basePrice: 4400, totalRooms: 7, amenities: ["Wi-Fi", "Air conditioning"] },
      { roomType: "Suite", description: "A spacious heritage suite with a private terrace and fort views.", capacity: 3, basePrice: 7600, totalRooms: 3, amenities: ["Wi-Fi", "Private terrace", "Fort view"] }
    ]
  },
  {
    name: "Harbor House",
    city: "Kochi",
    country: "India",
    address: "11 River Road, Fort Kochi, Kerala",
    description: "A characterful waterfront base for discovering Kochi's galleries, cafes, and historic harbor.",
    imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
    rating: 4.6,
    amenities: ["Harbor views", "Cafe", "Cycling", "Free Wi-Fi"],
    rooms: [
      { roomType: "Standard", description: "A bright and breezy room with locally crafted accents.", capacity: 2, basePrice: 3600, totalRooms: 8, amenities: ["Wi-Fi", "Air conditioning"] },
      { roomType: "Premium", description: "A corner room with generous space and views toward the harbor.", capacity: 3, basePrice: 6400, totalRooms: 3, amenities: ["Wi-Fi", "Harbor view", "Sitting area"] }
    ]
  }
];

const seedDemoData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Add it to backend/.env before running the demo seed.");
  }

  await mongoose.connect(process.env.MONGO_URI);

  let hotelCount = 0;
  let roomCount = 0;

  for (const { rooms, ...hotelData } of demoHotels) {
    const hotelKey = {
      name: hotelData.name,
      city: hotelData.city,
      country: hotelData.country
    };
    let hotel = await Hotel.findOne(hotelKey);

    if (!hotel) {
      hotel = await Hotel.create(hotelData);
      hotelCount += 1;
    }

    for (const roomData of rooms) {
      const result = await Room.updateOne(
        { hotel: hotel._id, roomType: roomData.roomType },
        { $setOnInsert: { ...roomData, hotel: hotel._id } },
        { upsert: true, runValidators: true }
      );
      roomCount += result.upsertedCount;
    }
  }

  console.log(`Demo catalog ready: ${hotelCount} hotels and ${roomCount} room types added.`);
};

seedDemoData()
  .catch(error => {
    console.error("Unable to seed demo catalog:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
