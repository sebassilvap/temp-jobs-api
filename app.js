// ================================
//* VERSION 2 - SECUTIRY PACKAGES
// ================================

require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// ==================================================
// for the API documentation - Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
// ==================================================

const express = require('express');
const app = express();

// connect DB
const connectDB = require('./db/connect');

// middleware for authentication
const authenticateUser = require('./middleware/authentication');

// routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

//! secutiry packages
// => rateLimiter as OUR 1st MIDDLEWARE

// this line FIRST (important !! for deployment)
app.set('trust proxy', 1);

app.use(
  rateLimiter({
    windowsMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowsMs
  })
);

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());

// routes
//? Dummy Route -> just for REFERENCE
/*
app.get('/', (req, res) => {
  res.send('jobs api');
});
*/

//! route for deployment in Heroku
app.get('/', (req, res) => {
  res.send(`
  <h1>JOBS API - SebasSilvaP 1st API</h1>
  <h2>This is my first API</h2>
  <h2>Thanks for visiting the link!</h2>
  <ul>
	<li>Made with NodeJS & ExpressJs</li>
	<li>With jsonWebToken Package</li>
	<li>bcrypt, cors, helmet, etc.. for the security</li>
	<li>Using Mongo and Mongoose</li>
	<li>Swagger & Yaml for the awesome documentation!</li>
  </ul>
  <a href="/api-docs">Check the AWESOME documentation</a>
  `);
});

//! route for the documentation
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//! API ROUTES
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter); // authentication before to enter in jobsRouter

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
