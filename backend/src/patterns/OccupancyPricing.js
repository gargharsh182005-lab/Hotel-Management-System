
import PricingStrategy from "./PricingStrategy.js";

class OccupancyPricing extends PricingStrategy {
  calculatePrice(basePrice, occupancy) {
    if (occupancy > 80) {
      return basePrice * 1.20;
    }

    if (occupancy > 60) {
      return basePrice * 1.10;
    }

    return basePrice;
  }
}

export default OccupancyPricing;
