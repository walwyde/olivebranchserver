const { validationResult } = require("express-validator");

const Appointment = require("../models/Appointment");
const StaffProfile = require("../models/StaffProfile");
const User = require("../models/Users");

// @route   GET api/appointment

// @desc    Get all appointments

// @access  Private

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user")
      .populate("doctor");

    res.json(appointments);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
};

// @route   GET api/appointment/:id

// @desc    Get appointment by ID

// @access  Private

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate([
        "user",
        { path: "doctor", populate: { path: "user" } },  // populate nested
      ])
      .exec();

    if (!appointment) {
      return res.status(404).json({ msg: "Appointment not found" });
    }

    res.json(appointment);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
};

// @route   POST api/appointment

// @desc    Create or update appointment

// @access  Private

exports.createAppointment = async (req, res) => {
  const { doctor, time, date } = req.body;

  let appointmentFields = {};

  appointmentFields.user = req.user.id;

  if (doctor) appointmentFields.doctor = doctor;

  if (time) appointmentFields.time = time;

  if (date) appointmentFields.date = date;

  // Build appointment object

  try {
    let appointment = await Appointment.findOne({ user: req.user.id });

    if (appointment) {
      const match = appointment.doctor.toString() === doctor;
      // Update
      if (match) {
        const updated = await Appointment.findOneAndUpdate(
          { user: req.user.id },
          { $set: appointmentFields },
          { new: true }
        );
        await updated.save();

        return res.json(appointment);
      }
    }

    // Create
    appointment = new Appointment(appointmentFields);

    await appointment.save();

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

// @route   DELETE api/appointment/:id

// @desc    Delete appointment

// @access  Private

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Appointment not found" }] });
    }

    // Check user
    console.log(appointment.doctor.toString(), req.user.id);

    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(401).json({ errors: [{ msg: "User not authorized" }] });
    }

    await Appointment.deleteOne({ _id: req.params.id });

    res.json({ msg: "Appointment removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

// @route   PUT api/appointment/doctors/

// @desc    Get all doctors for appointment

// @access  Private

exports.getDoctors = async (req, res) => {
  console.log("here");
  try {
    const doctors = await StaffProfile.find().populate("user", [
      "fullname",
      "availability",
    ]);

    if (!doctors) {
      return res.status(404).json({ errors: { msg: "Doctors not found" } });
    }

    res.json(doctors);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      res.status(404).json({ msg: "Appointment not found" });
    }

    if (appointment.user.toString() !== req.user.id) {
      res.status(401).json({ msg: "User not authorized" });
    }

    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    res.json(updatedAppointment);
  } catch (err) {
    console.log(err);
  }
};

exports.approveAppointment = async (req, res) => {
  try {
    const newStatus = {
      status: "approved",
    };
    const app = await Appointment.findById(req.body._id);

    if (!app)
      return res
        .status(404)
        .json({ errors: [{ msg: "Appointment no found" }] });

    const approved = await Appointment.findOneAndUpdate(
      { _id: req.body._id },
      { $set: { status: "approved" } },
      { new: true }
    );

    console.log(approved);

    await approved.save();

    res.status(201).json(approved);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
};
exports.updateAvailability = async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    console.log(req.body);

    const profile = await StaffProfile.findOne({ user: req.user.id });

    if (!profile)
      return res.status(400).json({ errors: { msg: "profile not found" } });

    profile.availability = [...profile.availability, ...req.body.availability];

    await profile.save();

    res.json(profile.availability);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }
};

exports.clearAvailability = async (req, res) => {
  try {
    const profile = await StaffProfile.findOne({ user: req.user.id });

    if (!profile)
      return res.status(400).json({ errors: [{ msg: "profile not found" }] });

    profile.availability = [];

    await profile.save();

    res.json(profile.availability);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};
