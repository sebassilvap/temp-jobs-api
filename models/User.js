const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ===========================================================================

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50,
  },

  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please Prvide a valid Email',
    ],
    unique: true, // creates a unique INDEX - duplicate error msg
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    //maxlength: 12, // we remove this after we start hashing the password
  },
});

// Suggestion: to work with old function

/*//* In Mongo 5.X we can remove -> next
UserSchema.pre('save', async function (next) {
  // generate the random bytes
  const salt = await bcrypt.genSalt(10);

  // this -> points to the document
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
*/

//* REFACTORING !!
UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//* We will refactor this
/*
UserSchema.methods.getName = function () {
  return this.name;
};
*/

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
