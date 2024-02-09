import mongoose from "mongoose";
import schemaMiddleware from "../middlewares/schema-middleware.js";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  hash: {
    type: String,
    required: true,
  },
  friends: {
    type: Array,
    default: []
  },
  profilePicture: String,
  location: String,
  occupation: String,
}, {
  timestamps: true
});

schemaMiddleware(userSchema);

const User = mongoose.model("User", userSchema);

export default User;
