const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  history: {
    type: String,
    required: true,
  },
  user : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
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
  medications: [
    {
      medName: {
        type: String,
      },
      medDose: {
        type: String,
      },
    },
  ],
  email: {
    type: String,
    required: true,
  },
  docName: {
    type: String,
  },
  docAddress: {
    type: String,
  },
  docContact: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

const Profile = mongoose.model("profile", profileSchema);

module.exports = Profile;
