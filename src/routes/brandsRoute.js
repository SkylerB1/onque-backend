const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const Controller = require("../controller/brandsController");

router.post('/create', verifyToken, Controller.createBrand);
router.get('/', verifyToken, Controller.getUserSpecificBrands);
router.get('/:id', verifyToken, Controller.getSpecificBrandById);
router.put("/:id", verifyToken, Controller.updateBrand);
router.patch("/:id", verifyToken, Controller.activeBrand);
router.delete("/:id", verifyToken, Controller.deleteBrand);

module.exports = router;