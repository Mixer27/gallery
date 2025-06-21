const user = require("../models/user");
const gallery = require("../models/gallery")
const image = require("../models/image")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");


// asynchronicznie
const asyncHandler = require("express-async-handler");

exports.userList = asyncHandler(async (req, res, next) => {
  const allUsers = await user.find({}).exec();
  res.render("user_list", { title: "GalleryDB users:", user_list: allUsers });
});

// można prościej np. z metodą then i funkcją callback w środku
// exports.userList=((req, res, next) => {
//   user.find({}).then((allUsers) => res.render("user_list", { title: "GalleryDB users:", user_list: allUsers }));
// });

// GET - Kontroler wyświetlania formularza logowania
exports.user_login_get = (req, res, next) => {
  res.render("user_login_form", { title: "Login" });
}

// POST - Kontroler przetwarzania formularza logowania
exports.user_login_post = (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;
  user.findOne({ username })
    .then((user) => {
      if (user) {
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            res.render("user_login_form", { title: "Login", messages: ["Some bcrypt errors!"] });
            return;
          }
          if (result) {
            let token = jwt.sign({ username: user.username }, 'kodSzyfrujacy', { expiresIn: '1h' });
            res.cookie('mytoken', token, { maxAge: 600000 });
            // Login OK
            res.render('index', { title: 'Gallery', loggedUser: user.username });
          } else {
            // Bad pass
            res.render("user_login_form", { title: "Login", messages: ["Bad pass!"] });
          }
        })
      } else {
        // No user found!
        res.render("user_login_form", { title: "Login", messages: ["No user found!"] });
      }
    })
}

// GET - Kontroler wylogowania
exports.user_logout_get = (req, res, next) => {
  res.clearCookie('mytoken')
  // res.render('index', { title: 'Express' });
  res.redirect('/');
}

// NEW USER

// GET - Kontroler wyświetlania formularza dodawania nowego usera (metoda GET).
exports.user_add_get = (req, res, next) => {
  console.log(req.loggedUser);
  if (req.loggedUser === "admin") res.render("user_form", { title: "Add users" });
  else res.redirect('/');
};

// Import funkcji walidatora.
const { body, validationResult } = require("express-validator");

// POST - Kontroler (a właściwie lista kontrolerów) obsługi danych z formularza dodawania nowego usera (metoda POST).
exports.user_add_post = [
  // Walidacja i sanityzacja danych z formularza.
  body("name")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("First name too short."),

  body("surname")
    .trim()
    .isLength({ min: 2 })
    .escape()
    .withMessage("Last name name too short."),

  body("username", "Username must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape()
    .isAlpha()
    .withMessage("Username must be alphabet letters."),
  body("password", "Password to short!")
    .isLength({ min: 8 }),

  // Przetwarzanie danych po walidacji i sanityzacji
  asyncHandler(async (req, res, next) => {
    // Pozyskanie z request obiektu błędu i jego ewentualna obsługa.
    const errors = validationResult(req);

    //zaszyfrowanie hasła - bcrypt.hash działa asynchroniczne
    const passwordHash = await bcrypt.hash(req.body.password, 10)


    // Tworzenie obiektu/dokumentu newuser z modelul User po 'oczyszczeniu' danych 
    const newuser = new user({
      name: req.body.name,
      surname: req.body.surname,
      username: req.body.username,
      password: passwordHash,
    });

    if (!errors.isEmpty()) {
      // Jeśli pojawiły się błędy - ponownie wyrenderuj formularz i wypełnij pola 
      // wprowadzonymi wcześniej danymi ora komunikatami błędów 
      // Roboczej tablica komunikatów:

      let myMessages = []
      errors.array().forEach(err => myMessages.push(err.msg))

      res.render("user_form", {
        title: "Add user:",
        user: newuser,
        messages: myMessages,
      });
      return;
    }
    // Dane z formularza są poprawne.
    // Należy jeszcze sprawdzić czy w bazie istnieje już użytkownik 
    // o tym samym username
    const userExists = await user.findOne({ username: req.body.username })
      .collation({ locale: "pl", strength: 2 })
      .exec();

    if (userExists) {
      // Błąd - użytkownik już istnieje w bazie - ponownie wyrenderuj formularz, wypełnij pola 
      // wprowadzonymi wcześniej danymi, wydrukuj błąd

      res.render("user_form", {
        title: "Add user:",
        user: newuser,
        messages: [`Username "${newuser.username}" already exists!`]
      });
      return;
    }

    // Zapisz do bazy nowego użytkownika.
    // Wyświetl pusty formularz i komunikat.
    await newuser.save()
      .then(res.render("user_form", {
        title: "Add user:",
        user: {},
        messages: [`User "${newuser.username}" dodany`]
      }))
  }),

];

// DELETE - Kontroler usuwania użytkownika
exports.user_delete = asyncHandler(async (req, res, next) => {
  // tylko admin może usuwać użytkowników
  if (req.loggedUser !== "admin") {
    return res.status(403).send("Access denied");
  }

  const userId = req.params.user_id;

  // zabezpieczenie: nie pozwól adminowi usunąć samego siebie
  const userToDelete = await user.findById(userId).exec();

  if (!userToDelete) {
    return res.status(404).send("User not found");
  }

  if (userToDelete.username === "admin") {
    return res.status(400).send("Cannot delete admin user");
  }

  // 1. Pobierz wszystkie galerie użytkownika
  const userGalleries = await gallery.find({ user: userId }).exec();

  for (const gal of userGalleries) {
    // 2. Pobierz obrazki przypisane do tej galerii
    const galleryImages = await image.find({ gallery: gal._id }).exec();

    for (const img of galleryImages) {
      // 3. Usuń plik z dysku
      const filePath = path.join(__dirname, "../public/images", img.path);
      try {
        await fs.unlink(filePath);
        console.log(`Deleted image file: ${filePath}`);
      } catch (err) {
        console.warn(`File deletion failed or not found: ${filePath}`, err.message);
      }

      // 4. Usuń wpis z bazy
      await image.findByIdAndDelete(img._id);
    }

    // 5. Usuń galerię po usunięciu obrazków
    await gallery.findByIdAndDelete(gal._id);
  }

  // 6. Usuń użytkownika
  await user.findByIdAndDelete(userId);

  // await gallery
  // await image
  // await user.findByIdAndDelete(userId);
  res.redirect("/users");
});
