
import OccupancyPricing from "./OccupancyPricing.js";
import WeekendPricing from "./WeekendPricing.js";
import SeasonalPricing from "./SeasonalPricing.js";
import DemandPricing from "./DemandPricing.js";

class PricingStrategyFactory {
  static createStrategy(type) {
    switch (type) {
      case "occupancy":
        return new OccupancyPricing();

      case "weekend":
        return new WeekendPricing();

      case "seasonal":
        return new SeasonalPricing();

      case "demand":
        return new DemandPricing();

      default:
        throw new Error("Invalid pricing strategy");
    }
  }
}

export default PricingStrategyFactory;
