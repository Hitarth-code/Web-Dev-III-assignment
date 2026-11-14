function buildInventoryFilter(query) {
  const filter = {};

  if (query.category) {
    filter.category = new RegExp(`^${escapeRegex(query.category)}$`, "i");
  }

  if (query.search) {
    const searchTerm = escapeRegex(query.search);
    filter.$or = [
      { productName: new RegExp(searchTerm, "i") },
      { itemCode: new RegExp(searchTerm, "i") },
      { vendor: new RegExp(searchTerm, "i") }
    ];
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.unitPrice = {};
    if (query.minPrice !== undefined) filter.unitPrice.$gte = Number(query.minPrice);
    if (query.maxPrice !== undefined) filter.unitPrice.$lte = Number(query.maxPrice);
  }

  if (query.stockStatus === "low") {
    filter.$expr = { $lte: ["$unitsInStock", "$minimumStock"] };
  } else if (query.stockStatus === "available") {
    filter.unitsInStock = { $gt: 0 };
  } else if (query.stockStatus === "out") {
    filter.unitsInStock = 0;
  }

  return filter;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePositiveInteger(value, fallback, maximum) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function buildSort(query) {
  const allowedFields = ["productName", "itemCode", "category", "unitPrice", "unitsInStock", "createdAt"];
  const field = allowedFields.includes(query.sortBy) ? query.sortBy : "createdAt";
  const direction = query.order === "asc" ? 1 : -1;
  return { [field]: direction };
}

module.exports = { buildInventoryFilter, parsePositiveInteger, buildSort };
