import mongoose from "mongoose";
import validator from "validator";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Defining Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Please Provide Name"], trim: true },
  email: {
    type: String,
    required: [true, "Please Provide Email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email",
    },
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Provide Password"],
    trim: true,
    minlength: 6,
  },
});

// Define the hooks

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// create the jwt token
UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

// compare the password

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Model
const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
