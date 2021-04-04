var mongoose = require("mongoose");
var slotSchema = mongoose.Schema(
  {
    userid: String,
    username: String,
    user_phone: String,
    user_address: String,
    orphanage_name: String,
    booking_date: Date,
    breakfast: Number,
    slot_timing: String,
    status: Number,
  },
  {
    timestamps: true,
    versionkey: false,
  }
);

const slots = mongoose.model(
  "slots",
  slotSchema,
  "slots"
);
module.exports = slots;