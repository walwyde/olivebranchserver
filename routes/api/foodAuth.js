const express = require("express");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const { check, validationResult } = require("express-validator");

const gravatar = require("gravatar");

const router = express.Router();

const User = require("../../models/FoodUser");

router.get('/', async (req, res) => {
  res.status(200).json({msg: "you have reached the foodApp User validation EndPoint, thanks.. oh, make post requests to /validate. :,)"})
})

router.post(
  "/validate",
  [
    check("password", "please try that again").isLength({ min: 6 }),
    check("email", "please enter a valid email").isEmail(),
    check("username", "please enter a valid username").isString(),
    check("family_name", "please enter a valid family name").isString(),
    check("name", "please enter a valid name").isLength({ min: 6 }),
    check("phone_number", "please enter a valid phone number").isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    console.log(req.body);
    try {
      const {
        name,
        username,
        family_name,
        phone_number,
        email,
        password,
        address,
      } = req.body;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const avatar = gravatar.url(email, { s: "200", r: "pg", d: "identicon" });

      const salt = await bcrypt.genSaltSync(10);

      const hash = await bcrypt.hashSync(password, salt);

      const user = await new User({
        name,
        username,
        family_name,
        phone_number,
        email,
        password: hash,
        avatar,
        address,
      });

      await user.save();

      const payload = {
        user: {
          fullname: user.fullname,
          id: user._id,
          isAuthenticated: true,
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
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).json({ errors: { msg: err.messsage, error: err } });
    }
  }
);

module.exports = router;
