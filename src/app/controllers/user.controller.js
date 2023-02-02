const user = require('../models/user.model')
const catchAsync = require('../utils/catchAsync')
const { ErrorBuilder } = require('../utils/ErrorBuilder')
const setCookie = require('../utils/setCookie')

exports.signUp = catchAsync(async (req, res) => {
   const { newUser, token } = await user.signUp(req.body)
   await user.sendReset(
      newUser.email?.email,
      false,
      req.protocol,
      req.get('host'),
      "Confirm Your Email Address",
      'auth/confirmEmail/checkReset'
   )
   setCookie(res, token)
   res.status(200).json({
      status: 'success',
      data: {
         user: {
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            photo: newUser.photo || null,
         },
      },
   })
})
exports.login = catchAsync(async (req, res) => {
   const { email, password } = req.body
   const { loggedUser, token } = await user.login(email, password)
   setCookie(res, token)
   res.status(200).json({
      status: 'success',
      data: {
         user: {
            _id: loggedUser._id,
            name: loggedUser.name,
            email: loggedUser.email,
            photo: loggedUser.photo || null,
         },
      },
   })
})
exports.forgetPassword = catchAsync(async (req, res) => {
   const { email } = req?.body
   await user.sendReset(
      (email||req?.user?.email?.email),
      req.query.code,
      req.protocol,
      req.get('host'),
      "Change your password"
   )
   res.status(200).json({
      status: 'success',
      message: 'email sent',
   })
})
exports.checkReset = catchAsync(async (req, res) => {
   const { email, reset } = req.body
   await user.checkReset('code',email, reset)
   res.status(200).json({
      status: 'success',
      message: 'code is valid',
   })
})
exports.resetPassword = catchAsync(async (req, res) => {
   const code = req.query.code 
   let type;
   let email;
   let reset;

   if(code === "true"){
      type = 'code'
      email = req.body.email
      reset = req.body.code
   }else{
      type = 'token'
      email = null
      reset = req.query.reset
   }

   const {  password, passwordConfirm } = req.body
   const { changedUser, verifyToken } = await user.resetPassword(
      type,
      email,
      reset,
      password,
      passwordConfirm
   )
   setCookie(res, verifyToken)
   res.status(200).json({
      status: 'success',
      data: {
         user: {
            _id: changedUser._id,
            name: changedUser.name,
            email: changedUser.email,
            photo: changedUser.photo || null,
         },
      },
   })
})
exports.confirmEmailSendReset = catchAsync(async (req, res) => {
   if(req?.user?.email?.confirmed){
      throw new ErrorBuilder('email is already confirmed',500,'UNNECESSARY_REQUEST')
   }

   await user.sendReset(
      req?.user?.email?.email,
      false,
      req.protocol,
      req.get('host'),
      "Confirm Your Email Address",
      'auth/confirmEmail/checkReset'
   )
   res.status(200).json({
      status: 'success',
      message: 'reset sent',
   })
})
exports.confirmEmailCheckReset = catchAsync(async (req, res) => {
    await user.confirmEmail(req.query.reset)

   // res.status(200).json({
   //    status: 'success',
   //    message: 'email confirmed',
   // })
   res.send(`
   <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: "Roboto", sans-serif;
      }
      .container {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(241, 241, 241, 0.5);
        padding: 3vw;
        text-align: center;
        border: 0.3vw solid black;
        border-radius: 1vw;
      }
      .header {
        margin-top: auto;
        font-size: 3vw;
        font-weight: bold;
      }
      .message {
        margin-top: -2vh;
        font-size: 2vw;
      }
    </style>
    <title></title>
  </head>
  <body>
    <div class="container">
      <h6 class="header">your email is confirmed ✔</h6>
      <div class="message">
        Please make your self at home <a href="{{MAINLINK}}">{{APPNAME}}</a> 😊
      </div>
    </div>
  </body>
</html>

   `.replaceAll('{{MAINLINK}}','http://localhost:3000/')
    .replaceAll('{{APPNAME}}',"Clean's API")
   )
})


// exports.resetPasswordToken = catchAsync(async (req, res) => {
//    const { password, passwordConfirm } = req.body
//    const { token } = req.params
//    const { changedUser, verifyToken } = await user.resetPassword(
//       'token',
//       null,
//       token,
//       password,
//       passwordConfirm
//    )
//    setCookie(res, verifyToken)
//    res.status(200).json({
//       status: 'success',
//       message: 'password changed',
//       data: {
//          user: {
//             _id: changedUser._id,
//             name: changedUser.name,
//             email: changedUser.email,
//             photo: changedUser.photo || null,
//          },
//       },
//    })
// })

exports.updatePassword = catchAsync(async (req, res) => {
   const { oldPassword, newPassword, passwordConfirm } = req.body
   const { changedUser, verifyToken } = await user.updatePassword(
      req.user._id,
      oldPassword,
      newPassword,
      passwordConfirm
   )
   setCookie(res, verifyToken)

   res.status(200).json({
      status: 'success',
      message: 'password changed',
      data: {
         user: {
            _id: changedUser._id,
            name: changedUser.name,
            email: changedUser.email,
            photo: changedUser.photo || null,
         },
      },
   })
})
exports.getAllUsers = catchAsync(async (req, res) => {
   const usersObj = await user.getAllUsers(
      req.query.fields,
      req.query.sort,
      req.query.limit,
      req.query.page,
      req.query
   )
   res.status(200).json({
      status: 'success',
      results: usersObj.users.length,
      filters: usersObj.filterAllowedQuery,
      sortBy: usersObj.sortBy,
      fields: usersObj.queriedFields,
      pagination: {
         page: usersObj.page,
         limit: usersObj.limit,
         skip: usersObj.skip,
      },
      data: {
         users: usersObj.users,
      },
   })
})
exports.getLoggedUser = catchAsync(async (req, res) => {
   res.status(200).json({
      status: 'success',
      data: {
         user: {...(req.user._doc),password:undefined,passwordChangedAt:undefined,verification:undefined,Active:undefined},
      },
   })
})
exports.updateUser = catchAsync(async (req, res) => {
   const updatedUser = await user.updateUser(req.user._id, req.body)
   res.status(200).json({
      status: 'success',
      data: {
         user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo || null,
         },
      },
   })
})
exports.deleteUser = catchAsync(async (req, res) => {
   const deletedUser = await user.deleteUser(
      req.user._id,
      req.body.password,
      req.user.password
   )
   res.status(200).json({
      message: 'success',
      data: {
         user: {
            _id: deletedUser._id,
            name: deletedUser.name,
            email: deletedUser.email,
            photo: deletedUser.photo || null,
         },
      },
   })
})



exports.getUserProfile = catchAsync(async (req, res) => {
   const profileData = await user.getUserProfile(
      req.params.id,
      req.query.fields
   )

   res.status(200).json({
      status: 'success',
      fields: profileData.queriedFields,
      data: {
         profile: profileData.profile,
      },
   })
})

