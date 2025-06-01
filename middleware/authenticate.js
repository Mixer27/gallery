const jwt = require("jsonwebtoken");
const authenticate = (req, res, next) => {
    try {
        // przysłany token
        const token = req.cookies.mytoken;
        // dekoduj token
        const decode = jwt.verify(token, 'kodSzyfrujacy');
        // dodanie do request (req.user) danych zweryfikowanego usera
        req.user = decode;
        req.loggedUser = req.user.username;
        next();
    }
    catch (err) {
        res.redirect('/');
        // res.render("info", { title: "Info", messages: ['Must be logged!'] });
    }
}
module.exports = authenticate