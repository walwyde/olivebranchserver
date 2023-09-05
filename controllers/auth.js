const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const crypto = require("crypto");
const mailer = require("../utils/mailer");

exports.getIndex = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ errors: [{ msg: "user not found" }] });
    }

    res.status(200).json(user);
  } catch (err) {
    if (err) res.status("500").send([{ errors: "server error" }]);
    console.log(err.message);
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = await req.body;

    const activeUser = await User.findOne({ email });

    if (!activeUser) {
      return res.status(404).json({ errors: [{ msg: "user not found" }] });
    }

    const isMatch = await bcrypt.compare(password, activeUser.password);

    if (!isMatch) {
      return res.status(400).send({ errors: [{ msg: "password incorrect" }] });
    }

    const payload = {
      user: {
        fullname: activeUser.fullname,
        id: activeUser._id,
        isStaff: activeUser.isStaff,
        client: !activeUser.isStaff,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
      (err, token) => {
        if (err) {
          console.log(err);
        }

        res.status(200).json(token);
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send({ errors: [{ error: err }] });
  }
};

exports.initPasswordReset = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email } = req.body;
    const activeUser = await User.findOne({ email });
    if (!activeUser)
      return res.status(404).json({ errors: [{ msg: "user not found" }] });

    const resetToken = await crypto.randomBytes(32).toString("hex");
    const tokenExpiration = Date.now() + 3600000;

    activeUser.tokenExpiration = tokenExpiration;

    activeUser.resetToken = resetToken;

    const updated = await activeUser.save();

    if (!updated)
      return res
        .status(500)
        .json({ errors: [{ msg: "something went wrong" }] });

    // email token to user's email

    mailer.sendMail(
      {
        from: "<noreply@olivebranch.com>",
        to: email,
        subject: "OliveBranch Account Password Reset",
        html: mailer.mailTemplate(resetToken),
      },
      (data, err) => {
        if (err) {
          console.log("error" + err);
          return res.status(500).json({
            error: { msg: `${err.message} => Please check your network` },
          });
        }
        console.log(data);
        if (data.errno)
          return res
            .status(500)
            .json({ error: { msg: "please check your network!" } });
        res.status(200).json({
          success: {
            msg: "A password reset link has been sent to your email, please check your mailbox",
            data: data,
          },
        });
      }
    );
  } catch (err) {
    console.log(err);

    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { newPassword, token } = req.body;
    // const token = req.params.token;
    if (!token)
      return res.status(400).json({ errors: [{ msg: "Invalid reset token" }] });
    const user = await User.findOne({
      resetToken: token,
      tokenExpiration: { $gt: Date.now() },
    });
    if (!user)
      return res
        .status(404)
        .json({ errors: [{ msg: "user not found or token expired!" }] });

    const salt = await bcrypt.genSalt(10);

    const password = await bcrypt.hash(newPassword, salt);

    user.password = password;
    user.resetToken = null;
    user.tokenExpiration = null;

    await user.save();

    res.status(200).json({ success: { msg: "password updated successfully" } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { msg: err.messsage, error: err } });
  }
};

exports.validate = async (req, res) => {
  // password, email, family_name, name, phone_number

  try {
    const { email, password, name, family_name, phone_number } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: { msg: err.messsage, error: err } });
  }
};
