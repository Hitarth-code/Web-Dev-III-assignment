const mongoose = require("mongoose");
const InventoryItem = require("../models/InventoryItem");
const asyncHandler = require("../middleware/asyncHandler");
const {
  buildInventoryFilter,
  parsePositiveInteger,
  buildSort
} = require("../utils/queryTools");

const createItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.create(req.body);

  res.status(201).json({
    success: true,
    message: "Inventory item created",
    result: { item }
  });
});

const listItems = asyncHandler(async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1, 100000);
  const limit = parsePositiveInteger(req.query.limit, 10, 100);
  const filter = buildInventoryFilter(req.query);

  if (req.query.minPrice !== undefined && (!Number.isFinite(Number(req.query.minPrice)) || Number(req.query.minPrice) < 0)) {
    const error = new Error("minPrice must be a non-negative number");
    error.statusCode = 400;
    throw error;
  }

  if (req.query.maxPrice !== undefined && (!Number.isFinite(Number(req.query.maxPrice)) || Number(req.query.maxPrice) < 0)) {
    const error = new Error("maxPrice must be a non-negative number");
    error.statusCode = 400;
    throw error;
  }

  const [items, totalItems] = await Promise.all([
    InventoryItem.find(filter)
      .sort(buildSort(req.query))
      .skip((page - 1) * limit)
      .limit(limit),
    InventoryItem.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    message: "Inventory loaded",
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    },
    result: items
  });
});

const getItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findById(req.params.id);

  if (!item) {
    const error = new Error("Inventory item was not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    result: { item }
  });
});

const updateItem = asyncHandler(async (req, res) => {
  const blockedFields = ["_id", "itemCode", "createdAt", "updatedAt"];
  const attemptedBlockedField = Object.keys(req.body).find((key) => blockedFields.includes(key));

  if (attemptedBlockedField) {
    const error = new Error(`The field '${attemptedBlockedField}' cannot be changed here`);
    error.statusCode = 400;
    throw error;
  }

  const item = await InventoryItem.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true, context: "query" }
  );

  if (!item) {
    const error = new Error("Inventory item was not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Inventory details updated",
    result: { item }
  });
});

const deleteItem = asyncHandler(async (req, res) => {
  const removedItem = await InventoryItem.findByIdAndDelete(req.params.id);

  if (!removedItem) {
    const error = new Error("Inventory item was not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Inventory item removed",
    result: {
      removedId: removedItem._id,
      productName: removedItem.productName
    }
  });
});

const adjustQuantity = asyncHandler(async (req, res) => {
  const change = Number(req.body.change);

  if (!Number.isInteger(change) || change === 0) {
    const error = new Error("change must be a non-zero whole number");
    error.statusCode = 400;
    throw error;
  }

  const conditions = { _id: req.params.id };
  if (change < 0) {
    conditions.unitsInStock = { $gte: Math.abs(change) };
  }

  const item = await InventoryItem.findOneAndUpdate(
    conditions,
    { $inc: { unitsInStock: change } },
    { new: true, runValidators: true }
  );

  if (!item) {
    const exists = await InventoryItem.exists({ _id: req.params.id });
    const error = new Error(exists ? "Insufficient stock for this adjustment" : "Inventory item was not found");
    error.statusCode = exists ? 409 : 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: change > 0 ? "Stock increased" : "Stock reduced",
    result: {
      itemId: item._id,
      productName: item.productName,
      changeApplied: change,
      remainingUnits: item.unitsInStock
    }
  });
});

module.exports = { createItem, listItems, getItem, updateItem, deleteItem, adjustQuantity };
