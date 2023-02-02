const express = require('express')

const routes = express.Router()

const controller = require('../../controllers/user.controller')
const { loggedIn } = require('../../middlewares/auth.middleware')


routes.post('/confirmEmail/sendReset',loggedIn({skipEmailConfirm:true}),controller.confirmEmailSendReset)

routes.get('/confirmEmail/checkReset',controller.confirmEmailCheckReset)

routes.post('/signup', controller.signUp)
routes.post('/login', controller.login)
routes.post('/forgetPassword',loggedIn({optional:true,skipEmailConfirm:true}), controller.forgetPassword)
routes.patch('/resetPassword', controller.resetPassword)
routes.post('/checkReset', controller.checkReset)

module.exports = routes
