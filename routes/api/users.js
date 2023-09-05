const express = require("express");
const { check, validationResults } = require("express-validator");
const router = express.Router();
const control = require("../../controllers/users");

router.post(
  "/",
  [
    check("fullname", "Please Input Your Name(s)").not().isEmpty(),
    check("email", "Please Input a Valid Email").isEmail(),
    check(
      "password",
      "Please Create a Password Not Less Than 6 Chars In Length"
    ).isLength({ min: 6 }),
  ],
  control.newUser
);

router.get("/", control.getUsers);

router.get("/:id", control.getUser);

module.exports = router;
