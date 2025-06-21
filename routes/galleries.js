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

// Obsługa POST: http://localhost/galleries/gallery_delete/:gallery_id
router.post("/gallery_delete/:gallery_id", authenticate, gallery_controller.gallery_delete);

// Wyświetlanie formularza przeglądania galerii GET (/galleries/gallery_browse)
router.get("/gallery_browse", authenticate, gallery_controller.gallery_browse_get);
// Przetwarzanie danych formularza przeglądania galerii POST (/galleries/gallery_browse)
router.post("/gallery_browse", authenticate, gallery_controller.gallery_browse_post);

module.exports = router;
