import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/user-model.js";

export const signUp = async (req, res) => {
  try {
    const { email, name, username, password } = req.body;

    if (!email || !name || !username || !password) {
      return res.status(400).json({ message: "Invalid registration request format." });
    }

    if (!validator.isEmail(email) || !validator.isStrongPassword(password)) {
      return res.status(422).json({ message: "Invalid data in registration request." });
    }

    if (await User.findOne({ email, username })) {
      throw new Error;
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const user = new User({ email, name, username, hash: passwordHash });

    const savedUser = await user.save();
    const { hash, ...sanitizedUser } = savedUser._doc;
    res.status(201).json(sanitizedUser);
  } catch (error) {
    res.status(409).json({ message: "Username or email already exists." });
  }
}

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Invalid registration request format." });
    }

    const target = await User.findOne({ email });

    if (!target || !await bcrypt.compare(password, target.hash)) {
      throw new Error;
    }

    const token = jwt.sign({ userId: target._id }, process.env.JWT_SECRET);
    const { hash, ...sanitizedUser } = target._doc;
    res.status(200).json({ token, user: sanitizedUser });
  } catch (error) {
    res.status(401).json({ message: "Invalid username or password." });
  }
}
