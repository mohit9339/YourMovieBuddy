const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [Number],
  watched: [Number],
});

module.exports = mongoose.model("User", userSchema);
