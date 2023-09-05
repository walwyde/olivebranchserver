const mongoose = require("mongoose");

const staffProfileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    enum: ["doctor", "pysician", "councellor"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  specialty: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: true,
  },
  employer: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fee: {
    type: Number,
    required: true,
  },
  availability: [
    {
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      time: {
        type: String,
        enum: ["Morning", "Afternoon", "Evening"],
      },
    }
  ]
});

const StaffProfile = mongoose.model("staffprofile", staffProfileSchema);

module.exports = StaffProfile;
