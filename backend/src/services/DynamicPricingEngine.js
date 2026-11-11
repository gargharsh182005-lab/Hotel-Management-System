
import PricingStrategyFactory from "../patterns/PricingStrategyFactory.js";

class DynamicPricingEngine {
  calculateFinalPrice(basePrice, conditions) {
    let currentPrice = basePrice;

    const breakdown = {
      basePrice,
      occupancyCharge: 0,
      weekendCharge: 0,
      seasonalCharge: 0,
      demandCharge: 0
    };

    const strategies = [
      {
        type: "occupancy",
        value: conditions.occupancy,
        key: "occupancyCharge"
      },
      {
        type: "weekend",
        value: conditions.isWeekend,
        key: "weekendCharge"
      },
      {
        type: "seasonal",
        value: conditions.isPeakSeason,
        key: "seasonalCharge"
      },
      {
        type: "demand",
        value: conditions.demandLevel,
        key: "demandCharge"
      }
    ];

    for (const item of strategies) {
      const strategy =
        PricingStrategyFactory.createStrategy(item.type);

      const newPrice = strategy.calculatePrice(
        currentPrice,
        item.value
      );

      breakdown[item.key] = newPrice - currentPrice;
      currentPrice = newPrice;
    }

    const finalPrice = Math.round(currentPrice * 100) / 100;

    return {
      basePrice,
      breakdown,
      finalPrice
    };
  }
}

export default DynamicPricingEngine;
