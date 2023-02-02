// BUG: MAKE THIS A CLASS because the trace is not working properly
/**
 * @description error builder
 * @param {string} message - Error message
 * @param {number} statusCode - response status code
 * @param {string} code - Error code
 * @returns {Error} - the error object
 * @example ErrorBuilder('Invalid email or password', 401, 'INVALID_CREDENTIALS')
 */
// const ErrorBuilder = (message, statusCode, code) => {
//    const err = new Error(message || 'Something went wrong')
//    err.code = code || null
//    err.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
//    err.statusCode = statusCode || 500
//    err.isOperational = true
//    return err
// }

// class ErrorBuilder extends Error{
//    constructor(message,statusCode,code){
//       this.error = super(message)
//       this.error.code = code || null
//       this.error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
//       this.error.statusCode = statusCode || 500
//       this.error.isOperational = true
//    } 
// }
class ErrorBuilder extends Error {
   constructor(message, statusCode,code) {
     super(message);
     this.code = code || null
     this.statusCode = statusCode || 500;
     this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
     this.isOperational = true;
 
     Error.captureStackTrace(this, this.constructor);
   }
 }
 

// const commonErrors = {
//    authErrors: {
//       notProvide: ErrorBuilder(
//          'Please provide email and password',
//          400,
//          'LOGIN_ERROR'
//       ),
//       unAuthorized: ErrorBuilder(
//          'Incorrect email or password',
//          401,
//          'LOGIN_ERROR'
//       ),
//    },
//    toursErrors: {
//       tourNotFound: (id) =>
//          ErrorBuilder(
//             `Tour with id: ${id}, not found`,
//             404,
//             'ERROR_404_NOT_FOUND'
//          ),
//    },
// }

module.exports = { ErrorBuilder }
