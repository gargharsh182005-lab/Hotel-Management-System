
import PricingStrategy from "./PricingStrategy.js";

class WeekendPricing extends PricingStrategy {
  calculatePrice(basePrice, isWeekend) {
    if (isWeekend) {
      return basePrice * 1.10;
    }

    return basePrice;
  }
}

export default WeekendPricing;
