const { env } = require('../../config/app.config')
const { ErrorBuilder } = require('../utils/ErrorBuilder')

const sendErrorDev = (err, res) => {
   const { statusCode, status, message, code, stack, isOperational } = err
   res.status(statusCode || 500).json({
      status: status || 'error',
      message: message || 'Something went wrong',
      code: code || null,
      isOperational: isOperational || false,
      stack: stack.replaceAll('\n', '\n\n').split('\n') || null,
      errorOpj: err,
   })
}

const sendErrorProd = (err, res) => {
   const { statusCode, status, message, isOperational } = err
   if (isOperational) {
      res.status(statusCode || 500).json({
         status: status || 'error',
         message: message || 'Something went wrong',
         code: null,
         stack: null,
      })
   } else {
      res.status(500).json({
         status: 'error',
         message: 'Something went wrong',
         code: null,
         stack: null,
      })
   }
}

const errorMessageHandlers = (err) => {
   if (err.name === 'CastError') {
      const message = `invalid '${err.path}': '${err.value}'`
      return new ErrorBuilder(message, 400)
   }
   if (err.name === 'MongoServerError') {
      if (err.message.split(' ')[0] === 'E11000' && err.code === 11000) {
         let field = err.message.match(/{(.*?)}/)[1]
         const value = field
            .match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
            .replaceAll('"', '')
            .trim()
         field = field.split(':')[0].trim()

         const message = `Duplicate value: '${value}' for field: '${field}' ,please use another value`
         return new ErrorBuilder(message, 400)
      }
   } else if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors)
         .map((el) => el.message)
         .join(', ')
      return new ErrorBuilder(messages, 400)
   } else if (err.name === 'JsonWebTokenError') {
      return new ErrorBuilder('Invalid token ,Please login again', 401)
   } else if (err.name === 'TokenExpiredError') {
      return new ErrorBuilder('Expired token, Please login again', 401)
   } else {
      return err
   }
}

const errorMiddleware = (err, _req, res, _next) => {
   if (env === 'dev' || env === 'development' || env === 'test') {
      sendErrorDev(err, res)
   } else if (env === 'prod' || env === 'production') {
      const error = errorMessageHandlers(err)
      sendErrorProd(error, res)
   }

   // express error handler need next to know that is error middleware
   // so you need to add it to work even if you are not gonna use it
   // eslint unused var dodger
   if (_next === 'some things') _next = 'is somethings'
}

module.exports = errorMiddleware
