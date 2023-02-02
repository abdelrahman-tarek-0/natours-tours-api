const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const { tokenSecret, tokenExpires } = require('../../config/app.config')

const AsyncSignToken = (id) =>
   promisify(jwt.sign)({ id: id }, tokenSecret, {
      expiresIn: tokenExpires,
   })
const AsyncVerifyToken = (token) => promisify(jwt.verify)(token, tokenSecret)
module.exports = { AsyncSignToken, AsyncVerifyToken }
