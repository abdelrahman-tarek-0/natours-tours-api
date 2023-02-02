/**
 * @description - A wrapper function to catch async errors
 * @param {Function} fn - Express async function
 */
const catchAsync =
   (fn) =>
   (...args) =>
      fn(...args).catch(args[args.length - 1])

// const catchAsync = fn =>
// function asyncUtilWrap(...args) {
//   const fnReturn = fn(...args)
//   const next = args[args.length-1]
//   return Promise.resolve(fnReturn).catch(next)
// }

// const catchAsync = (fn) => (req, res, next) => {
//    fn(req, res, next).catch(next)
// }

module.exports = catchAsync
