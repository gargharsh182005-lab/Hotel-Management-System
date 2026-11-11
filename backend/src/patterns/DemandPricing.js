
import PricingStrategy from "./PricingStrategy.js";

class DemandPricing extends PricingStrategy {
  calculatePrice(basePrice, demandLevel) {
    if (demandLevel === "high") {
      return basePrice * 1.15;
    }

    if (demandLevel === "medium") {
      return basePrice * 1.05;
    }

    return basePrice;
  }
}

export default DemandPricing;
