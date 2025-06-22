const gallery = require("../models/gallery");
const user = require("../models/user");
const image = require("../models/image");
const asyncHandler = require("express-async-handler");
const fs = require("fs/promises");
const path = require("path");

exports.gallery_list = asyncHandler(async (req, res, next) => {
  const all_galleries = await gallery.find({}).populate("user").exec();
  res.render("gallery_list", { title: "List of all galleries:", gallery_list: all_galleries, currentUser: req.user });
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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const all_users = await user.find().sort({ last_name: 1 }).exec();

    const newgallery = new gallery({
      name: req.body.g_name,
      description: req.body.g_description,
      user: req.body.g_user,
      date: new Date(),
    });

    if (!errors.isEmpty()) {

      let myMessages = []
      errors.array().forEach(err => myMessages.push(err.msg))

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

// GET - formularz edycji galerii
exports.gallery_update_get = asyncHandler(async (req, res, next) => {
  const galleryId = req.query.gallery_id;
  const username = req.loggedUser;

  const gal = await gallery.findById(galleryId).populate("user").exec();
  const all_users = await user.find().sort({ surname: 1 }).exec();

  if (!gal) {
    return res.status(404).send("Gallery not found");
  }
  console.log(gal, req.user)

  if (username === "admin") {
    res.render("gallery_update", {
    title: "Edit gallery",
    gallery: gal,
    users: all_users,
  });  
  }

  res.render("gallery_update_user", {
    title: "Edit gallery",
    gallery: gal,
    currentUser: req.user
  });
});

// POST - przetwarzanie edycji galerii
exports.gallery_update_post = [
  body("g_name", "Gallery name too short.").trim().isLength({ min: 2 }).escape(),
  body("g_description").trim().escape(),
  body("g_user", "Owner must be selected").trim().notEmpty().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const all_users = await user.find().sort({ surname: 1 }).exec();

    const updatedGallery = new gallery({
      _id: req.body.gallery_id,
      name: req.body.g_name,
      description: req.body.g_description,
      user: req.body.g_user,
      date: new Date(),
    });

    if (!errors.isEmpty()) {
      return res.render("gallery_update", {
        title: "Edit gallery",
        gallery: updatedGallery,
        users: all_users,
        messages: errors.array().map(err => err.msg),
      });
    }
    console.log(req.body.gallery_id, updatedGallery._id , updatedGallery);
    await gallery.findByIdAndUpdate(updatedGallery._id, updatedGallery);
    res.redirect("/galleries");
  })
];


// usuwanie galerii wraz z jej wszystkimi obrazkami
exports.gallery_delete = asyncHandler(async (req, res, next) => {
  const galleryId = req.params.gallery_id;

  // Znajdź galerię
  const gal = await gallery.findById(galleryId).exec();

  if (!gal) {
    return res.status(404).send("Gallery not found");
  }
  console.log(gal.user._id, req.user._id)
  // if (gal.user != req.user._id) {
  //   return res.status(401).send("Cant delete gallery that is not your!");
  // }

  // Znajdź obrazki powiązane z galerią
  const galleryImages = await image.find({ gallery: galleryId }).exec();

  for (const img of galleryImages) {
    const filePath = path.join(__dirname, "../public/images", img.path);
    try {
      await fs.unlink(filePath);
      console.log(`Deleted image file: ${filePath}`);
    } catch (err) {
      console.warn(`File deletion failed: ${filePath}`, err.message);
    }

    await image.findByIdAndDelete(img._id);
  }

  // Usuń galerię
  await gallery.findByIdAndDelete(galleryId);

  // Przekierowanie lub info
  res.redirect("/galleries");
});



// Kontroler wyświetlania formularza GET gallery_browse - wyświetla formularz wyboru galerii
exports.gallery_browse_get = asyncHandler(async (req, res, next) => {
  // Pokaż formularz wyboru gallerii
  const all_galleries = await gallery.find({}).exec();
  res.render("gallery_browse", {
    title: "Select gallery:", galleries: all_galleries, loggedUser: req.loggedUser
  });
});
// Kontroler przetwarzania formularza POST gallery_browse - wyświetla brazki, ale też formularz wyboru galerii
exports.gallery_browse_post = asyncHandler(async (req, res, next) => {
  // Pokaż listę obrazków wybranej gallerii
  const all_galleries = await gallery.find({}).exec();
  let gallery_images = [];
  let sel_gallery = null
  if (req.body.s_gallery) {
    gallery_images = await image.find({ gallery: req.body.s_gallery }).exec();
    sel_gallery = req.body.s_gallery
  }
  res.render("gallery_browse", {
    title: "View gallery:", galleries: all_galleries, images: gallery_images,
    sel_gallery: sel_gallery, loggedUser: req.loggedUser
  });
});