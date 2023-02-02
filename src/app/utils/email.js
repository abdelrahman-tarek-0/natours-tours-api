const nodemailer = require('nodemailer')
const config = require('../../config/app.config')

/**
 * @description Send email
 * @param {object} options - options object {email - email send to, subject - the message header, text - the message}
 * @example sendEmail({email: 'ahmed@gmail.com', subject: 'something', text: 'need somethings'})
 */
const senEmail = async (options) => {
   // 1) Create a transporter
   const transport = nodemailer.createTransport({
      host: config.emailHost,
      port: config.emailPort,
      auth: {
         user: config.emailUser,
         pass: config.emailPass,
      },
   })

   // 2) Define the email options
   const mailOptions = {
      from: 'Clean <Clean@gmail.com>',
      to: options.email,
      subject: options.subject,
      //   text: options.message,
      html: `<dev>${options.message}</dev>`,
   }
   await transport.sendMail(mailOptions)
}
module.exports = senEmail
