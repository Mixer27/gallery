const image = require("../models/image");
const gallery = require("../models/gallery");
const asyncHandler = require("express-async-handler");

exports.image_list = asyncHandler(async (req, res, next) => {
  const all_images = await image.find({}).populate("gallery").exec();
 res.render("image_list", { title: "List of all images:", image_list: all_images });
});

// GET - Wyświetlanie formularza dodawania obrazka
exports.image_add_get = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.redirect('/users/user_login');
  }

  // Dla admina pokaż wszystkie galerie, dla użytkownika tylko jego
  let galleries;
  if (req.user.username === 'admin') {
    galleries = await gallery.find().sort({ name: 1 }).exec();
  } else {
    galleries = await gallery.find({ user: req.user._id }).sort({ name: 1 }).exec();
  }

  res.render("image_form", {
    title: "Add image",
    galleries: galleries,
  });
});

const { body, validationResult } = require("express-validator");

// POST - Przetwarzanie formularza dodawania obrazka
exports.image_add_post = [
  // Walidacja i sanityzacja
  body("i_name", "Image name too short").trim().isLength({ min: 2 }).escape(),
  body("i_description").trim().escape(),
  body("i_gallery", "Gallery must be selected").trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Tworzenie nowego obiektu Image
    const newImage = new image({
      name: req.body.i_name,
      description: req.body.i_description,
      path: req.body.i_path || "placeholder.jpg", // domyślna ścieżka pliku
      gallery: req.body.i_gallery,
    });

    // Wczytaj galerie (dla ponownego renderowania przy błędach)
    let galleries;
    if (req.user.username === 'admin') {
      galleries = await gallery.find().sort({ name: 1 }).exec();
    } else {
      galleries = await gallery.find({ user: req.user._id }).sort({ name: 1 }).exec();
    }

    if (!errors.isEmpty()) {
      return res.render("image_form", {
        title: "Add image",
        galleries: galleries,
        image: newImage,
        messages: errors.array().map(e => e.msg),
      });
    }

    // Zapisz obraz do bazy
    await newImage.save();
    res.render("image_form", {
      title: "Add image",
      galleries: galleries,
      messages: [`Image "${newImage.name}" added!`],
    });
  })
];