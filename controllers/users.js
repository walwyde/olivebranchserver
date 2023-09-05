const { check, validationResult } = require("express-validator");
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users)
      return res.status(404).json({ errors: [{ msg: "Users Not Found" }] });
    res.json(users);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ errors: [{ msg: "User Not Found" }] });

    res.json(user);
  } catch (err) {
    console.log(err.message);
    if (err.kind == "ObjectId")
      return res.status(404).json({ msg: "user not found" });
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};
exports.newUser = async (req, res) => {
  console.log(req.body);
  // input validations
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, password2 } = req.body;
  const avatar = gravatar.url(email, {
    s: "200",
    r: "pg",
    d: "mm",
  });
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("user already exists");
      return res
        .status(400)
        .json({ errors: [{ msg: "email already exists" }] });
    }

    if (password !== password2)
      return res
        .status(400)
        .json({ errors: [{ msg: "passwords dont match" }] });

    delete req.body.password2;
    delete req.body.password;

    const user = new User(req.body);
    user.avatar = avatar;

    //  generating salt and hashing password with bcryptjs
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);
    

    await user.save();

    // generating jwt token
    const payLoad = {
      user: {
        fullname: user.fullname,
        id: user._id,
        isStaff: user.isStaff,
        client: !user.isStaff,
      },
    };
    console.log(process.env.JWT_SECRET)
    jwt.sign(
      payLoad,
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      },
      (err, token) => {
        if (err) {
          return res.status(500).json(err.message);
        }
        res.status(200).json(token);
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ errors: [err.message] });
  }
};

// Add message to user's messages array
exports.addMessage = async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the message to the user's messages array
    user.messages.push(message);

    // Save the user with the updated messages array
    await user.save();

    return res.status(200).json({ message: "Message added successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

// Delete message from user's messages array
exports.deleteMessage = async (req, res) => {
  try {
    const { userId, messageId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the index of the message in the messages array
    const messageIndex = user.messages.findIndex(
      (message) => message.id === messageId
    );

    if (messageIndex === -1) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Remove the message from the user's messages array
    user.messages.splice(messageIndex, 1);

    // Save the user with the updated messages array
    await user.save();

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ isStaff: true });

    if (!doctors)
      return res.status(404).json({ errors: [{ msg: "Doctors Not Found" }] });

    res.json(doctors);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};
