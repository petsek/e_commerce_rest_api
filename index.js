const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const pool = require('./config');

const usersQ = require('./dbQueries/usersQ')

const session = require('express-session');
// const uuid = require('uuid').v4;
const pgSession = require('connect-pg-simple')(session);

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy

const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(session({
  // genid: function(request) {
  //   console.log(request.sessionID)
  //   return uuid() // use UUIDs for session IDs 
  // },
  secret: process.env.SESSION_SECRET || "session_secret",
  resave: false,
  saveUninitialized: true,
  store: new pgSession({
    pool : pool,                // Connection pool
    createTableIfMissing: true,
  }),
  cookie: {maxAge: 1000*60*60, secure: true, sameSite: 'none'}
})
);
// Middleware to initialize the passport library below:
app.use(passport.initialize());

// Middleware to implement a session with passport below:
app.use(passport.session());

//Passport local strategy

passport.use(new LocalStrategy(usersQ.authenticateUser))

// Passport serialise user
passport.serializeUser((user, done) => {
  done(null, user.user_id)
})

// Passport deserialise user
passport.deserializeUser(usersQ.deserializeUser)

app.get('/', (request, response) => {
  // request.session.authenticated = true;
  // console.log(request.session)
  // console.log(request.sessionID)
  response.json({info: 'Hello, you are in the root'})
});


app.get('/login', (request, response) => {
  response.json({info: 'Login-page'})
});

app.post('/login', passport.authenticate('local'), usersQ.login)



app.get('/users', usersQ.getUsers);
// app.get('/users/:id', db.getUserById);
// app.post('/users', db.createUser);
// app.put('/users/:id', db.updateUser);
// app.delete('/users/:id', db.deleteUser)

app.listen(port, () => {
  console.log(`App running on ${port}`)
});