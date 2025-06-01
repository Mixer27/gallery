const image = require("../models/image");

const asyncHandler = require("express-async-handler");

exports.image_list = asyncHandler(async (req, res, next) => {
  const all_images = await image.find({}).populate("gallery").exec();
 res.render("image_list", { title: "List of all images:", image_list: all_images });
});

