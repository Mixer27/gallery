const jwt = require("jsonwebtoken");
const user = require("../models/user"); // <- potrzebne do pobrania pełnego usera z bazy

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.mytoken;
    const decode = jwt.verify(token, 'kodSzyfrujacy');

    // Szukamy pełnego użytkownika w bazie
    const foundUser = await user.findOne({ username: decode.username }).exec();

    if (!foundUser) {
      return res.redirect('/users/user_login');
    }

    req.user = foundUser;
    req.loggedUser = foundUser.username;
    next();
  } catch (err) {
    res.redirect('/users/user_login');
  }
};

module.exports = authenticate;


// const jwt = require("jsonwebtoken");
// const authenticate = (req, res, next) => {
//     try {
//         // przysłany token
//         const token = req.cookies.mytoken;
//         // dekoduj token
//         const decode = jwt.verify(token, 'kodSzyfrujacy');
//         // dodanie do request (req.user) danych zweryfikowanego usera
//         req.user = decode;
//         req.loggedUser = req.user.username;
//         next();
//     }
//     catch (err) {
//         res.redirect('/users/user_login');
//         // res.render("info", { title: "Info", messages: ['Must be logged!'] });
//     }
// }
// module.exports = authenticate