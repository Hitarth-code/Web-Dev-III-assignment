const InventoryItem = require("../models/InventoryItem");
const asyncHandler = require("../middleware/asyncHandler");

const getReorderAlerts = asyncHandler(async (req, res) => {
  const alerts = await InventoryItem.aggregate([
    {
      $match: {
        $expr: { $lte: ["$unitsInStock", "$minimumStock"] }
      }
    },
    {
      $project: {
        _id: 1,
        productName: 1,
        itemCode: 1,
        category: 1,
        unitsInStock: 1,
        minimumStock: 1,
        shortage: { $subtract: ["$minimumStock", "$unitsInStock"] }
      }
    },
    { $sort: { shortage: -1, productName: 1 } }
  ]);

  res.status(200).json({
    success: true,
    message: "Reorder report generated",
    result: {
      alertCount: alerts.length,
      items: alerts
    }
  });
});

const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const summary = await InventoryItem.aggregate([
    {
      $group: {
        _id: "$category",
        itemCount: { $sum: 1 },
        totalUnits: { $sum: "$unitsInStock" },
        inventoryValue: {
          $sum: { $multiply: ["$unitPrice", "$unitsInStock"] }
        },
        averageUnitPrice: { $avg: "$unitPrice" }
      }
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        itemCount: 1,
        totalUnits: 1,
        inventoryValue: { $round: ["$inventoryValue", 2] },
        averageUnitPrice: { $round: ["$averageUnitPrice", 2] }
      }
    },
    { $sort: { inventoryValue: -1 } }
  ]);

  res.status(200).json({
    success: true,
    message: "Category report generated",
    result: {
      categoryCount: summary.length,
      categories: summary
    }
  });
});

module.exports = { getReorderAlerts, getCategoryBreakdown };
