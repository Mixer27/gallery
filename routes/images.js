var express = require('express');
var router = express.Router();

const image_controller = require("../controllers/imageController");

router.get("/", image_controller.image_list);

module.exports = router;
