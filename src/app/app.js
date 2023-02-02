const express = require('express')
const cors = require('cors')
const compression = require('compression')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const limiter = require('./utils/limiter')
const routes = require('./routes/index.routes')
const logger = require('./middlewares/logger.middleware')
const errorMiddleware = require('./middlewares/error.middleware')
const cookieParser = require("cookie-parser");
// init express
const app = express()

// middlewares
// log req and res
app.use(logger())
// helmet for header security
app.use(helmet())
// express json parser with limit for uploads
app.use(express.json({ limit: '10kb' }))
// the requests limiter
app.use('/api', limiter(100, 60))
app.use('/*/auth/', limiter(10, 60))
app.use('/*/auth/forgetPassword', limiter(2, 10))

// mongo sanitize to prevent NoSQL injection
app.use(mongoSanitize())
// xss to prevent XSS attacks
app.use(xss())
// hpp to prevent http parameter pollution
app.use(
   hpp({
      whitelist: [
         'id',
         'name',
         'duration',
         'maxGroupSize',
         'difficulty',
         'ratingsAverage',
         'ratingsQuantity',
         'price',
      ],
   })
)
// cors to allow cross origin requests
app.use(cors())
// compression to compress the responses
app.use(compression())
// parse cookies
app.use(cookieParser());

// main page endpoint
app.get('/', (_req, res) => {
   res.status(200).json({
      status: 'success',
      message: 'hello',
   })
})


// endpoints to test the big response
app.get('/bigData', (_req, res) => {
   res.send(
      Array(10000).fill({
         data: {
            _id: '63381d3b16b1712a7f534d18',
            name: 'test the name',
            duration: 7,
            ratingsAverage: 4,
            price: 497,
            durationWeeks: 1,
         },
      })
   )
})

// main api routes
app.use('/api/v1/', routes)

// error handling
app.use(errorMiddleware)
app.use((req, res) => {
   res.status(404).json({
      status: 'fail',
      // TODO: change the message to be more descriptive (WAITING FOR THE DOCS)
      message: `you are lost the endpoint '${req.originalUrl}' does not exist`,
   })
})

module.exports = app
