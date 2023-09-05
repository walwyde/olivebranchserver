const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const controller = require("../../controllers/auth");
const auth = require("../../middleware/index");

router.post(
  "/forgot",
  [check("email", "please enter a valid email").isEmail()],
  controller.initPasswordReset
);

router.post(
  "/reset-password",
  [
    check("newPassword", "please try that again").isLength({ min: 6 }),
    check("confirmPassword", "passwords do not match").custom(
      (value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match");
        }
        return true;
      }
    ),
  ],
  controller.resetPassword
);

router.get("/", auth.auth, controller.getIndex);

router.post(
  "/",
  [
    check("email", "please enter a valid email").isEmail(),
    check("password", "please try that again").isLength({ min: 6 }),
  ],
  controller.login
);

module.exports = router;
