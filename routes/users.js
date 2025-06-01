var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// import modułu kontrolera
const userController = require("../controllers/userController");



router.get("/", userController.userList);

// Obsługa GET: http://localhost/users/user_add
router.get("/user_add", userController.user_add_get);

// Obsługa POST: http://localhost/users/user_add
router.post("/user_add", userController.user_add_post);

// GET - Kontroler wyświetlania formularza logowania
exports.user_login_get = (req, res, next) => {
res.render("user_login_form", { title: "Login"});
}

// USER LOGIN GET
router.get("/user_login", userController.user_login_get);
// USER LOGIN POST
router.post("/user_login", userController.user_login_post);
// USER LOGOUT GET
router.get("/user_logout", userController.user_logout_get);

module.exports = router;

// https://mongoosejs.com/docs/models.html