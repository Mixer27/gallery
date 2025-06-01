const jwt = require("jsonwebtoken");
const user = require("../models/user");

const authenticateOptional = async (req, res, next) => {
  try {
    const token = req.cookies.mytoken;
    if (!token) return next();

    const decoded = jwt.verify(token, 'kodSzyfrujacy');
    const foundUser = await user.findOne({ username: decoded.username }).exec();

    if (foundUser) {
      req.user = foundUser;
      res.locals.loggedUser = foundUser.username;
    }
  } catch (err) {
    // ignorujemy błędy - nie ustawiamy req.user
  }
  next();
};

module.exports = authenticateOptional;