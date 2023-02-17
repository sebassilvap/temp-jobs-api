//const { CustomAPIError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  //? Defining a customError with values by default
  let customError = {
    // set defaults
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  };

  //? At the beginning we had only this piece of code
  /*
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }
  */

  //? Validation Error
  if (err.name === 'ValidationError') {
    //console.log(Object.values(err.errors)); //* for checking the error object
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
    customError.statusCode = 400;
  }

  //? Handle the Duplicate Error - in Register
  //? If I try to register with an email that already exists!
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please choose another value`;
    customError.statusCode = 400;
  }

  //? Handle Cast Error
  if (err.name === 'CastError') {
    customError.msg = `No item found with id : ${err.value}`;
    customError.statusCode = 404;
  }

  //? return and res
  //return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err }); //* just for test and learn practices
  return res.status(customError.statusCode).json({ msg: customError.msg }); //* in reality
};

module.exports = errorHandlerMiddleware;
