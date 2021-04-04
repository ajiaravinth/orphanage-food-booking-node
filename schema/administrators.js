var mongoose = require("mongoose");
var adminSchema = mongoose.Schema(
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
    password: String,
    status: Number,
  },
  {
    timestamps: true,
    versionkey: false,
  }
);

const administrators = mongoose.model(
  "administrators",
  adminSchema,
  "administrators"
);
module.exports = administrators;