const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must contain at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    itemCode: {
      type: String,
      required: [true, "Item code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9-]{3,20}$/, "Use 3-20 letters, numbers or hyphens"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"]
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0.01, "Unit price must be greater than zero"]
    },
    unitsInStock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock quantity must be a whole number"
      }
    },
    minimumStock: {
      type: Number,
      default: 5,
      min: [0, "Minimum stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Minimum stock must be a whole number"
      }
    },
    vendor: {
      type: String,
      trim: true,
      default: "Not specified",
      maxlength: [100, "Vendor name cannot exceed 100 characters"]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

inventorySchema.virtual("stockWorth").get(function () {
  return Number((this.unitPrice * this.unitsInStock).toFixed(2));
});

inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("InventoryItem", inventorySchema);
