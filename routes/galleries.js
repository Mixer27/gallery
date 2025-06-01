var express = require('express');
var router = express.Router();

const gallery_controller = require("../controllers/galleryController");

// Middleware autentykacji
const authenticate = require('../middleware/authenticate');

router.get("/", gallery_controller.gallery_list);

// Obsługa GET: http://localhost/galleries/gallery_add
router.get("/gallery_add", authenticate, gallery_controller.gallery_add_get);

// Obsługa POST: http://localhost/galleries/gallery_add
router.post("/gallery_add", authenticate, gallery_controller.gallery_add_post);

module.exports = router;
