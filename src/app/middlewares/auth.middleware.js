const catchAsync = require('../utils/catchAsync')
const { AsyncVerifyToken } = require('../utils/token')
const { ErrorBuilder } = require('../utils/ErrorBuilder')
const User = require('../models/schemas/user.schema')
const Tour = require('../models/schemas/tour.schema')
const review = require('../models/schemas/review.schema')

exports.loggedIn = (opts = { optional: false, skipEmailConfirm: false }) =>
   catchAsync(async (req, res, next) => {
      let token = req.cookies.jwt
      // if (
      //    req.headers.authorization &&
      //    req.headers.authorization.startsWith('Bearer ')
      // ) {
      //    token = req.headers.authorization.split(' ')[1]
      // }

      if (!token && !opts.optional)
         throw new ErrorBuilder('No token provided', 401, 'TOKEN_ERROR')

      let freshUser
      let decoded
      try {
         decoded = await AsyncVerifyToken(token)
         freshUser = await User.findById(decoded.id).select('+password')
      } catch (error) {
         if (!opts.optional) throw error
      }
      if (!opts.optional && !freshUser)
         throw new ErrorBuilder(
            'Invalid token, Please login',
            401,
            'TOKEN_ERROR'
         )

      if (!opts.skipEmailConfirm && !freshUser?.email?.confirmed)
         throw new ErrorBuilder(
            'please confirm the email to start using our api',
            401,
            'CONFIRM_EMAIL'
         )

      if (!opts.optional && freshUser.changedPasswordAfter(decoded.iat))
         throw new ErrorBuilder(
            'Password changed, Please login',
            401,
            'TOKEN_ERROR'
         )

      req.user = freshUser
      return next()
   })

exports.restrictTo =
   (...roles) =>
   (req, res, next) => {
      console.log(roles)
      if (!roles.includes(req.user.role)) {
         throw new ErrorBuilder(
            'You do not have permission to perform this action',
            403,
            'PERMISSION_ERROR'
         )
      }
      return next()
   }

const includeId = (arr, id) => {
   let found = false
   for (let i = 0; i < arr.length; i++) {
      const el = arr[i]
      if (`${el}` === `${id}`) {
         found = true
         break
      }
   }
   return found
}

exports.allowChange = (
   opts = { doc: '', identifierFrom: 'query' || 'params', identifierName: 'id' }
) =>
   catchAsync(async (req, res, next) => {
      let queryOpts = {
         _id: req[opts.identifierFrom][opts.identifierName],
      }

      if (opts.doc === 'tours') {
         const tour = await Tour.findOne(queryOpts)
 
         if (!tour)
            throw new ErrorBuilder('tour not found', 404, 'ERROR_404_NOT_FOUND')

         const found = includeId(tour.guides, req?.user?._id)

         if (!found)  throw new ErrorBuilder('unauthorized action', 401, 'UNAUTHORIZED')

         next()
         
      }
   })
