const express = require("express");
const {
  getReorderAlerts,
  getCategoryBreakdown
} = require("../controllers/reportController");

const router = express.Router();

router.get("/reorder-alerts", getReorderAlerts);
router.get("/category-breakdown", getCategoryBreakdown);

module.exports = router;
