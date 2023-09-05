const StaffProfile = require("../models/StaffProfile");
const Profile = require("../models/Profile");
const { validationResult } = require("express-validator");
const User = require("../models/Users");

exports.getProfileById = async (req, res) => {
  try {
    let profile;
    const profileId = req.params.profileId;
    const staffProfile = await StaffProfile.findById(profileId).populate({
      path: "user",
      select: "-password, -__v",
    });

    if (staffProfile) {
      profile = staffProfile;
    } else {
      profile = await Profile.findById(profileId).populate({
        path: "user",
        select: "-password, -__v",
      });
    }

    if (!profile) {
      profile = await Profile.findOne({ user: profileId }).populate({
        path: "user",
        select: "-password, -__v",
      });
    }

    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "No Profile Found" }] });
    } else {
      res.status(200).json(profile);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};
exports.createProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //bad request
    }
    const client = req.user.client;
    const staff = req.user.isStaff;
    let profile = {};
    let medArr = [];
    let medDoseArr;

    if (staff) {
      const existing = await StaffProfile.findOne({ user: req.user.id });
      if (existing)
        return res.status(400).json({
          errors: [{ msg: "profile already exists" }],
        });
      const {
        specialty,
        employer,
        bio,
        gender,
        address,
        phone,
        email,
        nin,
        licenceNumber,
        licenceExpiry,
        title,
        fee,
      } = req.body;

      if (specialty) profile.specialty = specialty;
      if (bio) profile.bio = bio;
      if (employer) profile.employer = employer;
      if (gender) profile.gender = gender;
      if (address) profile.address = address;
      if (phone) profile.phone = phone;
      if (email) profile.email = email;
      if (nin) profile.nin = nin;
      if (licenceNumber) profile.licenceNumber = licenceNumber;
      if (licenceExpiry) profile.licenceExpiry = licenceExpiry;
      if (title) profile.title = title.toLowerCase();
      if (fee) profile.fee = fee;
      profile.user = req.user.id;

      const newProfile = await StaffProfile.create(profile);

      if (!newProfile)
        return res.status(422).json({
          errors: [{ msg: "something went wrong, please try again." }],
        });

      res.status(201).json(newProfile);
    } else {
      const existing = await Profile.findOne({ user: req.user.id });
      if (existing)
        return res.status(400).json({
          errors: [{ msg: "profile already exists" }],
        });
      const {
        history,
        fullname,
        age,
        gender,
        address,
        phone,
        email,
        docName,
        docAddress,
        docContact,
      } = req.body;

      if (history) profile.history = history;
      if (fullname) profile.fullname = fullname;
      if (age) profile.age = age;
      if (gender) profile.gender = gender;
      if (address) profile.address = address;
      if (phone) profile.phone = phone;
      if (email) profile.email = email;
      if (docName) profile.docName = docName;
      if (docAddress) profile.docAddress = docAddress;
      if (docContact) profile.docContact = docContact;
      profile.user = req.user.id;

      const newProfile = await Profile.create(profile);

      if (!newProfile)
        return res.status(422).json({
          errors: [{ msg: "something went wrong, please try again." }],
        });

      res.status(201).json(newProfile);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

exports.updateProfile = async (req, res) => {
  console.log(req.params);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //bad request
    }
    const client = req.user.client;
    const staff = req.user.isStaff;
    let profile = {};
    const profileId = req.params.profileId;

    if (staff) {
      const existing = await StaffProfile.findOne({ user: req.user.id });
      if (!existing)
        return res.status(400).json({
          errors: [{ msg: "you don't have a profile" }],
        });
      const {
        specialty,
        employer,
        bio,
        gender,
        address,
        phone,
        email,
        nin,
        licenceNumber,
        licenceExpiry,
        title,
        fee,
      } = req.body;

      if (specialty) profile.specialty = specialty;
      if (bio) profile.bio = bio;
      if (employer) profile.employer = employer;
      if (gender) profile.gender = gender;
      if (address) profile.address = address;
      if (phone) profile.phone = phone;
      if (email) profile.email = email;
      if (nin) profile.nin = nin;
      if (licenceNumber) profile.licenceNumber = licenceNumber;
      if (licenceExpiry) profile.licenceExpiry = licenceExpiry;
      if (title) profile.title = title.toLowerCase();
      if (fee) profile.fee = fee;
      profile.user = req.user.id;

      const updated = await StaffProfile.findByIdAndUpdate(
        { _id: profileId },
        { $set: profile },
        { new: true }
      );

      if (!updated)
        return res.status(422).json({
          errors: [{ msg: "something went wrong, please try again." }],
        });

      res.status(201).json(updated);
    } else {
      const existing = await Profile.findOne({ user: req.user.id });
      if (!existing)
        return res.status(400).json({
          errors: [{ msg: "you don't have a profil" }],
        });
      const {
        history,
        fullname,
        age,
        gender,
        address,
        phone,
        email,
        docName,
        docAddress,
        docContact,
      } = req.body;

      if (history) profile.history = history;
      if (fullname) profile.fullname = fullname;
      if (age) profile.age = age;
      if (gender) profile.gender = gender;
      if (address) profile.address = address;
      if (phone) profile.phone = phone;
      if (email) profile.email = email;
      if (docName) profile.docName = docName;
      if (docAddress) profile.docAddress = docAddress;
      if (docContact) profile.docContact = docContact;
      profile.user = req.user.id;

      const updated = await Profile.findByIdAndUpdate(
        { _id: profileId },
        { $set: profile },
        { new: true }
      );

      if (!updated)
        return res.status(422).json({
          errors: [{ msg: "something went wrong, please try again." }],
        });

      res.status(201).json(updated);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

exports.loadCurrentProfile = async (req, res) => {
  const client = req.user.client;
  const staff = req.user.isStaff;
  let profile;

  try {
    if (client) profile = await Profile.findOne({ user: req.user.id });
    if (staff) profile = await StaffProfile.findOne({ user: req.user.id });
    if (!profile)
      return res.status(404).json({ errors: [{ msg: "profile not found!" }] });

    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

exports.editAvatar = async (req, res) => {
  try {
    const image = req.file;

    if (!image) return res.status(422).json({ msg: "Invalid file type" });

    const avatar = image.path;

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      { $set: { avatar: avatar } }
    );

    if (!updatedUser) return res.status(400).json("user not found");

    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(400).json("user not found");

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    let deletedProfile;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json("user not found");

    const deletedUser = await User.findOneAndDelete({ _id: req.user.id });

    if (!deletedUser)
      return res
        .status(400)
        .json({ errors: [{ msg: "something went wrong" }] });

    if (req.user.client) {
      deletedProfile = await Profile.findOneAndDelete({
        user: req.user.id,
      });
    } else {
      deletedProfile = await StaffProfile.findOneAndDelete({
        user: req.user.id,
      });
    }

    if (!deletedProfile)
      return res
        .status(400)
        .json({ errors: [{ msg: "something went wrong" }] });

    res.status(200).json({ msg: "Account deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: err.message }] });
  }
};
