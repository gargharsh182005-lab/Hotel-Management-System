
import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    ruleType: {
      type: String,
      enum: ["occupancy", "weekend", "seasonal", "demand"],
      required: true
    },

    threshold: {
      type: Number,
      default: 0
    },

    adjustmentPercentage: {
      type: Number,
      required: true
    },

    priority: {
      type: Number,
      default: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const PricingRule = mongoose.model(
  "PricingRule",
  pricingRuleSchema
);

export default PricingRule;
