
class PricingStrategy {
  constructor() {
    if (new.target === PricingStrategy) {
      throw new Error("PricingStrategy is an abstract class");
    }
  }

  calculatePrice(basePrice) {
    throw new Error("calculatePrice() must be implemented");
  }
}

export default PricingStrategy;
