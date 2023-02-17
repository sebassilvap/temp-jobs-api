// REMEMBER: We set up here the FUNCTIONS that will be the controllers for our routes

const User = require('../models/User');
const { StatusCodes } = require('http-status-codes'); // for getting the status codes
const { BadRequestError, UnauthenticatedError } = require('../errors');
//const bcrypt = require('bcryptjs'); //? this is now set in the MODEL
//const jwt = require('jsonwebtoken'); //? this is now set in the MODEL

// ================================================================================

const register = async (req, res) => {
  //res.send('register user'); //* just for test

  //   const { name, email, password } = req.body;
  //   if (!name || !email || !password) {
  //     throw new BadRequestError('Please provide name, email and password');
  //   }

  //* REFACTORING
  //? We implement this on the User.js - model
  /*
  const { name, email, password } = req.body;

  const salt = await bcrypt.genSalt(10); // generate random bytes - how many - 10 default one
  const hashedPassword = await bcrypt.hash(password, salt);

  const tempUser = { name, email, password: hashedPassword };
  */

  //const user = await User.create({ ...req.body }); // refactoring with bcrypt
  //const user = await User.create({ ...tempUser }); // after we move bcript to Model User.js
  const user = await User.create({ ...req.body });

  // once we create the user -> we create the token

  //* REFACTORING
  //? This part of the code is also moved to the User Model
  /*
  const token = jwt.sign(
    {
      userId: user._id,
      name: user.name, // using method defined in User Model
    },
    'jwtSecret',
    { expiresIn: '30d' }
  );
  */

  const token = user.createJWT();

  // => when it comes to response, we definetly want to send back the token
  res.status(StatusCodes.CREATED).json({
    //user: { name: user.getName() },
    user: { name: user.name },
    token,
  });
};

// ================================================================================

const login = async (req, res) => {
  //res.send('login user'); //* just for test

  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email & password');
  }

  // check for the user
  const user = await User.findOne({ email });

  // if user does not exist -> unautenticated error
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  // compare the password using bcryptjs
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: { name: user.name },
    token,
  });
};

// ================================================================================

module.exports = {
  register,
  login,
};
