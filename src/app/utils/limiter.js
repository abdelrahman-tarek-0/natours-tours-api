const rateLimit = require('express-rate-limit')
/**
 * @description function limiter to limit the number of requests
 * @param {number} max - the maximum number of requests
 * @param {number} time - the time in minutes
 * @returns {function}  the limiter function
 * @example limiter(100, 15)
 */
const limiter = (MAX = 100, TIME = 60) =>
   rateLimit({
      max: MAX,
      windowMs: TIME * 60 * 1000,
      message: `Too many requests, Please try again in ${TIME}m`,
   })

module.exports = limiter
