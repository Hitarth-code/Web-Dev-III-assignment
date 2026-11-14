const express = require("express");
const {
  createItem,
  listItems,
  getItem,
  updateItem,
  deleteItem,
  adjustQuantity
} = require("../controllers/inventoryController");

const router = express.Router();

router.route("/")
  .post(createItem)
  .get(listItems);

router.patch("/:id/quantity", adjustQuantity);
router.route("/:id")
  .get(getItem)
  .patch(updateItem)
  .delete(deleteItem);

module.exports = router;
