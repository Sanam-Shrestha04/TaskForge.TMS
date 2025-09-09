const mongoose = require("mongoose");
const PlaceHolder = require("../");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: "" },
    role: { type: String, enum: ["admin", "user"], default: "user" }, // Role-based access
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
