var express = require('express');
var router = express.Router();
const authenticate = require('../middleware/authenticate');

const image_controller = require("../controllers/imageController");

router.get("/", image_controller.image_list);

//Wyświetlanie formularza dodawania obrazka - GET.
router.get("/image_add", authenticate, image_controller.image_add_get);
//Przetwarzanie danych formularza dodawania obrazka - POST.
router.post("/image_add", authenticate, image_controller.image_add_post);

module.exports = router;
