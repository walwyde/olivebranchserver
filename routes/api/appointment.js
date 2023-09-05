const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const auth = require("../../middleware/index");
const controller = require("../../controllers/appointments");

router.post(
  "/me/availability",
  auth.auth,
  [
    check("availability", "Availability fields not complete")
      .isArray()
      .custom((value, {req}) => {
        if (value.length < 0) {
          console.log(value)
          throw new Error("availability fields not complete");
        } else {

          return true;
        }
      }),
  ],
  controller.updateAvailability
);

router.delete("/me/availability", auth.auth, controller.clearAvailability);

// @route   GET api/appointment
// @desc    Get all appointments
// @access  Private
router.get("/", auth.auth, controller.getAppointments);

router.get("/doctors", auth.auth, controller.getDoctors);

// @route   GET api/appointment/:id
// @desc    Get appointment by ID
// @access  Private
router.get("/:id", auth.auth, controller.getAppointmentById);

router.put("/:id", auth.auth, controller.approveAppointment);

// @route   POST api/appointment
// @desc    Create or update appointment
// @access  Private
router.post("/", auth.auth, controller.createAppointment);

// @route   DELETE api/appointment/:id
// @desc    Delete appointment
// @access  Private
router.delete("/:id", auth.auth, controller.deleteAppointment);

module.exports = router;
