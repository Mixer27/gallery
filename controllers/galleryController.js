const gallery = require("../models/gallery");
const user = require("../models/user");

const asyncHandler = require("express-async-handler");

exports.gallery_list = asyncHandler(async (req, res, next) => {
  const all_galleries = await gallery.find({}).populate("user").exec();
  res.render("gallery_list", { title: "List of all galleries:", gallery_list: all_galleries });
});

// Import walidatora.
const { body, validationResult } = require("express-validator");


// GET - Kontroler wyświetlania formularza dodawania nowej galerii (metoda GET).
exports.gallery_add_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    // Jeśli użytkownik nie jest zalogowany, przekieruj na login lub pokaż błąd
    return res.redirect('/users/user_login');
  }

  // pobranie listy userów z bazy
  const all_users = await user.find().sort({ surname: 1 }).exec();

  // Jeśli użytkownik ma rolę "admin" (lub jakąś inną logikę), pokaż standardowy formularz
  if (req.user.username === 'admin') {
    return res.render("gallery_form", {
      title: "Add gallery (admin)",
      users: all_users,
    });
  }

  // Dla zwykłego użytkownika - formularz bez wyboru użytkownika (bo już wiadomo kto tworzy)
  console.log(req.user);
  res.render("gallery_form_user", {
    title: "Add gallery (user)",
    currentUser: req.user, // do automatycznego przypisania właściciela
  });
});

// GET - Kontroler wyświetlania formularza dodawania nowej galerii (metoda GET).
// exports.gallery_add_get = asyncHandler(async (req, res, next) => {
//   // pobranie listy userów z bazy
//   const all_users = await user.find().sort({surname:1}).exec();
//   // rendering formularza
//   res.render("gallery_form", {
//     title: "Add gallery",
//     users: all_users,
//   });
// });

// POST - Kontroler (lista funkcji) obsługi danych z formularza dodawania nowej galerii (metoda POST).
exports.gallery_add_post = [
  // Walidacja i sanityzacja danych z formularza.
  body("g_name", "Gallery name too short.")
    .trim()
    .isLength({ min: 2 })
    .escape(),

  body("g_description")
    .trim()
    .escape(),

  body("g_user", "Username must be selected.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Przetwarzanie po walidacji.
  asyncHandler(async (req, res, next) => {
    // Przechwyt obiektu błędów walidacji.
    const errors = validationResult(req);
    // Zapamiętanie listy userów
    const all_users = await user.find().sort({ last_name: 1 }).exec();

    // Utworzenie obiektu modelu Gallery z danymi z formularza.
    const newgallery = new gallery({
      name: req.body.g_name,
      description: req.body.g_description,
      user: req.body.g_user,
      date: new Date(),
    });

    // Sprawdzenie i obsługa ewentualnych błędów.
    if (!errors.isEmpty()) {
      // Jeśli pojawiły się błędy - ponownie wyrenderuj formularz i wypełnij pola wprowadzonymi danymi po sanityzacji.
      
      let myMessages=[]
      errors.array().forEach(err => myMessages.push(err.msg))

      // const all_users = await user.find().sort({ last_name: 1 }).exec();
      res.render("gallery_form", {
        title: "Add gallery:",
        gallery: newgallery,
        users: all_users,
        messages: myMessages,
      });
      return;
    } 
    
    // Dane z formularza są poprawne.
    // Należy jeszcze sprawdzić czy w bazie istnieje galeria
    // o tej samej nazwie dla wskazanego użytkownika.
    const galleryExists = await gallery.findOne({
      name: req.body.g_name,
      user: req.body.g_user,
      })
      .collation({ locale: "pl", strength: 2 })
      .exec();

    if (galleryExists) {
      // Błąd - nazwa galerii dla wybranego użytkownika już istnieje, ponowne wyświetlenie formularza z komunikatem
        res.render("gallery_form", {
        title: "Add gallery:",
        gallery: newgallery,
        users: all_users,
        messages: [`Gallery "${newgallery.name}" already exists!`]
      });
      return;
    } 

    // Zapisz do bazy nową galerię.
    // Wyświetl pusty formularz i komunikat.
    await newgallery.save().then(() => {
      res.render("gallery_form", {
        title: "Add gallery:",
        gallery: newgallery,
        users: all_users,
        messages: [`Gallery "${newgallery.name}" added!`],
      });
    });
  }),
];