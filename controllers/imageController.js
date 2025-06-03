const image = require("../models/image");
const gallery = require("../models/gallery");
const asyncHandler = require("express-async-handler");
const user = require("../models/user");

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

// IMAGE UPDATE GET
// Kontroler wyświetlania formularza update'u obrazka - GET.
exports.image_update_get = asyncHandler(async (req, res, next) => {
let all_galleries;
if (req.user.username === "admin") {
// dane do formularza - zalogowany admin
all_galleries = await gallery.find({}).sort({ name: 1 }).exec();
} else {
// dane do formularza - użytkownik zwykły
let user_id = await user.findOne({ "username": req.user.username }).exec();
all_galleries = await gallery.find({ "user": user_id }).exec();
}
//const image_id = req.query.image_id;
const imageObj = await image.findOne({ _id: req.query.image_id }).exec();
res.render("image_update", {
title: "Image update:",
image: imageObj,
galleries: all_galleries,
messages: []
});
});

// IMAGE SHOW GET
// Kontroler wyświetlania powiększonego obrazka
exports.image_show_get = asyncHandler(async (req, res, next) => {
  const image_id = req.query.image_id;

  try {
    const img = await image.findById(image_id).populate("gallery").exec();

    if (!img) {
      return res.status(404).render("info", { title: "Image not found", messages: ["Image not found."] });
    }

    res.render("image_show", {
      title: `Image: ${img.name}`,
      image: img,
    });
  } catch (err) {
    next(err); // Pass to default error handler
  }
});

// IMAGE UPDATE POST
// Kontroler przetwarzania formularza update'u obrazka - POST.
exports.image_update_post = asyncHandler(async (req, res, next) => {
const filter = {_id: req.query.image_id};
const update = {
name: req.body.i_name,
description: req.body.i_description,
gallery: req.body.i_gallery,
};
let doc=await image.findOneAndUpdate(filter, update);
if (doc) {
res.redirect("../galleries/gallery_browse")
} else {
res.send('Image update error');
}
});

// IMAGE DELETE
// Kontroler usuwania obrazka - POST
exports.image_delete = asyncHandler(async (req, res, next) => {
const filter = {_id: req.params.image_id};
let doc=await image.findOneAndDelete(filter);
if (doc) {
res.redirect("../../galleries/gallery_browse")
} else {
res.send('Error - image not deleted');
}
});

// UPLOAD GET
// Formularz wyboru pliku uploadu
exports.image_upload_get = asyncHandler(async (req, res, next) => {
res.render("image_upload_form", { title: "Upload image:" });
});

// UPLOAD POST
// Obsługa danych formularza uploadu
const formidable = require('formidable');
const path = require("path");
exports.image_upload_post = asyncHandler(async (req, res, next) => {
const form = new formidable.IncomingForm({
uploadDir: path.join(__dirname, "../public/images"),
multiples: false,
keepExtensions: true
});
let messages = [];
form.parse(req, (err, fields, files) => {
if (err) {
messages.push("Image upload error!");
}
else {
messages.push("Image uploaded!");
}
res.render("image_upload_form", { title: "Upload image:", messages });
});
});