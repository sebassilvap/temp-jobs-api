// imports
const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NoptFounfError, NotFoundError } = require('../errors');

// ====================================================

//* PLEASE REMEMBER: we are not looking for all jobs, but the jobs associated with this user!
const getAllJobs = async (req, res) => {
  //res.send('GET ALL JOBS');

  const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt');
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

// ====================================================

const getJob = async (req, res) => {
  //res.send('GET SINGLE JOB');

  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });

  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ job });
};

// ====================================================

const createJob = async (req, res) => {
  //res.send('CREATE JOB');
  //res.json(req.user);

  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);

  //res.json(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

// ====================================================

const updateJob = async (req, res) => {
  //res.send('UPDATE JOB');

  // destructure req object, and from each element, destructure what I need!
  //* double destructuring syntax
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty');
  }

  // what am I going to update
  // what job I'm looking for
  // options to get back the updated version and run the validators

  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );

  // if no job was founf during the search
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  // If everything is OK, send back the job
  res.status(StatusCodes.OK).json({ job });
};

// ====================================================

const deleteJob = async (req, res) => {
  //res.send('DELETE JOB');

  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  // find the selected job and remove
  const job = await Job.findOneAndRemove({
    _id: jobId,
    createdBy: userId,
  });

  // if no job was found - error
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).send();
};

// ====================================================

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
