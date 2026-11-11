
import PricingStrategy from "./PricingStrategy.js";

class SeasonalPricing extends PricingStrategy {
  calculatePrice(basePrice, isPeakSeason) {
    if (isPeakSeason) {
      return basePrice * 1.25;
    }

    return basePrice;
  }
}

export default SeasonalPricing;
