var mongoose = require("mongoose");
var userSchema = mongoose.Schema(
  {
    name: String,
    username: {
      type: String,
      index: { unique: true },
      trim: true,
      required: true,
    },
    email: {
      type: String,
      index: { unique: true },
      lowecase: true,
      trim: true,
      required: true,
    },
    address: {
        line1: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
    },
    password: String,
    phone: String,
    status: Number,
  },
  {
    timestamps: true,
    versionkey: false,
  }
);

const users = mongoose.model(
  "users",
  userSchema,
  "users"
);
module.exports = users;