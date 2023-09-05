const express = require("express");
const router = express.Router();
const multer = require("multer");

const { check } = require("express-validator");
const controller = require("../../controllers/profile");
const auth = require("../../middleware/index");
const multerHelper = require("../../utils/fileUploadHelper");


router.post(
  "/avatar",
  auth.auth,
  multer({
    storage: multerHelper.storage,
    fileFilter: multerHelper.fileFilter,
  }).single("avatar"),
  controller.editAvatar
);
router.post(
  "/me",
  auth.auth,
  [
    check("email", "please enter a valid email").isEmail(),
    check("fullname", "Please provide your fullname").isString(),
    check("age", "Please provide your age").custom((value, { req }) => {
      console.log(value === undefined && req.user.isStaff === false);
      if (req.user.isStaff === false && value === undefined) {
        throw new Error("Please provide your age");
      } else {
        return true;
      }
    }),
    check("gender", "Please provide your gender information").isString(),
    check("phone", "Please provide your contact phone").isString(),
  ],

  controller.createProfile
);

router.post("/:profileId", auth.auth, controller.updateProfile);

router.delete("/me", auth.auth, controller.deleteAccount);

router.get("/me", auth.auth, controller.loadCurrentProfile);

router.get("/:profileId", controller.getProfileById);


module.exports = router;
