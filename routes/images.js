var express = require('express');
var router = express.Router();
const authenticate = require('../middleware/authenticate');

const image_controller = require("../controllers/imageController");

router.get("/", authenticate, image_controller.image_list);

// Wyświetlania powiększonego obrazka
router.get("/image_show", authenticate, image_controller.image_show_get);

//Wyświetlanie formularza dodawania obrazka - GET.
router.get("/image_add", authenticate, image_controller.image_add_get);
//Przetwarzanie danych formularza dodawania obrazka - POST.
router.post("/image_add", authenticate, image_controller.image_add_post);

//Update obrazka - GET.
router.get("/image_update", authenticate, image_controller.image_update_get);
//Update obrazka - POST
router.post("/image_update", authenticate, image_controller.image_update_post);

//Delete obrazka - DEL.
router.post("/image_delete/:image_id", authenticate,
image_controller.image_delete);

//Wyświetlanie formularza uploadu obrazka - GET.
router.get("/image_upload", authenticate, image_controller.image_upload_get);
//Przetwarzanie danych formularza uploadu obrazka - POST.
router.post("/image_upload", authenticate, image_controller.image_upload_post);

module.exports = router;
