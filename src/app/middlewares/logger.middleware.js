const textColors = require('../utils/textColors')
const now = require('../utils/now')

const colorMethodMap = {
   GET: 'Green',
   POST: 'Yellow',
   DELETE: 'Red',
}

/**
 * @description function logger to log the request and response with the time it took to process the request
 * @returns  {function}  the logger function
 */
const logger = () => (req, res, next) => {
   const start = now('millie')
   res.once('finish', () => {
      const finish = now('millie')
      const took = (finish - start).toFixed(3)
      console.log(
         ` ${textColors(req.method, colorMethodMap[req.method])} ${textColors(
            req.originalUrl,
            'Cyan'
         )} ${textColors(
            res.statusCode,
            res.statusCode >= 200 && res.statusCode < 400 ? 'Green' : 'Red'
         )} from ${textColors(req.ip, 'Red')} Toke ${textColors(
            `${took} ms`,
            'Yellow'
         )} ${req.headers.origin || ''}`
      )
   })
   return next()
}

module.exports = logger
