const bcrypt = require('bcrypt')

const User = require('./schemas/user.schema')
const Review = require('./schemas/review.schema')
const Tour = require('./schemas/tour.schema')

const { AsyncSignToken } = require('../utils/token')
const { ErrorBuilder } = require('../utils/ErrorBuilder')
const sendEmail = require('../utils/email')
const APIfeatures = require('../utils/APIfeatures')
const { filterObj } = require('../utils/filterObj')

class UserModel {
   async signUp(user) {
      let newUser
      try {
         newUser = await User.create({
            name: user.name,
            email:{ email: user.email},
            password: user.password,
            passwordConfirm: user.passwordConfirm,
            photo: user.photo
         })
      } catch (error) {
         if (
            error.code === 11000 &&
            error.message
               .match(/{(.*?)}/)[1]
               .split(':')[0]
               .trim() === 'email'
         ) {
            throw new ErrorBuilder(
               'This email is in use or the user has been deleted',
               400,
               'DELETED_USED_ACC'
            )
         } else {
            throw error
         }
      }
      const token = await AsyncSignToken(newUser._id)
      return {
         newUser,
         token,
      }
   }

   async login(email, password) {
      if (!email || !password)
         throw new ErrorBuilder(
            'Please provide email and password',
            400,
            'LOGIN_ERROR'
         )

      const user = await User.findOne({ 'email.email':email }).select('+password')
      if (
         !user ||
         !user.Active ||
         !(await bcrypt.compare(password, user.password))
      )
         throw new ErrorBuilder('Incorrect email or password', 401, 'LOGIN_ERROR')

      const token = await AsyncSignToken(user._id)
      return {
         loggedUser: user,
         token,
      }
   }

   // async forgotPassword(email, code, protocol, host) {
   //    const user = await User.findOne({ 'email.email':email })
   //    console.log(code);
   //    if (!user)
   //       throw new ErrorBuilder('user not found', 404, 'ERROR_404_NOT_FOUND')

   //    let message = ''
   //    if (code === 'true') {
   //       const { reset } = user.createPasswordReset('code')
   //       message = `Your password reset code is: ${reset}`
   //    } else {
   //       const { reset } = user.createPasswordReset('token')
   //       message = `
   //       Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: 
   //             <a href="${protocol}://${host}/api/v1/auth/resetPassword/${reset}"> Reset Password </a> .<br />
   //             If you didn't forget your password, please ignore this email!`
   //    }

   //    await user.save({ validateBeforeSave: false })
   //    try {
   //       await sendEmail({
   //          email: user.email,
   //          subject: 'Your password reset token (valid for 10 min)',
   //          message,
   //       })
   //    } catch (error) {
   //       user.verification[user.verification.length - 1].status = 'error'

   //       await user.save({ validateBeforeSave: false })
   //       throw new ErrorBuilder(
   //          'There was an error sending the email. Try again later!',
   //          500,
   //          'ERROR_500'
   //       )
   //    }

   //    return true
   // }

   async sendReset(email, code, protocol, host,sendMessage = "your reset",endpoint = 'auth/resetPassword') {
      const user = await User.findOne({ 'email.email':email })

      console.log(code);
      if (!user)
         throw new ErrorBuilder('user not found', 404, 'ERROR_404_NOT_FOUND')

      let message = ''
      if (code === 'true') {
         const { reset } = user.createPasswordReset('code')
         
         message = `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="utf-8">
           <meta http-equiv="x-ua-compatible" content="ie=edge">
           <title>Email Confirmation</title>
           <meta name="viewport" content="width=device-width, initial-scale=1">
           <style type="text/css">
           body,
           table,
           td,
           a {
             -ms-text-size-adjust: 100%;
             -webkit-text-size-adjust: 100%;
           }
           table,
           td {
             mso-table-rspace: 0pt;
             mso-table-lspace: 0pt;
           }
           img {
             -ms-interpolation-mode: bicubic;
           }
           a[x-apple-data-detectors] {
             font-family: inherit !important;
             font-size: inherit !important;
             font-weight: inherit !important;
             line-height: inherit !important;
             color: inherit !important;
             text-decoration: none !important;
           }
           div[style*="margin: 16px 0;"] {
             margin: 0 !important;
           }
           body {
             width: 100% !important;
             height: 100% !important;
             padding: 0 !important;
             margin: 0 !important;
           }
           table {
             border-collapse: collapse !important;
           }
           a {
             color: #1a82e2;
           }
           img {
             height: auto;
             line-height: 100%;
             text-decoration: none;
             border: 0;
             outline: none;
           }
           </style>
         
         </head>
         <body style="background-color: #e9ecef;">
           <table border="0" cellpadding="0" cellspacing="0" width="100%">
             <tr>
               <td align="center" bgcolor="#e9ecef">
                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                   <tr>
                     <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                       <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">{{MESSAGE}}</h1>
                     </td>
                   </tr>
                 </table>
               </td>
             </tr>
             <tr>
               <td align="center" bgcolor="#e9ecef">
                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                   <tr>
                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                       <p style="margin: 0;">{{MESSAGE}} code. If you didn't create an account with <a href="{{MAINLINK}}">{{APPNAME}}</a>, you can safely ignore or delete this email.</p>
                     </td>
                   </tr>
                   <tr>
                     <td align="left" bgcolor="#ffffff">
                       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                         <tr>
                           <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                             <table border="0" cellpadding="0" cellspacing="0">
                               <tr>
                                 <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                   <span  style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; font-size:22px;letter-spacing: 10px;">{{CODE}}</span>
                                 </td>
                               </tr>
                             </table>
                           </td>
                         </tr>
                       </table>
                     </td>
                   </tr>
                   <tr>
                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                     </td>
                   </tr>
                   <tr>
                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                       <p style="margin: 0;">Cheers,<br> {{APPNAME}}</p>
                     </td>
                   </tr>
                 </table>
               </td>
             </tr>
             <tr>
               <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                 </table>
               </td>
             </tr>
           </table>
         </body>
         </html>
         `.replaceAll('{{MAINLINK}}',`${protocol}://${host}/api/`)
         .replaceAll('{{MESSAGE}}',sendMessage)
         .replaceAll('{{CODE}}',reset)
         .replaceAll('{{APPNAME}}',"Clean's API")
      } else {
         const { reset } = user.createPasswordReset('token')
         message = `
         <!DOCTYPE html>
         <html>
         <head>
           <meta charset="utf-8">
           <meta http-equiv="x-ua-compatible" content="ie=edge">
           <title>Email Confirmation</title>
           <meta name="viewport" content="width=device-width, initial-scale=1">
           <style type="text/css">
           body,
           table,
           td,
           a {
             -ms-text-size-adjust: 100%;
             -webkit-text-size-adjust: 100%;
           }
           table,
           td {
             mso-table-rspace: 0pt;
             mso-table-lspace: 0pt;
           }
           img {
             -ms-interpolation-mode: bicubic;
           }
           a[x-apple-data-detectors] {
             font-family: inherit !important;
             font-size: inherit !important;
             font-weight: inherit !important;
             line-height: inherit !important;
             color: inherit !important;
             text-decoration: none !important;
           }
           div[style*="margin: 16px 0;"] {
             margin: 0 !important;
           }
           body {
             width: 100% !important;
             height: 100% !important;
             padding: 0 !important;
             margin: 0 !important;
           }
           table {
             border-collapse: collapse !important;
           }
           a {
             color: #1a82e2;
           }
           img {
             height: auto;
             line-height: 100%;
             text-decoration: none;
             border: 0;
             outline: none;
           }
           </style>
         
         </head>
         <body style="background-color: #e9ecef;">
           <table border="0" cellpadding="0" cellspacing="0" width="100%">
             <tr>
               <td align="center" bgcolor="#e9ecef">
                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                   <tr>
                     <td align="left" bgcolor="#ffffff" style="padding: 36px 24px 0; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; border-top: 3px solid #d4dadf;">
                       <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;">{{MESSAGE}}</h1>
                     </td>
                   </tr>
                 </table>
               </td>
             </tr>
             <tr>
               <td align="center" bgcolor="#e9ecef">
                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                   <tr>
                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                       <p style="margin: 0;">Tap the button below to {{MESSAGE}}. If you didn't create an account with <a href="{{MAINLINK}}">{{APPNAME}}</a>, you can safely ignore or delete this email.</p>
                     </td>
                   </tr>
                   <tr>
                     <td align="left" bgcolor="#ffffff">
                       <table border="0" cellpadding="0" cellspacing="0" width="100%">
                         <tr>
                           <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                             <table border="0" cellpadding="0" cellspacing="0">
                               <tr>
                                 <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                   <a href="{{ENDPOINTLINK}}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">Click !!!</a>
                                 </td>
                               </tr>
                             </table>
                           </td>
                         </tr>
                       </table>
                     </td>
                   </tr>
                   <tr>
                     <td align="left" bgcolor="#ffffff" style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                       <p style="margin: 0;">Cheers,<br> {{APPNAME}}</p>
                     </td>
                   </tr>
                 </table>
               </td>
             </tr>
             <tr>
               <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                 </table>
               </td>
             </tr>
           </table>
         </body>
         </html>
         `.replaceAll('{{ENDPOINTLINK}}',`${protocol}://${host}/api/v1/${endpoint}?reset=${reset}`)
         .replaceAll('{{APPNAME}}',"Clean's API")
         .replaceAll('{{MAINLINK}}',`${protocol}://${host}/api/`)
         .replaceAll('{{MESSAGE}}',sendMessage)
      }

      await user.save({ validateBeforeSave: false })
      try {
         await sendEmail({
            email: user.email,
            subject: `${sendMessage} (valid for 10 min)`,
            message,
         })
      } catch (error) {
         user.verification[user.verification.length - 1].status = 'error'

         await user.save({ validateBeforeSave: false })
         throw new ErrorBuilder(
            'There was an error sending the email. Try again later!',
            500,
            'ERROR_500'
         )
      }

      return true
   }

   async checkReset(type,email, reset) {
      let user
      console.log(type,email,reset);
      if(type === 'code' || email){
         user = await User.findOne({ 'email.email':email }).select('+password')
      }
      if(type === 'token'){
         user = await User.findOne({
            'verification.reset': reset,
         }).select('+password')
      }

      if (!user)
         throw new ErrorBuilder('user not found', 404, 'ERROR_404_NOT_FOUND')

      const resetCode = user.verification[user.verification.length - 1]
      
      if (
         resetCode.reset !== `${reset}` ||
         resetCode.status === 'error' ||
         resetCode.status === 'not available' ||
         resetCode.expiresDate < Date.now() ||
         resetCode.resetType !== type
      ){
         user.resetVerification()
         user.save({ validateBeforeSave: true })
         throw new ErrorBuilder(
            'Code or Token is invalid or has expired',
            400,
            'CODE_ERROR'
         )

      }
        
      return user
   }
   
   async resetPassword(type,email, reset, newPassword, passwordConfirm) {
      const user = await this.checkReset(type ,email, reset)

      user.changePasswordTime()
      user.password = newPassword
      user.passwordConfirm = passwordConfirm
      user.resetVerification()
      user.confirmEmail()

      await user.save()
      const verifyToken = await AsyncSignToken(user._id)

      return { changedUser: user, verifyToken }
   }

   async updatePassword(id, oldPassword, newPassword, passwordConfirm) {
      if (oldPassword === newPassword)
         throw new ErrorBuilder(
            'New password must be different from old password',
            400,
            'ERROR_400'
         )
      const user = await User.findById(id).select('+password')

      if (!(await bcrypt.compare(oldPassword, user.password)))
         throw new ErrorBuilder('Incorrect password', 401, 'ERROR_401')

      user.changePasswordTime()
      user.password = newPassword
      user.passwordConfirm = passwordConfirm
      await user.save()
      const verifyToken = await AsyncSignToken(user._id)
      return { changedUser: user, verifyToken }
   }

   async confirmEmail(reset){

      let user = await this.checkReset('token',null,reset)

      user.confirmEmail();
      user.resetVerification();
      
      await user.save();
      return user
   }

   async getAllUsers(fields, sort, limit, page, filters) {
      filters = filterObj(filters, ['name', 'email', 'photo', 'slug', '_id'])
      const features = new APIfeatures(User.find())
         .filter(filters)
         .sort(sort)
         .fields(fields)
         .pagination(limit, page)
         .populate(
            'reviews',
            {
               path: 'reviews',
               populate: {
                  path: 'tour',
                  select: 'name',
               },
            },
            true,
            true
         )
      const users = await features.query.select(
         '-password -passwordChangedAt -verification -Active -__v '
      )
      return {
         users,
         sortBy: features.sortBy,
         queriedFields: features.queriedFields,
         page: features.page,
         limit: features.limit,
         skip: features.skip,
      }
   }

   async updateUser(id, data) {
      const user = await User.findById(id) // .select('+password')

      let dataLen = Object.keys(data).length
      data = filterObj(data, ['name', 'email', 'photo'])

      if (dataLen !== Object.keys(data).length)
         throw new ErrorBuilder('illegal data change', 403, 'UPDATE_ERROR')

      if (!user)
         throw new ErrorBuilder('User not found', 404, 'ERROR_404_NOT_FOUND')

      if (!data) throw new ErrorBuilder('No data to update', 400, 'UPDATE_ERROR')

      // dead block of code (to make sure the user send the password to change the info)
      // if (
      //    !data.password ||
      //    !(await bcrypt.compare(data.password, user.password))
      // )
      //    throw new ErrorBuilder('Incorrect password', 401, 'UPDATE_ERROR')

      Object.keys(data).forEach((key) => {
         user[key] = data[key]
      })

      await user.save()
      return user
   }

   async deleteUser(id, reqPass, userPass) {
      if (!bcrypt.compare(reqPass, userPass))
         throw new ErrorBuilder('password is wrong', 401, 'DELETE_ERROR')
      const deletedUser = await User.findByIdAndUpdate(
         id,
         { Active: false },
         { new: true, runValidators: true }
      )
      if (!deletedUser)
         throw new ErrorBuilder('can not find user', 404, 'ERROR_404_NOT_FOUND')
      return deletedUser
   }


   async getUserProfile(userId,fields) {
      fields = fields?.split(',') || []
      // id,name,email,photo,role,slug,reviews,tours
      if(fields.length===0){
         fields=['id','name','email','photo','role','slug','reviews','tours']
      }

      fields = fields.filter((field) => {
         return (
            field === 'name' ||
            field === 'email' ||
            field === 'photo' ||
            field === 'role' ||
            field === 'slug' ||
            field === 'reviews' ||
            field === 'tours'
         )
      })
      let fieldCopy =[...fields]


      let toursCheck=false;
      let reviewCheck=false;
      if (fields.includes('reviews')) {
         fields = fields.filter((field) => field !== 'reviews')
         reviewCheck=true;
      }
      if (fields.includes('tours')) {
         fields = fields.filter((field) => field !== 'tours')
         toursCheck=true;
      }


      const user = await User.findOne({_id:userId}).select(fields.join(' '));

      if(!user) throw Error("no such user",404,'ERROR_404_NOT_FOUND')

  ;
      if (reviewCheck) {
         const reviews = new APIfeatures(Review.find({ user: userId }))
            .fields('review,rating,tour,user')
            .populate('tour', '_id name images')
         const reviewsData = await reviews.query.select('-user')
         user._doc.reviews = [...reviewsData]
      }
      if (toursCheck && (user.role === 'guide' || user.role === 'lead-guide')) {

         const tours = new APIfeatures(Tour.find({ guides: userId }))
            .fields('_id,name,images,price,ratingsAverage')
         const toursData = await tours.query
    
         user._doc.tours = [...toursData]
      }
     
      
         
      return {
         profile: user,
         queriedFields: fieldCopy,
      }
   }
}

module.exports = new UserModel()
