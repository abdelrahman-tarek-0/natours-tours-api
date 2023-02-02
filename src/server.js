const dbConnect = require('./config/db.config')
const { port, localIp, localHost, onlineHost } = require('./config/app.config')
const textColors = require('./app/utils/textColors')

process.on('uncaughtException', err => {
   console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
   console.log(err.name, err.message);
   process.exit(1);
 });

// init the serve
const app = require('./app/app')

// connect to the server after the database is connected
let server;
dbConnect.then(async () => {
   const on = await onlineHost();
   const online = (on)?"\nthe internet on "+textColors(on, 'Blue'):'';
   const locally = "locally on "+textColors(localHost,'Blue');
   const onNetwork = "the network on "+textColors(localIp,'Blue');
   
   server = app.listen(port, () => {
      console.log(
         `server is running \n${locally}\n${onNetwork}${online}`
      )
   })
})

process.on('unhandledRejection', err => {
   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
   console.log(err.name, err.message);
   server.close(() => {
     process.exit(1);
   });
 });

// TODO: confirm email and phone num when creating new user (done)
// TODO: change the error handler from function to class and add common errors (done)
// TODO: hash the reset token and code in the DB and septate into another doc called auth. (no need)
// TODO: get the token from the httpOnly cookie not the header (done)
// TODO: refactor the code (steel in progress)
// TODO: make the tour guide can change the tour info (done)
// TODO: compose the utils dir (steel in progress)
// TODO: make response factor function (steel in progress)
// TODO: get auth code from phone (beside email)(no need)
// TODO: make user profile that have his info and all reviews and rating and tours (done)
// TODO: edit, remove and create tours ,only the user that have access can make changes (done)
// TODO: make the code or taken have a field called "usedTo" and this have value for (email,change password,...etc)

// BUG: when ever the user is deleted the review still exist and return null on user data (FIXED but not a good solution performance issue)
// BUG: you can force the query to return private fields by passing the fields query with the %2b sign in front of the field name like this /api/v1/tours?fields=%2bpassword  (the %2b sign is the url encoded version of +) (FIXED)
// BUG: when you forget the password with ether token or code the user can change the password without writing the email this bug can not be fixed because the token method require searching the user by the token and the code method require searching the user by the email and both of them are not unique and can be used by many users (not fixed IT IS A BIG DEAL)