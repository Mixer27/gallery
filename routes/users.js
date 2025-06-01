var express = require('express');
var router = express.Router();

// import modułu kontrolera
const userController = require("../controllers/userController");

router.get("/", userController.userList);

// Obsługa GET: http://localhost/users/user_add
router.get("/user_add", userController.user_add_get);

// Obsługa POST: http://localhost/users/user_add
router.post("/user_add", userController.user_add_post);

module.exports = router;

// https://mongoosejs.com/docs/models.html