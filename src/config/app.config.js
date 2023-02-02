const dotenv = require('dotenv')
const os = require('os')
const ngrok = require('ngrok')

dotenv.config({ path: './.env' })

// get the local ip address
const localIp =
   os.networkInterfaces().Ethernet?.filter((ip) => ip.family === 'IPv4')[0]
      .address ||
   os.networkInterfaces().eth0?.filter((ip) => ip.family === 'IPv4')[0].address

const onlineHost = async () => {
   if (process.env.GO_ONLINE) {
      return await ngrok.connect({
         proto: 'http',
         addr: process.env.PORT,
         authtoken: process.env.NGROK_AUTH,
      })
   }
   return null
}

// export the config
module.exports = {
   env: process.env.NODE_ENV || 'production',
   port: process.env.PORT || 3000,
   localIp: `http://${localIp}:${process.env.PORT || 3000}`,
   localHost: `http://127.0.0.1:${process.env.PORT || 3000}`,
   onlineHost: onlineHost,
   db: process.env.DATABASE_URL,
   tokenSecret: process.env.JWT_SECRET,
   tokenExpires: process.env.JWT_EXPIRES || '10H',
   cookieExpires: process.env.COOKIE_EXPIRES || 10,
   resetPasswordExpires: process.env.RESET_PASSWORD_EXPIRES || 10,
   emailHost: process.env.EMAIL_HOST,
   emailPort: process.env.EMAIL_PORT,
   emailUser: process.env.EMAIL_USER,
   emailPass: process.env.EMAIL_PASS,
}
