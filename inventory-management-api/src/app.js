const express = require("express");
const inventoryRoutes = require("./routes/inventoryRoutes");
const reportRoutes = require("./routes/reportRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Inventory Management API",
    version: "1.0",
    endpoints: {
      inventory: "/api/v1/inventory",
      reports: "/api/v1/reports"
    }
  });
});

app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/reports", reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
