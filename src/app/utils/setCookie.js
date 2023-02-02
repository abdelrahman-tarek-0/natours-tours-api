const config = require('../../config/app.config')

/**
 * @description function to set the cookie
 * @param  {Express.Response}  res  the response object
 * @param  {string}  token  the token to set in the cookie
 * @example  setCookie(res, 'xaewe')
 */
const setCookie = (res, token) => {
   res.cookie('jwt', token, {
      expires: new Date(Date.now() + config.cookieExpires * 60 * 60 * 1000),
      httpOnly: true,
      secure: !!(config.env === 'production' || config.env === 'prod'),
   })
}

module.exports = setCookie
