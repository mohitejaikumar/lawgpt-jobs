import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  plan: {
    type: String,
    enum: ["free", "essential", "growth", "custom"],
    default: "free",
  },
  purchaseDate: {
    type: Date,
    required: false,
  },
  monthly_cases_limit: {
    type: Number,
    default: 0,
  },
  tokens: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    required: false,
  },
  forgotPasswordToken: {
    type: String,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
